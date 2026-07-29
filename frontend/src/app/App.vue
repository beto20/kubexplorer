<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppShell from '@/shell/AppShell.vue'

const route = useRoute()
</script>

<template>
    <!-- kx-shell screens (Home, Clusters, Explorer, …) render in the shared app shell. -->
    <AppShell v-if="route.meta.shell === 'kx'">
        <router-view></router-view>
    </AppShell>

</template>

<style>

</style>
