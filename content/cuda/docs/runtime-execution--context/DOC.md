---
name: runtime-execution--context
description: '**Source:** group__CUDART__EXECUTION__CONTEXT.html#group__CUDART__EXECUTION__CONTEXT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.33. Execution Context Management

**Source:** group__CUDART__EXECUTION__CONTEXT.html#group__CUDART__EXECUTION__CONTEXT


### Functions

__host__ cudaError_t cudaDevResourceGenerateDesc ( cudaDevResourceDesc_t* phDesc, cudaDevResource* resources, unsigned int  nbResources )


Generate a resource descriptor.

######  Parameters

`phDesc`
    \- Output descriptor
`resources`
    \- Array of resources to be included in the descriptor
`nbResources`
    \- Number of resources passed in `resources`

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotPermitted, cudaErrorInvalidResourceType, cudaErrorInvalidResourceConfiguration, cudaErrorNotSupported, cudaErrorOutOfMemory, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

Generates a single resource descriptor with the set of resources specified in `resources`. The generated resource descriptor is necessary for the creation of green contexts via the cudaGreenCtxCreate API. Resources of the same type can be passed in, provided they meet the requirements as noted below.

A successful API call must have:

  * A valid output pointer for the `phDesc` descriptor as well as a valid array of `resources` pointers, with the array size passed in `nbResources`. If multiple resources are provided in `resources`, the device they came from must be the same, otherwise cudaErrorInvalidResourceConfiguration is returned. If multiple resources are provided in `resources` and they are of type cudaDevResourceTypeSm, they must be outputs (whether `result` or `remaining`) from the same split API instance and have the same smCoscheduledAlignment values, otherwise cudaErrorInvalidResourceConfiguration is returned.


Note: The API is not supported on 32-bit platforms.

Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuDevResourceGenerateDesc, cudaDeviceGetDevResource, cudaExecutionCtxGetDevResource, cudaDevSmResourceSplit, cudaGreenCtxCreate

__host__ cudaError_t cudaDevSmResourceSplit ( cudaDevResource* result, unsigned int  nbGroups, const cudaDevResource* input, cudaDevResource* remainder, unsigned int  flags, cudaDevSmResourceGroupParams* groupParams )


Splits a `cudaDevResourceTypeSm` resource into structured groups.

######  Parameters

`result`
    \- Output array of `cudaDevResource` resources. Can be NULL, alongside an smCount of 0, for discovery purpose.
`nbGroups`
    \- Specifies the number of groups in `result` and `groupParams`
`input`
    \- Input SM resource to be split. Must be a valid `cudaDevResourceTypeSm` resource.
`remainder`
    \- If splitting the input resource leaves any SMs, the remainder is placed in here.
`flags`
    \- Flags specifying how the API should behave. The value should be 0 for now.
`groupParams`
    \- Description of how the SMs should be split and assigned to the corresponding result entry.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotPermitted, cudaErrorInvalidResourceType, cudaErrorInvalidResourceConfiguration, cudaErrorNotSupported, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

This API will split a resource of cudaDevResourceTypeSm into `nbGroups` structured device resource groups (the `result` array), as well as an optional `remainder`, according to a set of requirements specified in the `groupParams` array. The term “structured” is a trait that specifies the `result` has SMs that are co-scheduled together. This co-scheduling can be specified via the `coscheduledSmCount` field of the `groupParams` structure, while the `smCount` will specify how many SMs are required in total for that result. The remainder is always “unstructured”, it does not have any set guarantees with respect to co-scheduling and those properties will need to either be queried via the occupancy set of APIs or further split into structured groups by this API.

The API has a discovery mode for use cases where it is difficult to know ahead of time what the SM count should be. Discovery happens when the `smCount` field of a given `groupParams` array entry is set to 0 - the smCount will be filled in by the API with the derived SM count according to the provided `groupParams` fields and constraints. Discovery can be used with both a valid result array and with a NULL `result` pointer value. The latter is useful in situations where the smCount will end up being zero, which is an invalid value to create a result entry with, but allowed for discovery purposes when the `result` is NULL.

