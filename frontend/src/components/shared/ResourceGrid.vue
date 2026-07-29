<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getDescriptor } from '@/resources/registry'
import type { ResourceDetail } from '@/resources/types'
import { useResourceGrid } from '@/composables/useResourceGrid'
import { useNamespacesStore } from '@/stores/namespaces.store'
import { userMessage } from '@/services/apperror'
import type { AppError } from '@/services/apperror'
import KsSidebarDetail from '@/components/shared/SidebarDetail.vue'
import KsSidebarForm from '@/components/shared/SidebarForm.vue'
import KsGridTable from '@/components/shared/GridTable.vue'
import KsGridToolbar from '@/components/shared/GridToolbar.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const snackbar = ref(false)
const text = ref('')
const timeout = ref(2000)

const props = defineProps<{
	cluster: string
	k8sObject: string
	namespace: string
	hasNamespace?: boolean
}>()

const descriptor = getDescriptor(props.k8sObject)
const { headers, rows, loading, error: loadError, fetchData } = useResourceGrid(descriptor, props.cluster)

const namespacesStore = useNamespacesStore()
const namespaces = computed(() => namespacesStore.namespacesFor(props.cluster))

const search = ref('')
const filterNamespace = ref('')
const filterStatus = ref('')
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>([{ key: 'name', order: 'asc' }])

// TODO: REVIEW - Status filter options come from the data instead of a hardcoded list
const statuses = computed(() => [...new Set(rows.value.map((i) => i.status).filter((s): s is string => !!s))])

const filteredItems = computed(() =>
	rows.value.filter((item) => {
		const namespaceMatch = !filterNamespace.value || (item.namespace ?? '').includes(filterNamespace.value)
		const statusMatch = !filterStatus.value || (item.status ?? '').includes(filterStatus.value)
		const searchMatch = !search.value || item.name.toLowerCase().includes(search.value.toLowerCase())
		return namespaceMatch && statusMatch && searchMatch
	}),
)

// Sidebar logic
const isSidebarVisible = ref(false)
const isSidebarFormVisible = ref(false)
const selectedRow = ref<ResourceDetail | undefined>(undefined)
const updateItem = ref<ResourceDetail | undefined>(undefined)

const onDetailItem = (item: ResourceDetail | undefined) => {
	selectedRow.value = item

	if (isSidebarVisible.value) {
		isSidebarVisible.value = false
		setTimeout(() => {
			isSidebarVisible.value = true
		}, 100)
	} else {
		isSidebarVisible.value = true
	}
}

const onActionError = (error: AppError) => {
	text.value = `${userMessage(error)} (${error.message})`
	snackbar.value = true
}

const onEditItem = async (item: ResourceDetail | undefined, isOpen: boolean) => {
	isSidebarFormVisible.value = isOpen
	updateItem.value = item

	text.value = `Resource "${item?.name}" was edited.`
	snackbar.value = true

	await fetchData()
}

const onDeleteItem = async (item: { name: string }) => {
	text.value = `Resource "${item.name}" was deleted.`
	snackbar.value = true

	await fetchData()
}

onMounted(async () => {
	// The namespace filter failing should not block the grid itself.
	namespacesStore.load(props.cluster).catch(() => {})

	await fetchData()
})
</script>

<template>
	<v-container>
		<v-card>
			<KsGridToolbar
				v-model:search="search"
				v-model:filterNamespace="filterNamespace"
				v-model:filterStatus="filterStatus"
				:namespaces="namespaces"
				:statuses="statuses"
				:namespaceFilterEnable="props.hasNamespace ?? false"
			/>
		</v-card>
		<ErrorBanner v-if="loadError" :error="loadError" @retry="fetchData" />
		<v-card v-else-if="descriptor">
			<KsGridTable
				:cluster="props.cluster"
				:descriptor="descriptor"
				:headers="headers"
				:items="filteredItems"
				:search="search"
				:sortBy="sortBy"
				:loading="loading"
				@delete="onDeleteItem"
				@edit="onEditItem"
				@detail="onDetailItem"
				@error="onActionError"
			/>
		</v-card>
		<v-snackbar v-model="snackbar" :timeout="timeout">
			{{ text }}
			<template v-slot:actions>
				<v-btn color="blue" variant="text" @click="snackbar = false">Close</v-btn>
			</template>
		</v-snackbar>
		<v-card>
			<KsSidebarDetail :isVisible="isSidebarVisible" :item="selectedRow" @close="isSidebarVisible = false" />
			<KsSidebarForm
				v-if="descriptor"
				:isVisible="isSidebarFormVisible"
				:item="updateItem"
				:cluster="props.cluster"
				:descriptor="descriptor"
				@close="isSidebarFormVisible = false"
			/>
		</v-card>
	</v-container>
</template>
