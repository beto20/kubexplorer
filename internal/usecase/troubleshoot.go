package usecase

import (
	"Kubexplorer/internal/model"
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
)

type SourceObject string

const (
	Pod        SourceObject = "POD"
	Job        SourceObject = "JOB"
	Deployment SourceObject = "DEPLOYMENT"
	Node       SourceObject = "NODE"
)

const (
	severityCritical = "critical"
	severityWarning  = "warning"
	severityInfo     = "info"
	severityOK       = "ok"
)

type diagInfo struct {
	meaning        string
	recommendation string
	severity       string
}

type WellKnownPodError string
type WellKnownDeploymentError string
type WellKnownJobError string
type WellKnownNodeError string

const (
	// Pod-level
	CrashLoopBackOff           WellKnownPodError = "CrashLoopBackOff"
	OOMKilled                  WellKnownPodError = "OOMKilled"
	ImagePullBackOff           WellKnownPodError = "ImagePullBackOff"
	ErrImagePull               WellKnownPodError = "ErrImagePull"
	CreateContainerConfigError WellKnownPodError = "CreateContainerConfigError"
	ContainerCannotRun         WellKnownPodError = "ContainerCannotRun"
	Unschedulable              WellKnownPodError = "Unschedulable"
	Evicted                    WellKnownPodError = "Evicted"
	NodeLost                   WellKnownPodError = "NodeLost"
	Completed                  WellKnownPodError = "Completed"
	Pending                    WellKnownPodError = "Pending"
	Terminating                WellKnownPodError = "Terminating"

	// Deployment-level
	UnavailableReplicas        WellKnownDeploymentError = "UnavailableReplicas"
	MinimumReplicasUnavailable WellKnownDeploymentError = "MinimumReplicasUnavailable"
	ProgressDeadlineExceeded   WellKnownDeploymentError = "ProgressDeadlineExceeded"

	// Job-level
	DeadlineExceeded     WellKnownJobError = "DeadlineExceeded"
	BackoffLimitExceeded WellKnownJobError = "BackoffLimitExceeded"

	// Node-level
	NodeNotReady           WellKnownNodeError = "NotReady"
	NodeMemoryPressure     WellKnownNodeError = "MemoryPressure"
	NodeDiskPressure       WellKnownNodeError = "DiskPressure"
	NodePIDPressure        WellKnownNodeError = "PIDPressure"
	NodeSchedulingDisabled WellKnownNodeError = "SchedulingDisabled"
)

var podDiagnoses = map[WellKnownPodError]diagInfo{
	CrashLoopBackOff:           {"The container keeps crashing shortly after starting, so Kubernetes is backing off restarts.", "Check the container logs and verify the entrypoint, configuration, and dependencies.", severityCritical},
	OOMKilled:                  {"The container exceeded its memory limit and was killed (exit 137).", "Raise the memory limit/request, or reduce the application's memory use.", severityCritical},
	ImagePullBackOff:           {"Kubernetes repeatedly failed to pull the container image and is backing off.", "Verify the image name and tag, and the registry credentials and network.", severityCritical},
	ErrImagePull:               {"The container image could not be pulled.", "Confirm the image exists and that the registry is reachable.", severityCritical},
	CreateContainerConfigError: {"The container configuration is invalid (env, secret, or volume reference).", "Review the environment variables, referenced secrets/configmaps, and volume mounts.", severityCritical},
	ContainerCannotRun:         {"The container process failed to start.", "Check the entrypoint, file permissions, and binary compatibility.", severityCritical},
	Unschedulable:              {"The pod cannot be scheduled onto any node.", "Check resource requests, node selectors, taints, and affinity rules.", severityWarning},
	Evicted:                    {"The pod was evicted due to node resource pressure.", "Lower requests/limits or add cluster capacity.", severityWarning},
	NodeLost:                   {"The node hosting this pod is unreachable.", "Check node health and networking; the pod may be rescheduled.", severityWarning},
	Completed:                  {"The pod finished execution successfully.", "No action needed unless it was expected to keep running.", severityInfo},
	Pending:                    {"The pod is stuck in Pending and has not been scheduled or started.", "Check scheduling, resource availability, and PVC binding.", severityWarning},
	Terminating:                {"The pod is stuck in Terminating.", "Check for finalizers and stuck volumes; force-delete if it persists.", severityWarning},
}

