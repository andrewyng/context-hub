---
name: driver-ctx
description: '**Source:** group__CUDA__CTX.html#group__CUDA__CTX'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.8. Context Management

**Source:** group__CUDA__CTX.html#group__CUDA__CTX


### Functions

CUresult cuCtxCreate ( CUcontext* pctx, CUctxCreateParams* ctxCreateParams, unsigned int  flags, CUdevice dev )


Create a CUDA context.

######  Parameters

`pctx`
    \- Returned context handle of the new context
`ctxCreateParams`
    \- Context creation parameters
`flags`
    \- Context creation flags
`dev`
    \- Device to create context on

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_UNKNOWN

###### Description

Creates a new CUDA context and associates it with the calling thread. The `flags` parameter is described below. The context is created with a usage count of 1 and the caller of cuCtxCreate() must call cuCtxDestroy() when done using the context. If a context is already current to the thread, it is supplanted by the newly created context and may be restored by a subsequent call to cuCtxPopCurrent().

CUDA context can be created with execution affinity. The type and the amount of execution resource the context can use is limited by `paramsArray` and `numExecAffinityParams` in `execAffinity`. The `paramsArray` is an array of `CUexecAffinityParam` and the `numExecAffinityParams` describes the size of the paramsArray. If two `CUexecAffinityParam` in the array have the same type, the latter execution affinity parameter overrides the former execution affinity parameter. The supported execution affinity types are:

  * CU_EXEC_AFFINITY_TYPE_SM_COUNT limits the portion of SMs that the context can use. The portion of SMs is specified as the number of SMs via `CUexecAffinitySmCount`. This limit will be internally rounded up to the next hardware-supported amount. Hence, it is imperative to query the actual execution affinity of the context via `cuCtxGetExecAffinity` after context creation. Currently, this attribute is only supported under Volta+ MPS.


CUDA context can be created in CIG(CUDA in Graphics) mode by setting `cigParams`. Data from graphics client is shared with CUDA via the `sharedData` in `cigParams`. Support for D3D12 graphics client can be determined using cuDeviceGetAttribute() with CU_DEVICE_ATTRIBUTE_D3D12_CIG_SUPPORTED. `sharedData` is a ID3D12CommandQueue handle. Support for Vulkan graphics client can be determined using cuDeviceGetAttribute() with CU_DEVICE_ATTRIBUTE_VULKAN_CIG_SUPPORTED. `sharedData` is a Nvidia specific data blob populated by calling vkGetExternalComputeQueueDataNV(). Either `execAffinityParams` or `cigParams` can be set to a non-null value. Setting both to a non-null value will result in an undefined behavior.

The three LSBs of the `flags` parameter can be used to control how the OS thread, which owns the CUDA context at the time of an API call, interacts with the OS scheduler when waiting for results from the GPU. Only one of the scheduling flags can be set when creating a context.

  * CU_CTX_SCHED_SPIN: Instruct CUDA to actively spin when waiting for results from the GPU. This can decrease latency when waiting for the GPU, but may lower the performance of CPU threads if they are performing work in parallel with the CUDA thread.


  * CU_CTX_SCHED_YIELD: Instruct CUDA to yield its thread when waiting for results from the GPU. This can increase latency when waiting for the GPU, but can increase the performance of CPU threads performing work in parallel with the GPU.


  * CU_CTX_SCHED_BLOCKING_SYNC: Instruct CUDA to block the CPU thread on a synchronization primitive when waiting for the GPU to finish work.


  * CU_CTX_BLOCKING_SYNC: Instruct CUDA to block the CPU thread on a synchronization primitive when waiting for the GPU to finish work.

**Deprecated:** This flag was deprecated as of CUDA 4.0 and was replaced with CU_CTX_SCHED_BLOCKING_SYNC.


  * CU_CTX_SCHED_AUTO: The default value if the `flags` parameter is zero, uses a heuristic based on the number of active CUDA contexts in the process C and the number of logical processors in the system P. If C > P, then CUDA will yield to other OS threads when waiting for the GPU (CU_CTX_SCHED_YIELD), otherwise CUDA will not yield while waiting for results and actively spin on the processor (CU_CTX_SCHED_SPIN). Additionally, on Tegra devices, CU_CTX_SCHED_AUTO uses a heuristic based on the power profile of the platform and may choose CU_CTX_SCHED_BLOCKING_SYNC for low-powered devices.


  * CU_CTX_MAP_HOST: Instruct CUDA to support mapped pinned allocations. This flag must be set in order to allocate pinned host memory that is accessible to the GPU.


  * CU_CTX_LMEM_RESIZE_TO_MAX: Instruct CUDA to not reduce local memory after resizing local memory for a kernel. This can prevent thrashing by local memory allocations when launching many kernels with high local memory usage at the cost of potentially increased memory usage.

