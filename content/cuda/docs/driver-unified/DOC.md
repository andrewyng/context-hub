---
name: driver-unified
description: '**Source:** group__CUDA__UNIFIED.html#group__CUDA__UNIFIED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.17. Unified Addressing

**Source:** group__CUDA__UNIFIED.html#group__CUDA__UNIFIED


### Functions

CUresult cuMemAdvise ( CUdeviceptr devPtr, size_t count, CUmem_advise advice, CUmemLocation location )


Advise about the usage of a given memory range.

######  Parameters

`devPtr`
    \- Pointer to memory to set the advice for
`count`
    \- Size in bytes of the memory range
`advice`
    \- Advice to be applied for the specified memory range
`location`
    \- location to apply the advice for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Advise the Unified Memory subsystem about the usage pattern for the memory range starting at `devPtr` with a size of `count` bytes. The start address and end address of the memory range will be rounded down and rounded up respectively to be aligned to CPU page size before the advice is applied. The memory range must refer to managed memory allocated via cuMemAllocManaged or declared via __managed__ variables. The memory range could also refer to system-allocated pageable memory provided it represents a valid, host-accessible region of memory and all additional constraints imposed by `advice` as outlined below are also satisfied. Specifying an invalid system-allocated pageable memory range results in an error being returned.

