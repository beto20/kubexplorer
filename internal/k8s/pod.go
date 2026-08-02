package k8s

import (
	"Kubexplorer/internal/model"
	"context"
	"fmt"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type PodClient struct {
	manager ClusterResolver
}

func NewPod(manager ClusterResolver) *PodClient {
	return &PodClient{
		manager: manager,
	}
}

func (p *PodClient) GetPods(ctx context.Context, clusterCtx string) ([]model.PodDto, error) {
	client, err := p.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return nil, fmt.Errorf("cluster %s is not registered", clusterCtx)
	}

	pods, err := client.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("listing pods: %w", err)
	}

	var podArray []model.PodDto

	for _, pod := range pods.Items {
		dto := model.PodDto{
			Name:       pod.Name,
			Namespace:  pod.Namespace,
			Containers: containersInfo(pod.Spec.Containers),
			Node:       pod.Spec.NodeName,
			Status:     string(pod.Status.Phase),
			Age:        model.FormatAge(pod.CreationTimestamp.Time),
			CreatedAt:  pod.CreationTimestamp.Unix(),
			Labels:     pod.Labels,
		}

		fmt.Println("pods:: ", pod.Name)
		podArray = append(podArray, dto)
	}

	return podArray, nil
}

func (p *PodClient) GetPodObject(ctx context.Context, ref model.ResourceRef) (*v1.Pod, error) {
	name, namespace, clusterCtx := ref.Name, ref.Namespace, ref.Cluster
	client, err := p.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return nil, fmt.Errorf("cluster %s is not registered", clusterCtx)
	}

	pod, err := client.CoreV1().Pods(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("getting pod %s/%s: %w", namespace, name, err)
	}

	return pod, nil
}

func (p *PodClient) GetPod(ctx context.Context, ref model.ResourceRef) (model.PodDto, error) {
	name, namespace, clusterCtx := ref.Name, ref.Namespace, ref.Cluster
	client, err := p.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return model.PodDto{}, fmt.Errorf("cluster %s is not registered", clusterCtx)
	}

	pod, err := client.CoreV1().Pods(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return model.PodDto{}, fmt.Errorf("getting pod %s/%s: %w", namespace, name, err)
	}

	dto := model.PodDto{
		Name:       pod.Name,
		Namespace:  pod.Namespace,
		Containers: containersInfo(pod.Spec.Containers),
		Status:     string(pod.Status.Phase),
		Age:        model.FormatAge(pod.CreationTimestamp.Time),
		CreatedAt:  pod.CreationTimestamp.Unix(),
		Editable:   []string{"name", "namespace", "image", "pullPolicy", "port", "RMemory", "RCpu", "LMemory", "LCpu"},
	}

	return dto, nil
}

func containersInfo(containers []v1.Container) []model.Container {
	result := make([]model.Container, 0, len(containers))

	for _, c := range containers {
		var port int32
		if len(c.Ports) > 0 {
			port = c.Ports[len(c.Ports)-1].ContainerPort
		}

		result = append(result, model.Container{
			Name:       c.Name,
			Image:      c.Image,
			PullPolicy: string(c.ImagePullPolicy),
			Port:       port,
			Limit: model.Resource{
				Cpu:    c.Resources.Limits.Cpu().MilliValue(),
				Memory: c.Resources.Limits.Memory().ScaledValue(resource.Mega),
			},
			Request: model.Resource{
				Cpu:    c.Resources.Requests.Cpu().MilliValue(),
				Memory: c.Resources.Requests.Memory().ScaledValue(resource.Mega),
			},
		})
	}

	return result
}

func (p *PodClient) UpdatePod(ctx context.Context, ref model.ResourceRef, dto model.PodUpdate) error {
	name, namespace, clusterCtx := ref.Name, ref.Namespace, ref.Cluster
	client, err := p.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return fmt.Errorf("cluster %s is not registered", clusterCtx)
	}

	c := client.CoreV1().Pods(namespace)

	pod, err := c.Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("getting pod %s/%s: %w", namespace, name, err)
	}

	if len(pod.Spec.Containers) == 0 {
		return fmt.Errorf("pod %s/%s has no containers", namespace, name)
	}

	if pod.Labels == nil {
		pod.Labels = map[string]string{}
	}
	pod.Labels["app"] = dto.App
	pod.Spec.Containers[0].Image = dto.Container.Image

	_, err = c.Update(ctx, pod, metav1.UpdateOptions{})

	return err
}

func (p *PodClient) DeletePod(ctx context.Context, ref model.ResourceRef) error {
	name, namespace, clusterCtx := ref.Name, ref.Namespace, ref.Cluster
	client, err := p.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return fmt.Errorf("cluster %s is not registered", clusterCtx)
	}

	return client.CoreV1().Pods(namespace).Delete(ctx, name, metav1.DeleteOptions{})
}
