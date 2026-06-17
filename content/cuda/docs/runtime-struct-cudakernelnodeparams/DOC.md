---
name: runtime-struct-cudakernelnodeparams
description: '**Source:** structcudaKernelNodeParams.html#structcudaKernelNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.40. cudaKernelNodeParams

**Source:** structcudaKernelNodeParams.html#structcudaKernelNodeParams


### Public Variables

dim3 blockDim

* extra

void * func

dim3 gridDim

* kernelParams

unsigned int sharedMemBytes


### Variables

dim3 cudaKernelNodeParams::blockDim


Block dimensions

* cudaKernelNodeParams::extra


Pointer to kernel arguments in the "extra" format

void * cudaKernelNodeParams::func


Kernel to launch

dim3 cudaKernelNodeParams::gridDim


Grid dimensions

* cudaKernelNodeParams::kernelParams


Array of pointers to individual kernel arguments

unsigned int cudaKernelNodeParams::sharedMemBytes


Dynamic shared-memory size per thread block in bytes

* * *

!


Copyright © 2025 NVIDIA Corporation