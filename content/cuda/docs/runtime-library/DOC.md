---
name: runtime-library
description: '**Source:** group__CUDART__LIBRARY.html#group__CUDART__LIBRARY'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.32. Library Management

**Source:** group__CUDART__LIBRARY.html#group__CUDART__LIBRARY


### Functions

__host__ cudaError_t cudaKernelSetAttributeForDevice ( cudaKernel_t kernel, cudaFuncAttribute attr, int  value, int  device )


Sets information about a kernel.

######  Parameters

`kernel`
    \- Kernel to set attribute of
`attr`
    \- Attribute requested
`value`
    \- Value to set
`device`
    \- Device to set attribute of

###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue

###### Description

This call sets the value of a specified attribute `attr` on the kernel `kernel` for the requested device `device` to an integer value specified by `value`. This function returns cudaSuccess if the new value of the attribute could be successfully set. If the set fails, this call will return an error. Not all attributes can have values set. Attempting to set a value on a read-only attribute will result in an error (cudaErrorInvalidValue)

Note that attributes set using cudaFuncSetAttribute() will override the attribute set by this API irrespective of whether the call to cudaFuncSetAttribute() is made before or after this API call. Because of this and the stricter locking requirements mentioned below it is suggested that this call be used during the initialization path and not on each thread accessing `kernel` such as on kernel launches or on the critical path.

Valid values for `attr` are:

  * cudaFuncAttributeMaxDynamicSharedMemorySize \- The requested maximum size in bytes of dynamically-allocated shared memory. The sum of this value and the function attribute sharedSizeBytes cannot exceed the device attribute cudaDevAttrMaxSharedMemoryPerBlockOptin. The maximal size of requestable dynamic shared memory may differ by GPU architecture.

  * cudaFuncAttributePreferredSharedMemoryCarveout \- On devices where the L1 cache and shared memory use the same hardware resources, this sets the shared memory carveout preference, in percent of the total shared memory. See cudaDevAttrMaxSharedMemoryPerMultiprocessor. This is only a hint, and the driver can choose a different ratio if required to execute the function.

  * cudaFuncAttributeRequiredClusterWidth: The required cluster width in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return cudaErrorNotPermitted.

  * cudaFuncAttributeRequiredClusterHeight: The required cluster height in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return cudaErrorNotPermitted.

  * cudaFuncAttributeRequiredClusterDepth: The required cluster depth in blocks. The width, height, and depth values must either all be 0 or all be positive. The validity of the cluster dimensions is checked at launch time. If the value is set during compile time, it cannot be set at runtime. Setting it at runtime will return cudaErrorNotPermitted.

  * cudaFuncAttributeNonPortableClusterSizeAllowed: Indicates whether the function can be launched with non-portable cluster size. 1 is allowed, 0 is disallowed.

  * cudaFuncAttributeClusterSchedulingPolicyPreference: The block scheduling policy of a function. The value type is cudaClusterSchedulingPolicy.


The API has stricter locking requirements in comparison to its legacy counterpart cudaFuncSetAttribute() due to device-wide semantics. If multiple threads are trying to set the same attribute on the same device simultaneously, the attribute setting will depend on the interleavings chosen by the OS scheduler and memory consistency.

**See also:**

cudaLibraryLoadData, cudaLibraryLoadFromFile, cudaLibraryUnload, cudaLibraryGetKernel, cudaLaunchKernel, cudaFuncSetAttribute, cuKernelSetAttribute

__host__ cudaError_t cudaLibraryEnumerateKernels ( cudaKernel_t* kernels, unsigned int  numKernels, cudaLibrary_t lib )


Retrieve the kernel handles within a library.

######  Parameters

`kernels`
    \- Buffer where the kernel handles are returned to
`numKernels`
    \- Maximum number of kernel handles may be returned to the buffer
`lib`
    \- Library to query from

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Returns in `kernels` a maximum number of `numKernels` kernel handles within `lib`. The returned kernel handle becomes invalid when the library is unloaded.

**See also:**

cudaLibraryGetKernelCount, cuLibraryEnumerateKernels

__host__ cudaError_t cudaLibraryGetGlobal ( void** dptr, size_t* bytes, cudaLibrary_t library, const char* name )


Returns a global device pointer.

######  Parameters

`dptr`
    \- Returned global device pointer for the requested library
