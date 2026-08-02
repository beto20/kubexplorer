import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toAppError } from '@/services/apperror'
import type { AppError } from '@/services/apperror'
import { model } from '../../wailsjs/go/models'
import {fetchClusters} from "@/services/general.service.ts";

export const useClusterStore = defineStore('cluster', () => {
	const clusters = ref<model.ClusterInfo[]>([])
	const currentCluster = ref(localStorage.getItem('kx.currentCluster') ?? '')
	const loading = ref(false)
	const error = ref<AppError | null>(null)
	const loaded = ref(false)

	async function loadClusters(force = false) {
		if (loaded.value && !force) return

		loading.value = true
		error.value = null

		try {
			clusters.value = (await fetchClusters()) ?? []
			loaded.value = true
		} catch (err) {
			error.value = toAppError(err)
			throw error.value
		} finally {
			loading.value = false
		}
	}

	function setCurrentCluster(name: string) {
		currentCluster.value = name
		if (name) {
			localStorage.setItem('kx.currentCluster', name)
		} else {
			localStorage.removeItem('kx.currentCluster')
		}
	}

	return { clusters, currentCluster, loading, error, loaded, loadClusters, setCurrentCluster }
})
