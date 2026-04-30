---
name: driver-exec
description: '**Source:** group__CUDA__EXEC.html#group__CUDA__EXEC'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.22. Execution Control

**Source:** group__CUDA__EXEC.html#group__CUDA__EXEC


### Functions

CUresult cuFuncGetAttribute ( int* pi, CUfunction_attribute attrib, CUfunction hfunc )


Returns information about a function.

######  Parameters

`pi`
    \- Returned attribute value
`attrib`
    \- Attribute requested
`hfunc`
    \- Function to query attribute of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_FUNCTION_NOT_LOADED

###### Description

Returns in `*pi` the integer value of the attribute `attrib` on the kernel given by `hfunc`. The supported attributes are:

  * CU_FUNC_ATTRIBUTE_MAX_THREADS_PER_BLOCK: The maximum number of threads per block, beyond which a launch of the function would fail. This number depends on both the function and the device on which the function is currently loaded.

  * CU_FUNC_ATTRIBUTE_SHARED_SIZE_BYTES: The size in bytes of statically-allocated shared memory per block required by this function. This does not include dynamically-allocated shared memory requested by the user at runtime.

  * CU_FUNC_ATTRIBUTE_CONST_SIZE_BYTES: The size in bytes of user-allocated constant memory required by this function.

  * CU_FUNC_ATTRIBUTE_LOCAL_SIZE_BYTES: The size in bytes of local memory used by each thread of this function.

  * CU_FUNC_ATTRIBUTE_NUM_REGS: The number of registers used by each thread of this function.

  * CU_FUNC_ATTRIBUTE_PTX_VERSION: The PTX virtual architecture version for which the function was compiled. This value is the major PTX version * 10 + the minor PTX version, so a PTX version 1.3 function would return the value 13. Note that this may return the undefined value of 0 for cubins compiled prior to CUDA 3.0.

  * CU_FUNC_ATTRIBUTE_BINARY_VERSION: The binary architecture version for which the function was compiled. This value is the major binary version * 10 + the minor binary version, so a binary version 1.3 function would return the value 13. Note that this will return a value of 10 for legacy cubins that do not have a properly-encoded binary architecture version.

  * CU_FUNC_CACHE_MODE_CA: The attribute to indicate whether the function has been compiled with user specified option "-Xptxas \--dlcm=ca" set .

  * CU_FUNC_ATTRIBUTE_MAX_DYNAMIC_SHARED_SIZE_BYTES: The maximum size in bytes of dynamically-allocated shared memory.

  * CU_FUNC_ATTRIBUTE_PREFERRED_SHARED_MEMORY_CARVEOUT: Preferred shared memory-L1 cache split ratio in percent of total shared memory.

  * CU_FUNC_ATTRIBUTE_CLUSTER_SIZE_MUST_BE_SET: If this attribute is set, the kernel must launch with a valid cluster size specified.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_WIDTH: The required cluster width in blocks.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_HEIGHT: The required cluster height in blocks.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_DEPTH: The required cluster depth in blocks.

  * CU_FUNC_ATTRIBUTE_NON_PORTABLE_CLUSTER_SIZE_ALLOWED: Indicates whether the function can be launched with non-portable cluster size. 1 is allowed, 0 is disallowed. A non-portable cluster size may only function on the specific SKUs the program is tested on. The launch might fail if the program is run on a different hardware platform. CUDA API provides cudaOccupancyMaxActiveClusters to assist with checking whether the desired size can be launched on the current device. A portable cluster size is guaranteed to be functional on all compute capabilities higher than the target compute capability. The portable cluster size for sm_90 is 8 blocks per cluster. This value may increase for future compute capabilities. The specific hardware unit may support higher cluster sizes that’s not guaranteed to be portable.

  * CU_FUNC_ATTRIBUTE_CLUSTER_SCHEDULING_POLICY_PREFERENCE: The block scheduling policy of a function. The value type is CUclusterSchedulingPolicy.


With a few execeptions, function attributes may also be queried on unloaded function handles returned from cuModuleEnumerateFunctions. CUDA_ERROR_FUNCTION_NOT_LOADED is returned if the attribute requires a fully loaded function but the function is not loaded. The loading state of a function may be queried using cuFuncIsloaded. cuFuncLoad may be called to explicitly load a function before querying the following attributes that require the function to be loaded:

  * CU_FUNC_ATTRIBUTE_MAX_THREADS_PER_BLOCK

  * CU_FUNC_ATTRIBUTE_CONST_SIZE_BYTES

  * CU_FUNC_ATTRIBUTE_MAX_DYNAMIC_SHARED_SIZE_BYTES


CUresult cuFuncGetModule ( CUmodule* hmod, CUfunction hfunc )


Returns a module handle.

######  Parameters

`hmod`
    \- Returned module handle
`hfunc`
    \- Function to retrieve module for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_FOUND

