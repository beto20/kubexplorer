package usecase

import (
	"Kubexplorer/internal/model"
	"context"
)

type PodUseCase interface {
	GetPods(ctx context.Context, clusterCtx string) ([]model.PodDto, error)
	GetPod(ctx context.Context, ref model.ResourceRef) (model.PodDto, error)
	UpdatePod(ctx context.Context, ref model.ResourceRef, dto model.PodUpdate) error
	RestartPod(ctx context.Context, ref model.ResourceRef) error
}

type podUseCase struct {
	client PodClient
}

func NewPodUseCase(client PodClient) PodUseCase {
	return &podUseCase{client: client}
}

func (p *podUseCase) GetPods(ctx context.Context, clusterCtx string) ([]model.PodDto, error) {
	return p.client.GetPods(ctx, clusterCtx)
}

func (p *podUseCase) GetPod(ctx context.Context, ref model.ResourceRef) (model.PodDto, error) {
	return p.client.GetPod(ctx, ref)
}

func (p *podUseCase) UpdatePod(ctx context.Context, ref model.ResourceRef, dto model.PodUpdate) error {
	return p.client.UpdatePod(ctx, ref, dto)
}

func (p *podUseCase) RestartPod(ctx context.Context, ref model.ResourceRef) error {
	return p.client.DeletePod(ctx, ref)
}