The `advice` parameter can take the following values:

  * CU_MEM_ADVISE_SET_READ_MOSTLY: This implies that the data is mostly going to be read from and only occasionally written to. Any read accesses from any processor to this region will create a read-only copy of at least the accessed pages in that processor's memory. Additionally, if cuMemPrefetchAsync is called on this region, it will create a read-only copy of the data on the destination processor. If the target location for cuMemPrefetchAsync is a host NUMA node and a read-only copy already exists on another host NUMA node, that copy will be migrated to the targeted host NUMA node. If any processor writes to this region, all copies of the corresponding page will be invalidated except for the one where the write occurred. If the writing processor is the CPU and the preferred location of the page is a host NUMA node, then the page will also be migrated to that host NUMA node. The `location` argument is ignored for this advice. Note that for a page to be read-duplicated, the accessing processor must either be the CPU or a GPU that has a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. Also, if a context is created on a device that does not have the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS set, then read-duplication will not occur until all such contexts are destroyed. If the memory region refers to valid system-allocated pageable memory, then the accessing device must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS for a read-only copy to be created on that device. Note however that if the accessing device also has a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES, then setting this advice will not create a read-only copy when that device accesses this memory region.


  * CU_MEM_ADVISE_UNSET_READ_MOSTLY: Undoes the effect of CU_MEM_ADVISE_SET_READ_MOSTLY and also prevents the Unified Memory driver from attempting heuristic read-duplication on the memory range. Any read-duplicated copies of the data will be collapsed into a single copy. The location for the collapsed copy will be the preferred location if the page has a preferred location and one of the read-duplicated copies was resident at that location. Otherwise, the location chosen is arbitrary. Note: The `location` argument is ignored for this advice.


  * CU_MEM_ADVISE_SET_PREFERRED_LOCATION: This advice sets the preferred location for the data to be the memory belonging to `location`. When CUmemLocation::type is CU_MEM_LOCATION_TYPE_HOST, CUmemLocation::id is ignored and the preferred location is set to be host memory. To set the preferred location to a specific host NUMA node, applications must set CUmemLocation::type to CU_MEM_LOCATION_TYPE_HOST_NUMA and CUmemLocation::id must specify the NUMA ID of the host NUMA node. If CUmemLocation::type is set to CU_MEM_LOCATION_TYPE_HOST_NUMA_CURRENT, CUmemLocation::id will be ignored and the the host NUMA node closest to the calling thread's CPU will be used as the preferred location. If CUmemLocation::type is a CU_MEM_LOCATION_TYPE_DEVICE, then CUmemLocation::id must be a valid device ordinal and the device must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. Setting the preferred location does not cause data to migrate to that location immediately. Instead, it guides the migration policy when a fault occurs on that memory region. If the data is already in its preferred location and the faulting processor can establish a mapping without requiring the data to be migrated, then data migration will be avoided. On the other hand, if the data is not in its preferred location or if a direct mapping cannot be established, then it will be migrated to the processor accessing it. It is important to note that setting the preferred location does not prevent data prefetching done using cuMemPrefetchAsync. Having a preferred location can override the page thrash detection and resolution logic in the Unified Memory driver. Normally, if a page is detected to be constantly thrashing between for example host and device memory, the page may eventually be pinned to host memory by the Unified Memory driver. But if the preferred location is set as device memory, then the page will continue to thrash indefinitely. If CU_MEM_ADVISE_SET_READ_MOSTLY is also set on this memory region or any subset of it, then the policies associated with that advice will override the policies of this advice, unless read accesses from `location` will not result in a read-only copy being created on that procesor as outlined in description for the advice CU_MEM_ADVISE_SET_READ_MOSTLY. If the memory region refers to valid system-allocated pageable memory, and CUmemLocation::type is CU_MEM_LOCATION_TYPE_DEVICE then CUmemLocation::id must be a valid device that has a non-zero alue for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS.


  * CU_MEM_ADVISE_UNSET_PREFERRED_LOCATION: Undoes the effect of CU_MEM_ADVISE_SET_PREFERRED_LOCATION and changes the preferred location to none. The `location` argument is ignored for this advice.


  * CU_MEM_ADVISE_SET_ACCESSED_BY: This advice implies that the data will be accessed by processor `location`. The CUmemLocation::type must be either CU_MEM_LOCATION_TYPE_DEVICE with CUmemLocation::id representing a valid device ordinal or CU_MEM_LOCATION_TYPE_HOST and CUmemLocation::id will be ignored. All other location types are invalid. If CUmemLocation::id is a GPU, then the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS must be non-zero. This advice does not cause data migration and has no impact on the location of the data per se. Instead, it causes the data to always be mapped in the specified processor's page tables, as long as the location of the data permits a mapping to be established. If the data gets migrated for any reason, the mappings are updated accordingly. This advice is recommended in scenarios where data locality is not important, but avoiding faults is. Consider for example a system containing multiple GPUs with peer-to-peer access enabled, where the data located on one GPU is occasionally accessed by peer GPUs. In such scenarios, migrating data over to the other GPUs is not as important because the accesses are infrequent and the overhead of migration may be too high. But preventing faults can still help improve performance, and so having a mapping set up in advance is useful. Note that on CPU access of this data, the data may be migrated to host memory because the CPU typically cannot access device memory directly. Any GPU that had the CU_MEM_ADVISE_SET_ACCESSED_BY flag set for this data will now have its mapping updated to point to the page in host memory. If CU_MEM_ADVISE_SET_READ_MOSTLY is also set on this memory region or any subset of it, then the policies associated with that advice will override the policies of this advice. Additionally, if the preferred location of this memory region or any subset of it is also `location`, then the policies associated with CU_MEM_ADVISE_SET_PREFERRED_LOCATION will override the policies of this advice. If the memory region refers to valid system-allocated pageable memory, and CUmemLocation::type is CU_MEM_LOCATION_TYPE_DEVICE then device in CUmemLocation::id must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS. Additionally, if CUmemLocation::id has a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES, then this call has no effect.


  * CU_MEM_ADVISE_UNSET_ACCESSED_BY: Undoes the effect of CU_MEM_ADVISE_SET_ACCESSED_BY. Any mappings to the data from `location` may be removed at any time causing accesses to result in non-fatal page faults. If the memory region refers to valid system-allocated pageable memory, and CUmemLocation::type is CU_MEM_LOCATION_TYPE_DEVICE then device in CUmemLocation::id must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS. Additionally, if CUmemLocation::id has a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES, then this call has no effect.


  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemDiscardAndPrefetchBatchAsync ( CUdeviceptr* dptrs, size_t* sizes, size_t count, CUmemLocation* prefetchLocs, size_t* prefetchLocIdxs, size_t numPrefetchLocs, unsigned long long flags, CUstream hStream )


Performs a batch of memory discards and prefetches asynchronously.

######  Parameters

`dptrs`
    \- Array of pointers to be discarded
`sizes`
    \- Array of sizes for memory discard operations.
`count`
    \- Size of `dptrs` and `sizes` arrays.
`prefetchLocs`
    \- Array of locations to prefetch to.
`prefetchLocIdxs`
    \- Array of indices to specify which operands each entry in the `prefetchLocs` array applies to. The locations specified in prefetchLocs[k] will be applied to operations starting from prefetchLocIdxs[k] through prefetchLocIdxs[k+1] - 1. Also prefetchLocs[numPrefetchLocs - 1] will apply to copies starting from prefetchLocIdxs[numPrefetchLocs \- 1] through count - 1.
