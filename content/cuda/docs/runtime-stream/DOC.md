---
name: runtime-stream
description: '**Source:** group__CUDART__STREAM.html'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# Stream Management

**Source:** group__CUDART__STREAM.html


### Typedefs

typedef void(CUDART_CB* cudaStreamCallback_t )( cudaStream_t stream,  cudaError_t status, void*  userData )


### Functions

__host__ cudaError_t cudaCtxResetPersistingL2Cache ( void )


Resets all persisting lines in cache to normal status.

###### Returns

cudaSuccess

###### Description

Resets all persisting lines in cache to normal status. Takes effect on function return.

**See also:**

cudaAccessPolicyWindow

__host__ cudaError_t cudaStreamAddCallback ( cudaStream_t stream, cudaStreamCallback_t callback, void* userData, unsigned int  flags )


Add a callback to a compute stream.

######  Parameters

`stream`
    \- Stream to add callback to
`callback`
    \- The function to call once preceding stream operations are complete
`userData`
    \- User specified data to be passed to the callback function
`flags`
    \- Reserved for future use, must be 0

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorInvalidValue, cudaErrorNotSupported

###### Description

This function is slated for eventual deprecation and removal. If you do not require the callback to execute in case of a device error, consider using cudaLaunchHostFunc. Additionally, this function is not supported with cudaStreamBeginCapture and cudaStreamEndCapture, unlike cudaLaunchHostFunc.

Adds a callback to be called on the host after all currently enqueued items in the stream have completed. For each cudaStreamAddCallback call, a callback will be executed exactly once. The callback will block later work in the stream until it is finished.

The callback may be passed cudaSuccess or an error code. In the event of a device error, all subsequently executed callbacks will receive an appropriate cudaError_t.

Callbacks must not make any CUDA API calls. Attempting to use CUDA APIs may result in cudaErrorNotPermitted. Callbacks must not perform any synchronization that may depend on outstanding device work or other callbacks that are not mandated to run earlier. Callbacks without a mandated order (in independent streams) execute in undefined order and may be serialized.

For the purposes of Unified Memory, callback execution makes a number of guarantees:

  * The callback stream is considered idle for the duration of the callback. Thus, for example, a callback may always use memory attached to the callback stream.

  * The start of execution of a callback has the same effect as synchronizing an event recorded in the same stream immediately prior to the callback. It thus synchronizes streams which have been "joined" prior to the callback.

  * Adding device work to any stream does not have the effect of making the stream active until all preceding callbacks have executed. Thus, for example, a callback might use global attached memory even if work has been added to another stream, if it has been properly ordered with an event.

  * Completion of a callback does not cause a stream to become active except as described above. The callback stream will remain idle if no device work follows the callback, and will remain idle across consecutive callbacks without device work in between. Thus, for example, stream synchronization can be done by signaling from a callback at the end of the stream.


  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaStreamQuery, cudaStreamSynchronize, cudaStreamWaitEvent, cudaStreamDestroy, cudaMallocManaged, cudaStreamAttachMemAsync, cudaLaunchHostFunc, cuStreamAddCallback

__host__ cudaError_t cudaStreamAttachMemAsync ( cudaStream_t stream, void* devPtr, size_t length = 0, unsigned int  flags = cudaMemAttachSingle )


Attach memory to a stream asynchronously.

######  Parameters

`stream`
    \- Stream in which to enqueue the attach operation
`devPtr`
    \- Pointer to memory (must be a pointer to managed memory or to a valid host-accessible region of system-allocated memory)
`length`
    \- Length of memory (defaults to zero)
`flags`
    \- Must be one of cudaMemAttachGlobal, cudaMemAttachHost or cudaMemAttachSingle (defaults to cudaMemAttachSingle)

###### Returns

cudaSuccess, cudaErrorNotReady, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Enqueues an operation in `stream` to specify stream association of `length` bytes of memory starting from `devPtr`. This function is a stream-ordered operation, meaning that it is dependent on, and will only take effect when, previous work in stream has completed. Any previous association is automatically replaced.

