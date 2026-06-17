---
name: ptx-cluster-of-cooperative-thread-arrays
description: Cluster is a group of CTAs that run concurrently or in parallel and can
  synchronize and communicate with each other via shared memory. The executing CTA
  has to make sure that the shared memory of the ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 2.2.2. Cluster of Cooperative Thread Arrays

---
title: "2.2.2. Cluster of Cooperative Thread Arrays"
section: 2.2.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 2.2.2. Cluster of Cooperative Thread Arrays


Cluster is a group of CTAs that run concurrently or in parallel and can synchronize and communicate with each other via shared memory. The executing CTA has to make sure that the shared memory of the peer CTA exists before communicating with it via shared memory and the peer CTA hasn’t exited before completing the shared memory operation.

Threads within the different CTAs in a cluster can synchronize and communicate with each other via shared memory. Cluster-wide barriers can be used to synchronize all the threads within the cluster. Each CTA in a cluster has a unique CTA identifier within its cluster (_cluster_ctaid_). Each cluster of CTAs has 1D, 2D or 3D shape specified by the parameter _cluster_nctaid_. Each CTA in the cluster also has a unique CTA identifier (_cluster_ctarank_) across all dimensions. The total number of CTAs across all the dimensions in the cluster is specified by _cluster_nctarank_. Threads may read and use these values through predefined, read-only special registers `%cluster_ctaid`, `%cluster_nctaid`, `%cluster_ctarank`, `%cluster_nctarank`.

Cluster level is applicable only on target architecture `sm_90` or higher. Specifying cluster level during launch time is optional. If the user specifies the cluster dimensions at launch time then it will be treated as explicit cluster launch, otherwise it will be treated as implicit cluster launch with default dimension 1x1x1. PTX provides read-only special register `%is_explicit_cluster` to differentiate between explicit and implicit cluster launch.