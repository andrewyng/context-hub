---
name: driver-malloc--async
description: '**Source:** group__CUDA__MALLOC__ASYNC.html#group__CUDA__MALLOC__ASYNC'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.15. Stream Ordered Memory Allocator

**Source:** group__CUDA__MALLOC__ASYNC.html#group__CUDA__MALLOC__ASYNC


### Functions

CUresult cuMemAllocAsync ( CUdeviceptr* dptr, size_t bytesize, CUstream hStream )


Allocates memory with stream ordered semantics.

######  Parameters

`dptr`
    \- Returned device pointer
`bytesize`
    \- Number of bytes to allocate
`hStream`
    \- The stream establishing the stream ordering contract and the memory pool to allocate from

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT (default stream specified with no current context), CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Inserts an allocation operation into `hStream`. A pointer to the allocated memory is returned immediately in *dptr. The allocation must not be accessed until the the allocation operation completes. The allocation comes from the memory pool current to the stream's device.

  * The default memory pool of a device contains device memory from that device.

  * Basic stream ordering allows future work submitted into the same stream to use the allocation. Stream query, stream synchronize, and CUDA events can be used to guarantee that the allocation operation completes before work submitted in a separate stream runs.

  * During stream capture, this function results in the creation of an allocation node. In this case, the allocation is owned by the graph instead of the memory pool. The memory pool's properties are used to set the node's creation parameters.


CUresult cuMemAllocFromPoolAsync ( CUdeviceptr* dptr, size_t bytesize, CUmemoryPool pool, CUstream hStream )


Allocates memory from a specified pool with stream ordered semantics.

######  Parameters

`dptr`
    \- Returned device pointer
`bytesize`
    \- Number of bytes to allocate
`pool`
    \- The pool to allocate from
`hStream`
    \- The stream establishing the stream ordering semantic

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT (default stream specified with no current context), CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Inserts an allocation operation into `hStream`. A pointer to the allocated memory is returned immediately in *dptr. The allocation must not be accessed until the the allocation operation completes. The allocation comes from the specified memory pool.

  * The specified memory pool may be from a device different than that of the specified `hStream`.


  * Basic stream ordering allows future work submitted into the same stream to use the allocation. Stream query, stream synchronize, and CUDA events can be used to guarantee that the allocation operation completes before work submitted in a separate stream runs.


During stream capture, this function results in the creation of an allocation node. In this case, the allocation is owned by the graph instead of the memory pool. The memory pool's properties are used to set the node's creation parameters.

CUresult cuMemFreeAsync ( CUdeviceptr dptr, CUstream hStream )


Frees memory with stream ordered semantics.

######  Parameters

`dptr`
    \- memory to free
`hStream`
    \- The stream establishing the stream ordering contract.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT (default stream specified with no current context), CUDA_ERROR_NOT_SUPPORTED

###### Description

Inserts a free operation into `hStream`. The allocation must not be accessed after stream execution reaches the free. After this API returns, accessing the memory from any subsequent work launched on the GPU or querying its pointer attributes results in undefined behavior.

During stream capture, this function results in the creation of a free node and must therefore be passed the address of a graph allocation.

CUresult cuMemGetDefaultMemPool ( CUmemoryPool* pool_out, CUmemLocation* location, CUmemAllocationType type )


Returns the default memory pool for a given location and allocation type.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZEDCUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_NOT_SUPPORTED

###### Description

The memory location can be of one of CU_MEM_LOCATION_TYPE_DEVICE, CU_MEM_LOCATION_TYPE_HOST or CU_MEM_LOCATION_TYPE_HOST_NUMA. The allocation type can be one of CU_MEM_ALLOCATION_TYPE_PINNED or CU_MEM_ALLOCATION_TYPE_MANAGED. When the allocation type is CU_MEM_ALLOCATION_TYPE_MANAGED, the location type can also be CU_MEM_LOCATION_TYPE_NONE to indicate no preferred location for the managed memory pool. In all other cases, the call returns CUDA_ERROR_INVALID_VALUE.

CUresult cuMemGetMemPool ( CUmemoryPool* pool, CUmemLocation* location, CUmemAllocationType type )


Gets the current memory pool for a memory location and of a particular allocation type.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

The memory location can be of one of CU_MEM_LOCATION_TYPE_DEVICE, CU_MEM_LOCATION_TYPE_HOST or CU_MEM_LOCATION_TYPE_HOST_NUMA. The allocation type can be one of CU_MEM_ALLOCATION_TYPE_PINNED or CU_MEM_ALLOCATION_TYPE_MANAGED. When the allocation type is CU_MEM_ALLOCATION_TYPE_MANAGED, the location type can also be CU_MEM_LOCATION_TYPE_NONE to indicate no preferred location for the managed memory pool. In all other cases, the call returns CUDA_ERROR_INVALID_VALUE

