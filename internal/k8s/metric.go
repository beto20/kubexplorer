package k8s

import (
	"context"
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
)

type MetricClient struct {
	manager ClusterResolver
}

func NewMetric(manager ClusterResolver) *MetricClient {
	return &MetricClient{manager: manager}
}
func (m *MetricClient) GetPodMetrics(ctx context.Context, clusterCtx string, namespace string) (*v1beta1.PodMetricsList, error) {
	client, err := m.manager.ResolveClusterMetric(clusterCtx)
	if err != nil {
		return nil, fmt.Errorf("kubeclient: error resolving cluster context: %v", err)
	}

	metrics, err := client.MetricsV1beta1().PodMetricses(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("kubeclient: listing pod metrics in namespace %q: %w", namespace, err)
	}

	return metrics, nil
}

func (m *MetricClient) GetNodeMetrics(ctx context.Context, clusterCtx string) (*v1beta1.NodeMetricsList, error) {
	client, err := m.manager.ResolveClusterMetric(clusterCtx)
	if err != nil {
		return nil, fmt.Errorf("kubeclient: error resolving cluster context: %v", err)
	}

	metrics, err := client.MetricsV1beta1().NodeMetricses().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("kubeclient: listing node metrics: %w", err)
	}

	return metrics, nil
}
