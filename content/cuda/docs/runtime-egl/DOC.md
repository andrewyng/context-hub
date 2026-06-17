---
name: runtime-egl
description: '**Source:** group__CUDART__EGL.html#group__CUDART__EGL'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.24. EGL Interoperability

**Source:** group__CUDART__EGL.html#group__CUDART__EGL


### Functions

__host__ cudaError_t cudaEGLStreamConsumerAcquireFrame ( cudaEglStreamConnection* conn, cudaGraphicsResource_t* pCudaResource, cudaStream_t* pStream, unsigned int  timeout )


Acquire an image frame from the EGLStream with CUDA as a consumer.

######  Parameters

`conn`
    \- Connection on which to acquire
`pCudaResource`
    \- CUDA resource on which the EGLStream frame will be mapped for use.
`pStream`
    \- CUDA stream for synchronization and any data migrations implied by cudaEglResourceLocationFlags.
`timeout`
    \- Desired timeout in usec.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown, cudaErrorLaunchTimeout

###### Description

Acquire an image frame from EGLStreamKHR. cudaGraphicsResourceGetMappedEglFrame can be called on `pCudaResource` to get cudaEglFrame.

**See also:**

cudaEGLStreamConsumerConnect, cudaEGLStreamConsumerDisconnect, cudaEGLStreamConsumerReleaseFrame, cuEGLStreamConsumerAcquireFrame

__host__ cudaError_t cudaEGLStreamConsumerConnect ( cudaEglStreamConnection* conn, EGLStreamKHR eglStream )


Connect CUDA to EGLStream as a consumer.

######  Parameters

`conn`
    \- Pointer to the returned connection handle
`eglStream`
    \- EGLStreamKHR handle

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Connect CUDA as a consumer to EGLStreamKHR specified by `eglStream`.

The EGLStreamKHR is an EGL object that transfers a sequence of image frames from one API to another.

**See also:**

cudaEGLStreamConsumerDisconnect, cudaEGLStreamConsumerAcquireFrame, cudaEGLStreamConsumerReleaseFrame, cuEGLStreamConsumerConnect

__host__ cudaError_t cudaEGLStreamConsumerConnectWithFlags ( cudaEglStreamConnection* conn, EGLStreamKHR eglStream, unsigned int  flags )


Connect CUDA to EGLStream as a consumer with given flags.

######  Parameters

`conn`
    \- Pointer to the returned connection handle
`eglStream`
    \- EGLStreamKHR handle
`flags`
    \- Flags denote intended location - system or video.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Connect CUDA as a consumer to EGLStreamKHR specified by `stream` with specified `flags` defined by cudaEglResourceLocationFlags.

The flags specify whether the consumer wants to access frames from system memory or video memory. Default is cudaEglResourceLocationVidmem.

**See also:**

cudaEGLStreamConsumerDisconnect, cudaEGLStreamConsumerAcquireFrame, cudaEGLStreamConsumerReleaseFrame, cuEGLStreamConsumerConnectWithFlags

__host__ cudaError_t cudaEGLStreamConsumerDisconnect ( cudaEglStreamConnection* conn )


Disconnect CUDA as a consumer to EGLStream .

######  Parameters

`conn`
    \- Conection to disconnect.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Disconnect CUDA as a consumer to EGLStreamKHR.

**See also:**

cudaEGLStreamConsumerConnect, cudaEGLStreamConsumerAcquireFrame, cudaEGLStreamConsumerReleaseFrame, cuEGLStreamConsumerDisconnect

__host__ cudaError_t cudaEGLStreamConsumerReleaseFrame ( cudaEglStreamConnection* conn, cudaGraphicsResource_t pCudaResource, cudaStream_t* pStream )


Releases the last frame acquired from the EGLStream.

######  Parameters

`conn`
    \- Connection on which to release
`pCudaResource`
    \- CUDA resource whose corresponding frame is to be released
`pStream`
    \- CUDA stream on which release will be done.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Release the acquired image frame specified by `pCudaResource` to EGLStreamKHR.

**See also:**

