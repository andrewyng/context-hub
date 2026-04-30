---
name: runtime-struct-cudaexternalsemaphoresignalnodeparams
description: '**Source:** structcudaExternalSemaphoreSignalNodeParams.html#structcudaExternalSemaphoreSignalNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.24. cudaExternalSemaphoreSignalNodeParams

**Source:** structcudaExternalSemaphoreSignalNodeParams.html#structcudaExternalSemaphoreSignalNodeParams


### Public Variables

cudaExternalSemaphore_t* * extSemArray

unsigned int numExtSems

cudaExternalSemaphoreSignalParams * paramsArray


### Variables

cudaExternalSemaphore_t* * cudaExternalSemaphoreSignalNodeParams::extSemArray


Array of external semaphore handles.

unsigned int cudaExternalSemaphoreSignalNodeParams::numExtSems


Number of handles and parameters supplied in extSemArray and paramsArray.

cudaExternalSemaphoreSignalParams * cudaExternalSemaphoreSignalNodeParams::paramsArray


Array of external semaphore signal parameters.

* * *

!


Copyright © 2025 NVIDIA Corporation