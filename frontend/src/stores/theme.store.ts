import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'kx-theme'

export const useThemeStore = defineStore('theme', () => {
	const stored = localStorage.getItem(STORAGE_KEY)
	const theme = ref<Theme>(stored === 'light' ? 'light' : 'dark')

	function applyToRoot(next: Theme) {
		document.documentElement.classList.toggle('theme-light', next === 'light')
	}
	applyToRoot(theme.value)

	function set(next: Theme) {
		theme.value = next
		localStorage.setItem(STORAGE_KEY, next)
		applyToRoot(next)
	}

	function toggle() {
		set(theme.value === 'dark' ? 'light' : 'dark')
	}

	return { theme, set, toggle }
})
