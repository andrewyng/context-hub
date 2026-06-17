---
name: runtime-driver--entry--point
description: '**Source:** group__CUDART__DRIVER__ENTRY__POINT.html#group__CUDART__DRIVER__ENTRY__POINT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.31. Driver Entry Point Access

**Source:** group__CUDART__DRIVER__ENTRY__POINT.html#group__CUDART__DRIVER__ENTRY__POINT


### Functions

__host__ cudaError_t cudaGetDriverEntryPoint ( const char* symbol, void** funcPtr, unsigned long long flags, cudaDriverEntryPointQueryResult ** driverStatus = NULL )


Returns the requested driver API function pointer.

######  Parameters

`symbol`
    \- The base name of the driver API function to look for. As an example, for the driver API cuMemAlloc_v2, `symbol` would be cuMemAlloc. Note that the API will use the CUDA runtime version to return the address to the most recent ABI compatible driver symbol, cuMemAlloc or cuMemAlloc_v2.
`funcPtr`
    \- Location to return the function pointer to the requested driver function
`flags`
    \- Flags to specify search options.
`driverStatus`
    \- Optional location to store the status of finding the symbol from the driver. See cudaDriverEntryPointQueryResult for possible values.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported

###### Deprecated

This function is deprecated as of CUDA 13.0

###### Description

Returns in `**funcPtr` the address of the CUDA driver function for the requested flags.

For a requested driver symbol, if the CUDA version in which the driver symbol was introduced is less than or equal to the CUDA runtime version, the API will return the function pointer to the corresponding versioned driver function.

The pointer returned by the API should be cast to a function pointer matching the requested driver function's definition in the API header file. The function pointer typedef can be picked up from the corresponding typedefs header file. For example, cudaTypedefs.h consists of function pointer typedefs for driver APIs defined in cuda.h.

The API will return cudaSuccess and set the returned `funcPtr` if the requested driver function is valid and supported on the platform.

The API will return cudaSuccess and set the returned `funcPtr` to NULL if the requested driver function is not supported on the platform, no ABI compatible driver function exists for the CUDA runtime version or if the driver symbol is invalid.

It will also set the optional `driverStatus` to one of the values in cudaDriverEntryPointQueryResult with the following meanings:

  * cudaDriverEntryPointSuccess \- The requested symbol was succesfully found based on input arguments and `pfn` is valid

  * cudaDriverEntryPointSymbolNotFound \- The requested symbol was not found

  * cudaDriverEntryPointVersionNotSufficent \- The requested symbol was found but is not supported by the current runtime version (CUDART_VERSION)


The requested flags can be:

  * cudaEnableDefault: This is the default mode. This is equivalent to cudaEnablePerThreadDefaultStream if the code is compiled with --default-stream per-thread compilation flag or the macro CUDA_API_PER_THREAD_DEFAULT_STREAM is defined; cudaEnableLegacyStream otherwise.

  * cudaEnableLegacyStream: This will enable the search for all driver symbols that match the requested driver symbol name except the corresponding per-thread versions.

  * cudaEnablePerThreadDefaultStream: This will enable the search for all driver symbols that match the requested driver symbol name including the per-thread versions. If a per-thread version is not found, the API will return the legacy version of the driver function.


This API is deprecated and cudaGetDriverEntryPointByVersion (with a hardcoded cudaVersion) should be used instead.

  * Version mixing among CUDA-defined types and driver API versions is strongly discouraged and doing so can result in an undefined behavior. More here.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cuGetProcAddress

__host__ cudaError_t cudaGetDriverEntryPointByVersion ( const char* symbol, void** funcPtr, unsigned int  cudaVersion, unsigned long long flags, cudaDriverEntryPointQueryResult ** driverStatus = NULL )


Returns the requested driver API function pointer by CUDA version.

######  Parameters

`symbol`
    \- The base name of the driver API function to look for. As an example, for the driver API cuMemAlloc_v2, `symbol` would be cuMemAlloc.
`funcPtr`
    \- Location to return the function pointer to the requested driver function
`cudaVersion`
    \- The CUDA version to look for the requested driver symbol
`flags`
    \- Flags to specify search options.
`driverStatus`
    \- Optional location to store the status of finding the symbol from the driver. See cudaDriverEntryPointQueryResult for possible values.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported

###### Description

Returns in `**funcPtr` the address of the CUDA driver function for the requested flags and CUDA driver version.

The CUDA version is specified as (1000 * major + 10 * minor), so CUDA 11.2 should be specified as 11020. For a requested driver symbol, if the specified CUDA version is greater than or equal to the CUDA version in which the driver symbol was introduced, this API will return the function pointer to the corresponding versioned function. If the specified CUDA version is greater than the driver version, the API will return cudaErrorInvalidValue.

The pointer returned by the API should be cast to a function pointer matching the requested driver function's definition in the API header file. The function pointer typedef can be picked up from the corresponding typedefs header file. For example, cudaTypedefs.h consists of function pointer typedefs for driver APIs defined in cuda.h.

For the case where the CUDA version requested is greater than the CUDA Toolkit installed, there may not be an appropriate function pointer typedef in the corresponding header file and may need a custom typedef to match the driver function signature returned. This can be done by getting the typedefs from a later toolkit or creating appropriately matching custom function typedefs.

The API will return cudaSuccess and set the returned `funcPtr` if the requested driver function is valid and supported on the platform.

The API will return cudaSuccess and set the returned `funcPtr` to NULL if the requested driver function is not supported on the platform, no ABI compatible driver function exists for the requested version or if the driver symbol is invalid.

It will also set the optional `driverStatus` to one of the values in cudaDriverEntryPointQueryResult with the following meanings:

  * cudaDriverEntryPointSuccess \- The requested symbol was succesfully found based on input arguments and `pfn` is valid

  * cudaDriverEntryPointSymbolNotFound \- The requested symbol was not found

  * cudaDriverEntryPointVersionNotSufficent \- The requested symbol was found but is not supported by the specified version `cudaVersion`


The requested flags can be:

  * cudaEnableDefault: This is the default mode. This is equivalent to cudaEnablePerThreadDefaultStream if the code is compiled with --default-stream per-thread compilation flag or the macro CUDA_API_PER_THREAD_DEFAULT_STREAM is defined; cudaEnableLegacyStream otherwise.

  * cudaEnableLegacyStream: This will enable the search for all driver symbols that match the requested driver symbol name except the corresponding per-thread versions.

  * cudaEnablePerThreadDefaultStream: This will enable the search for all driver symbols that match the requested driver symbol name including the per-thread versions. If a per-thread version is not found, the API will return the legacy version of the driver function.


  * Version mixing among CUDA-defined types and driver API versions is strongly discouraged and doing so can result in an undefined behavior. More here.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cuGetProcAddress

* * *

!


Copyright © 2025 NVIDIA Corporation