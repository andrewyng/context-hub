---
name: ptx-special-registersnclusterid
description: Number of cluster identifiers per grid.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.13. Special Registers:%nclusterid

---
title: "10.13. Special Registers:%nclusterid"
section: 10.13
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.13. Special Registers:%nclusterid


`%nclusterid`

Number of cluster identifiers per grid.

Syntax (predefined)

.sreg .v4 .u32 %nclusterid;
    .sreg .u32 %nclusterid.x, %nclusterid.y, %nclusterid.z;

Description

A predefined, read-only special register initialized with the number of clusters in each grid dimension.

The `%nclusterid` special register contains a 3D grid shape vector that holds the grid dimensions in terms of clusters. The fourth element is unused and always returns zero.

Refer to the _Cuda Programming Guide_ for details on the maximum values of `%nclusterid.{x,y,z}`.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.reg .b32 %r<2>;
    .reg .v4 .b32 %rx;
    
    mov.u32     %r0, %nclusterid.x;
    mov.u32     %r1, %nclusterid.z;
    mov.v4.u32  %rx, %nclusterid;