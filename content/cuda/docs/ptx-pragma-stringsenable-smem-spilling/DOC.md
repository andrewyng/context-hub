---
name: ptx-pragma-stringsenable-smem-spilling
description: '`"enable_smem_spilling"`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 12.3. Pragma Strings:

---
title: "12.3. Pragma Strings:"enable_smem_spilling""
section: 12.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 12.3. Pragma Strings:"enable_smem_spilling"


`"enable_smem_spilling"`

Enable shared memory spilling for CUDA kernels.

Syntax

.pragma "enable_smem_spilling";

Description

The `"enable_smem_spilling" pragma` is a directive that enables register spilling into shared memory. During the spilling process, registers are first spilled into shared memory, and once the allocated shared memory is full, any additional spills are redirected to local memory. This can enhance performance by reducing memory access latency since shared memory accesses are faster than local memory.

The `"enable_smem_spilling" pragma` is only allowed within the function scope. When applied, it enables shared memory spilling for the specified function.

The usage of pragma is valid only in certain scenarios and specific compilation modes. The usage of pragma is disallowed under following cases and may result in an error:

* Per-function compilation mode: e.g., Separate Compilation, Device-debug, Whole program with recursive function calls, Extensible-whole-program

  * Kernels utilizing dynamically allocated shared memory

  * Kernels using `setmaxnreg` instruction

Note

If launch bounds are not explicitly specified, the compiler assumes the maximum possible number of threads per CTA to estimate shared memory allocated per CTA and corresponding spill size. However, if the kernel is launched with fewer threads per CTA than estimated, the shared memory allocated per CTA may exceed the compiler estimated size, thereby potentially limiting the number of CTAs that can be launched on an SM. Due to this, using the pragma without launch bounds may lead to performance regressions. Hence it is recommended to use this pragma only when launch bounds are explicitly specified.

PTX ISA Notes

Introduced in PTX ISA version 9.0.

Target ISA Notes

Requires `sm_75` or higher.

Examples

.entry foo (...)
    {
        ...
        .pragma "enable_smem_spilling";   // Enable shared memory spilling for this function
        ...
    }