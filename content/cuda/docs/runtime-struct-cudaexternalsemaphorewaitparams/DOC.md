---
name: runtime-struct-cudaexternalsemaphorewaitparams
description: '**Source:** structcudaExternalSemaphoreWaitParams.html#structcudaExternalSemaphoreWaitParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.29. cudaExternalSemaphoreWaitParams

**Source:** structcudaExternalSemaphoreWaitParams.html#structcudaExternalSemaphoreWaitParams


### Public Variables

void * fence

cudaExternalSemaphoreWaitParams::@19::@20 fence

unsigned int flags

unsigned long long key

cudaExternalSemaphoreWaitParams::@19::@22 keyedMutex

unsigned int timeoutMs

unsigned long long value


### Variables

void * cudaExternalSemaphoreWaitParams::fence


Pointer to NvSciSyncFence. Valid if cudaExternalSemaphoreHandleType is of type cudaExternalSemaphoreHandleTypeNvSciSync.

cudaExternalSemaphoreWaitParams::@19::@20 cudaExternalSemaphoreWaitParams::fence


Parameters for fence objects

unsigned int cudaExternalSemaphoreWaitParams::flags


Only when cudaExternalSemaphoreSignalParams is used to signal a cudaExternalSemaphore_t of type cudaExternalSemaphoreHandleTypeNvSciSync, the valid flag is cudaExternalSemaphoreSignalSkipNvSciBufMemSync: which indicates that while waiting for the cudaExternalSemaphore_t, no memory synchronization operations should be performed for any external memory object imported as cudaExternalMemoryHandleTypeNvSciBuf. For all other types of cudaExternalSemaphore_t, flags must be zero.

unsigned long long cudaExternalSemaphoreWaitParams::key


Value of key to acquire the mutex with

cudaExternalSemaphoreWaitParams::@19::@22 cudaExternalSemaphoreWaitParams::keyedMutex


Parameters for keyed mutex objects

unsigned int cudaExternalSemaphoreWaitParams::timeoutMs


Timeout in milliseconds to wait to acquire the mutex

unsigned long long cudaExternalSemaphoreWaitParams::value


Value of fence to be waited on

* * *

!


Copyright © 2025 NVIDIA Corporation