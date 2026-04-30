---
name: driver-va
description: '**Source:** group__CUDA__VA.html#group__CUDA__VA'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.14. Virtual Memory Management

**Source:** group__CUDA__VA.html#group__CUDA__VA


### Functions

CUresult cuMemAddressFree ( CUdeviceptr ptr, size_t size )


Free an address range reservation.

######  Parameters

`ptr`
    \- Starting address of the virtual address range to free
`size`
    \- Size of the virtual address region to free

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Frees a virtual address range reserved by cuMemAddressReserve. The size must match what was given to memAddressReserve and the ptr given must match what was returned from memAddressReserve.

CUresult cuMemAddressReserve ( CUdeviceptr* ptr, size_t size, size_t alignment, CUdeviceptr addr, unsigned long long flags )


Allocate an address range reservation.

######  Parameters

`ptr`
    \- Resulting pointer to start of virtual address range allocated
`size`
    \- Size of the reserved virtual address range requested
`alignment`
    \- Alignment of the reserved virtual address range requested
`addr`
    \- Hint address for the start of the address range
`flags`
    \- Currently unused, must be zero

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Reserves a virtual address range based on the given parameters, giving the starting address of the range in `ptr`. This API requires a system that supports UVA. The size and address parameters must be a multiple of the host page size and the alignment must be a power of two or zero for default alignment. If `addr` is 0, then the driver chooses the address at which to place the start of the reservation whereas when it is non-zero then the driver treats it as a hint about where to place the reservation.

CUresult cuMemCreate ( CUmemGenericAllocationHandle* handle, size_t size, const CUmemAllocationProp* prop, unsigned long long flags )


Create a CUDA memory handle representing a memory allocation of a given size described by the given properties.

######  Parameters

`handle`
    \- Value of handle returned. All operations on this allocation are to be performed using this handle.
`size`
    \- Size of the allocation requested
`prop`
    \- Properties of the allocation to create.
`flags`
    \- flags for future use, must be zero now.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

This creates a memory allocation on the target device specified through the `prop` structure. The created allocation will not have any device or host mappings. The generic memory `handle` for the allocation can be mapped to the address space of calling process via cuMemMap. This handle cannot be transmitted directly to other processes (see cuMemExportToShareableHandle). On Windows, the caller must also pass an LPSECURITYATTRIBUTE in `prop` to be associated with this handle which limits or allows access to this handle for a recipient process (see CUmemAllocationProp::win32HandleMetaData for more). The `size` of this allocation must be a multiple of the the value given via cuMemGetAllocationGranularity with the CU_MEM_ALLOC_GRANULARITY_MINIMUM flag. To create a CPU allocation that doesn't target any specific NUMA nodes, applications must set CUmemAllocationProp::CUmemLocation::type to CU_MEM_LOCATION_TYPE_HOST. CUmemAllocationProp::CUmemLocation::id is ignored for HOST allocations. HOST allocations are not IPC capable and CUmemAllocationProp::requestedHandleTypes must be 0, any other value will result in CUDA_ERROR_INVALID_VALUE. To create a CPU allocation targeting a specific host NUMA node, applications must set CUmemAllocationProp::CUmemLocation::type to CU_MEM_LOCATION_TYPE_HOST_NUMA and CUmemAllocationProp::CUmemLocation::id must specify the NUMA ID of the CPU. On systems where NUMA is not available CUmemAllocationProp::CUmemLocation::id must be set to 0. Specifying CU_MEM_LOCATION_TYPE_HOST_NUMA_CURRENT as the CUmemLocation::type will result in CUDA_ERROR_INVALID_VALUE.

Applications that intend to use CU_MEM_HANDLE_TYPE_FABRIC based memory sharing must ensure: (1) `nvidia-caps-imex-channels` character device is created by the driver and is listed under /proc/devices (2) have at least one IMEX channel file accessible by the user launching the application.

When exporter and importer CUDA processes have been granted access to the same IMEX channel, they can securely share memory.

The IMEX channel security model works on a per user basis. Which means all processes under a user can share memory if the user has access to a valid IMEX channel. When multi-user isolation is desired, a separate IMEX channel is required for each user.

These channel files exist in /dev/nvidia-caps-imex-channels/channel* and can be created using standard OS native calls like mknod on Linux. For example: To create channel0 with the major number from /proc/devices users can execute the following command: `mknod /dev/nvidia-caps-imex-channels/channel0 c <major number>=""> 0`

