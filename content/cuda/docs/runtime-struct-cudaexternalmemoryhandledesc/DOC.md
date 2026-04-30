---
name: runtime-struct-cudaexternalmemoryhandledesc
description: '**Source:** structcudaExternalMemoryHandleDesc.html#structcudaExternalMemoryHandleDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.21. cudaExternalMemoryHandleDesc

**Source:** structcudaExternalMemoryHandleDesc.html#structcudaExternalMemoryHandleDesc


### Public Variables

int fd

unsigned int flags

void * handle

const void * name

const void * nvSciBufObject

unsigned int reserved[16]

unsigned long long size

enumcudaExternalMemoryHandleType type

cudaExternalMemoryHandleDesc::@11::@12 win32


### Variables

int cudaExternalMemoryHandleDesc::fd


File descriptor referencing the memory object. Valid when type is cudaExternalMemoryHandleTypeOpaqueFd

unsigned int cudaExternalMemoryHandleDesc::flags


Flags must either be zero or cudaExternalMemoryDedicated

void * cudaExternalMemoryHandleDesc::handle


Valid NT handle. Must be NULL if 'name' is non-NULL

const void * cudaExternalMemoryHandleDesc::name


Name of a valid memory object. Must be NULL if 'handle' is non-NULL.

const void * cudaExternalMemoryHandleDesc::nvSciBufObject


A handle representing NvSciBuf Object. Valid when type is cudaExternalMemoryHandleTypeNvSciBuf

unsigned int cudaExternalMemoryHandleDesc::reserved[16]


Must be zero

unsigned long long cudaExternalMemoryHandleDesc::size


Size of the memory allocation

enumcudaExternalMemoryHandleTypecudaExternalMemoryHandleDesc::type


Type of the handle

cudaExternalMemoryHandleDesc::@11::@12 cudaExternalMemoryHandleDesc::win32


Win32 handle referencing the semaphore object. Valid when type is one of the following:

  * cudaExternalMemoryHandleTypeOpaqueWin32

  * cudaExternalMemoryHandleTypeOpaqueWin32Kmt

  * cudaExternalMemoryHandleTypeD3D12Heap

  * cudaExternalMemoryHandleTypeD3D12Resource

  * cudaExternalMemoryHandleTypeD3D11Resource

  * cudaExternalMemoryHandleTypeD3D11ResourceKmt Exactly one of 'handle' and 'name' must be non-NULL. If type is one of the following: cudaExternalMemoryHandleTypeOpaqueWin32KmtcudaExternalMemoryHandleTypeD3D11ResourceKmt then 'name' must be NULL.


* * *

!


Copyright © 2025 NVIDIA Corporation