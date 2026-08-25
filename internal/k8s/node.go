package k8s

import (
	"Kubexplorer/internal/model"
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func nodeReady(node corev1.Node) bool {
	for _, c := range node.Status.Conditions {
		if c.Type == corev1.NodeReady {
			return c.Status == corev1.ConditionTrue
		}
	}
	return false
}

func nodeAllocatable(node corev1.Node) model.Resource {
	return model.Resource{
		Cpu:    node.Status.Allocatable.Cpu().MilliValue(),
		Memory: node.Status.Allocatable.Memory().ScaledValue(resource.Mega),
	}
}

type NodeClient struct {
	manager ClusterResolver
}

func NewNode(manager ClusterResolver) *NodeClient {
	return &NodeClient{manager: manager}
}

func (n *NodeClient) GetNodes(ctx context.Context, clusterCtx string) ([]model.NodeDto, error) {
	client, err := n.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return nil, fmt.Errorf("kubeclient: error resolving cluster context: %v", err)
	}

	nodes, err := client.CoreV1().Nodes().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("listing nodes: %w", err)
	}

	var result []model.NodeDto

	for _, node := range nodes.Items {
		dto := model.NodeDto{
			Name: node.Name,
			Resource: model.Resource{
				Cpu:     node.Status.Capacity.Cpu().Value(),
				Memory:  node.Status.Capacity.Memory().ScaledValue(resource.Giga),
				Storage: node.Status.Capacity.StorageEphemeral().ScaledValue(resource.Giga),
			},
			Allocatable:     nodeAllocatable(node),
			Ready:           nodeReady(node),
			KubeletVersion:  node.Status.NodeInfo.KubeletVersion,
			OperatingSystem: node.Status.NodeInfo.OperatingSystem,
			Version:         node.ResourceVersion,
			Age:             model.FormatAge(node.CreationTimestamp.Time),
			CreatedAt:       node.CreationTimestamp.Unix(),
			Labels:          node.Labels,
		}

		result = append(result, dto)
	}

	return result, nil
}

func (n *NodeClient) GetNodeObject(ctx context.Context, ref model.ResourceRef) (*corev1.Node, error) {
	client, err := n.manager.ResolveClusterContext(ref.Cluster)
	if err != nil {
		return nil, fmt.Errorf("kubeclient: error resolving cluster context: %v", err)
	}

	node, err := client.CoreV1().Nodes().Get(ctx, ref.Name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("getting node %s: %w", ref.Name, err)
	}
	return node, nil
}

func (n *NodeClient) GetNode(ctx context.Context, ref model.ResourceRef) (model.NodeDto, error) {
	name, clusterCtx := ref.Name, ref.Cluster
	client, err := n.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return model.NodeDto{}, fmt.Errorf("kubeclient: error resolving cluster context: %v", err)
	}

	node, err := client.CoreV1().Nodes().Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return model.NodeDto{}, fmt.Errorf("getting node %s: %w", name, err)
	}

	return model.NodeDto{
		Name: node.Name,
		Resource: model.Resource{
			Cpu:     node.Status.Capacity.Cpu().Value(),
			Memory:  node.Status.Capacity.Memory().ScaledValue(resource.Giga),
			Storage: node.Status.Capacity.StorageEphemeral().ScaledValue(resource.Giga),
		},
		Allocatable: nodeAllocatable(*node),
		Ready:       nodeReady(*node),
		Version:     node.ResourceVersion,
		Age:         model.FormatAge(node.CreationTimestamp.Time),
		CreatedAt:   node.CreationTimestamp.Unix(),
		Labels:      node.Labels,
	}, nil
}
