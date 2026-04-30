---
name: runtime-struct-cudamempoolprops
description: '**Source:** structcudaMemPoolProps.html#structcudaMemPoolProps'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.56. cudaMemPoolProps

**Source:** structcudaMemPoolProps.html#structcudaMemPoolProps


### Public Variables

enumcudaMemAllocationType allocType

enumcudaMemAllocationHandleType handleTypes

struct cudaMemLocation location

size_t maxSize

unsigned char reserved[54]

unsigned short usage

void * win32SecurityAttributes


### Variables

enumcudaMemAllocationTypecudaMemPoolProps::allocType


Allocation type. Currently must be specified as cudaMemAllocationTypePinned

enumcudaMemAllocationHandleTypecudaMemPoolProps::handleTypes


Handle types that will be supported by allocations from the pool.

struct cudaMemLocationcudaMemPoolProps::location


Location allocations should reside.

size_t cudaMemPoolProps::maxSize


Maximum pool size. When set to 0, defaults to a system dependent value.

unsigned char cudaMemPoolProps::reserved[54]


reserved for future use, must be 0

unsigned short cudaMemPoolProps::usage


Bitmask indicating intended usage for the pool.

void * cudaMemPoolProps::win32SecurityAttributes


Windows-specific LPSECURITYATTRIBUTES required when cudaMemHandleTypeWin32 is specified. This security attribute defines the scope of which exported allocations may be tranferred to other processes. In all other cases, this field is required to be zero.

* * *

!


Copyright © 2025 NVIDIA Corporation