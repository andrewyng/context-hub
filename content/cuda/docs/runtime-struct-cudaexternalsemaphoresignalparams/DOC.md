---
name: runtime-struct-cudaexternalsemaphoresignalparams
description: '**Source:** structcudaExternalSemaphoreSignalParams.html#structcudaExternalSemaphoreSignalParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.26. cudaExternalSemaphoreSignalParams

**Source:** structcudaExternalSemaphoreSignalParams.html#structcudaExternalSemaphoreSignalParams


### Public Variables

void * fence

cudaExternalSemaphoreSignalParams::@15::@16 fence

unsigned int flags

cudaExternalSemaphoreSignalParams::@15::@18 keyedMutex

unsigned long long value


### Variables

void * cudaExternalSemaphoreSignalParams::fence


Pointer to NvSciSyncFence. Valid if cudaExternalSemaphoreHandleType is of type cudaExternalSemaphoreHandleTypeNvSciSync.

cudaExternalSemaphoreSignalParams::@15::@16 cudaExternalSemaphoreSignalParams::fence


Parameters for fence objects

unsigned int cudaExternalSemaphoreSignalParams::flags


Only when cudaExternalSemaphoreSignalParams is used to signal a cudaExternalSemaphore_t of type cudaExternalSemaphoreHandleTypeNvSciSync, the valid flag is cudaExternalSemaphoreSignalSkipNvSciBufMemSync: which indicates that while signaling the cudaExternalSemaphore_t, no memory synchronization operations should be performed for any external memory object imported as cudaExternalMemoryHandleTypeNvSciBuf. For all other types of cudaExternalSemaphore_t, flags must be zero.

cudaExternalSemaphoreSignalParams::@15::@18 cudaExternalSemaphoreSignalParams::keyedMutex


Parameters for keyed mutex objects

unsigned long long cudaExternalSemaphoreSignalParams::value


Value of fence to be signaled

* * *

!


Copyright © 2025 NVIDIA Corporation