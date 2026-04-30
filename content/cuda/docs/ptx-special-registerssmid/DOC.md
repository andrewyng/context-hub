---
name: ptx-special-registerssmid
description: SM identifier.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.8. Special Registers:%smid

---
title: "10.8. Special Registers:%smid"
section: 10.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.8. Special Registers:%smid


`%smid`

SM identifier.

Syntax (predefined)

.sreg .u32 %smid;

Description

A predefined, read-only special register that returns the processor (SM) identifier on which a particular thread is executing. The SM identifier ranges from `0` to `%nsmid-1`. The SM identifier numbering is not guaranteed to be contiguous.

Notes

Note that `%smid` returns the location of a thread at the moment when read, but its value may change during execution, e.g. due to rescheduling of threads following preemption. `%smid` is intended mainly to enable profiling and diagnostic code to sample and log information such as work place mapping and load distribution.

PTX ISA Notes

Introduced in PTX ISA version 1.3.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u32  %r, %smid;