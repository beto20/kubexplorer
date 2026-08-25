import { delay } from '@/data/mock-latency'
import { fetchGetMonitoring } from '@/services/monitoring.service'
import { hasWailsRuntime } from '@/services/runtime'
import type { ChipTone } from '@/types/status'
import type { model } from '../../../wailsjs/go/models'
import type { EventItem, EventKind, MetricKpi, MonitoringData, NodeRow } from './types'

export const ranges = ['Last 1h', 'Last 6h', 'Last 24h']

function barTone(pct: number): 'ok' | 'warn' | 'err' {
	if (pct >= 90) return 'err'
	if (pct >= 75) return 'warn'
	return 'ok'
}

function hintTone(hint: string): 'up' | 'down' | undefined {
	if (!hint) return undefined
	if (hint === 'all healthy') return 'up'
	if (/pending|failed/i.test(hint)) return 'down'
	return undefined
}

function toKpi(dto: model.MetricKpiDto): MetricKpi {
	const hasBar = dto.Pct >= 0
	return {
		label: dto.Label,
		value: dto.Value,
		unit: dto.Unit || undefined,
		bar: hasBar ? dto.Pct : undefined,
		barTone: hasBar ? barTone(dto.Pct) : undefined,
		hint: dto.Hint || undefined,
		hintTone: hasBar ? undefined : hintTone(dto.Hint),
	}
}

function nodeStatusTone(status: string): ChipTone {
	switch (status) {
		case 'Ready':
			return 'ok'
		case 'Pressure':
			return 'warn'
		case 'NotReady':
			return 'err'
		default:
			return 'idle'
	}
}

function toNodeRow(dto: model.NodeUsageDto): NodeRow {
	return {
		name: dto.Name,
		cpu: dto.CPUPct >= 0 ? dto.CPUPct : null,
		memory: dto.MemPct >= 0 ? dto.MemPct : null,
		pods: dto.Pods,
		status: dto.Status,
		statusTone: nodeStatusTone(dto.Status),
	}
}

const EVENT_KINDS: EventKind[] = ['ok', 'warn', 'err', 'info']

function toEvent(dto: model.ClusterEventDto, i: number): EventItem {
	const kind = (EVENT_KINDS as string[]).includes(dto.Kind) ? (dto.Kind as EventKind) : 'info'
	return {
		id: `ev-${i}-${dto.Title}`,
		kind,
		title: dto.Title,
		detail: dto.Detail,
		meta: dto.Age,
	}
}

export function toMonitoringData(dto: model.MonitoringSnapshotDto): MonitoringData {
	return {
		kpis: (dto.KPIs ?? []).map(toKpi),
		cpuTrend: (dto.Trend ?? []).map((t) => t.CPU),
		memTrend: (dto.Trend ?? []).map((t) => t.Mem),
		podPhase: {
			running: dto.PodPhase?.Running ?? 0,
			pending: dto.PodPhase?.Pending ?? 0,
			failed: dto.PodPhase?.Failed ?? 0,
		},
		nodes: (dto.NodeUsage ?? []).map(toNodeRow),
		events: (dto.Events ?? []).map(toEvent),
		metricsAvailable: dto.MetricsAvailable,
	}
}


export async function fetchMonitoring(cluster: string, range: string): Promise<MonitoringData> {
	if (!hasWailsRuntime()) {
		await delay(300)
	}

	const dto = await fetchGetMonitoring(cluster, range)
	return toMonitoringData(dto)
}
