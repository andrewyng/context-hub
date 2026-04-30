---
name: driver-green--contexts
description: '**Source:** group__CUDA__GREEN__CONTEXTS.html#group__CUDA__GREEN__CONTEXTS'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.35. Green Contexts

**Source:** group__CUDA__GREEN__CONTEXTS.html#group__CUDA__GREEN__CONTEXTS


### Classes

struct

CU_DEV_SM_RESOURCE_GROUP_PARAMS


struct

CUdevResource


struct

CUdevSmResource


struct

CUdevWorkqueueConfigResource


struct

CUdevWorkqueueResource



### Typedefs

typedef CUdevResourceDesc_st * CUdevResourceDesc


### Enumerations

enum CUdevResourceType

enum CUdevWorkqueueConfigScope


### Functions

CUresult cuCtxFromGreenCtx ( CUcontext* pContext, CUgreenCtx hCtx )


Converts a green context into the primary context.

######  Parameters

`pContext`
    Returned primary context with green context resources
`hCtx`
    Green context to convert

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

The API converts a green context into the primary context returned in `pContext`. It is important to note that the converted context `pContext` is a normal primary context but with the resources of the specified green context `hCtx`. Once converted, it can then be used to set the context current with cuCtxSetCurrent or with any of the CUDA APIs that accept a CUcontext parameter.

Users are expected to call this API before calling any CUDA APIs that accept a CUcontext. Failing to do so will result in the APIs returning CUDA_ERROR_INVALID_CONTEXT.

CUresult cuCtxGetDevResource ( CUcontext hCtx, CUdevResource* resource, CUdevResourceType type )


Get context resources.

######  Parameters

`hCtx`
    \- Context to get resource for
`resource`
    \- Output pointer to a CUdevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Get the `type` resources available to the context represented by `hCtx` Note: The API is not supported on 32-bit platforms.

CUresult cuDevResourceGenerateDesc ( CUdevResourceDesc* phDesc, CUdevResource* resources, unsigned int  nbResources )


Generate a resource descriptor.

######  Parameters

`phDesc`
    \- Output descriptor
`resources`
    \- Array of resources to be included in the descriptor
`nbResources`
    \- Number of resources passed in `resources`

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_RESOURCE_CONFIGURATION

###### Description

Generates a single resource descriptor with the set of resources specified in `resources`. The generated resource descriptor is necessary for the creation of green contexts via the cuGreenCtxCreate API. Resources of the same type can be passed in, provided they meet the requirements as noted below.

A successful API call must have:

  * A valid output pointer for the `phDesc` descriptor as well as a valid array of `resources` pointers, with the array size passed in `nbResources`. If multiple resources are provided in `resources`, the device they came from must be the same, otherwise CUDA_ERROR_INVALID_RESOURCE_CONFIGURATION is returned. If multiple resources are provided in `resources` and they are of type CU_DEV_RESOURCE_TYPE_SM, they must be outputs (whether `result` or `remaining`) from the same split API instance and have the same smCoscheduledAlignment values, otherwise CUDA_ERROR_INVALID_RESOURCE_CONFIGURATION is returned.


Note: The API is not supported on 32-bit platforms.

CUresult cuDevSmResourceSplit ( CUdevResource* result, unsigned int  nbGroups, const CUdevResource* input, CUdevResource* remainder, unsigned int  flags, CU_DEV_SM_RESOURCE_GROUP_PARAMS* groupParams )


Splits a `CU_DEV_RESOURCE_TYPE_SM` resource into structured groups.

######  Parameters

`result`
    \- Output array of `CUdevResource` resources. Can be NULL, alongside an smCount of 0, for discovery purpose.
`nbGroups`
    \- Specifies the number of groups in `result` and `groupParams`
`input`
    \- Input SM resource to be split. Must be a valid `CU_DEV_RESOURCE_TYPE_SM` resource.
`remainder`
    \- If splitting the input resource leaves any SMs, the remainder is placed in here.
`flags`
    \- Flags specifying how the API should behave. The value should be 0 for now.
`groupParams`
    \- Description of how the SMs should be split and assigned to the corresponding result entry.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_RESOURCE_CONFIGURATION

###### Description

