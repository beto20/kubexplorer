import { delay } from './mock-latency'
import type { Issue } from '@/types/issue'
import { scanClusters, type ClusterSnapshot } from './cluster-scan.data'
import { hasWailsRuntime } from '@/services/runtime'
import type { model } from '../../wailsjs/go/models'

// TODO-16: Remove mock data
const issues: Issue[] = [
	{ id: 'a1', reason: 'OOMKilled', reasonTone: 'err', name: 'checkout-api-7d9f8c-9wzlm', namespace: 'payments', resourceKind: 'pod', kind: 'pod · payments', cluster: 'prod-eu-west-1', age: '2m', action: 'Diagnose' },
	{ id: 'a2', reason: 'ImagePull', reasonTone: 'err', name: 'recommender-api', namespace: 'ml', resourceKind: 'deployment', kind: 'deployment · ml', cluster: 'dev-sandbox', age: '8m', action: 'Diagnose' },
	{ id: 'a3', reason: 'NotReady', reasonTone: 'warn', name: 'ip-10-2-58-4', namespace: '', resourceKind: 'node', kind: 'node', cluster: 'prod-eu-west-1', age: '6m', action: 'Inspect' },
]

const PENDING_GRACE_SECONDS = 5 * 60
const MAX_ISSUES = 50

export function podIssue(pod: model.PodDto, cluster: string, now = Date.now()): Issue | null {
	let tone: Issue['reasonTone']
	switch (pod.Status) {
		case 'Failed':
		case 'Unknown':
			tone = 'err'
			break
		case 'Pending': {
			if (now / 1000 - pod.CreatedAt <= PENDING_GRACE_SECONDS) {
				return null
			}
			tone = 'warn'
			break
		}
		default:
			return null
	}
	return {
		id: `${cluster}/pod/${pod.Namespace}/${pod.Name}`,
		reason: pod.Status,
		reasonTone: tone,
		name: pod.Name,
		namespace: pod.Namespace,
		resourceKind: 'pod',
		kind: `pod · ${pod.Namespace}`,
		cluster,
		age: pod.Age,
		action: 'Diagnose',
	}
}

export function deploymentIssue(dep: model.DeploymentDto, cluster: string): Issue | null {
	if (dep.Status === 'True') {
		return null
	}
	return {
		id: `${cluster}/deployment/${dep.Namespace}/${dep.Name}`,
		reason: 'Unavailable',
		reasonTone: dep.Status === 'False' ? 'err' : 'warn',
		name: dep.Name,
		namespace: dep.Namespace,
		resourceKind: 'deployment',
		kind: `deployment · ${dep.Namespace}`,
		cluster,
		age: dep.Age,
		action: 'Diagnose',
	}
}

export function deriveIssues(snapshots: ClusterSnapshot[], now = Date.now()): Issue[] {
	const issues: { issue: Issue; createdAt: number }[] = []
	for (const snap of snapshots) {
		if (!snap.ok) {
			continue
		}
		for (const pod of snap.pods) {
			const issue = podIssue(pod, snap.info.Name, now)
			if (issue) {
				issues.push({ issue, createdAt: pod.CreatedAt })
			}
		}
		for (const dep of snap.deployments) {
			const issue = deploymentIssue(dep, snap.info.Name)
			if (issue) {
				issues.push({ issue, createdAt: dep.CreatedAt })
			}
		}
	}
	issues.sort((a, b) => {
		const severity = (t: Issue['reasonTone']) => (t === 'err' ? 0 : 1)
		return severity(a.issue.reasonTone) - severity(b.issue.reasonTone) || b.createdAt - a.createdAt
	})
	return issues.slice(0, MAX_ISSUES).map((e) => e.issue)
}

export function issuesBreakdown(issues: Issue[]): string {
	if (!issues.length) {
		return 'none'
	}
	const critical = issues.filter((i) => i.reasonTone === 'err').length
	const warning = issues.length - critical
	const parts: string[] = []
	if (critical) {
		parts.push(`${critical} critical`)
	}
	if (warning) {
		parts.push(`${warning} warning`)
	}
	return parts.join(' · ')
}

export async function fetchIssues(): Promise<Issue[]> {
	if (!hasWailsRuntime()) {
		await delay()
		return issues
	}
	return deriveIssues(await scanClusters())
}

