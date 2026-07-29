<script setup lang="ts">
import StatusChip from '@/components/shared/StatusChip.vue'
import type { DeploymentRow } from '../types'

defineProps<{ rows: DeploymentRow[] }>()

const emit = defineEmits<{
	(e: 'troubleshoot', row: DeploymentRow): void
}>()
</script>

<template>
	<div class="tbl-wrap">
		<table class="tbl">
			<thead>
				<tr>
					<th>Name</th>
					<th>Namespace</th>
					<th>Replicas</th>
					<th>Age</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="row in rows" :key="`${row.namespace}/${row.name}`">
					<td><span class="name">{{ row.name }}</span></td>
					<td>{{ row.namespace }}</td>
					<td class="mono">{{ row.replicas }}</td>
					<td>{{ row.age }}</td>
					<td><StatusChip :status="row.status" /></td>
					<td>
						<div class="row-actions" @click.stop>
							<button class="ra heal" title="Troubleshoot" @click="emit('troubleshoot', row)">🩺</button>
						</div>
					</td>
				</tr>
				<tr v-if="rows.length === 0">
					<td colspan="6" class="empty">No deployments match the current filters.</td>
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
}
.tbl tbody td {
	padding: 12px 16px;
	border-bottom: 1px solid var(--border-soft);
	color: var(--text-dim);
}
.tbl tbody tr:hover td {
	background: var(--row-hover);
}
.name {
	color: var(--text);
	font-family: var(--mono);
	font-size: 12.5px;
}
.mono {
	font-family: var(--mono);
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
