import { defineStore } from 'pinia'
import { ref } from 'vue'
import { deriveFleetTotals, fetchClusters } from '@/data/fleet.data'
import { toAppError } from '@/services/apperror'
import type { AppError } from '@/services/apperror'
import type { ClusterSummary, FleetTotals } from '@/types/fleet'

export const useFleetStore = defineStore('fleet', () => {
	const totals = ref<FleetTotals | null>(null)
	const clusters = ref<ClusterSummary[]>([])
	const loading = ref(false)
	const error = ref<AppError | null>(null)
	const loaded = ref(false)

	async function load(force = false) {
		if (loaded.value && !force) {
			return
		}
		loading.value = true
		error.value = null
		try {
			const list = await fetchClusters(force)
			clusters.value = list
			totals.value = deriveFleetTotals(list)
			loaded.value = true
		} catch (err) {
			error.value = toAppError(err)
		} finally {
			loading.value = false
		}
	}

	return { totals, clusters, loading, error, loaded, load }
})