###### Description

Returns in `*hmod` the handle of the module that function `hfunc` is located in. The lifetime of the module corresponds to the lifetime of the context it was loaded in or until the module is explicitly unloaded.

The CUDA runtime manages its own modules loaded into the primary context. If the handle returned by this API refers to a module loaded by the CUDA runtime, calling cuModuleUnload() on that module will result in undefined behavior.



CUresult cuFuncGetName ( const char** name, CUfunction hfunc )


Returns the function name for a CUfunction handle.

######  Parameters

`name`
    \- The returned name of the function
`hfunc`
    \- The function handle to retrieve the name for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `**name` the function name associated with the function handle `hfunc` . The function name is returned as a null-terminated string. The returned name is only valid when the function handle is valid. If the module is unloaded or reloaded, one must call the API again to get the updated name. This API may return a mangled name if the function is not declared as having C linkage. If either `**name` or `hfunc` is NULL, CUDA_ERROR_INVALID_VALUE is returned.



CUresult cuFuncGetParamInfo ( CUfunction func, size_t paramIndex, size_t* paramOffset, size_t* paramSize )


Returns the offset and size of a kernel parameter in the device-side parameter layout.

######  Parameters

`func`
    \- The function to query
`paramIndex`
    \- The parameter index to query
`paramOffset`
    \- Returns the offset into the device-side parameter layout at which the parameter resides
`paramSize`
    \- Optionally returns the size of the parameter in the device-side parameter layout

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Queries the kernel parameter at `paramIndex` into `func's` list of parameters, and returns in `paramOffset` and `paramSize` the offset and size, respectively, where the parameter will reside in the device-side parameter layout. This information can be used to update kernel node parameters from the device via cudaGraphKernelNodeSetParam() and cudaGraphKernelNodeUpdatesApply(). `paramIndex` must be less than the number of parameters that `func` takes. `paramSize` can be set to NULL if only the parameter offset is desired.

CUresult cuFuncIsLoaded ( CUfunctionLoadingState* state, CUfunction function )


Returns if the function is loaded.

######  Parameters

`state`
    \- returned loading state
`function`
    \- the function to check

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `state` the loading state of `function`.

CUresult cuFuncLoad ( CUfunction function )


Loads a function.

######  Parameters

`function`
    \- the function to load

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

Finalizes function loading for `function`. Calling this API with a fully loaded function has no effect.

CUresult cuFuncSetAttribute ( CUfunction hfunc, CUfunction_attribute attrib, int  value )


Sets information about a function.

######  Parameters

`hfunc`
    \- Function to query attribute of
`attrib`
    \- Attribute requested
`value`
    \- The value to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

This call sets the value of a specified attribute `attrib` on the kernel given by `hfunc` to an integer value specified by `val` This function returns CUDA_SUCCESS if the new value of the attribute could be successfully set. If the set fails, this call will return an error. Not all attributes can have values set. Attempting to set a value on a read-only attribute will result in an error (CUDA_ERROR_INVALID_VALUE)

Supported attributes for the cuFuncSetAttribute call are:

  * CU_FUNC_ATTRIBUTE_MAX_DYNAMIC_SHARED_SIZE_BYTES: This maximum size in bytes of dynamically-allocated shared memory. The value should contain the requested maximum size of dynamically-allocated shared memory. The sum of this value and the function attribute CU_FUNC_ATTRIBUTE_SHARED_SIZE_BYTES cannot exceed the device attribute CU_DEVICE_ATTRIBUTE_MAX_SHARED_MEMORY_PER_BLOCK_OPTIN. The maximal size of requestable dynamic shared memory may differ by GPU architecture.

  * CU_FUNC_ATTRIBUTE_PREFERRED_SHARED_MEMORY_CARVEOUT: On devices where the L1 cache and shared memory use the same hardware resources, this sets the shared memory carveout preference, in percent of the total shared memory. See CU_DEVICE_ATTRIBUTE_MAX_SHARED_MEMORY_PER_MULTIPROCESSOR This is only a hint, and the driver can choose a different ratio if required to execute the function.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_WIDTH: The required cluster width in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return CUDA_ERROR_NOT_PERMITTED.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_HEIGHT: The required cluster height in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return CUDA_ERROR_NOT_PERMITTED.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_DEPTH: The required cluster depth in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return CUDA_ERROR_NOT_PERMITTED.

  * CU_FUNC_ATTRIBUTE_NON_PORTABLE_CLUSTER_SIZE_ALLOWED: Indicates whether the function can be launched with non-portable cluster size. 1 is allowed, 0 is disallowed.

  * CU_FUNC_ATTRIBUTE_CLUSTER_SCHEDULING_POLICY_PREFERENCE: The block scheduling policy of a function. The value type is CUclusterSchedulingPolicy.


CUresult cuFuncSetCacheConfig ( CUfunction hfunc, CUfunc_cache config )


