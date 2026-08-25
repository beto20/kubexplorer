package usecase

import (
	"Kubexplorer/internal/model"
	"context"
	"log/slog"
	"sync"
	"time"
)

const (
	sampleInterval = 30 * time.Second
	maxTrendPoints = (24 * 60 * 60) / 30
)

type MetricSampler struct {
	node     NodeClient
	metric   MetricClient
	interval time.Duration
	maxPts   int

	mu      sync.Mutex
	buffers map[string][]model.TrendPointDto
	tracked map[string]struct{}
}

func NewMetricSampler(node NodeClient, metric MetricClient) *MetricSampler {
	return &MetricSampler{
		node:     node,
		metric:   metric,
		interval: sampleInterval,
		maxPts:   maxTrendPoints,
		buffers:  make(map[string][]model.TrendPointDto),
		tracked:  make(map[string]struct{}),
	}
}

func (s *MetricSampler) Track(clusterCtx string) {
	s.mu.Lock()
	s.tracked[clusterCtx] = struct{}{}
	s.mu.Unlock()
}

func (s *MetricSampler) Seed(clusterCtx string, cpu, mem int) {
	if cpu < 0 || mem < 0 {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	buf := s.buffers[clusterCtx]
	now := time.Now()
	if n := len(buf); n > 0 && now.Sub(time.Unix(buf[n-1].T, 0)) < s.interval {
		return
	}
	buf = append(buf, model.TrendPointDto{T: now.Unix(), CPU: cpu, Mem: mem})
	if len(buf) > s.maxPts {
		buf = buf[len(buf)-s.maxPts:]
	}
	s.buffers[clusterCtx] = buf
}

func (s *MetricSampler) Trend(clusterCtx string, limit int) []model.TrendPointDto {
	s.mu.Lock()
	defer s.mu.Unlock()

	buf := s.buffers[clusterCtx]
	if limit <= 0 || limit >= len(buf) {
		out := make([]model.TrendPointDto, len(buf))
		copy(out, buf)
		return out
	}
	out := make([]model.TrendPointDto, limit)
	copy(out, buf[len(buf)-limit:])
	return out
}

func (s *MetricSampler) append(clusterCtx string, point model.TrendPointDto) {
	s.mu.Lock()
	defer s.mu.Unlock()

	buf := append(s.buffers[clusterCtx], point)
	if len(buf) > s.maxPts {
		buf = buf[len(buf)-s.maxPts:]
	}
	s.buffers[clusterCtx] = buf
}

func (s *MetricSampler) trackedClusters() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]string, 0, len(s.tracked))
	for c := range s.tracked {
		out = append(out, c)
	}
	return out
}

func (s *MetricSampler) sampleOnce(ctx context.Context, clusterCtx string) {
	nodes, err := s.node.GetNodes(ctx, clusterCtx)
	if err != nil {
		slog.Debug("metric sampler: get nodes failed", "cluster", clusterCtx, "error", err)
		return
	}
	metrics, err := s.metric.GetNodeMetrics(ctx, clusterCtx)
	if err != nil || metrics == nil {
		return
	}
	cpu, mem := clusterUtilisation(nodes, nodeUsageMap(metrics))
	if cpu < 0 || mem < 0 {
		return
	}
	s.append(clusterCtx, model.TrendPointDto{T: time.Now().Unix(), CPU: cpu, Mem: mem})
}

func (s *MetricSampler) Run(ctx context.Context) {
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			for _, clusterCtx := range s.trackedClusters() {
				s.sampleOnce(ctx, clusterCtx)
			}
		}
	}
}
