package usecase

import (
	"Kubexplorer/internal/model"
	"context"
	"fmt"
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
)

type ResourceUseCase interface {
	// TODO: ResourceTuning compares observed usage against configured limits and returns suggested limit changes.
	ResourceTuning(ctx context.Context, clusterCtx string, namespace string) ([]model.TuningRecommendation, error)
}

type resourceUseCase struct {
	deployment DeploymentClient
	metric     MetricClient
}

func NewResourceUseCase(deployment DeploymentClient, metric MetricClient) ResourceUseCase {
	return &resourceUseCase{deployment: deployment, metric: metric}
}

func (r *resourceUseCase) ResourceTuning(ctx context.Context, clusterCtx string, namespace string) ([]model.TuningRecommendation, error) {
	metrics, err := r.metric.GetPodMetrics(ctx, clusterCtx, namespace)
	if err != nil {
		return nil, fmt.Errorf("getting pod metrics: %w", err)
	}

	var recommendations []model.TuningRecommendation
	seen := map[string]bool{}

	for _, metric := range metrics.Items {
		deploymentName := metric.Labels["app"]
		if deploymentName == "" || seen[deploymentName] {
			continue
		}
		seen[deploymentName] = true

		ref := model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: deploymentName}
		deployment, err := r.deployment.GetDeployment(ctx, ref)
		if err != nil {
			return nil, fmt.Errorf("getting deployment %q: %w", deploymentName, err)
		}

		for _, container := range deployment.Containers {
			usage, ok := containerUsage(metric.Containers, container.Name)
			if !ok {
				continue
			}

			suggested := model.Resource{
				Cpu:    tuneValue(container.Limit.Cpu, usage.Cpu),
				Memory: tuneValue(container.Limit.Memory, usage.Memory),
			}

			if suggested == container.Limit {
				continue
			}

			recommendations = append(recommendations, model.TuningRecommendation{
				Deployment:     deploymentName,
				Namespace:      namespace,
				Container:      container.Name,
				CurrentLimit:   container.Limit,
				Usage:          usage,
				SuggestedLimit: suggested,
			})
		}
	}

	return recommendations, nil
}

// containerUsage finds the observed usage for a named container in a pod's metrics.
func containerUsage(containers []v1beta1.ContainerMetrics, name string) (model.Resource, bool) {
	for _, c := range containers {
		if c.Name == name {
			return model.Resource{
				Cpu:    c.Usage.Cpu().MilliValue(),
				Memory: c.Usage.Memory().ScaledValue(resource.Mega),
			}, true
		}
	}
	return model.Resource{}, false
}

// tuneValue returns a new resource limit derived from how close current
// usage is to the existing limit: grow the limit under pressure, shrink
// it when mostly idle, keep it otherwise.
func tuneValue(limit int64, current int64) int64 {
	ninetyPercent := (limit * 90) / 100
	eightyPercent := (limit * 80) / 100
	thirtyPercent := (limit * 30) / 100

	switch {
	case current > ninetyPercent:
		return limit + (limit*50)/100
	case current >= eightyPercent:
		return limit + (limit*30)/100
	case current < thirtyPercent:
		return limit - (limit*50)/100
	default:
		return limit
	}
}
