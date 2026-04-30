---
name: runtime-struct-cudagraphnodeparams
description: '**Source:** structcudaGraphNodeParams.html#structcudaGraphNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.35. cudaGraphNodeParams

**Source:** structcudaGraphNodeParams.html#structcudaGraphNodeParams


### Public Variables

struct cudaMemAllocNodeParamsV2 alloc

struct cudaConditionalNodeParams conditional

struct cudaEventRecordNodeParams eventRecord

struct cudaEventWaitNodeParams eventWait

struct cudaExternalSemaphoreSignalNodeParamsV2 extSemSignal

struct cudaExternalSemaphoreWaitNodeParamsV2 extSemWait

struct cudaMemFreeNodeParams free

struct cudaChildGraphNodeParams graph

struct cudaHostNodeParamsV2 host

struct cudaKernelNodeParamsV2 kernel

struct cudaMemcpyNodeParams memcpy

struct cudaMemsetParamsV2 memset

int reserved0[3]

long long reserved1[29]

long long reserved2

enumcudaGraphNodeType type


### Variables

struct cudaMemAllocNodeParamsV2cudaGraphNodeParams::alloc


Memory allocation node parameters.

struct cudaConditionalNodeParamscudaGraphNodeParams::conditional


Conditional node parameters.

struct cudaEventRecordNodeParamscudaGraphNodeParams::eventRecord


Event record node parameters.

struct cudaEventWaitNodeParamscudaGraphNodeParams::eventWait


Event wait node parameters.

struct cudaExternalSemaphoreSignalNodeParamsV2cudaGraphNodeParams::extSemSignal


External semaphore signal node parameters.

struct cudaExternalSemaphoreWaitNodeParamsV2cudaGraphNodeParams::extSemWait


External semaphore wait node parameters.

struct cudaMemFreeNodeParamscudaGraphNodeParams::free


Memory free node parameters.

struct cudaChildGraphNodeParamscudaGraphNodeParams::graph


Child graph node parameters.

struct cudaHostNodeParamsV2cudaGraphNodeParams::host


Host node parameters.

struct cudaKernelNodeParamsV2cudaGraphNodeParams::kernel


Kernel node parameters.

struct cudaMemcpyNodeParamscudaGraphNodeParams::memcpy


Memcpy node parameters.

struct cudaMemsetParamsV2cudaGraphNodeParams::memset


Memset node parameters.

int cudaGraphNodeParams::reserved0[3]


Reserved. Must be zero.

long long cudaGraphNodeParams::reserved1[29]


Padding. Unused bytes must be zero.

long long cudaGraphNodeParams::reserved2


Reserved bytes. Must be zero.

enumcudaGraphNodeTypecudaGraphNodeParams::type


Type of the node

* * *

!


Copyright © 2025 NVIDIA Corporation