var deploymentDiagnoses = map[WellKnownDeploymentError]diagInfo{
	UnavailableReplicas:        {"Fewer replicas are available than desired.", "Inspect the pods for errors, resource limits, or scheduling constraints.", severityCritical},
	MinimumReplicasUnavailable: {"The deployment is below its minimum available replicas.", "Scale the cluster or adjust replica and resource settings.", severityWarning},
	ProgressDeadlineExceeded:   {"The rollout stalled and exceeded its progress deadline.", "Check pod logs and events, and the readiness/liveness probes.", severityCritical},
}

var jobDiagnoses = map[WellKnownJobError]diagInfo{
	DeadlineExceeded:     {"The Job exceeded its active deadline.", "Increase .spec.activeDeadlineSeconds or optimize the workload.", severityWarning},
	BackoffLimitExceeded: {"The Job failed after exhausting its retry backoff limit.", "Inspect the pod logs and fix the underlying failure.", severityCritical},
}

var nodeDiagnoses = map[WellKnownNodeError]diagInfo{
	NodeNotReady:           {"The node is NotReady and is not accepting workloads.", "Check kubelet health and node networking; cordon & drain if it persists.", severityCritical},
	NodeMemoryPressure:     {"The node is under memory pressure.", "Reduce memory usage or add capacity; pods may be evicted.", severityWarning},
	NodeDiskPressure:       {"The node is under disk pressure.", "Free disk space or add capacity; image garbage collection may trigger.", severityWarning},
	NodePIDPressure:        {"The node is under PID pressure.", "Reduce the process count or investigate runaway processes.", severityWarning},
	NodeSchedulingDisabled: {"The node is cordoned (SchedulingDisabled).", "Uncordon it when ready, or drain it before maintenance.", severityInfo},
}

type TroubleshootUseCase interface {
	Analyse(ctx context.Context, ref model.ResourceRef, resource string) model.Troubleshoot
}

type troubleshootUseCase struct {
	pod        PodClient
	deployment DeploymentClient
	job        JobClient
	node       NodeClient
}

func NewTroubleshootUseCase(pod PodClient, deployment DeploymentClient, job JobClient, node NodeClient) TroubleshootUseCase {
	return &troubleshootUseCase{pod: pod, deployment: deployment, job: job, node: node}
}

func (d *troubleshootUseCase) Analyse(ctx context.Context, ref model.ResourceRef, resource string) model.Troubleshoot {
	switch resource {
	case string(Pod):
		pod, err := d.pod.GetPodObject(ctx, ref)
		if err != nil {
			return model.Troubleshoot{Meaning: fmt.Sprintf("Error retrieving Pod: %v", err)}
		}
		return CheckPodErrors(*pod)

	case string(Deployment):
		dep, err := d.deployment.GetDeploymentObject(ctx, ref)
		if err != nil {
			return model.Troubleshoot{Meaning: fmt.Sprintf("Error retrieving Deployment: %v", err)}
		}
		return CheckDeploymentErrors(*dep)

	case string(Job):
		job, err := d.job.GetJob(ctx, ref)
		if err != nil {
			return model.Troubleshoot{Meaning: fmt.Sprintf("Error retrieving Job: %v", err)}
		}
		return CheckJobErrors(*job)

	case string(Node):
		node, err := d.node.GetNodeObject(ctx, ref)
		if err != nil {
			return model.Troubleshoot{Meaning: fmt.Sprintf("Error retrieving Node: %v", err)}
		}
		return CheckNodeErrors(*node)

	default:
		return model.Troubleshoot{Meaning: "Unsupported object type"}
	}
}

func result(reason string, d diagInfo, evidence []model.EvidenceItem) model.Troubleshoot {
	return model.Troubleshoot{
		Reason:         reason,
		Severity:       d.severity,
		Meaning:        d.meaning,
		Recommendation: d.recommendation,
		Evidence:       evidence,
	}
}