`numPrefetchLocs`
    \- Size of `prefetchLocs` and `prefetchLocIdxs` arrays.
`flags`
    \- Flags reserved for future use. Must be zero.
`hStream`
    \- The stream to enqueue the operations in. Must not be legacy NULL stream.

###### Description

Performs a batch of memory discards followed by prefetches. The batch as a whole executes in stream order but operations within a batch are not guaranteed to execute in any specific order. All devices in the system must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS otherwise the API will return an error.

Calling cuMemDiscardAndPrefetchBatchAsync is semantically equivalent to calling cuMemDiscardBatchAsync followed by cuMemPrefetchBatchAsync, but is more optimal. For more details on what discarding and prefetching imply, please refer to cuMemDiscardBatchAsync and cuMemPrefetchBatchAsync respectively. Note that any reads, writes or prefetches to any part of the memory range that occur simultaneously with this combined discard+prefetch operation result in undefined behavior.

Performs memory discard and prefetch on address ranges specified in `dptrs` and `sizes`. Both arrays must be of the same length as specified by `count`. Each memory range specified must refer to managed memory allocated via cuMemAllocManaged or declared via __managed__ variables or it may also refer to system-allocated memory when all devices have a non-zero value for CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS. Every operation in the batch has to be associated with a valid location to prefetch the address range to and specified in the `prefetchLocs` array. Each entry in this array can apply to more than one operation. This can be done by specifying in the `prefetchLocIdxs` array, the index of the first operation that the corresponding entry in the `prefetchLocs` array applies to. Both `prefetchLocs` and `prefetchLocIdxs` must be of the same length as specified by `numPrefetchLocs`. For example, if a batch has 10 operations listed in dptrs/sizes, the first 6 of which are to be prefetched to one location and the remaining 4 are to be prefetched to another, then `numPrefetchLocs` will be 2, `prefetchLocIdxs` will be {0, 6} and `prefetchLocs` will contain the two set of locations. Note the first entry in `prefetchLocIdxs` must always be 0. Also, each entry must be greater than the previous entry and the last entry should be less than `count`. Furthermore, `numPrefetchLocs` must be lesser than or equal to `count`.

CUresult cuMemDiscardBatchAsync ( CUdeviceptr* dptrs, size_t* sizes, size_t count, unsigned long long flags, CUstream hStream )


Performs a batch of memory discards asynchronously.

######  Parameters

`dptrs`
    \- Array of pointers to be discarded
`sizes`
    \- Array of sizes for memory discard operations.
`count`
    \- Size of `dptrs` and `sizes` arrays.
`flags`
    \- Flags reserved for future use. Must be zero.
`hStream`
    \- The stream to enqueue the operations in. Must not be legacy NULL stream.

###### Description

Performs a batch of memory discards. The batch as a whole executes in stream order but operations within a batch are not guaranteed to execute in any specific order. All devices in the system must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS otherwise the API will return an error.

Discarding a memory range informs the driver that the contents of that range are no longer useful. Discarding memory ranges allows the driver to optimize certain data migrations and can also help reduce memory pressure. This operation can be undone on any part of the range by either writing to it or prefetching it via cuMemPrefetchAsync or cuMemPrefetchBatchAsync. Reading from a discarded range, without a subsequent write or prefetch to that part of the range, will return an indeterminate value. Note that any reads, writes or prefetches to any part of the memory range that occur simultaneously with the discard operation result in undefined behavior.

Performs memory discard on address ranges specified in `dptrs` and `sizes`. Both arrays must be of the same length as specified by `count`. Each memory range specified must refer to managed memory allocated via cuMemAllocManaged or declared via __managed__ variables or it may also refer to system-allocated memory when all devices have a non-zero value for CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS.

CUresult cuMemPrefetchAsync ( CUdeviceptr devPtr, size_t count, CUmemLocation location, unsigned int  flags, CUstream hStream )


Prefetches memory to the specified destination location.

######  Parameters

`devPtr`
    \- Pointer to be prefetched
`count`
    \- Size in bytes
`location`
    \- Location to prefetch to
`flags`
    \- flags for future use, must be zero now.
`hStream`
    \- Stream to enqueue prefetch operation

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Prefetches memory to the specified destination location. `devPtr` is the base device pointer of the memory to be prefetched and `location` specifies the destination location. `count` specifies the number of bytes to copy. `hStream` is the stream in which the operation is enqueued. The memory range must refer to managed memory allocated via cuMemAllocManaged, via cuMemAllocFromPool from a managed memory pool or declared via __managed__ variables.

