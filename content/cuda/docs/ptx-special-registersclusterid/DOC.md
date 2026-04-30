---
name: ptx-special-registersclusterid
description: Cluster identifier within a grid.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.12. Special Registers:%clusterid

---
title: "10.12. Special Registers:%clusterid"
section: 10.12
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.12. Special Registers:%clusterid


`%clusterid`

Cluster identifier within a grid.

Syntax (predefined)

.sreg .v4 .u32 %clusterid;
    .sreg .u32 %clusterid.x, %clusterid.y, %clusterid.z;

Description

A predefined, read-only special register initialized with the cluster identifier in a grid in each dimension. Each cluster in a grid has a unique identifier.

The `%clusterid` special register contains a 1D, 2D, or 3D vector, depending upon the shape and rank of the cluster. The fourth element is unused and always returns zero.

It is guaranteed that:

0  <=  %clusterid.x <  %nclusterid.x
    0  <=  %clusterid.y <  %nclusterid.y
    0  <=  %clusterid.z <  %nclusterid.z

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .b32 %r<2>;
    .reg .v4 .b32 %rx;
    
    mov.u32     %r0, %clusterid.x;
    mov.u32     %r1, %clusterid.z;
    mov.v4.u32  %rx, %clusterid;