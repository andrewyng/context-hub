---
name: runtime-d3d11--deprecated
description: '**Source:** group__CUDART__D3D11__DEPRECATED.html#group__CUDART__D3D11__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.22. Direct3D 11 Interoperability [DEPRECATED]

**Source:** group__CUDART__D3D11__DEPRECATED.html#group__CUDART__D3D11__DEPRECATED


### Functions

__host__ cudaError_t cudaD3D11GetDirect3DDevice ( ID3D11Device** ppD3D11Device )


Gets the Direct3D device against which the current CUDA context was created.

######  Parameters

`ppD3D11Device`
    \- Returns the Direct3D device for this thread

###### Returns

cudaSuccess, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA device with a D3D11 device in order to achieve maximum interoperability performance.

**See also:**

cudaD3D11SetDirect3DDevice

__host__ cudaError_t cudaD3D11SetDirect3DDevice ( ID3D11Device* pD3D11Device, int  device = -1 )


Sets the Direct3D 11 device to use for interoperability with a CUDA device.

######  Parameters

`pD3D11Device`
    \- Direct3D device to use for interoperability
`device`
    \- The CUDA device to use. This device must be among the devices returned when querying cudaD3D11DeviceListAll from cudaD3D11GetDevices, may be set to -1 to automatically select an appropriate CUDA device.

###### Returns

cudaSuccess, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorSetOnActiveProcess

###### Deprecated

This function is deprecated as of CUDA 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA device with a D3D11 device in order to achieve maximum interoperability performance.

This function will immediately initialize the primary context on `device` if needed.

**See also:**

cudaD3D11GetDevice, cudaGraphicsD3D11RegisterResource, cudaDeviceReset

* * *

!


Copyright © 2025 NVIDIA Corporation