func CheckPodErrors(pod corev1.Pod) model.Troubleshoot {
	ev := podEvidence(pod)

	// Phase-level
	switch pod.Status.Phase {
	case corev1.PodPending:
		return result(string(Pending), podDiagnoses[Pending], ev)
	case corev1.PodSucceeded:
		return result(string(Completed), podDiagnoses[Completed], ev)
	case corev1.PodFailed:
		return result(string(Terminating), podDiagnoses[Terminating], ev)
	}

	// Conditions
	for _, cond := range pod.Status.Conditions {
		if cond.Type == corev1.PodScheduled && cond.Status == corev1.ConditionFalse {
			return result(string(Unschedulable), podDiagnoses[Unschedulable], ev)
		}
		if cond.Reason == "Evicted" {
			return result(string(Evicted), podDiagnoses[Evicted], ev)
		}
		if cond.Reason == "NodeLost" {
			return result(string(NodeLost), podDiagnoses[NodeLost], ev)
		}
	}

	// Container states
	for _, cs := range pod.Status.ContainerStatuses {
		if cs.State.Waiting != nil {
			if d, ok := podDiagnoses[WellKnownPodError(cs.State.Waiting.Reason)]; ok {
				return result(cs.State.Waiting.Reason, d, ev)
			}
		}
		if cs.State.Terminated != nil {
			if d, ok := podDiagnoses[WellKnownPodError(cs.State.Terminated.Reason)]; ok {
				return result(cs.State.Terminated.Reason, d, ev)
			}
		}
		if cs.LastTerminationState.Terminated != nil {
			if d, ok := podDiagnoses[WellKnownPodError(cs.LastTerminationState.Terminated.Reason)]; ok {
				return result(cs.LastTerminationState.Terminated.Reason, d, ev)
			}
		}
	}

	if pod.Status.Reason != "" {
		if d, ok := podDiagnoses[WellKnownPodError(pod.Status.Reason)]; ok {
			return result(pod.Status.Reason, d, ev)
		}
	}

	return model.Troubleshoot{Severity: severityOK, Meaning: "No known pod errors detected.", Evidence: ev}
}

func podEvidence(pod corev1.Pod) []model.EvidenceItem {
	var ev []model.EvidenceItem
	if pod.Spec.NodeName != "" {
		ev = append(ev, model.EvidenceItem{Label: "Node", Value: pod.Spec.NodeName})
	}

	var restarts int32
	var lastTerm *corev1.ContainerStateTerminated
	for _, cs := range pod.Status.ContainerStatuses {
		restarts += cs.RestartCount
		if cs.LastTerminationState.Terminated != nil {
			lastTerm = cs.LastTerminationState.Terminated
		} else if cs.State.Terminated != nil {
			lastTerm = cs.State.Terminated
		}
	}
	if restarts > 0 {
		ev = append(ev, model.EvidenceItem{Label: "Restarts", Value: fmt.Sprintf("%d", restarts)})
	}
	if lastTerm != nil {
		val := fmt.Sprintf("exit %d", lastTerm.ExitCode)
		if lastTerm.Reason != "" {
			val = fmt.Sprintf("%s (%s)", val, lastTerm.Reason)
		}
		ev = append(ev, model.EvidenceItem{Label: "Last termination", Value: val})
	}
	return ev
}

func CheckDeploymentErrors(dep appsv1.Deployment) model.Troubleshoot {
	ev := deploymentEvidence(dep)

	desired := int32(1)
	if dep.Spec.Replicas != nil {
		desired = *dep.Spec.Replicas
	}

	if dep.Status.AvailableReplicas < desired {
		return result(string(UnavailableReplicas), deploymentDiagnoses[UnavailableReplicas], ev)
	}
	if dep.Status.ReadyReplicas < desired {
		return result(string(MinimumReplicasUnavailable), deploymentDiagnoses[MinimumReplicasUnavailable], ev)
	}
	for _, cond := range dep.Status.Conditions {
		if cond.Type == appsv1.DeploymentProgressing && cond.Reason == "ProgressDeadlineExceeded" {
			return result(string(ProgressDeadlineExceeded), deploymentDiagnoses[ProgressDeadlineExceeded], ev)
		}
	}

	return model.Troubleshoot{Severity: severityOK, Meaning: "No known deployment errors detected.", Evidence: ev}
}

