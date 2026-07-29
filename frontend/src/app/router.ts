import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useClusterStore } from '@/stores/cluster.store'
import { explorerRoutes } from '@/features/explorer/routes'
import { clustersRoutes } from '@/features/clusters/routes'
import { homeRoutes } from '@/features/home/routes'
import { troubleshootRoutes } from '@/features/troubleshoot/routes'
import { optimizationRoutes } from '@/features/optimization/routes'
import { monitoringRoutes } from '@/features/monitoring/routes'
import { backupRoutes } from '@/features/backup/routes'
import { settingsRoutes } from '@/features/settings/routes'

const routes: RouteRecordRaw[] = [
	{ path: '/', redirect: '/dashboard' },
	{ path: '/home', redirect: '/dashboard' },
	...explorerRoutes,
	...clustersRoutes,
	...homeRoutes,
	...troubleshootRoutes,
	...optimizationRoutes,
	...monitoringRoutes,
	...backupRoutes,
	...settingsRoutes,
	{ path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('./NotFoundPage.vue') },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to) => {
	const cluster = to.params.cluster
	if (typeof cluster === 'string' && cluster) {
		useClusterStore().setCurrentCluster(cluster)
	}
})

export default router
