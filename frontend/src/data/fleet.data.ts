import { delay } from './mock-latency'
import { hasWailsRuntime } from '@/services/runtime'
import type { ClusterSummary, FleetTotals } from '@/types/fleet'
import type {ClusterSnapshot} from "@/data/cluster-scan.data.ts";
import {scanClusters} from "@/data/cluster-scan.data.ts";

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

