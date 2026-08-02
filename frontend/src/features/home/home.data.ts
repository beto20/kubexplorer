import { delay } from '@/data/mock-latency'
import { issuesBreakdown } from '@/data/issues.data'
import { fetchGetNamespaces } from '@/services/general.service'
import { fetchResourceTuning } from '@/services/workload.service'
import { hasWailsRuntime } from '@/services/runtime'
import { computeSummary, toRecommendation } from '@/features/optimization/optimization.data'
import type { ActivityItem, Kpi, OptimizationSummary } from './types'
import type {ClusterSummary, FleetTotals} from '@/types/fleet'
import type { Issue } from '@/types/issue'


// TODO-5: TBD if this will continue. Presents fleet totals as the Home KPI tiles.
export function homeKpis(totals: FleetTotals, issues: Issue[]): Kpi[] {
	const unreachable = totals.clusters - totals.reachable
	return [
		{
			label: '◧ Clusters',
			value: String(totals.clusters),
			unit: `/ ${totals.reachable} up`,
			hint: unreachable ? `${unreachable} unreachable` : 'all reachable',
			hintTone: unreachable ? 'down' : 'up',
		},
		{ label: '▤ Workloads', value: String(totals.workloads), unit: 'pods' },
		{ label: '▦ Nodes', value: String(totals.nodes) },
		{
			label: '🩺 Open issues',
			value: String(issues.length),
			valueTone: issues.length ? 'warn' : 'default',
			hint: issuesBreakdown(issues),
			hintTone: issues.length ? 'down' : undefined,
		},
	]
}

export function clusterKpis(summary: ClusterSummary, issues: Issue[]): Kpi[] {
	return [
		{ label: '▦ Nodes', value: String(summary.nodes) },
		{ label: '▤ Workloads', value: String(summary.pods), unit: 'pods' },
		{ label: '◫ Namespaces', value: String(summary.namespaces) },
		{
			label: '🩺 Open issues',
			value: String(issues.length),
			valueTone: issues.length ? 'warn' : 'default',
			hint: issuesBreakdown(issues),
			hintTone: issues.length ? 'down' : undefined,
		},
	]
}

// TODO-6: Consume backend.
export async function fetchActivity(): Promise<ActivityItem[]> {
	await delay()
	return [
		{ id: 'e1', kind: 'deploy', lead: 'Deployed', text: 'checkout-api:1.18.2 to prod-eu-west-1', meta: 'payments · 3h ago · by you', cluster: 'prod-eu-west-1' },
		{ id: 'e2', kind: 'restore', lead: 'Restored', text: 'daily-full snapshot into staging-eu-west-1', meta: '264 resources · 2h ago · by you', cluster: 'minikube' },
		{ id: 'e3', kind: 'tuning', lead: 'Applied tuning', text: 'to ledger-worker — limit 2Gi → 1Gi', meta: 'optimization · 1h ago · by you', cluster: 'minikube' },
		{ id: 'e4', kind: 'scale', lead: 'Scaled', text: 'fraud-scoring 2 → 4 replicas', meta: 'payments · 22m ago · autoscaler', cluster: 'minikube' },
	]
}

const tuningCache = new Map<string, Promise<OptimizationSummary>>()

async function aggregateTuning(cluster: string): Promise<OptimizationSummary> {
	const namespaces = ((await fetchGetNamespaces(cluster)) ?? []).map((n) => n.Name)
	const results = await Promise.allSettled(namespaces.map((ns) => fetchResourceTuning(ns, cluster)))
	const fulfilled = results.filter((r) => r.status === 'fulfilled')

	if (namespaces.length && !fulfilled.length) {
		return { cpuCores: '—', memory: '—', monthly: 'Requires metrics-server on the cluster.', count: 0 }
	}
	const recs = fulfilled.flatMap((r) => (r.value ?? []).map(toRecommendation))
	const summary = computeSummary(recs)
	return {
		cpuCores: String(summary.reclaimableCpu),
		memory: String(summary.reclaimableMemory),
		monthly: `≈ $${summary.monthly} / month in ${cluster}.`,
		count: summary.flagged,
	}
}

// TODO-7: Consume backend.
export async function fetchOptimization(cluster: string): Promise<OptimizationSummary> {
	if (!hasWailsRuntime()) {
		await delay()
	}
	let cached = tuningCache.get(cluster)
	if (!cached) {
		cached = aggregateTuning(cluster)
		cached.catch(() => tuningCache.delete(cluster))
		tuningCache.set(cluster, cached)
	}
	return cached
}
