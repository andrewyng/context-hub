---
name: runtime-d3d9--deprecated
description: '**Source:** group__CUDART__D3D9__DEPRECATED.html#group__CUDART__D3D9__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.18. Direct3D 9 Interoperability [DEPRECATED]

**Source:** group__CUDART__D3D9__DEPRECATED.html#group__CUDART__D3D9__DEPRECATED


### Enumerations

enum cudaD3D9MapFlags

enum cudaD3D9RegisterFlags


### Functions

__host__ cudaError_t cudaD3D9MapResources ( int  count, IDirect3DResource9** ppResources )


Map Direct3D resources for access by CUDA.

######  Parameters

`count`
    \- Number of resources to map for CUDA
`ppResources`
    \- Resources to map for CUDA

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Maps the `count` Direct3D resources in `ppResources` for access by CUDA.

The resources in `ppResources` may be accessed in CUDA kernels until they are unmapped. Direct3D should not access any resources while they are mapped by CUDA. If an application does so, the results are undefined.

This function provides the synchronization guarantee that any Direct3D calls issued before cudaD3D9MapResources() will complete before any CUDA kernels issued after cudaD3D9MapResources() begin.

If any of `ppResources` have not been registered for use with CUDA or if `ppResources` contains any duplicate entries then cudaErrorInvalidResourceHandle is returned. If any of `ppResources` are presently mapped for access by CUDA then cudaErrorUnknown is returned.

**See also:**

cudaGraphicsMapResources

__host__ cudaError_t cudaD3D9RegisterResource ( IDirect3DResource9* pResource, unsigned int  flags )


Registers a Direct3D resource for access by CUDA.

######  Parameters

`pResource`
    \- Resource to register
`flags`
    \- Parameters for resource registration

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Registers the Direct3D resource `pResource` for access by CUDA.

If this call is successful, then the application will be able to map and unmap this resource until it is unregistered through cudaD3D9UnregisterResource(). Also on success, this call will increase the internal reference count on `pResource`. This reference count will be decremented when this resource is unregistered through cudaD3D9UnregisterResource().

This call potentially has a high-overhead and should not be called every frame in interactive applications.

The type of `pResource` must be one of the following.

  * IDirect3DVertexBuffer9: No notes.

  * IDirect3DIndexBuffer9: No notes.

  * IDirect3DSurface9: Only stand-alone objects of type IDirect3DSurface9 may be explicitly shared. In particular, individual mipmap levels and faces of cube maps may not be registered directly. To access individual surfaces associated with a texture, one must register the base texture object.

  * IDirect3DBaseTexture9: When a texture is registered, all surfaces associated with all mipmap levels of all faces of the texture will be accessible to CUDA.


The `flags` argument specifies the mechanism through which CUDA will access the Direct3D resource. The following value is allowed:

  * cudaD3D9RegisterFlagsNone: Specifies that CUDA will access this resource through a `void*`. The pointer, size, and pitch for each subresource of this resource may be queried through cudaD3D9ResourceGetMappedPointer(), cudaD3D9ResourceGetMappedSize(), and cudaD3D9ResourceGetMappedPitch() respectively. This option is valid for all resource types.


Not all Direct3D resources of the above types may be used for interoperability with CUDA. The following are some limitations:

  * The primary rendertarget may not be registered with CUDA.

  * Resources allocated as shared may not be registered with CUDA.

  * Any resources allocated in D3DPOOL_SYSTEMMEM or D3DPOOL_MANAGED may not be registered with CUDA.

  * Textures which are not of a format which is 1, 2, or 4 channels of 8, 16, or 32-bit integer or floating-point data cannot be shared.

  * Surfaces of depth or stencil formats cannot be shared.


If Direct3D interoperability is not initialized on this context, then cudaErrorInvalidDevice is returned. If `pResource` is of incorrect type (e.g, is a non-stand-alone IDirect3DSurface9) or is already registered, then cudaErrorInvalidResourceHandle is returned. If `pResource` cannot be registered then cudaErrorUnknown is returned.

**See also:**

cudaGraphicsD3D9RegisterResource

__host__ cudaError_t cudaD3D9ResourceGetMappedArray ( cudaArray** ppArray, IDirect3DResource9* pResource, unsigned int  face, unsigned int  level )


Get an array through which to access a subresource of a Direct3D resource which has been mapped for access by CUDA.

######  Parameters

`ppArray`
    \- Returned array corresponding to subresource
`pResource`
    \- Mapped resource to access
`face`
    \- Face of resource to access
