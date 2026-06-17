---
name: runtime---version
description: '**Source:** group__CUDART____VERSION.html#group__CUDART____VERSION'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.28. Version Management

**Source:** group__CUDART____VERSION.html#group__CUDART____VERSION


### Functions

__host__ cudaError_t cudaDriverGetVersion ( int* driverVersion )


Returns the latest version of CUDA supported by the driver.

######  Parameters

`driverVersion`
    \- Returns the CUDA driver version.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns in `*driverVersion` the latest version of CUDA supported by the driver. The version is returned as (1000 major + 10 minor). For example, CUDA 9.2 would be represented by 9020. If no driver is installed, then 0 is returned as the driver version.

This function automatically returns cudaErrorInvalidValue if `driverVersion` is NULL.


**See also:**

cudaRuntimeGetVersion, cuDriverGetVersion

__host__  __device__ cudaError_t cudaRuntimeGetVersion ( int* runtimeVersion )


Returns the CUDA Runtime version.

######  Parameters

`runtimeVersion`
    \- Returns the CUDA Runtime version.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns in `*runtimeVersion` the version number of the current CUDA Runtime instance. The version is returned as (1000 major + 10 minor). For example, CUDA 9.2 would be represented by 9020.

As of CUDA 12.0, this function no longer initializes CUDA. The purpose of this API is solely to return a compile-time constant stating the CUDA Toolkit version in the above format.

This function automatically returns cudaErrorInvalidValue if the `runtimeVersion` argument is NULL.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaDriverGetVersion, cuDriverGetVersion

* * *

!


Copyright © 2025 NVIDIA Corporation