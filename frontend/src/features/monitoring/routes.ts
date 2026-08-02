import type { RouteRecordRaw } from 'vue-router'

export const monitoringRoutes: RouteRecordRaw[] = [
	{
		path: '/monitoring',
		name: 'monitoring',
		component: () => import('./pages/MonitoringPage.vue'),
		meta: { shell: 'kx', nav: 'monitoring', cluster: 'prod-eu-west-1', clusterSub: 'v1.29.4 · 12 nodes',
			// crumbs: ['prod-eu-west-1', 'Monitoring']
		},
	},
]
