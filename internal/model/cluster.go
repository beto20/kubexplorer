package model

type ClusterInfo struct {
	Name      string
	Cluster   string
	Server    string
	User      string
	Namespace string
	Status    bool
	Source    string
}

type ClusterProfile struct {
	ContextName    string
	KubeConfigPath string
}

type EnvironmentDto struct {
	Name        string
	Description string
	Env         string
	Status      bool
}

type NodeDto struct {
	Name            string
	Resource        Resource
	Allocatable     Resource
	Ready           bool
	KubeletVersion  string
	OperatingSystem string
	Version         string
	Age             string
	CreatedAt       int64
	Labels          map[string]string
}
