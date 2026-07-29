<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SavingsSummary from '../components/SavingsSummary.vue'
import RecommendationTable from '../components/RecommendationTable.vue'
import KxState from '@/components/shared/KxState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useActiveCluster } from '@/composables/useActiveCluster'
import { useNamespacesStore } from '@/stores/namespaces.store'
import { hasWailsRuntime } from '@/services/runtime'
import { applyRecommendation, computeSummary, fetchRecommendations, mockNamespaces } from '../optimization.data'
import { toAppError } from '@/services/apperror'
import type { OptRecommendation } from '../types'

const { resolve } = useActiveCluster()
const namespacesStore = useNamespacesStore()
const cluster = ref('')
const namespaces = ref<string[]>([])
const namespace = ref('')
const analyzed = ref(false)

const { data: recs, loading, error, reload } = useAsyncData<OptRecommendation[]>(() => fetchRecommendations(cluster.value, namespace.value), [])

const summary = computed(() => computeSummary(recs.value))
const selected = ref<string[]>([])
const applying = ref<string | null>(null)

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(message: string) {
	toast.value = message
	clearTimeout(toastTimer)
	toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

async function analyze() {
	analyzed.value = true
	selected.value = []
	await reload()
}

function toggle(id: string) {
	selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id]
}

async function applyOne(rec: OptRecommendation) {
	applying.value = rec.id
	try {
		await applyRecommendation(cluster.value, rec)
		recs.value = recs.value.filter((r) => r.id !== rec.id)
		selected.value = selected.value.filter((x) => x !== rec.id)
		showToast(`Applied limits to ${rec.deployment}/${rec.container}`)
	} catch (err) {
		showToast(toAppError(err).message)
	} finally {
		applying.value = null
	}
}

async function applySelected() {
	const toApply = recs.value.filter((r) => selected.value.includes(r.id))
	for (const rec of toApply) {
		await applyOne(rec)
	}
}

onMounted(async () => {
    cluster.value = await resolve()
    namespaces.value = hasWailsRuntime() ? await namespacesStore.load(cluster.value) : mockNamespaces
    namespace.value = namespaces.value[0] ?? ''
})
</script>

<template>
	<div class="page-head">
		<div>
			<h1>Resource Optimization</h1>
			<p>Observed usage vs. configured limits over the last 7 days. Nothing changes until you apply.</p>
		</div>
		<div class="head-actions">
			<select v-model="namespace" class="select">
				<option v-for="ns in namespaces" :key="ns" :value="ns">Namespace: {{ ns }}</option>
			</select>
			<button class="btn primary" :disabled="loading" @click="analyze">{{ loading ? 'Analyzing…' : 'Analyze usage' }}</button>
		</div>
	</div>

	<div v-if="!analyzed" class="prompt">Pick a namespace and analyze usage to see right-sizing recommendations.</div>

	<template v-else>
		<KxState v-if="loading || error" :loading="loading" :error="error" @retry="reload" />
		<template v-else>
			<SavingsSummary :summary="summary" />

			<div class="card">
				<div class="toolbar">
					<span class="t">Recommendations · {{ namespace }}</span>
					<span class="spacer"></span>
					<button class="btn ai" :disabled="selected.length === 0" @click="applySelected">Apply selected ({{ selected.length }})</button>
				</div>
				<RecommendationTable :recs="recs" :selected="selected" :applying="applying" @apply="applyOne" @toggle="toggle" />
			</div>

			<p class="note">
				Suggested limits use the 7-day p95 plus 30–50% headroom. Applying writes <span class="mono">resources.limits</span> via a rolling update.
			</p>
		</template>
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
.select {
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: var(--r-sm);
	padding: 8px 12px;
	font-size: 12.5px;
	color: var(--text-dim);
	font-family: var(--sans);
	cursor: pointer;
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
.btn:disabled {
	opacity: 0.55;
	cursor: default;
}
.prompt {
	padding: 56px 20px;
	text-align: center;
	color: var(--text-faint);
	font-size: 13px;
	background: var(--surface);
	border: 1px dashed var(--border);
	border-radius: var(--r-lg);
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
	padding: 12px 16px;
	border-bottom: 1px solid var(--border-soft);
}
.toolbar .t {
	font-size: 13px;
	font-weight: 600;
}
.spacer {
	flex: 1;
}
.note {
	font-size: 12px;
	color: var(--text-faint);
	margin-top: 16px;
}
.mono {
	font-family: var(--mono);
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