The `groupParams` array is evaluated from index 0 to `nbGroups` \- 1. For each index in the `groupParams` array, the API will evaluate which SMs may be a good fit based on constraints and assign those SMs to `result`. This evaluation order is important to consider when using discovery mode, as it helps discover the remaining SMs.

For a valid call:

  * `result` should point to a `cudaDevResource` array of size `nbGroups`, or alternatively, may be NULL, if the developer wishes for only the groupParams entries to be updated


  * `input` should be a valid cudaDevResourceTypeSm resource that originates from querying the execution context, or device.


  * The `remainder` group may be NULL.


  * There are no API `flags` at this time, so the value passed in should be 0.


  * A cudaDevSmResourceGroupParams array of size `nbGroups`. Each entry must be zero-initialized.
    * `smCount:` must be either 0 or in the range of [2,inputSmCount] where inputSmCount is the amount of SMs the `input` resource has. `smCount` must be a multiple of 2, as well as a multiple of `coscheduledSmCount`. When assigning SMs to a group (and if results are expected by having the `result` parameter set), `smCount` cannot end up with 0 or a value less than `coscheduledSmCount` otherwise cudaErrorInvalidResourceConfiguration will be returned.

    * `coscheduledSmCount:` allows grouping SMs together in order to be able to launch clusters on Compute Architecture 9.0+. The default value may be queried from the device’s cudaDevResourceTypeSm resource (8 on Compute Architecture 9.0+ and 2 otherwise). The maximum is 32 on Compute Architecture 9.0+ and 2 otherwise.

    * `preferredCoscheduledSmCount:` Attempts to merge `coscheduledSmCount` groups into larger groups, in order to make use of `preferredClusterDimensions` on Compute Architecture 10.0+. The default value is set to `coscheduledSmCount`.

    * `flags:`
      * `cudaDevSmResourceGroupBackfill:` lets `smCount` be a non-multiple of `coscheduledSmCount`, filling the difference between SM count and already assigned co-scheduled groupings with other SMs. This lets any resulting group behave similar to the `remainder` group for example.


**Example params and their effect:**

A groupParams array element is defined in the following order:


    ‎ { .smCount, .coscheduledSmCount, .preferredCoscheduledSmCount, .flags, \/\* .reserved \*\/ }


    ‎// Example 1
          // Will discover how many SMs there are, that are co-scheduled in groups of smCoscheduledAlignment.
          // The rest is placed in the optional remainder.
          cudaDevSmResourceGroupParams params { 0, 0, 0, 0 };


    ‎// Example 2
          // Assuming the device has 10+ SMs, the result will have 10 SMs that are co-scheduled in groups of 2 SMs.
          // The rest is placed in the optional remainder.
          cudaDevSmResourceGroupParams params { 10, 2, 0, 0};
          // Setting the coscheduledSmCount to 2 guarantees that we can always have a valid result
          // as long as the SM count is less than or equal to the input resource SM count.


    ‎// Example 3
          // A single piece is split-off, but instead of assigning the rest to the remainder, a second group contains everything else
          // This assumes the device has 10+ SMs (8 of which are coscheduled in groups of 4)
          // otherwise the second group could end up with 0 SMs, which is not allowed.
          cudaDevSmResourceGroupParams params { {8, 4, 0, 0}, {0, 2, 0, cudaDevSmResourceGroupBackfill } }

The difference between a catch-all param group as the last entry and the remainder is in two aspects:

  * The remainder may be NULL / _TYPE_INVALID (if there are no SMs remaining), while a result group must always be valid.

  * The remainder does not have a structure, while the result group will always need to adhere to a structure of coscheduledSmCount (even if its just 2), and therefore must always have enough coscheduled SMs to cover that requirement (even with the `cudaDevSmResourceGroupBackfill` flag enabled).


Splitting an input into N groups, can be accomplished by repeatedly splitting off 1 group and re-splitting the remainder (a bisect operation). However, it's recommended to accomplish this with a single call wherever possible.

Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuDevSmResourceSplit, cudaDeviceGetDevResource, cudaExecutionCtxGetDevResource, cudaDevResourceGenerateDesc