Sets the preferred cache configuration for a device function.

######  Parameters

`hfunc`
    \- Kernel to configure cache for
`config`
    \- Requested cache configuration

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT

###### Description

On devices where the L1 cache and shared memory use the same hardware resources, this sets through `config` the preferred cache configuration for the device function `hfunc`. This is only a preference. The driver will use the requested configuration if possible, but it is free to choose a different configuration if required to execute `hfunc`. Any context-wide preference set via cuCtxSetCacheConfig() will be overridden by this per-function setting unless the per-function setting is CU_FUNC_CACHE_PREFER_NONE. In that case, the current context-wide setting will be used.

This setting does nothing on devices where the size of the L1 cache and shared memory are fixed.

Launching a kernel with a different preference than the most recent preference setting may insert a device-side synchronization point.

The supported cache configurations are:

  * CU_FUNC_CACHE_PREFER_NONE: no preference for shared memory or L1 (default)

  * CU_FUNC_CACHE_PREFER_SHARED: prefer larger shared memory and smaller L1 cache

  * CU_FUNC_CACHE_PREFER_L1: prefer larger L1 cache and smaller shared memory

  * CU_FUNC_CACHE_PREFER_EQUAL: prefer equal sized L1 cache and shared memory


CUresult cuLaunchCooperativeKernel ( CUfunction f, unsigned int  gridDimX, unsigned int  gridDimY, unsigned int  gridDimZ, unsigned int  blockDimX, unsigned int  blockDimY, unsigned int  blockDimZ, unsigned int  sharedMemBytes, CUstream hStream, void** kernelParams )


Launches a CUDA function CUfunction or a CUDA kernel CUkernel where thread blocks can cooperate and synchronize as they execute.

######  Parameters

`f`
    \- Function CUfunction or Kernel CUkernel to launch
`gridDimX`
    \- Width of grid in blocks
`gridDimY`
    \- Height of grid in blocks
`gridDimZ`
    \- Depth of grid in blocks
`blockDimX`
    \- X dimension of each thread block
`blockDimY`
    \- Y dimension of each thread block
`blockDimZ`
    \- Z dimension of each thread block
`sharedMemBytes`
    \- Dynamic shared-memory size per thread block in bytes
`hStream`
    \- Stream identifier
`kernelParams`
    \- Array of pointers to kernel parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_IMAGE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_LAUNCH_FAILED, CUDA_ERROR_LAUNCH_OUT_OF_RESOURCES, CUDA_ERROR_LAUNCH_TIMEOUT, CUDA_ERROR_LAUNCH_INCOMPATIBLE_TEXTURING, CUDA_ERROR_COOPERATIVE_LAUNCH_TOO_LARGE, CUDA_ERROR_SHARED_OBJECT_INIT_FAILED, CUDA_ERROR_NOT_FOUND

###### Description

Invokes the function CUfunction or the kernel CUkernel`f` on a `gridDimX` x `gridDimY` x `gridDimZ` grid of blocks. Each block contains `blockDimX` x `blockDimY` x `blockDimZ` threads.

`sharedMemBytes` sets the amount of dynamic shared memory that will be available to each thread block.

The device on which this kernel is invoked must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_COOPERATIVE_LAUNCH.

The total number of blocks launched cannot exceed the maximum number of blocks per multiprocessor as returned by cuOccupancyMaxActiveBlocksPerMultiprocessor (or cuOccupancyMaxActiveBlocksPerMultiprocessorWithFlags) times the number of multiprocessors as specified by the device attribute CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT.

The kernel cannot make use of CUDA dynamic parallelism.

Kernel parameters must be specified via `kernelParams`. If `f` has N parameters, then `kernelParams` needs to be an array of N pointers. Each of `kernelParams`[0] through `kernelParams`[N-1] must point to a region of memory from which the actual kernel parameter will be copied. The number of kernel parameters and their offsets and sizes do not need to be specified as that information is retrieved directly from the kernel's image.

Calling cuLaunchCooperativeKernel() sets persistent function state that is the same as function state set through cuLaunchKernel API

When the kernel `f` is launched via cuLaunchCooperativeKernel(), the previous block shape, shared size and parameter info associated with `f` is overwritten.

Note that to use cuLaunchCooperativeKernel(), the kernel `f` must either have been compiled with toolchain version 3.2 or later so that it will contain kernel parameter information, or have no kernel parameters. If either of these conditions is not met, then cuLaunchCooperativeKernel() will return CUDA_ERROR_INVALID_IMAGE.

Note that the API can also be used to launch context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to launch the kernel on will either be taken from the specified stream `hStream` or the current context in case of NULL stream.

  * This function uses standard default stream semantics.

  *
CUresult cuLaunchCooperativeKernelMultiDevice ( CUDA_LAUNCH_PARAMS* launchParamsList, unsigned int  numDevices, unsigned int  flags )


