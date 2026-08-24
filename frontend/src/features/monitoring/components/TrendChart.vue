<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ cpu: number[]; mem: number[] }>()

const warming = computed(() => props.cpu.length > 0 && props.cpu.length < 3)

const memPoints = computed(() => {
    const n = props.mem.length
    if (n < 2) return ''
    return props.mem.map((v, i) => `${(i / (n - 1)) * 100},${100 - v}`).join(' ')
})
</script>

<template>
    <div class="card">
        <div class="head">
            <div class="t">Cluster CPU &amp; memory</div>
            <div class="legend"><span class="cpu">● CPU</span><span class="mem">● Memory</span></div>
        </div>
        <div v-if="cpu.length" class="chart">
            <span v-for="(v, i) in cpu" :key="i" class="col" :style="{ height: v + '%' }"></span>
            <svg v-if="memPoints" class="mem-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline :points="memPoints" />
            </svg>
        </div>
        <div v-else class="chart-empty">No metrics source connected — the utilisation trend needs the metrics-server integration.</div>
        <div v-if="warming" class="warming">Collecting samples… the trend fills in as the sampler runs.</div>
    </div>
</template>

<style scoped>
.card {
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
	padding: 18px;
}
.head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.t {
	font-size: 13.5px;
	font-weight: 600;
}
.legend {
	display: flex;
	gap: 12px;
	font-size: 11.5px;
}
.legend .cpu {
	color: var(--brand);
}
.legend .mem {
	color: var(--info);
}
.chart {
    position: relative;
	height: 150px;
	display: flex;
	align-items: flex-end;
	gap: 5px;
	padding-top: 12px;
}
.col {
	flex: 1;
	border-radius: 3px 3px 0 0;
	background: linear-gradient(180deg, rgba(79, 140, 255, 0.85), rgba(79, 140, 255, 0.12));
	min-height: 4px;
}
.mem-line {
    position: absolute;
    inset: 12px 0 0;
    width: 100%;
    height: calc(100% - 12px);
    pointer-events: none;
}
.mem-line polyline {
    fill: none;
    stroke: var(--info);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
    opacity: 0.8;
}
.warming {
    margin-top: 10px;
    font-size: 11.5px;
    color: var(--text-faint);
}
</style>
