package model

type MonitoringSnapshotDto struct {
	KPIs             []MetricKpiDto
	NodeUsage        []NodeUsageDto
	PodPhase         PodPhaseDto
	Events           []ClusterEventDto
	Trend            []TrendPointDto
	MetricsAvailable bool
}

type MetricKpiDto struct {
	Label string
	Value string
	Unit  string
	Pct   int
	Hint  string
}

type NodeUsageDto struct {
	Name   string
	CPUPct int
	MemPct int
	Pods   int
	Status string
	Ready  bool
}

type PodPhaseDto struct {
	Running int
	Pending int
	Failed  int
}

type ClusterEventDto struct {
	Kind      string
	Title     string
	Detail    string
	Age       string
	CreatedAt int64
}

type TrendPointDto struct {
	T   int64
	CPU int
	Mem int
}
