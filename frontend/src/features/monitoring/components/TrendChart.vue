<script setup lang="ts">
defineProps<{ values: number[] }>()
</script>

<template>
	<div class="card">
		<div class="head">
			<div class="t">Cluster CPU &amp; memory</div>
			<div class="legend"><span class="cpu">● CPU</span><span class="mem">● Memory</span></div>
		</div>
		<div v-if="values.length" class="chart">
			<span v-for="(v, i) in values" :key="i" class="col" :style="{ height: v + '%' }"></span>
		</div>
        <div v-else class="chart-empty">No metrics source connected — the utilisation trend needs the metrics-server integration.</div>
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
</style>
