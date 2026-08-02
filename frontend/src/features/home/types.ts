export interface Kpi {
	label: string
	value: string
	unit?: string
	hint?: string
	hintTone?: 'up' | 'down'
	valueTone?: 'default' | 'warn' | 'err'
}

export type ActivityKind = 'deploy' | 'restore' | 'tuning' | 'scale'

export interface ActivityItem {
	id: string
	kind: ActivityKind
	lead: string
	text: string
	meta: string
	cluster: string
}

export interface OptimizationSummary {
	cpuCores: string
	memory: string
	monthly: string
	count: number
}
