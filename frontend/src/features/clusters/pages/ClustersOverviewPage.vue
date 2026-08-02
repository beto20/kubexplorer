<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import StatTile from '@/components/shared/StatTile.vue'
import KxState from '@/components/shared/KxState.vue'
import ClusterCardView from '../components/ClusterCard.vue'
import { useFleetStore } from '@/stores/fleet.store'
import { useIssuesStore } from '@/stores/issues.store'
import { issuesBreakdown } from '@/data/issues.data'
import type { ClusterSummary } from '@/types/fleet'

const fleetStore = useFleetStore()
const { totals, clusters, loading, error } = storeToRefs(fleetStore)
const issuesStore = useIssuesStore()
const { items: issues } = storeToRefs(issuesStore)

const unreachable = computed(() => (totals.value ? totals.value.clusters - totals.value.reachable : 0))

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

function showToast(message: string) {
	toast.value = message
	clearTimeout(toastTimer)
	toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

function onOpen(card: ClusterSummary) {
	showToast(`Opening ${card.name}…`)
}

function onTroubleshoot(card: ClusterSummary) {
	showToast(`Opening Troubleshoot for ${card.name}…`)
}

function onConnect() {
	showToast('Connect cluster — pick a kubeconfig context')
}

onMounted(() => {
    fleetStore.load()
    issuesStore.load()
})
</script>

<template>
	<div class="page-head">
		<div>
			<h1>Clusters</h1>
			<p>Every kubeconfig context, one pane of glass.</p>
		</div>
		<div class="head-actions">
			<button class="btn" @click="onConnect">＋ Add context</button>
			<button class="btn primary" @click="onConnect">Connect cluster</button>
		</div>
	</div>

	<KxState v-if="loading || error" :loading="loading" :error="error" @retry="() => fleetStore.load(true)" />

	<template v-else>
        <div v-if="totals" class="fleet">
            <StatTile
                label="◧ Clusters"
                :value="String(totals.clusters)"
                :unit="`/ ${totals.reachable} reachable`"
                :hint="unreachable ? `${unreachable} unreachable` : 'all contexts responding'"
                :hint-tone="unreachable ? 'down' : 'up'"
            />
            <StatTile label="▤ Workloads" :value="String(totals.workloads)" unit="pods" />
            <StatTile label="▦ Nodes" :value="String(totals.nodes)" />
            <StatTile label="🩺 Open issues" :value="String(issues.length)" :value-tone="issues.length ? 'warn' : undefined" :hint="issuesBreakdown(issues)" :hint-tone="issues.length ? 'down' : undefined" />
        </div>

		<div class="cards">
			<ClusterCardView v-for="c in clusters" :key="c.name" :card="c" @open="onOpen" @troubleshoot="onTroubleshoot" />
		</div>
	</template>

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

.fleet {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 22px;
}
.cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
    padding-right: 4px;
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
