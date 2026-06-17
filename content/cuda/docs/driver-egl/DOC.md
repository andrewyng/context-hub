---
name: driver-egl
description: '**Source:** group__CUDA__EGL.html#group__CUDA__EGL'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.45. EGL Interoperability

**Source:** group__CUDA__EGL.html#group__CUDA__EGL


### Functions

CUresult cuEGLStreamConsumerAcquireFrame ( CUeglStreamConnection* conn, CUgraphicsResource* pCudaResource, CUstream* pStream, unsigned int  timeout )


Acquire an image frame from the EGLStream with CUDA as a consumer.

######  Parameters

`conn`
    \- Connection on which to acquire
`pCudaResource`
    \- CUDA resource on which the stream frame will be mapped for use.
`pStream`
    \- CUDA stream for synchronization and any data migrations implied by CUeglResourceLocationFlags.
`timeout`
    \- Desired timeout in usec for a new frame to be acquired. If set as CUDA_EGL_INFINITE_TIMEOUT, acquire waits infinitely. After timeout occurs CUDA consumer tries to acquire an old frame if available and EGL_SUPPORT_REUSE_NV flag is set.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_LAUNCH_TIMEOUT

###### Description

Acquire an image frame from EGLStreamKHR. This API can also acquire an old frame presented by the producer unless explicitly disabled by setting EGL_SUPPORT_REUSE_NV flag to EGL_FALSE during stream initialization. By default, EGLStream is created with this flag set to EGL_TRUE. cuGraphicsResourceGetMappedEglFrame can be called on `pCudaResource` to get CUeglFrame.

CUresult cuEGLStreamConsumerConnect ( CUeglStreamConnection* conn, EGLStreamKHR stream )


Connect CUDA to EGLStream as a consumer.

######  Parameters

`conn`
    \- Pointer to the returned connection handle
`stream`
    \- EGLStreamKHR handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Connect CUDA as a consumer to EGLStreamKHR specified by `stream`.

The EGLStreamKHR is an EGL object that transfers a sequence of image frames from one API to another.

CUresult cuEGLStreamConsumerConnectWithFlags ( CUeglStreamConnection* conn, EGLStreamKHR stream, unsigned int  flags )


Connect CUDA to EGLStream as a consumer with given flags.

######  Parameters

`conn`
    \- Pointer to the returned connection handle
`stream`
    \- EGLStreamKHR handle
`flags`
    \- Flags denote intended location - system or video.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Connect CUDA as a consumer to EGLStreamKHR specified by `stream` with specified `flags` defined by CUeglResourceLocationFlags.

The flags specify whether the consumer wants to access frames from system memory or video memory. Default is CU_EGL_RESOURCE_LOCATION_VIDMEM.

CUresult cuEGLStreamConsumerDisconnect ( CUeglStreamConnection* conn )


Disconnect CUDA as a consumer to EGLStream .

######  Parameters

`conn`
    \- Conection to disconnect.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Disconnect CUDA as a consumer to EGLStreamKHR.

CUresult cuEGLStreamConsumerReleaseFrame ( CUeglStreamConnection* conn, CUgraphicsResource pCudaResource, CUstream* pStream )


Releases the last frame acquired from the EGLStream.

######  Parameters

`conn`
    \- Connection on which to release
`pCudaResource`
    \- CUDA resource whose corresponding frame is to be released
`pStream`
    \- CUDA stream on which release will be done.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE

###### Description

Release the acquired image frame specified by `pCudaResource` to EGLStreamKHR. If EGL_SUPPORT_REUSE_NV flag is set to EGL_TRUE, at the time of EGL creation this API doesn't release the last frame acquired on the EGLStream. By default, EGLStream is created with this flag set to EGL_TRUE.

CUresult cuEGLStreamProducerConnect ( CUeglStreamConnection* conn, EGLStreamKHR stream, EGLint width, EGLint height )


Connect CUDA to EGLStream as a producer.

######  Parameters

`conn`
    \- Pointer to the returned connection handle
`stream`
    \- EGLStreamKHR handle
`width`
    \- width of the image to be submitted to the stream
`height`
    \- height of the image to be submitted to the stream

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Connect CUDA as a producer to EGLStreamKHR specified by `stream`.

The EGLStreamKHR is an EGL object that transfers a sequence of image frames from one API to another.

CUresult cuEGLStreamProducerDisconnect ( CUeglStreamConnection* conn )


Disconnect CUDA as a producer to EGLStream .

######  Parameters

`conn`
    \- Conection to disconnect.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Disconnect CUDA as a producer to EGLStreamKHR.

CUresult cuEGLStreamProducerPresentFrame ( CUeglStreamConnection* conn, CUeglFrame eglframe, CUstream* pStream )


Present a CUDA eglFrame to the EGLStream with CUDA as a producer.

######  Parameters

`conn`
    \- Connection on which to present the CUDA array
`eglframe`
    \- CUDA Eglstream Proucer Frame handle to be sent to the consumer over EglStream.
`pStream`
    \- CUDA stream on which to present the frame.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE

###### Description

When a frame is presented by the producer, it gets associated with the EGLStream and thus it is illegal to free the frame before the producer is disconnected. If a frame is freed and reused it may lead to undefined behavior.

If producer and consumer are on different GPUs (iGPU and dGPU) then frametype CU_EGL_FRAME_TYPE_ARRAY is not supported. CU_EGL_FRAME_TYPE_PITCH can be used for such cross-device applications.

