---
name: runtime-struct-cudamemallocnodeparams
description: '**Source:** structcudaMemAllocNodeParams.html#structcudaMemAllocNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.47. cudaMemAllocNodeParams

**Source:** structcudaMemAllocNodeParams.html#structcudaMemAllocNodeParams


### Public Variables

size_t accessDescCount

cudaMemAccessDesc * accessDescs

size_t bytesize

void * dptr

struct cudaMemPoolProps poolProps


### Variables

size_t cudaMemAllocNodeParams::accessDescCount


in: Number of `accessDescs`s

cudaMemAccessDesc * cudaMemAllocNodeParams::accessDescs


in: number of memory access descriptors. Must not exceed the number of GPUs.

size_t cudaMemAllocNodeParams::bytesize


in: size in bytes of the requested allocation

void * cudaMemAllocNodeParams::dptr


out: address of the allocation returned by CUDA

struct cudaMemPoolPropscudaMemAllocNodeParams::poolProps


in: location where the allocation should reside (specified in location). handleTypes must be cudaMemHandleTypeNone. IPC is not supported. in: array of memory access descriptors. Used to describe peer GPU access

* * *

!


Copyright © 2025 NVIDIA Corporation