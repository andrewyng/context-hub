---
name: ptx-special-registerscluster-ctaid
description: CTA identifier within a cluster.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.14. Special Registers:%cluster_ctaid

---
title: "10.14. Special Registers:%cluster_ctaid"
section: 10.14
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.14. Special Registers:%cluster_ctaid


`%cluster_ctaid`

CTA identifier within a cluster.

Syntax (predefined)

.sreg .v4 .u32 %cluster_ctaid;
    .sreg .u32 %cluster_ctaid.x, %cluster_ctaid.y, %cluster_ctaid.z;

Description

A predefined, read-only special register initialized with the CTA identifier in a cluster in each dimension. Each CTA in a cluster has a unique CTA identifier.

The `%cluster_ctaid` special register contains a 1D, 2D, or 3D vector, depending upon the shape of the cluster. The fourth element is unused and always returns zero.

It is guaranteed that:

0  <=  %cluster_ctaid.x <  %cluster_nctaid.x
    0  <=  %cluster_ctaid.y <  %cluster_nctaid.y
    0  <=  %cluster_ctaid.z <  %cluster_nctaid.z

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .b32 %r<2>;
    .reg .v4 .b32 %rx;
    
    mov.u32     %r0, %cluster_ctaid.x;
    mov.u32     %r1, %cluster_ctaid.z;
    mov.v4.u32  %rx, %cluster_ctaid;