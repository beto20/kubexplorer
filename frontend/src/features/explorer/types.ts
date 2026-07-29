export interface PodRow {
	name: string
	namespace: string
	cpu: string
	memory: string
	restarts: number
	node: string
	age: string
	status: string
}

export interface UsageMetric {
	label: string
	pct: number
}

export interface LastTermination {
	reason: string
	message: string
	log: string[]
}

export interface PodDetail {
	name: string
	namespace: string
	node: string
	status: string
	restarts: number
	restartWindow?: string
	controller: string
	image: string
	qosClass: string
	podIP: string
	serviceAccount: string
	started: string
	cpu: UsageMetric
	memory: UsageMetric
	lastTermination?: LastTermination
}

export interface DeploymentRow {
	name: string
	namespace: string
	replicas: number
	status: string
	age: string
}

export interface ResourceTab {
	key: 'pod' | 'deployment'
	label: string
}
