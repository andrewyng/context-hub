---
name: runtime-opengl--deprecated
description: '**Source:** group__CUDART__OPENGL__DEPRECATED.html#group__CUDART__OPENGL__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.16. OpenGL Interoperability [DEPRECATED]

**Source:** group__CUDART__OPENGL__DEPRECATED.html#group__CUDART__OPENGL__DEPRECATED


### Enumerations

enum cudaGLMapFlags


### Functions

__host__ cudaError_t cudaGLMapBufferObject ( void** devPtr, GLuint bufObj )


Maps a buffer object for access by CUDA.

######  Parameters

`devPtr`
    \- Returned device pointer to CUDA object
`bufObj`
    \- Buffer object ID to map

###### Returns

cudaSuccess, cudaErrorMapBufferObjectFailed

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Maps the buffer object of ID `bufObj` into the address space of CUDA and returns in `*devPtr` the base pointer of the resulting mapping. The buffer must have previously been registered by calling cudaGLRegisterBufferObject(). While a buffer is mapped by CUDA, any OpenGL operation which references the buffer will result in undefined behavior. The OpenGL context used to create the buffer, or another context from the same share group, must be bound to the current thread when this is called.

All streams in the current thread are synchronized with the current GL context.

**See also:**

cudaGraphicsMapResources

__host__ cudaError_t cudaGLMapBufferObjectAsync ( void** devPtr, GLuint bufObj, cudaStream_t stream )


Maps a buffer object for access by CUDA.

######  Parameters

`devPtr`
    \- Returned device pointer to CUDA object
`bufObj`
    \- Buffer object ID to map
`stream`
    \- Stream to synchronize

###### Returns

cudaSuccess, cudaErrorMapBufferObjectFailed

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Maps the buffer object of ID `bufObj` into the address space of CUDA and returns in `*devPtr` the base pointer of the resulting mapping. The buffer must have previously been registered by calling cudaGLRegisterBufferObject(). While a buffer is mapped by CUDA, any OpenGL operation which references the buffer will result in undefined behavior. The OpenGL context used to create the buffer, or another context from the same share group, must be bound to the current thread when this is called.

Stream /p stream is synchronized with the current GL context.

**See also:**

cudaGraphicsMapResources

__host__ cudaError_t cudaGLRegisterBufferObject ( GLuint bufObj )


Registers a buffer object for access by CUDA.

######  Parameters

`bufObj`
    \- Buffer object ID to register

###### Returns

cudaSuccess, cudaErrorInitializationError

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Registers the buffer object of ID `bufObj` for access by CUDA. This function must be called before CUDA can map the buffer object. The OpenGL context used to create the buffer, or another context from the same share group, must be bound to the current thread when this is called.

**See also:**

cudaGraphicsGLRegisterBuffer

__host__ cudaError_t cudaGLSetBufferObjectMapFlags ( GLuint bufObj, unsigned int  flags )


Set usage flags for mapping an OpenGL buffer.

######  Parameters

`bufObj`
    \- Registered buffer object to set flags for
`flags`
    \- Parameters for buffer mapping

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Set flags for mapping the OpenGL buffer `bufObj`

Changes to flags will take effect the next time `bufObj` is mapped. The `flags` argument may be any of the following:

  * cudaGLMapFlagsNone: Specifies no hints about how this buffer will be used. It is therefore assumed that this buffer will be read from and written to by CUDA kernels. This is the default value.

  * cudaGLMapFlagsReadOnly: Specifies that CUDA kernels which access this buffer will not write to the buffer.

  * cudaGLMapFlagsWriteDiscard: Specifies that CUDA kernels which access this buffer will not read from the buffer and will write over the entire contents of the buffer, so none of the data previously stored in the buffer will be preserved.


If `bufObj` has not been registered for use with CUDA, then cudaErrorInvalidResourceHandle is returned. If `bufObj` is presently mapped for access by CUDA, then cudaErrorUnknown is returned.

**See also:**

cudaGraphicsResourceSetMapFlags

__host__ cudaError_t cudaGLSetGLDevice ( int  device )


Sets a CUDA device to use OpenGL interoperability.

######  Parameters

`device`
    \- Device to use for OpenGL interoperability

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorSetOnActiveProcess

###### Deprecated

This function is deprecated as of CUDA 5.0.

###### Description

This function is deprecated and should no longer be used. It is no longer necessary to associate a CUDA device with an OpenGL context in order to achieve maximum interoperability performance.

This function will immediately initialize the primary context on `device` if needed.

**See also:**

cudaGraphicsGLRegisterBuffer, cudaGraphicsGLRegisterImage

__host__ cudaError_t cudaGLUnmapBufferObject ( GLuint bufObj )


Unmaps a buffer object for access by CUDA.

######  Parameters

`bufObj`
    \- Buffer object to unmap

###### Returns

cudaSuccess, cudaErrorUnmapBufferObjectFailed

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Unmaps the buffer object of ID `bufObj` for access by CUDA. When a buffer is unmapped, the base address returned by cudaGLMapBufferObject() is invalid and subsequent references to the address result in undefined behavior. The OpenGL context used to create the buffer, or another context from the same share group, must be bound to the current thread when this is called.

All streams in the current thread are synchronized with the current GL context.

**See also:**

cudaGraphicsUnmapResources

__host__ cudaError_t cudaGLUnmapBufferObjectAsync ( GLuint bufObj, cudaStream_t stream )


Unmaps a buffer object for access by CUDA.

######  Parameters

`bufObj`
    \- Buffer object to unmap
`stream`
    \- Stream to synchronize

###### Returns

cudaSuccess, cudaErrorUnmapBufferObjectFailed

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Unmaps the buffer object of ID `bufObj` for access by CUDA. When a buffer is unmapped, the base address returned by cudaGLMapBufferObject() is invalid and subsequent references to the address result in undefined behavior. The OpenGL context used to create the buffer, or another context from the same share group, must be bound to the current thread when this is called.

Stream /p stream is synchronized with the current GL context.

**See also:**

cudaGraphicsUnmapResources

__host__ cudaError_t cudaGLUnregisterBufferObject ( GLuint bufObj )


Unregisters a buffer object for access by CUDA.

######  Parameters

`bufObj`
    \- Buffer object to unregister

###### Returns

cudaSuccess

###### Deprecated

This function is deprecated as of CUDA 3.0.

###### Description

Unregisters the buffer object of ID `bufObj` for access by CUDA and releases any CUDA resources associated with the buffer. Once a buffer is unregistered, it may no longer be mapped by CUDA. The GL context used to create the buffer, or another context from the same share group, must be bound to the current thread when this is called.

**See also:**

cudaGraphicsUnregisterResource

* * *

!


Copyright © 2025 NVIDIA Corporation