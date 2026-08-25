<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import { storeToRefs } from 'pinia'
import IssueQueue from '../components/IssueQueue.vue'
import DiagnosisPanel from '../components/DiagnosisPanel.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useIssuesStore } from '@/stores/issues.store'
import { fetchDiagnosis } from '../troubleshoot.data'
import { fetchRestartPod } from '@/services/workload.service'
import { hasWailsRuntime } from '@/services/runtime'
import { toAppError } from '@/services/apperror'
import type { Diagnosis, DiagnosisAction } from '../types'
import {useRoute} from "vue-router";
import { useClusterStore } from '@/stores/cluster.store'

const route = useRoute()
const issuesStore = useIssuesStore()
const clusterStore = useClusterStore()
const { items: issues } = storeToRefs(issuesStore)

const visibleIssues = computed(() =>
    clusterStore.currentCluster ? issues.value.filter((i) => i.cluster === clusterStore.currentCluster) : issues.value,
)

const selectedId = ref('')
const selectedIssue = computed(() => visibleIssues.value.find((i) => i.id === selectedId.value) ?? null)

const { data: diagnosis, loading, error, reload } = useAsyncData<Diagnosis | null>(() => {
	const issue = selectedIssue.value
	return issue ? fetchDiagnosis(issue) : Promise.resolve(null)
}, null)

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(message: string) {
	toast.value = message
	clearTimeout(toastTimer)
	toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

function select(id: string) {
	selectedId.value = id
	reload()
}

function selectFromRoute() {
    const wanted = route.query.issue
    const match = typeof wanted === 'string' ? visibleIssues.value.find((i) => i.name === wanted) : undefined
    if (match) {
        select(match.id)
    } else if (visibleIssues.value.length) {
        select(visibleIssues.value[0].id)
    } else {
        selectedId.value = ''
        reload()
    }
}

async function onAction(action: DiagnosisAction) {
	const issue = selectedIssue.value
	if (!issue) {
		return
	}
	if (action.kind === 'restart' && hasWailsRuntime()) {
		try {
			await fetchRestartPod(issue.name, issue.namespace, issue.cluster)
			showToast(`Restarting ${issue.name}…`)
		} catch (err) {
			showToast(toAppError(err).message)
		}
		return
	}
	showToast(action.label)
}

watch(
    () => route.query.issue,
    () => {
        if (visibleIssues.value.length) {
            selectFromRoute()
        }
    },
)

watch(
    () => clusterStore.currentCluster,
    () => {
        if (!visibleIssues.value.some((i) => i.id === selectedId.value)) {
            selectFromRoute()
        }
    },
)

onMounted(async () => {
    await issuesStore.load()
    selectFromRoute()
})
</script>

<template>
	<div class="grid">
        <IssueQueue :issues="visibleIssues" :selected-id="selectedId" @select="select" />
		<DiagnosisPanel :issue="selectedIssue" :diagnosis="diagnosis" :loading="loading" :error="error" @action="onAction" @retry="reload" />
	</div>

	<Transition name="toast">
		<div v-if="toast" class="toast">{{ toast }}</div>
	</Transition>
</template>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: 320px 1fr;
	gap: 22px;
	align-items: start;
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