`devPtr` must point to an one of the following types of memories:

  * managed memory declared using the __managed__ keyword or allocated with cudaMallocManaged.

  * a valid host-accessible region of system-allocated pageable memory. This type of memory may only be specified if the device associated with the stream reports a non-zero value for the device attribute cudaDevAttrPageableMemoryAccess.


For managed allocations, `length` must be either zero or the entire allocation's size. Both indicate that the entire allocation's stream association is being changed. Currently, it is not possible to change stream association for a portion of a managed allocation.

For pageable allocations, `length` must be non-zero.

The stream association is specified using `flags` which must be one of cudaMemAttachGlobal, cudaMemAttachHost or cudaMemAttachSingle. The default value for `flags` is cudaMemAttachSingle If the cudaMemAttachGlobal flag is specified, the memory can be accessed by any stream on any device. If the cudaMemAttachHost flag is specified, the program makes a guarantee that it won't access the memory on the device from any stream on a device that has a zero value for the device attribute cudaDevAttrConcurrentManagedAccess. If the cudaMemAttachSingle flag is specified and `stream` is associated with a device that has a zero value for the device attribute cudaDevAttrConcurrentManagedAccess, the program makes a guarantee that it will only access the memory on the device from `stream`. It is illegal to attach singly to the NULL stream, because the NULL stream is a virtual global stream and not a specific stream. An error will be returned in this case.

When memory is associated with a single stream, the Unified Memory system will allow CPU access to this memory region so long as all operations in `stream` have completed, regardless of whether other streams are active. In effect, this constrains exclusive ownership of the managed memory region by an active GPU to per-stream activity instead of whole-GPU activity.

Accessing memory on the device from streams that are not associated with it will produce undefined results. No error checking is performed by the Unified Memory system to ensure that kernels launched into other streams do not access this region.

It is a program's responsibility to order calls to cudaStreamAttachMemAsync via events, synchronization or other means to ensure legal access to memory at all times. Data visibility and coherency will be changed appropriately for all kernels which follow a stream-association change.

If `stream` is destroyed while data is associated with it, the association is removed and the association reverts to the default visibility of the allocation as specified at cudaMallocManaged. For __managed__ variables, the default association is always cudaMemAttachGlobal. Note that destroying a stream is an asynchronous operation, and as a result, the change to default association won't happen until all work in the stream has completed.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaStreamWaitEvent, cudaStreamSynchronize, cudaStreamAddCallback, cudaStreamDestroy, cudaMallocManaged, cuStreamAttachMemAsync

__host__ cudaError_t cudaStreamBeginCapture ( cudaStream_t stream, cudaStreamCaptureMode mode )


Begins graph capture on a stream.

######  Parameters

`stream`
    \- Stream in which to initiate capture
`mode`
    \- Controls the interaction of this capture sequence with other API calls that are potentially unsafe. For more details see cudaThreadExchangeStreamCaptureMode.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Begin graph capture on `stream`. When a stream is in capture mode, all operations pushed into the stream will not be executed, but will instead be captured into a graph, which will be returned via cudaStreamEndCapture. Capture may not be initiated if `stream` is cudaStreamLegacy. Capture must be ended on the same stream in which it was initiated, and it may only be initiated if the stream is not already in capture mode. The capture mode may be queried via cudaStreamIsCapturing. A unique id representing the capture sequence may be queried via cudaStreamGetCaptureInfo.

If `mode` is not cudaStreamCaptureModeRelaxed, cudaStreamEndCapture must be called on this stream from the same thread.

Kernels captured using this API must not use texture and surface references. Reading or writing through any texture or surface reference is undefined behavior. This restriction does not apply to texture and surface objects.

**See also:**

cudaStreamCreate, cudaStreamIsCapturing, cudaStreamEndCapture, cudaThreadExchangeStreamCaptureMode

__host__ cudaError_t cudaStreamBeginCaptureToGraph ( cudaStream_t stream, cudaGraph_t graph, const cudaGraphNode_t* dependencies, const cudaGraphEdgeData* dependencyData, size_t numDependencies, cudaStreamCaptureMode mode )


