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

export interface ServiceRow {
	name: string
	namespace: string
	type: string
	clusterIp: string
	externalIp: string
	port: string
	age: string
	status: string
}

export interface IngressRow {
	name: string
	namespace: string
	hosts: string
	age: string
}

export interface PvRow {
	name: string
	capacity: string
	storageClass: string
	claim: string
	age: string
	status: string
}

export interface PvcRow {
	name: string
	namespace: string
	capacity: string
	storageClass: string
	age: string
	status: string
}

export interface NodeRow {
	name: string
	version: string
	os: string
	cpu: string
	memory: string
	age: string
}

export interface ResourceTab {
	key: 'pod' | 'deployment' | 'service' | 'ingress' | 'pv' | 'pvc' | 'node'
	label: string
}
