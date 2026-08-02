<script setup lang="ts">
import StatusChip from '@/components/shared/StatusChip.vue'
import type { Issue } from '@/types/issue'
import {computed} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()
const props = defineProps<{ items: Issue[] }>()
const emit = defineEmits<{ (e: 'action', item: Issue): void }>()

const MAX_ROWS = 5
const topItems = computed(() => props.items.slice(0, MAX_ROWS))
const hiddenCount = computed(() => Math.max(0, props.items.length - MAX_ROWS))

function openTroubleshoot(item: Issue) {
    emit('action', item)
    router.push({ name: 'troubleshoot', query: { issue: item.name } })
}
</script>

<template>
    <div v-if="!items.length" class="ok">
        <span class="ok-icon">✓</span>
        <div class="ok-text">Everything is going on good — no issues need attention.</div>
    </div>
    <div v-else class="list">
        <div v-for="item in topItems" :key="item.id" class="row">
            <StatusChip :status="item.reason" :tone="item.reasonTone" />
            <div class="meta">
                <div class="name">{{ item.name }}</div>
                <div class="sub">{{ item.kind }} · <span class="tag">{{ item.cluster }}</span></div>
            </div>
            <span class="age">{{ item.age }}</span>
            <button class="btn" :class="item.action === 'Diagnose' ? 'ai' : ''" @click="openTroubleshoot(item)">{{ item.action }}</button>
        </div>
        <div v-if="hiddenCount" class="more">+{{ hiddenCount }} more</div>
    </div>
</template>

<style scoped>
.list {
	padding: 4px 6px 8px;
}
.ok {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 18px;
    color: var(--text-dim);
    font-size: 13px;
}
.ok-icon {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--ok-bg);
    color: var(--ok);
    font-size: 12px;
    font-weight: 700;
    flex: none;
}
.more {
    text-align: center;
    padding: 8px 0 4px;
    font-size: 11.5px;
    color: var(--text-faint);
}
.row {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 11px 10px;
	border-radius: 8px;
}
.row:hover {
	background: var(--hover);
}
.meta {
	flex: 1;
	min-width: 0;
}
.name {
	font-family: var(--mono);
	font-size: 12.5px;
	color: var(--text);
}
.sub {
	font-size: 11px;
	color: var(--text-faint);
	margin-top: 2px;
}
.tag {
	font-family: var(--mono);
	font-size: 10.5px;
	padding: 1px 6px;
	border-radius: 5px;
	background: var(--surface-2);
	border: 1px solid var(--border-soft);
	color: var(--text-dim);
}
.age {
	font-size: 11px;
	color: var(--text-faint);
}
.btn {
	font-size: 12px;
	font-weight: 600;
	padding: 6px 11px;
	border-radius: var(--r-sm);
	border: 1px solid var(--border);
	background: var(--surface);
	color: var(--text);
	cursor: pointer;
	white-space: nowrap;
}
.btn:hover {
	border-color: #3a465a;
}
.btn.ai {
	background: linear-gradient(180deg, var(--accent), var(--accent-deep));
	border-color: transparent;
	color: #fff;
}
</style>
