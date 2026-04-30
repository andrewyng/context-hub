---
name: driver-occupancy
description: '**Source:** group__CUDA__OCCUPANCY.html#group__CUDA__OCCUPANCY'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.25. Occupancy

**Source:** group__CUDA__OCCUPANCY.html#group__CUDA__OCCUPANCY


### Functions

CUresult cuOccupancyAvailableDynamicSMemPerBlock ( size_t* dynamicSmemSize, CUfunction func, int  numBlocks, int  blockSize )


Returns dynamic shared memory available per block when launching `numBlocks` blocks on SM.

######  Parameters

`dynamicSmemSize`
    \- Returned maximum dynamic shared memory
`func`
    \- Kernel function for which occupancy is calculated
`numBlocks`
    \- Number of blocks to fit on SM
`blockSize`
    \- Size of the blocks

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

Returns in `*dynamicSmemSize` the maximum size of dynamic shared memory to allow `numBlocks` blocks per SM.

Note that the API can also be used with context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will be the current context.



CUresult cuOccupancyMaxActiveBlocksPerMultiprocessor ( int* numBlocks, CUfunction func, int  blockSize, size_t dynamicSMemSize )


Returns occupancy of a function.

######  Parameters

`numBlocks`
    \- Returned occupancy
`func`
    \- Kernel for which occupancy is calculated
`blockSize`
    \- Block size the kernel is intended to be launched with
`dynamicSMemSize`
    \- Per-block dynamic shared memory usage intended, in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

Returns in `*numBlocks` the number of the maximum active blocks per streaming multiprocessor.

Note that the API can also be used with context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will be the current context.

CUresult cuOccupancyMaxActiveBlocksPerMultiprocessorWithFlags ( int* numBlocks, CUfunction func, int  blockSize, size_t dynamicSMemSize, unsigned int  flags )


Returns occupancy of a function.

######  Parameters

`numBlocks`
    \- Returned occupancy
`func`
    \- Kernel for which occupancy is calculated
`blockSize`
    \- Block size the kernel is intended to be launched with
`dynamicSMemSize`
    \- Per-block dynamic shared memory usage intended, in bytes
`flags`
    \- Requested behavior for the occupancy calculator

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

Returns in `*numBlocks` the number of the maximum active blocks per streaming multiprocessor.

The `Flags` parameter controls how special cases are handled. The valid flags are:

  * CU_OCCUPANCY_DEFAULT, which maintains the default behavior as cuOccupancyMaxActiveBlocksPerMultiprocessor;


  * CU_OCCUPANCY_DISABLE_CACHING_OVERRIDE, which suppresses the default behavior on platform where global caching affects occupancy. On such platforms, if caching is enabled, but per-block SM resource usage would result in zero occupancy, the occupancy calculator will calculate the occupancy as if caching is disabled. Setting CU_OCCUPANCY_DISABLE_CACHING_OVERRIDE makes the occupancy calculator to return 0 in such cases. More information can be found about this feature in the "Unified L1/Texture Cache" section of the Maxwell tuning guide.


Note that the API can also be with launch context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will be the current context.

CUresult cuOccupancyMaxActiveClusters ( int* numClusters, CUfunction func, const CUlaunchConfig* config )


Given the kernel function (`func`) and launch configuration (`config`), return the maximum number of clusters that could co-exist on the target device in `*numClusters`.

######  Parameters

`numClusters`
    \- Returned maximum number of clusters that could co-exist on the target device
`func`
    \- Kernel function for which maximum number of clusters are calculated
`config`
    \- Launch configuration for the given kernel function

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_CLUSTER_SIZE, CUDA_ERROR_UNKNOWN

###### Description

If the function has required cluster size already set (see cudaFuncGetAttributes / cuFuncGetAttribute), the cluster size from config must either be unspecified or match the required size. Without required sizes, the cluster size must be specified in config, else the function will return an error.

Note that various attributes of the kernel function may affect occupancy calculation. Runtime environment may affect how the hardware schedules the clusters, so the calculated occupancy is not guaranteed to be achievable.

Note that the API can also be used with context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will either be taken from the specified stream `config->hStream` or the current context in case of NULL stream.

CUresult cuOccupancyMaxPotentialBlockSize ( int* minGridSize, int* blockSize, CUfunction func, CUoccupancyB2DSize blockSizeToDynamicSMemSize, size_t dynamicSMemSize, int  blockSizeLimit )


Suggest a launch configuration with reasonable occupancy.

######  Parameters

`minGridSize`
    \- Returned minimum grid size needed to achieve the maximum occupancy