If CUmemAllocationProp::allocFlags::usage contains CU_MEM_CREATE_USAGE_TILE_POOL flag then the memory allocation is intended only to be used as backing tile pool for sparse CUDA arrays and sparse CUDA mipmapped arrays. (see cuMemMapArrayAsync).

CUresult cuMemExportToShareableHandle ( void* shareableHandle, CUmemGenericAllocationHandle handle, CUmemAllocationHandleType handleType, unsigned long long flags )


Exports an allocation to a requested shareable handle type.

######  Parameters

`shareableHandle`
    \- Pointer to the location in which to store the requested handle type
`handle`
    \- CUDA handle for the memory allocation
`handleType`
    \- Type of shareable handle requested (defines type and size of the `shareableHandle` output parameter)
`flags`
    \- Reserved, must be zero

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Given a CUDA memory handle, create a shareable memory allocation handle that can be used to share the memory with other processes. The recipient process can convert the shareable handle back into a CUDA memory handle using cuMemImportFromShareableHandle and map it with cuMemMap. The implementation of what this handle is and how it can be transferred is defined by the requested handle type in `handleType`

Once all shareable handles are closed and the allocation is released, the allocated memory referenced will be released back to the OS and uses of the CUDA handle afterward will lead to undefined behavior.

This API can also be used in conjunction with other APIs (e.g. Vulkan, OpenGL) that support importing memory from the shareable type

CUresult cuMemGetAccess ( unsigned long long* flags, const CUmemLocation* location, CUdeviceptr ptr )


Get the access `flags` set for the given `location` and `ptr`.

######  Parameters

`flags`
    \- Flags set for this location
`location`
    \- Location in which to check the flags for
`ptr`
    \- Address in which to check the access flags for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

CUresult cuMemGetAllocationGranularity ( size_t* granularity, const CUmemAllocationProp* prop, CUmemAllocationGranularity_flags option )


Calculates either the minimal or recommended granularity.

######  Parameters

`granularity`
    Returned granularity.
`prop`
    Property for which to determine the granularity for
`option`
    Determines which granularity to return

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Calculates either the minimal or recommended granularity for a given allocation specification and returns it in granularity. This granularity can be used as a multiple for alignment, size, or address mapping.

CUresult cuMemGetAllocationPropertiesFromHandle ( CUmemAllocationProp* prop, CUmemGenericAllocationHandle handle )


Retrieve the contents of the property structure defining properties for this handle.

######  Parameters

`prop`
    \- Pointer to a properties structure which will hold the information about this handle
`handle`
    \- Handle which to perform the query on

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

CUresult cuMemImportFromShareableHandle ( CUmemGenericAllocationHandle* handle, void* osHandle, CUmemAllocationHandleType shHandleType )


Imports an allocation from a requested shareable handle type.

######  Parameters

`handle`
    \- CUDA Memory handle for the memory allocation.
`osHandle`
    \- Shareable Handle representing the memory allocation that is to be imported.
`shHandleType`
    \- handle type of the exported handle CUmemAllocationHandleType.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

If the current process cannot support the memory described by this shareable handle, this API will error as CUDA_ERROR_NOT_SUPPORTED.

If `shHandleType` is CU_MEM_HANDLE_TYPE_FABRIC and the importer process has not been granted access to the same IMEX channel as the exporter process, this API will error as CUDA_ERROR_NOT_PERMITTED.

Importing shareable handles exported from some graphics APIs(VUlkan, OpenGL, etc) created on devices under an SLI group may not be supported, and thus this API will return CUDA_ERROR_NOT_SUPPORTED. There is no guarantee that the contents of `handle` will be the same CUDA memory handle for the same given OS shareable handle, or the same underlying allocation.

CUresult cuMemMap ( CUdeviceptr ptr, size_t size, size_t offset, CUmemGenericAllocationHandle handle, unsigned long long flags )


Maps an allocation handle to a reserved virtual address range.

######  Parameters

`ptr`
    \- Address where memory will be mapped.
`size`
    \- Size of the memory mapping.
`offset`
    \- Offset into the memory represented by

  * `handle` from which to start mapping
  * Note: currently must be zero.


`handle`
    \- Handle to a shareable memory
`flags`
    \- flags for future use, must be zero now.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_ILLEGAL_STATE

