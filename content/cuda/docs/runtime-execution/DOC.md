---
name: runtime-execution
description: '**Source:** group__CUDART__EXECUTION.html#group__CUDART__EXECUTION'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.7. Execution Control

**Source:** group__CUDART__EXECUTION.html#group__CUDART__EXECUTION


### Functions

__host__  __device__ cudaError_t cudaFuncGetAttributes ( cudaFuncAttributes* attr, const void* func )


Find out attributes for a given function.

######  Parameters

`attr`
    \- Return pointer to function's attributes
`func`
    \- Device function symbol

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction

###### Description

This function obtains the attributes of a function specified via `func`. `func` is a device function symbol and must be declared as a `__global__` function. The fetched attributes are placed in `attr`. If the specified function does not exist, then it is assumed to be a cudaKernel_t and used as is. For templated functions, pass the function symbol as follows: func_name<template_arg_0,...,template_arg_N>

Note that some function attributes such as maxThreadsPerBlock may vary based on the device that is currently being used.

  *   * Use of a string naming a function as the `func` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaFuncSetCacheConfig ( C API), cudaFuncGetAttributes ( C++ API), cudaLaunchKernel ( C API), cuFuncGetAttribute

__host__ cudaError_t cudaFuncGetName ( const char** name, const void* func )


Returns the function name for a device entry function pointer.

######  Parameters

`name`
    \- The returned name of the function
`func`
    \- The function pointer to retrieve name for

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDeviceFunction

###### Description

Returns in `**name` the function name associated with the symbol `func` . The function name is returned as a null-terminated string. This API may return a mangled name if the function is not declared as having C linkage. If `**name` is NULL, cudaErrorInvalidValue is returned. If `func` is not a device entry function, then it is assumed to be a cudaKernel_t and used as is.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


cudaFuncGetName (C++ API)

__host__ cudaError_t cudaFuncGetParamInfo ( const void* func, size_t paramIndex, size_t* paramOffset, size_t* paramSize )


Returns the offset and size of a kernel parameter in the device-side parameter layout.

######  Parameters

`func`
    \- The function to query
`paramIndex`
    \- The parameter index to query
`paramOffset`
    \- The offset into the device-side parameter layout at which the parameter resides
`paramSize`
    \- The size of the parameter in the device-side parameter layout

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Queries the kernel parameter at `paramIndex` in `func's` list of parameters and returns parameter information via `paramOffset` and `paramSize`. `paramOffset` returns the offset of the parameter in the device-side parameter layout. `paramSize` returns the size in bytes of the parameter. This information can be used to update kernel node parameters from the device via cudaGraphKernelNodeSetParam() and cudaGraphKernelNodeUpdatesApply(). `paramIndex` must be less than the number of parameters that `func` takes.

  *   * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


__host__ cudaError_t cudaFuncSetAttribute ( const void* func, cudaFuncAttribute attr, int  value )


Set attributes for a given function.

######  Parameters

`func`
    \- Function to get attributes of
`attr`
    \- Attribute to set
`value`
    \- Value to set

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue

###### Description

This function sets the attributes of a function specified via `func`. The parameter `func` must be a pointer to a function that executes on the device. The parameter specified by `func` must be declared as a `__global__` function. The enumeration defined by `attr` is set to the value defined by `value`. If the specified function does not exist, then it is assumed to be a cudaKernel_t and used as is. If the specified attribute cannot be written, or if the value is incorrect, then cudaErrorInvalidValue is returned.

Valid values for `attr` are:

  * cudaFuncAttributeMaxDynamicSharedMemorySize \- The requested maximum size in bytes of dynamically-allocated shared memory. The sum of this value and the function attribute sharedSizeBytes cannot exceed the device attribute cudaDevAttrMaxSharedMemoryPerBlockOptin. The maximal size of requestable dynamic shared memory may differ by GPU architecture.

  * cudaFuncAttributePreferredSharedMemoryCarveout \- On devices where the L1 cache and shared memory use the same hardware resources, this sets the shared memory carveout preference, in percent of the total shared memory. See cudaDevAttrMaxSharedMemoryPerMultiprocessor. This is only a hint, and the driver can choose a different ratio if required to execute the function.

  * cudaFuncAttributeRequiredClusterWidth: The required cluster width in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return cudaErrorNotPermitted.

  * cudaFuncAttributeRequiredClusterHeight: The required cluster height in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return cudaErrorNotPermitted.

  * cudaFuncAttributeRequiredClusterDepth: The required cluster depth in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return cudaErrorNotPermitted.

  * cudaFuncAttributeNonPortableClusterSizeAllowed: Indicates whether the function can be launched with non-portable cluster size. 1 is allowed, 0 is disallowed.

  * cudaFuncAttributeClusterSchedulingPolicyPreference: The block scheduling policy of a function. The value type is cudaClusterSchedulingPolicy.


  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


