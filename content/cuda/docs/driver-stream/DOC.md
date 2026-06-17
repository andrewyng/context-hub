---
name: driver-stream
description: '**Source:** group__CUDA__STREAM.html#group__CUDA__STREAM'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.18. Stream Management

**Source:** group__CUDA__STREAM.html#group__CUDA__STREAM


### Functions

CUresult cuStreamAddCallback ( CUstream hStream, CUstreamCallback callback, void* userData, unsigned int  flags )


Add a callback to a compute stream.

######  Parameters

`hStream`
    \- Stream to add callback to
`callback`
    \- The function to call once preceding stream operations are complete
`userData`
    \- User specified data to be passed to the callback function
`flags`
    \- Reserved for future use, must be 0

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_SUPPORTED

###### Description

This function is slated for eventual deprecation and removal. If you do not require the callback to execute in case of a device error, consider using cuLaunchHostFunc. Additionally, this function is not supported with cuStreamBeginCapture and cuStreamEndCapture, unlike cuLaunchHostFunc.

Adds a callback to be called on the host after all currently enqueued items in the stream have completed. For each cuStreamAddCallback call, the callback will be executed exactly once. The callback will block later work in the stream until it is finished.

The callback may be passed CUDA_SUCCESS or an error code. In the event of a device error, all subsequently executed callbacks will receive an appropriate CUresult.

Callbacks must not make any CUDA API calls. Attempting to use a CUDA API will result in CUDA_ERROR_NOT_PERMITTED. Callbacks must not perform any synchronization that may depend on outstanding device work or other callbacks that are not mandated to run earlier. Callbacks without a mandated order (in independent streams) execute in undefined order and may be serialized.

For the purposes of Unified Memory, callback execution makes a number of guarantees:

  * The callback stream is considered idle for the duration of the callback. Thus, for example, a callback may always use memory attached to the callback stream.

  * The start of execution of a callback has the same effect as synchronizing an event recorded in the same stream immediately prior to the callback. It thus synchronizes streams which have been "joined" prior to the callback.

  * Adding device work to any stream does not have the effect of making the stream active until all preceding host functions and stream callbacks have executed. Thus, for example, a callback might use global attached memory even if work has been added to another stream, if the work has been ordered behind the callback with an event.

  * Completion of a callback does not cause a stream to become active except as described above. The callback stream will remain idle if no device work follows the callback, and will remain idle across consecutive callbacks without device work in between. Thus, for example, stream synchronization can be done by signaling from a callback at the end of the stream.


  * This function uses standard default stream semantics.

  *
CUresult cuStreamAttachMemAsync ( CUstream hStream, CUdeviceptr dptr, size_t length, unsigned int  flags )


Attach memory to a stream asynchronously.

######  Parameters

`hStream`
    \- Stream in which to enqueue the attach operation
`dptr`
    \- Pointer to memory (must be a pointer to managed memory or to a valid host-accessible region of system-allocated pageable memory)
`length`
    \- Length of memory
`flags`
    \- Must be one of CUmemAttach_flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Enqueues an operation in `hStream` to specify stream association of `length` bytes of memory starting from `dptr`. This function is a stream-ordered operation, meaning that it is dependent on, and will only take effect when, previous work in stream has completed. Any previous association is automatically replaced.

`dptr` must point to one of the following types of memories:

  * managed memory declared using the __managed__ keyword or allocated with cuMemAllocManaged.

  * a valid host-accessible region of system-allocated pageable memory. This type of memory may only be specified if the device associated with the stream reports a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS.


For managed allocations, `length` must be either zero or the entire allocation's size. Both indicate that the entire allocation's stream association is being changed. Currently, it is not possible to change stream association for a portion of a managed allocation.

For pageable host allocations, `length` must be non-zero.

The stream association is specified using `flags` which must be one of CUmemAttach_flags. If the CU_MEM_ATTACH_GLOBAL flag is specified, the memory can be accessed by any stream on any device. If the CU_MEM_ATTACH_HOST flag is specified, the program makes a guarantee that it won't access the memory on the device from any stream on a device that has a zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. If the CU_MEM_ATTACH_SINGLE flag is specified and `hStream` is associated with a device that has a zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS, the program makes a guarantee that it will only access the memory on the device from `hStream`. It is illegal to attach singly to the NULL stream, because the NULL stream is a virtual global stream and not a specific stream. An error will be returned in this case.