This API will split a resource of CU_DEV_RESOURCE_TYPE_SM into `nbGroups` structured device resource groups (the `result` array), as well as an optional `remainder`, according to a set of requirements specified in the `groupParams` array. The term “structured” is a trait that specifies the `result` has SMs that are co-scheduled together. This co-scheduling can be specified via the `coscheduledSmCount` field of the `groupParams` structure, while the `smCount` will specify how many SMs are required in total for that result. The remainder is always “unstructured”, it does not have any set guarantees with respect to co-scheduling and those properties will need to either be queried via the occupancy set of APIs or further split into structured groups by this API.

The API has a discovery mode for use cases where it is difficult to know ahead of time what the SM count should be. Discovery happens when the `smCount` field of a given `groupParams` array entry is set to 0 - the smCount will be filled in by the API with the derived SM count according to the provided `groupParams` fields and constraints. Discovery can be used with both a valid result array and with a NULL `result` pointer value. The latter is useful in situations where the smCount will end up being zero, which is an invalid value to create a result entry with, but allowed for discovery purposes when the `result` is NULL.

The `groupParams` array is evaluated from index 0 to `nbGroups` \- 1. For each index in the `groupParams` array, the API will evaluate which SMs may be a good fit based on constraints and assign those SMs to `result`. This evaluation order is important to consider when using discovery mode, as it helps discover the remaining SMs.

For a valid call:

  * `result` should point to a `CUdevResource` array of size `nbGroups`, or alternatively, may be NULL, if the developer wishes for only the groupParams entries to be updated


  * `input` should be a valid CU_DEV_RESOURCE_TYPE_SM resource that originates from querying the green context, device context, or device.


  * The `remainder` group may be NULL.


  * There are no API `flags` at this time, so the value passed in should be 0.


  * A CU_DEV_SM_RESOURCE_GROUP_PARAMS array of size `nbGroups`. Each entry must be zero-initialized.
    * `smCount:` must be either 0 or in the range of [2,inputSmCount] where inputSmCount is the amount of SMs the `input` resource has. `smCount` must be a multiple of 2, as well as a multiple of `coscheduledSmCount`. When assigning SMs to a group (and if results are expected by having the `result` parameter set), `smCount` cannot end up with 0 or a value less than `coscheduledSmCount` otherwise CUDA_ERROR_INVALID_RESOURCE_CONFIGURATION will be returned.

    * `coscheduledSmCount:` allows grouping SMs together in order to be able to launch clusters on Compute Architecture 9.0+. The default value may be queried from the device’s CU_DEV_RESOURCE_TYPE_SM resource (8 on Compute Architecture 9.0+ and 2 otherwise). The maximum is 32 on Compute Architecture 9.0+ and 2 otherwise.

    * `preferredCoscheduledSmCount:` Attempts to merge `coscheduledSmCount` groups into larger groups, in order to make use of `preferredClusterDimensions` on Compute Architecture 10.0+. The default value is set to `coscheduledSmCount`.

    * `flags:`
      * `CU_DEV_SM_RESOURCE_SPLIT_BACKFILL:` lets `smCount` be a non-multiple of `coscheduledSmCount`, filling the difference between SM count and already assigned co-scheduled groupings with other SMs. This lets any resulting group behave similar to the `remainder` group for example.


**Example params and their effect:**

A groupParams array element is defined in the following order:


    ‎ { .smCount, .coscheduledSmCount, .preferredCoscheduledSmCount, .flags, \/\* .reserved \*\/ }


    ‎// Example 1
          // Will discover how many SMs there are, that are co-scheduled in groups of smCoscheduledAlignment.
          // The rest is placed in the optional remainder.
          CU_DEV_SM_RESOURCE_GROUP_PARAMS params { 0, 0, 0, 0 };


    ‎// Example 2
          // Assuming the device has 10+ SMs, the result will have 10 SMs that are co-scheduled in groups of 2 SMs.
          // The rest is placed in the optional remainder.
          CU_DEV_SM_RESOURCE_GROUP_PARAMS params { 10, 2, 0, 0};
          // Setting the coscheduledSmCount to 2 guarantees that we can always have a valid result
          // as long as the SM count is less than or equal to the input resource SM count.


    ‎// Example 3
          // A single piece is split-off, but instead of assigning the rest to the remainder, a second group contains everything else
          // This assumes the device has 10+ SMs (8 of which are coscheduled in groups of 4)
          // otherwise the second group could end up with 0 SMs, which is not allowed.
          CU_DEV_SM_RESOURCE_GROUP_PARAMS params { {8, 4, 0, 0}, {0, 2, 0, CU_DEV_SM_RESOURCE_SPLIT_BACKFILL } }

