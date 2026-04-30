---
name: runtime-struct-cudaexternalsemaphorewaitnodeparams
description: '**Source:** structcudaExternalSemaphoreWaitNodeParams.html#structcudaExternalSemaphoreWaitNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.27. cudaExternalSemaphoreWaitNodeParams

**Source:** structcudaExternalSemaphoreWaitNodeParams.html#structcudaExternalSemaphoreWaitNodeParams


### Public Variables

cudaExternalSemaphore_t* * extSemArray

unsigned int numExtSems

cudaExternalSemaphoreWaitParams * paramsArray


### Variables

cudaExternalSemaphore_t* * cudaExternalSemaphoreWaitNodeParams::extSemArray


Array of external semaphore handles.

unsigned int cudaExternalSemaphoreWaitNodeParams::numExtSems


Number of handles and parameters supplied in extSemArray and paramsArray.

cudaExternalSemaphoreWaitParams * cudaExternalSemaphoreWaitNodeParams::paramsArray


Array of external semaphore wait parameters.

* * *

!


Copyright © 2025 NVIDIA Corporation