Specifying CU_MEM_LOCATION_TYPE_DEVICE for CUmemLocation::type will prefetch memory to GPU specified by device ordinal CUmemLocation::id which must have non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. Additionally, `hStream` must be associated with a device that has a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. Specifying CU_MEM_LOCATION_TYPE_HOST as CUmemLocation::type will prefetch data to host memory. Applications can request prefetching memory to a specific host NUMA node by specifying CU_MEM_LOCATION_TYPE_HOST_NUMA for CUmemLocation::type and a valid host NUMA node id in CUmemLocation::id Users can also request prefetching memory to the host NUMA node closest to the current thread's CPU by specifying CU_MEM_LOCATION_TYPE_HOST_NUMA_CURRENT for CUmemLocation::type. Note when CUmemLocation::type is etiher CU_MEM_LOCATION_TYPE_HOST OR CU_MEM_LOCATION_TYPE_HOST_NUMA_CURRENT, CUmemLocation::id will be ignored.

The start address and end address of the memory range will be rounded down and rounded up respectively to be aligned to CPU page size before the prefetch operation is enqueued in the stream.

If no physical memory has been allocated for this region, then this memory region will be populated and mapped on the destination device. If there's insufficient memory to prefetch the desired region, the Unified Memory driver may evict pages from other cuMemAllocManaged allocations to host memory in order to make room. Device memory allocated using cuMemAlloc or cuArrayCreate will not be evicted.

By default, any mappings to the previous location of the migrated pages are removed and mappings for the new location are only setup on the destination location. The exact behavior however also depends on the settings applied to this memory range via cuMemAdvise as described below:

If CU_MEM_ADVISE_SET_READ_MOSTLY was set on any subset of this memory range, then that subset will create a read-only copy of the pages on destination location. If however the destination location is a host NUMA node, then any pages of that subset that are already in another host NUMA node will be transferred to the destination.

If CU_MEM_ADVISE_SET_PREFERRED_LOCATION was called on any subset of this memory range, then the pages will be migrated to `location` even if `location` is not the preferred location of any pages in the memory range.

If CU_MEM_ADVISE_SET_ACCESSED_BY was called on any subset of this memory range, then mappings to those pages from all the appropriate processors are updated to refer to the new location if establishing such a mapping is possible. Otherwise, those mappings are cleared.

Note that this API is not required for functionality and only serves to improve performance by allowing the application to migrate data to a suitable location before it is accessed. Memory accesses to this range are always coherent and are allowed even when the data is actively being migrated.

Note that this function is asynchronous with respect to the host and all work on other devices.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemPrefetchBatchAsync ( CUdeviceptr* dptrs, size_t* sizes, size_t count, CUmemLocation* prefetchLocs, size_t* prefetchLocIdxs, size_t numPrefetchLocs, unsigned long long flags, CUstream hStream )


Performs a batch of memory prefetches asynchronously.

######  Parameters

`dptrs`
    \- Array of pointers to be prefetched
`sizes`
    \- Array of sizes for memory prefetch operations.
`count`
    \- Size of `dptrs` and `sizes` arrays.
`prefetchLocs`
    \- Array of locations to prefetch to.
`prefetchLocIdxs`
    \- Array of indices to specify which operands each entry in the `prefetchLocs` array applies to. The locations specified in prefetchLocs[k] will be applied to copies starting from prefetchLocIdxs[k] through prefetchLocIdxs[k+1] - 1. Also prefetchLocs[numPrefetchLocs - 1] will apply to prefetches starting from prefetchLocIdxs[numPrefetchLocs \- 1] through count - 1.
`numPrefetchLocs`
    \- Size of `prefetchLocs` and `prefetchLocIdxs` arrays.
`flags`
    \- Flags reserved for future use. Must be zero.
`hStream`
    \- The stream to enqueue the operations in. Must not be legacy NULL stream.

###### Description

Performs a batch of memory prefetches. The batch as a whole executes in stream order but operations within a batch are not guaranteed to execute in any specific order. All devices in the system must have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS otherwise the API will return an error.

The semantics of the individual prefetch operations are as described in cuMemPrefetchAsync.

