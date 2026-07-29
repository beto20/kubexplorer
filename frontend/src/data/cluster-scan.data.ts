import {fetchClusters, fetchGetNamespaces, fetchGetNodes} from '@/services/general.service'
import { fetchGetDeployments, fetchGetPods } from '@/services/workload.service'
import type { model } from '../../wailsjs/go/models'

export interface ClusterSnapshot {
	info: model.ClusterInfo
	ok: boolean
	pods: model.PodDto[]
	deployments: model.DeploymentDto[]
	nodes: model.NodeDto[]
	namespaces: model.NamespaceDto[]
}

async function snapshotCluster(info: model.ClusterInfo): Promise<ClusterSnapshot> {
	if (!info.Status) {
		return { info, ok: false, pods: [], deployments: [], nodes: [], namespaces: [] }
	}
	try {
		const [pods, deployments, nodes, namespaces] = await Promise.all([
			fetchGetPods(info.Name),
			fetchGetDeployments(info.Name),
			fetchGetNodes(info.Name),
			fetchGetNamespaces(info.Name),
		])
		return { info, ok: true, pods: pods ?? [], deployments: deployments ?? [], nodes: nodes ?? [], namespaces: namespaces ?? [] }
	} catch {
		return { info, ok: false, pods: [], deployments: [], nodes: [], namespaces: [] }
	}
}

let scanPromise: Promise<ClusterSnapshot[]> | null = null

export async function scanClusters(force = false): Promise<ClusterSnapshot[]> {
	if (force || !scanPromise) {
		scanPromise = (async () => {
			const infos = (await fetchClusters()) ?? []
			return Promise.all(infos.map(snapshotCluster))
		})()
		scanPromise.catch(() => {
			scanPromise = null
		})
	}
	return scanPromise
}
