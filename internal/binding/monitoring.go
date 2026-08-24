package binding

import (
	"Kubexplorer/internal/apperr"
	"Kubexplorer/internal/k8s"
	"Kubexplorer/internal/model"
	"Kubexplorer/internal/usecase"
)

type Monitoring struct {
	app        *App
	monitoring usecase.MonitoringUseCase
}

func BuildMonitoring(app *App, manager *k8s.ClusterManager, sampler *usecase.MetricSampler) *Monitoring {
	return &Monitoring{
		app: app,
		monitoring: usecase.NewMonitoringUseCase(
			k8s.NewNode(manager),
			k8s.NewPod(manager),
			k8s.NewMetric(manager),
			k8s.NewEvent(manager),
			sampler,
		),
	}
}

func (m *Monitoring) GetMonitoring(clusterCtx string, rng string) (model.MonitoringSnapshotDto, error) {
	ctx, cancel := m.app.requestContext()
	defer cancel()

	snapshot, err := m.monitoring.GetMonitoring(ctx, clusterCtx, rng)
	return snapshot, apperr.Normalize(err)
}
