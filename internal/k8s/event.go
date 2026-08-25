package k8s

import (
	"Kubexplorer/internal/model"
	"context"
	"fmt"
	"sort"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type EventClient struct {
	manager ClusterResolver
}

func NewEvent(manager ClusterResolver) *EventClient {
	return &EventClient{manager: manager}
}

var errReasons = map[string]bool{
	"Failed":       true,
	"BackOff":      true,
	"OOMKilling":   true,
	"FailedMount":  true,
	"FailedSync":   true,
	"NodeNotReady": true,
}

func eventKind(e corev1.Event) string {
	if e.Type == corev1.EventTypeWarning {
		if errReasons[e.Reason] {
			return "err"
		}
		return "warn"
	}
	return "info"
}

func eventTime(e corev1.Event) metav1.Time {
	if !e.LastTimestamp.IsZero() {
		return e.LastTimestamp
	}
	if !e.EventTime.IsZero() {
		return metav1.Time{Time: e.EventTime.Time}
	}
	return e.CreationTimestamp
}

func (ev *EventClient) GetEvents(ctx context.Context, clusterCtx string, limit int) ([]model.ClusterEventDto, error) {
	client, err := ev.manager.ResolveClusterContext(clusterCtx)
	if err != nil {
		return nil, fmt.Errorf("kubeclient: error resolving cluster context: %v", err)
	}

	events, err := client.CoreV1().Events("").List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("listing events: %w", err)
	}

	items := events.Items
	sort.Slice(items, func(i, j int) bool {
		return eventTime(items[i]).After(eventTime(items[j]).Time)
	})

	if limit > 0 && len(items) > limit {
		items = items[:limit]
	}

	result := make([]model.ClusterEventDto, 0, len(items))
	for _, e := range items {
		t := eventTime(e)
		result = append(result, model.ClusterEventDto{
			Kind:      eventKind(e),
			Title:     e.Reason,
			Detail:    fmt.Sprintf("%s · %s", e.InvolvedObject.Name, e.InvolvedObject.Namespace),
			Age:       model.FormatAge(t.Time),
			CreatedAt: t.Unix(),
		})
	}

	return result, nil
}
