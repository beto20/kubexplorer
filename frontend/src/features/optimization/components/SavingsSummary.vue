<script setup lang="ts">
import { computed } from 'vue'
import type { SavingsSummary } from '../types'

const props = defineProps<{ summary: SavingsSummary }>()

const donut = computed(() => {
	const total = props.summary.flagged + props.summary.idle || 1
	const over = (props.summary.over / total) * 100
	const under = ((props.summary.over + props.summary.under) / total) * 100
	return `conic-gradient(var(--warn) 0 ${over}%, var(--err) ${over}% ${under}%, var(--info) ${under}% 100%)`
})
</script>

<template>
	<div class="summary">
		<div class="card breakdown">
			<div class="donut" :style="{ background: donut }">
				<div class="lab"><b>{{ summary.flagged }}</b><span>flagged</span></div>
			</div>
			<div class="legend">
				<span class="chip warn">{{ summary.over }} over-provisioned</span>
				<span class="chip err">{{ summary.under }} under-provisioned</span>
				<span class="chip info">{{ summary.idle }} idle</span>
			</div>
		</div>

		<div class="card stat">
			<div class="lbl">✦ Reclaimable CPU</div>
			<div class="val">{{ summary.reclaimableCpu }} <small>cores</small></div>
			<div class="hint">across {{ summary.over }} over-provisioned workloads</div>
		</div>

		<div class="card stat">
			<div class="lbl">✦ Reclaimable memory</div>
			<div class="val">{{ summary.reclaimableMemory }} <small>GiB</small></div>
			<div class="hint">≈ ${{ summary.monthly }} / month (estimated)</div>
		</div>
	</div>
</template>

<style scoped>
.summary {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
	margin-bottom: 20px;
}
.card {
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
	padding: 18px;
}
.breakdown {
	display: flex;
	align-items: center;
	gap: 14px;
}
.donut {
	width: 96px;
	height: 96px;
	border-radius: 50%;
	display: grid;
	place-items: center;
	position: relative;
	flex: none;
}
.donut::after {
	content: '';
	position: absolute;
	inset: 14px;
	border-radius: 50%;
	background: var(--surface);
}
.lab {
	position: relative;
	z-index: 1;
	text-align: center;
}
.lab b {
	font-size: 18px;
	font-family: var(--mono);
	display: block;
}
.lab span {
	font-size: 11px;
	color: var(--text-dim);
}
.legend {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 11.5px;
	font-weight: 600;
	padding: 3px 9px 3px 8px;
	border-radius: 999px;
	width: fit-content;
}
.chip::before {
	content: '';
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: currentColor;
}
.chip.warn {
	color: var(--warn);
	background: var(--warn-bg);
}
.chip.err {
	color: var(--err);
	background: var(--err-bg);
}
.chip.info {
	color: var(--info);
	background: var(--info-bg);
}
.stat .lbl {
	font-size: 12px;
	color: var(--text-dim);
}
.stat .val {
	font-size: 28px;
	font-weight: 700;
	letter-spacing: -0.02em;
	margin-top: 8px;
	font-family: var(--mono);
	color: var(--accent);
}
.stat .val small {
	font-size: 13px;
	color: var(--text-faint);
	font-weight: 500;
}
.stat .hint {
	font-size: 11.5px;
	margin-top: 4px;
	color: var(--text-faint);
}
</style>