When memory is associated with a single stream, the Unified Memory system will allow CPU access to this memory region so long as all operations in `hStream` have completed, regardless of whether other streams are active. In effect, this constrains exclusive ownership of the managed memory region by an active GPU to per-stream activity instead of whole-GPU activity.

Accessing memory on the device from streams that are not associated with it will produce undefined results. No error checking is performed by the Unified Memory system to ensure that kernels launched into other streams do not access this region.

It is a program's responsibility to order calls to cuStreamAttachMemAsync via events, synchronization or other means to ensure legal access to memory at all times. Data visibility and coherency will be changed appropriately for all kernels which follow a stream-association change.

If `hStream` is destroyed while data is associated with it, the association is removed and the association reverts to the default visibility of the allocation as specified at cuMemAllocManaged. For __managed__ variables, the default association is always CU_MEM_ATTACH_GLOBAL. Note that destroying a stream is an asynchronous operation, and as a result, the change to default association won't happen until all work in the stream has completed.

  * This function uses standard default stream semantics.

  *
CUresult cuStreamBeginCapture ( CUstream hStream, CUstreamCaptureMode mode )


Begins graph capture on a stream.

######  Parameters

`hStream`
    \- Stream in which to initiate capture
`mode`
    \- Controls the interaction of this capture sequence with other API calls that are potentially unsafe. For more details see cuThreadExchangeStreamCaptureMode.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Begin graph capture on `hStream`. When a stream is in capture mode, all operations pushed into the stream will not be executed, but will instead be captured into a graph, which will be returned via cuStreamEndCapture. Capture may not be initiated if `stream` is CU_STREAM_LEGACY. Capture must be ended on the same stream in which it was initiated, and it may only be initiated if the stream is not already in capture mode. The capture mode may be queried via cuStreamIsCapturing. A unique id representing the capture sequence may be queried via cuStreamGetCaptureInfo.

If `mode` is not CU_STREAM_CAPTURE_MODE_RELAXED, cuStreamEndCapture must be called on this stream from the same thread.

Kernels captured using this API must not use texture and surface references. Reading or writing through any texture or surface reference is undefined behavior. This restriction does not apply to texture and surface objects.

CUresult cuStreamBeginCaptureToGraph ( CUstream hStream, CUgraph hGraph, const CUgraphNode* dependencies, const CUgraphEdgeData* dependencyData, size_t numDependencies, CUstreamCaptureMode mode )


Begins graph capture on a stream to an existing graph.

######  Parameters

`hStream`
    \- Stream in which to initiate capture.
`hGraph`
    \- Graph to capture into.
`dependencies`
    \- Dependencies of the first node captured in the stream. Can be NULL if numDependencies is 0.
`dependencyData`
    \- Optional array of data associated with each dependency.
`numDependencies`
    \- Number of dependencies.
`mode`
    \- Controls the interaction of this capture sequence with other API calls that are potentially unsafe. For more details see cuThreadExchangeStreamCaptureMode.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Begin graph capture on `hStream`, placing new nodes into an existing graph. When a stream is in capture mode, all operations pushed into the stream will not be executed, but will instead be captured into `hGraph`. The graph will not be instantiable until the user calls cuStreamEndCapture.

Capture may not be initiated if `stream` is CU_STREAM_LEGACY. Capture must be ended on the same stream in which it was initiated, and it may only be initiated if the stream is not already in capture mode. The capture mode may be queried via cuStreamIsCapturing. A unique id representing the capture sequence may be queried via cuStreamGetCaptureInfo.

If `mode` is not CU_STREAM_CAPTURE_MODE_RELAXED, cuStreamEndCapture must be called on this stream from the same thread.

Kernels captured using this API must not use texture and surface references. Reading or writing through any texture or surface reference is undefined behavior. This restriction does not apply to texture and surface objects.

CUresult cuStreamCopyAttributes ( CUstream dst, CUstream src )


Copies attributes from source stream to destination stream.

######  Parameters

`dst`
    Destination stream
`src`
    Source stream For list of attributes see CUstreamAttrID

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Copies attributes from source stream `src` to destination stream `dst`. Both streams must have the same context.

CUresult cuStreamCreate ( CUstream* phStream, unsigned int  Flags )


Create a stream.

######  Parameters

`phStream`
    \- Returned newly created stream
`Flags`
    \- Parameters for stream creation

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Creates a stream and returns a handle in `phStream`. The `Flags` argument determines behaviors of the stream.