`level`
    \- Level of resource to access

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Returns in `*pArray` an array through which the subresource of the mapped Direct3D resource `pResource`, which corresponds to `face` and `level` may be accessed. The value set in `pArray` may change every time that `pResource` is mapped.

If `pResource` is not registered then cudaErrorInvalidResourceHandle is returned. If `pResource` was not registered with usage flags cudaD3D9RegisterFlagsArray, then cudaErrorInvalidResourceHandle is returned. If `pResource` is not mapped, then cudaErrorUnknown is returned.

For usage requirements of `face` and `level` parameters, see cudaD3D9ResourceGetMappedPointer().

**See also:**

cudaGraphicsSubResourceGetMappedArray

__host__ cudaError_t cudaD3D9ResourceGetMappedPitch ( size_t* pPitch, size_t* pPitchSlice, IDirect3DResource9* pResource, unsigned int  face, unsigned int  level )


Get the pitch of a subresource of a Direct3D resource which has been mapped for access by CUDA.

######  Parameters

`pPitch`
    \- Returned pitch of subresource
`pPitchSlice`
    \- Returned Z-slice pitch of subresource
`pResource`
    \- Mapped resource to access
`face`
    \- Face of resource to access
`level`
    \- Level of resource to access

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Returns in `*pPitch` and `*pPitchSlice` the pitch and Z-slice pitch of the subresource of the mapped Direct3D resource `pResource`, which corresponds to `face` and `level`. The values set in `pPitch` and `pPitchSlice` may change every time that `pResource` is mapped.

The pitch and Z-slice pitch values may be used to compute the location of a sample on a surface as follows.

For a 2D surface, the byte offset of the sample at position **x** , **y** from the base pointer of the surface is:

**y** * **pitch** \+ (**bytes per pixel**) * **x**

For a 3D surface, the byte offset of the sample at position **x** , **y** , **z** from the base pointer of the surface is:

**z*** **slicePitch** \+ **y** * **pitch** \+ (**bytes per pixel**) * **x**

Both parameters `pPitch` and `pPitchSlice` are optional and may be set to NULL.

If `pResource` is not of type IDirect3DBaseTexture9 or one of its sub-types or if `pResource` has not been registered for use with CUDA, then cudaErrorInvalidResourceHandle is returned. If `pResource` was not registered with usage flags cudaD3D9RegisterFlagsNone, then cudaErrorInvalidResourceHandle is returned. If `pResource` is not mapped for access by CUDA then cudaErrorUnknown is returned.

For usage requirements of `face` and `level` parameters, see cudaD3D9ResourceGetMappedPointer().

**See also:**

cudaGraphicsResourceGetMappedPointer

__host__ cudaError_t cudaD3D9ResourceGetMappedPointer ( void** pPointer, IDirect3DResource9* pResource, unsigned int  face, unsigned int  level )


Get a pointer through which to access a subresource of a Direct3D resource which has been mapped for access by CUDA.

######  Parameters

`pPointer`
    \- Returned pointer corresponding to subresource
`pResource`
    \- Mapped resource to access
`face`
    \- Face of resource to access
`level`
    \- Level of resource to access

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Returns in `*pPointer` the base pointer of the subresource of the mapped Direct3D resource `pResource`, which corresponds to `face` and `level`. The value set in `pPointer` may change every time that `pResource` is mapped.

If `pResource` is not registered, then cudaErrorInvalidResourceHandle is returned. If `pResource` was not registered with usage flags cudaD3D9RegisterFlagsNone, then cudaErrorInvalidResourceHandle is returned. If `pResource` is not mapped, then cudaErrorUnknown is returned.

If `pResource` is of type IDirect3DCubeTexture9, then `face` must one of the values enumerated by type D3DCUBEMAP_FACES. For all other types, `face` must be 0. If `face` is invalid, then cudaErrorInvalidValue is returned.

If `pResource` is of type IDirect3DBaseTexture9, then `level` must correspond to a valid mipmap level. Only mipmap level 0 is supported for now. For all other types `level` must be 0. If `level` is invalid, then cudaErrorInvalidValue is returned.

**See also:**

cudaGraphicsResourceGetMappedPointer

__host__ cudaError_t cudaD3D9ResourceGetMappedSize ( size_t* pSize, IDirect3DResource9* pResource, unsigned int  face, unsigned int  level )


Get the size of a subresource of a Direct3D resource which has been mapped for access by CUDA.

######  Parameters

`pSize`
    \- Returned size of subresource
`pResource`
    \- Mapped resource to access