__host__ cudaError_t cudaDevSmResourceSplitByCount ( cudaDevResource* result, unsigned int* nbGroups, const cudaDevResource* input, cudaDevResource* remaining, unsigned int  flags, unsigned int  minCount )


Splits `cudaDevResourceTypeSm` resources.

######  Parameters

`result`
    \- Output array of `cudaDevResource` resources. Can be NULL to query the number of groups.
`nbGroups`
    \- This is a pointer, specifying the number of groups that would be or should be created as described below.
`input`
    \- Input SM resource to be split. Must be a valid `cudaDevSmResource` resource.
`remaining`
    \- If the input resource cannot be cleanly split among `nbGroups`, the remaining is placed in here. Can be ommitted (NULL) if the user does not need the remaining set.
`flags`
    \- Flags specifying how these partitions are used or which constraints to abide by when splitting the input. Zero is valid for default behavior.
`minCount`
    \- Minimum number of SMs required

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotPermitted, cudaErrorInvalidResourceType, cudaErrorInvalidResourceConfiguration, cudaErrorNotSupported, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

Splits `cudaDevResourceTypeSm` resources into `nbGroups`, adhering to the minimum SM count specified in `minCount` and the usage flags in `flags`. If `result` is NULL, the API simulates a split and provides the amount of groups that would be created in `nbGroups`. Otherwise, `nbGroups` must point to the amount of elements in `result` and on return, the API will overwrite `nbGroups` with the amount actually created. The groups are written to the array in `result`. `nbGroups` can be less than the total amount if a smaller number of groups is needed.

This API is used to spatially partition the input resource. The input resource needs to come from one of cudaDeviceGetDevResource, or cudaExecutionCtxGetDevResource. A limitation of the API is that the output results cannot be split again without first creating a descriptor and a green context with that descriptor.

When creating the groups, the API will take into account the performance and functional characteristics of the input resource, and guarantee a split that will create a disjoint set of symmetrical partitions. This may lead to fewer groups created than purely dividing the total SM count by the `minCount` due to cluster requirements or alignment and granularity requirements for the minCount. These requirements can be queried with cudaDeviceGetDevResource, or cudaExecutionCtxGetDevResource for cudaDevResourceTypeSm, using the `minSmPartitionSize` and `smCoscheduledAlignment` fields to determine minimum partition size and alignment granularity, respectively.

The `remainder` set does not have the same functional or performance guarantees as the groups in `result`. Its use should be carefully planned and future partitions of the `remainder` set are discouraged.

The following flags are supported:

  * `cudaDevSmResourceSplitIgnoreSmCoscheduling` : Lower the minimum SM count and alignment, and treat each SM independent of its hierarchy. This allows more fine grained partitions but at the cost of advanced features (such as large clusters on compute capability 9.0+).

  * `cudaDevSmResourceSplitMaxPotentialClusterSize` : Compute Capability 9.0+ only. Attempt to create groups that may allow for maximally sized thread clusters. This can be queried post green context creation using cudaOccupancyMaxPotentialClusterSize and launch configuration \(config\), return the maximum cluster size in *clusterSize.").


A successful API call must either have:

  * A valid array of `result` pointers of size passed in `nbGroups`, with `input` of type `cudaDevResourceTypeSm`. Value of `minCount` must be between 0 and the SM count specified in `input`. `remaining` may be NULL.

  * NULL passed in for `result`, with a valid integer pointer in `nbGroups` and `input` of type `cudaDevResourceTypeSm`. Value of `minCount` must be between 0 and the SM count specified in `input`. `remaining` may be NULL. This queries the number of groups that would be created by the API.


Note: The API is not supported on 32-bit platforms.

Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuDevSmResourceSplitByCount, cudaDeviceGetDevResource, cudaExecutionCtxGetDevResource, cudaDevResourceGenerateDesc

__host__ cudaError_t cudaDeviceGetDevResource ( int  device, cudaDevResource* resource, cudaDevResourceType type )