**Deprecated:** This flag is deprecated and the behavior enabled by this flag is now the default and cannot be disabled. Instead, the per-thread stack size can be controlled with cuCtxSetLimit().


  * CU_CTX_COREDUMP_ENABLE: If GPU coredumps have not been enabled globally with cuCoredumpSetAttributeGlobal or environment variables, this flag can be set during context creation to instruct CUDA to create a coredump if this context raises an exception during execution. These environment variables are described in the CUDA-GDB user guide under the "GPU core dump support" section. The initial attributes will be taken from the global attributes at the time of context creation. The other attributes that control coredump output can be modified by calling cuCoredumpSetAttribute from the created context after it becomes current. This flag is not supported when CUDA context is created in CIG(CUDA in Graphics) mode.


  * CU_CTX_USER_COREDUMP_ENABLE: If user-triggered GPU coredumps have not been enabled globally with cuCoredumpSetAttributeGlobal or environment variables, this flag can be set during context creation to instruct CUDA to create a coredump if data is written to a certain pipe that is present in the OS space. These environment variables are described in the CUDA-GDB user guide under the "GPU core dump support" section. It is important to note that the pipe name *must* be set with cuCoredumpSetAttributeGlobal before creating the context if this flag is used. Setting this flag implies that CU_CTX_COREDUMP_ENABLE is set. The initial attributes will be taken from the global attributes at the time of context creation. The other attributes that control coredump output can be modified by calling cuCoredumpSetAttribute from the created context after it becomes current. Setting this flag on any context creation is equivalent to setting the CU_COREDUMP_ENABLE_USER_TRIGGER attribute to `true` globally. This flag is not supported when CUDA context is created in CIG(CUDA in Graphics) mode.


  * CU_CTX_SYNC_MEMOPS: Ensures that synchronous memory operations initiated on this context will always synchronize. See further documentation in the section titled "API Synchronization behavior" to learn more about cases when synchronous memory operations can exhibit asynchronous behavior.


Context creation will fail with CUDA_ERROR_UNKNOWN if the compute mode of the device is CU_COMPUTEMODE_PROHIBITED. The function cuDeviceGetAttribute() can be used with CU_DEVICE_ATTRIBUTE_COMPUTE_MODE to determine the compute mode of the device. The nvidia-smi tool can be used to set the compute mode for * devices. Documentation for nvidia-smi can be obtained by passing a -h option to it.

Context creation will fail with :: CUDA_ERROR_INVALID_VALUE if invalid parameter was passed by client to create the CUDA context.

Context creation in CIG mode will fail with CUDA_ERROR_NOT_SUPPORTED if CIG is not supported by the device or the driver.

CUresult cuCtxDestroy ( CUcontext ctx )


Destroy a CUDA context.

######  Parameters

`ctx`
    \- Context to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Destroys the CUDA context specified by `ctx`. The context `ctx` will be destroyed regardless of how many threads it is current to. It is the responsibility of the calling function to ensure that no API call issues using `ctx` while cuCtxDestroy() is executing.

Destroys and cleans up all resources associated with the context. It is the caller's responsibility to ensure that the context or its resources are not accessed or passed in subsequent API calls and doing so will result in undefined behavior. These resources include CUDA types CUmodule, CUfunction, CUstream, CUevent, CUarray, CUmipmappedArray, CUtexObject, CUsurfObject, CUtexref, CUsurfref, CUgraphicsResource, CUlinkState, CUexternalMemory and CUexternalSemaphore. These resources also include memory allocations by cuMemAlloc(), cuMemAllocHost(), cuMemAllocManaged() and cuMemAllocPitch().