Launches CUDA functions on multiple devices where thread blocks can cooperate and synchronize as they execute.

######  Parameters

`launchParamsList`
    \- List of launch parameters, one per device
`numDevices`
    \- Size of the `launchParamsList` array
`flags`
    \- Flags to control launch behavior

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_IMAGE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_LAUNCH_FAILED, CUDA_ERROR_LAUNCH_OUT_OF_RESOURCES, CUDA_ERROR_LAUNCH_TIMEOUT, CUDA_ERROR_LAUNCH_INCOMPATIBLE_TEXTURING, CUDA_ERROR_COOPERATIVE_LAUNCH_TOO_LARGE, CUDA_ERROR_SHARED_OBJECT_INIT_FAILED

###### Deprecated

This function is deprecated as of CUDA 11.3.

###### Description

Invokes kernels as specified in the `launchParamsList` array where each element of the array specifies all the parameters required to perform a single kernel launch. These kernels can cooperate and synchronize as they execute. The size of the array is specified by `numDevices`.

No two kernels can be launched on the same device. All the devices targeted by this multi-device launch must be identical. All devices must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_COOPERATIVE_MULTI_DEVICE_LAUNCH.

All kernels launched must be identical with respect to the compiled code. Note that any __device__, __constant__ or __managed__ variables present in the module that owns the kernel launched on each device, are independently instantiated on every device. It is the application's responsibility to ensure these variables are initialized and used appropriately.

The size of the grids as specified in blocks, the size of the blocks themselves and the amount of shared memory used by each thread block must also match across all launched kernels.

The streams used to launch these kernels must have been created via either cuStreamCreate or cuStreamCreateWithPriority. The NULL stream or CU_STREAM_LEGACY or CU_STREAM_PER_THREAD cannot be used.

The total number of blocks launched per kernel cannot exceed the maximum number of blocks per multiprocessor as returned by cuOccupancyMaxActiveBlocksPerMultiprocessor (or cuOccupancyMaxActiveBlocksPerMultiprocessorWithFlags) times the number of multiprocessors as specified by the device attribute CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT. Since the total number of blocks launched per device has to match across all devices, the maximum number of blocks that can be launched per device will be limited by the device with the least number of multiprocessors.

The kernels cannot make use of CUDA dynamic parallelism.

The CUDA_LAUNCH_PARAMS structure is defined as:


    ‎        typedef struct CUDA_LAUNCH_PARAMS_st
                  {
                      CUfunction function;
                      unsigned int gridDimX;
                      unsigned int gridDimY;
                      unsigned int gridDimZ;
                      unsigned int blockDimX;
                      unsigned int blockDimY;
                      unsigned int blockDimZ;
                      unsigned int sharedMemBytes;
                      CUstream hStream;
                      void **kernelParams;
                  } CUDA_LAUNCH_PARAMS;

where:

  * CUDA_LAUNCH_PARAMS::function specifies the kernel to be launched. All functions must be identical with respect to the compiled code. Note that you can also specify context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then casting to CUfunction. In this case, the context to launch the kernel on be taken from the specified stream CUDA_LAUNCH_PARAMS::hStream.

  * CUDA_LAUNCH_PARAMS::gridDimX is the width of the grid in blocks. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::gridDimY is the height of the grid in blocks. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::gridDimZ is the depth of the grid in blocks. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::blockDimX is the X dimension of each thread block. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::blockDimX is the Y dimension of each thread block. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::blockDimZ is the Z dimension of each thread block. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::sharedMemBytes is the dynamic shared-memory size per thread block in bytes. This must match across all kernels launched.

  * CUDA_LAUNCH_PARAMS::hStream is the handle to the stream to perform the launch in. This cannot be the NULL stream or CU_STREAM_LEGACY or CU_STREAM_PER_THREAD. The CUDA context associated with this stream must match that associated with CUDA_LAUNCH_PARAMS::function.

  * CUDA_LAUNCH_PARAMS::kernelParams is an array of pointers to kernel parameters. If CUDA_LAUNCH_PARAMS::function has N parameters, then CUDA_LAUNCH_PARAMS::kernelParams needs to be an array of N pointers. Each of CUDA_LAUNCH_PARAMS::kernelParams[0] through CUDA_LAUNCH_PARAMS::kernelParams[N-1] must point to a region of memory from which the actual kernel parameter will be copied. The number of kernel parameters and their offsets and sizes do not need to be specified as that information is retrieved directly from the kernel's image.


By default, the kernel won't begin execution on any GPU until all prior work in all the specified streams has completed. This behavior can be overridden by specifying the flag CUDA_COOPERATIVE_LAUNCH_MULTI_DEVICE_NO_PRE_LAUNCH_SYNC. When this flag is specified, each kernel will only wait for prior work in the stream corresponding to that GPU to complete before it begins execution.

