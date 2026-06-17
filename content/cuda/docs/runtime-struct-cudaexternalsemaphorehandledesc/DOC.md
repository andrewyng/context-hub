---
name: runtime-struct-cudaexternalsemaphorehandledesc
description: '**Source:** structcudaExternalSemaphoreHandleDesc.html#structcudaExternalSemaphoreHandleDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.23. cudaExternalSemaphoreHandleDesc

**Source:** structcudaExternalSemaphoreHandleDesc.html#structcudaExternalSemaphoreHandleDesc


### Public Variables

int fd

unsigned int flags

void * handle

const void * name

const void * nvSciSyncObj

unsigned int reserved[16]

enumcudaExternalSemaphoreHandleType type

cudaExternalSemaphoreHandleDesc::@13::@14 win32


### Variables

int cudaExternalSemaphoreHandleDesc::fd


File descriptor referencing the semaphore object. Valid when type is one of the following:

  * cudaExternalSemaphoreHandleTypeOpaqueFd

  * cudaExternalSemaphoreHandleTypeTimelineSemaphoreFd


unsigned int cudaExternalSemaphoreHandleDesc::flags


Flags reserved for the future. Must be zero.

void * cudaExternalSemaphoreHandleDesc::handle


Valid NT handle. Must be NULL if 'name' is non-NULL

const void * cudaExternalSemaphoreHandleDesc::name


Name of a valid synchronization primitive. Must be NULL if 'handle' is non-NULL.

const void * cudaExternalSemaphoreHandleDesc::nvSciSyncObj


Valid NvSciSyncObj. Must be non NULL

unsigned int cudaExternalSemaphoreHandleDesc::reserved[16]


Must be zero

enumcudaExternalSemaphoreHandleTypecudaExternalSemaphoreHandleDesc::type


Type of the handle

cudaExternalSemaphoreHandleDesc::@13::@14 cudaExternalSemaphoreHandleDesc::win32


Win32 handle referencing the semaphore object. Valid when type is one of the following:

  * cudaExternalSemaphoreHandleTypeOpaqueWin32

  * cudaExternalSemaphoreHandleTypeOpaqueWin32Kmt

  * cudaExternalSemaphoreHandleTypeD3D12Fence

  * cudaExternalSemaphoreHandleTypeD3D11Fence

  * cudaExternalSemaphoreHandleTypeKeyedMutex

  * cudaExternalSemaphoreHandleTypeTimelineSemaphoreWin32 Exactly one of 'handle' and 'name' must be non-NULL. If type is one of the following: cudaExternalSemaphoreHandleTypeOpaqueWin32KmtcudaExternalSemaphoreHandleTypeKeyedMutexKmt then 'name' must be NULL.


* * *

!


Copyright © 2025 NVIDIA Corporation