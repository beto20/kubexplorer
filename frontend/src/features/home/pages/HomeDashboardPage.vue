<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import { storeToRefs } from 'pinia'
import StatTile from '@/components/shared/StatTile.vue'
import KxState from '@/components/shared/KxState.vue'
import AttentionList from '../components/AttentionList.vue'
import ActivityTimeline from '../components/ActivityTimeline.vue'
import PinnedList from '../components/PinnedList.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useActiveCluster } from '@/composables/useActiveCluster'
import { useFleetStore } from '@/stores/fleet.store'
import { useIssuesStore } from '@/stores/issues.store'
import { usePinsStore } from '@/stores/pins.store'
import {clusterKpis, fetchActivity, fetchOptimization, homeKpis} from '../home.data'
import type { ActivityItem, OptimizationSummary } from '../types'
import type { Issue } from '@/types/issue'
import type { Pin } from '@/types/pin'
import {useClusterStore} from "@/stores/cluster.store.ts";
import router from "@/app/router.ts";
import {useOverlayStore} from "@/stores/overlay.store.ts";

const fleetStore = useFleetStore()
const issuesStore = useIssuesStore()
const pinsStore = usePinsStore()
const { resolve } = useActiveCluster()
const cluster = ref('')
const { totals } = storeToRefs(fleetStore)
const { items: issues, loading: issuesLoading } = storeToRefs(issuesStore)
const { pins } = storeToRefs(pinsStore)
const clusterStore = useClusterStore()
const overlay = useOverlayStore()

const clustersConnected = computed(() => totals.value?.reachable ?? 0)
const clustersTotal = computed(() => totals.value?.clusters ?? 0)
const localeDate: string = new Date().toLocaleDateString();

const currentCluster = computed(() => clusterStore.currentCluster)
const currentSummary = computed(() => fleetStore.clusters.find((c) => c.name === currentCluster.value))
const isClusterView = computed(() => !!currentSummary.value)

const displayIssues = computed(() =>
    isClusterView.value ? issues.value.filter((i) => i.cluster === currentCluster.value) : issues.value,
)

const displayActivity = computed(() =>
    isClusterView.value ? activity.value.filter((a) => a.cluster === currentCluster.value) : activity.value,
)

const kpis = computed(() => {
    if (isClusterView.value && currentSummary.value) {
        return clusterKpis(currentSummary.value, displayIssues.value)
    }
    return totals.value ? homeKpis(totals.value, issues.value) : []
})

const { data: activity, loading: activityLoading, reload: reloadActivity } = useAsyncData(fetchActivity, [] as ActivityItem[])
const { data: optimization, reload: reloadOptimization } = useAsyncData(() => fetchOptimization(cluster.value), {
    cpuCores: '—',
    memory: '—',
    monthly: '',
    count: 0,
} as OptimizationSummary)

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

