<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch, watchEffect} from 'vue'
import MetricTile from '../components/MetricTile.vue'
import TrendChart from '../components/TrendChart.vue'
import PhaseDonut from '../components/PhaseDonut.vue'
import NodeTable from '../components/NodeTable.vue'
import EventFeed from '../components/EventFeed.vue'
import KxState from '@/components/shared/KxState.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useActiveCluster } from '@/composables/useActiveCluster'
import { fetchMonitoring, ranges } from '../monitoring.data'
import type { MonitoringData } from '../types'
import {useClusterStore} from "@/stores/cluster.store.ts";
import {useBreadcrumbs} from "@/composables/useBreadcrumbs.ts";

const { resolve } = useActiveCluster()
const clusterStore = useClusterStore()
const { setBreadcrumbs } = useBreadcrumbs()
const cluster = ref('')
const range = ref('Last 1h')

const empty: MonitoringData = { kpis: [], cpuTrend: [], memTrend: [], podPhase: { running: 0, pending: 0, failed: 0 }, nodes: [], events: [], metricsAvailable: true }
const { data, loading, error, reload } = useAsyncData<MonitoringData>(() => fetchMonitoring(cluster.value, range.value), empty)

watchEffect(() => {
    const clusterName = clusterStore.currentCluster || cluster.value || 'all clusters'
    setBreadcrumbs([clusterName, 'Monitoring'])
})

watch(
    () => clusterStore.currentCluster,
    (name) => {
        if (!name || name === cluster.value) return
        cluster.value = name
        reload()
    },
)

const REFRESH_MS = 30000
let timer: ReturnType<typeof setInterval> | undefined

function onVisibility() {
    if (!document.hidden) reload()
}

onMounted(async () => {
    cluster.value = await resolve()
    await reload()
    timer = setInterval(() => {
        if (!document.hidden) reload()
    }, REFRESH_MS)
    document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
	<div class="page-head">
		<div>
			<h1>Cluster monitoring</h1>
            <p>Node and workload snapshot</p>
		</div>
		<div class="head-actions">
			<select v-model="range" class="select" @change="reload">
				<option v-for="r in ranges" :key="r" :value="r">Range: {{ r }}</option>
			</select>
            <button class="chip ok" @click="reload">↻ Refresh</button>
		</div>
	</div>

	<KxState v-if="loading || error" :loading="loading" :error="error" @retry="reload" />

	<template v-else>
        <div v-if="!data.metricsAvailable" class="notice">
            ⚠ metrics-server not detected on this cluster — CPU/memory utilisation and the trend are unavailable. Pod, node and event data are live.
        </div>

        <div class="kpis">
			<MetricTile v-for="k in data.kpis" :key="k.label" :kpi="k" />
		</div>

        <div class="charts">
            <TrendChart :cpu="data.cpuTrend" :mem="data.memTrend" />
            <PhaseDonut :phase="data.podPhase" />
        </div>

		<div class="bottom">
			<NodeTable :nodes="data.nodes" />
			<EventFeed :events="data.events" />
		</div>

        <p class="note">Live data from the cluster. Network I/O needs a cAdvisor/Prometheus source and is not yet available.</p>
    </template>
</template>

<style scoped>
.page-head {
	display: flex;
	align-items: flex-end;
	gap: 16px;
	margin-bottom: 18px;
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
	align-items: center;
	gap: 12px;
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
.chip {
	font-size: 11.5px;
	font-weight: 600;
	padding: 3px 10px;
	border-radius: 999px;
    border: none;
    cursor: pointer;
}
.chip.ok {
	color: var(--ok);
	background: var(--ok-bg);
}
.kpis {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	margin-bottom: 18px;
}
.charts {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 16px;
	margin-bottom: 18px;
}
.bottom {
	display: grid;
	grid-template-columns: 1.4fr 1fr;
	gap: 16px;
}
.note {
	font-size: 12px;
	color: var(--text-faint);
	margin-top: 16px;
}
.notice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    border-radius: var(--r-sm);
    border: 1px solid var(--warn-bg);
    background: var(--warn-bg);
    color: var(--warn);
    font-size: 12.5px;
}
</style>
