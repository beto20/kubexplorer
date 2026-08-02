<script setup lang="ts">
import StatusChip from '@/components/shared/StatusChip.vue'
import type { PvcRow } from '../types'

defineProps<{ rows: PvcRow[] }>()
</script>

<template>
	<div class="tbl-wrap">
		<table class="tbl">
			<thead>
				<tr>
					<th>Name</th>
					<th>Namespace</th>
					<th>Capacity</th>
					<th>Storage Class</th>
					<th>Age</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="row in rows" :key="`${row.namespace}/${row.name}`">
					<td><span class="name">{{ row.name }}</span></td>
					<td>{{ row.namespace }}</td>
					<td class="mono">{{ row.capacity }}</td>
					<td>{{ row.storageClass }}</td>
					<td>{{ row.age }}</td>
					<td><StatusChip :status="row.status" /></td>
				</tr>
				<tr v-if="rows.length === 0">
					<td colspan="6" class="empty">No persistent volume claims match the current filters.</td>
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
</style>
