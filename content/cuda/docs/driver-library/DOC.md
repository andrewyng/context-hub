---
name: driver-library
description: '**Source:** group__CUDA__LIBRARY.html#group__CUDA__LIBRARY'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.12. Library Management

**Source:** group__CUDA__LIBRARY.html#group__CUDA__LIBRARY


### Functions

CUresult cuKernelGetAttribute ( int* pi, CUfunction_attribute attrib, CUkernel kernel, CUdevice dev )


Returns information about a kernel.

######  Parameters

`pi`
    \- Returned attribute value
`attrib`
    \- Attribute requested
`kernel`
    \- Kernel to query attribute of
`dev`
    \- Device to query attribute of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*pi` the integer value of the attribute `attrib` for the kernel `kernel` for the requested device `dev`. The supported attributes are:

  * CU_FUNC_ATTRIBUTE_MAX_THREADS_PER_BLOCK: The maximum number of threads per block, beyond which a launch of the kernel would fail. This number depends on both the kernel and the requested device.

  * CU_FUNC_ATTRIBUTE_SHARED_SIZE_BYTES: The size in bytes of statically-allocated shared memory per block required by this kernel. This does not include dynamically-allocated shared memory requested by the user at runtime.

  * CU_FUNC_ATTRIBUTE_CONST_SIZE_BYTES: The size in bytes of user-allocated constant memory required by this kernel.

  * CU_FUNC_ATTRIBUTE_LOCAL_SIZE_BYTES: The size in bytes of local memory used by each thread of this kernel.

  * CU_FUNC_ATTRIBUTE_NUM_REGS: The number of registers used by each thread of this kernel.

  * CU_FUNC_ATTRIBUTE_PTX_VERSION: The PTX virtual architecture version for which the kernel was compiled. This value is the major PTX version * 10 + the minor PTX version, so a PTX version 1.3 function would return the value 13. Note that this may return the undefined value of 0 for cubins compiled prior to CUDA 3.0.

  * CU_FUNC_ATTRIBUTE_BINARY_VERSION: The binary architecture version for which the kernel was compiled. This value is the major binary version * 10 + the minor binary version, so a binary version 1.3 function would return the value 13. Note that this will return a value of 10 for legacy cubins that do not have a properly-encoded binary architecture version.

  * CU_FUNC_CACHE_MODE_CA: The attribute to indicate whether the kernel has been compiled with user specified option "-Xptxas \--dlcm=ca" set.

  * CU_FUNC_ATTRIBUTE_MAX_DYNAMIC_SHARED_SIZE_BYTES: The maximum size in bytes of dynamically-allocated shared memory.

  * CU_FUNC_ATTRIBUTE_PREFERRED_SHARED_MEMORY_CARVEOUT: Preferred shared memory-L1 cache split ratio in percent of total shared memory.

  * CU_FUNC_ATTRIBUTE_CLUSTER_SIZE_MUST_BE_SET: If this attribute is set, the kernel must launch with a valid cluster size specified.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_WIDTH: The required cluster width in blocks.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_HEIGHT: The required cluster height in blocks.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_DEPTH: The required cluster depth in blocks.

  * CU_FUNC_ATTRIBUTE_NON_PORTABLE_CLUSTER_SIZE_ALLOWED: Indicates whether the function can be launched with non-portable cluster size. 1 is allowed, 0 is disallowed. A non-portable cluster size may only function on the specific SKUs the program is tested on. The launch might fail if the program is run on a different hardware platform. CUDA API provides cudaOccupancyMaxActiveClusters to assist with checking whether the desired size can be launched on the current device. A portable cluster size is guaranteed to be functional on all compute capabilities higher than the target compute capability. The portable cluster size for sm_90 is 8 blocks per cluster. This value may increase for future compute capabilities. The specific hardware unit may support higher cluster sizes that’s not guaranteed to be portable.

  * CU_FUNC_ATTRIBUTE_CLUSTER_SCHEDULING_POLICY_PREFERENCE: The block scheduling policy of a function. The value type is CUclusterSchedulingPolicy.


If another thread is trying to set the same attribute on the same device using cuKernelSetAttribute() simultaneously, the attribute query will give the old or new value depending on the interleavings chosen by the OS scheduler and memory consistency.

CUresult cuKernelGetFunction ( CUfunction* pFunc, CUkernel kernel )


Returns a function handle.

######  Parameters

`pFunc`
    \- Returned function handle
`kernel`
    \- Kernel to retrieve function for the requested context

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Returns in `pFunc` the handle of the function for the requested kernel `kernel` and the current context. If function handle is not found, the call returns CUDA_ERROR_NOT_FOUND.

CUresult cuKernelGetLibrary ( CUlibrary* pLib, CUkernel kernel )


Returns a library handle.

######  Parameters

`pLib`
    \- Returned library handle
`kernel`
    \- Kernel to retrieve library handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND

###### Description

Returns in `pLib` the handle of the library for the requested kernel `kernel`

CUresult cuKernelGetName ( const char** name, CUkernel hfunc )


Returns the function name for a CUkernel handle.

######  Parameters

`name`
    \- The returned name of the function
`hfunc`
    \- The function handle to retrieve the name for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `**name` the function name associated with the kernel handle `hfunc` . The function name is returned as a null-terminated string. The returned name is only valid when the kernel handle is valid. If the library is unloaded or reloaded, one must call the API again to get the updated name. This API may return a mangled name if the function is not declared as having C linkage. If either `**name` or `hfunc` is NULL, CUDA_ERROR_INVALID_VALUE is returned.



CUresult cuKernelGetParamInfo ( CUkernel kernel, size_t paramIndex, size_t* paramOffset, size_t* paramSize )


Returns the offset and size of a kernel parameter in the device-side parameter layout.

######  Parameters

`kernel`
    \- The kernel to query
`paramIndex`
    \- The parameter index to query
`paramOffset`
    \- Returns the offset into the device-side parameter layout at which the parameter resides
`paramSize`
    \- Optionally returns the size of the parameter in the device-side parameter layout

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Queries the kernel parameter at `paramIndex` into `kernel's` list of parameters, and returns in `paramOffset` and `paramSize` the offset and size, respectively, where the parameter will reside in the device-side parameter layout. This information can be used to update kernel node parameters from the device via cudaGraphKernelNodeSetParam() and cudaGraphKernelNodeUpdatesApply(). `paramIndex` must be less than the number of parameters that `kernel` takes. `paramSize` can be set to NULL if only the parameter offset is desired.