Returns the last pool provided to cuMemSetMemPool or cuDeviceSetMemPool for this location and allocation type or the location's default memory pool if cuMemSetMemPool or cuDeviceSetMemPool for that allocType and location has never been called. By default the current mempool of a location is the default mempool for a device. Otherwise the returned pool must have been set with cuDeviceSetMemPool.

CUresult cuMemPoolCreate ( CUmemoryPool* pool, const CUmemPoolProps* poolProps )


Creates a memory pool.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Creates a CUDA memory pool and returns the handle in `pool`. The `poolProps` determines the properties of the pool such as the backing device and IPC capabilities.

To create a memory pool for HOST memory not targeting a specific NUMA node, applications must set set CUmemPoolProps::CUmemLocation::type to CU_MEM_LOCATION_TYPE_HOST. CUmemPoolProps::CUmemLocation::id is ignored for such pools. Pools created with the type CU_MEM_LOCATION_TYPE_HOST are not IPC capable and CUmemPoolProps::handleTypes must be 0, any other values will result in CUDA_ERROR_INVALID_VALUE. To create a memory pool targeting a specific host NUMA node, applications must set CUmemPoolProps::CUmemLocation::type to CU_MEM_LOCATION_TYPE_HOST_NUMA and CUmemPoolProps::CUmemLocation::id must specify the NUMA ID of the host memory node. Specifying CU_MEM_LOCATION_TYPE_HOST_NUMA_CURRENT as the CUmemPoolProps::CUmemLocation::type will result in CUDA_ERROR_INVALID_VALUE. By default, the pool's memory will be accessible from the device it is allocated on. In the case of pools created with CU_MEM_LOCATION_TYPE_HOST_NUMA or CU_MEM_LOCATION_TYPE_HOST, their default accessibility will be from the host CPU. Applications can control the maximum size of the pool by specifying a non-zero value for CUmemPoolProps::maxSize. If set to 0, the maximum size of the pool will default to a system dependent value.

Applications that intend to use CU_MEM_HANDLE_TYPE_FABRIC based memory sharing must ensure: (1) `nvidia-caps-imex-channels` character device is created by the driver and is listed under /proc/devices (2) have at least one IMEX channel file accessible by the user launching the application.

When exporter and importer CUDA processes have been granted access to the same IMEX channel, they can securely share memory.

The IMEX channel security model works on a per user basis. Which means all processes under a user can share memory if the user has access to a valid IMEX channel. When multi-user isolation is desired, a separate IMEX channel is required for each user.

These channel files exist in /dev/nvidia-caps-imex-channels/channel* and can be created using standard OS native calls like mknod on Linux. For example: To create channel0 with the major number from /proc/devices users can execute the following command: `mknod /dev/nvidia-caps-imex-channels/channel0 c <major number>=""> 0`

To create a managed memory pool, applications must set CUmemPoolProps::CUmemAllocationType to CU_MEM_ALLOCATION_TYPE_MANAGED. CUmemPoolProps::CUmemAllocationHandleType must also be set to CU_MEM_HANDLE_TYPE_NONE since IPC is not supported. For managed memory pools, CUmemPoolProps::CUmemLocation will be treated as the preferred location for all allocations created from the pool. An application can also set CU_MEM_LOCATION_TYPE_NONE to indicate no preferred location. CUmemPoolProps::maxSize must be set to zero for managed memory pools. CUmemPoolProps::usage should be zero as decompress for managed memory is not supported. For managed memory pools, all devices on the system must have non-zero concurrentManagedAccess. If not, this call returns CUDA_ERROR_NOT_SUPPORTED

Specifying CU_MEM_HANDLE_TYPE_NONE creates a memory pool that will not support IPC.

CUresult cuMemPoolDestroy ( CUmemoryPool pool )


Destroys the specified memory pool.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

If any pointers obtained from this pool haven't been freed or the pool has free operations that haven't completed when cuMemPoolDestroy is invoked, the function will return immediately and the resources associated with the pool will be released automatically once there are no more outstanding allocations.

Destroying the current mempool of a device sets the default mempool of that device as the current mempool for that device.

A device's default memory pool cannot be destroyed.

CUresult cuMemPoolExportPointer ( CUmemPoolPtrExportData* shareData_out, CUdeviceptr ptr )


Export data to share a memory pool allocation between processes.

######  Parameters

`shareData_out`
    \- Returned export data
`ptr`
    \- pointer to memory being exported

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Constructs `shareData_out` for sharing a specific allocation from an already shared memory pool. The recipient process can import the allocation with the cuMemPoolImportPointer api. The data is not a handle and may be shared through any IPC mechanism.

CUresult cuMemPoolExportToShareableHandle ( void* handle_out, CUmemoryPool pool, CUmemAllocationHandleType handleType, unsigned long long flags )