###### Description

Maps bytes of memory represented by `handle` starting from byte `offset` to `size` to address range [`addr`, `addr` \+ `size`]. This range must be an address reservation previously reserved with cuMemAddressReserve, and `offset` \+ `size` must be less than the size of the memory allocation. Both `ptr`, `size`, and `offset` must be a multiple of the value given via cuMemGetAllocationGranularity with the CU_MEM_ALLOC_GRANULARITY_MINIMUM flag. If `handle` represents a multicast object, `ptr`, `size` and `offset` must be aligned to the value returned by cuMulticastGetGranularity with the flag CU_MULTICAST_MINIMUM_GRANULARITY. For best performance however, it is recommended that `ptr`, `size` and `offset` be aligned to the value returned by cuMulticastGetGranularity with the flag CU_MULTICAST_RECOMMENDED_GRANULARITY.

When `handle` represents a multicast object, this call may return CUDA_ERROR_ILLEGAL_STATE if the system configuration is in an illegal state. In such cases, to continue using multicast, verify that the system configuration is in a valid state and all required driver daemons are running properly.

Please note calling cuMemMap does not make the address accessible, the caller needs to update accessibility of a contiguous mapped VA range by calling cuMemSetAccess.

Once a recipient process obtains a shareable memory handle from cuMemImportFromShareableHandle, the process must use cuMemMap to map the memory into its address ranges before setting accessibility with cuMemSetAccess.

cuMemMap can only create mappings on VA range reservations that are not currently mapped.

CUresult cuMemMapArrayAsync ( CUarrayMapInfo* mapInfoList, unsigned int  count, CUstream hStream )


Maps or unmaps subregions of sparse CUDA arrays and sparse CUDA mipmapped arrays.

######  Parameters

`mapInfoList`
    \- List of CUarrayMapInfo
`count`
    \- Count of CUarrayMapInfo in `mapInfoList`
`hStream`
    \- Stream identifier for the stream to use for map or unmap operations

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Performs map or unmap operations on subregions of sparse CUDA arrays and sparse CUDA mipmapped arrays. Each operation is specified by a CUarrayMapInfo entry in the `mapInfoList` array of size `count`. The structure CUarrayMapInfo is defined as follow:


    ‎     typedef struct CUarrayMapInfo_st {
                  CUresourcetype resourceType;
                  union {
                      CUmipmappedArray mipmap;
                      CUarray array;
                  } resource;

                  CUarraySparseSubresourceType subresourceType;
                  union {
                      struct {
                          unsigned int level;
                          unsigned int layer;
                          unsigned int offsetX;
                          unsigned int offsetY;
                          unsigned int offsetZ;
                          unsigned int extentWidth;
                          unsigned int extentHeight;
                          unsigned int extentDepth;
                      } sparseLevel;
                      struct {
                          unsigned int layer;
                          unsigned long long offset;
                          unsigned long long size;
                      } miptail;
                  } subresource;

                  CUmemOperationType memOperationType;

                  CUmemHandleType memHandleType;
                  union {
                      CUmemGenericAllocationHandle memHandle;
                  } memHandle;

                  unsigned long long offset;
                  unsigned int deviceBitMask;
                  unsigned int flags;
                  unsigned int reserved[2];
              } CUarrayMapInfo;

where CUarrayMapInfo::resourceType specifies the type of resource to be operated on. If CUarrayMapInfo::resourceType is set to CUresourcetype::CU_RESOURCE_TYPE_ARRAY then CUarrayMapInfo::resource::array must be set to a valid sparse CUDA array handle. The CUDA array must be either a 2D, 2D layered or 3D CUDA array and must have been allocated using cuArrayCreate or cuArray3DCreate with the flag CUDA_ARRAY3D_SPARSE or CUDA_ARRAY3D_DEFERRED_MAPPING. For CUDA arrays obtained using cuMipmappedArrayGetLevel, CUDA_ERROR_INVALID_VALUE will be returned. If CUarrayMapInfo::resourceType is set to CUresourcetype::CU_RESOURCE_TYPE_MIPMAPPED_ARRAY then CUarrayMapInfo::resource::mipmap must be set to a valid sparse CUDA mipmapped array handle. The CUDA mipmapped array must be either a 2D, 2D layered or 3D CUDA mipmapped array and must have been allocated using cuMipmappedArrayCreate with the flag CUDA_ARRAY3D_SPARSE or CUDA_ARRAY3D_DEFERRED_MAPPING.

