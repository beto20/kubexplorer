<script setup lang="ts">
import type { EventItem } from '../types'

defineProps<{ events: EventItem[] }>()
</script>

<template>
	<div class="card">
		<div class="head">Recent events</div>
            <div v-if="events.length" class="list">
			<div v-for="e in events" :key="e.id" class="ev">
				<span class="dot" :class="e.kind"></span>
				<div class="meta">
					<div class="title"><b>{{ e.title }}</b> {{ e.detail }}</div>
					<div class="sub">{{ e.meta }}</div>
				</div>
			</div>
		</div>
        <div v-else class="list-empty">No recent events.</div>
    </div>
</template>

<style scoped>
.card {
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
	padding: 16px 18px;
}
.head {
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 14px;
}
.list {
    display: grid;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 4px;
}
.ev {
	display: flex;
	gap: 10px;
	font-size: 12px;
}
.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	margin-top: 4px;
	flex: none;
}
.dot.ok {
	background: var(--ok);
}
.dot.warn {
	background: var(--warn);
}
.dot.err {
	background: var(--err);
}
.dot.info {
	background: var(--info);
}
.title b {
	color: var(--text);
}
.sub {
	color: var(--text-faint);
	margin-top: 2px;
}
.list-empty {
    color: var(--text-faint);
    font-size: 12.5px;
    font-style: italic;
}
</style>
