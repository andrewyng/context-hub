---
name: driver-version
description: '**Source:** group__CUDA__VERSION.html#group__CUDA__VERSION'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.4. Version Management

**Source:** group__CUDA__VERSION.html#group__CUDA__VERSION


### Functions

CUresult cuDriverGetVersion ( int* driverVersion )


Returns the latest CUDA version supported by driver.

######  Parameters

`driverVersion`
    \- Returns the CUDA driver version

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*driverVersion` the version of CUDA supported by the driver. The version is returned as (1000 * major + 10 * minor). For example, CUDA 9.2 would be represented by 9020.

This function automatically returns CUDA_ERROR_INVALID_VALUE if `driverVersion` is NULL.