If `ctx` is current to the calling thread then `ctx` will also be popped from the current thread's context stack (as though cuCtxPopCurrent() were called). If `ctx` is current to other threads, then `ctx` will remain current to those threads, and attempting to access `ctx` from those threads will result in the error CUDA_ERROR_CONTEXT_IS_DESTROYED.

cuCtxDestroy() will not destroy memory allocations by cuMemCreate(), cuMemAllocAsync() and cuMemAllocFromPoolAsync(). These memory allocations are not associated with any CUDA context and need to be destroyed explicitly.

CUresult cuCtxGetApiVersion ( CUcontext ctx, unsigned int* version )


Gets the context's API version.

######  Parameters

`ctx`
    \- Context to check
`version`
    \- Pointer to version

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

Returns a version number in `version` corresponding to the capabilities of the context (e.g. 3010 or 3020), which library developers can use to direct callers to a specific API version. If `ctx` is NULL, returns the API version used to create the currently bound context.

Note that new API versions are only introduced when context capabilities are changed that break binary compatibility, so the API version and driver version may be different. For example, it is valid for the API version to be 3020 while the driver version is 4020.

CUresult cuCtxGetCacheConfig ( CUfunc_cache* pconfig )


Returns the preferred cache configuration for the current context.

######  Parameters

`pconfig`
    \- Returned cache configuration

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

On devices where the L1 cache and shared memory use the same hardware resources, this function returns through `pconfig` the preferred cache configuration for the current context. This is only a preference. The driver will use the requested configuration if possible, but it is free to choose a different configuration if required to execute functions.

This will return a `pconfig` of CU_FUNC_CACHE_PREFER_NONE on devices where the size of the L1 cache and shared memory are fixed.

The supported cache configurations are:

  * CU_FUNC_CACHE_PREFER_NONE: no preference for shared memory or L1 (default)

  * CU_FUNC_CACHE_PREFER_SHARED: prefer larger shared memory and smaller L1 cache

  * CU_FUNC_CACHE_PREFER_L1: prefer larger L1 cache and smaller shared memory

  * CU_FUNC_CACHE_PREFER_EQUAL: prefer equal sized L1 cache and shared memory


CUresult cuCtxGetCurrent ( CUcontext* pctx )


Returns the CUDA context bound to the calling CPU thread.

######  Parameters

`pctx`
    \- Returned context handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED

###### Description

Returns in `*pctx` the CUDA context bound to the calling CPU thread. If no context is bound to the calling CPU thread then `*pctx` is set to NULL and CUDA_SUCCESS is returned.

CUresult cuCtxGetDevice ( CUdevice* device )


Returns the device handle for the current context.

######  Parameters

`device`
    \- Returned device handle for the current context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*device` the handle of the current context's device.

CUresult cuCtxGetDevice_v2 ( CUdevice* device, CUcontext ctx )


Returns the device handle for the specified context.

######  Parameters

`device`
    \- Returned device handle for the specified context
`ctx`
    \- Context for which to obtain the device

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*device` the handle of the specified context's device. If the specified context is NULL, the API will return the current context's device.

CUresult cuCtxGetExecAffinity ( CUexecAffinityParam* pExecAffinity, CUexecAffinityType type )


Returns the execution affinity setting for the current context.

######  Parameters

`pExecAffinity`
    \- Returned execution affinity
`type`
    \- Execution affinity type to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNSUPPORTED_EXEC_AFFINITY

###### Description

Returns in `*pExecAffinity` the current value of `type`. The supported CUexecAffinityType values are:

  * CU_EXEC_AFFINITY_TYPE_SM_COUNT: number of SMs the context is limited to use.


CUresult cuCtxGetFlags ( unsigned int* flags )


Returns the flags for the current context.

######  Parameters

