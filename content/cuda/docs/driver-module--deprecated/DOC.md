---
name: driver-module--deprecated
description: '**Source:** group__CUDA__MODULE__DEPRECATED.html#group__CUDA__MODULE__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.11. Module Management [DEPRECATED]

**Source:** group__CUDA__MODULE__DEPRECATED.html#group__CUDA__MODULE__DEPRECATED


### Functions

CUresult cuModuleGetSurfRef ( CUsurfref* pSurfRef, CUmodule hmod, const char* name )


Returns a handle to a surface reference.

######  Parameters

`pSurfRef`
    \- Returned surface reference
`hmod`
    \- Module to retrieve surface reference from
`name`
    \- Name of surface reference to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_FOUND

###### Deprecated

###### Description

Returns in `*pSurfRef` the handle of the surface reference of name `name` in the module `hmod`. If no surface reference of that name exists, cuModuleGetSurfRef() returns CUDA_ERROR_NOT_FOUND.

CUresult cuModuleGetTexRef ( CUtexref* pTexRef, CUmodule hmod, const char* name )


Returns a handle to a texture reference.

######  Parameters

`pTexRef`
    \- Returned texture reference
`hmod`
    \- Module to retrieve texture reference from
`name`
    \- Name of texture reference to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_FOUND

###### Deprecated

###### Description

Returns in `*pTexRef` the handle of the texture reference of name `name` in the module `hmod`. If no texture reference of that name exists, cuModuleGetTexRef() returns CUDA_ERROR_NOT_FOUND. This texture reference handle should not be destroyed, since it will be destroyed when the module is unloaded.