Performs memory prefetch on address ranges specified in `dptrs` and `sizes`. Both arrays must be of the same length as specified by `count`. Each memory range specified must refer to managed memory allocated via cuMemAllocManaged or declared via __managed__ variables or it may also refer to system-allocated memory when all devices have a non-zero value for CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS. The prefetch location for every operation in the batch is specified in the `prefetchLocs` array. Each entry in this array can apply to more than one operation. This can be done by specifying in the `prefetchLocIdxs` array, the index of the first prefetch operation that the corresponding entry in the `prefetchLocs` array applies to. Both `prefetchLocs` and `prefetchLocIdxs` must be of the same length as specified by `numPrefetchLocs`. For example, if a batch has 10 prefetches listed in dptrs/sizes, the first 4 of which are to be prefetched to one location and the remaining 6 are to be prefetched to another, then `numPrefetchLocs` will be 2, `prefetchLocIdxs` will be {0, 4} and `prefetchLocs` will contain the two locations. Note the first entry in `prefetchLocIdxs` must always be 0. Also, each entry must be greater than the previous entry and the last entry should be less than `count`. Furthermore, `numPrefetchLocs` must be lesser than or equal to `count`.

CUresult cuMemRangeGetAttribute ( void* data, size_t dataSize, CUmem_range_attribute attribute, CUdeviceptr devPtr, size_t count )


Query an attribute of a given memory range.

######  Parameters

`data`
    \- A pointers to a memory location where the result of each attribute query will be written to.
`dataSize`
    \- Array containing the size of data
`attribute`
    \- The attribute to query
`devPtr`
    \- Start of the range to query
`count`
    \- Size of the range to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Query an attribute about the memory range starting at `devPtr` with a size of `count` bytes. The memory range must refer to managed memory allocated via cuMemAllocManaged or declared via __managed__ variables.

The `attribute` parameter can take the following values:

  * CU_MEM_RANGE_ATTRIBUTE_READ_MOSTLY: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. The result returned will be 1 if all pages in the given memory range have read-duplication enabled, or 0 otherwise.

  * CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. The result returned will be a GPU device id if all pages in the memory range have that GPU as their preferred location, or it will be CU_DEVICE_CPU if all pages in the memory range have the CPU as their preferred location, or it will be CU_DEVICE_INVALID if either all the pages don't have the same preferred location or some of the pages don't have a preferred location at all. Note that the actual location of the pages in the memory range at the time of the query may be different from the preferred location.

  * CU_MEM_RANGE_ATTRIBUTE_ACCESSED_BY: If this attribute is specified, `data` will be interpreted as an array of 32-bit integers, and `dataSize` must be a non-zero multiple of 4. The result returned will be a list of device ids that had CU_MEM_ADVISE_SET_ACCESSED_BY set for that entire memory range. If any device does not have that advice set for the entire memory range, that device will not be included. If `data` is larger than the number of devices that have that advice set for that memory range, CU_DEVICE_INVALID will be returned in all the extra space provided. For ex., if `dataSize` is 12 (i.e. `data` has 3 elements) and only device 0 has the advice set, then the result returned will be { 0, CU_DEVICE_INVALID, CU_DEVICE_INVALID }. If `data` is smaller than the number of devices that have that advice set, then only as many devices will be returned as can fit in the array. There is no guarantee on which specific devices will be returned, however.

  * CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. The result returned will be the last location to which all pages in the memory range were prefetched explicitly via cuMemPrefetchAsync. This will either be a GPU id or CU_DEVICE_CPU depending on whether the last location for prefetch was a GPU or the CPU respectively. If any page in the memory range was never explicitly prefetched or if all pages were not prefetched to the same location, CU_DEVICE_INVALID will be returned. Note that this simply returns the last location that the application requested to prefetch the memory range to. It gives no indication as to whether the prefetch operation to that location has completed or even begun.

  * CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION_TYPE: If this attribute is specified, `data` will be interpreted as a CUmemLocationType, and `dataSize` must be sizeof(CUmemLocationType). The CUmemLocationType returned will be CU_MEM_LOCATION_TYPE_DEVICE if all pages in the memory range have the same GPU as their preferred location, or CUmemLocationType will be CU_MEM_LOCATION_TYPE_HOST if all pages in the memory range have the CPU as their preferred location, or it will be CU_MEM_LOCATION_TYPE_HOST_NUMA if all the pages in the memory range have the same host NUMA node ID as their preferred location or it will be CU_MEM_LOCATION_TYPE_INVALID if either all the pages don't have the same preferred location or some of the pages don't have a preferred location at all. Note that the actual location type of the pages in the memory range at the time of the query may be different from the preferred location type.
    * CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION_ID: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. If the CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION_TYPE query for the same address range returns CU_MEM_LOCATION_TYPE_DEVICE, it will be a valid device ordinal or if it returns CU_MEM_LOCATION_TYPE_HOST_NUMA, it will be a valid host NUMA node ID or if it returns any other location type, the id should be ignored.

  * CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION_TYPE: If this attribute is specified, `data` will be interpreted as a CUmemLocationType, and `dataSize` must be sizeof(CUmemLocationType). The result returned will be the last location to which all pages in the memory range were prefetched explicitly via cuMemPrefetchAsync. The CUmemLocationType returned will be CU_MEM_LOCATION_TYPE_DEVICE if the last prefetch location was a GPU or CU_MEM_LOCATION_TYPE_HOST if it was the CPU or CU_MEM_LOCATION_TYPE_HOST_NUMA if the last prefetch location was a specific host NUMA node. If any page in the memory range was never explicitly prefetched or if all pages were not prefetched to the same location, CUmemLocationType will be CU_MEM_LOCATION_TYPE_INVALID. Note that this simply returns the last location type that the application requested to prefetch the memory range to. It gives no indication as to whether the prefetch operation to that location has completed or even begun.
    * CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION_ID: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. If the CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION_TYPE query for the same address range returns CU_MEM_LOCATION_TYPE_DEVICE, it will be a valid device ordinal or if it returns CU_MEM_LOCATION_TYPE_HOST_NUMA, it will be a valid host NUMA node ID or if it returns any other location type, the id should be ignored.


  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemRangeGetAttributes ( void** data, size_t* dataSizes, CUmem_range_attribute* attributes, size_t numAttributes, CUdeviceptr devPtr, size_t count )


