---
name: driver-gl--deprecated
description: '**Source:** group__CUDA__GL__DEPRECATED.html#group__CUDA__GL__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.40.1. OpenGL Interoperability [DEPRECATED]

**Source:** group__CUDA__GL__DEPRECATED.html#group__CUDA__GL__DEPRECATED


### Enumerations

enum CUGLmap_flags


### Functions

CUresult cuGLCtxCreate ( CUcontext* pCtx, unsigned int  Flags, CUdevice device )


Create a CUDA context for interoperability with OpenGL.

######  Parameters

`pCtx`
    \- Returned CUDA context
`Flags`
    \- Options for CUDA context creation
`device`
    \- Device on which to create the context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Deprecated

This function is deprecated as of Cuda 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA context with an OpenGL context in order to achieve maximum interoperability performance.

CUresult cuGLInit ( void )


Initializes OpenGL interoperability.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_UNKNOWN

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Initializes OpenGL interoperability. This function is deprecated and calling it is no longer required. It may fail if the needed OpenGL driver facilities are not available.

CUresult cuGLMapBufferObject ( CUdeviceptr* dptr, size_t* size, GLuint buffer )


Maps an OpenGL buffer object.

######  Parameters

`dptr`
    \- Returned mapped base pointer
`size`
    \- Returned size of mapping
`buffer`
    \- The name of the buffer object to map

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_MAP_FAILED

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Maps the buffer object specified by `buffer` into the address space of the current CUDA context and returns in `*dptr` and `*size` the base pointer and size of the resulting mapping.

There must be a valid OpenGL context bound to the current thread when this function is called. This must be the same context, or a member of the same shareGroup, as the context that was bound when the buffer was registered.

All streams in the current CUDA context are synchronized with the current GL context.

CUresult cuGLMapBufferObjectAsync ( CUdeviceptr* dptr, size_t* size, GLuint buffer, CUstream hStream )


Maps an OpenGL buffer object.

######  Parameters

`dptr`
    \- Returned mapped base pointer
`size`
    \- Returned size of mapping
`buffer`
    \- The name of the buffer object to map
`hStream`
    \- Stream to synchronize

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_MAP_FAILED

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Maps the buffer object specified by `buffer` into the address space of the current CUDA context and returns in `*dptr` and `*size` the base pointer and size of the resulting mapping.

There must be a valid OpenGL context bound to the current thread when this function is called. This must be the same context, or a member of the same shareGroup, as the context that was bound when the buffer was registered.

Stream `hStream` in the current CUDA context is synchronized with the current GL context.

CUresult cuGLRegisterBufferObject ( GLuint buffer )


Registers an OpenGL buffer object.

######  Parameters

`buffer`
    \- The name of the buffer object to register.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_ALREADY_MAPPED

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Registers the buffer object specified by `buffer` for access by CUDA. This function must be called before CUDA can map the buffer object. There must be a valid OpenGL context bound to the current thread when this function is called, and the buffer name is resolved by that context.

CUresult cuGLSetBufferObjectMapFlags ( GLuint buffer, unsigned int  Flags )


Set the map flags for an OpenGL buffer object.

######  Parameters

`buffer`
    \- Buffer object to unmap
`Flags`
    \- Map flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_ALREADY_MAPPED, CUDA_ERROR_INVALID_CONTEXT

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Sets the map flags for the buffer object specified by `buffer`.

Changes to `Flags` will take effect the next time `buffer` is mapped. The `Flags` argument may be any of the following:

  * CU_GL_MAP_RESOURCE_FLAGS_NONE: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA kernels. This is the default value.

  * CU_GL_MAP_RESOURCE_FLAGS_READ_ONLY: Specifies that CUDA kernels which access this resource will not write to this resource.

  * CU_GL_MAP_RESOURCE_FLAGS_WRITE_DISCARD: Specifies that CUDA kernels which access this resource will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


If `buffer` has not been registered for use with CUDA, then CUDA_ERROR_INVALID_HANDLE is returned. If `buffer` is presently mapped for access by CUDA, then CUDA_ERROR_ALREADY_MAPPED is returned.

There must be a valid OpenGL context bound to the current thread when this function is called. This must be the same context, or a member of the same shareGroup, as the context that was bound when the buffer was registered.

CUresult cuGLUnmapBufferObject ( GLuint buffer )


Unmaps an OpenGL buffer object.

######  Parameters

`buffer`
    \- Buffer object to unmap

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Unmaps the buffer object specified by `buffer` for access by CUDA.

There must be a valid OpenGL context bound to the current thread when this function is called. This must be the same context, or a member of the same shareGroup, as the context that was bound when the buffer was registered.

All streams in the current CUDA context are synchronized with the current GL context.

CUresult cuGLUnmapBufferObjectAsync ( GLuint buffer, CUstream hStream )


Unmaps an OpenGL buffer object.

######  Parameters

`buffer`
    \- Name of the buffer object to unmap
`hStream`
    \- Stream to synchronize

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Unmaps the buffer object specified by `buffer` for access by CUDA.

There must be a valid OpenGL context bound to the current thread when this function is called. This must be the same context, or a member of the same shareGroup, as the context that was bound when the buffer was registered.

Stream `hStream` in the current CUDA context is synchronized with the current GL context.

CUresult cuGLUnregisterBufferObject ( GLuint buffer )


Unregister an OpenGL buffer object.

######  Parameters

`buffer`
    \- Name of the buffer object to unregister

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Deprecated

This function is deprecated as of Cuda 3.0.

###### Description

Unregisters the buffer object specified by `buffer`. This releases any resources associated with the registered buffer. After this call, the buffer may no longer be mapped for access by CUDA.

There must be a valid OpenGL context bound to the current thread when this function is called. This must be the same context, or a member of the same shareGroup, as the context that was bound when the buffer was registered.


