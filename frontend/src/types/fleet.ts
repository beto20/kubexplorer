import type { ChipTone } from './status'

export type ClusterEnvironment = 'prod' | 'staging' | 'dev' | 'none'

export interface ClusterSummary {
	name: string
	source: string
	reachable: boolean
	statusLabel: string
	statusTone: ChipTone
	metricsAvailable: boolean
	cpu: number
	memory: number
	nodes: number
	pods: number
	namespaces: number
	issues?: number
}

export interface FleetTotals {
	clusters: number
	reachable: number
	workloads: number
	nodes: number
	openIssues: number
	issuesBreakdown: string
}
