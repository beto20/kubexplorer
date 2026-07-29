import { delay } from '@/data/mock-latency'
import { fetchGetNodes } from '@/services/general.service'
import { fetchGetPods } from '@/services/workload.service'
import { hasWailsRuntime } from '@/services/runtime'
import type { model } from '../../../wailsjs/go/models'
import type { MetricKpi, MonitoringData, NodeRow, PodPhase } from './types'
export const ranges = ['Last 1h', 'Last 6h', 'Last 24h']

export function buildPodPhase(pods: model.PodDto[]): PodPhase {
	return {
		running: pods.filter((p) => p.Status === 'Running').length,
		pending: pods.filter((p) => p.Status === 'Pending').length,
		failed: pods.filter((p) => p.Status === 'Failed' || p.Status === 'Unknown').length,
	}
}

export function buildNodeRows(nodes: model.NodeDto[], pods: model.PodDto[]): NodeRow[] {
	const podsPerNode = new Map<string, number>()
	for (const pod of pods) {
		podsPerNode.set(pod.Node, (podsPerNode.get(pod.Node) ?? 0) + 1)
	}
	return nodes.map((n) => ({
		name: n.Name,
		cpu: null,
		memory: null,
		pods: podsPerNode.get(n.Name) ?? 0,
		status: '—',
		statusTone: 'idle',
	}))
}

export function buildKpis(phase: PodPhase, totalPods: number): MetricKpi[] {
	const unavailable = { hint: 'metrics unavailable' } as const
	return [
		{ label: 'CPU utilisation', value: '—', ...unavailable },
		{ label: 'Memory utilisation', value: '—', ...unavailable },
		{
			label: 'Pods running',
			value: String(phase.running),
			unit: `/ ${totalPods}`,
			hint: phase.pending || phase.failed ? `${phase.pending} pending · ${phase.failed} failed` : 'all healthy',
			hintTone: phase.pending || phase.failed ? 'down' : 'up',
		},
		{ label: 'Network I/O', value: '—', ...unavailable },
	]
}


const mockData: MonitoringData = {
	kpis: [
		{ label: 'CPU utilisation', value: '63', unit: '%', bar: 63, barTone: 'ok' },
		{ label: 'Memory utilisation', value: '71', unit: '%', bar: 71, barTone: 'warn' },
		{ label: 'Pods running', value: '181', unit: '/ 184', hint: '2 pending · 1 failed', hintTone: 'down' },
		{ label: 'Network I/O', value: '1.2', unit: 'Gb/s', hint: '▲ 8% vs. 1h ago', hintTone: 'up' },
	],
	cpuTrend: [40, 52, 48, 61, 58, 70, 64, 78, 72, 66, 81, 63, 74, 69, 63],
	podPhase: { running: 181, pending: 2, failed: 1 },
	nodes: [
		{ name: 'ip-10-2-31-7', cpu: 58, memory: 74, pods: 22, status: 'Ready', statusTone: 'ok' },
		{ name: 'ip-10-2-44-2', cpu: 92, memory: 89, pods: 31, status: 'Pressure', statusTone: 'warn' },
		{ name: 'ip-10-2-19-9', cpu: 41, memory: 52, pods: 18, status: 'Ready', statusTone: 'ok' },
		{ name: 'ip-10-2-58-4', cpu: 0, memory: 0, pods: 0, status: 'NotReady', statusTone: 'err' },
	],
	events: [
		{ id: 'v1', kind: 'err', title: 'OOMKilled', detail: 'checkout-api-9wzlm · payments', meta: '2m ago' },
		{ id: 'v2', kind: 'warn', title: 'NodeNotReady', detail: 'ip-10-2-58-4 · kube-system', meta: '6m ago' },
		{ id: 'v3', kind: 'info', title: 'Scheduled', detail: 'settlement-cron-28 · payments', meta: '14m ago' },
		{ id: 'v4', kind: 'ok', title: 'ScalingReplicaSet', detail: 'fraud-scoring +2 · payments', meta: '22m ago' },
	],
}

// TODO-8: Consume backend.
export async function fetchMonitoring(cluster: string, range: string): Promise<MonitoringData> {
	if (!hasWailsRuntime()) {
		await delay(300)
		return mockData
	}
	const [nodes, pods] = await Promise.all([fetchGetNodes(cluster), fetchGetPods(cluster)])
	const phase = buildPodPhase(pods ?? [])
	return {
		kpis: buildKpis(phase, (pods ?? []).length),
		cpuTrend: [],
		podPhase: phase,
		nodes: buildNodeRows(nodes ?? [], pods ?? []),
		events: [],
	}
}
