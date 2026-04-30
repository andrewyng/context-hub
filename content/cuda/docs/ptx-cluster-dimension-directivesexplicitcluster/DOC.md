---
name: ptx-cluster-dimension-directivesexplicitcluster
description: Declare that Kernel must be launched with cluster dimensions explicitly
  specified.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.7.2. Cluster Dimension Directives:.explicitcluster

---
title: "11.7.2. Cluster Dimension Directives:.explicitcluster"
section: 11.7.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.7.2. Cluster Dimension Directives:.explicitcluster


`.explicitcluster`

Declare that Kernel must be launched with cluster dimensions explicitly specified.

Syntax

.explicitcluster

Description

Declares that this Kernel should be launched with cluster dimension explicitly specified.

Semantics

Kernels with `.explicitcluster` directive must be launched with cluster dimension explicitly specified (either at launch time or via `.reqnctapercluster`), otherwise program will fail with runtime error or kernel launch failure.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.entry foo .explicitcluster         { . . . }