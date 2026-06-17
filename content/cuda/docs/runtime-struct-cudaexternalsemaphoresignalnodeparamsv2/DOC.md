---
name: runtime-struct-cudaexternalsemaphoresignalnodeparamsv2
description: '**Source:** structcudaExternalSemaphoreSignalNodeParamsV2.html#structcudaExternalSemaphoreSignalNodeParamsV2'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.25. cudaExternalSemaphoreSignalNodeParamsV2

**Source:** structcudaExternalSemaphoreSignalNodeParamsV2.html#structcudaExternalSemaphoreSignalNodeParamsV2


### Public Variables

cudaExternalSemaphore_t* * extSemArray

unsigned int numExtSems

cudaExternalSemaphoreSignalParams * paramsArray


### Variables

cudaExternalSemaphore_t* * cudaExternalSemaphoreSignalNodeParamsV2::extSemArray


Array of external semaphore handles.

unsigned int cudaExternalSemaphoreSignalNodeParamsV2::numExtSems


Number of handles and parameters supplied in extSemArray and paramsArray.

cudaExternalSemaphoreSignalParams * cudaExternalSemaphoreSignalNodeParamsV2::paramsArray


Array of external semaphore signal parameters.

* * *

!


Copyright © 2025 NVIDIA Corporation