export interface Evidence {
	label: string
	value: string
}

export type ActionKind = 'apply' | 'logs' | 'rollback' | 'restart' | 'inspect' | 'cordon' | 'drain' | 'scale'

export type Severity = 'critical' | 'warning' | 'info' | 'ok'

export interface DiagnosisAction {
	label: string
	description: string
	kind: ActionKind
}

export interface Diagnosis {
	reason: string
	severity: Severity
	meaning: string
	recommendation: string
	evidence: Evidence[]
	actions: DiagnosisAction[]
}