`bytes`
    \- Returned global size in bytes
`library`
    \- Library to retrieve global from
`name`
    \- Name of global to retrieve

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorSymbolNotFoundcudaErrorDeviceUninitialized, cudaErrorContextIsDestroyed

###### Description

Returns in `*dptr` and `*bytes` the base pointer and size of the global with name `name` for the requested library `library` and the current device. If no global for the requested name `name` exists, the call returns cudaErrorSymbolNotFound. One of the parameters `dptr` or `bytes` (not both) can be NULL in which case it is ignored. The returned `dptr` cannot be passed to the Symbol APIs such as cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaGetSymbolAddress, or cudaGetSymbolSize.

**See also:**

cudaLibraryLoadData, cudaLibraryLoadFromFile, cudaLibraryUnload, cudaLibraryGetManaged, cuLibraryGetGlobal

__host__ cudaError_t cudaLibraryGetKernel ( cudaKernel_t* pKernel, cudaLibrary_t library, const char* name )


Returns a kernel handle.

######  Parameters

`pKernel`
    \- Returned kernel handle
`library`
    \- Library to retrieve kernel from
`name`
    \- Name of kernel to retrieve

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorSymbolNotFound

###### Description

Returns in `pKernel` the handle of the kernel with name `name` located in library `library`. If kernel handle is not found, the call returns cudaErrorSymbolNotFound.

**See also:**

cudaLibraryLoadData, cudaLibraryLoadFromFile, cudaLibraryUnload, cuLibraryGetKernel

__host__ cudaError_t cudaLibraryGetKernelCount ( unsigned int* count, cudaLibrary_t lib )


Returns the number of kernels within a library.

######  Parameters

`count`
    \- Number of kernels found within the library
`lib`
    \- Library to query

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Returns in `count` the number of kernels in `lib`.

**See also:**

cudaLibraryEnumerateKernels, cudaLibraryLoadFromFile, cudaLibraryLoadData, cuLibraryGetKernelCount

__host__ cudaError_t cudaLibraryGetManaged ( void** dptr, size_t* bytes, cudaLibrary_t library, const char* name )


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

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorSymbolNotFound

###### Description

Returns in `*dptr` and `*bytes` the base pointer and size of the managed memory with name `name` for the requested library `library`. If no managed memory with the requested name `name` exists, the call returns cudaErrorSymbolNotFound. One of the parameters `dptr` or `bytes` (not both) can be NULL in which case it is ignored. Note that managed memory for library `library` is shared across devices and is registered when the library is loaded. The returned `dptr` cannot be passed to the Symbol APIs such as cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaGetSymbolAddress, or cudaGetSymbolSize.

**See also:**

cudaLibraryLoadData, cudaLibraryLoadFromFile, cudaLibraryUnload, cudaLibraryGetGlobal, cuLibraryGetManaged

__host__ cudaError_t cudaLibraryGetUnifiedFunction ( void** fptr, cudaLibrary_t library, const char* symbol )


Returns a pointer to a unified function.

######  Parameters

`fptr`
    \- Returned pointer to a unified function
`library`
    \- Library to retrieve function pointer memory from
`symbol`
    \- Name of function pointer to retrieve

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorSymbolNotFound

###### Description

Returns in `*fptr` the function pointer to a unified function denoted by `symbol`. If no unified function with name `symbol` exists, the call returns cudaErrorSymbolNotFound. If there is no device with attribute cudaDeviceProp::unifiedFunctionPointers present in the system, the call may return cudaErrorSymbolNotFound.

**See also:**

cudaLibraryLoadData, cudaLibraryLoadFromFile, cudaLibraryUnload, cuLibraryGetUnifiedFunction

__host__ cudaError_t cudaLibraryLoadData ( cudaLibrary_t* library, const void* code, cudaJitOption ** jitOptions, void** jitOptionsValues, unsigned int  numJitOptions, cudaLibraryOption ** libraryOptions, void** libraryOptionValues, unsigned int  numLibraryOptions )


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

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation, cudaErrorInitializationError, cudaErrorCudartUnloading, cudaErrorInvalidPtx, cudaErrorUnsupportedPtxVersion, cudaErrorNoKernelImageForDevice, cudaErrorSharedObjectSymbolNotFound, cudaErrorSharedObjectInitFailed, cudaErrorJitCompilerNotFound