Query attributes of a given memory range.

######  Parameters

`data`
    \- A two-dimensional array containing pointers to memory locations where the result of each attribute query will be written to.
`dataSizes`
    \- Array containing the sizes of each result
`attributes`
    \- An array of attributes to query (numAttributes and the number of attributes in this array should match)
`numAttributes`
    \- Number of attributes to query
`devPtr`
    \- Start of the range to query
`count`
    \- Size of the range to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Query attributes of the memory range starting at `devPtr` with a size of `count` bytes. The memory range must refer to managed memory allocated via cuMemAllocManaged or declared via __managed__ variables. The `attributes` array will be interpreted to have `numAttributes` entries. The `dataSizes` array will also be interpreted to have `numAttributes` entries. The results of the query will be stored in `data`.

The list of supported attributes are given below. Please refer to cuMemRangeGetAttribute for attribute descriptions and restrictions.

  * CU_MEM_RANGE_ATTRIBUTE_READ_MOSTLY

  * CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION

  * CU_MEM_RANGE_ATTRIBUTE_ACCESSED_BY

  * CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION

  * CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION_TYPE

  * CU_MEM_RANGE_ATTRIBUTE_PREFERRED_LOCATION_ID

  * CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION_TYPE

  * CU_MEM_RANGE_ATTRIBUTE_LAST_PREFETCH_LOCATION_ID


CUresult cuPointerGetAttribute ( void* data, CUpointer_attribute attribute, CUdeviceptr ptr )


Returns information about a pointer.

######  Parameters

`data`
    \- Returned pointer attribute value
`attribute`
    \- Pointer attribute to query
`ptr`
    \- Pointer

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

The supported attributes are:

  * CU_POINTER_ATTRIBUTE_CONTEXT:


Returns in `*data` the CUcontext in which `ptr` was allocated or registered. The type of `data` must be CUcontext *.

If `ptr` was not allocated by, mapped by, or registered with a CUcontext which uses unified virtual addressing then CUDA_ERROR_INVALID_VALUE is returned.

  * CU_POINTER_ATTRIBUTE_MEMORY_TYPE:


Returns in `*data` the physical memory type of the memory that `ptr` addresses as a CUmemorytype enumerated value. The type of `data` must be unsigned int.

If `ptr` addresses device memory then `*data` is set to CU_MEMORYTYPE_DEVICE. The particular CUdevice on which the memory resides is the CUdevice of the CUcontext returned by the CU_POINTER_ATTRIBUTE_CONTEXT attribute of `ptr`.

