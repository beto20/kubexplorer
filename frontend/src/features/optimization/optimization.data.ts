import { delay } from '@/data/mock-latency'
import { fetchResourceTuning, fetchUpdateDeployment } from '@/services/workload.service'
import { hasWailsRuntime } from '@/services/runtime'
import { model } from '../../../wailsjs/go/models'
import type { OptRecommendation, SavingsSummary, Verdict } from './types'

export const mockNamespaces = ['payments', 'ml', 'analytics', 'default', 'kube-system']

const COST_PER_CORE = 30
const COST_PER_GIB = 6

// TODO-11: Review the backend integration
export function deriveVerdict(current: { cpu: number; memory: number }, usage: { cpu: number; memory: number }, suggested: { cpu: number; memory: number }): Verdict {
	if (suggested.cpu > current.cpu || suggested.memory > current.memory) {
		return 'under'
	}
	const cpuUse = usage.cpu / (current.cpu || 1)
	const memUse = usage.memory / (current.memory || 1)
	if (cpuUse < 0.05 && memUse < 0.05) {
		return 'idle'
	}
	if (suggested.cpu < current.cpu || suggested.memory < current.memory) {
		return 'over'
	}
	return 'optimal'
}

const mockRecs: OptRecommendation[] = [
	{ id: 'checkout-api/checkout-api', namespace: 'payments', deployment: 'checkout-api', container: 'checkout-api', current: { cpu: 1000, memory: 1500 }, usage: { cpu: 1480, memory: 1460 }, suggested: { cpu: 1500, memory: 2250 }, verdict: 'under' },
	{ id: 'fraud-scoring/scorer', namespace: 'payments', deployment: 'fraud-scoring', container: 'scorer', current: { cpu: 2000, memory: 4096 }, usage: { cpu: 410, memory: 980 }, suggested: { cpu: 700, memory: 1536 }, verdict: 'over' },
	{ id: 'ledger-worker/worker', namespace: 'payments', deployment: 'ledger-worker', container: 'worker', current: { cpu: 1500, memory: 2048 }, usage: { cpu: 130, memory: 690 }, suggested: { cpu: 300, memory: 1024 }, verdict: 'over' },
	{ id: 'notify-dispatch/dispatch', namespace: 'payments', deployment: 'notify-dispatch', container: 'dispatch', current: { cpu: 500, memory: 512 }, usage: { cpu: 58, memory: 172 }, suggested: { cpu: 150, memory: 256 }, verdict: 'over' },
	{ id: 'refund-consumer/consumer', namespace: 'payments', deployment: 'refund-consumer', container: 'consumer', current: { cpu: 500, memory: 512 }, usage: { cpu: 12, memory: 34 }, suggested: { cpu: 50, memory: 128 }, verdict: 'idle' },
	{ id: 'payments-gateway/gateway', namespace: 'payments', deployment: 'payments-gateway', container: 'gateway', current: { cpu: 500, memory: 768 }, usage: { cpu: 330, memory: 498 }, suggested: { cpu: 500, memory: 768 }, verdict: 'optimal' },
]

export function toRecommendation(dto: model.TuningRecommendation): OptRecommendation {
	const current = { cpu: dto.CurrentLimit.Cpu, memory: dto.CurrentLimit.Memory }
	const usage = { cpu: dto.Usage.Cpu, memory: dto.Usage.Memory }
	const suggested = { cpu: dto.SuggestedLimit.Cpu, memory: dto.SuggestedLimit.Memory }
	return {
		id: `${dto.Deployment}/${dto.Container}`,
		namespace: dto.Namespace,
		deployment: dto.Deployment,
		container: dto.Container,
		current,
		usage,
		suggested,
		verdict: deriveVerdict(current, usage, suggested),
	}
}

// TODO-9: Consume backend.
export async function fetchRecommendations(cluster: string, namespace: string): Promise<OptRecommendation[]> {
	if (!hasWailsRuntime()) {
		await delay(350)
		return mockRecs
	}
	const dtos = await fetchResourceTuning(namespace, cluster)
	return (dtos ?? []).map(toRecommendation)
}

export function computeSummary(recs: OptRecommendation[]): SavingsSummary {
	const reclaimableCpuM = recs.reduce((s, r) => s + Math.max(0, r.current.cpu - r.suggested.cpu), 0)
	const reclaimableMemMB = recs.reduce((s, r) => s + Math.max(0, r.current.memory - r.suggested.memory), 0)
	const reclaimableCpu = Math.round((reclaimableCpuM / 1000) * 10) / 10
	const reclaimableMemory = Math.round((reclaimableMemMB / 1024) * 10) / 10
	return {
		flagged: recs.filter((r) => r.verdict !== 'optimal').length,
		over: recs.filter((r) => r.verdict === 'over').length,
		under: recs.filter((r) => r.verdict === 'under').length,
		idle: recs.filter((r) => r.verdict === 'idle').length,
		reclaimableCpu,
		reclaimableMemory,
		monthly: Math.round(reclaimableCpu * COST_PER_CORE + reclaimableMemory * COST_PER_GIB),
	}
}

// TODO-10: Consume backend.
export async function applyRecommendation(cluster: string, rec: OptRecommendation): Promise<void> {
	if (!hasWailsRuntime()) {
		await delay(150)
		return
	}
	const dto = model.DeploymentUpdate.createFrom({
		Container: { Resource: { LCpu: rec.suggested.cpu, LMemory: rec.suggested.memory } },
	})
	await fetchUpdateDeployment(rec.deployment, rec.namespace, dto, cluster)
}