cudaLaunchKernel (C++ API), cudaFuncSetCacheConfig ( C++ API), cudaFuncGetAttributes ( C API)

__host__ cudaError_t cudaFuncSetCacheConfig ( const void* func, cudaFuncCache cacheConfig )


Sets the preferred cache configuration for a device function.

######  Parameters

`func`
    \- Device function symbol
`cacheConfig`
    \- Requested cache configuration

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction

###### Description

On devices where the L1 cache and shared memory use the same hardware resources, this sets through `cacheConfig` the preferred cache configuration for the function specified via `func`. This is only a preference. The runtime will use the requested configuration if possible, but it is free to choose a different configuration if required to execute `func`.

`func` is a device function symbol and must be declared as a `__global__` function. If the specified function does not exist, then cudaErrorInvalidDeviceFunction is returned. For templated functions, pass the function symbol as follows: func_name<template_arg_0,...,template_arg_N>

This setting does nothing on devices where the size of the L1 cache and shared memory are fixed.

Launching a kernel with a different preference than the most recent preference setting may insert a device-side synchronization point.

The supported cache configurations are:

  * cudaFuncCachePreferNone: no preference for shared memory or L1 (default)

  * cudaFuncCachePreferShared: prefer larger shared memory and smaller L1 cache

  * cudaFuncCachePreferL1: prefer larger L1 cache and smaller shared memory

  * cudaFuncCachePreferEqual: prefer equal size L1 cache and shared memory


  *   * Use of a string naming a function as the `func` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * This API does not accept a cudaKernel_t casted as void*. If cache config modification is required for a cudaKernel_t (or a __global__ function), it can be replaced with a call to cudaFuncSetAttributes with the attribute cudaFuncAttributePreferredSharedMemoryCarveout to specify a more granular L1 cache and shared memory split configuration.


**See also:**

cudaFuncSetCacheConfig ( C++ API), cudaFuncGetAttributes ( C API), cudaLaunchKernel ( C API), cuFuncSetCacheConfig

__device__  void* cudaGetParameterBuffer ( size_t alignment, size_t size )


Obtains a parameter buffer.

######  Parameters

`alignment`
    \- Specifies alignment requirement of the parameter buffer
`size`
    \- Specifies size requirement in bytes

###### Returns

Returns pointer to the allocated parameterBuffer

###### Description

Obtains a parameter buffer which can be filled with parameters for a kernel launch. Parameters passed to cudaLaunchDevice must be allocated via this function.

This is a low level API and can only be accessed from Parallel Thread Execution (PTX). CUDA user code should use <<< >>> to launch kernels.

**See also:**

cudaLaunchDevice

__device__  void cudaGridDependencySynchronize ( void ) [inline]


Programmatic grid dependency synchronization.

###### Description

This device function will block the thread until all direct grid dependencies have completed. This API is intended to use in conjuncture with programmatic / launch event / dependency. See cudaLaunchAttributeID::cudaLaunchAttributeProgrammaticStreamSerialization and cudaLaunchAttributeID::cudaLaunchAttributeProgrammaticEvent for more information.

__host__ cudaError_t cudaLaunchCooperativeKernel ( const void* func, dim3 gridDim, dim3 blockDim, void** args, size_t sharedMem, cudaStream_t stream )


Launches a device function where thread blocks can cooperate and synchronize as they execute.

######  Parameters

`func`
    \- Device function symbol
`gridDim`
    \- Grid dimentions
`blockDim`
    \- Block dimentions
`args`
    \- Arguments
`sharedMem`
    \- Shared memory
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidConfiguration, cudaErrorLaunchFailure, cudaErrorLaunchTimeout, cudaErrorLaunchOutOfResources, cudaErrorCooperativeLaunchTooLarge, cudaErrorSharedObjectInitFailed

###### Description

The function invokes kernel `func` on `gridDim` (`gridDim.x``gridDim.y``gridDim.z`) grid of blocks. Each block contains `blockDim` (`blockDim.x``blockDim.y``blockDim.z`) threads.