cudaEGLStreamConsumerConnect, cudaEGLStreamConsumerDisconnect, cudaEGLStreamConsumerAcquireFrame, cuEGLStreamConsumerReleaseFrame

__host__ cudaError_t cudaEGLStreamProducerConnect ( cudaEglStreamConnection* conn, EGLStreamKHR eglStream, EGLint width, EGLint height )


Connect CUDA to EGLStream as a producer.

######  Parameters

`conn`
    \- Pointer to the returned connection handle
`eglStream`
    \- EGLStreamKHR handle
`width`
    \- width of the image to be submitted to the stream
`height`
    \- height of the image to be submitted to the stream

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Connect CUDA as a producer to EGLStreamKHR specified by `stream`.

The EGLStreamKHR is an EGL object that transfers a sequence of image frames from one API to another.

**See also:**

cudaEGLStreamProducerDisconnect, cudaEGLStreamProducerPresentFrame, cudaEGLStreamProducerReturnFrame, cuEGLStreamProducerConnect

__host__ cudaError_t cudaEGLStreamProducerDisconnect ( cudaEglStreamConnection* conn )


Disconnect CUDA as a producer to EGLStream .

######  Parameters

`conn`
    \- Conection to disconnect.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Disconnect CUDA as a producer to EGLStreamKHR.

**See also:**

cudaEGLStreamProducerConnect, cudaEGLStreamProducerPresentFrame, cudaEGLStreamProducerReturnFrame, cuEGLStreamProducerDisconnect

__host__ cudaError_t cudaEGLStreamProducerPresentFrame ( cudaEglStreamConnection* conn, cudaEglFrame eglframe, cudaStream_t* pStream )


Present a CUDA eglFrame to the EGLStream with CUDA as a producer.

######  Parameters

`conn`
    \- Connection on which to present the CUDA array
`eglframe`
    \- CUDA Eglstream Proucer Frame handle to be sent to the consumer over EglStream.
`pStream`
    \- CUDA stream on which to present the frame.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

The cudaEglFrame is defined as:


    ‎ typedef struct cudaEglFrame_st {
               union {
                   cudaArray_t            pArray[CUDA_EGL_MAX_PLANES];
                   struct cudaPitchedPtr  pPitch[CUDA_EGL_MAX_PLANES];
               } frame;
               cudaEglPlaneDesc planeDesc[CUDA_EGL_MAX_PLANES];
               unsigned int planeCount;
               cudaEglFrameType frameType;
               cudaEglColorFormat eglColorFormat;
           } cudaEglFrame;

For cudaEglFrame of type cudaEglFrameTypePitch, the application may present sub-region of a memory allocation. In that case, cudaPitchedPtr::ptr will specify the start address of the sub-region in the allocation and cudaEglPlaneDesc will specify the dimensions of the sub-region.

**See also:**

cudaEGLStreamProducerConnect, cudaEGLStreamProducerDisconnect, cudaEGLStreamProducerReturnFrame, cuEGLStreamProducerPresentFrame

__host__ cudaError_t cudaEGLStreamProducerReturnFrame ( cudaEglStreamConnection* conn, cudaEglFrame* eglframe, cudaStream_t* pStream )


Return the CUDA eglFrame to the EGLStream last released by the consumer.

######  Parameters

`conn`
    \- Connection on which to present the CUDA array
`eglframe`
    \- CUDA Eglstream Proucer Frame handle returned from the consumer over EglStream.
`pStream`
    \- CUDA stream on which to return the frame.

###### Returns

cudaSuccess, cudaErrorLaunchTimeout, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

This API can potentially return cudaErrorLaunchTimeout if the consumer has not returned a frame to EGL stream. If timeout is returned the application can retry.

**See also:**

cudaEGLStreamProducerConnect, cudaEGLStreamProducerDisconnect, cudaEGLStreamProducerPresentFrame, cuEGLStreamProducerReturnFrame

__host__ cudaError_t cudaEventCreateFromEGLSync ( cudaEvent_t* phEvent, EGLSyncKHR eglSync, unsigned int  flags )


