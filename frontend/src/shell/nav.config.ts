import 'vue-router'

declare module 'vue-router' {
	interface RouteMeta {
		shell?: 'kx'
		nav?: string
		cluster?: string
		clusterSub?: string
		crumbs?: string[]
		fullscreen?: boolean
	}
}

export interface NavItem {
	key: string
	label: string
	icon: string
	route?: string
	badge?: string
	soon?: boolean
}

export interface NavGroup {
	title: string
	items: NavItem[]
}

export const navGroups: NavGroup[] = [
	{
		title: 'Workspace',
		items: [
			{ key: 'home', label: 'Home', icon: '⌂', route: 'home-dashboard' },
			{ key: 'clusters', label: 'Clusters', icon: '◧', route: 'clusters-overview' },
			{ key: 'explorer', label: 'Resource Explorer', icon: '▤', route: 'explorer-demo' },
			{ key: 'monitoring', label: 'Monitoring', icon: '📈', route: 'monitoring' },
		],
	},
	{
		title: 'Operate',
		items: [
			{ key: 'troubleshoot', label: 'Troubleshoot', icon: '🩺', route: 'troubleshoot' },
			{ key: 'optimization', label: 'Optimization', icon: '✦', route: 'optimization' },
			{ key: 'backup', label: 'Backup & Restore', icon: '⭢', route: 'backup' },
		],
	},
]

export const footerNav: NavItem[] = [{ key: 'settings', label: 'Settings', icon: '⚙', route: 'settings' }]
