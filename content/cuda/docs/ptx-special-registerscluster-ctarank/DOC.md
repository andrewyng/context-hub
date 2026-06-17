---
name: ptx-special-registerscluster-ctarank
description: CTA identifier in a cluster across all dimensions.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.16. Special Registers:%cluster_ctarank

---
title: "10.16. Special Registers:%cluster_ctarank"
section: 10.16
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.16. Special Registers:%cluster_ctarank


`%cluster_ctarank`

CTA identifier in a cluster across all dimensions.

Syntax (predefined)

.sreg .u32 %cluster_ctarank;

Description

A predefined, read-only special register initialized with the CTA rank within a cluster across all dimensions.

It is guaranteed that:

0  <=  %cluster_ctarank <  %cluster_nctarank

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .b32 %r;
    
    mov.u32  %r, %cluster_ctarank;