`flags`
    \- Pointer to store flags of current context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*flags` the flags of the current context. See cuCtxCreate for flag values.

CUresult cuCtxGetId ( CUcontext ctx, unsigned long long* ctxId )


Returns the unique Id associated with the context supplied.

######  Parameters

`ctx`
    \- Context for which to obtain the Id
`ctxId`
    \- Pointer to store the Id of the context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_CONTEXT_IS_DESTROYED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `ctxId` the unique Id which is associated with a given context. The Id is unique for the life of the program for this instance of CUDA. If context is supplied as NULL and there is one current, the Id of the current context is returned.

CUresult cuCtxGetLimit ( size_t* pvalue, CUlimit limit )


Returns resource limits.

######  Parameters

`pvalue`
    \- Returned size of limit
`limit`
    \- Limit to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNSUPPORTED_LIMIT

###### Description

Returns in `*pvalue` the current size of `limit`. The supported CUlimit values are:

  * CU_LIMIT_STACK_SIZE: stack size in bytes of each GPU thread.

  * CU_LIMIT_PRINTF_FIFO_SIZE: size in bytes of the FIFO used by the printf() device system call.

  * CU_LIMIT_MALLOC_HEAP_SIZE: size in bytes of the heap used by the malloc() and free() device system calls.

  * CU_LIMIT_DEV_RUNTIME_SYNC_DEPTH: maximum grid depth at which a thread can issue the device runtime call cudaDeviceSynchronize() to wait on child grid launches to complete.

  * CU_LIMIT_DEV_RUNTIME_PENDING_LAUNCH_COUNT: maximum number of outstanding device runtime launches that can be made from this context.

  * CU_LIMIT_MAX_L2_FETCH_GRANULARITY: L2 cache fetch granularity.

  * CU_LIMIT_PERSISTING_L2_CACHE_SIZE: Persisting L2 cache size in bytes


CUresult cuCtxGetStreamPriorityRange ( int* leastPriority, int* greatestPriority )


Returns numerical values that correspond to the least and greatest stream priorities.

######  Parameters

`leastPriority`
    \- Pointer to an int in which the numerical value for least stream priority is returned
`greatestPriority`
    \- Pointer to an int in which the numerical value for greatest stream priority is returned

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*leastPriority` and `*greatestPriority` the numerical values that correspond to the least and greatest stream priorities respectively. Stream priorities follow a convention where lower numbers imply greater priorities. The range of meaningful stream priorities is given by [`*greatestPriority`, `*leastPriority`]. If the user attempts to create a stream with a priority value that is outside the meaningful range as specified by this API, the priority is automatically clamped down or up to either `*leastPriority` or `*greatestPriority` respectively. See cuStreamCreateWithPriority for details on creating a priority stream. A NULL may be passed in for `*leastPriority` or `*greatestPriority` if the value is not desired.

This function will return '0' in both `*leastPriority` and `*greatestPriority` if the current context's device does not support stream priorities (see cuDeviceGetAttribute).

CUresult cuCtxPopCurrent ( CUcontext* pctx )


Pops the current CUDA context from the current CPU thread.

######  Parameters

`pctx`
    \- Returned popped context handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT

###### Description

Pops the current CUDA context from the CPU thread and passes back the old context handle in `*pctx`. That context may then be made current to a different CPU thread by calling cuCtxPushCurrent().

If a context was current to the CPU thread before cuCtxCreate() or cuCtxPushCurrent() was called, this function makes that context current to the CPU thread again.

CUresult cuCtxPushCurrent ( CUcontext ctx )


Pushes a context on the current CPU thread.

######  Parameters

`ctx`
    \- Context to push

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Pushes the given context `ctx` onto the CPU thread's stack of current contexts. The specified context becomes the CPU thread's current context, so all CUDA functions that operate on the current context are affected.

The previous current context may be made current again by calling cuCtxDestroy() or cuCtxPopCurrent().

CUresult cuCtxRecordEvent ( CUcontext hCtx, CUevent hEvent )


Records an event.

######  Parameters

`hCtx`
    \- Context to record event for
`hEvent`
    \- Event to record

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED

###### Description

Captures in `hEvent` all the activities of the context `hCtx` at the time of this call. `hEvent` and `hCtx` must be from the same CUDA context, otherwise CUDA_ERROR_INVALID_HANDLE will be returned. Calls such as cuEventQuery() or cuCtxWaitEvent() will then examine or wait for completion of the work that was captured. Uses of `hCtx` after this call do not modify `hEvent`. If the context passed to `hCtx` is the primary context, `hEvent` will capture all the activities of the primary context and its green contexts. If the context passed to `hCtx` is a context converted from green context via cuCtxFromGreenCtx(), `hEvent` will capture only the activities of the green context.

