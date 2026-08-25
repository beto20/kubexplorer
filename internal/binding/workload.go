package binding

import (
	"Kubexplorer/internal/apperr"
	"Kubexplorer/internal/k8s"
	"Kubexplorer/internal/model"
	"Kubexplorer/internal/usecase"
)

type Workload struct {
	app          *App
	pod          usecase.PodUseCase
	deployment   usecase.DeploymentUseCase
	resource     usecase.ResourceUseCase
	troubleshoot usecase.TroubleshootUseCase
}

// BuildWorkload wires the workload dependency chain (k8s clients -> use cases -> binding).
func BuildWorkload(app *App, manager *k8s.ClusterManager) *Workload {
	podClient := k8s.NewPod(manager)
	deploymentClient := k8s.NewDeployment(manager)
	jobClient := k8s.NewJob(manager)
	nodeClient := k8s.NewNode(manager)
	metricClient := k8s.NewMetric(manager)

	return &Workload{
		app:          app,
		pod:          usecase.NewPodUseCase(podClient),
		deployment:   usecase.NewDeploymentUseCase(deploymentClient),
		resource:     usecase.NewResourceUseCase(deploymentClient, metricClient),
		troubleshoot: usecase.NewTroubleshootUseCase(podClient, deploymentClient, jobClient, nodeClient),
	}
}

func (w *Workload) GetPods(clusterCtx string) ([]model.PodDto, error) {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	pods, err := w.pod.GetPods(ctx, clusterCtx)
	return pods, apperr.Normalize(err)
}

func (w *Workload) GetPod(name string, namespace string, clusterCtx string) (model.PodDto, error) {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	pod, err := w.pod.GetPod(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name})
	return pod, apperr.Normalize(err)
}

func (w *Workload) UpdatePod(name string, namespace string, dto model.PodUpdate, clusterCtx string) error {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	return apperr.Normalize(w.pod.UpdatePod(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name}, dto))
}

func (w *Workload) RestartPod(name string, namespace string, clusterCtx string) error {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	return apperr.Normalize(w.pod.RestartPod(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name}))
}

func (w *Workload) GetDeployments(clusterCtx string) ([]model.DeploymentDto, error) {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	deployments, err := w.deployment.GetDeployments(ctx, clusterCtx)
	return deployments, apperr.Normalize(err)
}

func (w *Workload) GetDeployment(name string, namespace string, clusterCtx string) (model.DeploymentDto, error) {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	deployment, err := w.deployment.GetDeployment(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name})
	return deployment, apperr.Normalize(err)
}

func (w *Workload) UpdateDeployment(name string, namespace string, dto model.DeploymentUpdate, clusterCtx string) error {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	return apperr.Normalize(w.deployment.UpdateDeployment(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name}, dto))
}

func (w *Workload) DeleteDeployment(name string, namespace string, clusterCtx string) error {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	return apperr.Normalize(w.deployment.DeleteDeployment(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name}))
}

func (w *Workload) ResourceTuning(namespace string, clusterCtx string) ([]model.TuningRecommendation, error) {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	recommendations, err := w.resource.ResourceTuning(ctx, clusterCtx, namespace)
	return recommendations, apperr.Normalize(err)
}

func (w *Workload) AutoTroubleshoot(name string, namespace string, clusterCtx string, resource string) model.Troubleshoot {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	return w.troubleshoot.Analyse(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name}, resource)
}

func (w *Workload) ExportManifest(name string, namespace string, clusterCtx string) ([]byte, error) {
	ctx, cancel := w.app.requestContext()
	defer cancel()

	data, err := w.deployment.ExportManifest(ctx, model.ResourceRef{Cluster: clusterCtx, Namespace: namespace, Name: name})
	return data, apperr.Normalize(err)
}
