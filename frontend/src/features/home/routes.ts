import type { RouteRecordRaw } from 'vue-router'

export const homeRoutes: RouteRecordRaw[] = [
	{
		path: '/dashboard',
		name: 'home-dashboard',
		component: () => import('./pages/HomeDashboardPage.vue'),
		meta: { shell: 'kx', nav: 'home', cluster: 'all clusters', clusterSub: '', crumbs: ['Home'] },
	},
]
