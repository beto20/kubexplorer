<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ResourceDetail } from '@/resources/types'

const props = defineProps<{
	isVisible: boolean
	item?: ResourceDetail
}>()

const form = ref<Record<string, string>>({})

const emit = defineEmits<{
	(e: 'close'): void
}>()

// TODO: REVIEW - v-navigation-drawer writes its model; never mutate the prop directly.
const visible = computed({
	get: () => props.isVisible,
	set: (open: boolean) => {
		if (!open) emit('close')
	},
})

const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, string> => {
	const flat: Record<string, string> = {}
	for (const key in obj) {
		const value = obj[key]
		const newKey = prefix ? `${prefix}.${key}` : key
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			Object.assign(flat, flattenObject(value as Record<string, unknown>, newKey))
		} else {
			flat[newKey] = String(value ?? '')
		}
	}
	return flat
}

watch(
	() => props.item,
	(newItem) => {
		form.value = newItem ? flattenObject(newItem as unknown as Record<string, unknown>) : {}
	},
	{ immediate: true },
)
</script>

<template>
	<v-layout>
		<v-navigation-drawer v-model="visible" location="right" :width="750" temporary class="custom-sidebar">
			<v-card flat>
				<template v-slot:prepend>
					<v-btn icon="mdi-chevron-left" variant="text" @click="emit('close')"></v-btn>
					<v-card-title style="color: black">Object Details</v-card-title>
				</template>
				<v-divider></v-divider>
				<v-text-field
					disabled
					v-for="(value, key) in form"
					:key="key"
					v-model="form[key]"
					:label="key"
					:rules="[(v) => !!v || 'Required']"
					hide-details="auto"
					density="compact"
				></v-text-field>
			</v-card>
		</v-navigation-drawer>
	</v-layout>
</template>

<style scoped>
.custom-sidebar {
	position: fixed;
	top: 0;
	right: 0;
	height: 100%;
	z-index: 1100;
}
</style>
