---
name: driver-d3d11--deprecated
description: '**Source:** group__CUDA__D3D11__DEPRECATED.html#group__CUDA__D3D11__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.43.1. Direct3D 11 Interoperability [DEPRECATED]

**Source:** group__CUDA__D3D11__DEPRECATED.html#group__CUDA__D3D11__DEPRECATED


### Functions

CUresult cuD3D11CtxCreate ( CUcontext* pCtx, CUdevice* pCudaDevice, unsigned int  Flags, ID3D11Device* pD3DDevice )


Create a CUDA context for interoperability with Direct3D 11.

######  Parameters

`pCtx`
    \- Returned newly created CUDA context
`pCudaDevice`
    \- Returned pointer to the device on which the context was created
`Flags`
    \- Context creation flags (see cuCtxCreate() for details)
`pD3DDevice`
    \- Direct3D device to create interoperability context with

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_UNKNOWN

###### Deprecated

This function is deprecated as of CUDA 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA context with a D3D11 device in order to achieve maximum interoperability performance.

CUresult cuD3D11CtxCreateOnDevice ( CUcontext* pCtx, unsigned int  flags, ID3D11Device* pD3DDevice, CUdevice cudaDevice )


Create a CUDA context for interoperability with Direct3D 11.

######  Parameters

`pCtx`
    \- Returned newly created CUDA context
`flags`
    \- Context creation flags (see cuCtxCreate() for details)
`pD3DDevice`
    \- Direct3D device to create interoperability context with
`cudaDevice`
    \- The CUDA device on which to create the context. This device must be among the devices returned when querying CU_D3D11_DEVICES_ALL from cuD3D11GetDevices.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_UNKNOWN

###### Deprecated

This function is deprecated as of CUDA 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA context with a D3D11 device in order to achieve maximum interoperability performance.

CUresult cuD3D11GetDirect3DDevice ( ID3D11Device** ppD3DDevice )


Get the Direct3D 11 device against which the current CUDA context was created.

######  Parameters

`ppD3DDevice`
    \- Returned Direct3D device corresponding to CUDA context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT

###### Deprecated

This function is deprecated as of CUDA 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA context with a D3D11 device in order to achieve maximum interoperability performance.