The CUeglFrame is defined as:


    ‎ typedef struct CUeglFrame_st {
               union {
                   CUarray pArray[MAX_PLANES];
                   void*   pPitch[MAX_PLANES];
               } frame;
               unsigned int width;
               unsigned int height;
               unsigned int depth;
               unsigned int pitch;
               unsigned int planeCount;
               unsigned int numChannels;
               CUeglFrameType frameType;
               CUeglColorFormat eglColorFormat;
               CUarray_format cuFormat;
           } CUeglFrame;

For CUeglFrame of type CU_EGL_FRAME_TYPE_PITCH, the application may present sub-region of a memory allocation. In that case, the pitched pointer will specify the start address of the sub-region in the allocation and corresponding CUeglFrame fields will specify the dimensions of the sub-region.

CUresult cuEGLStreamProducerReturnFrame ( CUeglStreamConnection* conn, CUeglFrame* eglframe, CUstream* pStream )


Return the CUDA eglFrame to the EGLStream released by the consumer.

######  Parameters

`conn`
    \- Connection on which to return
`eglframe`
    \- CUDA Eglstream Proucer Frame handle returned from the consumer over EglStream.
`pStream`
    \- CUDA stream on which to return the frame.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_LAUNCH_TIMEOUT

###### Description

This API can potentially return CUDA_ERROR_LAUNCH_TIMEOUT if the consumer has not returned a frame to EGL stream. If timeout is returned the application can retry.

CUresult cuEventCreateFromEGLSync ( CUevent* phEvent, EGLSyncKHR eglSync, unsigned int  flags )


Creates an event from EGLSync object.

######  Parameters

`phEvent`
    \- Returns newly created event
`eglSync`
    \- Opaque handle to EGLSync object
`flags`
    \- Event creation flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Creates an event *phEvent from an EGLSyncKHR eglSync with the flags specified via `flags`. Valid flags include:

  * CU_EVENT_DEFAULT: Default event creation flag.

  * CU_EVENT_BLOCKING_SYNC: Specifies that the created event should use blocking synchronization. A CPU thread that uses cuEventSynchronize() to wait on an event created with this flag will block until the event has actually been completed.


Once the `eglSync` gets destroyed, cuEventDestroy is the only API that can be invoked on the event.

cuEventRecord and TimingData are not supported for events created from EGLSync.

The EGLSyncKHR is an opaque handle to an EGL sync object. typedef void* EGLSyncKHR

CUresult cuGraphicsEGLRegisterImage ( CUgraphicsResource* pCudaResource, EGLImageKHR image, unsigned int  flags )


Registers an EGL image.

######  Parameters

`pCudaResource`
    \- Pointer to the returned object handle
`image`
    \- An EGLImageKHR image which can be used to create target resource.
`flags`
    \- Map flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_ALREADY_MAPPED, CUDA_ERROR_INVALID_CONTEXT

###### Description

Registers the EGLImageKHR specified by `image` for access by CUDA. A handle to the registered object is returned as `pCudaResource`. Additional Mapping/Unmapping is not required for the registered resource and cuGraphicsResourceGetMappedEglFrame can be directly called on the `pCudaResource`.

The application will be responsible for synchronizing access to shared objects. The application must ensure that any pending operation which access the objects have completed before passing control to CUDA. This may be accomplished by issuing and waiting for glFinish command on all GLcontexts (for OpenGL and likewise for other APIs). The application will be also responsible for ensuring that any pending operation on the registered CUDA resource has completed prior to executing subsequent commands in other APIs accesing the same memory objects. This can be accomplished by calling cuCtxSynchronize or cuEventSynchronize (preferably).

The surface's intended usage is specified using `flags`, as follows:

  * CU_GRAPHICS_MAP_RESOURCE_FLAGS_NONE: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA. This is the default value.

  * CU_GRAPHICS_MAP_RESOURCE_FLAGS_READ_ONLY: Specifies that CUDA will not write to this resource.

  * CU_GRAPHICS_MAP_RESOURCE_FLAGS_WRITE_DISCARD: Specifies that CUDA will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


The EGLImageKHR is an object which can be used to create EGLImage target resource. It is defined as a void pointer. typedef void* EGLImageKHR

CUresult cuGraphicsResourceGetMappedEglFrame ( CUeglFrame* eglFrame, CUgraphicsResource resource, unsigned int  index, unsigned int  mipLevel )


Get an eglFrame through which to access a registered EGL graphics resource.

######  Parameters

`eglFrame`
    \- Returned eglFrame.
`resource`
    \- Registered resource to access.
`index`
    \- Index for cubemap surfaces.
`mipLevel`
    \- Mipmap level for the subresource to access.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_MAPPED

###### Description

Returns in `*eglFrame` an eglFrame pointer through which the registered graphics resource `resource` may be accessed. This API can only be called for registered EGL graphics resources.

The CUeglFrame is defined as:


    ‎ typedef struct CUeglFrame_st {
               union {
                   CUarray pArray[MAX_PLANES];
                   void*   pPitch[MAX_PLANES];
               } frame;
               unsigned int width;
               unsigned int height;
               unsigned int depth;
               unsigned int pitch;
               unsigned int planeCount;
               unsigned int numChannels;
               CUeglFrameType frameType;
               CUeglColorFormat eglColorFormat;
               CUarray_format cuFormat;
           } CUeglFrame;

If `resource` is not registered then CUDA_ERROR_NOT_MAPPED is returned. *
