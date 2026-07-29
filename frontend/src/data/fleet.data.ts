import { delay } from './mock-latency'
import { hasWailsRuntime } from '@/services/runtime'
import type { ClusterSummary, FleetTotals } from '@/types/fleet'
import type {ClusterSnapshot} from "@/data/cluster-scan.data.ts";
import {scanClusters} from "@/data/cluster-scan.data.ts";

// TODO-19: Remove mock data
const mockClusters: ClusterSummary[] = [
	{ name: 'prod-eu-west-1', source: 'arn:aws:eks:eu-west-1 · v1.29.4', reachable: true, statusLabel: 'Healthy', statusTone: 'ok', metricsAvailable: true, cpu: 63, memory: 71, nodes: 12, pods: 184, namespaces: 28 },
	{ name: 'staging-eu-west-1', source: 'arn:aws:eks:eu-west-1 · v1.29.4', reachable: true, statusLabel: 'Healthy', statusTone: 'ok', metricsAvailable: true, cpu: 22, memory: 38, nodes: 6, pods: 74, namespaces: 19 },
	{ name: 'dev-sandbox', source: 'gke_dev_europe-west1 · v1.30.1', reachable: true, statusLabel: 'Degraded', statusTone: 'err', metricsAvailable: true, cpu: 91, memory: 88, nodes: 3, pods: 41, namespaces: 11, issues: 3 },
	{ name: 'minikube', source: 'local · v1.30.0', reachable: true, statusLabel: 'Idle', statusTone: 'idle', metricsAvailable: true, cpu: 8, memory: 14, nodes: 1, pods: 9, namespaces: 5 },
]

export function toClusterSummary(snap: ClusterSnapshot): ClusterSummary {
	const { info } = snap
	const reachable = info.Status && snap.ok
	return {
		name: info.Name,
		source: info.Server ? `${info.Cluster} · ${info.Server}` : info.Cluster,
		reachable,
		statusLabel: reachable ? 'Reachable' : 'Unreachable',
		statusTone: reachable ? 'ok' : 'err',
		metricsAvailable: false,
		cpu: 0,
		memory: 0,
		nodes: snap.nodes.length,
		pods: snap.pods.length,
		namespaces: snap.namespaces.length,
	}
}

export async function fetchClusters(force = false): Promise<ClusterSummary[]> {
	if (!hasWailsRuntime()) {
		await delay()
		return mockClusters
	}
	const snapshots = await scanClusters(force)
	return snapshots.map(toClusterSummary)
}

export function deriveFleetTotals(clusters: ClusterSummary[]): FleetTotals {
	const workloads = clusters.reduce((sum, c) => sum + c.pods, 0)
	const nodes = clusters.reduce((sum, c) => sum + c.nodes, 0)
	const openIssues = clusters.reduce((sum, c) => sum + (c.issues ?? 0), 0)
	return {
		clusters: clusters.length,
		reachable: clusters.filter((c) => c.reachable).length,
		workloads,
		nodes,
		openIssues,
		issuesBreakdown: openIssues ? `${openIssues} flagged` : 'none',
	}
}