Begins graph capture on a stream to an existing graph.

######  Parameters

`stream`
    \- Stream in which to initiate capture.
`graph`
    \- Graph to capture into.
`dependencies`
    \- Dependencies of the first node captured in the stream. Can be NULL if numDependencies is 0.
`dependencyData`
    \- Optional array of data associated with each dependency.
`numDependencies`
    \- Number of dependencies.
`mode`
    \- Controls the interaction of this capture sequence with other API calls that are potentially unsafe. For more details see cudaThreadExchangeStreamCaptureMode.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Begin graph capture on `stream`. When a stream is in capture mode, all operations pushed into the stream will not be executed, but will instead be captured into `graph`, which will be returned via cudaStreamEndCapture.

Capture may not be initiated if `stream` is cudaStreamLegacy. Capture must be ended on the same stream in which it was initiated, and it may only be initiated if the stream is not already in capture mode. The capture mode may be queried via cudaStreamIsCapturing. A unique id representing the capture sequence may be queried via cudaStreamGetCaptureInfo.

If `mode` is not cudaStreamCaptureModeRelaxed, cudaStreamEndCapture must be called on this stream from the same thread.

Kernels captured using this API must not use texture and surface references. Reading or writing through any texture or surface reference is undefined behavior. This restriction does not apply to texture and surface objects.

**See also:**

cudaStreamCreate, cudaStreamIsCapturing, cudaStreamEndCapture, cudaThreadExchangeStreamCaptureMode

__host__ cudaError_t cudaStreamCopyAttributes ( cudaStream_t dst, cudaStream_t src )


Copies attributes from source stream to destination stream.

######  Parameters

`dst`
    Destination stream
`src`
    Source stream For attributes see cudaStreamAttrID

###### Returns

cudaSuccess, cudaErrorNotSupported

###### Description

Copies attributes from source stream `src` to destination stream `dst`. Both streams must have the same context.

**See also:**

cudaAccessPolicyWindow

__host__ cudaError_t cudaStreamCreate ( cudaStream_t* pStream )


Create an asynchronous stream.

######  Parameters

`pStream`
    \- Pointer to new stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new asynchronous stream on the context that is current to the calling host thread. If no context is current to the calling host thread, then the primary context for a device is selected, made current to the calling thread, and initialized before creating a stream on it.


**See also:**

cudaStreamCreateWithPriority, cudaStreamCreateWithFlags, cudaStreamGetPriority, cudaStreamGetFlags, cudaStreamGetDevice, cudaStreamGetDevResource, cudaStreamQuery, cudaStreamSynchronize, cudaStreamWaitEvent, cudaStreamAddCallback, cudaSetDevice, cudaStreamDestroy, cuStreamCreate

__host__  __device__ cudaError_t cudaStreamCreateWithFlags ( cudaStream_t* pStream, unsigned int  flags )


Create an asynchronous stream.

######  Parameters

`pStream`
    \- Pointer to new stream identifier
`flags`
    \- Parameters for stream creation

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new asynchronous stream on the context that is current to the calling host thread. If no context is current to the calling host thread, then the primary context for a device is selected, made current to the calling thread, and initialized before creating a stream on it. The `flags` argument determines the behaviors of the stream. Valid values for `flags` are

  * cudaStreamDefault: Default stream creation flag.

  * cudaStreamNonBlocking: Specifies that work running in the created stream may run concurrently with work in stream 0 (the NULL stream), and that the created stream should perform no implicit synchronization with stream 0.


**See also:**

cudaStreamCreate, cudaStreamCreateWithPriority, cudaStreamGetFlags, cudaStreamGetDevice, cudaStreamGetDevResource, cudaStreamQuery, cudaStreamSynchronize, cudaStreamWaitEvent, cudaStreamAddCallback, cudaSetDevice, cudaStreamDestroy, cuStreamCreate

__host__ cudaError_t cudaStreamCreateWithPriority ( cudaStream_t* pStream, unsigned int  flags, int  priority )


Create an asynchronous stream with the specified priority.

