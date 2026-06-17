---
name: runtime-struct-cudaexternalsemaphorewaitnodeparamsv2
description: '**Source:** structcudaExternalSemaphoreWaitNodeParamsV2.html#structcudaExternalSemaphoreWaitNodeParamsV2'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.28. cudaExternalSemaphoreWaitNodeParamsV2

**Source:** structcudaExternalSemaphoreWaitNodeParamsV2.html#structcudaExternalSemaphoreWaitNodeParamsV2


### Public Variables

cudaExternalSemaphore_t* * extSemArray

unsigned int numExtSems

cudaExternalSemaphoreWaitParams * paramsArray


### Variables

cudaExternalSemaphore_t* * cudaExternalSemaphoreWaitNodeParamsV2::extSemArray


Array of external semaphore handles.

unsigned int cudaExternalSemaphoreWaitNodeParamsV2::numExtSems


Number of handles and parameters supplied in extSemArray and paramsArray.

cudaExternalSemaphoreWaitParams * cudaExternalSemaphoreWaitNodeParamsV2::paramsArray


Array of external semaphore wait parameters.

* * *

!


Copyright © 2025 NVIDIA Corporation