import { useRoute } from 'vue-router'
import { useClusterStore } from '@/stores/cluster.store'
import { hasWailsRuntime } from '@/services/runtime'

export function useActiveCluster() {
	const store = useClusterStore()
	const route = useRoute()

	async function resolve(): Promise<string> {
		if (store.currentCluster) {
			return store.currentCluster
		}

		if (hasWailsRuntime()) {
			try {
				await store.loadClusters()
				const first = store.clusters.find((c) => c.Status)?.Name ?? store.clusters[0]?.Name
				if (first) {
					store.setCurrentCluster(first)
					return first
				}
			} catch {
				// TODO REVIEW - fall through to the route label
			}
		}

		const fallback = route.meta.cluster ?? 'minikube'
		store.setCurrentCluster(fallback)
		return fallback
	}

	return { resolve }
}
