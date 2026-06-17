---
name: runtime-d3d11
description: '**Source:** group__CUDART__D3D11.html#group__CUDART__D3D11'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.21. Direct3D 11 Interoperability

**Source:** group__CUDART__D3D11.html#group__CUDART__D3D11


### Enumerations

enum cudaD3D11DeviceList


### Functions

__host__ cudaError_t cudaD3D11GetDevice ( int* device, IDXGIAdapter* pAdapter )


Gets the device number for an adapter.

######  Parameters

`device`
    \- Returns the device corresponding to pAdapter
`pAdapter`
    \- D3D11 adapter to get device for

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Returns in `*device` the CUDA-compatible device corresponding to the adapter `pAdapter` obtained from IDXGIFactory::EnumAdapters. This call will succeed only if a device on adapter `pAdapter` is CUDA-compatible.

**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsMapResources, cudaGraphicsSubResourceGetMappedArray, cudaGraphicsResourceGetMappedPointer, cuD3D11GetDevice

__host__ cudaError_t cudaD3D11GetDevices ( unsigned int* pCudaDeviceCount, int* pCudaDevices, unsigned int  cudaDeviceCount, ID3D11Device* pD3D11Device, cudaD3D11DeviceList deviceList )


Gets the CUDA devices corresponding to a Direct3D 11 device.

######  Parameters

`pCudaDeviceCount`
    \- Returned number of CUDA devices corresponding to `pD3D11Device`
`pCudaDevices`
    \- Returned CUDA devices corresponding to `pD3D11Device`
`cudaDeviceCount`
    \- The size of the output device array `pCudaDevices`
`pD3D11Device`
    \- Direct3D 11 device to query for CUDA devices
`deviceList`
    \- The set of devices to return. This set may be cudaD3D11DeviceListAll for all devices, cudaD3D11DeviceListCurrentFrame for the devices used to render the current frame (in SLI), or cudaD3D11DeviceListNextFrame for the devices used to render the next frame (in SLI).

###### Returns

cudaSuccess, cudaErrorNoDevice, cudaErrorUnknown

###### Description

Returns in `*pCudaDeviceCount` the number of CUDA-compatible devices corresponding to the Direct3D 11 device `pD3D11Device`. Also returns in `*pCudaDevices` at most `cudaDeviceCount` of the the CUDA-compatible devices corresponding to the Direct3D 11 device `pD3D11Device`.

If any of the GPUs being used to render `pDevice` are not CUDA capable then the call will return cudaErrorNoDevice.

**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsMapResources, cudaGraphicsSubResourceGetMappedArray, cudaGraphicsResourceGetMappedPointer, cuD3D11GetDevices

__host__ cudaError_t cudaGraphicsD3D11RegisterResource ( cudaGraphicsResource** resource, ID3D11Resource* pD3DResource, unsigned int  flags )


Register a Direct3D 11 resource for access by CUDA.

######  Parameters

`resource`
    \- Pointer to returned resource handle
`pD3DResource`
    \- Direct3D resource to register
`flags`
    \- Parameters for resource registration

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Description

Registers the Direct3D 11 resource `pD3DResource` for access by CUDA.

If this call is successful, then the application will be able to map and unmap this resource until it is unregistered through cudaGraphicsUnregisterResource(). Also on success, this call will increase the internal reference count on `pD3DResource`. This reference count will be decremented when this resource is unregistered through cudaGraphicsUnregisterResource().

This call potentially has a high-overhead and should not be called every frame in interactive applications.

The type of `pD3DResource` must be one of the following.

  * ID3D11Buffer: may be accessed via a device pointer

  * ID3D11Texture1D: individual subresources of the texture may be accessed via arrays

  * ID3D11Texture2D: individual subresources of the texture may be accessed via arrays

  * ID3D11Texture3D: individual subresources of the texture may be accessed via arrays


The `flags` argument may be used to specify additional parameters at register time. The valid values for this parameter are

  * cudaGraphicsRegisterFlagsNone: Specifies no hints about how this resource will be used.

  * cudaGraphicsRegisterFlagsSurfaceLoadStore: Specifies that CUDA will bind this resource to a surface reference.

  * cudaGraphicsRegisterFlagsTextureGather: Specifies that CUDA will perform texture gather operations on this resource.


Not all Direct3D resources of the above types may be used for interoperability with CUDA. The following are some limitations.

  * The primary rendertarget may not be registered with CUDA.

  * Textures which are not of a format which is 1, 2, or 4 channels of 8, 16, or 32-bit integer or floating-point data cannot be shared.

  * Surfaces of depth or stencil formats cannot be shared.


A complete list of supported DXGI formats is as follows. For compactness the notation A_{B,C,D} represents A_B, A_C, and A_D.

  * DXGI_FORMAT_A8_UNORM

  * DXGI_FORMAT_B8G8R8A8_UNORM

  * DXGI_FORMAT_B8G8R8X8_UNORM

  * DXGI_FORMAT_R16_FLOAT

  * DXGI_FORMAT_R16G16B16A16_{FLOAT,SINT,SNORM,UINT,UNORM}

  * DXGI_FORMAT_R16G16_{FLOAT,SINT,SNORM,UINT,UNORM}

  * DXGI_FORMAT_R16_{SINT,SNORM,UINT,UNORM}

  * DXGI_FORMAT_R32_FLOAT

  * DXGI_FORMAT_R32G32B32A32_{FLOAT,SINT,UINT}

  * DXGI_FORMAT_R32G32_{FLOAT,SINT,UINT}

  * DXGI_FORMAT_R32_{SINT,UINT}

  * DXGI_FORMAT_R8G8B8A8_{SINT,SNORM,UINT,UNORM,UNORM_SRGB}

  * DXGI_FORMAT_R8G8_{SINT,SNORM,UINT,UNORM}

  * DXGI_FORMAT_R8_{SINT,SNORM,UINT,UNORM}


If `pD3DResource` is of incorrect type or is already registered, then cudaErrorInvalidResourceHandle is returned. If `pD3DResource` cannot be registered, then cudaErrorUnknown is returned.

**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsMapResources, cudaGraphicsSubResourceGetMappedArray, cudaGraphicsResourceGetMappedPointer, cuGraphicsD3D11RegisterResource

* * *

!


Copyright © 2025 NVIDIA Corporation