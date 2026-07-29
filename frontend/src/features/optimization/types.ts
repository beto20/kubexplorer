export type Verdict = 'under' | 'over' | 'idle' | 'optimal'

export interface ResourceFigures {
	cpu: number // millicores
	memory: number // MB
}

export interface OptRecommendation {
	id: string
	namespace: string
	deployment: string
	container: string
	current: ResourceFigures
	usage: ResourceFigures
	suggested: ResourceFigures
	verdict: Verdict
}

export interface SavingsSummary {
	flagged: number
	over: number
	under: number
	idle: number
	reclaimableCpu: number // cores
	reclaimableMemory: number // GiB
	monthly: number // estimate
}
