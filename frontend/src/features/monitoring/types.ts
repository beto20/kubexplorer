import type { ChipTone } from '@/types/status'

export interface MetricKpi {
	label: string
	value: string
	unit?: string
	bar?: number
	barTone?: 'ok' | 'warn' | 'err'
	hint?: string
	hintTone?: 'up' | 'down'
}

export interface PodPhase {
	running: number
	pending: number
	failed: number
}

export interface NodeRow {
	name: string
	cpu: number | null
	memory: number | null
	pods: number
	status: string
	statusTone: ChipTone
}

export type EventKind = 'ok' | 'warn' | 'err' | 'info'

export interface EventItem {
	id: string
	kind: EventKind
	title: string
	detail: string
	meta: string
}

export interface MonitoringData {
	kpis: MetricKpi[]
	cpuTrend: number[]
	memTrend: number[]
	podPhase: PodPhase
	nodes: NodeRow[]
	events: EventItem[]
	metricsAvailable: boolean
}