Get device resources.

######  Parameters

`device`
    \- Device to get resource for
`resource`
    \- Output pointer to a cudaDevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotPermitted, cudaErrorInvalidDevice, cudaErrorInvalidResourceType, cudaErrorNotSupported, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

Get the `type` resources available to the `device`. This may often be the starting point for further partitioning or configuring of resources.

Note: The API is not supported on 32-bit platforms.

Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuDeviceGetDevResource, cudaExecutionCtxGetDevResource, cudaDevSmResourceSplit, cudaDevResourceGenerateDesc

__host__ cudaError_t cudaDeviceGetExecutionCtx ( cudaExecutionContext_t* ctx, int  device )


Returns the execution context for a device.

######  Parameters

`ctx`
    \- Returns the device execution context
`device`
    \- Device to get the execution context for

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice

###### Description

Returns in `ctx` the execution context for the specified device. This is the device's primary context. The returned context can then be passed to APIs that take in a cudaExecutionContext_t enabling explicit context-based programming without relying on thread-local state.

Passing the returned execution context to cudaExecutionCtxDestroy() is not allowed and will result in undefined behavior.

**See also:**

cudaExecutionCtxGetDevice, cudaExecutionCtxGetId

__host__ cudaError_t cudaExecutionCtxDestroy ( cudaExecutionContext_t ctx )


Destroy a execution context.

######  Parameters

`ctx`
    \- Execution context to destroy (required parameter, see note below)

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotPermitted, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

Destroys the specified execution context `ctx`. It is the responsibility of the caller to ensure that no API call issues using `ctx` while cudaExecutionCtxDestroy() is executing or subsequently.

If `ctx` is a green context, any resources provisioned for it (that were initially available via the resource descriptor) are released as well.

The API does not destroy streams created via cudaExecutionCtxStreamCreate. Users are expected to destroy these streams explicitly using cudaStreamDestroy to avoid resource leaks. Once the execution context is destroyed, any subsequent API calls involving these streams will return cudaErrorStreamDetached with the exception of the following APIs:

  * cudaStreamDestroy. Note this is only supported on CUDA drivers 13.1 and above.


Additionally, the API will invalidate all active captures on these streams.

Passing in a `ctx` that was not explicitly created via CUDA Runtime APIs is not allowed and will result in undefined behavior.

  * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaGreenCtxCreate

__host__ cudaError_t cudaExecutionCtxGetDevResource ( cudaExecutionContext_t ctx, cudaDevResource* resource, cudaDevResourceType type )


Get context resources.

######  Parameters

`ctx`
    \- Execution context to get resource for (required parameter, see note below)
`resource`
    \- Output pointer to a cudaDevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported, cudaErrorNotPermitted, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

Get the `type` resources available to context represented by `ctx`.

Note: The API is not supported on 32-bit platforms.

  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaDeviceGetDevResource, cudaDevSmResourceSplit, cudaDevResourceGenerateDesc, cudaGreenCtxCreate

__host__ cudaError_t cudaExecutionCtxGetDevice ( int* device, cudaExecutionContext_t ctx )


Returns the device handle for the execution context.

######  Parameters

`device`
    \- Returned device handle for the specified execution context
`ctx`
    \- Execution context for which to obtain the device (required parameter, see note below)

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorNotPermitted

###### Description

Returns in `*device` the handle of the specified execution context's device. The execution context should not be NULL.

  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaGreenCtxCreate, cudaExecutionCtxDestroy, cuCtxGetDevice

__host__ cudaError_t cudaExecutionCtxGetId ( cudaExecutionContext_t ctx, unsigned long long* ctxId )


Returns the unique Id associated with the execution context supplied.

######  Parameters

`ctx`
    \- Context for which to obtain the Id (required parameter, see note below)
`ctxId`
    \- Pointer to store the Id of the context

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorNotPermitted

###### Description

Returns in `ctxId` the unique Id which is associated with a given context. The Id is unique for the life of the program for this instance of CUDA. The execution context should not be NULL.

  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaGreenCtxCreate, cudaExecutionCtxDestroy, cudaExecutionCtxGetDevice, cuCtxGetId

