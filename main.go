package main

import (
	"Kubexplorer/internal/binding"
	"Kubexplorer/internal/k8s"
	"Kubexplorer/internal/usecase"
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

const (
	PROGRAM_NAME = "Tider"
	WIDTH        = 1024
	HEIGHT       = 768
)

func main() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelInfo})))

	app := binding.NewApp()
	manager := k8s.NewClusterManager()

	sampler := usecase.NewMetricSampler(k8s.NewNode(manager), k8s.NewMetric(manager))
	samplerCtx, stopSampler := context.WithCancel(context.Background())

	err := wails.Run(&options.App{
		Title:  PROGRAM_NAME,
		Width:  WIDTH,
		Height: HEIGHT,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.Startup(ctx)
			go sampler.Run(samplerCtx)
		},
		OnShutdown: func(ctx context.Context) {
			stopSampler()
			app.Shutdown(ctx)
		},
		Bind: []interface{}{
			app,
			binding.BuildEnvironment(app, manager),
			binding.BuildGeneral(app, manager),
			binding.BuildMonitoring(app, manager, sampler),
			binding.BuildNetwork(app, manager),
			binding.BuildStorage(app, manager),
			binding.BuildWorkload(app, manager),
		},
	})
	if err != nil {
		slog.Error("wails run failed", "error", err)
	}
}