The difference between a catch-all param group as the last entry and the remainder is in two aspects:

  * The remainder may be NULL / _TYPE_INVALID (if there are no SMs remaining), while a result group must always be valid.

  * The remainder does not have a structure, while the result group will always need to adhere to a structure of coscheduledSmCount (even if its just 2), and therefore must always have enough coscheduled SMs to cover that requirement (even with the `CU_DEV_SM_RESOURCE_SPLIT_BACKFILL` flag enabled).


Splitting an input into N groups, can be accomplished by repeatedly splitting off 1 group and re-splitting the remainder (a bisect operation). However, it's recommended to accomplish this with a single call wherever possible.

CUresult cuDevSmResourceSplitByCount ( CUdevResource* result, unsigned int* nbGroups, const CUdevResource* input, CUdevResource* remainder, unsigned int  flags, unsigned int  minCount )


Splits `CU_DEV_RESOURCE_TYPE_SM` resources.

######  Parameters

`result`
    \- Output array of `CUdevResource` resources. Can be NULL to query the number of groups.
`nbGroups`
    \- This is a pointer, specifying the number of groups that would be or should be created as described below.
`input`
    \- Input SM resource to be split. Must be a valid `CU_DEV_RESOURCE_TYPE_SM` resource.
`remainder`
    \- If the input resource cannot be cleanly split among `nbGroups`, the remainder is placed in here. Can be ommitted (NULL) if the user does not need the remaining set.
`flags`
    \- Flags specifying how these partitions are used or which constraints to abide by when splitting the input. Zero is valid for default behavior.
`minCount`
    \- Minimum number of SMs required

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_RESOURCE_CONFIGURATION

###### Description

Splits `CU_DEV_RESOURCE_TYPE_SM` resources into `nbGroups`, adhering to the minimum SM count specified in `minCount` and the usage flags in `flags`. If `result` is NULL, the API simulates a split and provides the amount of groups that would be created in `nbGroups`. Otherwise, `nbGroups` must point to the amount of elements in `result` and on return, the API will overwrite `nbGroups` with the amount actually created. The groups are written to the array in `result`. `nbGroups` can be less than the total amount if a smaller number of groups is needed.

This API is used to spatially partition the input resource. The input resource needs to come from one of cuDeviceGetDevResource, cuCtxGetDevResource, or cuGreenCtxGetDevResource. A limitation of the API is that the output results cannot be split again without first creating a descriptor and a green context with that descriptor.

When creating the groups, the API will take into account the performance and functional characteristics of the input resource, and guarantee a split that will create a disjoint set of symmetrical partitions. This may lead to fewer groups created than purely dividing the total SM count by the `minCount` due to cluster requirements or alignment and granularity requirements for the minCount. These requirements can be queried with cuDeviceGetDevResource, cuCtxGetDevResource, and cuGreenCtxGetDevResource for CU_DEV_RESOURCE_TYPE_SM, using the `minSmPartitionSize` and `smCoscheduledAlignment` fields to determine minimum partition size and alignment granularity, respectively.

The `remainder` set does not have the same functional or performance guarantees as the groups in `result`. Its use should be carefully planned and future partitions of the `remainder` set are discouraged.

The following flags are supported:

  * `CU_DEV_SM_RESOURCE_SPLIT_IGNORE_SM_COSCHEDULING` : Lower the minimum SM count and alignment, and treat each SM independent of its hierarchy. This allows more fine grained partitions but at the cost of advanced features (such as large clusters on compute capability 9.0+).

  * `CU_DEV_SM_RESOURCE_SPLIT_MAX_POTENTIAL_CLUSTER_SIZE` : Compute Capability 9.0+ only. Attempt to create groups that may allow for maximally sized thread clusters. This can be queried post green context creation using cuOccupancyMaxPotentialClusterSize and launch configuration \(config\), return the maximum cluster size in *clusterSize.").


A successful API call must either have:

  * A valid array of `result` pointers of size passed in `nbGroups`, with `input` of type `CU_DEV_RESOURCE_TYPE_SM`. Value of `minCount` must be between 0 and the SM count specified in `input`. `remainder` may be NULL.

  * NULL passed in for `result`, with a valid integer pointer in `nbGroups` and `input` of type `CU_DEV_RESOURCE_TYPE_SM`. Value of `minCount` must be between 0 and the SM count specified in `input`. `remainder` may be NULL. This queries the number of groups that would be created by the API.


