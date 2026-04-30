---
name: driver-device--deprecated
description: '**Source:** group__CUDA__DEVICE__DEPRECATED.html#group__CUDA__DEVICE__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.6. Device Management [DEPRECATED]

**Source:** group__CUDA__DEVICE__DEPRECATED.html#group__CUDA__DEVICE__DEPRECATED


### Functions

CUresult cuDeviceComputeCapability ( int* major, int* minor, CUdevice dev )


Returns the compute capability of the device.

######  Parameters

`major`
    \- Major revision number
`minor`
    \- Minor revision number
`dev`
    \- Device handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Deprecated

This function was deprecated as of CUDA 5.0 and its functionality superseded by cuDeviceGetAttribute().

###### Description

Returns in `*major` and `*minor` the major and minor revision numbers that define the compute capability of the device `dev`.

CUresult cuDeviceGetProperties ( CUdevprop* prop, CUdevice dev )


Returns properties for a selected device.

######  Parameters

`prop`
    \- Returned properties of device
`dev`
    \- Device to get properties for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Deprecated

This function was deprecated as of CUDA 5.0 and replaced by cuDeviceGetAttribute().

###### Description

Returns in `*prop` the properties of device `dev`. The CUdevprop structure is defined as:


    ‎     typedef struct CUdevprop_st {
               int maxThreadsPerBlock;
               int maxThreadsDim[3];
               int maxGridSize[3];
               int sharedMemPerBlock;
               int totalConstantMemory;
               int SIMDWidth;
               int memPitch;
               int regsPerBlock;
               int clockRate;
               int textureAlign
            } CUdevprop;

where:

  * maxThreadsPerBlock is the maximum number of threads per block;

  * maxThreadsDim[3] is the maximum sizes of each dimension of a block;

  * maxGridSize[3] is the maximum sizes of each dimension of a grid;

  * sharedMemPerBlock is the total amount of shared memory available per block in bytes;

  * totalConstantMemory is the total amount of constant memory available on the device in bytes;

  * SIMDWidth is the warp size;

  * memPitch is the maximum pitch allowed by the memory copy functions that involve memory regions allocated through cuMemAllocPitch();

  * regsPerBlock is the total number of registers available per block;

  * clockRate is the clock frequency in kilohertz;

  * textureAlign is the alignment requirement; texture base addresses that are aligned to textureAlign bytes do not need an offset applied to texture fetches.


