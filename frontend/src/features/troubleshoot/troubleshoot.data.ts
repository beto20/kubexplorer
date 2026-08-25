import { delay } from '@/data/mock-latency'
import { fetchAutoTroubleshoot } from '@/services/workload.service'
import { hasWailsRuntime } from '@/services/runtime'
import type { Issue } from '@/types/issue'
import type { Diagnosis, DiagnosisAction, Severity } from './types'

const RESOURCE_ARG: Record<Issue['resourceKind'], string> = {
	pod: 'POD',
	deployment: 'DEPLOYMENT',
	job: 'JOB',
	node: 'NODE',
}

const VALID_SEVERITIES: Severity[] = ['critical', 'warning', 'info', 'ok']

function toSeverity(raw: string): Severity {
	return (VALID_SEVERITIES as string[]).includes(raw) ? (raw as Severity) : 'info'
}

function defaultActions(issue: Issue): DiagnosisAction[] {
	switch (issue.resourceKind) {
		case 'pod':
			return [
				{ label: 'Restart pod', description: 'Delete the pod; its controller recreates it.', kind: 'restart' },
				{ label: 'View logs', description: 'Open the container logs and last termination.', kind: 'logs' },
			]
		case 'deployment':
			return [
				{ label: 'Roll back', description: 'Revert to the previous healthy revision.', kind: 'rollback' },
				{ label: 'Scale replicas', description: 'Adjust the desired replica count.', kind: 'scale' },
				{ label: 'View logs', description: 'Inspect the rollout events.', kind: 'logs' },
			]
		case 'node':
			return [
				{ label: 'Cordon node', description: 'Mark unschedulable to stop new pods landing here.', kind: 'cordon' },
				{ label: 'Drain node', description: 'Evict pods so the node can be serviced.', kind: 'drain' },
				{ label: 'Inspect node', description: 'Open the node detail and conditions.', kind: 'inspect' },
			]
		case 'job':
			return [
				{ label: 'View logs', description: 'Open the failed pod logs.', kind: 'logs' },
				{ label: 'Inspect', description: 'Open the job detail.', kind: 'inspect' },
			]
		default:
			return [{ label: 'Inspect', description: 'Open the resource detail.', kind: 'inspect' }]
	}
}

// TODO-15: Consume backend.
export async function fetchDiagnosis(issue: Issue): Promise<Diagnosis> {
	if (!hasWailsRuntime()) {
		await delay()
	}
	const result = await fetchAutoTroubleshoot(issue.name, issue.namespace, issue.cluster, RESOURCE_ARG[issue.resourceKind])
	return {
		reason: result.Reason || issue.reason,
		severity: toSeverity(result.Severity),
		meaning: result.Meaning,
		recommendation: result.Recommendation,
		evidence: (result.Evidence ?? []).map((e) => ({ label: e.Label, value: e.Value })),
		actions: defaultActions(issue),
	}
}
