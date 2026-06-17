---
name: runtime-driver
description: '**Source:** group__CUDART__DRIVER.html#group__CUDART__DRIVER'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.35. Interactions with the CUDA Driver API

**Source:** group__CUDART__DRIVER.html#group__CUDART__DRIVER


### Functions

__host__ cudaError_t cudaGetFuncBySymbol ( cudaFunction_t* functionPtr, const void* symbolPtr )


Get pointer to device entry function that matches entry function `symbolPtr`.

######  Parameters

`functionPtr`
    \- Returns the device entry function
`symbolPtr`
    \- Pointer to device entry function to search for

###### Returns

cudaSuccess

###### Description

Returns in `functionPtr` the device entry function corresponding to the symbol `symbolPtr`.

__host__ cudaError_t cudaGetKernel ( cudaKernel_t* kernelPtr, const void* entryFuncAddr )


Get pointer to device kernel that matches entry function `entryFuncAddr`.

######  Parameters

`kernelPtr`
    \- Returns the device kernel
`entryFuncAddr`
    \- Address of device entry function to search kernel for

###### Returns

cudaSuccess

###### Description

Returns in `kernelPtr` the device kernel corresponding to the entry function `entryFuncAddr`.

Note that it is possible that there are multiple symbols belonging to different translation units with the same `entryFuncAddr` registered with this CUDA Runtime and so the order which the translation units are loaded and registered with the CUDA Runtime can lead to differing return pointers in `kernelPtr` . Suggested methods of ensuring uniqueness are to limit visibility of __global__ device functions by using static or hidden visibility attribute in the respective translation units.

**See also:**

cudaGetKernel (C++ API)

* * *

!


Copyright © 2025 NVIDIA Corporation