CUarrayMapInfo::subresourceType specifies the type of subresource within the resource. CUarraySparseSubresourceType_enum is defined as:


    ‎    typedef enum CUarraySparseSubresourceType_enum {
                  CU_ARRAY_SPARSE_SUBRESOURCE_TYPE_SPARSE_LEVEL = 0
                  CU_ARRAY_SPARSE_SUBRESOURCE_TYPE_MIPTAIL = 1
              } CUarraySparseSubresourceType;

where CUarraySparseSubresourceType::CU_ARRAY_SPARSE_SUBRESOURCE_TYPE_SPARSE_LEVEL indicates a sparse-miplevel which spans at least one tile in every dimension. The remaining miplevels which are too small to span at least one tile in any dimension constitute the mip tail region as indicated by CUarraySparseSubresourceType::CU_ARRAY_SPARSE_SUBRESOURCE_TYPE_MIPTAIL subresource type.

If CUarrayMapInfo::subresourceType is set to CUarraySparseSubresourceType::CU_ARRAY_SPARSE_SUBRESOURCE_TYPE_SPARSE_LEVEL then CUarrayMapInfo::subresource::sparseLevel struct must contain valid array subregion offsets and extents. The CUarrayMapInfo::subresource::sparseLevel::offsetX, CUarrayMapInfo::subresource::sparseLevel::offsetY and CUarrayMapInfo::subresource::sparseLevel::offsetZ must specify valid X, Y and Z offsets respectively. The CUarrayMapInfo::subresource::sparseLevel::extentWidth, CUarrayMapInfo::subresource::sparseLevel::extentHeight and CUarrayMapInfo::subresource::sparseLevel::extentDepth must specify valid width, height and depth extents respectively. These offsets and extents must be aligned to the corresponding tile dimension. For CUDA mipmapped arrays CUarrayMapInfo::subresource::sparseLevel::level must specify a valid mip level index. Otherwise, must be zero. For layered CUDA arrays and layered CUDA mipmapped arrays CUarrayMapInfo::subresource::sparseLevel::layer must specify a valid layer index. Otherwise, must be zero. CUarrayMapInfo::subresource::sparseLevel::offsetZ must be zero and CUarrayMapInfo::subresource::sparseLevel::extentDepth must be set to 1 for 2D and 2D layered CUDA arrays and CUDA mipmapped arrays. Tile extents can be obtained by calling cuArrayGetSparseProperties and cuMipmappedArrayGetSparseProperties

If CUarrayMapInfo::subresourceType is set to CUarraySparseSubresourceType::CU_ARRAY_SPARSE_SUBRESOURCE_TYPE_MIPTAIL then CUarrayMapInfo::subresource::miptail struct must contain valid mip tail offset in CUarrayMapInfo::subresource::miptail::offset and size in CUarrayMapInfo::subresource::miptail::size. Both, mip tail offset and mip tail size must be aligned to the tile size. For layered CUDA mipmapped arrays which don't have the flag CU_ARRAY_SPARSE_PROPERTIES_SINGLE_MIPTAIL set in CUDA_ARRAY_SPARSE_PROPERTIES::flags as returned by cuMipmappedArrayGetSparseProperties, CUarrayMapInfo::subresource::miptail::layer must specify a valid layer index. Otherwise, must be zero.

If CUarrayMapInfo::resource::array or CUarrayMapInfo::resource::mipmap was created with CUDA_ARRAY3D_DEFERRED_MAPPING flag set the CUarrayMapInfo::subresourceType and the contents of CUarrayMapInfo::subresource will be ignored.

CUarrayMapInfo::memOperationType specifies the type of operation. CUmemOperationType is defined as:


    ‎    typedef enum CUmemOperationType_enum {
                  CU_MEM_OPERATION_TYPE_MAP = 1
                  CU_MEM_OPERATION_TYPE_UNMAP = 2
              } CUmemOperationType;

If CUarrayMapInfo::memOperationType is set to CUmemOperationType::CU_MEM_OPERATION_TYPE_MAP then the subresource will be mapped onto the tile pool memory specified by CUarrayMapInfo::memHandle at offset CUarrayMapInfo::offset. The tile pool allocation has to be created by specifying the CU_MEM_CREATE_USAGE_TILE_POOL flag when calling cuMemCreate. Also, CUarrayMapInfo::memHandleType must be set to CUmemHandleType::CU_MEM_HANDLE_TYPE_GENERIC.