CUresult cuKernelSetAttribute ( CUfunction_attribute attrib, int  val, CUkernel kernel, CUdevice dev )


Sets information about a kernel.

######  Parameters

`attrib`
    \- Attribute requested
`val`
    \- Value to set
`kernel`
    \- Kernel to set attribute of
`dev`
    \- Device to set attribute of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

This call sets the value of a specified attribute `attrib` on the kernel `kernel` for the requested device `dev` to an integer value specified by `val`. This function returns CUDA_SUCCESS if the new value of the attribute could be successfully set. If the set fails, this call will return an error. Not all attributes can have values set. Attempting to set a value on a read-only attribute will result in an error (CUDA_ERROR_INVALID_VALUE)

Note that attributes set using cuFuncSetAttribute() will override the attribute set by this API irrespective of whether the call to cuFuncSetAttribute() is made before or after this API call. However, cuKernelGetAttribute() will always return the attribute value set by this API.

Supported attributes are:

  * CU_FUNC_ATTRIBUTE_MAX_DYNAMIC_SHARED_SIZE_BYTES: This is the maximum size in bytes of dynamically-allocated shared memory. The value should contain the requested maximum size of dynamically-allocated shared memory. The sum of this value and the function attribute CU_FUNC_ATTRIBUTE_SHARED_SIZE_BYTES cannot exceed the device attribute CU_DEVICE_ATTRIBUTE_MAX_SHARED_MEMORY_PER_BLOCK_OPTIN. The maximal size of requestable dynamic shared memory may differ by GPU architecture.

  * CU_FUNC_ATTRIBUTE_PREFERRED_SHARED_MEMORY_CARVEOUT: On devices where the L1 cache and shared memory use the same hardware resources, this sets the shared memory carveout preference, in percent of the total shared memory. See CU_DEVICE_ATTRIBUTE_MAX_SHARED_MEMORY_PER_MULTIPROCESSOR This is only a hint, and the driver can choose a different ratio if required to execute the function.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_WIDTH: The required cluster width in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return CUDA_ERROR_NOT_PERMITTED.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_HEIGHT: The required cluster height in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return CUDA_ERROR_NOT_PERMITTED.

  * CU_FUNC_ATTRIBUTE_REQUIRED_CLUSTER_DEPTH: The required cluster depth in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return CUDA_ERROR_NOT_PERMITTED.

  * CU_FUNC_ATTRIBUTE_NON_PORTABLE_CLUSTER_SIZE_ALLOWED: Indicates whether the function can be launched with non-portable cluster size. 1 is allowed, 0 is disallowed.

  * CU_FUNC_ATTRIBUTE_CLUSTER_SCHEDULING_POLICY_PREFERENCE: The block scheduling policy of a function. The value type is CUclusterSchedulingPolicy.


