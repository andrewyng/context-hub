---
name: runtime-struct-cudakernelnodeparamsv2
description: '**Source:** structcudaKernelNodeParamsV2.html#structcudaKernelNodeParamsV2'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.41. cudaKernelNodeParamsV2

**Source:** structcudaKernelNodeParamsV2.html#structcudaKernelNodeParamsV2


### Public Variables

uint3 blockDim

cudaExecutionContext_t ctx

* extra

void * func

uint3 gridDim

* kernelParams

unsigned int sharedMemBytes


### Variables

uint3 cudaKernelNodeParamsV2::blockDim


Block dimensions

cudaExecutionContext_tcudaKernelNodeParamsV2::ctx


Context in which to run the kernel. If NULL will try to use the current context.

* cudaKernelNodeParamsV2::extra


Pointer to kernel arguments in the "extra" format

void * cudaKernelNodeParamsV2::func


Kernel to launch

uint3 cudaKernelNodeParamsV2::gridDim


Grid dimensions

* cudaKernelNodeParamsV2::kernelParams


Array of pointers to individual kernel arguments

unsigned int cudaKernelNodeParamsV2::sharedMemBytes


Dynamic shared-memory size per thread block in bytes

* * *

!


Copyright © 2025 NVIDIA Corporation