If CUarrayMapInfo::memOperationType is set to CUmemOperationType::CU_MEM_OPERATION_TYPE_UNMAP then an unmapping operation is performed. CUarrayMapInfo::memHandle must be NULL.

CUarrayMapInfo::deviceBitMask specifies the list of devices that must map or unmap physical memory. Currently, this mask must have exactly one bit set, and the corresponding device must match the device associated with the stream. If CUarrayMapInfo::memOperationType is set to CUmemOperationType::CU_MEM_OPERATION_TYPE_MAP, the device must also match the device associated with the tile pool memory allocation as specified by CUarrayMapInfo::memHandle.

CUarrayMapInfo::flags and CUarrayMapInfo::reserved[] are unused and must be set to zero.

CUresult cuMemRelease ( CUmemGenericAllocationHandle handle )


Release a memory handle representing a memory allocation which was previously allocated through cuMemCreate.

######  Parameters

`handle`
    Value of handle which was returned previously by cuMemCreate.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Frees the memory that was allocated on a device through cuMemCreate.

The memory allocation will be freed when all outstanding mappings to the memory are unmapped and when all outstanding references to the handle (including it's shareable counterparts) are also released. The generic memory handle can be freed when there are still outstanding mappings made with this handle. Each time a recipient process imports a shareable handle, it needs to pair it with cuMemRelease for the handle to be freed. If `handle` is not a valid handle the behavior is undefined.

CUresult cuMemRetainAllocationHandle ( CUmemGenericAllocationHandle* handle, void* addr )


Given an address `addr`, returns the allocation handle of the backing memory allocation.

######  Parameters

`handle`
    CUDA Memory handle for the backing memory allocation.
`addr`
    Memory address to query, that has been mapped previously.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

The handle is guaranteed to be the same handle value used to map the memory. If the address requested is not mapped, the function will fail. The returned handle must be released with corresponding number of calls to cuMemRelease.

The address `addr`, can be any address in a range previously mapped by cuMemMap, and not necessarily the start address.

CUresult cuMemSetAccess ( CUdeviceptr ptr, size_t size, const CUmemAccessDesc* desc, size_t count )


Set the access flags for each location specified in `desc` for the given virtual address range.

######  Parameters

`ptr`
    \- Starting address for the virtual address range
`size`
    \- Length of the virtual address range
`desc`
    \- Array of CUmemAccessDesc that describe how to change the

  * mapping for each location specified


`count`
    \- Number of CUmemAccessDesc in `desc`

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Given the virtual address range via `ptr` and `size`, and the locations in the array given by `desc` and `count`, set the access flags for the target locations. The range must be a fully mapped address range containing all allocations created by cuMemMap / cuMemCreate. Users cannot specify CU_MEM_LOCATION_TYPE_HOST_NUMA accessibility for allocations created on with other location types. Note: When CUmemAccessDesc::CUmemLocation::type is CU_MEM_LOCATION_TYPE_HOST_NUMA, CUmemAccessDesc::CUmemLocation::id is ignored. When setting the access flags for a virtual address range mapping a multicast object, `ptr` and `size` must be aligned to the value returned by cuMulticastGetGranularity with the flag CU_MULTICAST_MINIMUM_GRANULARITY. For best performance however, it is recommended that `ptr` and `size` be aligned to the value returned by cuMulticastGetGranularity with the flag CU_MULTICAST_RECOMMENDED_GRANULARITY.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemUnmap ( CUdeviceptr ptr, size_t size )


Unmap the backing memory of a given address range.

######  Parameters

`ptr`
    \- Starting address for the virtual address range to unmap
`size`
    \- Size of the virtual address range to unmap

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

The range must be the entire contiguous address range that was mapped to. In other words, cuMemUnmap cannot unmap a sub-range of an address range mapped by cuMemCreate / cuMemMap. Any backing memory allocations will be freed if there are no existing mappings and there are no unreleased memory handles.

When cuMemUnmap returns successfully the address range is converted to an address reservation and can be used for a future calls to cuMemMap. Any new mapping to this virtual address will need to have access granted through cuMemSetAccess, as all mappings start with no accessibility setup.

  *

  * This function exhibits synchronous behavior for most use cases.