__host__ cudaError_t cudaExecutionCtxRecordEvent ( cudaExecutionContext_t ctx, cudaEvent_t event )


Records an event for the specified execution context.

######  Parameters

`ctx`
    \- Execution context to record event for (required parameter, see note below)
`event`
    \- Event to record

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidHandle, cudaErrorStreamCaptureUnsupported

###### Description

Captures in `event` all the activities of the execution context `ctx` at the time of this call. `event` and `ctx` must be from the same CUDA device, otherwise cudaErrorInvalidHandle will be returned. Calls such as cudaEventQuery() or cudaExecutionCtxWaitEvent() will then examine or wait for completion of the work that was captured. Uses of `ctx` after this call do not modify `event`. If the execution context passed to `ctx` is the device (primary) context obtained via cudaDeviceGetExecutionCtx(), `event` will capture all the activities of the green contexts created on the device as well.

The API will return cudaErrorStreamCaptureUnsupported if the specified execution context `ctx` has a stream in the capture mode. In such a case, the call will invalidate all the conflicting captures.

  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaEventRecord, cudaExecutionCtxWaitEvent, cuCtxRecordEvent, cuGreenCtxRecordEvent

__host__ cudaError_t cudaExecutionCtxStreamCreate ( cudaStream_t* phStream, cudaExecutionContext_t ctx, unsigned int  flags, int  priority )


Creates a stream and initializes it for the given execution context.

######  Parameters

`phStream`
    \- Returned stream handle
`ctx`
    \- Execution context to initialize the stream with (required parameter, see note below)
`flags`
    \- Flags for stream creation
`priority`
    \- Stream priority

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotPermitted, cudaErrorOutOfMemory, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

The API creates a CUDA stream with the specified `flags` and `priority`, initializing it with resources as defined at the time of creating the specified `ctx`. Additionally, the API also enables work submitted to to the stream to be tracked under `ctx`.

The supported values for `flags` are:

  * cudaStreamDefault: Default stream creation flag. This would be cudaStreamNonBlocking for streams created on a green context.

  * cudaStreamNonBlocking: Specifies that work running in the created stream may run concurrently with work in stream 0 (the NULL stream), and that the created stream should perform no implicit synchronization with stream 0


Specifying `priority` affects the scheduling priority of work in the stream. Priorities provide a hint to preferentially run work with higher priority when possible, but do not preempt already-running work or provide any other functional guarantee on execution order. `priority` follows a convention where lower numbers represent higher priorities. '0' represents default priority. The range of meaningful numerical priorities can be queried using cudaDeviceGetStreamPriorityRange. If the specified priority is outside the numerical range returned by cudaDeviceGetStreamPriorityRange, it will automatically be clamped to the lowest or the highest number in the range.

  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.

  * In the current implementation, only compute kernels launched in priority streams are affected by the stream's priority. Stream priorities have no effect on host-to-device and device-to-host memory operations.


**See also:**

cudaStreamDestroy, cudaGreenCtxCreate, cudaDeviceGetStreamPriorityRange, cudaStreamGetFlags, cudaStreamGetPriority, cudaStreamGetDevice, cudaStreamGetDevResource, cudaLaunchKernel, cudaEventRecord, cudaStreamWaitEvent, cudaStreamQuery, cudaStreamSynchronize, cudaStreamAddCallback

__host__ cudaError_t cudaExecutionCtxSynchronize ( cudaExecutionContext_t ctx )


Block for the specified execution context's tasks to complete.

######  Parameters

`ctx`
    \- Execution context to synchronize (required parameter, see note below)

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorDeviceUninitialized, cudaErrorInvalidValue

###### Description

Blocks until the specified execution context has completed all preceding requested tasks. If the specified execution context is the device (primary) context obtained via cudaDeviceGetExecutionCtx, green contexts that have been created on the device will also be synchronized.

The API returns an error if one of the preceding tasks failed.

  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaGreenCtxCreate, cudaExecutionCtxDestroy, cudaDeviceSynchronize, cuCtxSynchronize_v2

