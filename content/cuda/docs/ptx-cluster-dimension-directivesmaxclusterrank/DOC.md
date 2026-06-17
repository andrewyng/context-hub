---
name: ptx-cluster-dimension-directivesmaxclusterrank
description: Declare the maximum number of CTAs that can be part of the cluster.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.7.3. Cluster Dimension Directives:.maxclusterrank

---
title: "11.7.3. Cluster Dimension Directives:.maxclusterrank"
section: 11.7.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.7.3. Cluster Dimension Directives:.maxclusterrank


`.maxclusterrank`

Declare the maximum number of CTAs that can be part of the cluster.

Syntax

.maxclusterrank n

Description

Declare the maximum number of thread blocks (CTAs) allowed to be part of the cluster.

Semantics

Product of the number of CTAs in each cluster dimension specified in any invocation of the kernel is required to be less or equal to that specified in this directive. Otherwise invocation will result in a runtime error or kernel launch failure.

The `.maxclusterrank` directive cannot be used in conjunction with the `.reqnctapercluster` directive.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.entry foo ..maxclusterrank 8         { . . . }