The API will return CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED if the specified context `hCtx` has a stream in the capture mode. In such a case, the call will invalidate all the conflicting captures.

CUresult cuCtxResetPersistingL2Cache ( void )


Resets all persisting lines in cache to normal status.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_SUPPORTED

###### Description

cuCtxResetPersistingL2Cache Resets all persisting lines in cache to normal status. Takes effect on function return.

CUresult cuCtxSetCacheConfig ( CUfunc_cache config )


Sets the preferred cache configuration for the current context.

######  Parameters

`config`
    \- Requested cache configuration

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

On devices where the L1 cache and shared memory use the same hardware resources, this sets through `config` the preferred cache configuration for the current context. This is only a preference. The driver will use the requested configuration if possible, but it is free to choose a different configuration if required to execute the function. Any function preference set via cuFuncSetCacheConfig() or cuKernelSetCacheConfig() will be preferred over this context-wide setting. Setting the context-wide cache configuration to CU_FUNC_CACHE_PREFER_NONE will cause subsequent kernel launches to prefer to not change the cache configuration unless required to launch the kernel.

This setting does nothing on devices where the size of the L1 cache and shared memory are fixed.

Launching a kernel with a different preference than the most recent preference setting may insert a device-side synchronization point.

The supported cache configurations are:

  * CU_FUNC_CACHE_PREFER_NONE: no preference for shared memory or L1 (default)

  * CU_FUNC_CACHE_PREFER_SHARED: prefer larger shared memory and smaller L1 cache

  * CU_FUNC_CACHE_PREFER_L1: prefer larger L1 cache and smaller shared memory

  * CU_FUNC_CACHE_PREFER_EQUAL: prefer equal sized L1 cache and shared memory


CUresult cuCtxSetCurrent ( CUcontext ctx )


Binds the specified CUDA context to the calling CPU thread.

######  Parameters

`ctx`
    \- Context to bind to the calling CPU thread

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT

###### Description

Binds the specified CUDA context to the calling CPU thread. If `ctx` is NULL then the CUDA context previously bound to the calling CPU thread is unbound and CUDA_SUCCESS is returned.

If there exists a CUDA context stack on the calling CPU thread, this will replace the top of that stack with `ctx`. If `ctx` is NULL then this will be equivalent to popping the top of the calling CPU thread's CUDA context stack (or a no-op if the calling CPU thread's CUDA context stack is empty).

CUresult cuCtxSetFlags ( unsigned int  flags )


Sets the flags for the current context.

######  Parameters

`flags`
    \- Flags to set on the current context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the flags for the current context overwriting previously set ones. See cuDevicePrimaryCtxSetFlags for flag values.

CUresult cuCtxSetLimit ( CUlimit limit, size_t value )


Set resource limits.

######  Parameters

`limit`
    \- Limit to set
`value`
    \- Size of limit

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNSUPPORTED_LIMIT, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_INVALID_CONTEXT

###### Description

Setting `limit` to `value` is a request by the application to update the current limit maintained by the context. The driver is free to modify the requested value to meet h/w requirements (this could be clamping to minimum or maximum values, rounding up to nearest element size, etc). The application can use cuCtxGetLimit() to find out exactly what the limit has been set to.