The device on which this kernel is invoked must have a non-zero value for the device attribute cudaDevAttrCooperativeLaunch.

The total number of blocks launched cannot exceed the maximum number of blocks per multiprocessor as returned by cudaOccupancyMaxActiveBlocksPerMultiprocessor (or cudaOccupancyMaxActiveBlocksPerMultiprocessorWithFlags) times the number of multiprocessors as specified by the device attribute cudaDevAttrMultiProcessorCount.

The kernel cannot make use of CUDA dynamic parallelism.

If the kernel has N parameters the `args` should point to array of N pointers. Each pointer, from `args[0]` to `args[N - 1]`, point to the region of memory from which the actual parameter will be copied.

For templated functions, pass the function symbol as follows: func_name<template_arg_0,...,template_arg_N>

`sharedMem` sets the amount of dynamic shared memory that will be available to each thread block.

`stream` specifies a stream the invocation is associated to.

  * This function uses standard default stream semantics.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaLaunchCooperativeKernel (C++ API), cuLaunchCooperativeKernel

__device__ cudaError_t cudaLaunchDevice ( void* func, void* parameterBuffer, dim3 gridDimension, dim3 blockDimension, unsigned int  sharedMemSize, cudaStream_t stream )


Launches a specified kernel.

######  Parameters

`func`
    \- Pointer to the kernel to be launched
`parameterBuffer`
    \- Holds the parameters to the launched kernel. parameterBuffer can be NULL. (Optional)
`gridDimension`
    \- Specifies grid dimensions
`blockDimension`
    \- Specifies block dimensions
`sharedMemSize`
    \- Specifies size of shared memory
`stream`
    \- Specifies the stream to be used

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorLaunchMaxDepthExceeded, cudaErrorInvalidConfiguration, cudaErrorStartupFailure, cudaErrorLaunchPendingCountExceeded, cudaErrorLaunchOutOfResources

###### Description

Launches a specified kernel with the specified parameter buffer. A parameter buffer can be obtained by calling cudaGetParameterBuffer().

This is a low level API and can only be accessed from Parallel Thread Execution (PTX). CUDA user code should use <<< >>> to launch the kernels.

Please refer to Execution Configuration and Parameter Buffer Layout from the CUDA Programming Guide for the detailed descriptions of launch configuration and parameter layout respectively.

**See also:**

cudaGetParameterBuffer

__host__ cudaError_t cudaLaunchHostFunc ( cudaStream_t stream, cudaHostFn_t fn, void* userData )


Enqueues a host function call in a stream.

######  Parameters

`stream`

`fn`
    \- The function to call once preceding stream operations are complete
`userData`
    \- User-specified data to be passed to the function

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorInvalidValue, cudaErrorNotSupported

###### Description

Enqueues a host function to run in a stream. The function will be called after currently enqueued work and will block work added after it.

The host function must not make any CUDA API calls. Attempting to use a CUDA API may result in cudaErrorNotPermitted, but this is not required. The host function must not perform any synchronization that may depend on outstanding CUDA work not mandated to run earlier. Host functions without a mandated order (such as in independent streams) execute in undefined order and may be serialized.

For the purposes of Unified Memory, execution makes a number of guarantees:

  * The stream is considered idle for the duration of the function's execution. Thus, for example, the function may always use memory attached to the stream it was enqueued in.

  * The start of execution of the function has the same effect as synchronizing an event recorded in the same stream immediately prior to the function. It thus synchronizes streams which have been "joined" prior to the function.

  * Adding device work to any stream does not have the effect of making the stream active until all preceding host functions and stream callbacks have executed. Thus, for example, a function might use global attached memory even if work has been added to another stream, if the work has been ordered behind the function call with an event.

  * Completion of the function does not cause a stream to become active except as described above. The stream will remain idle if no device work follows the function, and will remain idle across consecutive host functions or stream callbacks without device work in between. Thus, for example, stream synchronization can be done by signaling from a host function at the end of the stream.


Note that, in constrast to cuStreamAddCallback, the function will not be called in the event of an error in the CUDA context.

  * This function uses standard default stream semantics.


**See also:**

cudaStreamCreate, cudaStreamQuery, cudaStreamSynchronize, cudaStreamWaitEvent, cudaStreamDestroy, cudaMallocManaged, cudaStreamAttachMemAsync, cudaStreamAddCallback, cuLaunchHostFunc

__host__ cudaError_t cudaLaunchKernel ( const void* func, dim3 gridDim, dim3 blockDim, void** args, size_t sharedMem, cudaStream_t stream )