`blockSize`
    \- Returned maximum block size that can achieve the maximum occupancy
`func`
    \- Kernel for which launch configuration is calculated
`blockSizeToDynamicSMemSize`
    \- A function that calculates how much per-block dynamic shared memory `func` uses based on the block size
`dynamicSMemSize`
    \- Dynamic shared memory usage intended, in bytes
`blockSizeLimit`
    \- The maximum block size `func` is designed to handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

Returns in `*blockSize` a reasonable block size that can achieve the maximum occupancy (or, the maximum number of active warps with the fewest blocks per multiprocessor), and in `*minGridSize` the minimum grid size to achieve the maximum occupancy.

If `blockSizeLimit` is 0, the configurator will use the maximum block size permitted by the device / function instead.

If per-block dynamic shared memory allocation is not needed, the user should leave both `blockSizeToDynamicSMemSize` and `dynamicSMemSize` as 0.

If per-block dynamic shared memory allocation is needed, then if the dynamic shared memory size is constant regardless of block size, the size should be passed through `dynamicSMemSize`, and `blockSizeToDynamicSMemSize` should be NULL.

Otherwise, if the per-block dynamic shared memory size varies with different block sizes, the user needs to provide a unary function through `blockSizeToDynamicSMemSize` that computes the dynamic shared memory needed by `func` for any given block size. `dynamicSMemSize` is ignored. An example signature is:


    ‎    // Take block size, returns dynamic shared memory needed
              size_t blockToSmem(int blockSize);

Note that the API can also be used with context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will be the current context.

CUresult cuOccupancyMaxPotentialBlockSizeWithFlags ( int* minGridSize, int* blockSize, CUfunction func, CUoccupancyB2DSize blockSizeToDynamicSMemSize, size_t dynamicSMemSize, int  blockSizeLimit, unsigned int  flags )


Suggest a launch configuration with reasonable occupancy.

######  Parameters

`minGridSize`
    \- Returned minimum grid size needed to achieve the maximum occupancy
`blockSize`
    \- Returned maximum block size that can achieve the maximum occupancy
`func`
    \- Kernel for which launch configuration is calculated
`blockSizeToDynamicSMemSize`
    \- A function that calculates how much per-block dynamic shared memory `func` uses based on the block size
`dynamicSMemSize`
    \- Dynamic shared memory usage intended, in bytes
`blockSizeLimit`
    \- The maximum block size `func` is designed to handle
`flags`
    \- Options

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

An extended version of cuOccupancyMaxPotentialBlockSize. In addition to arguments passed to cuOccupancyMaxPotentialBlockSize, cuOccupancyMaxPotentialBlockSizeWithFlags also takes a `Flags` parameter.

The `Flags` parameter controls how special cases are handled. The valid flags are:

  * CU_OCCUPANCY_DEFAULT, which maintains the default behavior as cuOccupancyMaxPotentialBlockSize;


  * CU_OCCUPANCY_DISABLE_CACHING_OVERRIDE, which suppresses the default behavior on platform where global caching affects occupancy. On such platforms, the launch configurations that produces maximal occupancy might not support global caching. Setting CU_OCCUPANCY_DISABLE_CACHING_OVERRIDE guarantees that the the produced launch configuration is global caching compatible at a potential cost of occupancy. More information can be found about this feature in the "Unified L1/Texture Cache" section of the Maxwell tuning guide.


Note that the API can also be used with context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will be the current context.

CUresult cuOccupancyMaxPotentialClusterSize ( int* clusterSize, CUfunction func, const CUlaunchConfig* config )


Given the kernel function (`func`) and launch configuration (`config`), return the maximum cluster size in `*clusterSize`.

######  Parameters

`clusterSize`
    \- Returned maximum cluster size that can be launched for the given kernel function and launch configuration
`func`
    \- Kernel function for which maximum cluster size is calculated
`config`
    \- Launch configuration for the given kernel function

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_UNKNOWN

###### Description

The cluster dimensions in `config` are ignored. If func has a required cluster size set (see cudaFuncGetAttributes / cuFuncGetAttribute),`*clusterSize` will reflect the required cluster size.

By default this function will always return a value that's portable on future hardware. A higher value may be returned if the kernel function allows non-portable cluster sizes.

This function will respect the compile time launch bounds.

Note that the API can also be used with context-less kernel CUkernel by querying the handle using cuLibraryGetKernel() and then passing it to the API by casting to CUfunction. Here, the context to use for calculations will either be taken from the specified stream `config->hStream` or the current context in case of NULL stream.


