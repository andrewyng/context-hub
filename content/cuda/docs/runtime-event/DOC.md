---
name: runtime-event
description: '**Source:** group__CUDART__EVENT.html#group__CUDART__EVENT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.5. Event Management

**Source:** group__CUDART__EVENT.html#group__CUDART__EVENT


### Functions

__host__ cudaError_t cudaEventCreate ( cudaEvent_t* event )


Creates an event object.

######  Parameters

`event`
    \- Newly created event

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorLaunchFailure, cudaErrorMemoryAllocation

###### Description

Creates an event object for the current device using cudaEventDefault.


**See also:**

cudaEventCreate ( C++ API), cudaEventCreateWithFlags, cudaEventRecord, cudaEventQuery, cudaEventSynchronize, cudaEventDestroy, cudaEventElapsedTime, cudaStreamWaitEvent, cuEventCreate

__host__  __device__ cudaError_t cudaEventCreateWithFlags ( cudaEvent_t* event, unsigned int  flags )


Creates an event object with the specified flags.

######  Parameters

`event`
    \- Newly created event
`flags`
    \- Flags for new event

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorLaunchFailure, cudaErrorMemoryAllocation

###### Description

Creates an event object for the current device with the specified flags. Valid flags include:

  * cudaEventDefault: Default event creation flag.

  * cudaEventBlockingSync: Specifies that event should use blocking synchronization. A host thread that uses cudaEventSynchronize() to wait on an event created with this flag will block until the event actually completes.

  * cudaEventDisableTiming: Specifies that the created event does not need to record timing data. Events created with this flag specified and the cudaEventBlockingSync flag not specified will provide the best performance when used with cudaStreamWaitEvent() and cudaEventQuery().

  * cudaEventInterprocess: Specifies that the created event may be used as an interprocess event by cudaIpcGetEventHandle(). cudaEventInterprocess must be specified along with cudaEventDisableTiming.


**See also:**

cudaEventCreate ( C API), cudaEventSynchronize, cudaEventDestroy, cudaEventElapsedTime, cudaStreamWaitEvent, cuEventCreate

__host__  __device__ cudaError_t cudaEventDestroy ( cudaEvent_t event )


Destroys an event object.

######  Parameters

`event`
    \- Event to destroy

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorLaunchFailure

###### Description

Destroys the event specified by `event`.

An event may be destroyed before it is complete (i.e., while cudaEventQuery() would return cudaErrorNotReady). In this case, the call does not block on completion of the event, and any associated resources will automatically be released asynchronously at completion.

  * Use of the handle after this call is undefined behavior.

  * Returns cudaErrorInvalidResourceHandle in the event of being passed NULL as the input event.


**See also:**

cudaEventCreate ( C API), cudaEventCreateWithFlags, cudaEventQuery, cudaEventSynchronize, cudaEventRecord, cudaEventElapsedTime, cuEventDestroy

__host__ cudaError_t cudaEventElapsedTime ( float* ms, cudaEvent_t start, cudaEvent_t end )


Computes the elapsed time between events.

######  Parameters

`ms`
    \- Time between `start` and `end` in ms
`start`
    \- Starting event
`end`
    \- Ending event

###### Returns

cudaSuccess, cudaErrorNotReady, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorLaunchFailure, cudaErrorUnknown

###### Description

Computes the elapsed time between two events (in milliseconds with a resolution of around 0.5 microseconds). Note this API is not guaranteed to return the latest errors for pending work. As such this API is intended to serve as a elapsed time calculation only and polling for completion on the events to be compared should be done with cudaEventQuery instead.

If either event was last recorded in a non-NULL stream, the resulting time may be greater than expected (even if both used the same stream handle). This happens because the cudaEventRecord() operation takes place asynchronously and there is no guarantee that the measured latency is actually just between the two events. Any number of other different stream operations could execute in between the two measured events, thus altering the timing in a significant way.

If cudaEventRecord() has not been called on either event, then cudaErrorInvalidResourceHandle is returned. If cudaEventRecord() has been called on both events but one or both of them has not yet been completed (that is, cudaEventQuery() would return cudaErrorNotReady on at least one of the events), cudaErrorNotReady is returned. If either event was created with the cudaEventDisableTiming flag, then this function will return cudaErrorInvalidResourceHandle.

  * Returns cudaErrorInvalidResourceHandle in the event of being passed NULL as the input event.


**See also:**

cudaEventCreate ( C API), cudaEventCreateWithFlags, cudaEventQuery, cudaEventSynchronize, cudaEventDestroy, cudaEventRecord, cuEventElapsedTime

__host__ cudaError_t cudaEventQuery ( cudaEvent_t event )


