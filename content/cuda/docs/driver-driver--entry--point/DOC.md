---
name: driver-driver--entry--point
description: '**Source:** group__CUDA__DRIVER__ENTRY__POINT.html#group__CUDA__DRIVER__ENTRY__POINT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.33. Driver Entry Point Access

**Source:** group__CUDA__DRIVER__ENTRY__POINT.html#group__CUDA__DRIVER__ENTRY__POINT


### Functions

CUresult cuGetProcAddress ( const char* symbol, void** pfn, int  cudaVersion, cuuint64_t flags, CUdriverProcAddressQueryResult* symbolStatus )


Returns the requested driver API function pointer.

######  Parameters

`symbol`
    \- The base name of the driver API function to look for. As an example, for the driver API cuMemAlloc_v2, `symbol` would be cuMemAlloc and `cudaVersion` would be the ABI compatible CUDA version for the _v2 variant.
`pfn`
    \- Location to return the function pointer to the requested driver function
`cudaVersion`
    \- The CUDA version to look for the requested driver symbol
`flags`
    \- Flags to specify search options.
`symbolStatus`
    \- Optional location to store the status of the search for `symbol` based on `cudaVersion`. See CUdriverProcAddressQueryResult for possible values.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Returns in `**pfn` the address of the CUDA driver function for the requested CUDA version and flags.

The CUDA version is specified as (1000 * major + 10 * minor), so CUDA 11.2 should be specified as 11020. For a requested driver symbol, if the specified CUDA version is greater than or equal to the CUDA version in which the driver symbol was introduced, this API will return the function pointer to the corresponding versioned function. If the specified CUDA version is greater than the driver version, the API will return CUDA_ERROR_INVALID_VALUE.

The pointer returned by the API should be cast to a function pointer matching the requested driver function's definition in the API header file. The function pointer typedef can be picked up from the corresponding typedefs header file. For example, cudaTypedefs.h consists of function pointer typedefs for driver APIs defined in cuda.h.

The API will return CUDA_SUCCESS and set the returned `pfn` to NULL if the requested driver function is not supported on the platform, no ABI compatible driver function exists for the specified `cudaVersion` or if the driver symbol is invalid.

It will also set the optional `symbolStatus` to one of the values in CUdriverProcAddressQueryResult with the following meanings:

  * CU_GET_PROC_ADDRESS_SUCCESS \- The requested symbol was succesfully found based on input arguments and `pfn` is valid

  * CU_GET_PROC_ADDRESS_SYMBOL_NOT_FOUND \- The requested symbol was not found

  * CU_GET_PROC_ADDRESS_VERSION_NOT_SUFFICIENT \- The requested symbol was found but is not supported by cudaVersion specified


The requested flags can be:

  * CU_GET_PROC_ADDRESS_DEFAULT: This is the default mode. This is equivalent to CU_GET_PROC_ADDRESS_PER_THREAD_DEFAULT_STREAM if the code is compiled with --default-stream per-thread compilation flag or the macro CUDA_API_PER_THREAD_DEFAULT_STREAM is defined; CU_GET_PROC_ADDRESS_LEGACY_STREAM otherwise.

  * CU_GET_PROC_ADDRESS_LEGACY_STREAM: This will enable the search for all driver symbols that match the requested driver symbol name except the corresponding per-thread versions.

  * CU_GET_PROC_ADDRESS_PER_THREAD_DEFAULT_STREAM: This will enable the search for all driver symbols that match the requested driver symbol name including the per-thread versions. If a per-thread version is not found, the API will return the legacy version of the driver function.


Version mixing among CUDA-defined types and driver API versions is strongly discouraged and doing so can result in an undefined behavior. More here.
