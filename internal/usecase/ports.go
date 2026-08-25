package usecase

// Ports: the interfaces this package needs from the Kubernetes
// infrastructure layer. internal/k8s implements them; main.go wires
// the implementations in. This package must not import internal/k8s.

import (
	"context"

	"Kubexplorer/internal/model"
	v1_apps "k8s.io/api/apps/v1"
	v1_batch "k8s.io/api/batch/v1"
	v1_core "k8s.io/api/core/v1"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
)

type ClusterClient interface {
	ListAvailableClusters(ctx context.Context) ([]model.ClusterInfo, error)
	GetCurrentCluster(ctx context.Context, name string) (model.EnvironmentDto, error)
	GetClusterObjects(ctx context.Context, clusterCtx string) (model.ObjectMapDto, error)
}

type NodeClient interface {
	GetNode(ctx context.Context, ref model.ResourceRef) (model.NodeDto, error)
	GetNodes(ctx context.Context, clusterCtx string) ([]model.NodeDto, error)
	GetNodeObject(ctx context.Context, ref model.ResourceRef) (*v1_core.Node, error)
}

type MetricClient interface {
	GetPodMetrics(ctx context.Context, clusterCtx string, namespace string) (*v1beta1.PodMetricsList, error)
	GetNodeMetrics(ctx context.Context, clusterCtx string) (*v1beta1.NodeMetricsList, error)
}

type EventClient interface {
	GetEvents(ctx context.Context, clusterCtx string, limit int) ([]model.ClusterEventDto, error)
}

type PodClient interface {
	GetPods(ctx context.Context, clusterCtx string) ([]model.PodDto, error)
	GetPod(ctx context.Context, ref model.ResourceRef) (model.PodDto, error)
	GetPodObject(ctx context.Context, ref model.ResourceRef) (*v1_core.Pod, error)
	UpdatePod(ctx context.Context, ref model.ResourceRef, dto model.PodUpdate) error
	DeletePod(ctx context.Context, ref model.ResourceRef) error
}

type JobClient interface {
	GetJob(ctx context.Context, ref model.ResourceRef) (*v1_batch.Job, error)
}

type DeploymentClient interface {
	GetDeployments(ctx context.Context, clusterCtx string) ([]model.DeploymentDto, error)
	GetDeployment(ctx context.Context, ref model.ResourceRef) (model.DeploymentDto, error)
	GetDeploymentObject(ctx context.Context, ref model.ResourceRef) (*v1_apps.Deployment, error)
	UpdateDeployment(ctx context.Context, ref model.ResourceRef, dto model.DeploymentUpdate) error
	DeleteDeployment(ctx context.Context, ref model.ResourceRef) error
	ExportManifest(ctx context.Context, ref model.ResourceRef) ([]byte, error)
}

type StorageClient interface {
	GetPersistentVolumes(ctx context.Context, clusterCtx string) ([]model.PersistentVolumeDto, error)
	GetPersistentVolume(ctx context.Context, ref model.ResourceRef) (model.PersistentVolumeDto, error)
	UpdatePersistentVolume(ctx context.Context, ref model.ResourceRef, dto model.PersistentVolumeDto) error
	DeletePersistentVolume(ctx context.Context, ref model.ResourceRef) error
	GetPersistentVolumesClaim(ctx context.Context, clusterCtx string) ([]model.PersistentVolumeClaimDto, error)
	GetPersistentVolumeClaim(ctx context.Context, ref model.ResourceRef) (model.PersistentVolumeClaimDto, error)
	UpdatePersistentVolumeClaim(ctx context.Context, ref model.ResourceRef, dto model.PersistentVolumeClaimDto) error
	DeletePersistentVolumeClaim(ctx context.Context, ref model.ResourceRef) error
}

type NamespaceClient interface {
	GetNamespaces(ctx context.Context, clusterCtx string) ([]model.NamespaceDto, error)
	GetNamespace(ctx context.Context, ref model.ResourceRef) (model.NamespaceDto, error)
	UpdateNamespace(ctx context.Context, ref model.ResourceRef, dto model.NamespaceDto) error
	DeleteNamespace(ctx context.Context, ref model.ResourceRef) error
	ExportObjects(ctx context.Context, clusterCtx string, namespace string, directory string) error
}

type ServiceClient interface {
	GetServices(ctx context.Context, clusterCtx string) ([]model.ServiceDto, error)
	GetService(ctx context.Context, ref model.ResourceRef) (model.ServiceDto, error)
	UpdateService(ctx context.Context, ref model.ResourceRef, dto model.ServiceUpdate) error
	DeleteService(ctx context.Context, ref model.ResourceRef) error
	ExportManifest(ctx context.Context, ref model.ResourceRef) ([]byte, error)
}

type IngressClient interface {
	GetIngresses(ctx context.Context, clusterCtx string) ([]model.IngressDto, error)
	GetIngress(ctx context.Context, ref model.ResourceRef) (model.IngressDto, error)
	UpdateIngress(ctx context.Context, ref model.ResourceRef, dto model.IngressDto) error
	DeleteIngress(ctx context.Context, ref model.ResourceRef) error
	ExportManifest(ctx context.Context, ref model.ResourceRef) ([]byte, error)
}