Similarly, by default, any subsequent work pushed in any of the specified streams will not begin execution until the kernels on all GPUs have completed. This behavior can be overridden by specifying the flag CUDA_COOPERATIVE_LAUNCH_MULTI_DEVICE_NO_POST_LAUNCH_SYNC. When this flag is specified, any subsequent work pushed in any of the specified streams will only wait for the kernel launched on the GPU corresponding to that stream to complete before it begins execution.

Calling cuLaunchCooperativeKernelMultiDevice() sets persistent function state that is the same as function state set through cuLaunchKernel API when called individually for each element in `launchParamsList`.

When kernels are launched via cuLaunchCooperativeKernelMultiDevice(), the previous block shape, shared size and parameter info associated with each CUDA_LAUNCH_PARAMS::function in `launchParamsList` is overwritten.

Note that to use cuLaunchCooperativeKernelMultiDevice(), the kernels must either have been compiled with toolchain version 3.2 or later so that it will contain kernel parameter information, or have no kernel parameters. If either of these conditions is not met, then cuLaunchCooperativeKernelMultiDevice() will return CUDA_ERROR_INVALID_IMAGE.

  * This function uses standard default stream semantics.

  *
CUresult cuLaunchHostFunc ( CUstream hStream, CUhostFn fn, void* userData )


Enqueues a host function call in a stream.

######  Parameters

`hStream`
    \- Stream to enqueue function call in
`fn`
    \- The function to call once preceding stream operations are complete
`userData`
    \- User-specified data to be passed to the function

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Enqueues a host function to run in a stream. The function will be called after currently enqueued work and will block work added after it.

The host function must not make any CUDA API calls. Attempting to use a CUDA API may result in CUDA_ERROR_NOT_PERMITTED, but this is not required. The host function must not perform any synchronization that may depend on outstanding CUDA work not mandated to run earlier. Host functions without a mandated order (such as in independent streams) execute in undefined order and may be serialized.

For the purposes of Unified Memory, execution makes a number of guarantees:

  * The stream is considered idle for the duration of the function's execution. Thus, for example, the function may always use memory attached to the stream it was enqueued in.

  * The start of execution of the function has the same effect as synchronizing an event recorded in the same stream immediately prior to the function. It thus synchronizes streams which have been "joined" prior to the function.

  * Adding device work to any stream does not have the effect of making the stream active until all preceding host functions and stream callbacks have executed. Thus, for example, a function might use global attached memory even if work has been added to another stream, if the work has been ordered behind the function call with an event.

  * Completion of the function does not cause a stream to become active except as described above. The stream will remain idle if no device work follows the function, and will remain idle across consecutive host functions or stream callbacks without device work in between. Thus, for example, stream synchronization can be done by signaling from a host function at the end of the stream.


Note that, in contrast to cuStreamAddCallback, the function will not be called in the event of an error in the CUDA context.

  * This function uses standard default stream semantics.

  *
CUresult cuLaunchKernel ( CUfunction f, unsigned int  gridDimX, unsigned int  gridDimY, unsigned int  gridDimZ, unsigned int  blockDimX, unsigned int  blockDimY, unsigned int  blockDimZ, unsigned int  sharedMemBytes, CUstream hStream, void** kernelParams, void** extra )


Launches a CUDA function CUfunction or a CUDA kernel CUkernel.

######  Parameters

`f`
    \- Function CUfunction or Kernel CUkernel to launch
`gridDimX`
    \- Width of grid in blocks
`gridDimY`
    \- Height of grid in blocks
`gridDimZ`
    \- Depth of grid in blocks
`blockDimX`
    \- X dimension of each thread block
`blockDimY`
    \- Y dimension of each thread block
`blockDimZ`
    \- Z dimension of each thread block
`sharedMemBytes`
    \- Dynamic shared-memory size per thread block in bytes
`hStream`
    \- Stream identifier
`kernelParams`
    \- Array of pointers to kernel parameters
`extra`
    \- Extra options

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_IMAGE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_LAUNCH_FAILED, CUDA_ERROR_LAUNCH_OUT_OF_RESOURCES, CUDA_ERROR_LAUNCH_TIMEOUT, CUDA_ERROR_LAUNCH_INCOMPATIBLE_TEXTURING, CUDA_ERROR_SHARED_OBJECT_INIT_FAILED, CUDA_ERROR_NOT_FOUND

###### Description

Invokes the function CUfunction or the kernel CUkernel`f` on a `gridDimX` x `gridDimY` x `gridDimZ` grid of blocks. Each block contains `blockDimX` x `blockDimY` x `blockDimZ` threads.

`sharedMemBytes` sets the amount of dynamic shared memory that will be available to each thread block.

Kernel parameters to `f` can be specified in one of two ways:

