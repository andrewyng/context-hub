---
name: runtime-occupancy
description: '**Source:** group__CUDART__OCCUPANCY.html#group__CUDART__OCCUPANCY'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.9. Occupancy

**Source:** group__CUDART__OCCUPANCY.html#group__CUDART__OCCUPANCY


### Functions

__host__ cudaError_t cudaOccupancyAvailableDynamicSMemPerBlock ( size_t* dynamicSmemSize, const void* func, int  numBlocks, int  blockSize )


Returns dynamic shared memory available per block when launching `numBlocks` blocks on SM.

######  Parameters

`dynamicSmemSize`
    \- Returned maximum dynamic shared memory
`func`
    \- Kernel function for which occupancy is calculated
`numBlocks`
    \- Number of blocks to fit on SM
`blockSize`
    \- Size of the block

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Returns in `*dynamicSmemSize` the maximum size of dynamic shared memory to allow `numBlocks` blocks per SM.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaOccupancyMaxActiveBlocksPerMultiprocessorWithFlags, cudaOccupancyMaxPotentialBlockSize ( C++ API), cudaOccupancyMaxPotentialBlockSizeWithFlags ( C++ API), cudaOccupancyMaxPotentialBlockSizeVariableSMem ( C++ API), cudaOccupancyMaxPotentialBlockSizeVariableSMemWithFlags ( C++ API), cudaOccupancyAvailableDynamicSMemPerBlock

__host__  __device__ cudaError_t cudaOccupancyMaxActiveBlocksPerMultiprocessor ( int* numBlocks, const void* func, int  blockSize, size_t dynamicSMemSize )


Returns occupancy for a device function.

######  Parameters

`numBlocks`
    \- Returned occupancy
`func`
    \- Kernel function for which occupancy is calculated
`blockSize`
    \- Block size the kernel is intended to be launched with
`dynamicSMemSize`
    \- Per-block dynamic shared memory usage intended, in bytes

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Returns in `*numBlocks` the maximum number of active blocks per streaming multiprocessor for the device function.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaOccupancyMaxActiveBlocksPerMultiprocessorWithFlags, cudaOccupancyMaxPotentialBlockSize ( C++ API), cudaOccupancyMaxPotentialBlockSizeWithFlags ( C++ API), cudaOccupancyMaxPotentialBlockSizeVariableSMem ( C++ API), cudaOccupancyMaxPotentialBlockSizeVariableSMemWithFlags ( C++ API), cudaOccupancyAvailableDynamicSMemPerBlock (C++ API), cuOccupancyMaxActiveBlocksPerMultiprocessor

__host__ cudaError_t cudaOccupancyMaxActiveBlocksPerMultiprocessorWithFlags ( int* numBlocks, const void* func, int  blockSize, size_t dynamicSMemSize, unsigned int  flags )


Returns occupancy for a device function with the specified flags.

######  Parameters

`numBlocks`
    \- Returned occupancy
`func`
    \- Kernel function for which occupancy is calculated
`blockSize`
    \- Block size the kernel is intended to be launched with
`dynamicSMemSize`
    \- Per-block dynamic shared memory usage intended, in bytes
`flags`
    \- Requested behavior for the occupancy calculator

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

Returns in `*numBlocks` the maximum number of active blocks per streaming multiprocessor for the device function.

The `flags` parameter controls how special cases are handled. Valid flags include:

  * cudaOccupancyDefault: keeps the default behavior as cudaOccupancyMaxActiveBlocksPerMultiprocessor


  * cudaOccupancyDisableCachingOverride: This flag suppresses the default behavior on platform where global caching affects occupancy. On such platforms, if caching is enabled, but per-block SM resource usage would result in zero occupancy, the occupancy calculator will calculate the occupancy as if caching is disabled. Setting this flag makes the occupancy calculator to return 0 in such cases. More information can be found about this feature in the "Unified L1/Texture Cache" section of the Maxwell tuning guide.


  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaOccupancyMaxActiveBlocksPerMultiprocessor, cudaOccupancyMaxPotentialBlockSize ( C++ API), cudaOccupancyMaxPotentialBlockSizeWithFlags ( C++ API), cudaOccupancyMaxPotentialBlockSizeVariableSMem ( C++ API), cudaOccupancyMaxPotentialBlockSizeVariableSMemWithFlags ( C++ API), cudaOccupancyAvailableDynamicSMemPerBlock (C++ API), cuOccupancyMaxActiveBlocksPerMultiprocessorWithFlags

__host__ cudaError_t cudaOccupancyMaxActiveClusters ( int* numClusters, const void* func, const cudaLaunchConfig_t* launchConfig )


Given the kernel function (`func`) and launch configuration (`config`), return the maximum number of clusters that could co-exist on the target device in `*numClusters`.

######  Parameters

`numClusters`
    \- Returned maximum number of clusters that could co-exist on the target device
`func`
    \- Kernel function for which maximum number of clusters are calculated
`launchConfig`


###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue, cudaErrorInvalidClusterSize, cudaErrorUnknown

###### Description

If the function has required cluster size already set (see cudaFuncGetAttributes), the cluster size from config must either be unspecified or match the required size. Without required sizes, the cluster size must be specified in config, else the function will return an error.

Note that various attributes of the kernel function may affect occupancy calculation. Runtime environment may affect how the hardware schedules the clusters, so the calculated occupancy is not guaranteed to be achievable.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaFuncGetAttributes cudaOccupancyMaxActiveClusters (C++ API), cuOccupancyMaxActiveClusters

__host__ cudaError_t cudaOccupancyMaxPotentialClusterSize ( int* clusterSize, const void* func, const cudaLaunchConfig_t* launchConfig )


Given the kernel function (`func`) and launch configuration (`config`), return the maximum cluster size in `*clusterSize`.

######  Parameters

`clusterSize`
    \- Returned maximum cluster size that can be launched for the given kernel function and launch configuration
`func`
    \- Kernel function for which maximum cluster size is calculated
`launchConfig`


###### Returns

cudaSuccess, cudaErrorInvalidDeviceFunction, cudaErrorInvalidValue, cudaErrorUnknown

###### Description

The cluster dimensions in `config` are ignored. If func has a required cluster size set (see cudaFuncGetAttributes),`*clusterSize` will reflect the required cluster size.

By default this function will always return a value that's portable on future hardware. A higher value may be returned if the kernel function allows non-portable cluster sizes.

This function will respect the compile time launch bounds.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaFuncGetAttributes cudaOccupancyMaxPotentialClusterSize (C++ API), cuOccupancyMaxPotentialClusterSize

* * *

!


Copyright © 2025 NVIDIA Corporation