function showToast(message: string) {
	toast.value = message
	clearTimeout(toastTimer)
	toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

function onAttention(item: Issue) {
	showToast(item.action === 'Diagnose' ? `Diagnosing ${item.name}…` : `Inspecting ${item.name}…`)
}

function onPinned(item: Pin) {
	showToast(`Opening ${item.name}…`)
}

watch(
    () => clusterStore.currentCluster,
    (name) => {
        if (!name || name === cluster.value) return
        cluster.value = name
        reloadOptimization()
        reloadActivity()
    },
)

onMounted(async () => {
    await fleetStore.load()
    await issuesStore.load()
    await reloadActivity()
    cluster.value = await resolve()
    await reloadOptimization()
})
</script>

<template>
	<div class="page-head">
		<div>
			<h1>Welcome back</h1>
			<p>{{ localeDate }} · {{ clustersConnected }} of {{ clustersTotal }} clusters connected </p>
		</div>
		<div class="head-actions">
			<button class="btn"  @click="overlay.openPalette()"><span class="kbd-inline">⌘K</span> Command</button>
			<button class="btn primary" @click="router.push({ name: 'backup' })" >⭢ New backup</button>
		</div>
	</div>

	<div v-if="kpis.length" class="kpis">
		<StatTile v-for="k in kpis" :key="k.label" v-bind="k" />
	</div>
	<KxState v-else loading />

	<div class="cols">
		<div class="col">
			<div class="card">
				<div class="card-head">
					<span>🩺 Needs attention</span>
					<a class="link" @click="router.push({ name: 'troubleshoot' })">Open Troubleshoot →</a>
				</div>
				<KxState v-if="issuesLoading" loading />
                <AttentionList v-else :items="displayIssues" @action="onAttention" />
			</div>

			<div class="card pad">
				<div class="card-title">Recent activity</div>
				<KxState v-if="activityLoading" loading />
                <ActivityTimeline v-else :items="displayActivity" />
			</div>
		</div>

		<div class="col">
			<div class="card pad">
				<div class="card-head bare">
					<span>★ Pinned</span>
					<span class="count">{{ pins.length }}</span>
				</div>
				<PinnedList :items="pins" @open="onPinned" />
			</div>

			<div class="card pad opt">
				<div class="card-title">✦ Optimization</div>
				<div class="opt-figs">
					<div>
						<div class="opt-lbl">Reclaimable CPU</div>
						<div class="opt-val">{{ optimization.cpuCores }} <span class="opt-unit">cores</span></div>
					</div>
					<div>
						<div class="opt-lbl">Memory</div>
						<div class="opt-val">{{ optimization.memory }} <span class="opt-unit">GiB</span></div>
					</div>
        </div>
				<div class="opt-note">{{ optimization.monthly }}</div>
				<button class="btn ai full" @click="router.push({ name: 'optimization' })">Review {{ optimization.count }} recommendations</button>
			</div>
		</div>
	</div>

	<Transition name="toast">
		<div v-if="toast" class="toast">{{ toast }}</div>
	</Transition>
</template>

<style scoped>
.page-head {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	margin-bottom: 20px;
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
.warn {
	color: var(--warn);
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
.btn.ai {
	background: linear-gradient(180deg, var(--accent), var(--accent-deep));
	border-color: transparent;
	color: #fff;
}
.btn.full {
	width: 100%;
	justify-content: center;
}
.kbd-inline {
	font-family: var(--mono);
	font-size: 11px;
}

.kpis {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 20px;
}
.cols {
	display: grid;
	grid-template-columns: 1.55fr 1fr;
	gap: 16px;
	align-items: start;
}
.col {
	display: grid;
	gap: 16px;
}

.card {
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
}
.card.pad {
	padding: 16px 18px;
}
.card.opt {
	background: linear-gradient(180deg, var(--accent-bg), transparent 55%);
}
.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 18px 4px;
	font-size: 14px;
	font-weight: 600;
}
.card-head.bare {
	padding: 0 0 12px;
}
.card-title {
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 14px;
}
.link {
	color: var(--brand);
	font-size: 12.5px;
	text-decoration: none;
	font-weight: 500;
	cursor: pointer;
}
.count {
	font-size: 11px;
	color: var(--text-faint);
	font-weight: 500;
}

.opt-figs {
	display: flex;
	gap: 24px;
	margin-bottom: 10px;
}
.opt-lbl {
	font-size: 11px;
	color: var(--text-faint);
}
.opt-val {
	font-family: var(--mono);
	font-size: 19px;
	color: var(--accent);
	margin-top: 2px;
}
.opt-unit {
	font-size: 12px;
	color: var(--text-faint);
}
.opt-note {
	font-size: 12px;
	color: var(--text-dim);
	margin: 4px 0 14px;
	min-height: 16px;
}

.qa {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
}
.qa-btn {
	font-size: 12px;
	padding: 12px;
	border-radius: var(--r-sm);
	border: 1px solid var(--border);
	background: var(--surface-2);
	color: var(--text-dim);
	cursor: pointer;
}
.qa-btn:hover {
	border-color: #3a465a;
	color: var(--text);
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
