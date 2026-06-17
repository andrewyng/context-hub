---
name: runtime-memory--pools
description: '**Source:** group__CUDART__MEMORY__POOLS.html#group__CUDART__MEMORY__POOLS'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.12. Stream Ordered Memory Allocator

**Source:** group__CUDART__MEMORY__POOLS.html#group__CUDART__MEMORY__POOLS


### Functions

__host__ cudaError_t cudaFreeAsync ( void* devPtr, cudaStream_t hStream )


Frees memory with stream ordered semantics.

######  Parameters

`devPtr`

`hStream`
    \- The stream establishing the stream ordering promise

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported

###### Description

Inserts a free operation into `hStream`. The allocation must not be accessed after stream execution reaches the free. After this API returns, accessing the memory from any subsequent work launched on the GPU or querying its pointer attributes results in undefined behavior.

During stream capture, this function results in the creation of a free node and must therefore be passed the address of a graph allocation.

  *   * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cuMemFreeAsync, cudaMallocAsync

__host__ cudaError_t cudaMallocAsync ( void** devPtr, size_t size, cudaStream_t hStream )


Allocates memory with stream ordered semantics.

######  Parameters

`devPtr`
    \- Returned device pointer
`size`
    \- Number of bytes to allocate
`hStream`
    \- The stream establishing the stream ordering contract and the memory pool to allocate from

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported, cudaErrorOutOfMemory

###### Description

Inserts an allocation operation into `hStream`. A pointer to the allocated memory is returned immediately in *dptr. The allocation must not be accessed until the the allocation operation completes. The allocation comes from the memory pool associated with the stream's device.

  * The default memory pool of a device contains device memory from that device.

  * Basic stream ordering allows future work submitted into the same stream to use the allocation. Stream query, stream synchronize, and CUDA events can be used to guarantee that the allocation operation completes before work submitted in a separate stream runs.

  * During stream capture, this function results in the creation of an allocation node. In this case, the allocation is owned by the graph instead of the memory pool. The memory pool's properties are used to set the node's creation parameters.


  *   * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cuMemAllocAsync, cudaMallocAsync ( C++ API), cudaMallocFromPoolAsync, cudaFreeAsync, cudaDeviceSetMemPool, cudaDeviceGetDefaultMemPool, cudaDeviceGetMemPool, cudaMemPoolSetAccess, cudaMemPoolSetAttribute, cudaMemPoolGetAttribute

__host__ cudaError_t cudaMallocFromPoolAsync ( void** ptr, size_t size, cudaMemPool_t memPool, cudaStream_t stream )


Allocates memory from a specified pool with stream ordered semantics.

######  Parameters

`ptr`
    \- Returned device pointer
`size`

`memPool`
    \- The pool to allocate from
`stream`
    \- The stream establishing the stream ordering semantic

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported, cudaErrorOutOfMemory

###### Description

Inserts an allocation operation into `hStream`. A pointer to the allocated memory is returned immediately in *dptr. The allocation must not be accessed until the the allocation operation completes. The allocation comes from the specified memory pool.

  * The specified memory pool may be from a device different than that of the specified `hStream`.


  * Basic stream ordering allows future work submitted into the same stream to use the allocation. Stream query, stream synchronize, and CUDA events can be used to guarantee that the allocation operation completes before work submitted in a separate stream runs.


During stream capture, this function results in the creation of an allocation node. In this case, the allocation is owned by the graph instead of the memory pool. The memory pool's properties are used to set the node's creation parameters.

**See also:**

cuMemAllocFromPoolAsync, cudaMallocAsync ( C++ API), cudaMallocAsync, cudaFreeAsync, cudaDeviceGetDefaultMemPool, cudaMemPoolCreate, cudaMemPoolSetAccess, cudaMemPoolSetAttribute

__host__ cudaError_t cudaMemGetDefaultMemPool ( cudaMemPool_t* memPool, cudaMemLocation* location, cudaMemAllocationType type )


Returns the default memory pool for a given location and allocation type.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported

###### Description

The memory location can be of one of cudaMemLocationTypeDevice, cudaMemLocationTypeHost or cudaMemLocationTypeHostNuma. The allocation type can be one of cudaMemAllocationTypePinned or cudaMemAllocationTypeManaged. When the allocation type is cudaMemAllocationTypeManaged, the location type can also be cudaMemLocationTypeNone to indicate no preferred location for the managed memory pool. In all other cases, the call return cudaErrorInvalidValue