Valid values for `Flags` are:

  * CU_STREAM_DEFAULT: Default stream creation flag.

  * CU_STREAM_NON_BLOCKING: Specifies that work running in the created stream may run concurrently with work in stream 0 (the NULL stream), and that the created stream should perform no implicit synchronization with stream 0.


CUresult cuStreamCreateWithPriority ( CUstream* phStream, unsigned int  flags, int  priority )


Create a stream with the given priority.

######  Parameters

`phStream`
    \- Returned newly created stream
`flags`
    \- Flags for stream creation. See cuStreamCreate for a list of valid flags
`priority`
    \- Stream priority. Lower numbers represent higher priorities. See cuCtxGetStreamPriorityRange for more information about meaningful stream priorities that can be passed.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Creates a stream with the specified priority and returns a handle in `phStream`. This affects the scheduling priority of work in the stream. Priorities provide a hint to preferentially run work with higher priority when possible, but do not preempt already-running work or provide any other functional guarantee on execution order.

`priority` follows a convention where lower numbers represent higher priorities. '0' represents default priority. The range of meaningful numerical priorities can be queried using cuCtxGetStreamPriorityRange. If the specified priority is outside the numerical range returned by cuCtxGetStreamPriorityRange, it will automatically be clamped to the lowest or the highest number in the range.

  *   * Stream priorities are supported only on GPUs with compute capability 3.5 or higher.

  * In the current implementation, only compute kernels launched in priority streams are affected by the stream's priority. Stream priorities have no effect on host-to-device and device-to-host memory operations.


CUresult cuStreamDestroy ( CUstream hStream )


Destroys a stream.

######  Parameters

`hStream`
    \- Stream to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Destroys the stream specified by `hStream`.

In case the device is still doing work in the stream `hStream` when cuStreamDestroy() is called, the function will return immediately and the resources associated with `hStream` will be released automatically once the device has completed all work in `hStream`.

CUresult cuStreamEndCapture ( CUstream hStream, CUgraph* phGraph )


Ends capture on a stream, returning the captured graph.

######  Parameters

`hStream`
    \- Stream to query
`phGraph`
    \- The captured graph

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_STREAM_CAPTURE_WRONG_THREAD

###### Description

End capture on `hStream`, returning the captured graph via `phGraph`. Capture must have been initiated on `hStream` via a call to cuStreamBeginCapture. If capture was invalidated, due to a violation of the rules of stream capture, then a NULL graph will be returned.

If the `mode` argument to cuStreamBeginCapture was not CU_STREAM_CAPTURE_MODE_RELAXED, this call must be from the same thread as cuStreamBeginCapture.

CUresult cuStreamGetAttribute ( CUstream hStream, CUstreamAttrID attr, CUstreamAttrValue* value_out )


Queries stream attribute.

######  Parameters

`hStream`

`attr`

`value_out`


###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Queries attribute `attr` from `hStream` and stores it in corresponding member of `value_out`.

CUresult cuStreamGetCaptureInfo ( CUstream hStream, CUstreamCaptureStatus* captureStatus_out, cuuint64_t* id_out, CUgraph* graph_out, const CUgraphNode** dependencies_out, const CUgraphEdgeData** edgeData_out, size_t* numDependencies_out )


Query a stream's capture state.

######  Parameters

`hStream`
    \- The stream to query
`captureStatus_out`
    \- Location to return the capture status of the stream; required
`id_out`
    \- Optional location to return an id for the capture sequence, which is unique over the lifetime of the process
`graph_out`
    \- Optional location to return the graph being captured into. All operations other than destroy and node removal are permitted on the graph while the capture sequence is in progress. This API does not transfer ownership of the graph, which is transferred or destroyed at cuStreamEndCapture. Note that the graph handle may be invalidated before end of capture for certain errors. Nodes that are or become unreachable from the original stream at cuStreamEndCapture due to direct actions on the graph do not trigger CUDA_ERROR_STREAM_CAPTURE_UNJOINED.
`dependencies_out`
    \- Optional location to store a pointer to an array of nodes. The next node to be captured in the stream will depend on this set of nodes, absent operations such as event wait which modify this set. The array pointer is valid until the next API call which operates on the stream or until the capture is terminated. The node handles may be copied out and are valid until they or the graph is destroyed. The driver-owned array may also be passed directly to APIs that operate on the graph (not the stream) without copying.