######  Parameters

`pStream`
    \- Pointer to new stream identifier
`flags`
    \- Flags for stream creation. See cudaStreamCreateWithFlags for a list of valid flags that can be passed
`priority`
    \- Priority of the stream. Lower numbers represent higher priorities. See cudaDeviceGetStreamPriorityRange for more information about the meaningful stream priorities that can be passed.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a stream with the specified priority and returns a handle in `pStream`. The stream is created on the context that is current to the calling host thread. If no context is current to the calling host thread, then the primary context for a device is selected, made current to the calling thread, and initialized before creating a stream on it. This affects the scheduling priority of work in the stream. Priorities provide a hint to preferentially run work with higher priority when possible, but do not preempt already-running work or provide any other functional guarantee on execution order.

`priority` follows a convention where lower numbers represent higher priorities. '0' represents default priority. The range of meaningful numerical priorities can be queried using cudaDeviceGetStreamPriorityRange. If the specified priority is outside the numerical range returned by cudaDeviceGetStreamPriorityRange, it will automatically be clamped to the lowest or the highest number in the range.

  * Stream priorities are supported only on GPUs with compute capability 3.5 or higher.

  * In the current implementation, only compute kernels launched in priority streams are affected by the stream's priority. Stream priorities have no effect on host-to-device and device-to-host memory operations.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaDeviceGetStreamPriorityRange, cudaStreamGetPriority, cudaStreamQuery, cudaStreamWaitEvent, cudaStreamAddCallback, cudaStreamSynchronize, cudaSetDevice, cudaStreamDestroy, cuStreamCreateWithPriority

__host__  __device__ cudaError_t cudaStreamDestroy ( cudaStream_t stream )


Destroys and cleans up an asynchronous stream.

######  Parameters

