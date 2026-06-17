---
name: driver-surfobject
description: '**Source:** group__CUDA__SURFOBJECT.html#group__CUDA__SURFOBJECT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.29. Surface Object Management

**Source:** group__CUDA__SURFOBJECT.html#group__CUDA__SURFOBJECT


### Functions

CUresult cuSurfObjectCreate ( CUsurfObject* pSurfObject, const CUDA_RESOURCE_DESC* pResDesc )


Creates a surface object.

######  Parameters

`pSurfObject`
    \- Surface object to create
`pResDesc`
    \- Resource descriptor

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a surface object and returns it in `pSurfObject`. `pResDesc` describes the data to perform surface load/stores on. CUDA_RESOURCE_DESC::resType must be CU_RESOURCE_TYPE_ARRAY and CUDA_RESOURCE_DESC::res::array::hArray must be set to a valid CUDA array handle. CUDA_RESOURCE_DESC::flags must be set to zero.

Surface objects are only supported on devices of compute capability 3.0 or higher. Additionally, a surface object is an opaque value, and, as such, should only be accessed through CUDA API calls.

CUresult cuSurfObjectDestroy ( CUsurfObject surfObject )


Destroys a surface object.

######  Parameters

`surfObject`
    \- Surface object to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Destroys the surface object specified by `surfObject`.

CUresult cuSurfObjectGetResourceDesc ( CUDA_RESOURCE_DESC* pResDesc, CUsurfObject surfObject )


Returns a surface object's resource descriptor.

######  Parameters

`pResDesc`
    \- Resource descriptor
`surfObject`
    \- Surface object

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the resource descriptor for the surface object specified by `surfObject`.
