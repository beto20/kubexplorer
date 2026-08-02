<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme.store'
import { useOverlayStore } from '@/stores/overlay.store'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.ts'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const overlay = useOverlayStore()
const { crumbs } = useBreadcrumbs()

</script>

<template>
	<div class="topbar">
		<div class="crumbs">
			<template v-for="(c, i) in crumbs" :key="i">
				<span v-if="i > 0" class="sep">/</span>
				<span :class="{ last: i === crumbs.length - 1 }">{{ c }}</span>
			</template>
		</div>

		<button type="button" class="search" @click="overlay.openPalette()"><span>⌕</span> Search resources across clusters… <span class="kbd">⌘K</span></button>

		<div class="theme-toggle" role="group" aria-label="Theme">
			<button type="button" class="tt" :class="{ on: theme === 'light' }" aria-label="Light" @click="themeStore.set('light')">☀</button>
			<button type="button" class="tt" :class="{ on: theme === 'dark' }" aria-label="Dark" @click="themeStore.set('dark')">☾</button>
		</div>
		<button class="icon-btn" type="button" aria-label="Notifications">🔔</button>
	</div>
</template>

<style scoped>
.topbar {
	height: 60px;
	border-bottom: 1px solid var(--border-soft);
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 0 22px;
	flex: none;
}
.crumbs {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13.5px;
	color: var(--text-dim);
}
.crumbs .sep {
	color: var(--text-faint);
}
.crumbs .last {
	color: var(--text);
	font-weight: 600;
}
.search {
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 9px;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 8px 12px;
	width: 340px;
	color: var(--text-faint);
	font-size: 13px;
	cursor: pointer;
	font-family: var(--sans);
	text-align: left;
}
.search:hover {
	border-color: var(--brand);
}
.search .kbd {
	margin-left: auto;
	font-family: var(--mono);
	font-size: 11px;
	background: var(--surface-3);
	border: 1px solid var(--border);
	border-radius: 5px;
	padding: 1px 6px;
	color: var(--text-dim);
}
.theme-toggle {
	display: inline-flex;
	align-items: center;
	background: var(--surface-2);
	border: 1px solid var(--border);
	border-radius: 999px;
	padding: 2px;
	gap: 2px;
}
.theme-toggle .tt {
	width: 30px;
	height: 26px;
	display: grid;
	place-items: center;
	border-radius: 999px;
	font-size: 13px;
	color: var(--text-faint);
	background: none;
	border: none;
	cursor: pointer;
}
.theme-toggle .tt.on {
	background: var(--brand);
	color: #fff;
}
.icon-btn {
	width: 36px;
	height: 36px;
	display: grid;
	place-items: center;
	border-radius: var(--r-sm);
	color: var(--text-dim);
	border: 1px solid transparent;
	background: none;
	cursor: pointer;
	font-size: 16px;
}
.icon-btn:hover {
	background: var(--surface);
	border-color: var(--border);
}
</style>
