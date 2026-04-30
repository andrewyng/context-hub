---
name: runtime-surface--object
description: '**Source:** group__CUDART__SURFACE__OBJECT.html#group__CUDART__SURFACE__OBJECT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.27. Surface Object Management

**Source:** group__CUDART__SURFACE__OBJECT.html#group__CUDART__SURFACE__OBJECT


### Functions

__host__ cudaError_t cudaCreateSurfaceObject ( cudaSurfaceObject_t* pSurfObject, const cudaResourceDesc* pResDesc )


Creates a surface object.

######  Parameters

`pSurfObject`
    \- Surface object to create
`pResDesc`
    \- Resource descriptor

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidChannelDescriptor, cudaErrorInvalidResourceHandle

###### Description

Creates a surface object and returns it in `pSurfObject`. `pResDesc` describes the data to perform surface load/stores on. cudaResourceDesc::resType must be cudaResourceTypeArray and cudaResourceDesc::res::array::array must be set to a valid CUDA array handle.

Surface objects are only supported on devices of compute capability 3.0 or higher. Additionally, a surface object is an opaque value, and, as such, should only be accessed through CUDA API calls.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaDestroySurfaceObject, cuSurfObjectCreate

__host__ cudaError_t cudaDestroySurfaceObject ( cudaSurfaceObject_t surfObject )


Destroys a surface object.

######  Parameters

`surfObject`
    \- Surface object to destroy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Destroys the surface object specified by `surfObject`.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaCreateSurfaceObject, cuSurfObjectDestroy

__host__ cudaError_t cudaGetSurfaceObjectResourceDesc ( cudaResourceDesc* pResDesc, cudaSurfaceObject_t surfObject )


Returns a surface object's resource descriptor Returns the resource descriptor for the surface object specified by `surfObject`.

######  Parameters

`pResDesc`
    \- Resource descriptor
`surfObject`
    \- Surface object

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaCreateSurfaceObject, cuSurfObjectGetResourceDesc

* * *

!


Copyright © 2025 NVIDIA Corporation