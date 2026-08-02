<script setup lang="ts">
import {computed, onMounted, ref, watch, watchEffect} from 'vue'
import PodTable from '../components/PodTable.vue'
import DeploymentTable from '../components/DeploymentTable.vue'
import PodDetailDrawer from '../components/PodDetailDrawer.vue'
import KxState from '@/components/shared/KxState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useActiveCluster } from '@/composables/useActiveCluster'
import { useNamespacesStore } from '@/stores/namespaces.store'
import { hasWailsRuntime } from '@/services/runtime'
import {
    fetchDeployments, fetchIngresses, fetchNodes, fetchPersistentVolumeClaims, fetchPersistentVolumes,
    fetchPodDetail,
    fetchPods,
    fetchServices,
    mockNamespaces,
    resourceTabs
} from '../explorer.data'
import type {
    DeploymentRow,
    IngressRow,
    NodeRow,
    PodDetail,
    PodRow,
    PvcRow,
    PvRow,
    ResourceTab,
    ServiceRow
} from '../types'
import {useClusterStore} from "@/stores/cluster.store.ts";
import type {AppError} from "@/services/apperror.ts";
import ServiceTable from "@/features/explorer/components/ServiceTable.vue";
import IngressTable from "@/features/explorer/components/IngressTable.vue";
import PvTable from "@/features/explorer/components/PvTable.vue";
import PvcTable from "@/features/explorer/components/PvcTable.vue";
import NodeTable from "@/features/explorer/components/NodeTable.vue";
import {useBreadcrumbs} from "@/composables/useBreadcrumbs.ts";

const { resolve } = useActiveCluster()
const cluster = ref('')
const namespacesStore = useNamespacesStore()
const clusterStore = useClusterStore()
const { setBreadcrumbs } = useBreadcrumbs()

const { data: pods, loading, error, reload } = useAsyncData(() => fetchPods(cluster.value), [] as PodRow[])
const { data: deployments, loading: depsLoading, error: depsError, reload: reloadDeps } = useAsyncData(() => fetchDeployments(cluster.value), [] as DeploymentRow[])
const { data: services, loading: svcLoading, error: svcError, reload: reloadServices } = useAsyncData(() => fetchServices(cluster.value), [] as ServiceRow[])
const { data: ingresses, loading: ingLoading, error: ingError, reload: reloadIngresses } = useAsyncData(() => fetchIngresses(cluster.value), [] as IngressRow[])
const { data: pvs, loading: pvLoading, error: pvError, reload: reloadPvs } = useAsyncData(() => fetchPersistentVolumes(cluster.value), [] as PvRow[])
const { data: pvcs, loading: pvcLoading, error: pvcError, reload: reloadPvcs } = useAsyncData(() => fetchPersistentVolumeClaims(cluster.value), [] as PvcRow[])
const { data: nodes, loading: nodeLoading, error: nodeError, reload: reloadNodes } = useAsyncData(() => fetchNodes(cluster.value), [] as NodeRow[])

const search = ref('')
const namespaceFilter = ref('')
const statusFilter = ref('')
const activeTab = ref<ResourceTab['key']>('pod')
const loadedTabs = ref<Set<ResourceTab['key']>>(new Set(['pod']))
const namespaceOptions = ref<string[]>([])

const selectedName = ref('')
const selectedPod = ref<PodDetail | null>(null)
const drawerOpen = ref(false)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const isPods = computed(() => activeTab.value === 'pod')
const isDeployments = computed(() => activeTab.value === 'deployment')
const activeMeta = computed(() => resourceTabs.find((t) => t.key === activeTab.value))
const isNamespaced = computed(() => activeTab.value !== 'pv' && activeTab.value !== 'node')

const reloaders: Record<ResourceTab['key'], () => void> = {
    pod: reload,
    deployment: reloadDeps,
    service: reloadServices,
    ingress: reloadIngresses,
    pv: reloadPvs,
    pvc: reloadPvcs,
    node: reloadNodes,
}

const activeRows = computed(() => {
    switch (activeTab.value) {
        case 'deployment': return deployments.value
        case 'service': return services.value
        case 'ingress': return ingresses.value
        case 'pv': return pvs.value
        case 'pvc': return pvcs.value
        case 'node': return nodes.value
        default: return pods.value
    }
})
const statusOptions = computed(
    () => [...new Set(activeRows.value.map((r) => (r as { status?: string }).status).filter(Boolean))] as string[],
)