`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Destroys and cleans up the asynchronous stream specified by `stream`.

In case the device is still doing work in the stream `stream` when cudaStreamDestroy() is called, the function will return immediately and the resources associated with `stream` will be released automatically once the device has completed all work in `stream`.

  * This function uses standard default stream semantics.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaStreamQuery, cudaStreamWaitEvent, cudaStreamSynchronize, cudaStreamAddCallback, cuStreamDestroy

__host__ cudaError_t cudaStreamEndCapture ( cudaStream_t stream, cudaGraph_t* pGraph )


Ends capture on a stream, returning the captured graph.

######  Parameters

`stream`
    \- Stream to query
`pGraph`
    \- The captured graph

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorStreamCaptureWrongThread

###### Description

End capture on `stream`, returning the captured graph via `pGraph`. Capture must have been initiated on `stream` via a call to cudaStreamBeginCapture. If capture was invalidated, due to a violation of the rules of stream capture, then a NULL graph will be returned.

If the `mode` argument to cudaStreamBeginCapture was not cudaStreamCaptureModeRelaxed, this call must be from the same thread as cudaStreamBeginCapture.

**See also:**

cudaStreamCreate, cudaStreamBeginCapture, cudaStreamIsCapturing, cudaGraphDestroy

__host__ cudaError_t cudaStreamGetAttribute ( cudaStream_t hStream, cudaStreamAttrID attr, cudaStreamAttrValue* value_out )


Queries stream attribute.

######  Parameters

`hStream`

`attr`

`value_out`


###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Queries attribute `attr` from `hStream` and stores it in corresponding member of `value_out`.

**See also:**

cudaAccessPolicyWindow

__host__ cudaError_t cudaStreamGetCaptureInfo ( cudaStream_t stream, cudaStreamCaptureStatus ** captureStatus_out, unsigned long long* id_out = 0, cudaGraph_t* graph_out = 0, const cudaGraphNode_t** dependencies_out = 0, const cudaGraphEdgeData** edgeData_out = 0, size_t* numDependencies_out = 0 )


Query a stream's capture state.

######  Parameters

`stream`
    \- The stream to query
`captureStatus_out`
    \- Location to return the capture status of the stream; required
`id_out`
    \- Optional location to return an id for the capture sequence, which is unique over the lifetime of the process
`graph_out`
    \- Optional location to return the graph being captured into. All operations other than destroy and node removal are permitted on the graph while the capture sequence is in progress. This API does not transfer ownership of the graph, which is transferred or destroyed at cudaStreamEndCapture. Note that the graph handle may be invalidated before end of capture for certain errors. Nodes that are or become unreachable from the original stream at cudaStreamEndCapture due to direct actions on the graph do not trigger cudaErrorStreamCaptureUnjoined.
`dependencies_out`
    \- Optional location to store a pointer to an array of nodes. The next node to be captured in the stream will depend on this set of nodes, absent operations such as event wait which modify this set. The array pointer is valid until the next API call which operates on the stream or until the capture is terminated. The node handles may be copied out and are valid until they or the graph is destroyed. The driver-owned array may also be passed directly to APIs that operate on the graph (not the stream) without copying.
`edgeData_out`
    \- Optional location to store a pointer to an array of graph edge data. This array parallels `dependencies_out`; the next node to be added has an edge to `dependencies_out`[i] with annotation `edgeData_out`[i] for each `i`. The array pointer is valid until the next API call which operates on the stream or until the capture is terminated.
`numDependencies_out`
    \- Optional location to store the size of the array returned in dependencies_out.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorStreamCaptureImplicit, cudaErrorLossyQuery

###### Description

Query stream state related to stream capture.

If called on cudaStreamLegacy (the "null stream") while a stream not created with cudaStreamNonBlocking is capturing, returns cudaErrorStreamCaptureImplicit.

Valid data (other than capture status) is returned only if both of the following are true:

  * the call returns cudaSuccess

  * the returned capture status is cudaStreamCaptureStatusActive


If `edgeData_out` is non-NULL then `dependencies_out` must be as well. If `dependencies_out` is non-NULL and `edgeData_out` is NULL, but there is non-zero edge data for one or more of the current stream dependencies, the call will return cudaErrorLossyQuery.

  * Graph objects are not threadsafe. More here.

  *
**See also:**

cudaStreamBeginCapture, cudaStreamIsCapturing, cudaStreamUpdateCaptureDependencies

__host__ cudaError_t cudaStreamGetDevice ( cudaStream_t hStream, int* device )


Query the device of a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`device`
    \- Returns the device to which the stream belongs

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorDeviceUnavailable

###### Description

Returns in `*device` the device of the stream.

  * This function uses standard default stream semantics.


**See also:**

cudaSetDevice, cudaGetDevice, cudaStreamCreate, cudaStreamGetPriority, cudaStreamGetFlags, cuStreamGetId

__host__ cudaError_t cudaStreamGetFlags ( cudaStream_t hStream, unsigned int* flags )


Query the flags of a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`flags`
    \- Pointer to an unsigned integer in which the stream's flags are returned

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Query the flags of a stream. The flags are returned in `flags`. See cudaStreamCreateWithFlags for a list of valid flags.

  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreateWithPriority, cudaStreamCreateWithFlags, cudaStreamGetPriority, cudaStreamGetDevice, cuStreamGetFlags

__host__ cudaError_t cudaStreamGetId ( cudaStream_t hStream, unsigned long long* streamId )


Query the Id of a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`streamId`
    \- Pointer to an unsigned long long in which the stream Id is returned

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Query the Id of a stream. The Id is returned in `streamId`. The Id is unique for the life of the program.

The stream handle `hStream` can refer to any of the following:

  * a stream created via any of the CUDA runtime APIs such as cudaStreamCreate, cudaStreamCreateWithFlags and cudaStreamCreateWithPriority, or their driver API equivalents such as cuStreamCreate or cuStreamCreateWithPriority. Passing an invalid handle will result in undefined behavior.

  * any of the special streams such as the NULL stream, cudaStreamLegacy and cudaStreamPerThread respectively. The driver API equivalents of these are also accepted which are NULL, CU_STREAM_LEGACY and CU_STREAM_PER_THREAD.


  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreateWithPriority, cudaStreamCreateWithFlags, cudaStreamGetPriority, cudaStreamGetFlags, cuStreamGetId

__host__ cudaError_t cudaStreamGetPriority ( cudaStream_t hStream, int* priority )


Query the priority of a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`priority`
    \- Pointer to a signed integer in which the stream's priority is returned

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Query the priority of a stream. The priority is returned in in `priority`. Note that if the stream was created with a priority outside the meaningful numerical range returned by cudaDeviceGetStreamPriorityRange, this function returns the clamped priority. See cudaStreamCreateWithPriority for details about priority clamping.


**See also:**

cudaStreamCreateWithPriority, cudaDeviceGetStreamPriorityRange, cudaStreamGetFlags, cudaStreamGetDevice, cudaStreamGetDevResource, cuStreamGetPriority

__host__ cudaError_t cudaStreamIsCapturing ( cudaStream_t stream, cudaStreamCaptureStatus ** pCaptureStatus )


Returns a stream's capture status.

######  Parameters

`stream`
    \- Stream to query
`pCaptureStatus`
    \- Returns the stream's capture status

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorStreamCaptureImplicit

###### Description

Return the capture status of `stream` via `pCaptureStatus`. After a successful call, `*pCaptureStatus` will contain one of the following:

  * cudaStreamCaptureStatusNone: The stream is not capturing.

  * cudaStreamCaptureStatusActive: The stream is capturing.

  * cudaStreamCaptureStatusInvalidated: The stream was capturing but an error has invalidated the capture sequence. The capture sequence must be terminated with cudaStreamEndCapture on the stream where it was initiated in order to continue using `stream`.


Note that, if this is called on cudaStreamLegacy (the "null stream") while a blocking stream on the same device is capturing, it will return cudaErrorStreamCaptureImplicit and `*pCaptureStatus` is unspecified after the call. The blocking stream capture is not invalidated.

When a blocking stream is capturing, the legacy stream is in an unusable state until the blocking stream capture is terminated. The legacy stream is not supported for stream capture, but attempted use would have an implicit dependency on the capturing stream(s).

**See also:**

cudaStreamCreate, cudaStreamBeginCapture, cudaStreamEndCapture

__host__ cudaError_t cudaStreamQuery ( cudaStream_t stream )


Queries an asynchronous stream for completion status.

######  Parameters

`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorNotReady, cudaErrorInvalidResourceHandle

