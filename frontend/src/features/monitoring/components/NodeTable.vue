<script setup lang="ts">
import UsageBar from '@/components/shared/UsageBar.vue'
import StatusChip from '@/components/shared/StatusChip.vue'
import type { NodeRow } from '../types'

defineProps<{ nodes: NodeRow[] }>()
</script>

<template>
    <div class="card">
        <div class="head">Nodes</div>
        <div class="scroll">
            <table class="tbl">
                <thead>
                <tr><th>Node</th><th>CPU</th><th>Mem</th><th>Pods</th><th>Status</th></tr>
                </thead>
                <tbody>
                <tr v-for="n in nodes" :key="n.name">
                    <td><span class="name">{{ n.name }}</span></td>
                    <td>
                        <div v-if="n.cpu !== null" class="usage"><UsageBar class="b" :pct="n.cpu" /><span class="val">{{ n.cpu }}%</span></div>
                        <span v-else class="na">—</span>
                    </td>
                    <td>
                        <div v-if="n.memory !== null" class="usage"><UsageBar class="b" :pct="n.memory" /><span class="val">{{ n.memory }}%</span></div>
                        <span v-else class="na">—</span>
                    </td>
                    <td class="mono">{{ n.pods }}</td>
                    <td><StatusChip :status="n.status" :tone="n.statusTone" /></td>
                </tr>
                <tr v-if="nodes.length === 0">
                    <td colspan="5" class="empty">No nodes reported.</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.card {
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
	overflow: hidden;
}
.head {
	font-size: 13px;
	font-weight: 600;
	padding: 14px 16px;
	border-bottom: 1px solid var(--border-soft);
}
.scroll {
    max-height: 400px;
    overflow-y: auto;
}
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
	padding: 10px 16px;
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 1;
}
.tbl tbody td {
	padding: 11px 16px;
	border-top: 1px solid var(--border-soft);
	color: var(--text-dim);
	vertical-align: middle;
}
.name {
	font-family: var(--mono);
	font-size: 12.5px;
	color: var(--text);
}
.mono {
	font-family: var(--mono);
}
.b {
	width: 90px;
}
.usage {
    display: inline-flex;
    flex-direction: column;
    gap: 3px;
}
.val {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-faint);
}
.na {
    color: var(--text-faint);
}
.empty {
    text-align: center;
    color: var(--text-faint);
    padding: 28px 0;
}
</style>