`edgeData_out`
    \- Optional location to store a pointer to an array of graph edge data. This array parallels `dependencies_out`; the next node to be added has an edge to `dependencies_out`[i] with annotation `edgeData_out`[i] for each `i`. The array pointer is valid until the next API call which operates on the stream or until the capture is terminated.
`numDependencies_out`
    \- Optional location to store the size of the array returned in dependencies_out.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_STREAM_CAPTURE_IMPLICIT, CUDA_ERROR_LOSSY_QUERY

###### Description

Query stream state related to stream capture.

If called on CU_STREAM_LEGACY (the "null stream") while a stream not created with CU_STREAM_NON_BLOCKING is capturing, returns CUDA_ERROR_STREAM_CAPTURE_IMPLICIT.

Valid data (other than capture status) is returned only if both of the following are true:

  * the call returns CUDA_SUCCESS

  * the returned capture status is CU_STREAM_CAPTURE_STATUS_ACTIVE


If `edgeData_out` is non-NULL then `dependencies_out` must be as well. If `dependencies_out` is non-NULL and `edgeData_out` is NULL, but there is non-zero edge data for one or more of the current stream dependencies, the call will return CUDA_ERROR_LOSSY_QUERY.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuStreamGetCtx ( CUstream hStream, CUcontext* pctx )


Query the context associated with a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`pctx`
    \- Returned context associated with the stream

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Returns the CUDA context that the stream is associated with.

If the stream was created via the API cuGreenCtxStreamCreate, the returned context is equivalent to the one returned by cuCtxFromGreenCtx() on the green context associated with the stream at creation time.

The stream handle `hStream` can refer to any of the following:

  * a stream created via any of the CUDA driver APIs such as cuStreamCreate and cuStreamCreateWithPriority, or their runtime API equivalents such as cudaStreamCreate, cudaStreamCreateWithFlags and cudaStreamCreateWithPriority. The returned context is the context that was active in the calling thread when the stream was created. Passing an invalid handle will result in undefined behavior.

  * any of the special streams such as the NULL stream, CU_STREAM_LEGACY and CU_STREAM_PER_THREAD. The runtime API equivalents of these are also accepted, which are NULL, cudaStreamLegacy and cudaStreamPerThread respectively. Specifying any of the special handles will return the context current to the calling thread. If no context is current to the calling thread, CUDA_ERROR_INVALID_CONTEXT is returned.


CUresult cuStreamGetCtx_v2 ( CUstream hStream, CUcontext* pCtx, CUgreenCtx* pGreenCtx )


Query the contexts associated with a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`pCtx`
    \- Returned regular context associated with the stream
`pGreenCtx`
    \- Returned green context if the stream is associated with a green context or NULL if not

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE

###### Description

Returns the contexts that the stream is associated with.

If the stream is associated with a green context, the API returns the green context in `pGreenCtx` and the primary context of the associated device in `pCtx`.

If the stream is associated with a regular context, the API returns the regular context in `pCtx` and NULL in `pGreenCtx`.

The stream handle `hStream` can refer to any of the following:

  * a stream created via any of the CUDA driver APIs such as cuStreamCreate, cuStreamCreateWithPriority and cuGreenCtxStreamCreate, or their runtime API equivalents such as cudaStreamCreate, cudaStreamCreateWithFlags and cudaStreamCreateWithPriority. Passing an invalid handle will result in undefined behavior.

  * any of the special streams such as the NULL stream, CU_STREAM_LEGACY and CU_STREAM_PER_THREAD. The runtime API equivalents of these are also accepted, which are NULL, cudaStreamLegacy and cudaStreamPerThread respectively. If any of the special handles are specified, the API will operate on the context current to the calling thread. If a green context (that was converted via cuCtxFromGreenCtx() before setting it current) is current to the calling thread, the API will return the green context in `pGreenCtx` and the primary context of the associated device in `pCtx`. If a regular context is current, the API returns the regular context in `pCtx` and NULL in `pGreenCtx`. Note that specifying CU_STREAM_PER_THREAD or cudaStreamPerThread will return CUDA_ERROR_INVALID_HANDLE if a green context is current to the calling thread. If no context is current to the calling thread, CUDA_ERROR_INVALID_CONTEXT is returned.


CUresult cuStreamGetDevice ( CUstream hStream, CUdevice* device )


Returns the device handle of the stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`device`
    \- Returns the device to which a stream belongs

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Returns in `*device` the device handle of the stream

