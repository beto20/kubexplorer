import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { defaultPreferences } from '@/features/settings/settings.data'
import type { AppPreferences } from '@/features/settings/types'
import type { ClusterEnvironment } from '@/types/fleet'

const STORAGE_KEY = 'kx-settings'

export const useSettingsStore = defineStore('settings', () => {
	const prefs = ref<AppPreferences>(load())

	function load(): AppPreferences {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) {
			return structuredClone(defaultPreferences)
		}
		try {
			const parsed = JSON.parse(raw) as Partial<AppPreferences>
			return {
				...structuredClone(defaultPreferences),
				...parsed,
				clusterEnvironments: { ...defaultPreferences.clusterEnvironments, ...parsed.clusterEnvironments },
				notifications: { ...defaultPreferences.notifications, ...parsed.notifications },
				assistant: { ...defaultPreferences.assistant, ...parsed.assistant },
			}
		} catch {
			return structuredClone(defaultPreferences)
		}
	}

	function reset() {
		prefs.value = structuredClone(defaultPreferences)
	}

	function envFor(cluster: string): ClusterEnvironment {
		return prefs.value.clusterEnvironments[cluster] ?? 'none'
	}

	function setEnv(cluster: string, env: ClusterEnvironment) {
		if (env === 'none') {
			delete prefs.value.clusterEnvironments[cluster]
		} else {
			prefs.value.clusterEnvironments[cluster] = env
		}
	}

	watch(
		prefs,
		(value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
		{ deep: true },
	)

	return { prefs, reset, envFor, setEnv }
})