1) Kernel parameters can be specified via `kernelParams`. If `f` has N parameters, then `kernelParams` needs to be an array of N pointers. Each of `kernelParams`[0] through `kernelParams`[N-1] must point to a region of memory from which the actual kernel parameter will be copied. The number of kernel parameters and their offsets and sizes do not need to be specified as that information is retrieved directly from the kernel's image.

2) Kernel parameters can also be packaged by the application into a single buffer that is passed in via the `extra` parameter. This places the burden on the application of knowing each kernel parameter's size and alignment/padding within the buffer. Here is an example of using the `extra` parameter in this manner:


    ‎    size_t argBufferSize;
              char argBuffer[256];

              // populate argBuffer and argBufferSize

              void *config[] = {
                  CU_LAUNCH_PARAM_BUFFER_POINTER, argBuffer
                  CU_LAUNCH_PARAM_BUFFER_SIZE,    &argBufferSize
                  CU_LAUNCH_PARAM_END
              };
              status = cuLaunchKernel(f, gx, gy, gz, bx, by, bz, sh, s, NULL, config);

The `extra` parameter exists to allow cuLaunchKernel to take additional less commonly used arguments. `extra` specifies a list of names of extra settings and their corresponding values. Each extra setting name is immediately followed by the corresponding value. The list must be terminated with either NULL or CU_LAUNCH_PARAM_END.

  * CU_LAUNCH_PARAM_END, which indicates the end of the `extra` array;

  * CU_LAUNCH_PARAM_BUFFER_POINTER, which specifies that the next value in `extra` will be a pointer to a buffer containing all the kernel parameters for launching kernel `f`;

  * CU_LAUNCH_PARAM_BUFFER_SIZE, which specifies that the next value in `extra` will be a pointer to a size_t containing the size of the buffer specified with CU_LAUNCH_PARAM_BUFFER_POINTER;


The error CUDA_ERROR_INVALID_VALUE will be returned if kernel parameters are specified with both `kernelParams` and `extra` (i.e. both `kernelParams` and `extra` are non-NULL).

Calling cuLaunchKernel() invalidates the persistent function state set through the following deprecated APIs: cuFuncSetBlockShape(), cuFuncSetSharedSize(), cuParamSetSize(), cuParamSeti(), cuParamSetf(), cuParamSetv().

Note that to use cuLaunchKernel(), the kernel `f` must either have been compiled with toolchain version 3.2 or later so that it will contain kernel parameter information, or have no kernel parameters. If either of these conditions is not met, then cuLaunchKernel() will return CUDA_ERROR_INVALID_IMAGE.

Note that the API can also be used to launch context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to launch the kernel on will either be taken from the specified stream `hStream` or the current context in case of NULL stream.

  * This function uses standard default stream semantics.

  *
CUresult cuLaunchKernelEx ( const CUlaunchConfig* config, CUfunction f, void** kernelParams, void** extra )


Launches a CUDA function CUfunction or a CUDA kernel CUkernel with launch-time configuration.

######  Parameters

`config`
    \- Config to launch
`f`
    \- Function CUfunction or Kernel CUkernel to launch
`kernelParams`
    \- Array of pointers to kernel parameters
`extra`
    \- Extra options

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_IMAGE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_LAUNCH_FAILED, CUDA_ERROR_LAUNCH_OUT_OF_RESOURCES, CUDA_ERROR_LAUNCH_TIMEOUT, CUDA_ERROR_LAUNCH_INCOMPATIBLE_TEXTURING, CUDA_ERROR_COOPERATIVE_LAUNCH_TOO_LARGE, CUDA_ERROR_SHARED_OBJECT_INIT_FAILED, CUDA_ERROR_NOT_FOUND

###### Description

Invokes the function CUfunction or the kernel CUkernel`f` with the specified launch-time configuration `config`.

The CUlaunchConfig structure is defined as:


    ‎       typedef struct CUlaunchConfig_st {
               unsigned int gridDimX;
               unsigned int gridDimY;
               unsigned int gridDimZ;
               unsigned int blockDimX;
               unsigned int blockDimY;
               unsigned int blockDimZ;
               unsigned int sharedMemBytes;
               CUstream hStream;
               CUlaunchAttribute *attrs;
               unsigned int numAttrs;
           } CUlaunchConfig;

where:

  * CUlaunchConfig::gridDimX is the width of the grid in blocks.

  * CUlaunchConfig::gridDimY is the height of the grid in blocks.

  * CUlaunchConfig::gridDimZ is the depth of the grid in blocks.

  * CUlaunchConfig::blockDimX is the X dimension of each thread block.

  * CUlaunchConfig::blockDimX is the Y dimension of each thread block.

  * CUlaunchConfig::blockDimZ is the Z dimension of each thread block.

  * CUlaunchConfig::sharedMemBytes is the dynamic shared-memory size per thread block in bytes.

  * CUlaunchConfig::hStream is the handle to the stream to perform the launch in. The CUDA context associated with this stream must match that associated with function f.

  * CUlaunchConfig::attrs is an array of CUlaunchConfig::numAttrs continguous CUlaunchAttribute elements. The value of this pointer is not considered if CUlaunchConfig::numAttrs is zero. However, in that case, it is recommended to set the pointer to NULL.

  * CUlaunchConfig::numAttrs is the number of attributes populating the first CUlaunchConfig::numAttrs positions of the CUlaunchConfig::attrs array.