CUresult cuStreamGetFlags ( CUstream hStream, unsigned int* flags )


Query the flags of a given stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`flags`
    \- Pointer to an unsigned integer in which the stream's flags are returned The value returned in `flags` is a logical 'OR' of all flags that were used while creating this stream. See cuStreamCreate for the list of valid flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Query the flags of a stream created using cuStreamCreate, cuStreamCreateWithPriority or cuGreenCtxStreamCreate and return the flags in `flags`.

CUresult cuStreamGetId ( CUstream hStream, unsigned long long* streamId )


Returns the unique Id associated with the stream handle supplied.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`streamId`
    \- Pointer to store the Id of the stream

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Returns in `streamId` the unique Id which is associated with the given stream handle. The Id is unique for the life of the program.

The stream handle `hStream` can refer to any of the following:

  * a stream created via any of the CUDA driver APIs such as cuStreamCreate and cuStreamCreateWithPriority, or their runtime API equivalents such as cudaStreamCreate, cudaStreamCreateWithFlags and cudaStreamCreateWithPriority. Passing an invalid handle will result in undefined behavior.

  * any of the special streams such as the NULL stream, CU_STREAM_LEGACY and CU_STREAM_PER_THREAD. The runtime API equivalents of these are also accepted, which are NULL, cudaStreamLegacy and cudaStreamPerThread respectively.


CUresult cuStreamGetPriority ( CUstream hStream, int* priority )


Query the priority of a given stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`priority`
    \- Pointer to a signed integer in which the stream's priority is returned

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Query the priority of a stream created using cuStreamCreate, cuStreamCreateWithPriority or cuGreenCtxStreamCreate and return the priority in `priority`. Note that if the stream was created with a priority outside the numerical range returned by cuCtxGetStreamPriorityRange, this function returns the clamped priority. See cuStreamCreateWithPriority for details about priority clamping.

CUresult cuStreamIsCapturing ( CUstream hStream, CUstreamCaptureStatus* captureStatus )


Returns a stream's capture status.

######  Parameters

`hStream`
    \- Stream to query
`captureStatus`
    \- Returns the stream's capture status

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_STREAM_CAPTURE_IMPLICIT

###### Description

Return the capture status of `hStream` via `captureStatus`. After a successful call, `*captureStatus` will contain one of the following:

  * CU_STREAM_CAPTURE_STATUS_NONE: The stream is not capturing.

  * CU_STREAM_CAPTURE_STATUS_ACTIVE: The stream is capturing.

  * CU_STREAM_CAPTURE_STATUS_INVALIDATED: The stream was capturing but an error has invalidated the capture sequence. The capture sequence must be terminated with cuStreamEndCapture on the stream where it was initiated in order to continue using `hStream`.


Note that, if this is called on CU_STREAM_LEGACY (the "null stream") while a blocking stream in the same context is capturing, it will return CUDA_ERROR_STREAM_CAPTURE_IMPLICIT and `*captureStatus` is unspecified after the call. The blocking stream capture is not invalidated.

When a blocking stream is capturing, the legacy stream is in an unusable state until the blocking stream capture is terminated. The legacy stream is not supported for stream capture, but attempted use would have an implicit dependency on the capturing stream(s).

CUresult cuStreamQuery ( CUstream hStream )


Determine status of a compute stream.

######  Parameters

`hStream`
    \- Stream to query status of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_READY

###### Description

Returns CUDA_SUCCESS if all operations in the stream specified by `hStream` have completed, or CUDA_ERROR_NOT_READY if not.

For the purposes of Unified Memory, a return value of CUDA_SUCCESS is equivalent to having called cuStreamSynchronize().

  * This function uses standard default stream semantics.

  *
CUresult cuStreamSetAttribute ( CUstream hStream, CUstreamAttrID attr, const CUstreamAttrValue* value )


Sets stream attribute.

######  Parameters

`hStream`

`attr`

`value`


###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Sets attribute `attr` on `hStream` from corresponding attribute of `value`. The updated attribute will be applied to subsequent work submitted to the stream. It will not affect previously submitted work.

CUresult cuStreamSynchronize ( CUstream hStream )


Wait until a stream's tasks are completed.

######  Parameters

`hStream`
    \- Stream to wait for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE

###### Description

