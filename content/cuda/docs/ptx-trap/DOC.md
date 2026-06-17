---
name: ptx-trap
description: Perform trap operation.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.19.4. Miscellaneous Instructions:trap

---
title: "9.7.19.4. Miscellaneous Instructions:trap"
section: 9.7.19.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.19.4. Miscellaneous Instructions:trap


`trap`

Perform trap operation.

Syntax

trap;

Description

Abort execution and generate an interrupt to the host CPU.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

trap;
    @p  trap;