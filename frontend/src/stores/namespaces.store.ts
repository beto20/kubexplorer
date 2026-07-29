import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchGetNamespaces } from '@/services/general.service'

export const useNamespacesStore = defineStore('mockNamespaces', () => {
	const byCluster = ref<Record<string, string[]>>({})
	const loading = ref(false)

	async function load(cluster: string, force = false): Promise<string[]> {
		const cached = byCluster.value[cluster]
		if (cached && !force) {
			return cached
		}

		loading.value = true
		try {
			const dtos = await fetchGetNamespaces(cluster)
			const names = (dtos ?? []).map((n) => n.Name)
			byCluster.value = { ...byCluster.value, [cluster]: names }
			return names
		} finally {
			loading.value = false
		}
	}

	function namespacesFor(cluster: string): string[] {
		return byCluster.value[cluster] ?? []
	}

	function invalidate(cluster?: string) {
		if (cluster) {
			const next = { ...byCluster.value }
			delete next[cluster]
			byCluster.value = next
		} else {
			byCluster.value = {}
		}
	}

	return { byCluster, loading, load, namespacesFor, invalidate }
})