Launch-time configuration is specified by adding entries to CUlaunchConfig::attrs. Each entry is an attribute ID and a corresponding attribute value.

The CUlaunchAttribute structure is defined as:


    ‎       typedef struct CUlaunchAttribute_st {
               CUlaunchAttributeID id;
               CUlaunchAttributeValue value;
           } CUlaunchAttribute;

where:

  * CUlaunchAttribute::id is a unique enum identifying the attribute.

  * CUlaunchAttribute::value is a union that hold the attribute value.


An example of using the `config` parameter:


    ‎       CUlaunchAttribute coopAttr = {.id = CU_LAUNCH_ATTRIBUTE_COOPERATIVE
                                         .value = 1};
           CUlaunchConfig config = {... // set block and grid dimensions
                                  .attrs = &coopAttr
                                  .numAttrs = 1};

           cuLaunchKernelEx(&config, kernel, NULL, NULL);

The CUlaunchAttributeID enum is defined as:


    ‎       typedef enum CUlaunchAttributeID_enum {
               CU_LAUNCH_ATTRIBUTE_IGNORE = 0
               CU_LAUNCH_ATTRIBUTE_ACCESS_POLICY_WINDOW   = 1
               CU_LAUNCH_ATTRIBUTE_COOPERATIVE            = 2
               CU_LAUNCH_ATTRIBUTE_SYNCHRONIZATION_POLICY = 3
               CU_LAUNCH_ATTRIBUTE_CLUSTER_DIMENSION                    = 4
               CU_LAUNCH_ATTRIBUTE_CLUSTER_SCHEDULING_POLICY_PREFERENCE = 5
               CU_LAUNCH_ATTRIBUTE_PROGRAMMATIC_STREAM_SERIALIZATION    = 6
               CU_LAUNCH_ATTRIBUTE_PROGRAMMATIC_EVENT                   = 7
               CU_LAUNCH_ATTRIBUTE_PRIORITY               = 8
               CU_LAUNCH_ATTRIBUTE_MEM_SYNC_DOMAIN_MAP    = 9
               CU_LAUNCH_ATTRIBUTE_MEM_SYNC_DOMAIN        = 10
               CU_LAUNCH_ATTRIBUTE_PREFERRED_CLUSTER_DIMENSION = 11
               CU_LAUNCH_ATTRIBUTE_LAUNCH_COMPLETION_EVENT = 12
               CU_LAUNCH_ATTRIBUTE_DEVICE_UPDATABLE_KERNEL_NODE = 13
           } CUlaunchAttributeID;

and the corresponding CUlaunchAttributeValue union as :


    ‎       typedef union CUlaunchAttributeValue_union {
               CUaccessPolicyWindow accessPolicyWindow;
               int cooperative;
               CUsynchronizationPolicy syncPolicy;
               struct {
                   unsigned int x;
                   unsigned int y;
                   unsigned int z;
               } clusterDim;
               CUclusterSchedulingPolicy clusterSchedulingPolicyPreference;
               int programmaticStreamSerializationAllowed;
               struct {
                   CUevent event;
                   int flags;
                   int triggerAtBlockStart;
               } programmaticEvent;
               int priority;
               CUlaunchMemSyncDomainMap memSyncDomainMap;
               CUlaunchMemSyncDomain memSyncDomain;
               struct {
                   unsigned int x;
                   unsigned int y;
                   unsigned int z;
               } preferredClusterDim;
               struct {
                   CUevent event;
                   int flags;
               } launchCompletionEvent;
               struct {
                   int deviceUpdatable;
                   CUgraphDeviceNode devNode;
               } deviceUpdatableKernelNode;
           } CUlaunchAttributeValue;

Setting CU_LAUNCH_ATTRIBUTE_COOPERATIVE to a non-zero value causes the kernel launch to be a cooperative launch, with exactly the same usage and semantics of cuLaunchCooperativeKernel.

Setting CU_LAUNCH_ATTRIBUTE_PROGRAMMATIC_STREAM_SERIALIZATION to a non-zero values causes the kernel to use programmatic means to resolve its stream dependency -- enabling the CUDA runtime to opportunistically allow the grid's execution to overlap with the previous kernel in the stream, if that kernel requests the overlap.

