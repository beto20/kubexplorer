<script setup lang="ts">
import { computed, onMounted, ref, watch} from 'vue'
import PodTable from '../components/PodTable.vue'
import DeploymentTable from '../components/DeploymentTable.vue'
import PodDetailDrawer from '../components/PodDetailDrawer.vue'
import KxState from '@/components/shared/KxState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useActiveCluster } from '@/composables/useActiveCluster'
import { useNamespacesStore } from '@/stores/namespaces.store'
import { hasWailsRuntime } from '@/services/runtime'
import { fetchDeployments, fetchPodDetail, fetchPods, mockNamespaces, resourceTabs } from '../explorer.data'
import type { DeploymentRow, PodDetail, PodRow, ResourceTab } from '../types'

const { resolve } = useActiveCluster()
const cluster = ref('')
const { data: pods, loading, error, reload } = useAsyncData(() => fetchPods(cluster.value), [] as PodRow[])
const { data: deployments, loading: depsLoading, error: depsError, reload: reloadDeps } = useAsyncData(() => fetchDeployments(cluster.value), [] as DeploymentRow[])
const namespacesStore = useNamespacesStore()

const search = ref('')
const namespaceFilter = ref('')
const statusFilter = ref('')
const activeTab = ref<ResourceTab['key']>('pod')
const depsLoaded = ref(false)
const namespaceOptions = ref<string[]>([])

const selectedName = ref('')
const selectedPod = ref<PodDetail | null>(null)
const drawerOpen = ref(false)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const isPods = computed(() => activeTab.value === 'pod')
const statusOptions = computed(() => [...new Set((isPods.value ? pods.value.map((p) => p.status) : deployments.value.map((d) => d.status)))])
const tabCount = computed(() => (t: ResourceTab) => (t.key === 'pod' ? String(pods.value.length) : depsLoaded.value ? String(deployments.value.length) : '…'))
const showState = computed(() => (isPods.value ? loading.value || error.value : depsLoading.value || depsError.value))

function matches(row: { name: string; namespace: string; status: string }) {
    const byName = !search.value || row.name.toLowerCase().includes(search.value.toLowerCase())
    const byNs = !namespaceFilter.value || row.namespace === namespaceFilter.value
    const byStatus = !statusFilter.value || row.status === statusFilter.value
    return byName && byNs && byStatus
}

const filteredPods = computed(() => pods.value.filter(matches))
const filteredDeployments = computed(() => deployments.value.filter(matches))