**See also:**

cuMemAllocAsync, cuMemPoolTrimTo, cuMemPoolGetAttribute, cuMemPoolSetAttribute, cuMemPoolSetAccess, cuMemGetMemPool, cuMemPoolCreate

__host__ cudaError_t cudaMemGetMemPool ( cudaMemPool_t* memPool, cudaMemLocation* location, cudaMemAllocationType type )


Gets the current memory pool for a given memory location and allocation type.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

The memory location can be of one of cudaMemLocationTypeDevice, cudaMemLocationTypeHost or cudaMemLocationTypeHostNuma. The allocation type can be one of cudaMemAllocationTypePinned or cudaMemAllocationTypeManaged. When the allocation type is cudaMemAllocationTypeManaged, the location type can also be cudaMemLocationTypeNone to indicate no preferred location for the managed memory pool. In all other cases, the call return cudaErrorInvalidValue

Returns the last pool provided to cudaMemSetMemPool or cudaDeviceSetMemPool for this location and allocation type or the location's default memory pool if cudaMemSetMemPool or cudaDeviceSetMemPool for that allocType and location has never been called. By default the current mempool of a location is the default mempool for a device that can be obtained via cudaMemGetDefaultMemPool Otherwise the returned pool must have been set with cudaDeviceSetMemPool.

**See also:**

cuDeviceGetDefaultMemPool, cuMemPoolCreate, cuDeviceSetMemPool, cuMemSetMemPool

__host__ cudaError_t cudaMemPoolCreate ( cudaMemPool_t* memPool, const cudaMemPoolProps* poolProps )


Creates a memory pool.

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorNotSupported

###### Description

Creates a CUDA memory pool and returns the handle in `pool`. The `poolProps` determines the properties of the pool such as the backing device and IPC capabilities.

To create a memory pool for host memory not targeting a specific NUMA node, applications must set set cudaMemPoolProps::cudaMemLocation::type to cudaMemLocationTypeHost. cudaMemPoolProps::cudaMemLocation::id is ignored for such pools. Pools created with the type cudaMemLocationTypeHost are not IPC capable and cudaMemPoolProps::handleTypes must be 0, any other values will result in cudaErrorInvalidValue. To create a memory pool targeting a specific host NUMA node, applications must set cudaMemPoolProps::cudaMemLocation::type to cudaMemLocationTypeHostNuma and cudaMemPoolProps::cudaMemLocation::id must specify the NUMA ID of the host memory node. Specifying cudaMemLocationTypeHostNumaCurrent as the cudaMemPoolProps::cudaMemLocation::type will result in cudaErrorInvalidValue. By default, the pool's memory will be accessible from the device it is allocated on. In the case of pools created with cudaMemLocationTypeHostNuma or cudaMemLocationTypeHost, their default accessibility will be from the host CPU. Applications can control the maximum size of the pool by specifying a non-zero value for cudaMemPoolProps::maxSize. If set to 0, the maximum size of the pool will default to a system dependent value.

Applications that intend to use CU_MEM_HANDLE_TYPE_FABRIC based memory sharing must ensure: (1) `nvidia-caps-imex-channels` character device is created by the driver and is listed under /proc/devices (2) have at least one IMEX channel file accessible by the user launching the application.

When exporter and importer CUDA processes have been granted access to the same IMEX channel, they can securely share memory.

The IMEX channel security model works on a per user basis. Which means all processes under a user can share memory if the user has access to a valid IMEX channel. When multi-user isolation is desired, a separate IMEX channel is required for each user.

These channel files exist in /dev/nvidia-caps-imex-channels/channel* and can be created using standard OS native calls like mknod on Linux. For example: To create channel0 with the major number from /proc/devices users can execute the following command: `mknod /dev/nvidia-caps-imex-channels/channel0 c <major number>=""> 0`

