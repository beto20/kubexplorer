# Tider
[![GoMod](https://img.shields.io/github/go-mod/go-version/beto20/kubexplorer)](https://github.com/beto20/kubexplorer)
[![Size](https://img.shields.io/github/languages/code-size/tiderops/tider)](https://github.com/tiderops/tider)
[![License](https://img.shields.io/github/license/tiderops/tider)](./LICENSE)
[![Go Report Card](https://goreportcard.com/badge/github.com/tiderops/tider)](https://goreportcard.com/report/github.com/tiderops/tider)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/10720/badge)](https://www.bestpractices.dev/projects/10720)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/tiderops/tider)

**Tider** (formerly Kubexplorer) is an open-source desktop application for Kubernetes multi-cluster operations, built by [TiderOps](https://github.com/tiderops) with Wails (Go backend + Vue 3 frontend). It is designed for platform, SRE, cloud, and Kubernetes engineers who care about a fast, high-quality UX.

## Why Tider

The hard part of operating Kubernetes is not listing resources — it is the incident workflow. When a workload fails, an engineer jumps between cluster contexts, `kubectl`, dashboards, events, metrics, rollout history, and tribal knowledge before forming a defensible diagnosis. That knowledge is rarely retained or comparable across incidents.

Tider compresses this workflow into a single desktop tool:

- **Local-first.** Uses your existing kubeconfig and identity chain. No Tider account, no control plane, no sign-up.
- **Read-only by design.** Tider observes and diagnoses; it does not patch, delete, exec, or scale your workloads.
- **Evidence over assertion.** Findings ship with the observed facts, severity, and confidence — and say "insufficient evidence" when the data only supports correlation, instead of inventing a root cause.
- **Private by default.** No raw manifests, logs, or secrets leave your workstation.

## Features

- **Multi-cluster management** — discover clusters from your kubeconfig, switch contexts fast, and tag environments (prod / staging / dev).
- **Resource explorer** — workloads (pods, deployments, jobs), networking (services, ingress), storage, configuration, and cluster-level resources (nodes, namespaces, events), organized by domain.
- **Troubleshooting assistant** — deterministic diagnosis for failing pods, deployments, and jobs: crash loops, image pull failures, OOM kills, scheduling problems, probe failures, and more, each backed by the evidence that produced it.
- **Resource optimization** — resource-limit tuning recommendations computed from live usage.
- **Cluster monitoring** *(in progress)* — health and capacity at a glance.
- **Resource backup** *(in progress)* — export and restore cluster resources.

## Getting started

### Prerequisites

| Tool  | Version |
|-------|---------|
| Go    | 1.24    |
| Node  | 26.4.0  |
| Wails | 2.10    |

Install the Wails CLI: https://wails.io/docs/gettingstarted/installation

### Run from source

```bash
git clone https://github.com/tiderops/tider.git
cd tider

wails dev

wails build
```

Tider reads clusters from your default kubeconfig (`~/.kube/config`). Point it at any cluster you can already reach with `kubectl`.


## Contributing

Contributions are welcome — bug reports, diagnosis rules, docs, and code. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow, branch conventions, and quality gates.

## Security

Tider's Kubernetes access is read-only and nothing leaves your workstation by default. To report a vulnerability, see [SECURITY.md](./SECURITY.md).

## License

Licensed under the [Apache License 2.0](./LICENSE).