function showToast(message: string) {
    toast.value = message
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

async function openDetail(row: PodRow) {
	const detail = await fetchPodDetail(cluster.value, row.name, row.namespace)
	if (!detail) {
		return
	}
	selectedName.value = row.name
	selectedPod.value = detail
	drawerOpen.value = true
}

function onTroubleshoot(row: { name: string }) {
    showToast(`Diagnosing ${row.name}…`)
}

function onEdit(row: PodRow) {
	openDetail(row)
}

function onDiagnose(pod: PodDetail) {
	showToast(`Diagnosing ${pod.name}…`)
}

function onAction(label: string, pod: PodDetail) {
	showToast(`${label} · ${pod.name}`)
}

watch(activeTab, (tab) => {
    statusFilter.value = ''
    if (tab === 'deployment' && !depsLoaded.value) {
        depsLoaded.value = true
        reloadDeps()
    }
})

onMounted(async () => {
    cluster.value = await resolve()
    reload()
    namespaceOptions.value = hasWailsRuntime() ? await namespacesStore.load(cluster.value) : mockNamespaces
})
</script>

<template>
	<div class="page-head">
        <div>
            <h1>{{ isPods ? 'Pods' : 'Deployments' }}</h1>
            <p>{{ isPods ? `${pods.length} pods` : `${deployments.length} deployments` }} · {{ namespaceOptions.length }} namespaces</p>
        </div>
		<div class="head-actions">
			<button class="btn">⭢ Export manifest</button>
			<button class="btn primary">＋ Apply YAML</button>
		</div>
	</div>

	<div class="tabs">
		<button v-for="t in resourceTabs" :key="t.key" class="tab" :class="{ on: t.key === activeTab }" @click="activeTab = t.key">
			{{ t.label }} · {{ tabCount(t) }}
		</button>
	</div>

	<div class="card">
		<div class="toolbar">
			<input v-model="search" class="tb-search" placeholder="⌕ Filter by name…" />
			<select v-model="namespaceFilter" class="select">
				<option value="">Namespace: all</option>
				<option v-for="ns in namespaceOptions" :key="ns" :value="ns">{{ ns }}</option>
			</select>
			<select v-model="statusFilter" class="select">
				<option value="">Status: all</option>
				<option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
			</select>
		</div>

        <KxState v-if="showState" :loading="isPods ? loading : depsLoading" :error="isPods ? error : depsError" @retry="isPods ? reload() : reloadDeps()" />
        <template v-else>
            <PodTable v-if="isPods" :rows="filteredPods" :selected="selectedName" @select="openDetail" @troubleshoot="onTroubleshoot" @edit="onEdit" />
            <DeploymentTable v-else :rows="filteredDeployments" @troubleshoot="onTroubleshoot" />
        </template>
	</div>

	<PodDetailDrawer :pod="selectedPod" :open="drawerOpen" @close="drawerOpen = false" @diagnose="onDiagnose" @action="onAction" />

	<Transition name="toast">
		<div v-if="toast" class="toast">{{ toast }}</div>
	</Transition>
</template>

<style scoped>
.page-head {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	margin-bottom: 16px;
}
.page-head h1 {
	margin: 0;
	font-size: 22px;
	font-weight: 700;
	letter-spacing: -0.02em;
}
.page-head p {
	margin: 4px 0 0;
	color: var(--text-dim);
	font-size: 13px;
}
.head-actions {
	margin-left: auto;
	display: flex;
	gap: 10px;
}
.btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 600;
	padding: 9px 14px;
	border-radius: var(--r-sm);
	border: 1px solid var(--border);
	background: var(--surface);
	color: var(--text);
	cursor: pointer;
	white-space: nowrap;
}
.btn:hover {
	border-color: #3a465a;
	background: var(--surface-2);
}
.btn.primary {
	background: linear-gradient(180deg, var(--brand), var(--brand-deep));
	border-color: transparent;
	color: #fff;
}

.tabs {
	display: flex;
	gap: 8px;
	margin-bottom: 16px;
}
.tab {
	font-size: 12px;
	font-weight: 600;
	padding: 6px 12px;
	border-radius: 999px;
	border: 1px solid var(--border);
	background: var(--surface);
	color: var(--text);
	cursor: pointer;
}
.tab.on {
	background: linear-gradient(180deg, var(--brand), var(--brand-deep));
	border-color: transparent;
	color: #fff;
}

.card {
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
	overflow: hidden;
}
.toolbar {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 14px;
	border-bottom: 1px solid var(--border-soft);
}
.tb-search {
	flex: 1;
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: var(--r-sm);
	padding: 7px 11px;
	font-size: 12.5px;
	color: var(--text);
	font-family: var(--sans);
}
.tb-search::placeholder {
	color: var(--text-faint);
}
.select {
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: var(--r-sm);
	padding: 7px 11px;
	font-size: 12.5px;
	color: var(--text-dim);
	font-family: var(--sans);
	cursor: pointer;
}

.toast {
	position: fixed;
	bottom: 26px;
	left: 50%;
	transform: translateX(-50%);
	background: var(--surface-3);
	border: 1px solid var(--border);
	color: var(--text);
	padding: 10px 18px;
	border-radius: 999px;
	font-size: 13px;
	box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
	z-index: 60;
}
.toast-enter-active,
.toast-leave-active {
	transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translate(-50%, 8px);
}
</style>