Note: The API is not supported on 32-bit platforms.

CUresult cuDeviceGetDevResource ( CUdevice device, CUdevResource* resource, CUdevResourceType type )


Get device resources.

######  Parameters

`device`
    \- Device to get resource for
`resource`
    \- Output pointer to a CUdevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Get the `type` resources available to the `device`. This may often be the starting point for further partitioning or configuring of resources.

Note: The API is not supported on 32-bit platforms.

CUresult cuGreenCtxCreate ( CUgreenCtx* phCtx, CUdevResourceDesc desc, CUdevice dev, unsigned int  flags )


Creates a green context with a specified set of resources.

######  Parameters

`phCtx`
    \- Pointer for the output handle to the green context
`desc`
    \- Descriptor generated via cuDevResourceGenerateDesc which contains the set of resources to be used
`dev`
    \- Device on which to create the green context.
`flags`
    \- One of the supported green context creation flags. `CU_GREEN_CTX_DEFAULT_STREAM` is required.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

This API creates a green context with the resources specified in the descriptor `desc` and returns it in the handle represented by `phCtx`. This API will retain the primary context on device `dev`, which will is released when the green context is destroyed. It is advised to have the primary context active before calling this API to avoid the heavy cost of triggering primary context initialization and deinitialization multiple times.

The API does not set the green context current. In order to set it current, you need to explicitly set it current by first converting the green context to a CUcontext using cuCtxFromGreenCtx and subsequently calling cuCtxSetCurrent / cuCtxPushCurrent. It should be noted that a green context can be current to only one thread at a time. There is no internal synchronization to make API calls accessing the same green context from multiple threads work.

Note: The API is not supported on 32-bit platforms.

The supported flags are:

  * `CU_GREEN_CTX_DEFAULT_STREAM` : Creates a default stream to use inside the green context. Required.


CUresult cuGreenCtxDestroy ( CUgreenCtx hCtx )


Destroys a green context.

######  Parameters

`hCtx`
    \- Green context to be destroyed

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Destroys the green context, releasing the primary context of the device that this green context was created for. Any resources provisioned for this green context (that were initially available via the resource descriptor) are released as well. The API does not destroy streams created via cuGreenCtxStreamCreate, cuStreamCreate, or cuStreamCreateWithPriority. Users are expected to destroy these streams explicitly using cuStreamDestroy to avoid resource leaks. Once the green context is destroyed, any subsequent API calls involving these streams will return CUDA_ERROR_STREAM_DETACHED with the exception of the following APIs:

  * cuStreamDestroy.


Additionally, the API will invalidate all active captures on these streams.

CUresult cuGreenCtxGetDevResource ( CUgreenCtx hCtx, CUdevResource* resource, CUdevResourceType type )


Get green context resources.

######  Parameters

`hCtx`
    \- Green context to get resource for
`resource`
    \- Output pointer to a CUdevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

CUDA_SUCCESSCUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_VALUE

###### Description

Get the `type` resources available to the green context represented by `hCtx`

CUresult cuGreenCtxGetId ( CUgreenCtx greenCtx, unsigned long long* greenCtxId )


Returns the unique Id associated with the green context supplied.

######  Parameters

`greenCtx`
    \- Green context for which to obtain the Id
`greenCtxId`
    \- Pointer to store the Id of the green context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_CONTEXT_IS_DESTROYED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `greenCtxId` the unique Id which is associated with a given green context. The Id is unique for the life of the program for this instance of CUDA. If green context is supplied as NULL and the current context is set to a green context, the Id of the current green context is returned.

CUresult cuGreenCtxRecordEvent ( CUgreenCtx hCtx, CUevent hEvent )


Records an event.

######  Parameters

`hCtx`
    \- Green context to record event for
`hEvent`
    \- Event to record

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED

###### Description

Captures in `hEvent` all the activities of the green context of `hCtx` at the time of this call. `hEvent` and `hCtx` must be from the same primary context otherwise CUDA_ERROR_INVALID_HANDLE is returned. Calls such as cuEventQuery() or cuGreenCtxWaitEvent() will then examine or wait for completion of the work that was captured. Uses of `hCtx` after this call do not modify `hEvent`.

