---
name: runtime-struct-cudamemcpynodeparams
description: '**Source:** structcudaMemcpyNodeParams.html#structcudaMemcpyNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.53. cudaMemcpyNodeParams

**Source:** structcudaMemcpyNodeParams.html#structcudaMemcpyNodeParams


### Public Variables

struct cudaMemcpy3DParms copyParams

cudaExecutionContext_t ctx

int flags

int reserved


### Variables

struct cudaMemcpy3DParmscudaMemcpyNodeParams::copyParams


Parameters for the memory copy

cudaExecutionContext_tcudaMemcpyNodeParams::ctx


Context in which to run the memcpy. If NULL will try to use the current context.

int cudaMemcpyNodeParams::flags


Must be zero

int cudaMemcpyNodeParams::reserved


Must be zero

* * *

!


Copyright © 2025 NVIDIA Corporation