Creates an event from EGLSync object.

######  Parameters

`phEvent`
    \- Returns newly created event
`eglSync`
    \- Opaque handle to EGLSync object
`flags`
    \- Event creation flags

###### Returns

cudaSuccess, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorLaunchFailure, cudaErrorMemoryAllocation

###### Description

Creates an event *phEvent from an EGLSyncKHR eglSync with the flages specified via `flags`. Valid flags include:

  * cudaEventDefault: Default event creation flag.

  * cudaEventBlockingSync: Specifies that the created event should use blocking synchronization. A CPU thread that uses cudaEventSynchronize() to wait on an event created with this flag will block until the event has actually been completed.


cudaEventRecord and TimingData are not supported for events created from EGLSync.

The EGLSyncKHR is an opaque handle to an EGL sync object. typedef void* EGLSyncKHR

**See also:**

cudaEventQuery, cudaEventSynchronize, cudaEventDestroy

__host__ cudaError_t cudaGraphicsEGLRegisterImage ( cudaGraphicsResource** pCudaResource, EGLImageKHR image, unsigned int  flags )


Registers an EGL image.

######  Parameters

`pCudaResource`
    \- Pointer to the returned object handle
`image`
    \- An EGLImageKHR image which can be used to create target resource.
`flags`
    \- Map flags

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Registers the EGLImageKHR specified by `image` for access by CUDA. A handle to the registered object is returned as `pCudaResource`. Additional Mapping/Unmapping is not required for the registered resource and cudaGraphicsResourceGetMappedEglFrame can be directly called on the `pCudaResource`.

The application will be responsible for synchronizing access to shared objects. The application must ensure that any pending operation which access the objects have completed before passing control to CUDA. This may be accomplished by issuing and waiting for glFinish command on all GLcontexts (for OpenGL and likewise for other APIs). The application will be also responsible for ensuring that any pending operation on the registered CUDA resource has completed prior to executing subsequent commands in other APIs accesing the same memory objects. This can be accomplished by calling cuCtxSynchronize or cuEventSynchronize (preferably).

The surface's intended usage is specified using `flags`, as follows:

  * cudaGraphicsRegisterFlagsNone: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA. This is the default value.

  * cudaGraphicsRegisterFlagsReadOnly: Specifies that CUDA will not write to this resource.

  * cudaGraphicsRegisterFlagsWriteDiscard: Specifies that CUDA will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


The EGLImageKHR is an object which can be used to create EGLImage target resource. It is defined as a void pointer. typedef void* EGLImageKHR

**See also:**

cudaGraphicsUnregisterResource, cudaGraphicsResourceGetMappedEglFrame, cuGraphicsEGLRegisterImage

__host__ cudaError_t cudaGraphicsResourceGetMappedEglFrame ( cudaEglFrame* eglFrame, cudaGraphicsResource_t resource, unsigned int  index, unsigned int  mipLevel )


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

cudaSuccess, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Returns in `*eglFrame` an eglFrame pointer through which the registered graphics resource `resource` may be accessed. This API can only be called for EGL graphics resources.

The cudaEglFrame is defined as


    ‎ typedef struct cudaEglFrame_st {
               union {
                   cudaArray_t             pArray[CUDA_EGL_MAX_PLANES];
                   struct cudaPitchedPtr   pPitch[CUDA_EGL_MAX_PLANES];
               } frame;
               cudaEglPlaneDesc planeDesc[CUDA_EGL_MAX_PLANES];
               unsigned int planeCount;
               cudaEglFrameType frameType;
               cudaEglColorFormat eglColorFormat;
           } cudaEglFrame;

Note that in case of multiplanar `*eglFrame`, pitch of only first plane (unsigned int cudaEglPlaneDesc::pitch) is to be considered by the application.

**See also:**

cudaGraphicsSubResourceGetMappedArray, cudaGraphicsResourceGetMappedPointer, cuGraphicsResourceGetMappedEglFrame

* * *

!


Copyright © 2025 NVIDIA Corporation