The API has stricter locking requirements in comparison to its legacy counterpart cuFuncSetAttribute() due to device-wide semantics. If multiple threads are trying to set the same attribute on the same device simultaneously, the attribute setting will depend on the interleavings chosen by the OS scheduler and memory consistency.

CUresult cuKernelSetCacheConfig ( CUkernel kernel, CUfunc_cache config, CUdevice dev )


Sets the preferred cache configuration for a device kernel.

######  Parameters

`kernel`
    \- Kernel to configure cache for
`config`
    \- Requested cache configuration
`dev`
    \- Device to set attribute of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

On devices where the L1 cache and shared memory use the same hardware resources, this sets through `config` the preferred cache configuration for the device kernel `kernel` on the requested device `dev`. This is only a preference. The driver will use the requested configuration if possible, but it is free to choose a different configuration if required to execute `kernel`. Any context-wide preference set via cuCtxSetCacheConfig() will be overridden by this per-kernel setting.

Note that attributes set using cuFuncSetCacheConfig() will override the attribute set by this API irrespective of whether the call to cuFuncSetCacheConfig() is made before or after this API call.

This setting does nothing on devices where the size of the L1 cache and shared memory are fixed.

Launching a kernel with a different preference than the most recent preference setting may insert a device-side synchronization point.

The supported cache configurations are:

  * CU_FUNC_CACHE_PREFER_NONE: no preference for shared memory or L1 (default)

  * CU_FUNC_CACHE_PREFER_SHARED: prefer larger shared memory and smaller L1 cache

  * CU_FUNC_CACHE_PREFER_L1: prefer larger L1 cache and smaller shared memory

  * CU_FUNC_CACHE_PREFER_EQUAL: prefer equal sized L1 cache and shared memory


The API has stricter locking requirements in comparison to its legacy counterpart cuFuncSetCacheConfig() due to device-wide semantics. If multiple threads are trying to set a config on the same device simultaneously, the cache config setting will depend on the interleavings chosen by the OS scheduler and memory consistency.

CUresult cuLibraryEnumerateKernels ( CUkernel* kernels, unsigned int  numKernels, CUlibrary lib )


Retrieve the kernel handles within a library.

######  Parameters

`kernels`
    \- Buffer where the kernel handles are returned to
`numKernels`
    \- Maximum number of kernel handles may be returned to the buffer
`lib`
    \- Library to query from

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `kernels` a maximum number of `numKernels` kernel handles within `lib`. The returned kernel handle becomes invalid when the library is unloaded.

CUresult cuLibraryGetGlobal ( CUdeviceptr* dptr, size_t* bytes, CUlibrary library, const char* name )


Returns a global device pointer.

######  Parameters

