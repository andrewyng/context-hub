---
name: ptx-special-registerscluster-nctarank
description: Number of CTA identifiers in a cluster across all dimensions.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.17. Special Registers:%cluster_nctarank

---
title: "10.17. Special Registers:%cluster_nctarank"
section: 10.17
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.17. Special Registers:%cluster_nctarank


`%cluster_nctarank`

Number of CTA identifiers in a cluster across all dimensions.

Syntax (predefined)

.sreg .u32 %cluster_nctarank;

Description

A predefined, read-only special register initialized with the nunber of CTAs within a cluster across all dimensions.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .b32 %r;
    
    mov.u32  %r, %cluster_nctarank;