Exports a memory pool to the requested handle type.

######  Parameters

`handle_out`
    \- Returned OS handle
`pool`
    \- pool to export
`handleType`
    \- the type of handle to create
`flags`
    \- must be 0

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Given an IPC capable mempool, create an OS handle to share the pool with another process. A recipient process can convert the shareable handle into a mempool with cuMemPoolImportFromShareableHandle. Individual pointers can then be shared with the cuMemPoolExportPointer and cuMemPoolImportPointer APIs. The implementation of what the shareable handle is and how it can be transferred is defined by the requested handle type.

: To create an IPC capable mempool, create a mempool with a CUmemAllocationHandleType other than CU_MEM_HANDLE_TYPE_NONE.

CUresult cuMemPoolGetAccess ( CUmemAccess_flags* flags, CUmemoryPool memPool, CUmemLocation* location )


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

CUresult cuMemPoolGetAttribute ( CUmemoryPool pool, CUmemPool_attribute attr, void* value )


Gets attributes of a memory pool.

######  Parameters

`pool`
    \- The memory pool to get attributes of
`attr`
    \- The attribute to get
`value`
    \- Retrieved value

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Supported attributes are:

  * CU_MEMPOOL_ATTR_RELEASE_THRESHOLD: (value type = cuuint64_t) Amount of reserved memory in bytes to hold onto before trying to release memory back to the OS. When more than the release threshold bytes of memory are held by the memory pool, the allocator will try to release memory back to the OS on the next call to stream, event or context synchronize. (default 0)

  * CU_MEMPOOL_ATTR_REUSE_FOLLOW_EVENT_DEPENDENCIES: (value type = int) Allow cuMemAllocAsync to use memory asynchronously freed in another stream as long as a stream ordering dependency of the allocating stream on the free action exists. Cuda events and null stream interactions can create the required stream ordered dependencies. (default enabled)

  * CU_MEMPOOL_ATTR_REUSE_ALLOW_OPPORTUNISTIC: (value type = int) Allow reuse of already completed frees when there is no dependency between the free and allocation. (default enabled)

  * CU_MEMPOOL_ATTR_REUSE_ALLOW_INTERNAL_DEPENDENCIES: (value type = int) Allow cuMemAllocAsync to insert new stream dependencies in order to establish the stream ordering required to reuse a piece of memory released by cuMemFreeAsync (default enabled).

  * CU_MEMPOOL_ATTR_RESERVED_MEM_CURRENT: (value type = cuuint64_t) Amount of backing memory currently allocated for the mempool

  * CU_MEMPOOL_ATTR_RESERVED_MEM_HIGH: (value type = cuuint64_t) High watermark of backing memory allocated for the mempool since the last time it was reset.

  * CU_MEMPOOL_ATTR_USED_MEM_CURRENT: (value type = cuuint64_t) Amount of memory from the pool that is currently in use by the application.

  * CU_MEMPOOL_ATTR_USED_MEM_HIGH: (value type = cuuint64_t) High watermark of the amount of memory from the pool that was in use by the application.


CUresult cuMemPoolImportFromShareableHandle ( CUmemoryPool* pool_out, void* handle, CUmemAllocationHandleType handleType, unsigned long long flags )


imports a memory pool from a shared handle.

######  Parameters

`pool_out`
    \- Returned memory pool
`handle`
    \- OS handle of the pool to open
`handleType`
    \- The type of handle being imported
`flags`
    \- must be 0

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Specific allocations can be imported from the imported pool with cuMemPoolImportPointer.

If `handleType` is CU_MEM_HANDLE_TYPE_FABRIC and the importer process has not been granted access to the same IMEX channel as the exporter process, this API will error as CUDA_ERROR_NOT_PERMITTED.

Imported memory pools do not support creating new allocations. As such imported memory pools may not be used in cuDeviceSetMemPool or cuMemAllocFromPoolAsync calls.

CUresult cuMemPoolImportPointer ( CUdeviceptr* ptr_out, CUmemoryPool pool, CUmemPoolPtrExportData* shareData )


Import a memory pool allocation from another process.

######  Parameters

`ptr_out`
    \- pointer to imported memory
`pool`
    \- pool from which to import
`shareData`
    \- data specifying the memory to import

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Returns in `ptr_out` a pointer to the imported memory. The imported memory must not be accessed before the allocation operation completes in the exporting process. The imported memory must be freed from all importing processes before being freed in the exporting process. The pointer may be freed with cuMemFree or cuMemFreeAsync. If cuMemFreeAsync is used, the free must be completed on the importing process before the free operation on the exporting process.

The cuMemFreeAsync api may be used in the exporting process before the cuMemFreeAsync operation completes in its stream as long as the cuMemFreeAsync in the exporting process specifies a stream with a stream dependency on the importing process's cuMemFreeAsync.