const activeLoading = computed(() => {
    switch (activeTab.value) {
        case 'deployment': return depsLoading.value
        case 'service': return svcLoading.value
        case 'ingress': return ingLoading.value
        case 'pv': return pvLoading.value
        case 'pvc': return pvcLoading.value
        case 'node': return nodeLoading.value
        default: return loading.value
    }
})
const activeError = computed<AppError | null>(() => {
    switch (activeTab.value) {
        case 'deployment': return depsError.value
        case 'service': return svcError.value
        case 'ingress': return ingError.value
        case 'pv': return pvError.value
        case 'pvc': return pvcError.value
        case 'node': return nodeError.value
        default: return error.value
    }
})
const showState = computed(() => activeLoading.value || Boolean(activeError.value))

function tabCount(t: ResourceTab) {
    if (!loadedTabs.value.has(t.key)) return '…'
    switch (t.key) {
        case 'deployment': return String(deployments.value.length)
        case 'service': return String(services.value.length)
        case 'ingress': return String(ingresses.value.length)
        case 'pv': return String(pvs.value.length)
        case 'pvc': return String(pvcs.value.length)
        case 'node': return String(nodes.value.length)
        default: return String(pods.value.length)
    }
}

function reloadActive() {
    reloaders[activeTab.value]()
}

function matches(row: { name: string; namespace?: string; status?: string }) {
    const byName = !search.value || row.name.toLowerCase().includes(search.value.toLowerCase())
    const byNs = !namespaceFilter.value || row.namespace === namespaceFilter.value
    const byStatus = !statusFilter.value || row.status === statusFilter.value
    return byName && byNs && byStatus
}

const filteredPods = computed(() => pods.value.filter(matches))
const filteredDeployments = computed(() => deployments.value.filter(matches))
const filteredServices = computed(() => services.value.filter(matches))
const filteredIngresses = computed(() => ingresses.value.filter(matches))
const filteredPvs = computed(() => pvs.value.filter(matches))
const filteredPvcs = computed(() => pvcs.value.filter(matches))
const filteredNodes = computed(() => nodes.value.filter(matches))

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
    search.value = ''
    namespaceFilter.value = ''
    statusFilter.value = ''
    if (!loadedTabs.value.has(tab)) {
        loadedTabs.value.add(tab)
        reloaders[tab]()
    }
})

watchEffect(() => {
    const clusterName = clusterStore.currentCluster || cluster.value || 'all clusters'
    setBreadcrumbs([clusterName, activeMeta.value?.label ?? ''])
})

async function loadNamespaces() {
    namespaceOptions.value = hasWailsRuntime() ? await namespacesStore.load(cluster.value) : mockNamespaces
}

watch(
    () => clusterStore.currentCluster,
    (name) => {
        if (!name || name === cluster.value) return
        cluster.value = name
        search.value = ''
        namespaceFilter.value = ''
        statusFilter.value = ''
        loadedTabs.value = new Set([activeTab.value])
        reloadActive()
        loadNamespaces()
    },
)

onMounted(async () => {
    cluster.value = await resolve()
    await reload()
    await loadNamespaces()
})
</script>

<template>
    <div class="page-head">
        <div>
            <h1>{{ activeMeta?.label ?? '' }}</h1>
            <p>{{ activeRows.length }} {{ (activeMeta?.label ?? '').toLowerCase() }}<template v-if="isNamespaced"> · {{ namespaceOptions.length }} namespaces</template></p>
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
            <select v-if="isNamespaced" v-model="namespaceFilter" class="select">
                <option value="">Namespace: all</option>
                <option v-for="ns in namespaceOptions" :key="ns" :value="ns">{{ ns }}</option>
            </select>
            <select v-if="statusOptions.length" v-model="statusFilter" class="select">
                <option value="">Status: all</option>
                <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
        </div>

        <div class="table-scroll">
            <KxState v-if="showState" :loading="activeLoading" :error="activeError" @retry="reloadActive" />
            <template v-else>
                <PodTable v-if="isPods" :rows="filteredPods" :selected="selectedName" @select="openDetail" @troubleshoot="onTroubleshoot" @edit="onEdit" />
                <DeploymentTable v-else-if="isDeployments" :rows="filteredDeployments" @troubleshoot="onTroubleshoot" />
                <ServiceTable v-else-if="activeTab === 'service'" :rows="filteredServices" />
                <IngressTable v-else-if="activeTab === 'ingress'" :rows="filteredIngresses" />
                <PvTable v-else-if="activeTab === 'pv'" :rows="filteredPvs" />
                <PvcTable v-else-if="activeTab === 'pvc'" :rows="filteredPvcs" />
                <NodeTable v-else-if="activeTab === 'node'" :rows="filteredNodes" />
            </template>
        </div>
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
.table-scroll {
    max-height: calc(100vh - 320px);
    overflow-y: auto;
    overflow-x: auto;
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
