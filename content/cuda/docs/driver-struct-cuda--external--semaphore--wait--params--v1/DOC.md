---
name: driver-struct-cuda--external--semaphore--wait--params--v1
description: '**Source:** structCUDA__EXTERNAL__SEMAPHORE__WAIT__PARAMS__v1.html#structCUDA__EXTERNAL__SEMAPHORE__WAIT__PARAMS__v1'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.31. CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1

**Source:** structCUDA__EXTERNAL__SEMAPHORE__WAIT__PARAMS__v1.html#structCUDA__EXTERNAL__SEMAPHORE__WAIT__PARAMS__v1


### Public Variables

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::@27::@28 fence

unsigned int flags

unsigned long long key

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::@27::@30 keyedMutex

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::@27::@29 nvSciSync

unsigned int timeoutMs

unsigned long long value


### Variables

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::@27::@28 CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::fence


Parameters for fence objects

unsigned int CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::flags


Only when CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS is used to wait on a CUexternalSemaphore of type CU_EXTERNAL_SEMAPHORE_HANDLE_TYPE_NVSCISYNC, the valid flag is CUDA_EXTERNAL_SEMAPHORE_WAIT_SKIP_NVSCIBUF_MEMSYNC which indicates that while waiting for the CUexternalSemaphore, no memory synchronization operations should be performed for any external memory object imported as CU_EXTERNAL_MEMORY_HANDLE_TYPE_NVSCIBUF. For all other types of CUexternalSemaphore, flags must be zero.

unsigned long long CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::key


Value of key to acquire the mutex with

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::@27::@30 CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::keyedMutex


Parameters for keyed mutex objects

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::@27::@29 CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::nvSciSync


Pointer to NvSciSyncFence. Valid if CUexternalSemaphoreHandleType is of type CU_EXTERNAL_SEMAPHORE_HANDLE_TYPE_NVSCISYNC.

unsigned int CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::timeoutMs


Timeout in milliseconds to wait to acquire the mutex

unsigned long long CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1::value


Value of fence to be waited on

