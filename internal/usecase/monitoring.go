package usecase

import (
	"Kubexplorer/internal/model"
	"context"
	"fmt"

	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
)

const eventFeedLimit = 20

type MonitoringUseCase interface {
	GetMonitoring(ctx context.Context, clusterCtx string, rng string) (model.MonitoringSnapshotDto, error)
}

type monitoringUseCase struct {
	node    NodeClient
	pod     PodClient
	metric  MetricClient
	event   EventClient
	sampler *MetricSampler
}

func NewMonitoringUseCase(node NodeClient, pod PodClient, metric MetricClient, event EventClient, sampler *MetricSampler) MonitoringUseCase {
	return &monitoringUseCase{node: node, pod: pod, metric: metric, event: event, sampler: sampler}
}

func (m *monitoringUseCase) GetMonitoring(ctx context.Context, clusterCtx string, rng string) (model.MonitoringSnapshotDto, error) {
	nodes, err := m.node.GetNodes(ctx, clusterCtx)
	if err != nil {
		return model.MonitoringSnapshotDto{}, fmt.Errorf("getting nodes: %w", err)
	}

	pods, err := m.pod.GetPods(ctx, clusterCtx)
	if err != nil {
		return model.MonitoringSnapshotDto{}, fmt.Errorf("getting pods: %w", err)
	}

	usageByNode := map[string]nodeUsage{}
	metricsAvailable := false
	if metrics, mErr := m.metric.GetNodeMetrics(ctx, clusterCtx); mErr == nil && metrics != nil {
		metricsAvailable = true
		usageByNode = nodeUsageMap(metrics)
	}

	events, evErr := m.event.GetEvents(ctx, clusterCtx, eventFeedLimit)
	if evErr != nil {
		events = nil
	}

	var trend []model.TrendPointDto
	if m.sampler != nil {
		m.sampler.Track(clusterCtx)
		if metricsAvailable {
			cpu, mem := clusterUtilisation(nodes, usageByNode)
			m.sampler.Seed(clusterCtx, cpu, mem)
		}
		trend = m.sampler.Trend(clusterCtx, pointsForRange(rng))
	}

	phase := buildPodPhase(pods)
	return model.MonitoringSnapshotDto{
		KPIs:             buildMonitoringKpis(nodes, usageByNode, phase, len(pods), metricsAvailable),
		NodeUsage:        buildNodeUsage(nodes, pods, usageByNode, metricsAvailable),
		PodPhase:         phase,
		Events:           events,
		Trend:            trend,
		MetricsAvailable: metricsAvailable,
	}, nil
}

func pointsForRange(rng string) int {
	switch rng {
	case "Last 6h":
		return 6 * 120
	case "Last 24h":
		return 24 * 120
	default: // "Last 1h" and anything unrecognised
		return 120
	}
}

type nodeUsage struct {
	cpuMilli int64
	memMega  int64
}

func nodeUsageMap(metrics *v1beta1.NodeMetricsList) map[string]nodeUsage {
	usage := make(map[string]nodeUsage, len(metrics.Items))
	for _, item := range metrics.Items {
		usage[item.Name] = nodeUsage{
			cpuMilli: item.Usage.Cpu().MilliValue(),
			memMega:  item.Usage.Memory().ScaledValue(resource.Mega),
		}
	}
	return usage
}

func clusterUtilisation(nodes []model.NodeDto, usage map[string]nodeUsage) (cpu, mem int) {
	var usedCPU, capCPU, usedMem, capMem int64
	for _, n := range nodes {
		capCPU += n.Allocatable.Cpu
		capMem += n.Allocatable.Memory
		if u, ok := usage[n.Name]; ok {
			usedCPU += u.cpuMilli
			usedMem += u.memMega
		}
	}
	return pct(usedCPU, capCPU), pct(usedMem, capMem)
}

func buildPodPhase(pods []model.PodDto) model.PodPhaseDto {
	phase := model.PodPhaseDto{}
	for _, p := range pods {
		switch p.Status {
		case "Running", "Succeeded":
			phase.Running++
		case "Pending":
			phase.Pending++
		case "Failed", "Unknown":
			phase.Failed++
		}
	}
	return phase
}

func pct(used, capacity int64) int {
	if capacity <= 0 {
		return -1
	}
	p := int((used*100 + capacity/2) / capacity)
	if p > 100 {
		return 100
	}
	if p < 0 {
		return 0
	}
	return p
}

func nodeStatus(ready bool, worstPct int) string {
	if !ready {
		return "NotReady"
	}
	if worstPct >= 90 {
		return "Pressure"
	}
	return "Ready"
}

func buildNodeUsage(nodes []model.NodeDto, pods []model.PodDto, usage map[string]nodeUsage, metricsAvailable bool) []model.NodeUsageDto {
	podsPerNode := map[string]int{}
	for _, p := range pods {
		podsPerNode[p.Node]++
	}

	rows := make([]model.NodeUsageDto, 0, len(nodes))
	for _, n := range nodes {
		cpuPct, memPct := -1, -1
		if metricsAvailable {
			if u, ok := usage[n.Name]; ok {
				cpuPct = pct(u.cpuMilli, n.Allocatable.Cpu)
				memPct = pct(u.memMega, n.Allocatable.Memory)
			}
		}
		worst := max(cpuPct, memPct)
		rows = append(rows, model.NodeUsageDto{
			Name:   n.Name,
			CPUPct: cpuPct,
			MemPct: memPct,
			Pods:   podsPerNode[n.Name],
			Status: nodeStatus(n.Ready, worst),
			Ready:  n.Ready,
		})
	}
	return rows
}

func buildMonitoringKpis(nodes []model.NodeDto, usage map[string]nodeUsage, phase model.PodPhaseDto, totalPods int, metricsAvailable bool) []model.MetricKpiDto {
	cpuPct, memPct := -1, -1
	if metricsAvailable {
		cpuPct, memPct = clusterUtilisation(nodes, usage)
	}

	podsHint := "all healthy"
	if phase.Pending > 0 || phase.Failed > 0 {
		podsHint = fmt.Sprintf("%d pending · %d failed", phase.Pending, phase.Failed)
	}

	return []model.MetricKpiDto{
		utilKpi("CPU utilisation", cpuPct),
		utilKpi("Memory utilisation", memPct),
		{Label: "Pods running", Value: fmt.Sprintf("%d", phase.Running), Unit: fmt.Sprintf("/ %d", totalPods), Pct: -1, Hint: podsHint},
		{Label: "Network I/O", Value: "—", Pct: -1, Hint: "not available"},
	}
}

func utilKpi(label string, p int) model.MetricKpiDto {
	if p < 0 {
		return model.MetricKpiDto{Label: label, Value: "—", Pct: -1, Hint: "needs metrics-server"}
	}
	return model.MetricKpiDto{Label: label, Value: fmt.Sprintf("%d", p), Unit: "%", Pct: p}
}