To create a managed memory pool, applications must set cudaMemPoolProps:cudaMemAllocationType to cudaMemAllocationTypeManaged. cudaMemPoolProps::cudaMemAllocationHandleType must also be set to cudaMemHandleTypeNone since IPC is not supported. For managed memory pools, cudaMemPoolProps::cudaMemLocation will be treated as the preferred location for all allocations created from the pool. An application can also set cudaMemLocationTypeNone to indicate no preferred location. cudaMemPoolProps::maxSize must be set to zero for managed memory pools. cudaMemPoolProps::usage should be zero as decompress for managed memory is not supported. For managed memory pools, all devices on the system must have non-zero concurrentManagedAccess. If not, this call returns cudaErrorNotSupported

Specifying cudaMemHandleTypeNone creates a memory pool that will not support IPC.

**See also:**

cuMemPoolCreate, cudaDeviceSetMemPool, cudaMallocFromPoolAsync, cudaMemPoolExportToShareableHandle, cudaDeviceGetDefaultMemPool, cudaDeviceGetMemPool

__host__ cudaError_t cudaMemPoolDestroy ( cudaMemPool_t memPool )


Destroys the specified memory pool.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

If any pointers obtained from this pool haven't been freed or the pool has free operations that haven't completed when cudaMemPoolDestroy is invoked, the function will return immediately and the resources associated with the pool will be released automatically once there are no more outstanding allocations.

Destroying the current mempool of a device sets the default mempool of that device as the current mempool for that device.

A device's default memory pool cannot be destroyed.

**See also:**

cuMemPoolDestroy, cudaFreeAsync, cudaDeviceSetMemPool, cudaDeviceGetDefaultMemPool, cudaDeviceGetMemPool, cudaMemPoolCreate

__host__ cudaError_t cudaMemPoolExportPointer ( cudaMemPoolPtrExportData* exportData, void* ptr )


Export data to share a memory pool allocation between processes.

######  Parameters

`exportData`

`ptr`
    \- pointer to memory being exported

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorOutOfMemory

###### Description

Constructs `shareData_out` for sharing a specific allocation from an already shared memory pool. The recipient process can import the allocation with the cudaMemPoolImportPointer api. The data is not a handle and may be shared through any IPC mechanism.

**See also:**

cuMemPoolExportPointer, cudaMemPoolExportToShareableHandle, cudaMemPoolImportFromShareableHandle, cudaMemPoolImportPointer

__host__ cudaError_t cudaMemPoolExportToShareableHandle ( void* shareableHandle, cudaMemPool_t memPool, cudaMemAllocationHandleType handleType, unsigned int  flags )


Exports a memory pool to the requested handle type.

######  Parameters

`shareableHandle`

`memPool`

`handleType`
    \- the type of handle to create
`flags`
    \- must be 0

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorOutOfMemory

###### Description

Given an IPC capable mempool, create an OS handle to share the pool with another process. A recipient process can convert the shareable handle into a mempool with cudaMemPoolImportFromShareableHandle. Individual pointers can then be shared with the cudaMemPoolExportPointer and cudaMemPoolImportPointer APIs. The implementation of what the shareable handle is and how it can be transferred is defined by the requested handle type.

: To create an IPC capable mempool, create a mempool with a CUmemAllocationHandleType other than cudaMemHandleTypeNone.

**See also:**

cuMemPoolExportToShareableHandle, cudaMemPoolImportFromShareableHandle, cudaMemPoolExportPointer, cudaMemPoolImportPointer

__host__ cudaError_t cudaMemPoolGetAccess ( cudaMemAccessFlags ** flags, cudaMemPool_t memPool, cudaMemLocation* location )


Returns the accessibility of a pool from a device.

######  Parameters

`flags`
    \- the accessibility of the pool from the specified location
`memPool`
    \- the pool being queried
`location`
    \- the location accessing the pool

###### Description

Returns the accessibility of the pool's memory from the specified location.

**See also:**

cuMemPoolGetAccess, cudaMemPoolSetAccess

__host__ cudaError_t cudaMemPoolGetAttribute ( cudaMemPool_t memPool, cudaMemPoolAttr attr, void* value )


Gets attributes of a memory pool.

######  Parameters

`memPool`

`attr`
    \- The attribute to get
