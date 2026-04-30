---
name: driver-surfref--deprecated
description: '**Source:** group__CUDA__SURFREF__DEPRECATED.html#group__CUDA__SURFREF__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.27. Surface Reference Management [DEPRECATED]

**Source:** group__CUDA__SURFREF__DEPRECATED.html#group__CUDA__SURFREF__DEPRECATED


### Functions

CUresult cuSurfRefGetArray ( CUarray* phArray, CUsurfref hSurfRef )


Passes back the CUDA array bound to a surface reference.

######  Parameters

`phArray`
    \- Surface reference handle
`hSurfRef`
    \- Surface reference handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Deprecated

###### Description

Returns in `*phArray` the CUDA array bound to the surface reference `hSurfRef`, or returns CUDA_ERROR_INVALID_VALUE if the surface reference is not bound to any CUDA array.

CUresult cuSurfRefSetArray ( CUsurfref hSurfRef, CUarray hArray, unsigned int  Flags )


Sets the CUDA array for a surface reference.

######  Parameters

`hSurfRef`
    \- Surface reference handle
`hArray`
    \- CUDA array handle
`Flags`
    \- set to 0

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Deprecated

###### Description

Sets the CUDA array `hArray` to be read and written by the surface reference `hSurfRef`. Any previous CUDA array state associated with the surface reference is superseded by this function. `Flags` must be set to 0. The CUDA_ARRAY3D_SURFACE_LDST flag must have been set for the CUDA array. Any CUDA array previously bound to `hSurfRef` is unbound.