`dptr`
    \- Returned global device pointer for the requested context
`bytes`
    \- Returned global size in bytes
`library`
    \- Library to retrieve global from
`name`
    \- Name of global to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Returns in `*dptr` and `*bytes` the base pointer and size of the global with name `name` for the requested library `library` and the current context. If no global for the requested name `name` exists, the call returns CUDA_ERROR_NOT_FOUND. One of the parameters `dptr` or `bytes` (not both) can be NULL in which case it is ignored.

CUresult cuLibraryGetKernel ( CUkernel* pKernel, CUlibrary library, const char* name )


Returns a kernel handle.

######  Parameters

`pKernel`
    \- Returned kernel handle
`library`
    \- Library to retrieve kernel from
`name`
    \- Name of kernel to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND

###### Description

Returns in `pKernel` the handle of the kernel with name `name` located in library `library`. If kernel handle is not found, the call returns CUDA_ERROR_NOT_FOUND.

CUresult cuLibraryGetKernelCount ( unsigned int* count, CUlibrary lib )


Returns the number of kernels within a library.

######  Parameters

`count`
    \- Number of kernels found within the library
`lib`
    \- Library to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `count` the number of kernels in `lib`.

CUresult cuLibraryGetManaged ( CUdeviceptr* dptr, size_t* bytes, CUlibrary library, const char* name )


Returns a pointer to managed memory.

######  Parameters

`dptr`
    \- Returned pointer to the managed memory
`bytes`
    \- Returned memory size in bytes
`library`
    \- Library to retrieve managed memory from
`name`
    \- Name of managed memory to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND

###### Description

Returns in `*dptr` and `*bytes` the base pointer and size of the managed memory with name `name` for the requested library `library`. If no managed memory with the requested name `name` exists, the call returns CUDA_ERROR_NOT_FOUND. One of the parameters `dptr` or `bytes` (not both) can be NULL in which case it is ignored. Note that managed memory for library `library` is shared across devices and is registered when the library is loaded into atleast one context.

CUresult cuLibraryGetModule ( CUmodule* pMod, CUlibrary library )


Returns a module handle.

######  Parameters

`pMod`
    \- Returned module handle
`library`
    \- Library to retrieve module from

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Returns in `pMod` the module handle associated with the current context located in library `library`. If module handle is not found, the call returns CUDA_ERROR_NOT_FOUND.

CUresult cuLibraryGetUnifiedFunction ( void** fptr, CUlibrary library, const char* symbol )


Returns a pointer to a unified function.

######  Parameters

`fptr`
    \- Returned pointer to a unified function
`library`
    \- Library to retrieve function pointer memory from
`symbol`
    \- Name of function pointer to retrieve

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_NOT_FOUND

###### Description

Returns in `*fptr` the function pointer to a unified function denoted by `symbol`. If no unified function with name `symbol` exists, the call returns CUDA_ERROR_NOT_FOUND. If there is no device with attribute CU_DEVICE_ATTRIBUTE_UNIFIED_FUNCTION_POINTERS present in the system, the call may return CUDA_ERROR_NOT_FOUND.

CUresult cuLibraryLoadData ( CUlibrary* library, const void* code, CUjit_option* jitOptions, void** jitOptionsValues, unsigned int  numJitOptions, CUlibraryOption* libraryOptions, void** libraryOptionValues, unsigned int  numLibraryOptions )


Load a library with specified code and options.

######  Parameters

`library`
    \- Returned library
`code`
    \- Code to load
`jitOptions`
    \- Options for JIT
`jitOptionsValues`
    \- Option values for JIT
`numJitOptions`
    \- Number of options
`libraryOptions`
    \- Options for loading
`libraryOptionValues`
    \- Option values for loading
`numLibraryOptions`
    \- Number of options for loading

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_PTX, CUDA_ERROR_UNSUPPORTED_PTX_VERSION, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_NO_BINARY_FOR_GPU, CUDA_ERROR_SHARED_OBJECT_SYMBOL_NOT_FOUND, CUDA_ERROR_SHARED_OBJECT_INIT_FAILED, CUDA_ERROR_JIT_COMPILER_NOT_FOUND, CUDA_ERROR_NOT_SUPPORTED