`value`
    \- Retrieved value

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Supported attributes are:

  * cudaMemPoolAttrReleaseThreshold: (value type = cuuint64_t) Amount of reserved memory in bytes to hold onto before trying to release memory back to the OS. When more than the release threshold bytes of memory are held by the memory pool, the allocator will try to release memory back to the OS on the next call to stream, event or context synchronize. (default 0)

  * cudaMemPoolReuseFollowEventDependencies: (value type = int) Allow cudaMallocAsync to use memory asynchronously freed in another stream as long as a stream ordering dependency of the allocating stream on the free action exists. Cuda events and null stream interactions can create the required stream ordered dependencies. (default enabled)

  * cudaMemPoolReuseAllowOpportunistic: (value type = int) Allow reuse of already completed frees when there is no dependency between the free and allocation. (default enabled)

  * cudaMemPoolReuseAllowInternalDependencies: (value type = int) Allow cudaMallocAsync to insert new stream dependencies in order to establish the stream ordering required to reuse a piece of memory released by cudaFreeAsync (default enabled).

  * cudaMemPoolAttrReservedMemCurrent: (value type = cuuint64_t) Amount of backing memory currently allocated for the mempool.

  * cudaMemPoolAttrReservedMemHigh: (value type = cuuint64_t) High watermark of backing memory allocated for the mempool since the last time it was reset.

  * cudaMemPoolAttrUsedMemCurrent: (value type = cuuint64_t) Amount of memory from the pool that is currently in use by the application.

  * cudaMemPoolAttrUsedMemHigh: (value type = cuuint64_t) High watermark of the amount of memory from the pool that was in use by the application since the last time it was reset.


Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuMemPoolGetAttribute, cudaMallocAsync, cudaFreeAsync, cudaDeviceGetDefaultMemPool, cudaDeviceGetMemPool, cudaMemPoolCreate

__host__ cudaError_t cudaMemPoolImportFromShareableHandle ( cudaMemPool_t* memPool, void* shareableHandle, cudaMemAllocationHandleType handleType, unsigned int  flags )


imports a memory pool from a shared handle.

######  Parameters

`memPool`

`shareableHandle`

`handleType`
    \- The type of handle being imported
`flags`
    \- must be 0

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorOutOfMemory

###### Description

Specific allocations can be imported from the imported pool with cudaMemPoolImportPointer.

Imported memory pools do not support creating new allocations. As such imported memory pools may not be used in cudaDeviceSetMemPool or cudaMallocFromPoolAsync calls.

**See also:**

cuMemPoolImportFromShareableHandle, cudaMemPoolExportToShareableHandle, cudaMemPoolExportPointer, cudaMemPoolImportPointer

__host__ cudaError_t cudaMemPoolImportPointer ( void** ptr, cudaMemPool_t memPool, cudaMemPoolPtrExportData* exportData )


Import a memory pool allocation from another process.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Returns in `ptr_out` a pointer to the imported memory. The imported memory must not be accessed before the allocation operation completes in the exporting process. The imported memory must be freed from all importing processes before being freed in the exporting process. The pointer may be freed with cudaFree or cudaFreeAsync. If cudaFreeAsync is used, the free must be completed on the importing process before the free operation on the exporting process.

The cudaFreeAsync api may be used in the exporting process before the cudaFreeAsync operation completes in its stream as long as the cudaFreeAsync in the exporting process specifies a stream with a stream dependency on the importing process's cudaFreeAsync.

**See also:**

cuMemPoolImportPointer, cudaMemPoolExportToShareableHandle, cudaMemPoolImportFromShareableHandle, cudaMemPoolExportPointer

__host__ cudaError_t cudaMemPoolSetAccess ( cudaMemPool_t memPool, const cudaMemAccessDesc* descList, size_t count )


Controls visibility of pools between devices.

######  Parameters

`memPool`

`descList`

`count`
    \- Number of descriptors in the map array.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

**See also:**

cuMemPoolSetAccess, cudaMemPoolGetAccess, cudaMallocAsync, cudaFreeAsync

__host__ cudaError_t cudaMemPoolSetAttribute ( cudaMemPool_t memPool, cudaMemPoolAttr attr, void* value )


Sets attributes of a memory pool.

######  Parameters

`memPool`

`attr`
    \- The attribute to modify