###### Description

Returns cudaSuccess if all operations in `stream` have completed, or cudaErrorNotReady if not.

For the purposes of Unified Memory, a return value of cudaSuccess is equivalent to having called cudaStreamSynchronize().

  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaStreamWaitEvent, cudaStreamSynchronize, cudaStreamAddCallback, cudaStreamDestroy, cuStreamQuery

__host__ cudaError_t cudaStreamSetAttribute ( cudaStream_t hStream, cudaStreamAttrID attr, const cudaStreamAttrValue* value )


Sets stream attribute.

######  Parameters

`hStream`

`attr`

`value`


###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Sets attribute `attr` on `hStream` from corresponding attribute of `value`. The updated attribute will be applied to subsequent work submitted to the stream. It will not affect previously submitted work.

**See also:**

cudaAccessPolicyWindow

__host__ cudaError_t cudaStreamSynchronize ( cudaStream_t stream )


Waits for stream tasks to complete.

######  Parameters

`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle

###### Description

Blocks until `stream` has completed all operations. If the cudaDeviceScheduleBlockingSync flag was set for this device, the host thread will block until the stream is finished with all of its tasks.

  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaStreamQuery, cudaStreamWaitEvent, cudaStreamAddCallback, cudaStreamDestroy, cuStreamSynchronize

__host__ cudaError_t cudaStreamUpdateCaptureDependencies ( cudaStream_t stream, cudaGraphNode_t* dependencies, const cudaGraphEdgeData* dependencyData, size_t numDependencies, unsigned int  flags = 0 )


Update the set of dependencies in a capturing stream.

######  Parameters

`stream`
    \- The stream to update
`dependencies`
    \- The set of dependencies to add
`dependencyData`
    \- Optional array of data associated with each dependency.
`numDependencies`
    \- The size of the dependencies array
`flags`
    \- See above

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorIllegalState

###### Description

Modifies the dependency set of a capturing stream. The dependency set is the set of nodes that the next captured node in the stream will depend on.

Valid flags are cudaStreamAddCaptureDependencies and cudaStreamSetCaptureDependencies. These control whether the set passed to the API is added to the existing set or replaces it. A flags value of 0 defaults to cudaStreamAddCaptureDependencies.

Nodes that are removed from the dependency set via this API do not result in cudaErrorStreamCaptureUnjoined if they are unreachable from the stream at cudaStreamEndCapture.

Returns cudaErrorIllegalState if the stream is not capturing.

**See also:**

cudaStreamBeginCapture, cudaStreamGetCaptureInfo

__host__  __device__ cudaError_t cudaStreamWaitEvent ( cudaStream_t stream, cudaEvent_t event, unsigned int  flags = 0 )


Make a compute stream wait on an event.

######  Parameters

`stream`
    \- Stream to wait
`event`
    \- Event to wait on
`flags`
    \- Parameters for the operation(See above)

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Makes all future work submitted to `stream` wait for all work captured in `event`. See cudaEventRecord() for details on what is captured by an event. The synchronization will be performed efficiently on the device when applicable. `event` may be from a different device than `stream`.

flags include:

  * cudaEventWaitDefault: Default event creation flag.

  * cudaEventWaitExternal: Event is captured in the graph as an external event node when performing stream capture.


  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreate, cudaStreamCreateWithFlags, cudaStreamQuery, cudaStreamSynchronize, cudaStreamAddCallback, cudaStreamDestroy, cuStreamWaitEvent

__host__ cudaError_t cudaThreadExchangeStreamCaptureMode ( cudaStreamCaptureMode ** mode )


Swaps the stream capture interaction mode for a thread.

######  Parameters

`mode`
    \- Pointer to mode value to swap with the current mode

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the calling thread's stream capture interaction mode to the value contained in `*mode`, and overwrites `*mode` with the previous mode for the thread. To facilitate deterministic behavior across function or module boundaries, callers are encouraged to use this API in a push-pop fashion:


    ‎     cudaStreamCaptureMode mode = desiredMode;
               cudaThreadExchangeStreamCaptureMode(&mode);
               ...
               cudaThreadExchangeStreamCaptureMode(&mode); // restore previous mode

During stream capture (see cudaStreamBeginCapture), some actions, such as a call to cudaMalloc, may be unsafe. In the case of cudaMalloc, the operation is not enqueued asynchronously to a stream, and is not observed by stream capture. Therefore, if the sequence of operations captured via cudaStreamBeginCapture depended on the allocation being replayed whenever the graph is launched, the captured graph would be invalid.

Therefore, stream capture places restrictions on API calls that can be made within or concurrently to a cudaStreamBeginCapture-cudaStreamEndCapture sequence. This behavior can be controlled via this API and flags to cudaStreamBeginCapture.

A thread's mode is one of the following:

  * `cudaStreamCaptureModeGlobal:` This is the default mode. If the local thread has an ongoing capture sequence that was not initiated with `cudaStreamCaptureModeRelaxed` at `cuStreamBeginCapture`, or if any other thread has a concurrent capture sequence initiated with `cudaStreamCaptureModeGlobal`, this thread is prohibited from potentially unsafe API calls.

  * `cudaStreamCaptureModeThreadLocal:` If the local thread has an ongoing capture sequence not initiated with `cudaStreamCaptureModeRelaxed`, it is prohibited from potentially unsafe API calls. Concurrent capture sequences in other threads are ignored.

  * `cudaStreamCaptureModeRelaxed:` The local thread is not prohibited from potentially unsafe API calls. Note that the thread is still prohibited from API calls which necessarily conflict with stream capture, for example, attempting cudaEventQuery on an event that was last recorded inside a capture sequence.


**See also:**

cudaStreamBeginCapture

* * *

!


Copyright © 2025 NVIDIA Corporation