func deploymentEvidence(dep appsv1.Deployment) []model.EvidenceItem {
	desired := int32(1)
	if dep.Spec.Replicas != nil {
		desired = *dep.Spec.Replicas
	}
	return []model.EvidenceItem{
		{Label: "Replicas ready/available/desired", Value: fmt.Sprintf("%d/%d/%d", dep.Status.ReadyReplicas, dep.Status.AvailableReplicas, desired)},
		{Label: "Updated replicas", Value: fmt.Sprintf("%d", dep.Status.UpdatedReplicas)},
	}
}

func CheckJobErrors(job batchv1.Job) model.Troubleshoot {
	ev := jobEvidence(job)

	for _, cond := range job.Status.Conditions {
		if cond.Type == batchv1.JobFailed && cond.Status == corev1.ConditionTrue {
			switch cond.Reason {
			case "BackoffLimitExceeded":
				return result(string(BackoffLimitExceeded), jobDiagnoses[BackoffLimitExceeded], ev)
			case "DeadlineExceeded":
				return result(string(DeadlineExceeded), jobDiagnoses[DeadlineExceeded], ev)
			default:
				return model.Troubleshoot{Reason: cond.Reason, Severity: severityCritical, Meaning: cond.Message, Evidence: ev}
			}
		}
	}

	return model.Troubleshoot{Severity: severityOK, Meaning: "No known job errors detected.", Evidence: ev}
}

func jobEvidence(job batchv1.Job) []model.EvidenceItem {
	return []model.EvidenceItem{
		{Label: "Succeeded", Value: fmt.Sprintf("%d", job.Status.Succeeded)},
		{Label: "Failed", Value: fmt.Sprintf("%d", job.Status.Failed)},
		{Label: "Active", Value: fmt.Sprintf("%d", job.Status.Active)},
	}
}

func CheckNodeErrors(node corev1.Node) model.Troubleshoot {
	ev := nodeEvidence(node)

	ready := true
	memPressure, diskPressure, pidPressure := false, false, false
	for _, c := range node.Status.Conditions {
		switch c.Type {
		case corev1.NodeReady:
			ready = c.Status == corev1.ConditionTrue
		case corev1.NodeMemoryPressure:
			memPressure = c.Status == corev1.ConditionTrue
		case corev1.NodeDiskPressure:
			diskPressure = c.Status == corev1.ConditionTrue
		case corev1.NodePIDPressure:
			pidPressure = c.Status == corev1.ConditionTrue
		}
	}

	switch {
	case !ready:
		return result(string(NodeNotReady), nodeDiagnoses[NodeNotReady], ev)
	case memPressure:
		return result(string(NodeMemoryPressure), nodeDiagnoses[NodeMemoryPressure], ev)
	case diskPressure:
		return result(string(NodeDiskPressure), nodeDiagnoses[NodeDiskPressure], ev)
	case pidPressure:
		return result(string(NodePIDPressure), nodeDiagnoses[NodePIDPressure], ev)
	case node.Spec.Unschedulable:
		return result(string(NodeSchedulingDisabled), nodeDiagnoses[NodeSchedulingDisabled], ev)
	}

	return model.Troubleshoot{Severity: severityOK, Meaning: "No known node errors detected.", Evidence: ev}
}

func nodeEvidence(node corev1.Node) []model.EvidenceItem {
	var ev []model.EvidenceItem
	for _, c := range node.Status.Conditions {
		bad := (c.Type == corev1.NodeReady && c.Status != corev1.ConditionTrue) ||
			(c.Type != corev1.NodeReady && c.Status == corev1.ConditionTrue)
		if bad {
			ev = append(ev, model.EvidenceItem{Label: string(c.Type), Value: string(c.Status)})
		}
	}
	if v := node.Status.NodeInfo.KubeletVersion; v != "" {
		ev = append(ev, model.EvidenceItem{Label: "Kubelet", Value: v})
	}
	return ev
}