If `ptr` addresses host memory then `*data` is set to CU_MEMORYTYPE_HOST.

If `ptr` was not allocated by, mapped by, or registered with a CUcontext which uses unified virtual addressing then CUDA_ERROR_INVALID_VALUE is returned.

If the current CUcontext does not support unified virtual addressing then CUDA_ERROR_INVALID_CONTEXT is returned.

  * CU_POINTER_ATTRIBUTE_DEVICE_POINTER:


Returns in `*data` the device pointer value through which `ptr` may be accessed by kernels running in the current CUcontext. The type of `data` must be CUdeviceptr *.

If there exists no device pointer value through which kernels running in the current CUcontext may access `ptr` then CUDA_ERROR_INVALID_VALUE is returned.

If there is no current CUcontext then CUDA_ERROR_INVALID_CONTEXT is returned.

Except in the exceptional disjoint addressing cases discussed below, the value returned in `*data` will equal the input value `ptr`.

  * CU_POINTER_ATTRIBUTE_HOST_POINTER:


Returns in `*data` the host pointer value through which `ptr` may be accessed by by the host program. The type of `data` must be void **. If there exists no host pointer value through which the host program may directly access `ptr` then CUDA_ERROR_INVALID_VALUE is returned.

Except in the exceptional disjoint addressing cases discussed below, the value returned in `*data` will equal the input value `ptr`.

  * CU_POINTER_ATTRIBUTE_P2P_TOKENS:


Returns in `*data` two tokens for use with the nv-p2p.h Linux kernel interface. `data` must be a struct of type CUDA_POINTER_ATTRIBUTE_P2P_TOKENS.

`ptr` must be a pointer to memory obtained from :cuMemAlloc(). Note that p2pToken and vaSpaceToken are only valid for the lifetime of the source allocation. A subsequent allocation at the same address may return completely different tokens. Querying this attribute has a side effect of setting the attribute CU_POINTER_ATTRIBUTE_SYNC_MEMOPS for the region of memory that `ptr` points to.

  * CU_POINTER_ATTRIBUTE_SYNC_MEMOPS:


A boolean attribute which when set, ensures that synchronous memory operations initiated on the region of memory that `ptr` points to will always synchronize. See further documentation in the section titled "API synchronization behavior" to learn more about cases when synchronous memory operations can exhibit asynchronous behavior.

  * CU_POINTER_ATTRIBUTE_BUFFER_ID:


Returns in `*data` a buffer ID which is guaranteed to be unique within the process. `data` must point to an unsigned long long.

`ptr` must be a pointer to memory obtained from a CUDA memory allocation API. Every memory allocation from any of the CUDA memory allocation APIs will have a unique ID over a process lifetime. Subsequent allocations do not reuse IDs from previous freed allocations. IDs are only unique within a single process.

  * CU_POINTER_ATTRIBUTE_IS_MANAGED:


Returns in `*data` a boolean that indicates whether the pointer points to managed memory or not.

If `ptr` is not a valid CUDA pointer then CUDA_ERROR_INVALID_VALUE is returned.

  * CU_POINTER_ATTRIBUTE_DEVICE_ORDINAL:


Returns in `*data` an integer representing a device ordinal of a device against which the memory was allocated or registered.

  * CU_POINTER_ATTRIBUTE_IS_LEGACY_CUDA_IPC_CAPABLE:


Returns in `*data` a boolean that indicates if this pointer maps to an allocation that is suitable for cudaIpcGetMemHandle.

  * CU_POINTER_ATTRIBUTE_RANGE_START_ADDR:


Returns in `*data` the starting address for the allocation referenced by the device pointer `ptr`. Note that this is not necessarily the address of the mapped region, but the address of the mappable address range `ptr` references (e.g. from cuMemAddressReserve).

  * CU_POINTER_ATTRIBUTE_RANGE_SIZE:


Returns in `*data` the size for the allocation referenced by the device pointer `ptr`. Note that this is not necessarily the size of the mapped region, but the size of the mappable address range `ptr` references (e.g. from cuMemAddressReserve). To retrieve the size of the mapped region, see cuMemGetAddressRange

  * CU_POINTER_ATTRIBUTE_MAPPED:


Returns in `*data` a boolean that indicates if this pointer is in a valid address range that is mapped to a backing allocation.

  * CU_POINTER_ATTRIBUTE_ALLOWED_HANDLE_TYPES:


