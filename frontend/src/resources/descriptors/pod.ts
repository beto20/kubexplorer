import { fetchAutoTroubleshoot, fetchGetPod, fetchGetPods, fetchRestartPod, fetchUpdatePod } from '@/services/workload.service'
import { defineResource } from '../types'
import type { ResourceRef } from '../types'
import type { PodRow, PodDetail } from '@/types/workload.type'
import { model } from '../../../wailsjs/go/models'

export function podToRow(p: model.PodDto): PodRow {
	const c = p.Containers?.[0]
	return {
		name: p.Name,
		namespace: p.Namespace,
		cpu: `${c?.Limit.Cpu ?? 0}/${c?.Request.Cpu ?? 0}`,
		memory: `${c?.Limit.Memory ?? 0}/${c?.Request.Memory ?? 0}`,
		storage: `${c?.Limit.Storage ?? 0}/${c?.Request.Storage ?? 0}`,
		node: p.Node,
		age: p.Age,
		status: p.Status,
	}
}

export async function podToDetail(ref: ResourceRef): Promise<PodDetail> {
	const p = await fetchGetPod(ref.name, ref.namespace, ref.cluster)
	const c = p.Containers?.[0]

	return {
		name: p.Name,
		namespace: p.Namespace,
		image: c?.Image,
		pullPolicy: c?.PullPolicy,
		port: c?.Port,
		cpu: `${c?.Limit.Cpu ?? 0}/${c?.Request.Cpu ?? 0}`,
		memory: `${c?.Limit.Memory ?? 0}/${c?.Request.Memory ?? 0}`,
		storage: `${c?.Limit.Storage ?? 0}/${c?.Request.Storage ?? 0}`,
		age: p.Age,
		status: p.Status,
		editable: p.Editable,
	}
}

export const podDescriptor = defineResource({
	kind: 'pod',
	namespaced: true,
	fetchList: fetchGetPods,
	toRow: podToRow,
	fetchDetail: podToDetail,
	remove: (ref) => fetchRestartPod(ref.name, ref.namespace, ref.cluster),
	update: (ref, patch) => fetchUpdatePod(ref.name, ref.namespace, patch as model.PodUpdate, ref.cluster),
	troubleshoot: (ref) => fetchAutoTroubleshoot(ref.name, ref.namespace, ref.cluster, 'POD'),
})
