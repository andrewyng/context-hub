---
name: ptx-grid-of-clusters
description: There is a maximum number of threads that a CTA can contain and a maximum
  number of CTAs that a cluster can contain. However, clusters with CTAs that execute
  the same kernel can be batched together in...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 2.2.3. Grid of Clusters

---
title: "2.2.3. Grid of Clusters"
section: 2.2.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 2.2.3. Grid of Clusters


There is a maximum number of threads that a CTA can contain and a maximum number of CTAs that a cluster can contain. However, clusters with CTAs that execute the same kernel can be batched together into a grid of clusters, so that the total number of threads that can be launched in a single kernel invocation is very large. This comes at the expense of reduced thread communication and synchronization, because threads in different clusters cannot communicate and synchronize with each other.

Each cluster has a unique cluster identifier (_clusterid_) within a grid of clusters. Each grid of clusters has a 1D, 2D , or 3D shape specified by the parameter _nclusterid_. Each grid also has a unique temporal grid identifier (_gridid_). Threads may read and use these values through predefined, read-only special registers `%tid`, `%ntid`, `%clusterid`, `%nclusterid`, and `%gridid`.

Each CTA has a unique identifier (_ctaid_) within a grid. Each grid of CTAs has 1D, 2D, or 3D shape specified by the parameter _nctaid_. Thread may use and read these values through predefined, read-only special registers `%ctaid` and `%nctaid`.

Each kernel is executed as a batch of threads organized as a grid of clusters consisting of CTAs where cluster is optional level and is applicable only for target architectures `sm_90` and higher. [Figure 1](<#grid-of-clusters-grid-with-ctas>) shows a grid consisting of CTAs and [Figure 2](<#grid-of-clusters-grid-with-clusters>) shows a grid consisting of clusters.

Grids may be launched with dependencies between one another - a grid may be a dependent grid and/or a prerequisite grid. To understand how grid dependencies may be defined, refer to the section on _CUDA Graphs_ in the _Cuda Programming Guide_.

![Grid with CTAs](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/grid-with-CTAs.png)

Figure 1 Grid with CTAs

![Grid with clusters](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/grid-with-clusters.png)

Figure 2 Grid with clusters

A cluster is a set of cooperative thread arrays (CTAs) where a CTA is a set of concurrent threads that execute the same kernel program. A grid is a set of clusters consisting of CTAs that execute independently.