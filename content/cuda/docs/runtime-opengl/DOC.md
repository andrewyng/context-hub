---
name: runtime-opengl
description: '**Source:** group__CUDART__OPENGL.html#group__CUDART__OPENGL'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.15. OpenGL Interoperability

**Source:** group__CUDART__OPENGL.html#group__CUDART__OPENGL


### Enumerations

enum cudaGLDeviceList


### Functions

__host__ cudaError_t cudaGLGetDevices ( unsigned int* pCudaDeviceCount, int* pCudaDevices, unsigned int  cudaDeviceCount, cudaGLDeviceList deviceList )


Gets the CUDA devices associated with the current OpenGL context.

######  Parameters

`pCudaDeviceCount`
    \- Returned number of CUDA devices corresponding to the current OpenGL context
`pCudaDevices`
    \- Returned CUDA devices corresponding to the current OpenGL context
`cudaDeviceCount`
    \- The size of the output device array `pCudaDevices`
`deviceList`
    \- The set of devices to return. This set may be cudaGLDeviceListAll for all devices, cudaGLDeviceListCurrentFrame for the devices used to render the current frame (in SLI), or cudaGLDeviceListNextFrame for the devices used to render the next frame (in SLI).

###### Returns

cudaSuccess, cudaErrorNoDevice, cudaErrorInvalidGraphicsContext, cudaErrorOperatingSystem, cudaErrorUnknown

###### Description

Returns in `*pCudaDeviceCount` the number of CUDA-compatible devices corresponding to the current OpenGL context. Also returns in `*pCudaDevices` at most `cudaDeviceCount` of the CUDA-compatible devices corresponding to the current OpenGL context. If any of the GPUs being used by the current OpenGL context are not CUDA capable then the call will return cudaErrorNoDevice.

  * This function is not supported on Mac OS X.

  *
**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsMapResources, cudaGraphicsSubResourceGetMappedArray, cudaGraphicsResourceGetMappedPointer, cuGLGetDevices

__host__ cudaError_t cudaGraphicsGLRegisterBuffer ( cudaGraphicsResource** resource, GLuint buffer, unsigned int  flags )


Registers an OpenGL buffer object.

######  Parameters

`resource`
    \- Pointer to the returned object handle
`buffer`
    \- name of buffer object to be registered
`flags`
    \- Register flags

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorOperatingSystem, cudaErrorUnknown

###### Description

Registers the buffer object specified by `buffer` for access by CUDA. A handle to the registered object is returned as `resource`. The register flags `flags` specify the intended usage, as follows:

  * cudaGraphicsRegisterFlagsNone: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA. This is the default value.

  * cudaGraphicsRegisterFlagsReadOnly: Specifies that CUDA will not write to this resource.

  * cudaGraphicsRegisterFlagsWriteDiscard: Specifies that CUDA will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsMapResources, cudaGraphicsResourceGetMappedPointer, cuGraphicsGLRegisterBuffer

__host__ cudaError_t cudaGraphicsGLRegisterImage ( cudaGraphicsResource** resource, GLuint image, GLenum target, unsigned int  flags )


Register an OpenGL texture or renderbuffer object.

######  Parameters

`resource`
    \- Pointer to the returned object handle
`image`
    \- name of texture or renderbuffer object to be registered
`target`
    \- Identifies the type of object specified by `image`
`flags`
    \- Register flags

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorOperatingSystem, cudaErrorUnknown

###### Description

Registers the texture or renderbuffer object specified by `image` for access by CUDA. A handle to the registered object is returned as `resource`.

`target` must match the type of the object, and must be one of GL_TEXTURE_2D, GL_TEXTURE_RECTANGLE, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_3D, GL_TEXTURE_2D_ARRAY, or GL_RENDERBUFFER.

The register flags `flags` specify the intended usage, as follows:

  * cudaGraphicsRegisterFlagsNone: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA. This is the default value.

  * cudaGraphicsRegisterFlagsReadOnly: Specifies that CUDA will not write to this resource.

  * cudaGraphicsRegisterFlagsWriteDiscard: Specifies that CUDA will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.

  * cudaGraphicsRegisterFlagsSurfaceLoadStore: Specifies that CUDA will bind this resource to a surface reference.

  * cudaGraphicsRegisterFlagsTextureGather: Specifies that CUDA will perform texture gather operations on this resource.


The following image formats are supported. For brevity's sake, the list is abbreviated. For ex., {GL_R, GL_RG} X {8, 16} would expand to the following 4 formats {GL_R8, GL_R16, GL_RG8, GL_RG16} :

  * GL_RED, GL_RG, GL_RGBA, GL_LUMINANCE, GL_ALPHA, GL_LUMINANCE_ALPHA, GL_INTENSITY

  * {GL_R, GL_RG, GL_RGBA} X {8, 16, 16F, 32F, 8UI, 16UI, 32UI, 8I, 16I, 32I}

  * {GL_LUMINANCE, GL_ALPHA, GL_LUMINANCE_ALPHA, GL_INTENSITY} X {8, 16, 16F_ARB, 32F_ARB, 8UI_EXT, 16UI_EXT, 32UI_EXT, 8I_EXT, 16I_EXT, 32I_EXT}


The following image classes are currently disallowed:

  * Textures with borders

  * Multisampled renderbuffers


**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsMapResources, cudaGraphicsSubResourceGetMappedArray, cuGraphicsGLRegisterImage

__host__ cudaError_t cudaWGLGetDevice ( int* device, HGPUNV hGpu )


Gets the CUDA device associated with hGpu.

######  Parameters

`device`
    \- Returns the device associated with hGpu, or -1 if hGpu is not a compute device.
`hGpu`
    \- Handle to a GPU, as queried via WGL_NV_gpu_affinity

###### Returns

cudaSuccess

###### Description

Returns the CUDA device associated with a hGpu, if applicable.

**See also:**

WGL_NV_gpu_affinity, cuWGLGetDevice

* * *

!


Copyright © 2025 NVIDIA Corporation