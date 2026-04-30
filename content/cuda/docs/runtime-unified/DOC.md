---
name: runtime-unified
description: '**Source:** group__CUDART__UNIFIED.html#group__CUDART__UNIFIED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.13. Unified Addressing

**Source:** group__CUDART__UNIFIED.html#group__CUDART__UNIFIED


### Functions

__host__ cudaError_t cudaPointerGetAttributes ( cudaPointerAttributes* attributes, const void* ptr )


Returns attributes about a specified pointer.

######  Parameters

`attributes`
    \- Attributes for the specified pointer
`ptr`
    \- Pointer to get attributes for

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidValue

###### Description

Returns in `*attributes` the attributes of the pointer `ptr`. If pointer was not allocated in, mapped by or registered with context supporting unified addressing cudaErrorInvalidValue is returned.

In CUDA 11.0 forward passing host pointer will return cudaMemoryTypeUnregistered in cudaPointerAttributes::type and call will return cudaSuccess.

The cudaPointerAttributes structure is defined as:


    ‎    struct cudaPointerAttributes {
                  enum cudaMemoryType
                      type;
                  int device;
                  void *devicePointer;
                  void *hostPointer;
              }

In this structure, the individual fields mean

  * cudaPointerAttributes::type identifies type of memory. It can be cudaMemoryTypeUnregistered for unregistered host memory, cudaMemoryTypeHost for registered host memory, cudaMemoryTypeDevice for device memory or cudaMemoryTypeManaged for managed memory.


  * device is the device against which `ptr` was allocated. If `ptr` has memory type cudaMemoryTypeDevice then this identifies the device on which the memory referred to by `ptr` physically resides. If `ptr` has memory type cudaMemoryTypeHost then this identifies the device which was current when the allocation was made (and if that device is deinitialized then this allocation will vanish with that device's state).


  * devicePointer is the device pointer alias through which the memory referred to by `ptr` may be accessed on the current device. If the memory referred to by `ptr` cannot be accessed directly by the current device then this is NULL.


  * hostPointer is the host pointer alias through which the memory referred to by `ptr` may be accessed on the host. If the memory referred to by `ptr` cannot be accessed directly by the host then this is NULL.


  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaGetDeviceCount, cudaGetDevice, cudaSetDevice, cudaChooseDevice, cudaInitDevice, cuPointerGetAttributes

* * *

!


Copyright © 2025 NVIDIA Corporation