Returns a bitmask of the allowed handle types for an allocation that may be passed to cuMemExportToShareableHandle.

  * CU_POINTER_ATTRIBUTE_MEMPOOL_HANDLE:


Returns in `*data` the handle to the mempool that the allocation was obtained from.

  * CU_POINTER_ATTRIBUTE_IS_HW_DECOMPRESS_CAPABLE:


Returns in `*data` a boolean that indicates whether the pointer points to memory that is capable to be used for hardware accelerated decompression.

Note that for most allocations in the unified virtual address space the host and device pointer for accessing the allocation will be the same. The exceptions to this are

  * user memory registered using cuMemHostRegister

  * host memory allocated using cuMemHostAlloc with the CU_MEMHOSTALLOC_WRITECOMBINED flag For these types of allocation there will exist separate, disjoint host and device addresses for accessing the allocation. In particular

  * The host address will correspond to an invalid unmapped device address (which will result in an exception if accessed from the device)

  * The device address will correspond to an invalid unmapped host address (which will result in an exception if accessed from the host). For these types of allocations, querying CU_POINTER_ATTRIBUTE_HOST_POINTER and CU_POINTER_ATTRIBUTE_DEVICE_POINTER may be used to retrieve the host and device addresses from either address.


CUresult cuPointerGetAttributes ( unsigned int  numAttributes, CUpointer_attribute* attributes, void** data, CUdeviceptr ptr )


Returns information about a pointer.

######  Parameters

`numAttributes`
    \- Number of attributes to query
`attributes`
    \- An array of attributes to query (numAttributes and the number of attributes in this array should match)
`data`
    \- A two-dimensional array containing pointers to memory locations where the result of each attribute query will be written to.
`ptr`
    \- Pointer to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

The supported attributes are (refer to cuPointerGetAttribute for attribute descriptions and restrictions):

  * CU_POINTER_ATTRIBUTE_CONTEXT

  * CU_POINTER_ATTRIBUTE_MEMORY_TYPE

  * CU_POINTER_ATTRIBUTE_DEVICE_POINTER

  * CU_POINTER_ATTRIBUTE_HOST_POINTER

  * CU_POINTER_ATTRIBUTE_SYNC_MEMOPS

  * CU_POINTER_ATTRIBUTE_BUFFER_ID

  * CU_POINTER_ATTRIBUTE_IS_MANAGED

  * CU_POINTER_ATTRIBUTE_DEVICE_ORDINAL

  * CU_POINTER_ATTRIBUTE_RANGE_START_ADDR

  * CU_POINTER_ATTRIBUTE_RANGE_SIZE

  * CU_POINTER_ATTRIBUTE_MAPPED

  * CU_POINTER_ATTRIBUTE_IS_LEGACY_CUDA_IPC_CAPABLE

  * CU_POINTER_ATTRIBUTE_ALLOWED_HANDLE_TYPES

  * CU_POINTER_ATTRIBUTE_MEMPOOL_HANDLE

  * CU_POINTER_ATTRIBUTE_IS_HW_DECOMPRESS_CAPABLE


Unlike cuPointerGetAttribute, this function will not return an error when the `ptr` encountered is not a valid CUDA pointer. Instead, the attributes are assigned default NULL values and CUDA_SUCCESS is returned.

If `ptr` was not allocated by, mapped by, or registered with a CUcontext which uses UVA (Unified Virtual Addressing), CUDA_ERROR_INVALID_CONTEXT is returned.

CUresult cuPointerSetAttribute ( const void* value, CUpointer_attribute attribute, CUdeviceptr ptr )


Set attributes on a previously allocated memory region.

######  Parameters

`value`
    \- Pointer to memory containing the value to be set
`attribute`
    \- Pointer attribute to set
`ptr`
    \- Pointer to a memory region allocated using CUDA memory allocation APIs

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

The supported attributes are:

  * CU_POINTER_ATTRIBUTE_SYNC_MEMOPS:


A boolean attribute that can either be set (1) or unset (0). When set, the region of memory that `ptr` points to is guaranteed to always synchronize memory operations that are synchronous. If there are some previously initiated synchronous memory operations that are pending when this attribute is set, the function does not return until those memory operations are complete. See further documentation in the section titled "API synchronization behavior" to learn more about cases when synchronous memory operations can exhibit asynchronous behavior. `value` will be considered as a pointer to an unsigned integer to which this attribute is to be set.