The API will return CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED if the specified green context `hCtx` has a stream in the capture mode. In such a case, the call will invalidate all the conflicting captures.

CUresult cuGreenCtxStreamCreate ( CUstream* phStream, CUgreenCtx greenCtx, unsigned int  flags, int  priority )


Create a stream for use in the green context.

######  Parameters

`phStream`
    \- Returned newly created stream
`greenCtx`
    \- Green context for which to create the stream for
`flags`
    \- Flags for stream creation. `CU_STREAM_NON_BLOCKING` must be specified.
`priority`
    \- Stream priority. Lower numbers represent higher priorities. See cuCtxGetStreamPriorityRange for more information about meaningful stream priorities that can be passed.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Creates a stream for use in the specified green context `greenCtx` and returns a handle in `phStream`. The stream can be destroyed by calling cuStreamDestroy(). Note that the API ignores the context that is current to the calling thread and creates a stream in the specified green context `greenCtx`.

The supported values for `flags` are:

  * CU_STREAM_NON_BLOCKING: This must be specified. It indicates that work running in the created stream may run concurrently with work in the default stream, and that the created stream should perform no implicit synchronization with the default stream.


Specifying `priority` affects the scheduling priority of work in the stream. Priorities provide a hint to preferentially run work with higher priority when possible, but do not preempt already-running work or provide any other functional guarantee on execution order. `priority` follows a convention where lower numbers represent higher priorities. '0' represents default priority. The range of meaningful numerical priorities can be queried using cuCtxGetStreamPriorityRange. If the specified priority is outside the numerical range returned by cuCtxGetStreamPriorityRange, it will automatically be clamped to the lowest or the highest number in the range.

  *   * In the current implementation, only compute kernels launched in priority streams are affected by the stream's priority. Stream priorities have no effect on host-to-device and device-to-host memory operations.


CUresult cuGreenCtxWaitEvent ( CUgreenCtx hCtx, CUevent hEvent )


Make a green context wait on an event.

######  Parameters

`hCtx`
    \- Green context to wait
`hEvent`
    \- Event to wait on

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED

###### Description

Makes all future work submitted to green context `hCtx` wait for all work captured in `hEvent`. The synchronization will be performed on the device and will not block the calling CPU thread. See cuGreenCtxRecordEvent() or cuEventRecord(), for details on what is captured by an event.

  * `hEvent` may be from a different context or device than `hCtx`.

  * The API will return CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED and invalidate the capture if the specified event `hEvent` is part of an ongoing capture sequence or if the specified green context `hCtx` has a stream in the capture mode.


CUresult cuStreamGetDevResource ( CUstream hStream, CUdevResource* resource, CUdevResourceType type )


Get stream resources.

######  Parameters

`hStream`
    \- Stream to get resource for
`resource`
    \- Output pointer to a CUdevResource structure
`type`
    \- Type of resource to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_RESOURCE_TYPE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Get the `type` resources available to the `hStream` and store them in `resource`.

Note: The API will return CUDA_ERROR_INVALID_RESOURCE_TYPE is `type` is `CU_DEV_RESOURCE_TYPE_WORKQUEUE_CONFIG` or `CU_DEV_RESOURCE_TYPE_WORKQUEUE`.

CUresult cuStreamGetGreenCtx ( CUstream hStream, CUgreenCtx* phCtx )


Query the green context associated with a stream.

######  Parameters

`hStream`
    \- Handle to the stream to be queried
`phCtx`
    \- Returned green context associated with the stream

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE

###### Description

Returns the CUDA green context that the stream is associated with, or NULL if the stream is not associated with any green context.

The stream handle `hStream` can refer to any of the following:

  * a stream created via any of the CUDA driver APIs such as cuStreamCreate, cuStreamCreateWithPriority and cuGreenCtxStreamCreate, or their runtime API equivalents such as cudaStreamCreate, cudaStreamCreateWithFlags and cudaStreamCreateWithPriority. If during stream creation the context that was active in the calling thread was obtained with cuCtxFromGreenCtx, that green context is returned in `phCtx`. Otherwise, `*phCtx` is set to NULL instead.

  * special stream such as the NULL stream or CU_STREAM_LEGACY. In that case if context that is active in the calling thread was obtained with cuCtxFromGreenCtx, that green context is returned. Otherwise, `*phCtx` is set to NULL instead.


Passing an invalid handle will result in undefined behavior.