Launches a device function.

######  Parameters

`func`
    \- Device function symbol
`gridDim`
    \- Grid dimentions
`blockDim`
    \- Block dimentions
`args`
    \- Arguments
`sharedMem`
    \- Shared memory
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidConfiguration, cudaErrorLaunchFailure, cudaErrorLaunchTimeout, cudaErrorLaunchOutOfResources, cudaErrorSharedObjectInitFailed, cudaErrorInvalidPtx, cudaErrorUnsupportedPtxVersion, cudaErrorNoKernelImageForDevice, cudaErrorJitCompilerNotFound, cudaErrorJitCompilationDisabled

###### Description

The function invokes kernel `func` on `gridDim` (`gridDim.x``gridDim.y``gridDim.z`) grid of blocks. Each block contains `blockDim` (`blockDim.x``blockDim.y``blockDim.z`) threads.

If the kernel has N parameters the `args` should point to array of N pointers. Each pointer, from `args[0]` to `args[N - 1]`, point to the region of memory from which the actual parameter will be copied.

For templated functions, pass the function symbol as follows: func_name<template_arg_0,...,template_arg_N>

`sharedMem` sets the amount of dynamic shared memory that will be available to each thread block.

`stream` specifies a stream the invocation is associated to.

  * This function uses standard default stream semantics.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaLaunchKernel (C++ API), cuLaunchKernel

__host__ cudaError_t cudaLaunchKernelExC ( const cudaLaunchConfig_t* config, const void* func, void** args )


Launches a CUDA function with launch-time configuration.

######  Parameters

`config`
    \- Launch configuration
`func`
    \- Kernel to launch
`args`
    \- Array of pointers to kernel parameters

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidConfiguration, cudaErrorLaunchFailure, cudaErrorLaunchTimeout, cudaErrorLaunchOutOfResources, cudaErrorSharedObjectInitFailed, cudaErrorInvalidPtx, cudaErrorUnsupportedPtxVersion, cudaErrorNoKernelImageForDevice, cudaErrorJitCompilerNotFound, cudaErrorJitCompilationDisabled

###### Description

Note that the functionally equivalent variadic template cudaLaunchKernelEx is available for C++11 and newer.

Invokes the kernel `func` on `config->gridDim` (`config->gridDim.x``config->gridDim.y``config->gridDim.z`) grid of blocks. Each block contains `config->blockDim` (`config->blockDim.x``config->blockDim.y``config->blockDim.z`) threads.

`config->dynamicSmemBytes` sets the amount of dynamic shared memory that will be available to each thread block.

`config->stream` specifies a stream the invocation is associated to.

Configuration beyond grid and block dimensions, dynamic shared memory size, and stream can be provided with the following two fields of `config:`

`config->attrs` is an array of `config->numAttrs` contiguous cudaLaunchAttribute elements. The value of this pointer is not considered if `config->numAttrs` is zero. However, in that case, it is recommended to set the pointer to NULL. `config->numAttrs` is the number of attributes populating the first `config->numAttrs` positions of the `config->attrs` array.

If the kernel has N parameters the `args` should point to array of N pointers. Each pointer, from `args[0]` to `args[N - 1]`, point to the region of memory from which the actual parameter will be copied.

N.B. This function is so named to avoid unintentionally invoking the templated version, `cudaLaunchKernelEx`, for kernels taking a single void** or void* parameter.

  * This function uses standard default stream semantics.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaLaunchKernelEx(const cudaLaunchConfig_t *config, void (*kernel)(ExpTypes...), ActTypes &&... args) "cudaLaunchKernelEx (C++ API)", cuLaunchKernelEx

__device__  void cudaTriggerProgrammaticLaunchCompletion ( void ) [inline]


Programmatic dependency trigger.

###### Description

This device function ensures the programmatic launch completion edges / events are fulfilled. See cudaLaunchAttributeID::cudaLaunchAttributeProgrammaticStreamSerialization and cudaLaunchAttributeID::cudaLaunchAttributeProgrammaticEvent for more information. The event / edge kick off only happens when every CTAs in the grid has either exited or called this function at least once, otherwise the kick off happens automatically after all warps finishes execution but before the grid completes. The kick off only enables scheduling of the secondary kernel. It provides no memory visibility guarantee itself. The user could enforce memory visibility by inserting a memory fence of the correct scope.

* * *

!


Copyright © 2025 NVIDIA Corporation