__host__ cudaError_t cudaExecutionCtxWaitEvent ( cudaExecutionContext_t ctx, cudaEvent_t event )


Make an execution context wait on an event.

######  Parameters

`ctx`
    \- Execution context to wait for (required parameter, see note below)
`event`
    \- Event to wait on

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidHandle, cudaErrorStreamCaptureUnsupported

###### Description

Makes all future work submitted to execution context `ctx` wait for all work captured in `event`. The synchronization will be performed on the device and will not block the calling CPU thread. See cudaExecutionCtxRecordEvent() for details on what is captured by an event. If the execution context passed to `ctx` is the device (primary) context obtained via cudaDeviceGetExecutionCtx(), all green contexts created on the device will wait for `event` as well.

  * `event` may be from a different execution context or device than `ctx`.

  * The API will return cudaErrorStreamCaptureUnsupported and invalidate the capture if the specified event `event` is part of an ongoing capture sequence or if the specified execution context `ctx` has a stream in the capture mode.


  *   * The context parameter is required and the API ignores the context that is current to the calling thread. This enables explicit context-based programming without relying on thread-local state. If no context is specified, the API will return cudaErrorInvalidValue.


**See also:**

cudaExecutionCtxRecordEvent, cudaStreamWaitEvent, cuCtxWaitEvent, cuGreenCtxWaitEvent

__host__ cudaError_t cudaGreenCtxCreate ( cudaExecutionContext_t* phCtx, cudaDevResourceDesc_t desc, int  device, unsigned int  flags )


Creates a green context with a specified set of resources.

######  Parameters

`phCtx`
    \- Pointer for the output handle to the green context
`desc`
    \- Descriptor generated via cudaDevResourceGenerateDesc which contains the set of resources to be used
`device`
    \- Device on which to create the green context.
`flags`
    \- Green context creation flags. Must be 0, currently reserved for future use.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice, cudaErrorNotPermitted, cudaErrorNotSupported, cudaErrorOutOfMemory, cudaErrorCudartUnloading, cudaErrorInitializationError

###### Description

This API creates a green context with the resources specified in the descriptor `desc` and returns it in the handle represented by `phCtx`.

This API retains the device’s primary context for the lifetime of the green context. The primary context will be released when the green context is destroyed. To avoid the overhead of repeated initialization and teardown, it is recommended to explicitly initialize the device's primary context ahead of time using cudaInitDevice. This ensures that the primary context remains initialized throughout the program’s lifetime, minimizing overhead during green context creation and destruction.

The API does not create a default stream for the green context. Developers are expected to create streams explicitly using cudaExecutionCtxStreamCreate to submit work to the green context.

Note: The API is not supported on 32-bit platforms.

Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cudaDeviceGetDevResource, cudaDevSmResourceSplit, cudaDevResourceGenerateDesc, cudaExecutionCtxGetDevResource, cudaExecutionCtxDestroy, cudaInitDevice, cudaExecutionCtxStreamCreate

__host__ cudaError_t cudaStreamGetDevResource ( cudaStream_t hStream, cudaDevResource* resource, cudaDevResourceType type )


Get stream resources.

######  Parameters

`hStream`
    \- Stream to get resource for
`resource`
    \- Output pointer to a cudaDevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorDeviceUninitialized, cudaErrorInvalidResourceType, cudaErrorInvalidValue, cudaErrorInvalidHandle, cudaErrorNotPermitted, cudaErrorCallRequiresNewerDriver

###### Description

Get the `type` resources available to the `hStream` and store them in `resource`.

Note: The API will return cudaErrorInvalidResourceType is `type` is `cudaDevResourceTypeWorkqueueConfig` or `cudaDevResourceTypeWorkqueue`.

  *
**See also:**

cudaGreenCtxCreate, cudaExecutionCtxStreamCreate, cudaStreamCreate, cudaDevSmResourceSplit, cudaDevResourceGenerateDesc, cuStreamGetDevResource

* * *

!


Copyright © 2025 NVIDIA Corporation