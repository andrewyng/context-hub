---
name: driver-struct-cuda--external--semaphore--signal--params--v1
description: '**Source:** structCUDA__EXTERNAL__SEMAPHORE__SIGNAL__PARAMS__v1.html#structCUDA__EXTERNAL__SEMAPHORE__SIGNAL__PARAMS__v1'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.30. CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1

**Source:** structCUDA__EXTERNAL__SEMAPHORE__SIGNAL__PARAMS__v1.html#structCUDA__EXTERNAL__SEMAPHORE__SIGNAL__PARAMS__v1


### Public Variables

void * fence

CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::@23::@24 fence

unsigned int flags

unsigned long long key

CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::@23::@26 keyedMutex

unsigned long long value


### Variables

void * CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::fence


Pointer to NvSciSyncFence. Valid if CUexternalSemaphoreHandleType is of type CU_EXTERNAL_SEMAPHORE_HANDLE_TYPE_NVSCISYNC.

CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::@23::@24 CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::fence


Parameters for fence objects

unsigned int CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::flags


Only when CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS is used to signal a CUexternalSemaphore of type CU_EXTERNAL_SEMAPHORE_HANDLE_TYPE_NVSCISYNC, the valid flag is CUDA_EXTERNAL_SEMAPHORE_SIGNAL_SKIP_NVSCIBUF_MEMSYNC which indicates that while signaling the CUexternalSemaphore, no memory synchronization operations should be performed for any external memory object imported as CU_EXTERNAL_MEMORY_HANDLE_TYPE_NVSCIBUF. For all other types of CUexternalSemaphore, flags must be zero.

unsigned long long CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::key


Value of key to release the mutex with

CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::@23::@26 CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::keyedMutex


Parameters for keyed mutex objects

unsigned long long CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1::value


Value of fence to be signaled

