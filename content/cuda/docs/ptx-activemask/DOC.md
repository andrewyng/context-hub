---
name: ptx-activemask
description: Queries the active threads within a warp.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.11. Parallel Synchronization and Communication Instructions:activemask

---
title: "9.7.13.11. Parallel Synchronization and Communication Instructions:activemask"
section: 9.7.13.11
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.11. Parallel Synchronization and Communication Instructions:activemask


`activemask`

Queries the active threads within a warp.

Syntax

activemask.b32 d;

Description

`activemask` queries predicated-on active threads from the executing warp and sets the destination `d` with 32-bit integer mask where bit position in the mask corresponds to the thread’s `laneid`.

Destination `d` is a 32-bit destination register.

An active thread will contribute 1 for its entry in the result and exited or inactive or predicated-off thread will contribute 0 for its entry in the result.

PTX ISA Notes

Introduced in PTX ISA version 6.2.

Target ISA Notes

Requires `sm_30` or higher.

Examples

activemask.b32  %r1;