CU_LAUNCH_ATTRIBUTE_PROGRAMMATIC_EVENT records an event along with the kernel launch. Event recorded through this launch attribute is guaranteed to only trigger after all block in the associated kernel trigger the event. A block can trigger the event through PTX launchdep.release or CUDA builtin function cudaTriggerProgrammaticLaunchCompletion(). A trigger can also be inserted at the beginning of each block's execution if triggerAtBlockStart is set to non-0. Note that dependents (including the CPU thread calling cuEventSynchronize()) are not guaranteed to observe the release precisely when it is released. For example, cuEventSynchronize() may only observe the event trigger long after the associated kernel has completed. This recording type is primarily meant for establishing programmatic dependency between device tasks. The event supplied must not be an interprocess or interop event. The event must disable timing (i.e. created with CU_EVENT_DISABLE_TIMING flag set).

CU_LAUNCH_ATTRIBUTE_LAUNCH_COMPLETION_EVENT records an event along with the kernel launch. Nominally, the event is triggered once all blocks of the kernel have begun execution. Currently this is a best effort. If a kernel B has a launch completion dependency on a kernel A, B may wait until A is complete. Alternatively, blocks of B may begin before all blocks of A have begun, for example:

  * If B can claim execution resources unavailable to A, for example if they run on different GPUs.

  * If B is a higher priority than A.


Exercise caution if such an ordering inversion could lead to deadlock. The event supplied must not be an interprocess or interop event. The event must disable timing (i.e. must be created with the CU_EVENT_DISABLE_TIMING flag set).

Setting CU_LAUNCH_ATTRIBUTE_DEVICE_UPDATABLE_KERNEL_NODE to 1 on a captured launch causes the resulting kernel node to be device-updatable. This attribute is specific to graphs, and passing it to a launch in a non-capturing stream results in an error. Passing a value other than 0 or 1 is not allowed.

On success, a handle will be returned via CUlaunchAttributeValue::deviceUpdatableKernelNode::devNode which can be passed to the various device-side update functions to update the node's kernel parameters from within another kernel. For more information on the types of device updates that can be made, as well as the relevant limitations thereof, see cudaGraphKernelNodeUpdatesApply.

Kernel nodes which are device-updatable have additional restrictions compared to regular kernel nodes. Firstly, device-updatable nodes cannot be removed from their graph via cuGraphDestroyNode. Additionally, once opted-in to this functionality, a node cannot opt out, and any attempt to set the attribute to 0 will result in an error. Graphs containing one or more device-updatable node also do not allow multiple instantiation.

CU_LAUNCH_ATTRIBUTE_PREFERRED_CLUSTER_DIMENSION allows the kernel launch to specify a preferred substitute cluster dimension. Blocks may be grouped according to either the dimensions specified with this attribute (grouped into a "preferred substitute cluster"), or the one specified with CU_LAUNCH_ATTRIBUTE_CLUSTER_DIMENSION attribute (grouped into a "regular cluster"). The cluster dimensions of a "preferred substitute cluster" shall be an integer multiple greater than zero of the regular cluster dimensions. The device will attempt - on a best-effort basis - to group thread blocks into preferred clusters over grouping them into regular clusters. When it deems necessary (primarily when the device temporarily runs out of physical resources to launch the larger preferred clusters), the device may switch to launch the regular clusters instead to attempt to utilize as much of the physical device resources as possible.

Each type of cluster will have its enumeration / coordinate setup as if the grid consists solely of its type of cluster. For example, if the preferred substitute cluster dimensions double the regular cluster dimensions, there might be simultaneously a regular cluster indexed at (1,0,0), and a preferred cluster indexed at (1,0,0). In this example, the preferred substitute cluster (1,0,0) replaces regular clusters (2,0,0) and (3,0,0) and groups their blocks.

This attribute will only take effect when a regular cluster dimension has been specified. The preferred substitute The preferred substitute cluster dimension must be an integer multiple greater than zero of the regular cluster dimension and must divide the grid. It must also be no more than `maxBlocksPerCluster`, if it is set in the kernel's `__launch_bounds__`. Otherwise it must be less than the maximum value the driver can support. Otherwise, setting this attribute to a value physically unable to fit on any particular device is permitted.

The effect of other attributes is consistent with their effect when set via persistent APIs.

See cuStreamSetAttribute for

  * CU_LAUNCH_ATTRIBUTE_ACCESS_POLICY_WINDOW

  * CU_LAUNCH_ATTRIBUTE_SYNCHRONIZATION_POLICY


See cuFuncSetAttribute for

  * CU_LAUNCH_ATTRIBUTE_CLUSTER_DIMENSION

  * CU_LAUNCH_ATTRIBUTE_CLUSTER_SCHEDULING_POLICY_PREFERENCE


Kernel parameters to `f` can be specified in the same ways that they can be using cuLaunchKernel.

Note that the API can also be used to launch context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to launch the kernel on will either be taken from the specified stream CUlaunchConfig::hStream or the current context in case of NULL stream.

  * This function uses standard default stream semantics.

  *