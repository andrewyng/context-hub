---
name: ptx-cluster-dimension-directivesreqnctapercluster
description: '`.reqnctapercluster`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.7.1. Cluster Dimension Directives:.reqnctapercluster

---
title: "11.7.1. Cluster Dimension Directives:.reqnctapercluster"
section: 11.7.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.7.1. Cluster Dimension Directives:.reqnctapercluster


`.reqnctapercluster`

Declare the number of CTAs in the cluster.

Syntax

.reqnctapercluster nx
    .reqnctapercluster nx, ny
    .reqnctapercluster nx, ny, nz

Description

Set the number of thread blocks (CTAs) in the cluster by specifying the extent of each dimension of the 1D, 2D, or 3D cluster. The total number of CTAs is the product of the number of CTAs in each dimension. For kernels with `.reqnctapercluster` directive specified, runtime will use the specified values for configuring the launch if the same are not specified at launch time.

Semantics

If cluster dimension is explicitly specified at launch time, it should be equal to the values specified in this directive. Specifying a different cluster dimension at launch will result in a runtime error or kernel launch failure.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.entry foo .reqnctapercluster 2         { . . . }
    .entry bar .reqnctapercluster 2, 2, 1   { . . . }
    .entry ker .reqnctapercluster 3, 2      { . . . }