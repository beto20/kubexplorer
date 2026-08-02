<script setup lang="ts">
import {computed, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '@/components/shared/BrandMark.vue'
import { useOverlayStore } from '@/stores/overlay.store'
import { useSettingsStore } from '@/stores/settings.store'
import { footerNav, navGroups } from './nav.config'
import type { NavItem } from './nav.config'
import {useClusterStore} from "@/stores/cluster.store.ts";
import {useFleetStore} from "@/stores/fleet.store.ts";

const route = useRoute()
const router = useRouter()
const overlay = useOverlayStore()
const settings = useSettingsStore()
const clusterStore = useClusterStore()
const fleetStore = useFleetStore()

const active = computed(() => route.meta.nav)
const cluster = computed(() => clusterStore.currentCluster || route.meta.cluster || 'all clusters')
const currentSummary = computed(() => fleetStore.clusters.find(c => c.name === cluster.value))
const clusterSub = computed(() => {
    const summary = currentSummary.value
    if (!summary) {
        return route.meta.clusterSub ?? ''
    }

    const version = summary.source.match(/v\d+\.\d+(?:\.\d+)?/)?.[0]
    return [version, `${summary.pods} pods`].filter(Boolean).join(' · ')
})
const clusterEnv = computed(() => settings.envFor(cluster.value))

onMounted(() => fleetStore.load())

function go(item: NavItem) {
	if (item.route && !item.soon) {
		router.push({ name: item.route })
	}
}
</script>

<template>
	<aside class="rail">
		<div class="brand">
			<div class="logo"><BrandMark :size="18" /></div>
			<div class="brand-name">Tider<small>by TiderOps</small></div>
		</div>

		<button class="cluster-switch" type="button" :class="clusterEnv !== 'none' ? `env-${clusterEnv}` : ''" @click="overlay.openSwitcher()">
			<span class="dot"></span>
			<div class="cs-meta">
				<b>{{ cluster }}</b>
				<span v-if="clusterEnv !== 'none'" class="env-tag" :class="clusterEnv">{{ clusterEnv }}</span>
				<span v-if="clusterSub">{{ clusterSub }}</span>
			</div>
			<span class="caret">▾</span>
		</button>

		<template v-for="group in navGroups" :key="group.title">
			<div class="nav-group">{{ group.title }}</div>
			<button
				v-for="item in group.items"
				:key="item.key"
				type="button"
				class="nav"
				:class="{ active: item.key === active, soon: item.soon }"
				:disabled="item.soon"
				@click="go(item)"
			>
				<span class="ico">{{ item.icon }}</span> {{ item.label }}
				<span v-if="item.badge" class="badge">{{ item.badge }}</span>
				<span v-else-if="item.soon" class="soon-tag">soon</span>
			</button>
		</template>

		<div class="spacer"></div>
		<button
			v-for="item in footerNav"
			:key="item.key"
			type="button"
			class="nav"
			:class="{ active: item.key === active, soon: item.soon }"
			:disabled="item.soon"
			@click="go(item)"
		>
			<span class="ico">{{ item.icon }}</span> {{ item.label }}
		</button>
	</aside>
</template>

<style scoped>
.rail {
	background: var(--bg-rail);
	border-right: 1px solid var(--border-soft);
	display: flex;
	flex-direction: column;
	padding: 16px 12px;
	gap: 4px;
}
.brand {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 8px 14px;
}
.logo {
	width: 30px;
	height: 30px;
	border-radius: 8px;
	background: var(--brand-deep);
	color: #fff;
	display: grid;
	place-items: center;
}
.brand-name {
	font-family: var(--display);
	font-weight: 700;
	font-size: 15px;
	letter-spacing: -0.02em;
	color: var(--text);
}
.brand-name small {
	display: block;
	font-weight: 500;
	font-size: 10.5px;
	color: var(--text-faint);
	letter-spacing: 0.04em;
	text-transform: uppercase;
}
.cluster-switch {
	margin: 4px 4px 14px;
	padding: 10px 11px;
	background: var(--surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	text-align: left;
	width: calc(100% - 8px);
}
.cluster-switch:hover {
	border-color: var(--brand);
}
.cluster-switch.env-prod {
	border-left: 3px solid var(--env-prod);
}
.cluster-switch.env-staging {
	border-left: 3px solid var(--env-staging);
}
.cluster-switch.env-dev {
	border-left: 3px solid var(--env-dev);
}
.cs-meta .env-tag {
	display: inline-block;
	margin-top: 3px;
	margin-right: 6px;
	padding: 0 6px;
	border-radius: 999px;
	font-size: 9.5px;
	font-weight: 700;
	letter-spacing: 0.05em;
	text-transform: uppercase;
}
.cs-meta .env-tag.prod {
	color: var(--env-prod);
	background: var(--env-prod-bg);
}
.cs-meta .env-tag.staging {
	color: var(--env-staging);
	background: var(--env-staging-bg);
}
.cs-meta .env-tag.dev {
	color: var(--env-dev);
	background: var(--env-dev-bg);
}
.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--ok);
	box-shadow: 0 0 0 3px var(--ok-bg);
	flex: none;
}
.cs-meta {
	flex: 1;
	min-width: 0;
}
.cs-meta b {
	font-size: 13px;
	font-family: var(--mono);
	display: block;
	color: var(--text);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.cs-meta span {
	font-size: 11px;
	color: var(--text-faint);
}
.caret {
	color: var(--text-faint);
	font-size: 12px;
}
.nav-group {
	margin: 10px 8px 4px;
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: var(--text-faint);
}
.nav {
	display: flex;
	align-items: center;
	gap: 11px;
	padding: 8px 10px;
	border-radius: var(--r-sm);
	color: var(--text-dim);
	font-size: 13px;
	font-weight: 500;
	background: none;
	border: none;
	cursor: pointer;
	text-align: left;
	width: 100%;
	font-family: var(--sans);
}
.nav:not(.soon):hover {
	background: var(--hover);
	color: var(--text);
}
.nav .ico {
	width: 17px;
	text-align: center;
	font-size: 15px;
	opacity: 0.85;
}
.nav.active {
	background: var(--brand-soft);
	color: var(--brand);
}
.nav.soon {
	opacity: 0.55;
	cursor: default;
}
.nav .badge {
	margin-left: auto;
	font-size: 10px;
	font-weight: 600;
	padding: 1px 7px;
	border-radius: 999px;
	background: var(--err-bg);
	color: var(--err);
}
.nav .soon-tag {
	margin-left: auto;
	font-size: 9.5px;
	font-weight: 600;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var(--text-faint);
}
.spacer {
	flex: 1;
}
</style>
