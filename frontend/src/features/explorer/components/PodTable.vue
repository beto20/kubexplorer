<script setup lang="ts">
import StatusChip from '@/components/shared/StatusChip.vue'
import type { PodRow } from '../types'

defineProps<{ rows: PodRow[]; selected?: string }>()

const emit = defineEmits<{
	(e: 'select', row: PodRow): void
	(e: 'troubleshoot', row: PodRow): void
	(e: 'edit', row: PodRow): void
}>()
</script>

<template>
	<div class="tbl-wrap">
		<table class="tbl">
			<thead>
				<tr>
					<th>Name</th>
					<th>Namespace</th>
					<th>CPU</th>
					<th>Memory</th>
					<th>Restarts</th>
					<th>Node</th>
					<th>Age</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="row in rows" :key="row.name" :class="{ sel: row.name === selected }" @click="emit('select', row)">
					<td><span class="name">{{ row.name }}</span></td>
					<td>{{ row.namespace }}</td>
					<td class="mono">{{ row.cpu }}</td>
					<td class="mono">{{ row.memory }}</td>
					<td class="mono" :class="{ bad: row.restarts >= 5 }">{{ row.restarts }}</td>
					<td class="mono">{{ row.node }}</td>
					<td>{{ row.age }}</td>
					<td><StatusChip :status="row.status" /></td>
					<td>
						<div class="row-actions" @click.stop>
							<button class="ra heal" title="Troubleshoot" @click="emit('troubleshoot', row)">🩺</button>
							<button class="ra" title="Edit" @click="emit('edit', row)">✎</button>
							<button class="ra" title="More">⋯</button>
						</div>
					</td>
				</tr>
				<tr v-if="rows.length === 0">
					<td colspan="9" class="empty">No pods match the current filters.</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
.tbl {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;
}
.tbl thead th {
	text-align: left;
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--text-faint);
	padding: 11px 16px;
	border-bottom: 1px solid var(--border-soft);
	background: var(--hover);
    position: sticky;
    top: 0;
    z-index: 1;
}
.tbl tbody td {
	padding: 12px 16px;
	border-bottom: 1px solid var(--border-soft);
	color: var(--text-dim);
}
.tbl tbody tr {
	cursor: pointer;
}
.tbl tbody tr:hover td {
	background: var(--row-hover);
}
.tbl tbody tr.sel td {
	background: var(--brand-soft);
}
.name {
	color: var(--text);
	font-family: var(--mono);
	font-size: 12.5px;
}
.mono {
	font-family: var(--mono);
}
.bad {
	color: var(--err);
}
.empty {
	text-align: center;
	color: var(--text-faint);
	padding: 40px 0;
}
.row-actions {
	display: flex;
	gap: 4px;
}
.ra {
	width: 26px;
	height: 26px;
	display: grid;
	place-items: center;
	border-radius: 5px;
	color: var(--text-faint);
	font-size: 13px;
	background: none;
	border: none;
	cursor: pointer;
}
.ra:hover {
	background: var(--surface-3);
	color: var(--text);
}
.ra.heal:hover {
	color: var(--accent);
}
</style>