###### Description

Takes a pointer `code` and loads the corresponding library `library` based on the application defined library loading mode:

  * If module loading is set to EAGER, via the environment variables described in "Module loading", `library` is loaded eagerly into all contexts at the time of the call and future contexts at the time of creation until the library is unloaded with cuLibraryUnload().

  * If the environment variables are set to LAZY, `library` is not immediately loaded onto all existent contexts and will only be loaded when a function is needed for that context, such as a kernel launch.


These environment variables are described in the CUDA programming guide under the "CUDA environment variables" section.

The `code` may be a cubin or fatbin as output by **nvcc** , or a NULL-terminated PTX, either as output by **nvcc** or hand-written, or Tile IR data. A fatbin should also contain relocatable code when doing separate compilation.

Options are passed as an array via `jitOptions` and any corresponding parameters are passed in `jitOptionsValues`. The number of total JIT options is supplied via `numJitOptions`. Any outputs will be returned via `jitOptionsValues`.

Library load options are passed as an array via `libraryOptions` and any corresponding parameters are passed in `libraryOptionValues`. The number of total library load options is supplied via `numLibraryOptions`.

If the library contains managed variables and no device in the system supports managed variables this call is expected to return CUDA_ERROR_NOT_SUPPORTED

CUresult cuLibraryLoadFromFile ( CUlibrary* library, const char* fileName, CUjit_option* jitOptions, void** jitOptionsValues, unsigned int  numJitOptions, CUlibraryOption* libraryOptions, void** libraryOptionValues, unsigned int  numLibraryOptions )


Load a library with specified file and options.

######  Parameters

`library`
    \- Returned library
`fileName`
    \- File to load from
`jitOptions`
    \- Options for JIT
`jitOptionsValues`
    \- Option values for JIT
`numJitOptions`
    \- Number of options
`libraryOptions`
    \- Options for loading
`libraryOptionValues`
    \- Option values for loading
`numLibraryOptions`
    \- Number of options for loading

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_PTX, CUDA_ERROR_UNSUPPORTED_PTX_VERSION, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_NO_BINARY_FOR_GPU, CUDA_ERROR_SHARED_OBJECT_SYMBOL_NOT_FOUND, CUDA_ERROR_SHARED_OBJECT_INIT_FAILED, CUDA_ERROR_JIT_COMPILER_NOT_FOUND, CUDA_ERROR_NOT_SUPPORTED

###### Description

Takes a pointer `code` and loads the corresponding library `library` based on the application defined library loading mode:

  * If module loading is set to EAGER, via the environment variables described in "Module loading", `library` is loaded eagerly into all contexts at the time of the call and future contexts at the time of creation until the library is unloaded with cuLibraryUnload().

  * If the environment variables are set to LAZY, `library` is not immediately loaded onto all existent contexts and will only be loaded when a function is needed for that context, such as a kernel launch.


These environment variables are described in the CUDA programming guide under the "CUDA environment variables" section.

The file should be a cubin file as output by **nvcc** , or a PTX file either as output by **nvcc** or handwritten, or a fatbin file as output by **nvcc** or hand-written, or Tile IR file. A fatbin should also contain relocatable code when doing separate compilation.

Options are passed as an array via `jitOptions` and any corresponding parameters are passed in `jitOptionsValues`. The number of total options is supplied via `numJitOptions`. Any outputs will be returned via `jitOptionsValues`.

Library load options are passed as an array via `libraryOptions` and any corresponding parameters are passed in `libraryOptionValues`. The number of total library load options is supplied via `numLibraryOptions`.

If the library contains managed variables and no device in the system supports managed variables this call is expected to return CUDA_ERROR_NOT_SUPPORTED

CUresult cuLibraryUnload ( CUlibrary library )


Unloads a library.

######  Parameters

`library`
    \- Library to unload

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Unloads the library specified with `library`