CUresult cuMemPoolSetAccess ( CUmemoryPool pool, const CUmemAccessDesc* map, size_t count )


Controls visibility of pools between devices.

######  Parameters

`pool`
    \- The pool being modified
`map`
    \- Array of access descriptors. Each descriptor instructs the access to enable for a single gpu.
`count`
    \- Number of descriptors in the map array.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

CUresult cuMemPoolSetAttribute ( CUmemoryPool pool, CUmemPool_attribute attr, void* value )


Sets attributes of a memory pool.

######  Parameters

`pool`
    \- The memory pool to modify
`attr`
    \- The attribute to modify
`value`
    \- Pointer to the value to assign

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Supported attributes are:

  * CU_MEMPOOL_ATTR_RELEASE_THRESHOLD: (value type = cuuint64_t) Amount of reserved memory in bytes to hold onto before trying to release memory back to the OS. When more than the release threshold bytes of memory are held by the memory pool, the allocator will try to release memory back to the OS on the next call to stream, event or context synchronize. (default 0)

  * CU_MEMPOOL_ATTR_REUSE_FOLLOW_EVENT_DEPENDENCIES: (value type = int) Allow cuMemAllocAsync to use memory asynchronously freed in another stream as long as a stream ordering dependency of the allocating stream on the free action exists. Cuda events and null stream interactions can create the required stream ordered dependencies. (default enabled)

  * CU_MEMPOOL_ATTR_REUSE_ALLOW_OPPORTUNISTIC: (value type = int) Allow reuse of already completed frees when there is no dependency between the free and allocation. (default enabled)

  * CU_MEMPOOL_ATTR_REUSE_ALLOW_INTERNAL_DEPENDENCIES: (value type = int) Allow cuMemAllocAsync to insert new stream dependencies in order to establish the stream ordering required to reuse a piece of memory released by cuMemFreeAsync (default enabled).

  * CU_MEMPOOL_ATTR_RESERVED_MEM_HIGH: (value type = cuuint64_t) Reset the high watermark that tracks the amount of backing memory that was allocated for the memory pool. It is illegal to set this attribute to a non-zero value.

  * CU_MEMPOOL_ATTR_USED_MEM_HIGH: (value type = cuuint64_t) Reset the high watermark that tracks the amount of used memory that was allocated for the memory pool.


CUresult cuMemPoolTrimTo ( CUmemoryPool pool, size_t minBytesToKeep )


Tries to release memory back to the OS.

######  Parameters

`pool`
    \- The memory pool to trim
`minBytesToKeep`
    \- If the pool has less than minBytesToKeep reserved, the TrimTo operation is a no-op. Otherwise the pool will be guaranteed to have at least minBytesToKeep bytes reserved after the operation.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Releases memory back to the OS until the pool contains fewer than minBytesToKeep reserved bytes, or there is no more memory that the allocator can safely release. The allocator cannot release OS allocations that back outstanding asynchronous allocations. The OS allocations may happen at different granularity from the user allocations.

  * : Allocations that have not been freed count as outstanding.

  * : Allocations that have been asynchronously freed but whose completion has not been observed on the host (eg. by a synchronize) can count as outstanding.


CUresult cuMemSetMemPool ( CUmemLocation* location, CUmemAllocationType type, CUmemoryPool pool )


Sets the current memory pool for a memory location and allocation type.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

The memory location can be of one of CU_MEM_LOCATION_TYPE_DEVICE, CU_MEM_LOCATION_TYPE_HOST or CU_MEM_LOCATION_TYPE_HOST_NUMA. The allocation type can be one of CU_MEM_ALLOCATION_TYPE_PINNED or CU_MEM_ALLOCATION_TYPE_MANAGED. When the allocation type is CU_MEM_ALLOCATION_TYPE_MANAGED, the location type can also be CU_MEM_LOCATION_TYPE_NONE to indicate no preferred location for the managed memory pool. In all other cases, the call returns CUDA_ERROR_INVALID_VALUE.

When a memory pool is set as the current memory pool, the location parameter should be the same as the location of the pool. The location and allocation type specified must match those of the pool otherwise CUDA_ERROR_INVALID_VALUE is returned. By default, a memory location's current memory pool is its default memory pool that can be obtained via cuMemGetDefaultMemPool. If the location type is CU_MEM_LOCATION_TYPE_DEVICE and the allocation type is CU_MEM_ALLOCATION_TYPE_PINNED, then this API is the equivalent of calling cuDeviceSetMemPool with the location id as the device. For further details on the implications, please refer to the documentation for cuDeviceSetMemPool.

Use cuMemAllocFromPoolAsync to specify asynchronous allocations from a device different than the one the stream runs on.