`value`
    \- Pointer to the value to assign

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Supported attributes are:

  * cudaMemPoolAttrReleaseThreshold: (value type = cuuint64_t) Amount of reserved memory in bytes to hold onto before trying to release memory back to the OS. When more than the release threshold bytes of memory are held by the memory pool, the allocator will try to release memory back to the OS on the next call to stream, event or context synchronize. (default 0)

  * cudaMemPoolReuseFollowEventDependencies: (value type = int) Allow cudaMallocAsync to use memory asynchronously freed in another stream as long as a stream ordering dependency of the allocating stream on the free action exists. Cuda events and null stream interactions can create the required stream ordered dependencies. (default enabled)

  * cudaMemPoolReuseAllowOpportunistic: (value type = int) Allow reuse of already completed frees when there is no dependency between the free and allocation. (default enabled)

  * cudaMemPoolReuseAllowInternalDependencies: (value type = int) Allow cudaMallocAsync to insert new stream dependencies in order to establish the stream ordering required to reuse a piece of memory released by cudaFreeAsync (default enabled).

  * cudaMemPoolAttrReservedMemHigh: (value type = cuuint64_t) Reset the high watermark that tracks the amount of backing memory that was allocated for the memory pool. It is illegal to set this attribute to a non-zero value.

  * cudaMemPoolAttrUsedMemHigh: (value type = cuuint64_t) Reset the high watermark that tracks the amount of used memory that was allocated for the memory pool. It is illegal to set this attribute to a non-zero value.


Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuMemPoolSetAttribute, cudaMallocAsync, cudaFreeAsync, cudaDeviceGetDefaultMemPool, cudaDeviceGetMemPool, cudaMemPoolCreate

__host__ cudaError_t cudaMemPoolTrimTo ( cudaMemPool_t memPool, size_t minBytesToKeep )


Tries to release memory back to the OS.

######  Parameters

`memPool`

`minBytesToKeep`
    \- If the pool has less than minBytesToKeep reserved, the TrimTo operation is a no-op. Otherwise the pool will be guaranteed to have at least minBytesToKeep bytes reserved after the operation.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Releases memory back to the OS until the pool contains fewer than minBytesToKeep reserved bytes, or there is no more memory that the allocator can safely release. The allocator cannot release OS allocations that back outstanding asynchronous allocations. The OS allocations may happen at different granularity from the user allocations.

  * : Allocations that have not been freed count as outstanding.

  * : Allocations that have been asynchronously freed but whose completion has not been observed on the host (eg. by a synchronize) can count as outstanding.


Note that as specified by cudaStreamAddCallback no CUDA function may be called from callback. cudaErrorNotPermitted may, but is not guaranteed to, be returned as a diagnostic in such case.

**See also:**

cuMemPoolTrimTo, cudaMallocAsync, cudaFreeAsync, cudaDeviceGetDefaultMemPool, cudaDeviceGetMemPool, cudaMemPoolCreate

__host__ cudaError_t cudaMemSetMemPool ( cudaMemLocation* location, cudaMemAllocationType type, cudaMemPool_t memPool )


Sets the current memory pool for a memory location and allocation type.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

The memory location can be of one of cudaMemLocationTypeDevice, cudaMemLocationTypeHost or cudaMemLocationTypeHostNuma. The allocation type can be one of cudaMemAllocationTypePinned or cudaMemAllocationTypeManaged. When the allocation type is cudaMemAllocationTypeManaged, the location type can also be cudaMemLocationTypeNone to indicate no preferred location for the managed memory pool. In all other cases, the call return cudaErrorInvalidValue

When a memory pool is set as the current memory pool, the location parameter should be the same as the location of the pool. If the location type or index don't match, the call returns cudaErrorInvalidValue. The type of memory pool should also match the parameter allocType. Else the call returns cudaErrorInvalidValue. By default, a memory location's current memory pool is its default memory pool. If the location type is cudaMemLocationTypeDevice and the allocation type is cudaMemAllocationTypePinned, then this API is the equivalent of calling cudaDeviceSetMemPool with the location id as the device. For further details on the implications, please refer to the documentation for cudaDeviceSetMemPool.

Use cudaMallocFromPoolAsync to specify asynchronous allocations from a device different than the one the stream runs on.

**See also:**

cuDeviceGetDefaultMemPool, cuDeviceGetMemPool, cuMemGetMemPool, cuMemPoolCreate, cuMemPoolDestroy, cuMemAllocFromPoolAsync

* * *

!


Copyright © 2025 NVIDIA Corporation