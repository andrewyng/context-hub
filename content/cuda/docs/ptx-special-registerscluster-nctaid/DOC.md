---
name: ptx-special-registerscluster-nctaid
description: Number of CTA identifiers per cluster.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.15. Special Registers:%cluster_nctaid

---
title: "10.15. Special Registers:%cluster_nctaid"
section: 10.15
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.15. Special Registers:%cluster_nctaid


`%cluster_nctaid`

Number of CTA identifiers per cluster.

Syntax (predefined)

.sreg .v4 .u32 %cluster_nctaid;
    .sreg .u32 %cluster_nctaid.x, %cluster_nctaid.y, %cluster_nctaid.z;

Description

A predefined, read-only special register initialized with the number of CTAs in a cluster in each dimension.

The `%cluster_nctaid` special register contains a 3D grid shape vector that holds the cluster dimensions in terms of CTAs. The fourth element is unused and always returns zero.

Refer to the _Cuda Programming Guide_ for details on the maximum values of `%cluster_nctaid.{x,y,z}`.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .b32 %r<2>;
    .reg .v4 .b32 %rx;
    
    mov.u32     %r0, %cluster_nctaid.x;
    mov.u32     %r1, %cluster_nctaid.z;
    mov.v4.u32  %rx, %cluster_nctaid;