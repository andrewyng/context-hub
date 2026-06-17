---
name: ptx-special-registersis-explicit-cluster
description: '`%is_explicit_cluster`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.11. Special Registers:%is_explicit_cluster

---
title: "10.11. Special Registers:%is_explicit_cluster"
section: 10.11
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.11. Special Registers:%is_explicit_cluster


`%is_explicit_cluster`

Checks if user has explicitly specified cluster launch.

Syntax (predefined)

.sreg .pred %is_explicit_cluster;

Description

A predefined, read-only special register initialized with the predicate value of whether the cluster launch is explicitly specified by user.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .pred p;
    
    mov.pred  p, %is_explicit_cluster;