Waits until the device has completed all operations in the stream specified by `hStream`. If the context was created with the CU_CTX_SCHED_BLOCKING_SYNC flag, the CPU thread will block until the stream is finished with all of its tasks.

  * This function uses standard default stream semantics.

  *
CUresult cuStreamUpdateCaptureDependencies ( CUstream hStream, CUgraphNode* dependencies, const CUgraphEdgeData* dependencyData, size_t numDependencies, unsigned int  flags )


Update the set of dependencies in a capturing stream.

######  Parameters

`hStream`
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

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_ILLEGAL_STATE

###### Description

Modifies the dependency set of a capturing stream. The dependency set is the set of nodes that the next captured node in the stream will depend on along with the edge data for those dependencies.

Valid flags are CU_STREAM_ADD_CAPTURE_DEPENDENCIES and CU_STREAM_SET_CAPTURE_DEPENDENCIES. These control whether the set passed to the API is added to the existing set or replaces it. A flags value of 0 defaults to CU_STREAM_ADD_CAPTURE_DEPENDENCIES.

Nodes that are removed from the dependency set via this API do not result in CUDA_ERROR_STREAM_CAPTURE_UNJOINED if they are unreachable from the stream at cuStreamEndCapture.

Returns CUDA_ERROR_ILLEGAL_STATE if the stream is not capturing.

CUresult cuStreamWaitEvent ( CUstream hStream, CUevent hEvent, unsigned int  Flags )


Make a compute stream wait on an event.

######  Parameters

`hStream`
    \- Stream to wait
`hEvent`
    \- Event to wait on (may not be NULL)
`Flags`
    \- See CUevent_capture_flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE

###### Description

Makes all future work submitted to `hStream` wait for all work captured in `hEvent`. See cuEventRecord() for details on what is captured by an event. The synchronization will be performed efficiently on the device when applicable. `hEvent` may be from a different context or device than `hStream`.

flags include:

  * CU_EVENT_WAIT_DEFAULT: Default event creation flag.

  * CU_EVENT_WAIT_EXTERNAL: Event is captured in the graph as an external event node when performing stream capture. This flag is invalid outside of stream capture.


  * This function uses standard default stream semantics.

  *
CUresult cuThreadExchangeStreamCaptureMode ( CUstreamCaptureMode* mode )


Swaps the stream capture interaction mode for a thread.

######  Parameters

`mode`
    \- Pointer to mode value to swap with the current mode

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the calling thread's stream capture interaction mode to the value contained in `*mode`, and overwrites `*mode` with the previous mode for the thread. To facilitate deterministic behavior across function or module boundaries, callers are encouraged to use this API in a push-pop fashion:


    ‎     CUstreamCaptureMode mode = desiredMode;
               cuThreadExchangeStreamCaptureMode(&mode);
               ...
               cuThreadExchangeStreamCaptureMode(&mode); // restore previous mode

During stream capture (see cuStreamBeginCapture), some actions, such as a call to cudaMalloc, may be unsafe. In the case of cudaMalloc, the operation is not enqueued asynchronously to a stream, and is not observed by stream capture. Therefore, if the sequence of operations captured via cuStreamBeginCapture depended on the allocation being replayed whenever the graph is launched, the captured graph would be invalid.

Therefore, stream capture places restrictions on API calls that can be made within or concurrently to a cuStreamBeginCapture-cuStreamEndCapture sequence. This behavior can be controlled via this API and flags to cuStreamBeginCapture.

A thread's mode is one of the following:

  * `CU_STREAM_CAPTURE_MODE_GLOBAL:` This is the default mode. If the local thread has an ongoing capture sequence that was not initiated with `CU_STREAM_CAPTURE_MODE_RELAXED` at `cuStreamBeginCapture`, or if any other thread has a concurrent capture sequence initiated with `CU_STREAM_CAPTURE_MODE_GLOBAL`, this thread is prohibited from potentially unsafe API calls.

  * `CU_STREAM_CAPTURE_MODE_THREAD_LOCAL:` If the local thread has an ongoing capture sequence not initiated with `CU_STREAM_CAPTURE_MODE_RELAXED`, it is prohibited from potentially unsafe API calls. Concurrent capture sequences in other threads are ignored.

  * `CU_STREAM_CAPTURE_MODE_RELAXED:` The local thread is not prohibited from potentially unsafe API calls. Note that the thread is still prohibited from API calls which necessarily conflict with stream capture, for example, attempting cuEventQuery on an event that was last recorded inside a capture sequence.


