import { defineStore } from 'pinia'
import { ref } from 'vue'
import { defaultPins } from '@/data/pins.data'
import type { Pin } from '@/types/pin'

const STORAGE_KEY = 'kx-pins'

export const usePinsStore = defineStore('pins', () => {
	const stored = localStorage.getItem(STORAGE_KEY)
	const pins = ref<Pin[]>(stored ? (JSON.parse(stored) as Pin[]) : defaultPins)

	function persist() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(pins.value))
	}

	function isPinned(name: string) {
		return pins.value.some((p) => p.name === name)
	}

	function add(pin: Pin) {
		if (!isPinned(pin.name)) {
			pins.value = [...pins.value, pin]
			persist()
		}
	}

	function remove(name: string) {
		pins.value = pins.value.filter((p) => p.name !== name)
		persist()
	}

	function toggle(pin: Pin) {
		if (isPinned(pin.name)) {
			remove(pin.name)
		} else {
			add(pin)
		}
	}

	return { pins, isPinned, add, remove, toggle }
})
