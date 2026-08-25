<script setup lang="ts">
import { computed } from 'vue'
import StatusChip from '@/components/shared/StatusChip.vue'
import type { Issue } from '@/types/issue'

const props = defineProps<{ issues: Issue[]; selectedId: string }>()

const emit = defineEmits<{ (e: 'select', id: string): void }>()

const critical = computed(() => props.issues.filter((i) => i.reasonTone === 'err').length)
const warning = computed(() => props.issues.filter((i) => i.reasonTone === 'warn').length)
</script>

<template>
    <div>
        <h2 class="title">Open issues</h2>
        <div class="counts">
            <span class="chip err">{{ critical }} critical</span>
            <span class="chip warn">{{ warning }} warning</span>
        </div>

        <div class="list">
            <button v-for="issue in issues" :key="issue.id" type="button" class="issue" :class="{ on: issue.id === selectedId }" @click="emit('select', issue.id)">
                <div class="row">
                    <StatusChip :status="issue.reason" :tone="issue.reasonTone" />
                    <span class="age">{{ issue.age }} ago</span>
                </div>
                <div class="name">{{ issue.name }}</div>
                <div class="sub">{{ issue.kind }} · {{ issue.cluster }}</div>
            </button>
            <div v-if="!issues.length" class="empty">No open issues 🎉</div>
        </div>
    </div>
</template>
<style scoped>
.title {
	margin: 0 0 14px;
	font-size: 18px;
	font-weight: 700;
}
.counts {
	display: flex;
	gap: 8px;
	margin-bottom: 12px;
}
.chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 11.5px;
	font-weight: 600;
	padding: 3px 9px 3px 8px;
	border-radius: 999px;
}
.chip::before {
	content: '';
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: currentColor;
}
.chip.err {
	color: var(--err);
	background: var(--err-bg);
}
.chip.warn {
	color: var(--warn);
	background: var(--warn-bg);
}
.list {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    padding-right: 4px;
}
.empty {
    color: var(--text-faint);
    font-size: 12.5px;
    text-align: center;
    padding: 28px 0;
}
.issue {
	display: block;
	width: 100%;
	text-align: left;
	background: var(--surface);
	border: 1px solid var(--border-soft);
	border-radius: var(--r-lg);
	padding: 14px;
	margin-bottom: 10px;
	cursor: pointer;
	font-family: var(--sans);
}
.issue:hover {
	border-color: var(--border);
}
.issue.on {
	border-color: var(--brand);
	background: var(--brand-soft);
}
.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.age {
	font-size: 11px;
	color: var(--text-faint);
}
.name {
	font-family: var(--mono);
	font-size: 12.5px;
	font-weight: 600;
	color: var(--text);
	margin-top: 8px;
	word-break: break-all;
}
.sub {
	font-size: 11px;
	color: var(--text-faint);
	margin-top: 3px;
}
</style>