`face`
    \- Face of resource to access
`level`
    \- Level of resource to access

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Returns in `*pSize` the size of the subresource of the mapped Direct3D resource `pResource`, which corresponds to `face` and `level`. The value set in `pSize` may change every time that `pResource` is mapped.

If `pResource` has not been registered for use with CUDA then cudaErrorInvalidResourceHandle is returned. If `pResource` was not registered with usage flags cudaD3D9RegisterFlagsNone, then cudaErrorInvalidResourceHandle is returned. If `pResource` is not mapped for access by CUDA then cudaErrorUnknown is returned.

For usage requirements of `face` and `level` parameters, see cudaD3D9ResourceGetMappedPointer().

**See also:**

cudaGraphicsResourceGetMappedPointer

__host__ cudaError_t cudaD3D9ResourceGetSurfaceDimensions ( size_t* pWidth, size_t* pHeight, size_t* pDepth, IDirect3DResource9* pResource, unsigned int  face, unsigned int  level )


Get the dimensions of a registered Direct3D surface.

######  Parameters

`pWidth`
    \- Returned width of surface
`pHeight`
    \- Returned height of surface
`pDepth`
    \- Returned depth of surface
`pResource`
    \- Registered resource to access
`face`
    \- Face of resource to access
`level`
    \- Level of resource to access

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Returns in `*pWidth`, `*pHeight`, and `*pDepth` the dimensions of the subresource of the mapped Direct3D resource `pResource` which corresponds to `face` and `level`.

Since anti-aliased surfaces may have multiple samples per pixel, it is possible that the dimensions of a resource will be an integer factor larger than the dimensions reported by the Direct3D runtime.

The parameters `pWidth`, `pHeight`, and `pDepth` are optional. For 2D surfaces, the value returned in `*pDepth` will be 0.

If `pResource` is not of type IDirect3DBaseTexture9 or IDirect3DSurface9 or if `pResource` has not been registered for use with CUDA, then cudaErrorInvalidResourceHandle is returned.

For usage requirements of `face` and `level` parameters, see cudaD3D9ResourceGetMappedPointer.

**See also:**

cudaGraphicsSubResourceGetMappedArray

__host__ cudaError_t cudaD3D9ResourceSetMapFlags ( IDirect3DResource9* pResource, unsigned int  flags )


Set usage flags for mapping a Direct3D resource.

######  Parameters

`pResource`
    \- Registered resource to set flags for
`flags`
    \- Parameters for resource mapping

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Set flags for mapping the Direct3D resource `pResource`.

Changes to flags will take effect the next time `pResource` is mapped. The `flags` argument may be any of the following:

  * cudaD3D9MapFlagsNone: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA kernels. This is the default value.

  * cudaD3D9MapFlagsReadOnly: Specifies that CUDA kernels which access this resource will not write to this resource.

  * cudaD3D9MapFlagsWriteDiscard: Specifies that CUDA kernels which access this resource will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


If `pResource` has not been registered for use with CUDA, then cudaErrorInvalidResourceHandle is returned. If `pResource` is presently mapped for access by CUDA, then cudaErrorUnknown is returned.

**See also:**

cudaInteropResourceSetMapFlags

__host__ cudaError_t cudaD3D9UnmapResources ( int  count, IDirect3DResource9** ppResources )


Unmap Direct3D resources for access by CUDA.

######  Parameters

`count`
    \- Number of resources to unmap for CUDA
`ppResources`
    \- Resources to unmap for CUDA

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Unmaps the `count` Direct3D resources in `ppResources`.

This function provides the synchronization guarantee that any CUDA kernels issued before cudaD3D9UnmapResources() will complete before any Direct3D calls issued after cudaD3D9UnmapResources() begin.

If any of `ppResources` have not been registered for use with CUDA or if `ppResources` contains any duplicate entries, then cudaErrorInvalidResourceHandle is returned. If any of `ppResources` are not presently mapped for access by CUDA then cudaErrorUnknown is returned.

**See also:**

cudaGraphicsUnmapResources

__host__ cudaError_t cudaD3D9UnregisterResource ( IDirect3DResource9* pResource )


Unregisters a Direct3D resource for access by CUDA.

######  Parameters

`pResource`
    \- Resource to unregister

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Unregisters the Direct3D resource `pResource` so it is not accessible by CUDA unless registered again.

If `pResource` is not registered, then cudaErrorInvalidResourceHandle is returned.

**See also:**

cudaGraphicsUnregisterResource

* * *

!


Copyright © 2025 NVIDIA Corporation