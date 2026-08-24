export namespace model {
	
	export class ClusterEventDto {
	    Kind: string;
	    Title: string;
	    Detail: string;
	    Age: string;
	    CreatedAt: number;
	
	    static createFrom(source: any = {}) {
	        return new ClusterEventDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Kind = source["Kind"];
	        this.Title = source["Title"];
	        this.Detail = source["Detail"];
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	    }
	}
	export class ClusterInfo {
	    Name: string;
	    Cluster: string;
	    Server: string;
	    User: string;
	    Namespace: string;
	    Status: boolean;
	    Source: string;
	
	    static createFrom(source: any = {}) {
	        return new ClusterInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Cluster = source["Cluster"];
	        this.Server = source["Server"];
	        this.User = source["User"];
	        this.Namespace = source["Namespace"];
	        this.Status = source["Status"];
	        this.Source = source["Source"];
	    }
	}
	export class ConfigMap {
	    Name: string;
	    Namespace: string;
	    UsedByPods: string[];
	
	    static createFrom(source: any = {}) {
	        return new ConfigMap(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.UsedByPods = source["UsedByPods"];
	    }
	}
	export class Resource {
	    Cpu: number;
	    Memory: number;
	    Storage: number;
	    StorageEphemeral: number;
	
	    static createFrom(source: any = {}) {
	        return new Resource(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Cpu = source["Cpu"];
	        this.Memory = source["Memory"];
	        this.Storage = source["Storage"];
	        this.StorageEphemeral = source["StorageEphemeral"];
	    }
	}
	export class Container {
	    Name: string;
	    Image: string;
	    PullPolicy: string;
	    Port: number;
	    Limit: Resource;
	    Request: Resource;
	
	    static createFrom(source: any = {}) {
	        return new Container(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Image = source["Image"];
	        this.PullPolicy = source["PullPolicy"];
	        this.Port = source["Port"];
	        this.Limit = this.convertValues(source["Limit"], Resource);
	        this.Request = this.convertValues(source["Request"], Resource);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ResourceUpdate {
	    RMemory: number;
	    RCpu: number;
	    LMemory: number;
	    LCpu: number;
	
	    static createFrom(source: any = {}) {
	        return new ResourceUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.RMemory = source["RMemory"];
	        this.RCpu = source["RCpu"];
	        this.LMemory = source["LMemory"];
	        this.LCpu = source["LCpu"];
	    }
	}
	export class ContainerUpdate {
	    Image: string;
	    PullPolicy: string;
	    Port: string;
	    Resource: ResourceUpdate;
	
	    static createFrom(source: any = {}) {
	        return new ContainerUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Image = source["Image"];
	        this.PullPolicy = source["PullPolicy"];
	        this.Port = source["Port"];
	        this.Resource = this.convertValues(source["Resource"], ResourceUpdate);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CronJob {
	    Name: string;
	    Namespace: string;
	    JobNames: string[];
	
	    static createFrom(source: any = {}) {
	        return new CronJob(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.JobNames = source["JobNames"];
	    }
	}
	export class Deployment {
	    Name: string;
	    Namespace: string;
	    PodNames: string[];
	
	    static createFrom(source: any = {}) {
	        return new Deployment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.PodNames = source["PodNames"];
	    }
	}
	export class DeploymentDto {
	    Name: string;
	    Namespace: string;
	    Containers: Container[];
	    Replicas: number;
	    Status: string;
	    Age: string;
	    CreatedAt: number;
	    Labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new DeploymentDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Containers = this.convertValues(source["Containers"], Container);
	        this.Replicas = source["Replicas"];
	        this.Status = source["Status"];
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Labels = source["Labels"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class LabelUpdate {
	    App: string;
	    Tier: string;
	    TierType: string;
	
	    static createFrom(source: any = {}) {
	        return new LabelUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.App = source["App"];
	        this.Tier = source["Tier"];
	        this.TierType = source["TierType"];
	    }
	}
	export class DeploymentUpdate {
	    Replicas: string;
	    App: string;
	    StrategyType: string;
	    Label: LabelUpdate;
	    Container: ContainerUpdate;
	
	    static createFrom(source: any = {}) {
	        return new DeploymentUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Replicas = source["Replicas"];
	        this.App = source["App"];
	        this.StrategyType = source["StrategyType"];
	        this.Label = this.convertValues(source["Label"], LabelUpdate);
	        this.Container = this.convertValues(source["Container"], ContainerUpdate);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class EnvironmentDto {
	    Name: string;
	    Description: string;
	    Env: string;
	    Status: boolean;
	
	    static createFrom(source: any = {}) {
	        return new EnvironmentDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Description = source["Description"];
	        this.Env = source["Env"];
	        this.Status = source["Status"];
	    }
	}
	export class Host {
	    Path: string;
	    Type: string;
	
	    static createFrom(source: any = {}) {
	        return new Host(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Path = source["Path"];
	        this.Type = source["Type"];
	    }
	}
	export class Ingress {
	    Name: string;
	    Namespace: string;
	    ServiceRefs: string[];
	
	    static createFrom(source: any = {}) {
	        return new Ingress(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.ServiceRefs = source["ServiceRefs"];
	    }
	}
	export class RuleDto {
	    Host: string;
	    Path: string;
	    IngressRuleValue: string;
	
	    static createFrom(source: any = {}) {
	        return new RuleDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Host = source["Host"];
	        this.Path = source["Path"];
	        this.IngressRuleValue = source["IngressRuleValue"];
	    }
	}
	export class IngressDto {
	    Name: string;
	    Namespace: string;
	    Rules: RuleDto[];
	    Age: string;
	    CreatedAt: number;
	    Labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new IngressDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Rules = this.convertValues(source["Rules"], RuleDto);
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Labels = source["Labels"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Job {
	    Name: string;
	    Namespace: string;
	    PodNames: string[];
	    OwnerKind: string;
	    OwnerName: string;
	
	    static createFrom(source: any = {}) {
	        return new Job(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.PodNames = source["PodNames"];
	        this.OwnerKind = source["OwnerKind"];
	        this.OwnerName = source["OwnerName"];
	    }
	}
	
	export class Local {
	    Path: string;
	    FSType: string;
	
	    static createFrom(source: any = {}) {
	        return new Local(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Path = source["Path"];
	        this.FSType = source["FSType"];
	    }
	}
	export class MetricKpiDto {
	    Label: string;
	    Value: string;
	    Unit: string;
	    Pct: number;
	    Hint: string;
	
	    static createFrom(source: any = {}) {
	        return new MetricKpiDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Label = source["Label"];
	        this.Value = source["Value"];
	        this.Unit = source["Unit"];
	        this.Pct = source["Pct"];
	        this.Hint = source["Hint"];
	    }
	}
	export class TrendPointDto {
	    T: number;
	    CPU: number;
	    Mem: number;
	
	    static createFrom(source: any = {}) {
	        return new TrendPointDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.T = source["T"];
	        this.CPU = source["CPU"];
	        this.Mem = source["Mem"];
	    }
	}
	export class PodPhaseDto {
	    Running: number;
	    Pending: number;
	    Failed: number;
	
	    static createFrom(source: any = {}) {
	        return new PodPhaseDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Running = source["Running"];
	        this.Pending = source["Pending"];
	        this.Failed = source["Failed"];
	    }
	}
	export class NodeUsageDto {
	    Name: string;
	    CPUPct: number;
	    MemPct: number;
	    Pods: number;
	    Status: string;
	    Ready: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NodeUsageDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.CPUPct = source["CPUPct"];
	        this.MemPct = source["MemPct"];
	        this.Pods = source["Pods"];
	        this.Status = source["Status"];
	        this.Ready = source["Ready"];
	    }
	}
	export class MonitoringSnapshotDto {
	    KPIs: MetricKpiDto[];
	    NodeUsage: NodeUsageDto[];
	    PodPhase: PodPhaseDto;
	    Events: ClusterEventDto[];
	    Trend: TrendPointDto[];
	    MetricsAvailable: boolean;
	
	    static createFrom(source: any = {}) {
	        return new MonitoringSnapshotDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.KPIs = this.convertValues(source["KPIs"], MetricKpiDto);
	        this.NodeUsage = this.convertValues(source["NodeUsage"], NodeUsageDto);
	        this.PodPhase = this.convertValues(source["PodPhase"], PodPhaseDto);
	        this.Events = this.convertValues(source["Events"], ClusterEventDto);
	        this.Trend = this.convertValues(source["Trend"], TrendPointDto);
	        this.MetricsAvailable = source["MetricsAvailable"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NFS {
	    Path: string;
	    Server: string;
	
	    static createFrom(source: any = {}) {
	        return new NFS(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Path = source["Path"];
	        this.Server = source["Server"];
	    }
	}
	export class Namespace {
	    Name: string;
	    PodNames: string[];
	    ServiceNames: string[];
	
	    static createFrom(source: any = {}) {
	        return new Namespace(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.PodNames = source["PodNames"];
	        this.ServiceNames = source["ServiceNames"];
	    }
	}
	export class NamespaceDto {
	    Name: string;
	    Version: string;
	    Age: string;
	    CreatedAt: number;
	    Labels: Record<string, string>;
	    Status: string;
	
	    static createFrom(source: any = {}) {
	        return new NamespaceDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Version = source["Version"];
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Labels = source["Labels"];
	        this.Status = source["Status"];
	    }
	}
	export class Node {
	    Name: string;
	    PodNames: string[];
	
	    static createFrom(source: any = {}) {
	        return new Node(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.PodNames = source["PodNames"];
	    }
	}
	export class NodeDto {
	    Name: string;
	    Resource: Resource;
	    Allocatable: Resource;
	    Ready: boolean;
	    KubeletVersion: string;
	    OperatingSystem: string;
	    Version: string;
	    Age: string;
	    CreatedAt: number;
	    Labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new NodeDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Resource = this.convertValues(source["Resource"], Resource);
	        this.Allocatable = this.convertValues(source["Allocatable"], Resource);
	        this.Ready = source["Ready"];
	        this.KubeletVersion = source["KubeletVersion"];
	        this.OperatingSystem = source["OperatingSystem"];
	        this.Version = source["Version"];
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Labels = source["Labels"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Secret {
	    Name: string;
	    Namespace: string;
	    UsedByPods: string[];
	
	    static createFrom(source: any = {}) {
	        return new Secret(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.UsedByPods = source["UsedByPods"];
	    }
	}
	export class PersistentVolume {
	    Name: string;
	    ClaimName: string;
	    Namespace: string;
	
	    static createFrom(source: any = {}) {
	        return new PersistentVolume(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ClaimName = source["ClaimName"];
	        this.Namespace = source["Namespace"];
	    }
	}
	export class PersistentVolumeClaim {
	    Name: string;
	    Namespace: string;
	    VolumeName: string;
	    UsedByPods: string[];
	
	    static createFrom(source: any = {}) {
	        return new PersistentVolumeClaim(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.VolumeName = source["VolumeName"];
	        this.UsedByPods = source["UsedByPods"];
	    }
	}
	export class Service {
	    Name: string;
	    Namespace: string;
	    Selector: Record<string, string>;
	    PodNames: string[];
	
	    static createFrom(source: any = {}) {
	        return new Service(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Selector = source["Selector"];
	        this.PodNames = source["PodNames"];
	    }
	}
	export class ReplicaSet {
	    Name: string;
	    Namespace: string;
	    Deployment: string;
	    PodNames: string[];
	
	    static createFrom(source: any = {}) {
	        return new ReplicaSet(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Deployment = source["Deployment"];
	        this.PodNames = source["PodNames"];
	    }
	}
	export class Pod {
	    Name: string;
	    Namespace: string;
	    Labels: Record<string, string>;
	    NodeName: string;
	    OwnerKind: string;
	    OwnerName: string;
	    Deployment: string;
	    PVCNames: string[];
	    ConfigMapRefs: string[];
	    SecretRefs: string[];
	    ServiceRefs: string[];
	
	    static createFrom(source: any = {}) {
	        return new Pod(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Labels = source["Labels"];
	        this.NodeName = source["NodeName"];
	        this.OwnerKind = source["OwnerKind"];
	        this.OwnerName = source["OwnerName"];
	        this.Deployment = source["Deployment"];
	        this.PVCNames = source["PVCNames"];
	        this.ConfigMapRefs = source["ConfigMapRefs"];
	        this.SecretRefs = source["SecretRefs"];
	        this.ServiceRefs = source["ServiceRefs"];
	    }
	}
	export class ObjectMapDto {
	    ClusterInfo: ClusterInfo;
	    Nodes: Node[];
	    Namespaces: Namespace[];
	    Pods: Pod[];
	    Deployments: Deployment[];
	    ReplicaSets: ReplicaSet[];
	    Services: Service[];
	    Ingresses: Ingress[];
	    PersistentVolumeClaims: PersistentVolumeClaim[];
	    PersistentVolumes: PersistentVolume[];
	    ConfigMaps: ConfigMap[];
	    Secrets: Secret[];
	    Jobs: Job[];
	    CronJobs: CronJob[];
	
	    static createFrom(source: any = {}) {
	        return new ObjectMapDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ClusterInfo = this.convertValues(source["ClusterInfo"], ClusterInfo);
	        this.Nodes = this.convertValues(source["Nodes"], Node);
	        this.Namespaces = this.convertValues(source["Namespaces"], Namespace);
	        this.Pods = this.convertValues(source["Pods"], Pod);
	        this.Deployments = this.convertValues(source["Deployments"], Deployment);
	        this.ReplicaSets = this.convertValues(source["ReplicaSets"], ReplicaSet);
	        this.Services = this.convertValues(source["Services"], Service);
	        this.Ingresses = this.convertValues(source["Ingresses"], Ingress);
	        this.PersistentVolumeClaims = this.convertValues(source["PersistentVolumeClaims"], PersistentVolumeClaim);
	        this.PersistentVolumes = this.convertValues(source["PersistentVolumes"], PersistentVolume);
	        this.ConfigMaps = this.convertValues(source["ConfigMaps"], ConfigMap);
	        this.Secrets = this.convertValues(source["Secrets"], Secret);
	        this.Jobs = this.convertValues(source["Jobs"], Job);
	        this.CronJobs = this.convertValues(source["CronJobs"], CronJob);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class VolumeClaimSpec {
	    VolumeName: string;
	    VolumeMode: string;
	    AccessModes: string[];
	    DataSourceName: string;
	    DataSourceRef: string;
	    StorageClass: string;
	    VolumeAttributesClassName: string;
	    Limit: Resource;
	    Request: Resource;
	
	    static createFrom(source: any = {}) {
	        return new VolumeClaimSpec(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.VolumeName = source["VolumeName"];
	        this.VolumeMode = source["VolumeMode"];
	        this.AccessModes = source["AccessModes"];
	        this.DataSourceName = source["DataSourceName"];
	        this.DataSourceRef = source["DataSourceRef"];
	        this.StorageClass = source["StorageClass"];
	        this.VolumeAttributesClassName = source["VolumeAttributesClassName"];
	        this.Limit = this.convertValues(source["Limit"], Resource);
	        this.Request = this.convertValues(source["Request"], Resource);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PersistentVolumeClaimDto {
	    Name: string;
	    Namespace: string;
	    StorageClass: string;
	    Size: string;
	    Labels: Record<string, string>;
	    VolumeClaimSpec: VolumeClaimSpec;
	    Status: string;
	    Capacity: Resource;
	    Age: string;
	    CreatedAt: number;
	
	    static createFrom(source: any = {}) {
	        return new PersistentVolumeClaimDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.StorageClass = source["StorageClass"];
	        this.Size = source["Size"];
	        this.Labels = source["Labels"];
	        this.VolumeClaimSpec = this.convertValues(source["VolumeClaimSpec"], VolumeClaimSpec);
	        this.Status = source["Status"];
	        this.Capacity = this.convertValues(source["Capacity"], Resource);
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class VolumeSpec {
	    Local: Local;
	    VolumeMode: string;
	    AccessModes: string[];
	    StorageClass: string;
	    VolumeAttributesClassName: string;
	    PersistentVolumeReclaimPolicy: string;
	    MountOptions: string[];
	    Capacity: Resource;
	    Host: Host;
	    NFS: NFS;
	
	    static createFrom(source: any = {}) {
	        return new VolumeSpec(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Local = this.convertValues(source["Local"], Local);
	        this.VolumeMode = source["VolumeMode"];
	        this.AccessModes = source["AccessModes"];
	        this.StorageClass = source["StorageClass"];
	        this.VolumeAttributesClassName = source["VolumeAttributesClassName"];
	        this.PersistentVolumeReclaimPolicy = source["PersistentVolumeReclaimPolicy"];
	        this.MountOptions = source["MountOptions"];
	        this.Capacity = this.convertValues(source["Capacity"], Resource);
	        this.Host = this.convertValues(source["Host"], Host);
	        this.NFS = this.convertValues(source["NFS"], NFS);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PersistentVolumeDto {
	    Name: string;
	    Namespace: string;
	    StorageClass: string;
	    Capacity: string;
	    Claim: string;
	    Labels: Record<string, string>;
	    VolumeSpec: VolumeSpec;
	    Age: string;
	    CreatedAt: number;
	    Status: string;
	
	    static createFrom(source: any = {}) {
	        return new PersistentVolumeDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.StorageClass = source["StorageClass"];
	        this.Capacity = source["Capacity"];
	        this.Claim = source["Claim"];
	        this.Labels = source["Labels"];
	        this.VolumeSpec = this.convertValues(source["VolumeSpec"], VolumeSpec);
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Status = source["Status"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class PodDto {
	    Name: string;
	    Namespace: string;
	    Containers: Container[];
	    Node: string;
	    Age: string;
	    CreatedAt: number;
	    Status: string;
	    Editable: string[];
	    Labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new PodDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Containers = this.convertValues(source["Containers"], Container);
	        this.Node = source["Node"];
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Status = source["Status"];
	        this.Editable = source["Editable"];
	        this.Labels = source["Labels"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class PodUpdate {
	    App: string;
	    Container: ContainerUpdate;
	
	    static createFrom(source: any = {}) {
	        return new PodUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.App = source["App"];
	        this.Container = this.convertValues(source["Container"], ContainerUpdate);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	
	export class ServiceDto {
	    Name: string;
	    Namespace: string;
	    Type: string;
	    InternalIp: string;
	    ExternalIp: string;
	    Port: number;
	    Status: string;
	    Age: string;
	    CreatedAt: number;
	    Spec: string;
	    Labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new ServiceDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Namespace = source["Namespace"];
	        this.Type = source["Type"];
	        this.InternalIp = source["InternalIp"];
	        this.ExternalIp = source["ExternalIp"];
	        this.Port = source["Port"];
	        this.Status = source["Status"];
	        this.Age = source["Age"];
	        this.CreatedAt = source["CreatedAt"];
	        this.Spec = source["Spec"];
	        this.Labels = source["Labels"];
	    }
	}
	export class ServiceUpdate {
	    LabelApp: string;
	    SpecType: string;
	    Port: number;
	    TargetPort: string;
	    SelectorApp: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.LabelApp = source["LabelApp"];
	        this.SpecType = source["SpecType"];
	        this.Port = source["Port"];
	        this.TargetPort = source["TargetPort"];
	        this.SelectorApp = source["SelectorApp"];
	    }
	}
	
	export class Troubleshoot {
	    Meaning: string;
	    Recommendation: string;
	
	    static createFrom(source: any = {}) {
	        return new Troubleshoot(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Meaning = source["Meaning"];
	        this.Recommendation = source["Recommendation"];
	    }
	}
	export class TuningRecommendation {
	    Deployment: string;
	    Namespace: string;
	    Container: string;
	    CurrentLimit: Resource;
	    Usage: Resource;
	    SuggestedLimit: Resource;
	
	    static createFrom(source: any = {}) {
	        return new TuningRecommendation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Deployment = source["Deployment"];
	        this.Namespace = source["Namespace"];
	        this.Container = source["Container"];
	        this.CurrentLimit = this.convertValues(source["CurrentLimit"], Resource);
	        this.Usage = this.convertValues(source["Usage"], Resource);
	        this.SuggestedLimit = this.convertValues(source["SuggestedLimit"], Resource);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

