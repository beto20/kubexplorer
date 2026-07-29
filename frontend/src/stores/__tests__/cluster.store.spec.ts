import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const fetchClusters = vi.fn()
vi.mock('@/services/general.service', () => ({
	fetchClusters: (...args: unknown[]) => fetchClusters(...args),
}))

import { useClusterStore } from '../cluster.store'

describe('cluster store', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
		fetchClusters.mockReset()
		fetchClusters.mockResolvedValue([{ Name: 'minikube', Cluster: 'minikube', Status: true }])
	})

	it('loads clusters once and caches', async () => {
		const store = useClusterStore()

		await store.loadClusters()
		await store.loadClusters()

		expect(fetchClusters).toHaveBeenCalledTimes(1)
		expect(store.clusters).toHaveLength(1)
		expect(store.loaded).toBe(true)
	})

	it('force reload bypasses the cache', async () => {
		const store = useClusterStore()

		await store.loadClusters()
		await store.loadClusters(true)

		expect(fetchClusters).toHaveBeenCalledTimes(2)
	})

	it('classifies failures as AppError', async () => {
		fetchClusters.mockRejectedValueOnce('CLUSTER_UNREACHABLE: no kubeconfig')
		const store = useClusterStore()

		await expect(store.loadClusters()).rejects.toThrow('no kubeconfig')
		expect(store.error?.kind).toBe('CLUSTER_UNREACHABLE')
		expect(store.loaded).toBe(false)
	})

	it('tracks the current cluster', () => {
		const store = useClusterStore()
		store.setCurrentCluster('prod-cluster')
		expect(store.currentCluster).toBe('prod-cluster')
	})
})