###### Description

Takes a pointer `code` and loads the corresponding library `library` based on the application defined library loading mode:

  * If module loading is set to EAGER, via the environment variables described in "Module loading", `library` is loaded eagerly into all contexts at the time of the call and future contexts at the time of creation until the library is unloaded with cudaLibraryUnload().

  * If the environment variables are set to LAZY, `library` is not immediately loaded onto all existent contexts and will only be loaded when a function is needed for that context, such as a kernel launch.


These environment variables are described in the CUDA programming guide under the "CUDA environment variables" section.

The `code` may be a cubin or fatbin as output by **nvcc** , or a NULL-terminated PTX, either as output by **nvcc** or hand-written, or Tile IR data. A fatbin should also contain relocatable code when doing separate compilation. Please also see the documentation for nvrtc (<https://docs.nvidia.com/cuda/nvrtc/index.html>), nvjitlink (<https://docs.nvidia.com/cuda/nvjitlink/index.html>), and nvfatbin (<https://docs.nvidia.com/cuda/nvfatbin/index.html>) for more information on generating loadable code at runtime.

Options are passed as an array via `jitOptions` and any corresponding parameters are passed in `jitOptionsValues`. The number of total JIT options is supplied via `numJitOptions`. Any outputs will be returned via `jitOptionsValues`.

Library load options are passed as an array via `libraryOptions` and any corresponding parameters are passed in `libraryOptionValues`. The number of total library load options is supplied via `numLibraryOptions`.

**See also:**

cudaLibraryLoadFromFile, cudaLibraryUnload, cuLibraryLoadData

__host__ cudaError_t cudaLibraryLoadFromFile ( cudaLibrary_t* library, const char* fileName, cudaJitOption ** jitOptions, void** jitOptionsValues, unsigned int  numJitOptions, cudaLibraryOption ** libraryOptions, void** libraryOptionValues, unsigned int  numLibraryOptions )


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

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation, cudaErrorInitializationError, cudaErrorCudartUnloading, cudaErrorInvalidPtx, cudaErrorUnsupportedPtxVersion, cudaErrorNoKernelImageForDevice, cudaErrorSharedObjectSymbolNotFound, cudaErrorSharedObjectInitFailed, cudaErrorJitCompilerNotFound

###### Description

Takes a pointer `code` and loads the corresponding library `library` based on the application defined library loading mode:

  * If module loading is set to EAGER, via the environment variables described in "Module loading", `library` is loaded eagerly into all contexts at the time of the call and future contexts at the time of creation until the library is unloaded with cudaLibraryUnload().

  * If the environment variables are set to LAZY, `library` is not immediately loaded onto all existent contexts and will only be loaded when a function is needed for that context, such as a kernel launch.


These environment variables are described in the CUDA programming guide under the "CUDA environment variables" section.

The file should be a cubin file as output by **nvcc** , or a PTX file either as output by **nvcc** or handwritten, or a fatbin file as output by **nvcc** or hand-written, or Tile IR file. A fatbin should also contain relocatable code when doing separate compilation. Please also see the documentation for nvrtc (<https://docs.nvidia.com/cuda/nvrtc/index.html>), nvjitlink (<https://docs.nvidia.com/cuda/nvjitlink/index.html>), and nvfatbin (<https://docs.nvidia.com/cuda/nvfatbin/index.html>) for more information on generating loadable code at runtime.

Options are passed as an array via `jitOptions` and any corresponding parameters are passed in `jitOptionsValues`. The number of total options is supplied via `numJitOptions`. Any outputs will be returned via `jitOptionsValues`.

Library load options are passed as an array via `libraryOptions` and any corresponding parameters are passed in `libraryOptionValues`. The number of total library load options is supplied via `numLibraryOptions`.

**See also:**

cudaLibraryLoadData, cudaLibraryUnload, cuLibraryLoadFromFile

__host__ cudaError_t cudaLibraryUnload ( cudaLibrary_t library )


Unloads a library.

######  Parameters

`library`
    \- Library to unload

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorInvalidValue

###### Description

Unloads the library specified with `library`

**See also:**

cudaLibraryLoadData, cudaLibraryLoadFromFile, cuLibraryUnload

* * *

!


Copyright © 2025 NVIDIA Corporation