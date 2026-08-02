<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import StatusChip from '@/components/shared/StatusChip.vue'
import { useOverlayStore } from '@/stores/overlay.store'
import { useThemeStore } from '@/stores/theme.store'
import { useClusterStore } from '@/stores/cluster.store'
import { navGroups } from '@/shell/nav.config'
import { fetchPods } from '@/features/explorer/explorer.data'
import type { ChipTone } from '@/types/status'
import type { PodRow } from '@/features/explorer/types'

interface PaletteItem {
	id: string
	icon: string
	label: string
	sub?: string
	kbd?: string
	chip?: { text: string; tone?: ChipTone }
	run: () => void
}

const router = useRouter()
const overlay = useOverlayStore()
const themeStore = useThemeStore()
const clusterStore = useClusterStore()

const query = ref('')
const activeIndex = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const pods = ref<PodRow[]>([])

const context = computed(() => clusterStore.currentCluster || 'all clusters')

function go(run: () => void) {
	run()
	overlay.closeAll()
}

const actions = computed<PaletteItem[]>(() => [
	{ id: 'theme', icon: '◐', label: 'Toggle light / dark theme', run: () => themeStore.toggle() },
	{ id: 'switch', icon: '◧', label: 'Switch cluster…', kbd: '⌘O', run: () => overlay.openSwitcher() },
])

const navItems = computed<PaletteItem[]>(() =>
	navGroups
		.flatMap((g) => g.items)
		.filter((i) => i.route)
		.map((i) => ({ id: 'nav-' + i.key, icon: i.icon, label: i.label, run: () => router.push({ name: i.route! }) })),
)

const resourceItems = computed<PaletteItem[]>(() => {
	if (!query.value) {
		return []
	}
	const q = query.value.toLowerCase()
	return pods.value
		.filter((p) => p.name.toLowerCase().includes(q))
		.slice(0, 5)
		.map((p) => ({
			id: 'res-' + p.name,
			icon: '●',
			label: p.name,
			sub: `pod · ${p.namespace} · ${p.status}`,
			chip: { text: p.status },
			run: () => router.push({ name: 'explorer-demo' }),
		}))
})

function match(items: PaletteItem[]) {
	if (!query.value) {
		return items
	}
	const q = query.value.toLowerCase()
	return items.filter((i) => i.label.toLowerCase().includes(q))
}

const sections = computed(() => {
	let idx = 0
	const out: { title: string; items: (PaletteItem & { _idx: number })[] }[] = []
	const add = (title: string, items: PaletteItem[]) => {
		if (items.length) {
			out.push({ title, items: items.map((it) => ({ ...it, _idx: idx++ })) })
		}
	}
	add('Actions', match(actions.value))
	add('Resources', resourceItems.value)
	add('Jump to', match(navItems.value))
	return out
})

const flat = computed(() => sections.value.flatMap((s) => s.items))

watch([query, flat], () => {
	if (activeIndex.value >= flat.value.length) {
		activeIndex.value = 0
	}
})

function onKeydown(e: KeyboardEvent) {
	const n = flat.value.length
	if (!n) {
		return
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault()
		activeIndex.value = (activeIndex.value + 1) % n
	} else if (e.key === 'ArrowUp') {
		e.preventDefault()
		activeIndex.value = (activeIndex.value - 1 + n) % n
	} else if (e.key === 'Enter') {
		e.preventDefault()
		const item = flat.value[activeIndex.value]
		if (item) {
			go(item.run)
		}
	}
}

onMounted(async () => {
	inputEl.value?.focus()
	pods.value = await fetchPods(clusterStore.currentCluster || '')
})
</script>

<template>
	<div class="wrap">
		<div class="scrim" @click="overlay.closeAll()"></div>
		<div class="palette">
			<div class="input">
				<span class="ic">⌕</span>
				<input ref="inputEl" v-model="query" class="q" placeholder="Search actions, resources, views…" @keydown="onKeydown" />
				<span class="ctx">{{ context }}</span>
			</div>

			<div class="body">
				<template v-for="section in sections" :key="section.title">
					<div class="group">{{ section.title }}</div>
					<button
						v-for="item in section.items"
						:key="item.id"
						type="button"
						class="pi"
						:class="{ active: item._idx === activeIndex }"
						@mousemove="activeIndex = item._idx"
						@click="go(item.run)"
					>
						<span class="pico">{{ item.icon }}</span>
						<span class="ptxt">
							<b>{{ item.label }}</b>
							<span v-if="item.sub">{{ item.sub }}</span>
						</span>
						<StatusChip v-if="item.chip" :status="item.chip.text" :tone="item.chip.tone" />
						<span v-else-if="item.kbd" class="pkbd">{{ item.kbd }}</span>
					</button>
				</template>
				<div v-if="!flat.length" class="empty">No matches for “{{ query }}”.</div>
			</div>

			<div class="foot">
				<span><b>↑↓</b> navigate</span><span><b>↵</b> run</span><span><b>⌘O</b> clusters</span>
				<span style="margin-left: auto"><b>esc</b> close</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.wrap {
	position: fixed;
	inset: 0;
	z-index: 80;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 92px;
}
.scrim {
	position: absolute;
	inset: 0;
	background: var(--overlay);
	backdrop-filter: blur(1.5px);
}
.palette {
	position: relative;
	width: 640px;
	max-width: 92%;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: var(--r-lg);
	box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
	overflow: hidden;
}
.input {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px 18px;
	border-bottom: 1px solid var(--border-soft);
}
.input .ic {
	color: var(--text-faint);
	font-size: 18px;
}
.q {
	flex: 1;
	background: none;
	border: none;
	outline: none;
	font-size: 16px;
	color: var(--text);
	font-family: var(--sans);
}
.q::placeholder {
	color: var(--text-faint);
}
.ctx {
	font-size: 11px;
	font-family: var(--mono);
	color: var(--text-dim);
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: 6px;
	padding: 3px 8px;
}
.body {
	max-height: 420px;
	overflow: auto;
	padding: 8px;
}
.group {
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: var(--text-faint);
	padding: 12px 10px 6px;
}
.pi {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	padding: 9px 10px;
	border-radius: var(--r-sm);
	background: none;
	border: none;
	cursor: pointer;
	text-align: left;
	font-family: var(--sans);
}
.pi .pico {
	width: 26px;
	height: 26px;
	border-radius: 6px;
	background: var(--surface-2);
	display: grid;
	place-items: center;
	font-size: 14px;
	color: var(--text-dim);
	flex: none;
}
.ptxt {
	flex: 1;
	min-width: 0;
}
.ptxt b {
	font-size: 13.5px;
	font-weight: 500;
	color: var(--text);
	font-family: var(--mono);
}
.ptxt span {
	display: block;
	font-size: 11.5px;
	color: var(--text-faint);
}
.pkbd {
	font-family: var(--mono);
	font-size: 11px;
	color: var(--text-dim);
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: 5px;
	padding: 2px 7px;
}
.pi.active {
	background: var(--brand-soft);
}
.pi.active .pico {
	background: var(--brand);
	color: #fff;
}
.empty {
	padding: 28px;
	text-align: center;
	color: var(--text-faint);
	font-size: 13px;
}
.foot {
	display: flex;
	align-items: center;
	gap: 18px;
	padding: 11px 16px;
	border-top: 1px solid var(--border-soft);
	font-size: 11.5px;
	color: var(--text-faint);
}
.foot b {
	font-family: var(--mono);
	color: var(--text-dim);
	font-weight: 500;
}
</style>