Queries an event's status.

######  Parameters

`event`
    \- Event to query

###### Returns

cudaSuccess, cudaErrorNotReady, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorLaunchFailure

###### Description

Queries the status of all work currently captured by `event`. See cudaEventRecord() for details on what is captured by an event.

Returns cudaSuccess if all captured work has been completed, or cudaErrorNotReady if any captured work is incomplete.

For the purposes of Unified Memory, a return value of cudaSuccess is equivalent to having called cudaEventSynchronize().

  * Returns cudaErrorInvalidResourceHandle in the event of being passed NULL as the input event.


**See also:**

cudaEventCreate ( C API), cudaEventCreateWithFlags, cudaEventRecord, cudaEventSynchronize, cudaEventDestroy, cudaEventElapsedTime, cuEventQuery

__host__  __device__ cudaError_t cudaEventRecord ( cudaEvent_t event, cudaStream_t stream = 0 )


Records an event.

######  Parameters

`event`
    \- Event to record
`stream`
    \- Stream in which to record event

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorLaunchFailure

###### Description

Captures in `event` the contents of `stream` at the time of this call. `event` and `stream` must be on the same CUDA context. Calls such as cudaEventQuery() or cudaStreamWaitEvent() will then examine or wait for completion of the work that was captured. Uses of `stream` after this call do not modify `event`. See note on default stream behavior for what is captured in the default case.

cudaEventRecord() can be called multiple times on the same event and will overwrite the previously captured state. Other APIs such as cudaStreamWaitEvent() use the most recently captured state at the time of the API call, and are not affected by later calls to cudaEventRecord(). Before the first call to cudaEventRecord(), an event represents an empty set of work, so for example cudaEventQuery() would return cudaSuccess.

  * This function uses standard default stream semantics.

  * Returns cudaErrorInvalidResourceHandle in the event of being passed NULL as the input event.


**See also:**

cudaEventCreate ( C API), cudaEventCreateWithFlags, cudaEventQuery, cudaEventSynchronize, cudaEventDestroy, cudaEventElapsedTime, cudaStreamWaitEvent, cudaEventRecordWithFlags, cuEventRecord

__host__ cudaError_t cudaEventRecordWithFlags ( cudaEvent_t event, cudaStream_t stream = 0, unsigned int  flags = 0 )


Records an event.

######  Parameters

`event`
    \- Event to record
`stream`
    \- Stream in which to record event
`flags`
    \- Parameters for the operation(See above)

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorLaunchFailure

###### Description

Captures in `event` the contents of `stream` at the time of this call. `event` and `stream` must be on the same CUDA context. Calls such as cudaEventQuery() or cudaStreamWaitEvent() will then examine or wait for completion of the work that was captured. Uses of `stream` after this call do not modify `event`. See note on default stream behavior for what is captured in the default case.

cudaEventRecordWithFlags() can be called multiple times on the same event and will overwrite the previously captured state. Other APIs such as cudaStreamWaitEvent() use the most recently captured state at the time of the API call, and are not affected by later calls to cudaEventRecordWithFlags(). Before the first call to cudaEventRecordWithFlags(), an event represents an empty set of work, so for example cudaEventQuery() would return cudaSuccess.

flags include:

  * cudaEventRecordDefault: Default event creation flag.

  * cudaEventRecordExternal: Event is captured in the graph as an external event node when performing stream capture.


  * This function uses standard default stream semantics.

  * Returns cudaErrorInvalidResourceHandle in the event of being passed NULL as the input event.


**See also:**

cudaEventCreate ( C API), cudaEventCreateWithFlags, cudaEventQuery, cudaEventSynchronize, cudaEventDestroy, cudaEventElapsedTime, cudaStreamWaitEvent, cudaEventRecord, cuEventRecord

__host__ cudaError_t cudaEventSynchronize ( cudaEvent_t event )


Waits for an event to complete.

######  Parameters

`event`
    \- Event to wait for

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorLaunchFailure

###### Description

Waits until the completion of all work currently captured in `event`. See cudaEventRecord() for details on what is captured by an event.

Waiting for an event that was created with the cudaEventBlockingSync flag will cause the calling CPU thread to block until the event has been completed by the device. If the cudaEventBlockingSync flag has not been set, then the CPU thread will busy-wait until the event has been completed by the device.

  * Returns cudaErrorInvalidResourceHandle in the event of being passed NULL as the input event.


**See also:**

cudaEventCreate ( C API), cudaEventCreateWithFlags, cudaEventRecord, cudaEventQuery, cudaEventDestroy, cudaEventElapsedTime, cuEventSynchronize

* * *

!


Copyright © 2025 NVIDIA Corporation