Setting each CUlimit has its own specific restrictions, so each is discussed here.

  * CU_LIMIT_STACK_SIZE controls the stack size in bytes of each GPU thread. The driver automatically increases the per-thread stack size for each kernel launch as needed. This size isn't reset back to the original value after each launch. Setting this value will take effect immediately, and if necessary, the device will block until all preceding requested tasks are complete.


  * CU_LIMIT_PRINTF_FIFO_SIZE controls the size in bytes of the FIFO used by the printf() device system call. Setting CU_LIMIT_PRINTF_FIFO_SIZE must be performed before launching any kernel that uses the printf() device system call, otherwise CUDA_ERROR_INVALID_VALUE will be returned.


  * CU_LIMIT_MALLOC_HEAP_SIZE controls the size in bytes of the heap used by the malloc() and free() device system calls. Setting CU_LIMIT_MALLOC_HEAP_SIZE must be performed before launching any kernel that uses the malloc() or free() device system calls, otherwise CUDA_ERROR_INVALID_VALUE will be returned.


  * CU_LIMIT_DEV_RUNTIME_SYNC_DEPTH controls the maximum nesting depth of a grid at which a thread can safely call cudaDeviceSynchronize(). Setting this limit must be performed before any launch of a kernel that uses the device runtime and calls cudaDeviceSynchronize() above the default sync depth, two levels of grids. Calls to cudaDeviceSynchronize() will fail with error code cudaErrorSyncDepthExceeded if the limitation is violated. This limit can be set smaller than the default or up the maximum launch depth of 24. When setting this limit, keep in mind that additional levels of sync depth require the driver to reserve large amounts of device memory which can no longer be used for user allocations. If these reservations of device memory fail, cuCtxSetLimit() will return CUDA_ERROR_OUT_OF_MEMORY, and the limit can be reset to a lower value. This limit is only applicable to devices of compute capability < 9.0. Attempting to set this limit on devices of other compute capability versions will result in the error CUDA_ERROR_UNSUPPORTED_LIMIT being returned.


  * CU_LIMIT_DEV_RUNTIME_PENDING_LAUNCH_COUNT controls the maximum number of outstanding device runtime launches that can be made from the current context. A grid is outstanding from the point of launch up until the grid is known to have been completed. Device runtime launches which violate this limitation fail and return cudaErrorLaunchPendingCountExceeded when cudaGetLastError() is called after launch. If more pending launches than the default (2048 launches) are needed for a module using the device runtime, this limit can be increased. Keep in mind that being able to sustain additional pending launches will require the driver to reserve larger amounts of device memory upfront which can no longer be used for allocations. If these reservations fail, cuCtxSetLimit() will return CUDA_ERROR_OUT_OF_MEMORY, and the limit can be reset to a lower value. This limit is only applicable to devices of compute capability 3.5 and higher. Attempting to set this limit on devices of compute capability less than 3.5 will result in the error CUDA_ERROR_UNSUPPORTED_LIMIT being returned.


  * CU_LIMIT_MAX_L2_FETCH_GRANULARITY controls the L2 cache fetch granularity. Values can range from 0B to 128B. This is purely a performance hint and it can be ignored or clamped depending on the platform.


  * CU_LIMIT_PERSISTING_L2_CACHE_SIZE controls size in bytes available for persisting L2 cache. This is purely a performance hint and it can be ignored or clamped depending on the platform.


CUresult cuCtxSynchronize ( void )


Block for the current context's tasks to complete.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED

###### Description

Blocks until the current context has completed all preceding requested tasks. If the current context is the primary context, green contexts that have been created will also be synchronized. cuCtxSynchronize() returns an error if one of the preceding tasks failed. If the context was created with the CU_CTX_SCHED_BLOCKING_SYNC flag, the CPU thread will block until the GPU context has finished its work.

CUresult cuCtxSynchronize_v2 ( CUcontext ctx )


Block for the specified context's tasks to complete.

######  Parameters

`ctx`
    \- Context to synchronize

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED

###### Description

Blocks until the specified context has completed all preceding requested tasks. If the specified context is the primary context, green contexts that have been created will also be synchronized. The API returns an error if one of the preceding tasks failed.

If the context was created with the CU_CTX_SCHED_BLOCKING_SYNC flag, the CPU thread will block until the GPU context has finished its work.

If the specified context is NULL, the API will operate on the current context.

CUresult cuCtxWaitEvent ( CUcontext hCtx, CUevent hEvent )


Make a context wait on an event.

######  Parameters

`hCtx`
    \- Context to wait
`hEvent`
    \- Event to wait on

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED

###### Description

Makes all future work submitted to context `hCtx` wait for all work captured in `hEvent`. The synchronization will be performed on the device and will not block the calling CPU thread. See cuCtxRecordEvent() for details on what is captured by an event. If the context passed to `hCtx` is the primary context, the primary context and its green contexts will wait for `hEvent`. If the context passed to `hCtx` is a context converted from green context via cuCtxFromGreenCtx(), the green context will wait for `hEvent`.

  * `hEvent` may be from a different context or device than `hCtx`.

  * The API will return CUDA_ERROR_STREAM_CAPTURE_UNSUPPORTED and invalidate the capture if the specified event `hEvent` is part of an ongoing capture sequence or if the specified context `hCtx` has a stream in the capture mode.

