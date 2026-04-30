---
name: runtime-struct-cudalaunchconfig--t
description: '**Source:** structcudaLaunchConfig__t.html#structcudaLaunchConfig__t'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.44. cudaLaunchConfig_t

**Source:** structcudaLaunchConfig__t.html#structcudaLaunchConfig__t


### Public Variables

cudaLaunchAttribute * attrs

dim3 blockDim

size_t dynamicSmemBytes

dim3 gridDim

unsigned int numAttrs

cudaStream_t stream


### Variables

cudaLaunchAttribute * cudaLaunchConfig_t::attrs


List of attributes; nullable if cudaLaunchConfig_t::numAttrs == 0

dim3 cudaLaunchConfig_t::blockDim


Block dimensions

size_t cudaLaunchConfig_t::dynamicSmemBytes


Dynamic shared-memory size per thread block in bytes

dim3 cudaLaunchConfig_t::gridDim


Grid dimensions

unsigned int cudaLaunchConfig_t::numAttrs


Number of attributes populated in cudaLaunchConfig_t::attrs

cudaStream_tcudaLaunchConfig_t::stream


Stream identifier

* * *

!


Copyright © 2025 NVIDIA Corporation