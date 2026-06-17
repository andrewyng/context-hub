---
name: runtime-memory
description: '**Source:** group__CUDART__MEMORY.html#group__CUDART__MEMORY'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.10. Memory Management

**Source:** group__CUDART__MEMORY.html#group__CUDART__MEMORY


### Functions

__host__ cudaError_t cudaArrayGetInfo ( cudaChannelFormatDesc* desc, cudaExtent* extent, unsigned int* flags, cudaArray_t array )


Gets info about the specified cudaArray.

######  Parameters

`desc`
    \- Returned array type
`extent`
    \- Returned array shape. 2D arrays will have depth of zero
`flags`
    \- Returned array flags
`array`
    \- The cudaArray to get info for

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns in `*desc`, `*extent` and `*flags` respectively, the type, shape and flags of `array`.

Any of `*desc`, `*extent` and `*flags` may be specified as NULL.


**See also:**

cuArrayGetDescriptor, cuArray3DGetDescriptor

__host__ cudaError_t cudaArrayGetMemoryRequirements ( cudaArrayMemoryRequirements* memoryRequirements, cudaArray_t array, int  device )


Returns the memory requirements of a CUDA array.

######  Parameters

`memoryRequirements`
    \- Pointer to cudaArrayMemoryRequirements
`array`
    \- CUDA array to get the memory requirements of
`device`
    \- Device to get the memory requirements for

###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Returns the memory requirements of a CUDA array in `memoryRequirements` If the CUDA array is not allocated with flag cudaArrayDeferredMappingcudaErrorInvalidValue will be returned.

The returned value in cudaArrayMemoryRequirements::size represents the total size of the CUDA array. The returned value in cudaArrayMemoryRequirements::alignment represents the alignment necessary for mapping the CUDA array.

**See also:**

cudaMipmappedArrayGetMemoryRequirements

__host__ cudaError_t cudaArrayGetPlane ( cudaArray_t* pPlaneArray, cudaArray_t hArray, unsigned int  planeIdx )


Gets a CUDA array plane from a CUDA array.

######  Parameters

`pPlaneArray`
    \- Returned CUDA array referenced by the `planeIdx`
`hArray`
    \- CUDA array
`planeIdx`
    \- Plane index

###### Returns

cudaSuccess, cudaErrorInvalidValuecudaErrorInvalidResourceHandle

###### Description

Returns in `pPlaneArray` a CUDA array that represents a single format plane of the CUDA array `hArray`.

If `planeIdx` is greater than the maximum number of planes in this array or if the array does not have a multi-planar format e.g: cudaChannelFormatKindNV12, then cudaErrorInvalidValue is returned.

Note that if the `hArray` has format cudaChannelFormatKindNV12, then passing in 0 for `planeIdx` returns a CUDA array of the same size as `hArray` but with one 8-bit channel and cudaChannelFormatKindUnsigned as its format kind. If 1 is passed for `planeIdx`, then the returned CUDA array has half the height and width of `hArray` with two 8-bit channels and cudaChannelFormatKindUnsigned as its format kind.

**See also:**

cuArrayGetPlane

__host__ cudaError_t cudaArrayGetSparseProperties ( cudaArraySparseProperties* sparseProperties, cudaArray_t array )


Returns the layout properties of a sparse CUDA array.

######  Parameters

`sparseProperties`
    \- Pointer to return the cudaArraySparseProperties
`array`
    \- The CUDA array to get the sparse properties of

###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Returns the layout properties of a sparse CUDA array in `sparseProperties`. If the CUDA array is not allocated with flag cudaArraySparsecudaErrorInvalidValue will be returned.

If the returned value in cudaArraySparseProperties::flags contains cudaArraySparsePropertiesSingleMipTail, then cudaArraySparseProperties::miptailSize represents the total size of the array. Otherwise, it will be zero. Also, the returned value in cudaArraySparseProperties::miptailFirstLevel is always zero. Note that the `array` must have been allocated using cudaMallocArray or cudaMalloc3DArray. For CUDA arrays obtained using cudaMipmappedArrayGetLevel, cudaErrorInvalidValue will be returned. Instead, cudaMipmappedArrayGetSparseProperties must be used to obtain the sparse properties of the entire CUDA mipmapped array to which `array` belongs to.

**See also:**

cudaMipmappedArrayGetSparseProperties, cuMemMapArrayAsync

__host__  __device__ cudaError_t cudaFree ( void* devPtr )


Frees memory on the device.

######  Parameters

`devPtr`
    \- Device pointer to memory to free

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Frees the memory space pointed to by `devPtr`, which must have been returned by a previous call to one of the following memory allocation APIs - cudaMalloc(), cudaMallocPitch(), cudaMallocManaged(), cudaMallocAsync(), cudaMallocFromPoolAsync().

Note - This API will not perform any implicit synchronization when the pointer was allocated with cudaMallocAsync or cudaMallocFromPoolAsync. Callers must ensure that all accesses to these pointer have completed before invoking cudaFree. For best performance and memory reuse, users should use cudaFreeAsync to free memory allocated via the stream ordered memory allocator. For all other pointers, this API may perform implicit synchronization.

If cudaFree(`devPtr`) has already been called before, an error is returned. If `devPtr` is 0, no operation is performed. cudaFree() returns cudaErrorValue in case of failure.

The device version of cudaFree cannot be used with a `*devPtr` allocated using the host API, and vice versa.


**See also:**

cudaMalloc, cudaMallocPitch, cudaMallocManaged, cudaMallocArray, cudaFreeArray, cudaMallocAsync, cudaMallocFromPoolAsynccudaMallocHost ( C API), cudaFreeHost, cudaMalloc3D, cudaMalloc3DArray, cudaFreeAsynccudaHostAlloc, cuMemFree

__host__ cudaError_t cudaFreeArray ( cudaArray_t array )


Frees an array on the device.

######  Parameters

`array`
    \- Pointer to array to free

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Frees the CUDA array `array`, which must have been returned by a previous call to cudaMallocArray(). If `devPtr` is 0, no operation is performed.


**See also:**

cudaMalloc, cudaMallocPitch, cudaFree, cudaMallocArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, cuArrayDestroy

__host__ cudaError_t cudaFreeHost ( void* ptr )


Frees page-locked memory.

######  Parameters

`ptr`
    \- Pointer to memory to free

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Frees the memory space pointed to by `hostPtr`, which must have been returned by a previous call to cudaMallocHost() or cudaHostAlloc().


**See also:**

cudaMalloc, cudaMallocPitch, cudaFree, cudaMallocArray, cudaFreeArray, cudaMallocHost ( C API), cudaMalloc3D, cudaMalloc3DArray, cudaHostAlloc, cuMemFreeHost

__host__ cudaError_t cudaFreeMipmappedArray ( cudaMipmappedArray_t mipmappedArray )


Frees a mipmapped array on the device.

######  Parameters

`mipmappedArray`
    \- Pointer to mipmapped array to free

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Frees the CUDA mipmapped array `mipmappedArray`, which must have been returned by a previous call to cudaMallocMipmappedArray(). If `devPtr` is 0, no operation is performed.


**See also:**

cudaMalloc, cudaMallocPitch, cudaFree, cudaMallocArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, cuMipmappedArrayDestroy

__host__ cudaError_t cudaGetMipmappedArrayLevel ( cudaArray_t* levelArray, cudaMipmappedArray_const_t mipmappedArray, unsigned int  level )


Gets a mipmap level of a CUDA mipmapped array.

######  Parameters

`levelArray`
    \- Returned mipmap level CUDA array
`mipmappedArray`
    \- CUDA mipmapped array
`level`
    \- Mipmap level

###### Returns

cudaSuccess, cudaErrorInvalidValuecudaErrorInvalidResourceHandle

###### Description

Returns in `*levelArray` a CUDA array that represents a single mipmap level of the CUDA mipmapped array `mipmappedArray`.

If `level` is greater than the maximum number of levels in this mipmapped array, cudaErrorInvalidValue is returned.

If `mipmappedArray` is NULL, cudaErrorInvalidResourceHandle is returned.


**See also:**

cudaMalloc3D, cudaMalloc, cudaMallocPitch, cudaFree, cudaFreeArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, make_cudaExtent, cuMipmappedArrayGetLevel

__host__ cudaError_t cudaGetSymbolAddress ( void** devPtr, const void* symbol )


Finds the address associated with a CUDA symbol.

######  Parameters

`devPtr`
    \- Return device pointer associated with symbol
`symbol`
    \- Device symbol address

###### Returns

cudaSuccess, cudaErrorInvalidSymbol, cudaErrorNoKernelImageForDevice

###### Description

Returns in `*devPtr` the address of symbol `symbol` on the device. `symbol` is a variable that resides in global or constant memory space. If `symbol` cannot be found, or if `symbol` is not declared in the global or constant memory space, `*devPtr` is unchanged and the error cudaErrorInvalidSymbol is returned.

  *   * Use of a string naming a variable as the `symbol` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaGetSymbolAddress ( C++ API), cudaGetSymbolSize ( C API), cuModuleGetGlobal

__host__ cudaError_t cudaGetSymbolSize ( size_t* size, const void* symbol )


Finds the size of the object associated with a CUDA symbol.

######  Parameters

`size`
    \- Size of object associated with symbol
`symbol`
    \- Device symbol address

###### Returns

cudaSuccess, cudaErrorInvalidSymbol, cudaErrorNoKernelImageForDevice

###### Description

Returns in `*size` the size of symbol `symbol`. `symbol` is a variable that resides in global or constant memory space. If `symbol` cannot be found, or if `symbol` is not declared in global or constant memory space, `*size` is unchanged and the error cudaErrorInvalidSymbol is returned.

  *   * Use of a string naming a variable as the `symbol` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaGetSymbolAddress ( C API), cudaGetSymbolSize ( C++ API), cuModuleGetGlobal

__host__ cudaError_t cudaHostAlloc ( void** pHost, size_t size, unsigned int  flags )


Allocates page-locked memory on the host.

######  Parameters

`pHost`
    \- Device pointer to allocated memory
`size`
    \- Requested allocation size in bytes
`flags`
    \- Requested properties of allocated memory

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates `size` bytes of host memory that is page-locked and accessible to the device. The driver tracks the virtual memory ranges allocated with this function and automatically accelerates calls to functions such as cudaMemcpy(). Since the memory can be accessed directly by the device, it can be read or written with much higher bandwidth than pageable memory obtained with functions such as malloc(). Allocating excessive amounts of pinned memory may degrade system performance, since it reduces the amount of memory available to the system for paging. As a result, this function is best used sparingly to allocate staging areas for data exchange between host and device.

The `flags` parameter enables different options to be specified that affect the allocation, as follows.

  * cudaHostAllocDefault: This flag's value is defined to be 0 and causes cudaHostAlloc() to emulate cudaMallocHost().

  * cudaHostAllocPortable: The memory returned by this call will be considered as pinned memory by all CUDA contexts, not just the one that performed the allocation.

  * cudaHostAllocMapped: Maps the allocation into the CUDA address space. The device pointer to the memory may be obtained by calling cudaHostGetDevicePointer().

  * cudaHostAllocWriteCombined: Allocates the memory as write-combined (WC). WC memory can be transferred across the PCI Express bus more quickly on some system configurations, but cannot be read efficiently by most CPUs. WC memory is a good option for buffers that will be written by the CPU and read by the device via mapped pinned memory or host->device transfers.


All of these flags are orthogonal to one another: a developer may allocate memory that is portable, mapped and/or write-combined with no restrictions.

In order for the cudaHostAllocMapped flag to have any effect, the CUDA context must support the cudaDeviceMapHost flag, which can be checked via cudaGetDeviceFlags(). The cudaDeviceMapHost flag is implicitly set for contexts created via the runtime API.

The cudaHostAllocMapped flag may be specified on CUDA contexts for devices that do not support mapped pinned memory. The failure is deferred to cudaHostGetDevicePointer() because the memory may be mapped into other CUDA contexts via the cudaHostAllocPortable flag.

Memory allocated by this function must be freed with cudaFreeHost().


**See also:**

cudaSetDeviceFlags, cudaMallocHost ( C API), cudaFreeHost, cudaGetDeviceFlags, cuMemHostAlloc

__host__ cudaError_t cudaHostGetDevicePointer ( void** pDevice, void* pHost, unsigned int  flags )


Passes back device pointer of mapped host memory allocated by cudaHostAlloc or registered by cudaHostRegister.

######  Parameters

`pDevice`
    \- Returned device pointer for mapped memory
`pHost`
    \- Requested host pointer mapping
`flags`
    \- Flags for extensions (must be 0 for now)

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Passes back the device pointer corresponding to the mapped, pinned host buffer allocated by cudaHostAlloc() or registered by cudaHostRegister().

cudaHostGetDevicePointer() will fail if the cudaDeviceMapHost flag was not specified before deferred context creation occurred, or if called on a device that does not support mapped, pinned memory.

For devices that have a non-zero value for the device attribute cudaDevAttrCanUseHostPointerForRegisteredMem, the memory can also be accessed from the device using the host pointer `pHost`. The device pointer returned by cudaHostGetDevicePointer() may or may not match the original host pointer `pHost` and depends on the devices visible to the application. If all devices visible to the application have a non-zero value for the device attribute, the device pointer returned by cudaHostGetDevicePointer() will match the original pointer `pHost`. If any device visible to the application has a zero value for the device attribute, the device pointer returned by cudaHostGetDevicePointer() will not match the original host pointer `pHost`, but it will be suitable for use on all devices provided Unified Virtual Addressing is enabled. In such systems, it is valid to access the memory using either pointer on devices that have a non-zero value for the device attribute. Note however that such devices should access the memory using only of the two pointers and not both.

`flags` provides for future releases. For now, it must be set to 0.


**See also:**

cudaSetDeviceFlags, cudaHostAlloc, cuMemHostGetDevicePointer

__host__ cudaError_t cudaHostGetFlags ( unsigned int* pFlags, void* pHost )


Passes back flags used to allocate pinned host memory allocated by cudaHostAlloc.

######  Parameters

`pFlags`
    \- Returned flags word
`pHost`
    \- Host pointer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

cudaHostGetFlags() will fail if the input pointer does not reside in an address range allocated by cudaHostAlloc().


**See also:**

cudaHostAlloc, cuMemHostGetFlags

__host__ cudaError_t cudaHostRegister ( void* ptr, size_t size, unsigned int  flags )


Registers an existing host memory range for use by CUDA.

######  Parameters

`ptr`
    \- Host pointer to memory to page-lock
`size`
    \- Size in bytes of the address range to page-lock in bytes
`flags`
    \- Flags for allocation request

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation, cudaErrorHostMemoryAlreadyRegistered, cudaErrorNotSupported

###### Description

Page-locks the memory range specified by `ptr` and `size` and maps it for the device(s) as specified by `flags`. This memory range also is added to the same tracking mechanism as cudaHostAlloc() to automatically accelerate calls to functions such as cudaMemcpy(). Since the memory can be accessed directly by the device, it can be read or written with much higher bandwidth than pageable memory that has not been registered. Page-locking excessive amounts of memory may degrade system performance, since it reduces the amount of memory available to the system for paging. As a result, this function is best used sparingly to register staging areas for data exchange between host and device.

On systems where pageableMemoryAccessUsesHostPageTables is true, cudaHostRegister will not page-lock the memory range specified by `ptr` but only populate unpopulated pages.

cudaHostRegister is supported only on I/O coherent devices that have a non-zero value for the device attribute cudaDevAttrHostRegisterSupported.

The `flags` parameter enables different options to be specified that affect the allocation, as follows.

  * cudaHostRegisterDefault: On a system with unified virtual addressing, the memory will be both mapped and portable. On a system with no unified virtual addressing, the memory will be neither mapped nor portable.


  * cudaHostRegisterPortable: The memory returned by this call will be considered as pinned memory by all CUDA contexts, not just the one that performed the allocation.


  * cudaHostRegisterMapped: Maps the allocation into the CUDA address space. The device pointer to the memory may be obtained by calling cudaHostGetDevicePointer().


  * cudaHostRegisterIoMemory: The passed memory pointer is treated as pointing to some memory-mapped I/O space, e.g. belonging to a third-party PCIe device, and it will marked as non cache-coherent and contiguous.


  * cudaHostRegisterReadOnly: The passed memory pointer is treated as pointing to memory that is considered read-only by the device. On platforms without cudaDevAttrPageableMemoryAccessUsesHostPageTables, this flag is required in order to register memory mapped to the CPU as read-only. Support for the use of this flag can be queried from the device attribute cudaDevAttrHostRegisterReadOnlySupported. Using this flag with a current context associated with a device that does not have this attribute set will cause cudaHostRegister to error with cudaErrorNotSupported.


All of these flags are orthogonal to one another: a developer may page-lock memory that is portable or mapped with no restrictions.

The CUDA context must have been created with the cudaMapHost flag in order for the cudaHostRegisterMapped flag to have any effect.

The cudaHostRegisterMapped flag may be specified on CUDA contexts for devices that do not support mapped pinned memory. The failure is deferred to cudaHostGetDevicePointer() because the memory may be mapped into other CUDA contexts via the cudaHostRegisterPortable flag.

For devices that have a non-zero value for the device attribute cudaDevAttrCanUseHostPointerForRegisteredMem, the memory can also be accessed from the device using the host pointer `ptr`. The device pointer returned by cudaHostGetDevicePointer() may or may not match the original host pointer `ptr` and depends on the devices visible to the application. If all devices visible to the application have a non-zero value for the device attribute, the device pointer returned by cudaHostGetDevicePointer() will match the original pointer `ptr`. If any device visible to the application has a zero value for the device attribute, the device pointer returned by cudaHostGetDevicePointer() will not match the original host pointer `ptr`, but it will be suitable for use on all devices provided Unified Virtual Addressing is enabled. In such systems, it is valid to access the memory using either pointer on devices that have a non-zero value for the device attribute. Note however that such devices should access the memory using only of the two pointers and not both.

The memory page-locked by this function must be unregistered with cudaHostUnregister().


**See also:**

cudaHostUnregister, cudaHostGetFlags, cudaHostGetDevicePointer, cuMemHostRegister

__host__ cudaError_t cudaHostUnregister ( void* ptr )


Unregisters a memory range that was registered with cudaHostRegister.

######  Parameters

`ptr`
    \- Host pointer to memory to unregister

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorHostMemoryNotRegistered

###### Description

Unmaps the memory range whose base address is specified by `ptr`, and makes it pageable again.

The base address must be the same one specified to cudaHostRegister().


**See also:**

cudaHostUnregister, cuMemHostUnregister

__host__  __device__ cudaError_t cudaMalloc ( void** devPtr, size_t size )


Allocate memory on the device.

######  Parameters

`devPtr`
    \- Pointer to allocated device memory
`size`
    \- Requested allocation size in bytes

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates `size` bytes of linear memory on the device and returns in `*devPtr` a pointer to the allocated memory. The allocated memory is suitably aligned for any kind of variable. The memory is not cleared. cudaMalloc() returns cudaErrorMemoryAllocation in case of failure.

The device version of cudaFree cannot be used with a `*devPtr` allocated using the host API, and vice versa.


**See also:**

cudaMallocPitch, cudaFree, cudaMallocArray, cudaFreeArray, cudaMalloc3D, cudaMalloc3DArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, cuMemAlloc

__host__ cudaError_t cudaMalloc3D ( cudaPitchedPtr* pitchedDevPtr, cudaExtent extent )


Allocates logical 1D, 2D, or 3D memory objects on the device.

######  Parameters

`pitchedDevPtr`
    \- Pointer to allocated pitched device memory
`extent`
    \- Requested allocation size (`width` field in bytes)

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates at least `width` * `height` * `depth` bytes of linear memory on the device and returns a cudaPitchedPtr in which `ptr` is a pointer to the allocated memory. The function may pad the allocation to ensure hardware alignment requirements are met. The pitch returned in the `pitch` field of `pitchedDevPtr` is the width in bytes of the allocation.

The returned cudaPitchedPtr contains additional fields `xsize` and `ysize`, the logical width and height of the allocation, which are equivalent to the `width` and `height``extent` parameters provided by the programmer during allocation.

For allocations of 2D and 3D objects, it is highly recommended that programmers perform allocations using cudaMalloc3D() or cudaMallocPitch(). Due to alignment restrictions in the hardware, this is especially true if the application will be performing memory copies involving 2D or 3D objects (whether linear memory or CUDA arrays).


**See also:**

cudaMallocPitch, cudaFree, cudaMemcpy3D, cudaMemset3D, cudaMalloc3DArray, cudaMallocArray, cudaFreeArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, make_cudaPitchedPtr, make_cudaExtent, cuMemAllocPitch

__host__ cudaError_t cudaMalloc3DArray ( cudaArray_t* array, const cudaChannelFormatDesc* desc, cudaExtent extent, unsigned int  flags = 0 )


Allocate an array on the device.

######  Parameters

`array`
    \- Pointer to allocated array in device memory
`desc`
    \- Requested channel format
`extent`
    \- Requested allocation size (`width` field in elements)
`flags`
    \- Flags for extensions

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates a CUDA array according to the cudaChannelFormatDesc structure `desc` and returns a handle to the new CUDA array in `*array`.

The cudaChannelFormatDesc is defined as:


    ‎    struct cudaChannelFormatDesc {
                  int x, y, z, w;
                  enum cudaChannelFormatKind
                      f;
              };

where cudaChannelFormatKind is one of cudaChannelFormatKindSigned, cudaChannelFormatKindUnsigned, or cudaChannelFormatKindFloat.

cudaMalloc3DArray() can allocate the following:

  * A 1D array is allocated if the height and depth extents are both zero.

  * A 2D array is allocated if only the depth extent is zero.

  * A 3D array is allocated if all three extents are non-zero.

  * A 1D layered CUDA array is allocated if only the height extent is zero and the cudaArrayLayered flag is set. Each layer is a 1D array. The number of layers is determined by the depth extent.

  * A 2D layered CUDA array is allocated if all three extents are non-zero and the cudaArrayLayered flag is set. Each layer is a 2D array. The number of layers is determined by the depth extent.

  * A cubemap CUDA array is allocated if all three extents are non-zero and the cudaArrayCubemap flag is set. Width must be equal to height, and depth must be six. A cubemap is a special type of 2D layered CUDA array, where the six layers represent the six faces of a cube. The order of the six layers in memory is the same as that listed in cudaGraphicsCubeFace.

  * A cubemap layered CUDA array is allocated if all three extents are non-zero, and both, cudaArrayCubemap and cudaArrayLayered flags are set. Width must be equal to height, and depth must be a multiple of six. A cubemap layered CUDA array is a special type of 2D layered CUDA array that consists of a collection of cubemaps. The first six layers represent the first cubemap, the next six layers form the second cubemap, and so on.


The `flags` parameter enables different options to be specified that affect the allocation, as follows.

  * cudaArrayDefault: This flag's value is defined to be 0 and provides default array allocation

  * cudaArrayLayered: Allocates a layered CUDA array, with the depth extent indicating the number of layers

  * cudaArrayCubemap: Allocates a cubemap CUDA array. Width must be equal to height, and depth must be six. If the cudaArrayLayered flag is also set, depth must be a multiple of six.

  * cudaArraySurfaceLoadStore: Allocates a CUDA array that could be read from or written to using a surface reference.

  * cudaArrayTextureGather: This flag indicates that texture gather operations will be performed on the CUDA array. Texture gather can only be performed on 2D CUDA arrays.

  * cudaArraySparse: Allocates a CUDA array without physical backing memory. The subregions within this sparse array can later be mapped onto a physical memory allocation by calling cuMemMapArrayAsync. This flag can only be used for creating 2D, 3D or 2D layered sparse CUDA arrays. The physical backing memory must be allocated via cuMemCreate.

  * cudaArrayDeferredMapping: Allocates a CUDA array without physical backing memory. The entire array can later be mapped onto a physical memory allocation by calling cuMemMapArrayAsync. The physical backing memory must be allocated via cuMemCreate.


The width, height and depth extents must meet certain size requirements as listed in the following table. All values are specified in elements.

Note that 2D CUDA arrays have different size requirements if the cudaArrayTextureGather flag is set. In that case, the valid range for (width, height, depth) is ((1,maxTexture2DGather[0]), (1,maxTexture2DGather[1]), 0).

CUDA array type | Valid extents that must always be met {(width range in elements), (height range), (depth range)}  | Valid extents with cudaArraySurfaceLoadStore set {(width range in elements), (height range), (depth range)}
---|---|---
1D | { (1,maxTexture1D), 0, 0 } | { (1,maxSurface1D), 0, 0 }
2D | { (1,maxTexture2D[0]), (1,maxTexture2D[1]), 0 } | { (1,maxSurface2D[0]), (1,maxSurface2D[1]), 0 }
3D | { (1,maxTexture3D[0]), (1,maxTexture3D[1]), (1,maxTexture3D[2]) } OR { (1,maxTexture3DAlt[0]), (1,maxTexture3DAlt[1]), (1,maxTexture3DAlt[2]) }  | { (1,maxSurface3D[0]), (1,maxSurface3D[1]), (1,maxSurface3D[2]) }
1D Layered | { (1,maxTexture1DLayered[0]), 0, (1,maxTexture1DLayered[1]) } | { (1,maxSurface1DLayered[0]), 0, (1,maxSurface1DLayered[1]) }
2D Layered | { (1,maxTexture2DLayered[0]), (1,maxTexture2DLayered[1]), (1,maxTexture2DLayered[2]) }  | { (1,maxSurface2DLayered[0]), (1,maxSurface2DLayered[1]), (1,maxSurface2DLayered[2]) }
Cubemap | { (1,maxTextureCubemap), (1,maxTextureCubemap), 6 } | { (1,maxSurfaceCubemap), (1,maxSurfaceCubemap), 6 }
Cubemap Layered | { (1,maxTextureCubemapLayered[0]), (1,maxTextureCubemapLayered[0]), (1,maxTextureCubemapLayered[1]) }  | { (1,maxSurfaceCubemapLayered[0]), (1,maxSurfaceCubemapLayered[0]), (1,maxSurfaceCubemapLayered[1]) }


**See also:**

cudaMalloc3D, cudaMalloc, cudaMallocPitch, cudaFree, cudaFreeArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, make_cudaExtent, cuArray3DCreate

__host__ cudaError_t cudaMallocArray ( cudaArray_t* array, const cudaChannelFormatDesc* desc, size_t width, size_t height = 0, unsigned int  flags = 0 )


Allocate an array on the device.

######  Parameters

`array`
    \- Pointer to allocated array in device memory
`desc`
    \- Requested channel format
`width`
    \- Requested array allocation width
`height`
    \- Requested array allocation height
`flags`
    \- Requested properties of allocated array

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates a CUDA array according to the cudaChannelFormatDesc structure `desc` and returns a handle to the new CUDA array in `*array`.

The cudaChannelFormatDesc is defined as:


    ‎    struct cudaChannelFormatDesc {
                  int x, y, z, w;
              enum cudaChannelFormatKind
                      f;
              };

where cudaChannelFormatKind is one of cudaChannelFormatKindSigned, cudaChannelFormatKindUnsigned, or cudaChannelFormatKindFloat.

The `flags` parameter enables different options to be specified that affect the allocation, as follows.

  * cudaArrayDefault: This flag's value is defined to be 0 and provides default array allocation

  * cudaArraySurfaceLoadStore: Allocates an array that can be read from or written to using a surface reference

  * cudaArrayTextureGather: This flag indicates that texture gather operations will be performed on the array.

  * cudaArraySparse: Allocates a CUDA array without physical backing memory. The subregions within this sparse array can later be mapped onto a physical memory allocation by calling cuMemMapArrayAsync. The physical backing memory must be allocated via cuMemCreate.

  * cudaArrayDeferredMapping: Allocates a CUDA array without physical backing memory. The entire array can later be mapped onto a physical memory allocation by calling cuMemMapArrayAsync. The physical backing memory must be allocated via cuMemCreate.


`width` and `height` must meet certain size requirements. See cudaMalloc3DArray() for more details.


**See also:**

cudaMalloc, cudaMallocPitch, cudaFree, cudaFreeArray, cudaMallocHost ( C API), cudaFreeHost, cudaMalloc3D, cudaMalloc3DArray, cudaHostAlloc, cuArrayCreate

__host__ cudaError_t cudaMallocHost ( void** ptr, size_t size )


Allocates page-locked memory on the host.

######  Parameters

`ptr`
    \- Pointer to allocated host memory
`size`
    \- Requested allocation size in bytes

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates `size` bytes of host memory that is page-locked and accessible to the device. The driver tracks the virtual memory ranges allocated with this function and automatically accelerates calls to functions such as cudaMemcpy*(). Since the memory can be accessed directly by the device, it can be read or written with much higher bandwidth than pageable memory obtained with functions such as malloc().

On systems where pageableMemoryAccessUsesHostPageTables is true, cudaMallocHost may not page-lock the allocated memory.

Page-locking excessive amounts of memory with cudaMallocHost() may degrade system performance, since it reduces the amount of memory available to the system for paging. As a result, this function is best used sparingly to allocate staging areas for data exchange between host and device.


**See also:**

cudaMalloc, cudaMallocPitch, cudaMallocArray, cudaMalloc3D, cudaMalloc3DArray, cudaHostAlloc, cudaFree, cudaFreeArray, cudaMallocHost ( C++ API), cudaFreeHost, cudaHostAlloc, cuMemAllocHost

__host__ cudaError_t cudaMallocManaged ( void** devPtr, size_t size, unsigned int  flags = cudaMemAttachGlobal )


Allocates memory that will be automatically managed by the Unified Memory system.

######  Parameters

`devPtr`
    \- Pointer to allocated device memory
`size`
    \- Requested allocation size in bytes
`flags`
    \- Must be either cudaMemAttachGlobal or cudaMemAttachHost (defaults to cudaMemAttachGlobal)

###### Returns

cudaSuccess, cudaErrorMemoryAllocation, cudaErrorNotSupported, cudaErrorInvalidValue

###### Description

Allocates `size` bytes of managed memory on the device and returns in `*devPtr` a pointer to the allocated memory. If the device doesn't support allocating managed memory, cudaErrorNotSupported is returned. Support for managed memory can be queried using the device attribute cudaDevAttrManagedMemory. The allocated memory is suitably aligned for any kind of variable. The memory is not cleared. If `size` is 0, cudaMallocManaged returns cudaErrorInvalidValue. The pointer is valid on the CPU and on all GPUs in the system that support managed memory. All accesses to this pointer must obey the Unified Memory programming model.

`flags` specifies the default stream association for this allocation. `flags` must be one of cudaMemAttachGlobal or cudaMemAttachHost. The default value for `flags` is cudaMemAttachGlobal. If cudaMemAttachGlobal is specified, then this memory is accessible from any stream on any device. If cudaMemAttachHost is specified, then the allocation should not be accessed from devices that have a zero value for the device attribute cudaDevAttrConcurrentManagedAccess; an explicit call to cudaStreamAttachMemAsync will be required to enable access on such devices.

If the association is later changed via cudaStreamAttachMemAsync to a single stream, the default association, as specifed during cudaMallocManaged, is restored when that stream is destroyed. For __managed__ variables, the default association is always cudaMemAttachGlobal. Note that destroying a stream is an asynchronous operation, and as a result, the change to default association won't happen until all work in the stream has completed.

Memory allocated with cudaMallocManaged should be released with cudaFree.

Device memory oversubscription is possible for GPUs that have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess. Managed memory on such GPUs may be evicted from device memory to host memory at any time by the Unified Memory driver in order to make room for other allocations.

In a system where all GPUs have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess, managed memory may not be populated when this API returns and instead may be populated on access. In such systems, managed memory can migrate to any processor's memory at any time. The Unified Memory driver will employ heuristics to maintain data locality and prevent excessive page faults to the extent possible. The application can also guide the driver about memory usage patterns via cudaMemAdvise. The application can also explicitly migrate memory to a desired processor's memory via cudaMemPrefetchAsync.

In a multi-GPU system where all of the GPUs have a zero value for the device attribute cudaDevAttrConcurrentManagedAccess and all the GPUs have peer-to-peer support with each other, the physical storage for managed memory is created on the GPU which is active at the time cudaMallocManaged is called. All other GPUs will reference the data at reduced bandwidth via peer mappings over the PCIe bus. The Unified Memory driver does not migrate memory among such GPUs.

In a multi-GPU system where not all GPUs have peer-to-peer support with each other and where the value of the device attribute cudaDevAttrConcurrentManagedAccess is zero for at least one of those GPUs, the location chosen for physical storage of managed memory is system-dependent.

  * On Linux, the location chosen will be device memory as long as the current set of active contexts are on devices that either have peer-to-peer support with each other or have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess. If there is an active context on a GPU that does not have a non-zero value for that device attribute and it does not have peer-to-peer support with the other devices that have active contexts on them, then the location for physical storage will be 'zero-copy' or host memory. Note that this means that managed memory that is located in device memory is migrated to host memory if a new context is created on a GPU that doesn't have a non-zero value for the device attribute and does not support peer-to-peer with at least one of the other devices that has an active context. This in turn implies that context creation may fail if there is insufficient host memory to migrate all managed allocations.

  * On Windows, the physical storage is always created in 'zero-copy' or host memory. All GPUs will reference the data at reduced bandwidth over the PCIe bus. In these circumstances, use of the environment variable CUDA_VISIBLE_DEVICES is recommended to restrict CUDA to only use those GPUs that have peer-to-peer support. Alternatively, users can also set CUDA_MANAGED_FORCE_DEVICE_ALLOC to a non-zero value to force the driver to always use device memory for physical storage. When this environment variable is set to a non-zero value, all devices used in that process that support managed memory have to be peer-to-peer compatible with each other. The error cudaErrorInvalidDevice will be returned if a device that supports managed memory is used and it is not peer-to-peer compatible with any of the other managed memory supporting devices that were previously used in that process, even if cudaDeviceReset has been called on those devices. These environment variables are described in the CUDA programming guide under the "CUDA environment variables" section.


**See also:**

cudaMallocPitch, cudaFree, cudaMallocArray, cudaFreeArray, cudaMalloc3D, cudaMalloc3DArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, cudaDeviceGetAttribute, cudaStreamAttachMemAsync, cuMemAllocManaged

__host__ cudaError_t cudaMallocMipmappedArray ( cudaMipmappedArray_t* mipmappedArray, const cudaChannelFormatDesc* desc, cudaExtent extent, unsigned int  numLevels, unsigned int  flags = 0 )


Allocate a mipmapped array on the device.

######  Parameters

`mipmappedArray`
    \- Pointer to allocated mipmapped array in device memory
`desc`
    \- Requested channel format
`extent`
    \- Requested allocation size (`width` field in elements)
`numLevels`
    \- Number of mipmap levels to allocate
`flags`
    \- Flags for extensions

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates a CUDA mipmapped array according to the cudaChannelFormatDesc structure `desc` and returns a handle to the new CUDA mipmapped array in `*mipmappedArray`. `numLevels` specifies the number of mipmap levels to be allocated. This value is clamped to the range [1, 1 + floor(log2(max(width, height, depth)))].

The cudaChannelFormatDesc is defined as:


    ‎    struct cudaChannelFormatDesc {
                  int x, y, z, w;
                  enum cudaChannelFormatKind
                      f;
              };

where cudaChannelFormatKind is one of cudaChannelFormatKindSigned, cudaChannelFormatKindUnsigned, or cudaChannelFormatKindFloat.

cudaMallocMipmappedArray() can allocate the following:

  * A 1D mipmapped array is allocated if the height and depth extents are both zero.

  * A 2D mipmapped array is allocated if only the depth extent is zero.

  * A 3D mipmapped array is allocated if all three extents are non-zero.

  * A 1D layered CUDA mipmapped array is allocated if only the height extent is zero and the cudaArrayLayered flag is set. Each layer is a 1D mipmapped array. The number of layers is determined by the depth extent.

  * A 2D layered CUDA mipmapped array is allocated if all three extents are non-zero and the cudaArrayLayered flag is set. Each layer is a 2D mipmapped array. The number of layers is determined by the depth extent.

  * A cubemap CUDA mipmapped array is allocated if all three extents are non-zero and the cudaArrayCubemap flag is set. Width must be equal to height, and depth must be six. The order of the six layers in memory is the same as that listed in cudaGraphicsCubeFace.

  * A cubemap layered CUDA mipmapped array is allocated if all three extents are non-zero, and both, cudaArrayCubemap and cudaArrayLayered flags are set. Width must be equal to height, and depth must be a multiple of six. A cubemap layered CUDA mipmapped array is a special type of 2D layered CUDA mipmapped array that consists of a collection of cubemap mipmapped arrays. The first six layers represent the first cubemap mipmapped array, the next six layers form the second cubemap mipmapped array, and so on.


The `flags` parameter enables different options to be specified that affect the allocation, as follows.

  * cudaArrayDefault: This flag's value is defined to be 0 and provides default mipmapped array allocation

  * cudaArrayLayered: Allocates a layered CUDA mipmapped array, with the depth extent indicating the number of layers

  * cudaArrayCubemap: Allocates a cubemap CUDA mipmapped array. Width must be equal to height, and depth must be six. If the cudaArrayLayered flag is also set, depth must be a multiple of six.

  * cudaArraySurfaceLoadStore: This flag indicates that individual mipmap levels of the CUDA mipmapped array will be read from or written to using a surface reference.

  * cudaArrayTextureGather: This flag indicates that texture gather operations will be performed on the CUDA array. Texture gather can only be performed on 2D CUDA mipmapped arrays, and the gather operations are performed only on the most detailed mipmap level.

  * cudaArraySparse: Allocates a CUDA mipmapped array without physical backing memory. The subregions within this sparse array can later be mapped onto a physical memory allocation by calling cuMemMapArrayAsync. This flag can only be used for creating 2D, 3D or 2D layered sparse CUDA mipmapped arrays. The physical backing memory must be allocated via cuMemCreate.

  * cudaArrayDeferredMapping: Allocates a CUDA mipmapped array without physical backing memory. The entire array can later be mapped onto a physical memory allocation by calling cuMemMapArrayAsync. The physical backing memory must be allocated via cuMemCreate.


The width, height and depth extents must meet certain size requirements as listed in the following table. All values are specified in elements.

CUDA array type | Valid extents that must always be met {(width range in elements), (height range), (depth range)}  | Valid extents with cudaArraySurfaceLoadStore set {(width range in elements), (height range), (depth range)}
---|---|---
1D | { (1,maxTexture1DMipmap), 0, 0 } | { (1,maxSurface1D), 0, 0 }
2D | { (1,maxTexture2DMipmap[0]), (1,maxTexture2DMipmap[1]), 0 } | { (1,maxSurface2D[0]), (1,maxSurface2D[1]), 0 }
3D | { (1,maxTexture3D[0]), (1,maxTexture3D[1]), (1,maxTexture3D[2]) } OR { (1,maxTexture3DAlt[0]), (1,maxTexture3DAlt[1]), (1,maxTexture3DAlt[2]) }  | { (1,maxSurface3D[0]), (1,maxSurface3D[1]), (1,maxSurface3D[2]) }
1D Layered | { (1,maxTexture1DLayered[0]), 0, (1,maxTexture1DLayered[1]) } | { (1,maxSurface1DLayered[0]), 0, (1,maxSurface1DLayered[1]) }
2D Layered | { (1,maxTexture2DLayered[0]), (1,maxTexture2DLayered[1]), (1,maxTexture2DLayered[2]) }  | { (1,maxSurface2DLayered[0]), (1,maxSurface2DLayered[1]), (1,maxSurface2DLayered[2]) }
Cubemap | { (1,maxTextureCubemap), (1,maxTextureCubemap), 6 } | { (1,maxSurfaceCubemap), (1,maxSurfaceCubemap), 6 }
Cubemap Layered | { (1,maxTextureCubemapLayered[0]), (1,maxTextureCubemapLayered[0]), (1,maxTextureCubemapLayered[1]) }  | { (1,maxSurfaceCubemapLayered[0]), (1,maxSurfaceCubemapLayered[0]), (1,maxSurfaceCubemapLayered[1]) }


**See also:**

cudaMalloc3D, cudaMalloc, cudaMallocPitch, cudaFree, cudaFreeArray, cudaMallocHost ( C API), cudaFreeHost, cudaHostAlloc, make_cudaExtent, cuMipmappedArrayCreate

__host__ cudaError_t cudaMallocPitch ( void** devPtr, size_t* pitch, size_t width, size_t height )


Allocates pitched memory on the device.

######  Parameters

`devPtr`
    \- Pointer to allocated pitched device memory
`pitch`
    \- Pitch for allocation
`width`
    \- Requested pitched allocation width (in bytes)
`height`
    \- Requested pitched allocation height

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Allocates at least `width` (in bytes) * `height` bytes of linear memory on the device and returns in `*devPtr` a pointer to the allocated memory. The function may pad the allocation to ensure that corresponding pointers in any given row will continue to meet the alignment requirements for coalescing as the address is updated from row to row. The pitch returned in `*pitch` by cudaMallocPitch() is the width in bytes of the allocation. The intended usage of `pitch` is as a separate parameter of the allocation, used to compute addresses within the 2D array. Given the row and column of an array element of type `T`, the address is computed as:


    ‎    T* pElement = (T*)((char*)BaseAddress + Row * pitch) + Column;

For allocations of 2D arrays, it is recommended that programmers consider performing pitch allocations using cudaMallocPitch(). Due to pitch alignment restrictions in the hardware, this is especially true if the application will be performing 2D memory copies between different regions of device memory (whether linear memory or CUDA arrays).


**See also:**

cudaMalloc, cudaFree, cudaMallocArray, cudaFreeArray, cudaMallocHost ( C API), cudaFreeHost, cudaMalloc3D, cudaMalloc3DArray, cudaHostAlloc, cuMemAllocPitch

__host__ cudaError_t cudaMemAdvise ( const void* devPtr, size_t count, cudaMemoryAdvise advice, cudaMemLocation location )


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

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice

###### Description

Advise the Unified Memory subsystem about the usage pattern for the memory range starting at `devPtr` with a size of `count` bytes. The start address and end address of the memory range will be rounded down and rounded up respectively to be aligned to CPU page size before the advice is applied. The memory range must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables. The memory range could also refer to system-allocated pageable memory provided it represents a valid, host-accessible region of memory and all additional constraints imposed by `advice` as outlined below are also satisfied. Specifying an invalid system-allocated pageable memory range results in an error being returned.

The `advice` parameter can take the following values:

  * cudaMemAdviseSetReadMostly: This implies that the data is mostly going to be read from and only occasionally written to. Any read accesses from any processor to this region will create a read-only copy of at least the accessed pages in that processor's memory. Additionally, if cudaMemPrefetchAsync or cudaMemPrefetchAsync is called on this region, it will create a read-only copy of the data on the destination processor. If the target location for cudaMemPrefetchAsync is a host NUMA node and a read-only copy already exists on another host NUMA node, that copy will be migrated to the targeted host NUMA node. If any processor writes to this region, all copies of the corresponding page will be invalidated except for the one where the write occurred. If the writing processor is the CPU and the preferred location of the page is a host NUMA node, then the page will also be migrated to that host NUMA node. The `location` argument is ignored for this advice. Note that for a page to be read-duplicated, the accessing processor must either be the CPU or a GPU that has a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess. Also, if a context is created on a device that does not have the device attribute cudaDevAttrConcurrentManagedAccess set, then read-duplication will not occur until all such contexts are destroyed. If the memory region refers to valid system-allocated pageable memory, then the accessing device must have a non-zero value for the device attribute cudaDevAttrPageableMemoryAccess for a read-only copy to be created on that device. Note however that if the accessing device also has a non-zero value for the device attribute cudaDevAttrPageableMemoryAccessUsesHostPageTables, then setting this advice will not create a read-only copy when that device accesses this memory region.


  * cudaMemAdviceUnsetReadMostly: Undoes the effect of cudaMemAdviseSetReadMostly and also prevents the Unified Memory driver from attempting heuristic read-duplication on the memory range. Any read-duplicated copies of the data will be collapsed into a single copy. The location for the collapsed copy will be the preferred location if the page has a preferred location and one of the read-duplicated copies was resident at that location. Otherwise, the location chosen is arbitrary. Note: The `location` argument is ignored for this advice.


  * cudaMemAdviseSetPreferredLocation: This advice sets the preferred location for the data to be the memory belonging to `location`. When cudaMemLocation::type is cudaMemLocationTypeHost, cudaMemLocation::id is ignored and the preferred location is set to be host memory. To set the preferred location to a specific host NUMA node, applications must set cudaMemLocation::type to cudaMemLocationTypeHostNuma and cudaMemLocation::id must specify the NUMA ID of the host NUMA node. If cudaMemLocation::type is set to cudaMemLocationTypeHostNumaCurrent, cudaMemLocation::id will be ignored and the host NUMA node closest to the calling thread's CPU will be used as the preferred location. If cudaMemLocation::type is a cudaMemLocationTypeDevice, then cudaMemLocation::id must be a valid device ordinal and the device must have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess. Setting the preferred location does not cause data to migrate to that location immediately. Instead, it guides the migration policy when a fault occurs on that memory region. If the data is already in its preferred location and the faulting processor can establish a mapping without requiring the data to be migrated, then data migration will be avoided. On the other hand, if the data is not in its preferred location or if a direct mapping cannot be established, then it will be migrated to the processor accessing it. It is important to note that setting the preferred location does not prevent data prefetching done using cudaMemPrefetchAsync. Having a preferred location can override the page thrash detection and resolution logic in the Unified Memory driver. Normally, if a page is detected to be constantly thrashing between for example host and device memory, the page may eventually be pinned to host memory by the Unified Memory driver. But if the preferred location is set as device memory, then the page will continue to thrash indefinitely. If cudaMemAdviseSetReadMostly is also set on this memory region or any subset of it, then the policies associated with that advice will override the policies of this advice, unless read accesses from `location` will not result in a read-only copy being created on that procesor as outlined in description for the advice cudaMemAdviseSetReadMostly. If the memory region refers to valid system-allocated pageable memory, and cudaMemLocation::type is cudaMemLocationTypeDevice then cudaMemLocation::id must be a valid device that has a non-zero alue for the device attribute cudaDevAttrPageableMemoryAccess.


  * cudaMemAdviseUnsetPreferredLocation: Undoes the effect of cudaMemAdviseSetPreferredLocation and changes the preferred location to none. The `location` argument is ignored for this advice.


  * cudaMemAdviseSetAccessedBy: This advice implies that the data will be accessed by processor `location`. The cudaMemLocation::type must be either cudaMemLocationTypeDevice with cudaMemLocation::id representing a valid device ordinal or cudaMemLocationTypeHost and cudaMemLocation::id will be ignored. All other location types are invalid. If cudaMemLocation::id is a GPU, then the device attribute cudaDevAttrConcurrentManagedAccess must be non-zero. This advice does not cause data migration and has no impact on the location of the data per se. Instead, it causes the data to always be mapped in the specified processor's page tables, as long as the location of the data permits a mapping to be established. If the data gets migrated for any reason, the mappings are updated accordingly. This advice is recommended in scenarios where data locality is not important, but avoiding faults is. Consider for example a system containing multiple GPUs with peer-to-peer access enabled, where the data located on one GPU is occasionally accessed by peer GPUs. In such scenarios, migrating data over to the other GPUs is not as important because the accesses are infrequent and the overhead of migration may be too high. But preventing faults can still help improve performance, and so having a mapping set up in advance is useful. Note that on CPU access of this data, the data may be migrated to host memory because the CPU typically cannot access device memory directly. Any GPU that had the cudaMemAdviseSetAccessedBy flag set for this data will now have its mapping updated to point to the page in host memory. If cudaMemAdviseSetReadMostly is also set on this memory region or any subset of it, then the policies associated with that advice will override the policies of this advice. Additionally, if the preferred location of this memory region or any subset of it is also `location`, then the policies associated with CU_MEM_ADVISE_SET_PREFERRED_LOCATION will override the policies of this advice. If the memory region refers to valid system-allocated pageable memory, and cudaMemLocation::type is cudaMemLocationTypeDevice then device in cudaMemLocation::id must have a non-zero value for the device attribute cudaDevAttrPageableMemoryAccess. Additionally, if cudaMemLocation::id has a non-zero value for the device attribute cudaDevAttrPageableMemoryAccessUsesHostPageTables, then this call has no effect.


  * CU_MEM_ADVISE_UNSET_ACCESSED_BY: Undoes the effect of cudaMemAdviseSetAccessedBy. Any mappings to the data from `location` may be removed at any time causing accesses to result in non-fatal page faults. If the memory region refers to valid system-allocated pageable memory, and cudaMemLocation::type is cudaMemLocationTypeDevice then device in cudaMemLocation::id must have a non-zero value for the device attribute cudaDevAttrPageableMemoryAccess. Additionally, if cudaMemLocation::id has a non-zero value for the device attribute cudaDevAttrPageableMemoryAccessUsesHostPageTables, then this call has no effect.


  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpyPeer, cudaMemcpyAsync, cudaMemcpy3DPeerAsync, cudaMemPrefetchAsync, cuMemAdvise

__host__ cudaError_t cudaMemDiscardAndPrefetchBatchAsync ( void** dptrs, size_t* sizes, size_t count, cudaMemLocation* prefetchLocs, size_t* prefetchLocIdxs, size_t numPrefetchLocs, unsigned long long flags, cudaStream_t stream )


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
`stream`


###### Description

Performs a batch of memory discards followed by prefetches. The batch as a whole executes in stream order but operations within a batch are not guaranteed to execute in any specific order. All devices in the system must have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess otherwise the API will return an error.

Calling cudaMemDiscardAndPrefetchBatchAsync is semantically equivalent to calling cudaMemDiscardBatchAsync followed by cudaMemPrefetchBatchAsync, but is more optimal. For more details on what discarding and prefetching imply, please refer to cudaMemDiscardBatchAsync and cudaMemPrefetchBatchAsync respectively. Note that any reads, writes or prefetches to any part of the memory range that occur simultaneously with this combined discard+prefetch operation result in undefined behavior.

Performs memory discard and prefetch on address ranges specified in `dptrs` and `sizes`. Both arrays must be of the same length as specified by `count`. Each memory range specified must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables or it may also refer to system-allocated memory when all devices have a non-zero value for cudaDevAttrPageableMemoryAccess. Every operation in the batch has to be associated with a valid location to prefetch the address range to and specified in the `prefetchLocs` array. Each entry in this array can apply to more than one operation. This can be done by specifying in the `prefetchLocIdxs` array, the index of the first operation that the corresponding entry in the `prefetchLocs` array applies to. Both `prefetchLocs` and `prefetchLocIdxs` must be of the same length as specified by `numPrefetchLocs`. For example, if a batch has 10 operations listed in dptrs/sizes, the first 6 of which are to be prefetched to one location and the remaining 4 are to be prefetched to another, then `numPrefetchLocs` will be 2, `prefetchLocIdxs` will be {0, 6} and `prefetchLocs` will contain the two set of locations. Note the first entry in `prefetchLocIdxs` must always be 0. Also, each entry must be greater than the previous entry and the last entry should be less than `count`. Furthermore, `numPrefetchLocs` must be lesser than or equal to `count`.

__host__ cudaError_t cudaMemDiscardBatchAsync ( void** dptrs, size_t* sizes, size_t count, unsigned long long flags, cudaStream_t stream )


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
`stream`


###### Description

Performs a batch of memory discards. The batch as a whole executes in stream order but operations within a batch are not guaranteed to execute in any specific order. All devices in the system must have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess otherwise the API will return an error.

Discarding a memory range informs the driver that the contents of that range are no longer useful. Discarding memory ranges allows the driver to optimize certain data migrations and can also help reduce memory pressure. This operation can be undone on any part of the range by either writing to it or prefetching it via cudaMemPrefetchAsync or cudaMemPrefetchBatchAsync. Reading from a discarded range, without a subsequent write or prefetch to that part of the range, will return an indeterminate value. Note that any reads, writes or prefetches to any part of the memory range that occur simultaneously with the discard operation result in undefined behavior.

Performs memory discard on address ranges specified in `dptrs` and `sizes`. Both arrays must be of the same length as specified by `count`. Each memory range specified must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables or it may also refer to system-allocated memory when all devices have a non-zero value for cudaDevAttrPageableMemoryAccess.

__host__ cudaError_t cudaMemGetInfo ( size_t* free, size_t* total )


Gets free and total device memory.

######  Parameters

`free`
    \- Returned free memory in bytes
`total`
    \- Returned total memory in bytes

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorLaunchFailure

###### Description

Returns in `*total` the total amount of memory available to the the current context. Returns in `*free` the amount of memory on the device that is free according to the OS. CUDA is not guaranteed to be able to allocate all of the memory that the OS reports as free. In a multi-tenet situation, free estimate returned is prone to race condition where a new allocation/free done by a different process or a different thread in the same process between the time when free memory was estimated and reported, will result in deviation in free value reported and actual free memory.

The integrated GPU on Tegra shares memory with CPU and other component of the SoC. The free and total values returned by the API excludes the SWAP memory space maintained by the OS on some platforms. The OS may move some of the memory pages into swap area as the GPU or CPU allocate or access memory. See Tegra app note on how to calculate total and free memory on Tegra.


**See also:**

cuMemGetInfo

__host__ cudaError_t cudaMemPrefetchAsync ( const void* devPtr, size_t count, cudaMemLocation location, unsigned int  flags, cudaStream_t stream = 0 )


Prefetches memory to the specified destination location.

######  Parameters

`devPtr`
    \- Pointer to be prefetched
`count`
    \- Size in bytes
`location`
    \- location to prefetch to
`flags`
    \- flags for future use, must be zero now.
`stream`
    \- Stream to enqueue prefetch operation

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice

###### Description

Prefetches memory to the specified destination location. `devPtr` is the base device pointer of the memory to be prefetched and `location` specifies the destination location. `count` specifies the number of bytes to copy. `stream` is the stream in which the operation is enqueued. The memory range must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables, or it may also refer to memory allocated from a managed memory pool, or it may also refer to system-allocated memory on systems with non-zero cudaDevAttrPageableMemoryAccess.

Specifying cudaMemLocationTypeDevice for cudaMemLocation::type will prefetch memory to GPU specified by device ordinal cudaMemLocation::id which must have non-zero value for the device attribute concurrentManagedAccess. Additionally, `stream` must be associated with a device that has a non-zero value for the device attribute concurrentManagedAccess. Specifying cudaMemLocationTypeHost as cudaMemLocation::type will prefetch data to host memory. Applications can request prefetching memory to a specific host NUMA node by specifying cudaMemLocationTypeHostNuma for cudaMemLocation::type and a valid host NUMA node id in cudaMemLocation::id Users can also request prefetching memory to the host NUMA node closest to the current thread's CPU by specifying cudaMemLocationTypeHostNumaCurrent for cudaMemLocation::type. Note when cudaMemLocation::type is etiher cudaMemLocationTypeHost OR cudaMemLocationTypeHostNumaCurrent, cudaMemLocation::id will be ignored.

The start address and end address of the memory range will be rounded down and rounded up respectively to be aligned to CPU page size before the prefetch operation is enqueued in the stream.

If no physical memory has been allocated for this region, then this memory region will be populated and mapped on the destination device. If there's insufficient memory to prefetch the desired region, the Unified Memory driver may evict pages from other cudaMallocManaged allocations to host memory in order to make room. Device memory allocated using cudaMalloc or cudaMallocArray will not be evicted.

By default, any mappings to the previous location of the migrated pages are removed and mappings for the new location are only setup on the destination location. The exact behavior however also depends on the settings applied to this memory range via cuMemAdvise as described below:

If cudaMemAdviseSetReadMostly was set on any subset of this memory range, then that subset will create a read-only copy of the pages on destination location. If however the destination location is a host NUMA node, then any pages of that subset that are already in another host NUMA node will be transferred to the destination.

If cudaMemAdviseSetPreferredLocation was called on any subset of this memory range, then the pages will be migrated to `location` even if `location` is not the preferred location of any pages in the memory range.

If cudaMemAdviseSetAccessedBy was called on any subset of this memory range, then mappings to those pages from all the appropriate processors are updated to refer to the new location if establishing such a mapping is possible. Otherwise, those mappings are cleared.

Note that this API is not required for functionality and only serves to improve performance by allowing the application to migrate data to a suitable location before it is accessed. Memory accesses to this range are always coherent and are allowed even when the data is actively being migrated.

Note that this function is asynchronous with respect to the host and all work on other devices.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpyPeer, cudaMemcpyAsync, cudaMemcpy3DPeerAsync, cudaMemAdvise, cuMemPrefetchAsync

__host__ cudaError_t cudaMemPrefetchBatchAsync ( void** dptrs, size_t* sizes, size_t count, cudaMemLocation* prefetchLocs, size_t* prefetchLocIdxs, size_t numPrefetchLocs, unsigned long long flags, cudaStream_t stream )


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
`stream`


###### Description

Performs a batch of memory prefetches. The batch as a whole executes in stream order but operations within a batch are not guaranteed to execute in any specific order. All devices in the system must have a non-zero value for the device attribute cudaDevAttrConcurrentManagedAccess otherwise the API will return an error.

The semantics of the individual prefetch operations are as described in cudaMemPrefetchAsync.

Performs memory prefetch on address ranges specified in `dptrs` and `sizes`. Both arrays must be of the same length as specified by `count`. Each memory range specified must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables or it may also refer to system-allocated memory when all devices have a non-zero value for cudaDevAttrPageableMemoryAccess. The prefetch location for every operation in the batch is specified in the `prefetchLocs` array. Each entry in this array can apply to more than one operation. This can be done by specifying in the `prefetchLocIdxs` array, the index of the first prefetch operation that the corresponding entry in the `prefetchLocs` array applies to. Both `prefetchLocs` and `prefetchLocIdxs` must be of the same length as specified by `numPrefetchLocs`. For example, if a batch has 10 prefetches listed in dptrs/sizes, the first 4 of which are to be prefetched to one location and the remaining 6 are to be prefetched to another, then `numPrefetchLocs` will be 2, `prefetchLocIdxs` will be {0, 4} and `prefetchLocs` will contain the two locations. Note the first entry in `prefetchLocIdxs` must always be 0. Also, each entry must be greater than the previous entry and the last entry should be less than `count`. Furthermore, `numPrefetchLocs` must be lesser than or equal to `count`.

__host__ cudaError_t cudaMemRangeGetAttribute ( void* data, size_t dataSize, cudaMemRangeAttribute attribute, const void* devPtr, size_t count )


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

cudaSuccess, cudaErrorInvalidValue

###### Description

Query an attribute about the memory range starting at `devPtr` with a size of `count` bytes. The memory range must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables.

The `attribute` parameter can take the following values:

  * cudaMemRangeAttributeReadMostly: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. The result returned will be 1 if all pages in the given memory range have read-duplication enabled, or 0 otherwise.

  * cudaMemRangeAttributePreferredLocation: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. The result returned will be a GPU device id if all pages in the memory range have that GPU as their preferred location, or it will be cudaCpuDeviceId if all pages in the memory range have the CPU as their preferred location, or it will be cudaInvalidDeviceId if either all the pages don't have the same preferred location or some of the pages don't have a preferred location at all. Note that the actual location of the pages in the memory range at the time of the query may be different from the preferred location.

  * cudaMemRangeAttributeAccessedBy: If this attribute is specified, `data` will be interpreted as an array of 32-bit integers, and `dataSize` must be a non-zero multiple of 4. The result returned will be a list of device ids that had cudaMemAdviceSetAccessedBy set for that entire memory range. If any device does not have that advice set for the entire memory range, that device will not be included. If `data` is larger than the number of devices that have that advice set for that memory range, cudaInvalidDeviceId will be returned in all the extra space provided. For ex., if `dataSize` is 12 (i.e. `data` has 3 elements) and only device 0 has the advice set, then the result returned will be { 0, cudaInvalidDeviceId, cudaInvalidDeviceId }. If `data` is smaller than the number of devices that have that advice set, then only as many devices will be returned as can fit in the array. There is no guarantee on which specific devices will be returned, however.

  * cudaMemRangeAttributeLastPrefetchLocation: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. The result returned will be the last location to which all pages in the memory range were prefetched explicitly via cudaMemPrefetchAsync. This will either be a GPU id or cudaCpuDeviceId depending on whether the last location for prefetch was a GPU or the CPU respectively. If any page in the memory range was never explicitly prefetched or if all pages were not prefetched to the same location, cudaInvalidDeviceId will be returned. Note that this simply returns the last location that the applicaton requested to prefetch the memory range to. It gives no indication as to whether the prefetch operation to that location has completed or even begun.

  * cudaMemRangeAttributePreferredLocationType: If this attribute is specified, `data` will be interpreted as a cudaMemLocationType, and `dataSize` must be sizeof(cudaMemLocationType). The cudaMemLocationType returned will be cudaMemLocationTypeDevice if all pages in the memory range have the same GPU as their preferred location, or cudaMemLocationType will be cudaMemLocationTypeHost if all pages in the memory range have the CPU as their preferred location, or or it will be cudaMemLocationTypeHostNuma if all the pages in the memory range have the same host NUMA node ID as their preferred location or it will be cudaMemLocationTypeInvalid if either all the pages don't have the same preferred location or some of the pages don't have a preferred location at all. Note that the actual location type of the pages in the memory range at the time of the query may be different from the preferred location type.
    * cudaMemRangeAttributePreferredLocationId: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. If the cudaMemRangeAttributePreferredLocationType query for the same address range returns cudaMemLocationTypeDevice, it will be a valid device ordinal or if it returns cudaMemLocationTypeHostNuma, it will be a valid host NUMA node ID or if it returns any other location type, the id should be ignored.

  * cudaMemRangeAttributeLastPrefetchLocationType: If this attribute is specified, `data` will be interpreted as a cudaMemLocationType, and `dataSize` must be sizeof(cudaMemLocationType). The result returned will be the last location type to which all pages in the memory range were prefetched explicitly via cuMemPrefetchAsync. The cudaMemLocationType returned will be cudaMemLocationTypeDevice if the last prefetch location was the GPU or cudaMemLocationTypeHost if it was the CPU or cudaMemLocationTypeHostNuma if the last prefetch location was a specific host NUMA node. If any page in the memory range was never explicitly prefetched or if all pages were not prefetched to the same location, CUmemLocationType will be cudaMemLocationTypeInvalid. Note that this simply returns the last location type that the application requested to prefetch the memory range to. It gives no indication as to whether the prefetch operation to that location has completed or even begun.
    * cudaMemRangeAttributeLastPrefetchLocationId: If this attribute is specified, `data` will be interpreted as a 32-bit integer, and `dataSize` must be 4. If the cudaMemRangeAttributeLastPrefetchLocationType query for the same address range returns cudaMemLocationTypeDevice, it will be a valid device ordinal or if it returns cudaMemLocationTypeHostNuma, it will be a valid host NUMA node ID or if it returns any other location type, the id should be ignored.


  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemRangeGetAttributes, cudaMemPrefetchAsync, cudaMemAdvise, cuMemRangeGetAttribute

__host__ cudaError_t cudaMemRangeGetAttributes ( void** data, size_t* dataSizes, cudaMemRangeAttribute ** attributes, size_t numAttributes, const void* devPtr, size_t count )


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

cudaSuccess, cudaErrorInvalidValue

###### Description

Query attributes of the memory range starting at `devPtr` with a size of `count` bytes. The memory range must refer to managed memory allocated via cudaMallocManaged or declared via __managed__ variables. The `attributes` array will be interpreted to have `numAttributes` entries. The `dataSizes` array will also be interpreted to have `numAttributes` entries. The results of the query will be stored in `data`.

The list of supported attributes are given below. Please refer to cudaMemRangeGetAttribute for attribute descriptions and restrictions.

  * cudaMemRangeAttributeReadMostly

  * cudaMemRangeAttributePreferredLocation

  * cudaMemRangeAttributeAccessedBy

  * cudaMemRangeAttributeLastPrefetchLocation

  * :: cudaMemRangeAttributePreferredLocationType

  * :: cudaMemRangeAttributePreferredLocationId

  * :: cudaMemRangeAttributeLastPrefetchLocationType

  * :: cudaMemRangeAttributeLastPrefetchLocationId


**See also:**

cudaMemRangeGetAttribute, cudaMemAdvise, cudaMemPrefetchAsync, cuMemRangeGetAttributes

__host__ cudaError_t cudaMemcpy ( void* dst, const void* src, size_t count, cudaMemcpyKind kind )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. Calling cudaMemcpy() with dst and src pointers that do not match the direction of the copy results in an undefined behavior.

  * This function exhibits synchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpyDtoH, cuMemcpyHtoD, cuMemcpyDtoD, cuMemcpy

__host__ cudaError_t cudaMemcpy2D ( void* dst, size_t dpitch, const void* src, size_t spitch, size_t width, size_t height, cudaMemcpyKind kind )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`dpitch`
    \- Pitch of destination memory
`src`
    \- Source memory address
`spitch`
    \- Pitch of source memory
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the memory area pointed to by `src` to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `dpitch` and `spitch` are the widths in memory in bytes of the 2D arrays pointed to by `dst` and `src`, including any padding added to the end of each row. The memory areas may not overlap. `width` must not exceed either `dpitch` or `spitch`. Calling cudaMemcpy2D() with `dst` and `src` pointers that do not match the direction of the copy results in an undefined behavior. cudaMemcpy2D() returns an error if `dpitch` or `spitch` exceeds the maximum allowed.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2D, cuMemcpy2DUnaligned

__host__ cudaError_t cudaMemcpy2DArrayToArray ( cudaArray_t dst, size_t wOffsetDst, size_t hOffsetDst, cudaArray_const_t src, size_t wOffsetSrc, size_t hOffsetSrc, size_t width, size_t height, cudaMemcpyKind kind = cudaMemcpyDeviceToDevice )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`wOffsetDst`
    \- Destination starting X offset (columns in bytes)
`hOffsetDst`
    \- Destination starting Y offset (rows)
`src`
    \- Source memory address
`wOffsetSrc`
    \- Source starting X offset (columns in bytes)
`hOffsetSrc`
    \- Source starting Y offset (rows)
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the CUDA array `src` starting at `hOffsetSrc` rows and `wOffsetSrc` bytes from the upper left corner to the CUDA array `dst` starting at `hOffsetDst` rows and `wOffsetDst` bytes from the upper left corner, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `wOffsetDst` \+ `width` must not exceed the width of the CUDA array `dst`. `wOffsetSrc` \+ `width` must not exceed the width of the CUDA array `src`.

  *   * This function exhibits synchronous behavior for most use cases.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2D, cuMemcpy2DUnaligned

__host__  __device__ cudaError_t cudaMemcpy2DAsync ( void* dst, size_t dpitch, const void* src, size_t spitch, size_t width, size_t height, cudaMemcpyKind kind, cudaStream_t stream = 0 )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`dpitch`
    \- Pitch of destination memory
`src`
    \- Source memory address
`spitch`
    \- Pitch of source memory
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the memory area pointed to by `src` to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `dpitch` and `spitch` are the widths in memory in bytes of the 2D arrays pointed to by `dst` and `src`, including any padding added to the end of each row. The memory areas may not overlap. `width` must not exceed either `dpitch` or `spitch`.

Calling cudaMemcpy2DAsync() with `dst` and `src` pointers that do not match the direction of the copy results in an undefined behavior. cudaMemcpy2DAsync() returns an error if `dpitch` or `spitch` is greater than the maximum allowed.

cudaMemcpy2DAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost and `stream` is non-zero, the copy may overlap with operations in other streams.

The device version of this function only handles device to device copies and cannot be given local or shared pointers.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2DAsync

__host__ cudaError_t cudaMemcpy2DFromArray ( void* dst, size_t dpitch, cudaArray_const_t src, size_t wOffset, size_t hOffset, size_t width, size_t height, cudaMemcpyKind kind )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`dpitch`
    \- Pitch of destination memory
`src`
    \- Source memory address
`wOffset`
    \- Source starting X offset (columns in bytes)
`hOffset`
    \- Source starting Y offset (rows)
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the CUDA array `src` starting at `hOffset` rows and `wOffset` bytes from the upper left corner to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `dpitch` is the width in memory in bytes of the 2D array pointed to by `dst`, including any padding added to the end of each row. `wOffset` \+ `width` must not exceed the width of the CUDA array `src`. `width` must not exceed `dpitch`. cudaMemcpy2DFromArray() returns an error if `dpitch` exceeds the maximum allowed.

  *   * This function exhibits synchronous behavior for most use cases.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2D, cuMemcpy2DUnaligned

__host__ cudaError_t cudaMemcpy2DFromArrayAsync ( void* dst, size_t dpitch, cudaArray_const_t src, size_t wOffset, size_t hOffset, size_t width, size_t height, cudaMemcpyKind kind, cudaStream_t stream = 0 )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`dpitch`
    \- Pitch of destination memory
`src`
    \- Source memory address
`wOffset`
    \- Source starting X offset (columns in bytes)
`hOffset`
    \- Source starting Y offset (rows)
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the CUDA array `src` starting at `hOffset` rows and `wOffset` bytes from the upper left corner to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `dpitch` is the width in memory in bytes of the 2D array pointed to by `dst`, including any padding added to the end of each row. `wOffset` \+ `width` must not exceed the width of the CUDA array `src`. `width` must not exceed `dpitch`. cudaMemcpy2DFromArrayAsync() returns an error if `dpitch` exceeds the maximum allowed.

cudaMemcpy2DFromArrayAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost and `stream` is non-zero, the copy may overlap with operations in other streams.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync

cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2DAsync

__host__ cudaError_t cudaMemcpy2DToArray ( cudaArray_t dst, size_t wOffset, size_t hOffset, const void* src, size_t spitch, size_t width, size_t height, cudaMemcpyKind kind )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`wOffset`
    \- Destination starting X offset (columns in bytes)
`hOffset`
    \- Destination starting Y offset (rows)
`src`
    \- Source memory address
`spitch`
    \- Pitch of source memory
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the memory area pointed to by `src` to the CUDA array `dst` starting at `hOffset` rows and `wOffset` bytes from the upper left corner, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `spitch` is the width in memory in bytes of the 2D array pointed to by `src`, including any padding added to the end of each row. `wOffset` \+ `width` must not exceed the width of the CUDA array `dst`. `width` must not exceed `spitch`. cudaMemcpy2DToArray() returns an error if `spitch` exceeds the maximum allowed.

  *   * This function exhibits synchronous behavior for most use cases.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2D, cuMemcpy2DUnaligned

__host__ cudaError_t cudaMemcpy2DToArrayAsync ( cudaArray_t dst, size_t wOffset, size_t hOffset, const void* src, size_t spitch, size_t width, size_t height, cudaMemcpyKind kind, cudaStream_t stream = 0 )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`wOffset`
    \- Destination starting X offset (columns in bytes)
`hOffset`
    \- Destination starting Y offset (rows)
`src`
    \- Source memory address
`spitch`
    \- Pitch of source memory
`width`
    \- Width of matrix transfer (columns in bytes)
`height`
    \- Height of matrix transfer (rows)
`kind`
    \- Type of transfer
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies a matrix (`height` rows of `width` bytes each) from the memory area pointed to by `src` to the CUDA array `dst` starting at `hOffset` rows and `wOffset` bytes from the upper left corner, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. `spitch` is the width in memory in bytes of the 2D array pointed to by `src`, including any padding added to the end of each row. `wOffset` \+ `width` must not exceed the width of the CUDA array `dst`. `width` must not exceed `spitch`. cudaMemcpy2DToArrayAsync() returns an error if `spitch` exceeds the maximum allowed.

cudaMemcpy2DToArrayAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost and `stream` is non-zero, the copy may overlap with operations in other streams.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync

cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy2DAsync

__host__ cudaError_t cudaMemcpy3D ( const cudaMemcpy3DParms* p )


Copies data between 3D objects.

######  Parameters

`p`
    \- 3D memory copy parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description


    ‎struct cudaExtent {
            size_t width;
            size_t height;
            size_t depth;
          };
          struct cudaExtent
                      make_cudaExtent(size_t w, size_t h, size_t d);

          struct cudaPos {
            size_t x;
            size_t y;
            size_t z;
          };
          struct cudaPos
                      make_cudaPos(size_t x, size_t y, size_t z);

          struct cudaMemcpy3DParms {
            cudaArray_t
                      srcArray;
            struct cudaPos
                      srcPos;
            struct cudaPitchedPtr
                      srcPtr;
            cudaArray_t
                      dstArray;
            struct cudaPos
                      dstPos;
            struct cudaPitchedPtr
                      dstPtr;
            struct cudaExtent
                      extent;
            enum cudaMemcpyKind
                      kind;
          };

cudaMemcpy3D() copies data betwen two 3D objects. The source and destination objects may be in either host memory, device memory, or a CUDA array. The source, destination, extent, and kind of copy performed is specified by the cudaMemcpy3DParms struct which should be initialized to zero before use:


    ‎cudaMemcpy3DParms myParms = {0};

The struct passed to cudaMemcpy3D() must specify one of `srcArray` or `srcPtr` and one of `dstArray` or `dstPtr`. Passing more than one non-zero source or destination will cause cudaMemcpy3D() to return an error.

The `srcPos` and `dstPos` fields are optional offsets into the source and destination objects and are defined in units of each object's elements. The element for a host or device pointer is assumed to be **unsigned char**.

The `extent` field defines the dimensions of the transferred area in elements. If a CUDA array is participating in the copy, the extent is defined in terms of that array's elements. If no CUDA array is participating in the copy then the extents are defined in elements of **unsigned char**.

The `kind` field defines the direction of the copy. It must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. For cudaMemcpyHostToHost or cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost passed as kind and cudaArray type passed as source or destination, if the kind implies cudaArray type to be present on the host, cudaMemcpy3D() will disregard that implication and silently correct the kind based on the fact that cudaArray type can only be present on the device.

If the source and destination are both arrays, cudaMemcpy3D() will return an error if they do not have the same element size.

The source and destination object may not overlap. If overlapping source and destination objects are specified, undefined behavior will result.

The source object must entirely contain the region defined by `srcPos` and `extent`. The destination object must entirely contain the region defined by `dstPos` and `extent`.

cudaMemcpy3D() returns an error if the pitch of `srcPtr` or `dstPtr` exceeds the maximum allowed. The pitch of a cudaPitchedPtr allocated with cudaMalloc3D() will always be valid.

  *   * This function exhibits synchronous behavior for most use cases.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMalloc3D, cudaMalloc3DArray, cudaMemset3D, cudaMemcpy3DAsync, cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, make_cudaExtent, make_cudaPos, cuMemcpy3D

__host__  __device__ cudaError_t cudaMemcpy3DAsync ( const cudaMemcpy3DParms* p, cudaStream_t stream = 0 )


Copies data between 3D objects.

######  Parameters

`p`
    \- 3D memory copy parameters
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidPitchValue, cudaErrorInvalidMemcpyDirection

###### Description


    ‎struct cudaExtent {
            size_t width;
            size_t height;
            size_t depth;
          };
          struct cudaExtent
                      make_cudaExtent(size_t w, size_t h, size_t d);

          struct cudaPos {
            size_t x;
            size_t y;
            size_t z;
          };
          struct cudaPos
                      make_cudaPos(size_t x, size_t y, size_t z);

          struct cudaMemcpy3DParms {
            cudaArray_t
                      srcArray;
            struct cudaPos
                      srcPos;
            struct cudaPitchedPtr
                      srcPtr;
            cudaArray_t
                      dstArray;
            struct cudaPos
                      dstPos;
            struct cudaPitchedPtr
                      dstPtr;
            struct cudaExtent
                      extent;
            enum cudaMemcpyKind
                      kind;
          };

cudaMemcpy3DAsync() copies data betwen two 3D objects. The source and destination objects may be in either host memory, device memory, or a CUDA array. The source, destination, extent, and kind of copy performed is specified by the cudaMemcpy3DParms struct which should be initialized to zero before use:


    ‎cudaMemcpy3DParms myParms = {0};

The struct passed to cudaMemcpy3DAsync() must specify one of `srcArray` or `srcPtr` and one of `dstArray` or `dstPtr`. Passing more than one non-zero source or destination will cause cudaMemcpy3DAsync() to return an error.

The `srcPos` and `dstPos` fields are optional offsets into the source and destination objects and are defined in units of each object's elements. The element for a host or device pointer is assumed to be **unsigned char**. For CUDA arrays, positions must be in the range 0, 2048) for any dimension.

The `extent` field defines the dimensions of the transferred area in elements. If a CUDA array is participating in the copy, the extent is defined in terms of that array's elements. If no CUDA array is participating in the copy then the extents are defined in elements of **unsigned char**.

The `kind` field defines the direction of the copy. It must be one of [cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. For cudaMemcpyHostToHost or cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost passed as kind and cudaArray type passed as source or destination, if the kind implies cudaArray type to be present on the host, cudaMemcpy3DAsync() will disregard that implication and silently correct the kind based on the fact that cudaArray type can only be present on the device.

If the source and destination are both arrays, cudaMemcpy3DAsync() will return an error if they do not have the same element size.

The source and destination object may not overlap. If overlapping source and destination objects are specified, undefined behavior will result.

The source object must lie entirely within the region defined by `srcPos` and `extent`. The destination object must lie entirely within the region defined by `dstPos` and `extent`.

cudaMemcpy3DAsync() returns an error if the pitch of `srcPtr` or `dstPtr` exceeds the maximum allowed. The pitch of a cudaPitchedPtr allocated with cudaMalloc3D() will always be valid.

cudaMemcpy3DAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost and `stream` is non-zero, the copy may overlap with operations in other streams.

The device version of this function only handles device to device copies and cannot be given local or shared pointers.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMalloc3D, cudaMalloc3DArray, cudaMemset3D, cudaMemcpy3D, cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, :cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, make_cudaExtent, make_cudaPos, cuMemcpy3DAsync

__host__ cudaError_t cudaMemcpy3DBatchAsync ( size_t numOps, cudaMemcpy3DBatchOp* opList, unsigned long long flags, cudaStream_t stream )


Performs a batch of 3D memory copies asynchronously.

######  Parameters

`numOps`
    \- Total number of memcpy operations.
`opList`
    \- Array of size `numOps` containing the actual memcpy operations.
`flags`
    \- Flags for future use, must be zero now.
`stream`


###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Performs a batch of memory copies. The batch as a whole executes in stream order but copies within a batch are not guaranteed to execute in any specific order. Note that this means specifying any dependent copies within a batch will result in undefined behavior.

Performs memory copies as specified in the `opList` array. The length of this array is specified in `numOps`. Each entry in this array describes a copy operation. This includes among other things, the source and destination operands for the copy as specified in cudaMemcpy3DBatchOp::src and cudaMemcpy3DBatchOp::dst respectively. The source and destination operands of a copy can either be a pointer or a CUDA array. The width, height and depth of a copy is specified in cudaMemcpy3DBatchOp::extent. The width, height and depth of a copy are specified in elements and must not be zero. For pointer-to-pointer copies, the element size is considered to be 1. For pointer to CUDA array or vice versa copies, the element size is determined by the CUDA array. For CUDA array to CUDA array copies, the element size of the two CUDA arrays must match.

For a given operand, if cudaMemcpy3DOperand::type is specified as cudaMemcpyOperandTypePointer, then cudaMemcpy3DOperand::op::ptr will be used. The cudaMemcpy3DOperand::op::ptr::ptr field must contain the pointer where the copy should begin. The cudaMemcpy3DOperand::op::ptr::rowLength field specifies the length of each row in elements and must either be zero or be greater than or equal to the width of the copy specified in cudaMemcpy3DBatchOp::extent::width. The cudaMemcpy3DOperand::op::ptr::layerHeight field specifies the height of each layer and must either be zero or be greater than or equal to the height of the copy specified in cudaMemcpy3DBatchOp::extent::height. When either of these values is zero, that aspect of the operand is considered to be tightly packed according to the copy extent. For managed memory pointers on devices where cudaDevAttrConcurrentManagedAccess is true or system-allocated pageable memory on devices where cudaDevAttrPageableMemoryAccess is true, the cudaMemcpy3DOperand::op::ptr::locHint field can be used to hint the location of the operand.

If an operand's type is specified as cudaMemcpyOperandTypeArray, then cudaMemcpy3DOperand::op::array will be used. The cudaMemcpy3DOperand::op::array::array field specifies the CUDA array and cudaMemcpy3DOperand::op::array::offset specifies the 3D offset into that array where the copy begins.

The cudaMemcpyAttributes::srcAccessOrder indicates the source access ordering to be observed for copies associated with the attribute. If the source access order is set to cudaMemcpySrcAccessOrderStream, then the source will be accessed in stream order. If the source access order is set to cudaMemcpySrcAccessOrderDuringApiCall then it indicates that access to the source pointer can be out of stream order and all accesses must be complete before the API call returns. This flag is suited for ephemeral sources (ex., stack variables) when it's known that no prior operations in the stream can be accessing the memory and also that the lifetime of the memory is limited to the scope that the source variable was declared in. Specifying this flag allows the driver to optimize the copy and removes the need for the user to synchronize the stream after the API call. If the source access order is set to cudaMemcpySrcAccessOrderAny then it indicates that access to the source pointer can be out of stream order and the accesses can happen even after the API call returns. This flag is suited for host pointers allocated outside CUDA (ex., via malloc) when it's known that no prior operations in the stream can be accessing the memory. Specifying this flag allows the driver to optimize the copy on certain platforms. Each memcopy operation in `opList` must have a valid srcAccessOrder setting, otherwise this API will return cudaErrorInvalidValue.

The cudaMemcpyAttributes::flags field can be used to specify certain flags for copies. Setting the cudaMemcpyFlagPreferOverlapWithCompute flag indicates that the associated copies should preferably overlap with any compute work. Note that this flag is a hint and can be ignored depending on the platform and other parameters of the copy.

  *   * This function exhibits asynchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


__host__ cudaError_t cudaMemcpy3DPeer ( const cudaMemcpy3DPeerParms* p )


Copies memory between devices.

######  Parameters

`p`
    \- Parameters for the memory copy

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice, cudaErrorInvalidPitchValue

###### Description

Perform a 3D memory copy according to the parameters specified in `p`. See the definition of the cudaMemcpy3DPeerParms structure for documentation of its parameters.

Note that this function is synchronous with respect to the host only if the source or destination of the transfer is host memory. Note also that this copy is serialized with respect to all pending and future asynchronous work in to the current device, the copy's source device, and the copy's destination device (use cudaMemcpy3DPeerAsync to avoid this synchronization).

  *   * This function exhibits synchronous behavior for most use cases.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpyPeer, cudaMemcpyAsync, cudaMemcpyPeerAsync, cudaMemcpy3DPeerAsync, cuMemcpy3DPeer

__host__ cudaError_t cudaMemcpy3DPeerAsync ( const cudaMemcpy3DPeerParms* p, cudaStream_t stream = 0 )


Copies memory between devices asynchronously.

######  Parameters

`p`
    \- Parameters for the memory copy
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice, cudaErrorInvalidPitchValue

###### Description

Perform a 3D memory copy according to the parameters specified in `p`. See the definition of the cudaMemcpy3DPeerParms structure for documentation of its parameters.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpyPeer, cudaMemcpyAsync, cudaMemcpyPeerAsync, cudaMemcpy3DPeerAsync, cuMemcpy3DPeerAsync

__host__  __device__ cudaError_t cudaMemcpyAsync ( void* dst, const void* src, size_t count, cudaMemcpyKind kind, cudaStream_t stream = 0 )


Copies data between host and device.

######  Parameters

`dst`
    \- Destination memory address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`kind`
    \- Type of transfer
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidMemcpyDirection

###### Description

Copies `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

The memory areas may not overlap. Calling cudaMemcpyAsync() with `dst` and `src` pointers that do not match the direction of the copy results in an undefined behavior.

cudaMemcpyAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyHostToDevice or cudaMemcpyDeviceToHost and the `stream` is non-zero, the copy may overlap with operations in other streams.

The device version of this function only handles device to device copies and cannot be given local or shared pointers.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpyAsync, cuMemcpyDtoHAsync, cuMemcpyHtoDAsync, cuMemcpyDtoDAsync

__host__ cudaError_t cudaMemcpyBatchAsync ( const void** dsts, const void** srcs, const size_t* sizes, size_t count, cudaMemcpyAttributes* attrs, size_t* attrsIdxs, size_t numAttrs, cudaStream_t stream )


Performs a batch of memory copies asynchronously.

######  Parameters

`dsts`
    \- Array of destination pointers.
`srcs`
    \- Array of memcpy source pointers.
`sizes`
    \- Array of sizes for memcpy operations.
`count`
    \- Size of `dsts`, `srcs` and `sizes` arrays
`attrs`
    \- Array of memcpy attributes.
`attrsIdxs`
    \- Array of indices to specify which copies each entry in the `attrs` array applies to. The attributes specified in attrs[k] will be applied to copies starting from attrsIdxs[k] through attrsIdxs[k+1] \- 1. Also attrs[numAttrs-1] will apply to copies starting from attrsIdxs[numAttrs-1] through count - 1.
`numAttrs`
    \- Size of `attrs` and `attrsIdxs` arrays.
`stream`


###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Performs a batch of memory copies. The batch as a whole executes in stream order but copies within a batch are not guaranteed to execute in any specific order. This API only supports pointer-to-pointer copies. For copies involving CUDA arrays, please see cudaMemcpy3DBatchAsync.

Performs memory copies from source buffers specified in `srcs` to destination buffers specified in `dsts`. The size of each copy is specified in `sizes`. All three arrays must be of the same length as specified by `count`. Since there are no ordering guarantees for copies within a batch, specifying any dependent copies within a batch will result in undefined behavior.

Every copy in the batch has to be associated with a set of attributes specified in the `attrs` array. Each entry in this array can apply to more than one copy. This can be done by specifying in the `attrsIdxs` array, the index of the first copy that the corresponding entry in the `attrs` array applies to. Both `attrs` and `attrsIdxs` must be of the same length as specified by `numAttrs`. For example, if a batch has 10 copies listed in dst/src/sizes, the first 6 of which have one set of attributes and the remaining 4 another, then `numAttrs` will be 2, `attrsIdxs` will be {0, 6} and `attrs` will contains the two sets of attributes. Note that the first entry in `attrsIdxs` must always be 0. Also, each entry must be greater than the previous entry and the last entry should be less than `count`. Furthermore, `numAttrs` must be lesser than or equal to `count`.

The cudaMemcpyAttributes::srcAccessOrder indicates the source access ordering to be observed for copies associated with the attribute. If the source access order is set to cudaMemcpySrcAccessOrderStream, then the source will be accessed in stream order. If the source access order is set to cudaMemcpySrcAccessOrderDuringApiCall then it indicates that access to the source pointer can be out of stream order and all accesses must be complete before the API call returns. This flag is suited for ephemeral sources (ex., stack variables) when it's known that no prior operations in the stream can be accessing the memory and also that the lifetime of the memory is limited to the scope that the source variable was declared in. Specifying this flag allows the driver to optimize the copy and removes the need for the user to synchronize the stream after the API call. If the source access order is set to cudaMemcpySrcAccessOrderAny then it indicates that access to the source pointer can be out of stream order and the accesses can happen even after the API call returns. This flag is suited for host pointers allocated outside CUDA (ex., via malloc) when it's known that no prior operations in the stream can be accessing the memory. Specifying this flag allows the driver to optimize the copy on certain platforms. Each memcpy operation in the batch must have a valid cudaMemcpyAttributes corresponding to it including the appropriate srcAccessOrder setting, otherwise the API will return cudaErrorInvalidValue.

The cudaMemcpyAttributes::srcLocHint and cudaMemcpyAttributes::dstLocHint allows applications to specify hint locations for operands of a copy when the operand doesn't have a fixed location. That is, these hints are only applicable for managed memory pointers on devices where cudaDevAttrConcurrentManagedAccess is true or system-allocated pageable memory on devices where cudaDevAttrPageableMemoryAccess is true. For other cases, these hints are ignored.

The cudaMemcpyAttributes::flags field can be used to specify certain flags for copies. Setting the cudaMemcpyFlagPreferOverlapWithCompute flag indicates that the associated copies should preferably overlap with any compute work. Note that this flag is a hint and can be ignored depending on the platform and other parameters of the copy.

  *   * This function exhibits asynchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


__host__ cudaError_t cudaMemcpyFromSymbol ( void* dst, const void* symbol, size_t count, size_t offset = 0, cudaMemcpyKind kind = cudaMemcpyDeviceToHost )


Copies data from the given symbol on the device.

######  Parameters

`dst`
    \- Destination memory address
`symbol`
    \- Device symbol address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidSymbol, cudaErrorInvalidMemcpyDirection, cudaErrorNoKernelImageForDevice

###### Description

Copies `count` bytes from the memory area pointed to by `offset` bytes from the start of symbol `symbol` to the memory area pointed to by `dst`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

  *   * This function exhibits synchronous behavior for most use cases.

  * Use of a string naming a variable as the `symbol` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy, cuMemcpyDtoH, cuMemcpyDtoD

__host__ cudaError_t cudaMemcpyFromSymbolAsync ( void* dst, const void* symbol, size_t count, size_t offset, cudaMemcpyKind kind, cudaStream_t stream = 0 )


Copies data from the given symbol on the device.

######  Parameters

`dst`
    \- Destination memory address
`symbol`
    \- Device symbol address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidSymbol, cudaErrorInvalidMemcpyDirection, cudaErrorNoKernelImageForDevice

###### Description

Copies `count` bytes from the memory area pointed to by `offset` bytes from the start of symbol `symbol` to the memory area pointed to by `dst`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

cudaMemcpyFromSymbolAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyDeviceToHost and `stream` is non-zero, the copy may overlap with operations in other streams.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Use of a string naming a variable as the `symbol` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cuMemcpyAsync, cuMemcpyDtoHAsync, cuMemcpyDtoDAsync

__host__ cudaError_t cudaMemcpyPeer ( void* dst, int  dstDevice, const void* src, int  srcDevice, size_t count )


Copies memory between two devices.

######  Parameters

`dst`
    \- Destination device pointer
`dstDevice`
    \- Destination device
`src`
    \- Source device pointer
`srcDevice`
    \- Source device
`count`
    \- Size of memory copy in bytes

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice

###### Description

Copies memory from one device to memory on another device. `dst` is the base device pointer of the destination memory and `dstDevice` is the destination device. `src` is the base device pointer of the source memory and `srcDevice` is the source device. `count` specifies the number of bytes to copy.

Note that this function is asynchronous with respect to the host, but serialized with respect all pending and future asynchronous work in to the current device, `srcDevice`, and `dstDevice` (use cudaMemcpyPeerAsync to avoid this synchronization).

  *   * This function exhibits synchronous behavior for most use cases.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpyAsync, cudaMemcpyPeerAsync, cudaMemcpy3DPeerAsync, cuMemcpyPeer

__host__ cudaError_t cudaMemcpyPeerAsync ( void* dst, int  dstDevice, const void* src, int  srcDevice, size_t count, cudaStream_t stream = 0 )


Copies memory between two devices asynchronously.

######  Parameters

`dst`
    \- Destination device pointer
`dstDevice`
    \- Destination device
`src`
    \- Source device pointer
`srcDevice`
    \- Source device
`count`
    \- Size of memory copy in bytes
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice

###### Description

Copies memory from one device to memory on another device. `dst` is the base device pointer of the destination memory and `dstDevice` is the destination device. `src` is the base device pointer of the source memory and `srcDevice` is the source device. `count` specifies the number of bytes to copy.

Note that this function is asynchronous with respect to the host and all work on other devices.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpyPeer, cudaMemcpyAsync, cudaMemcpy3DPeerAsync, cuMemcpyPeerAsync

__host__ cudaError_t cudaMemcpyToSymbol ( const void* symbol, const void* src, size_t count, size_t offset = 0, cudaMemcpyKind kind = cudaMemcpyHostToDevice )


Copies data to the given symbol on the device.

######  Parameters

`symbol`
    \- Device symbol address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidSymbol, cudaErrorInvalidMemcpyDirection, cudaErrorNoKernelImageForDevice

###### Description

Copies `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `offset` bytes from the start of symbol `symbol`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyHostToDevice, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

  *   * This function exhibits synchronous behavior for most use cases.

  * Use of a string naming a variable as the `symbol` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyToSymbolAsync, cudaMemcpyFromSymbolAsync, cuMemcpy, cuMemcpyHtoD, cuMemcpyDtoD

__host__ cudaError_t cudaMemcpyToSymbolAsync ( const void* symbol, const void* src, size_t count, size_t offset, cudaMemcpyKind kind, cudaStream_t stream = 0 )


Copies data to the given symbol on the device.

######  Parameters

`symbol`
    \- Device symbol address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidSymbol, cudaErrorInvalidMemcpyDirection, cudaErrorNoKernelImageForDevice

###### Description

Copies `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `offset` bytes from the start of symbol `symbol`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyHostToDevice, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

cudaMemcpyToSymbolAsync() is asynchronous with respect to the host, so the call may return before the copy is complete. The copy can optionally be associated to a stream by passing a non-zero `stream` argument. If `kind` is cudaMemcpyHostToDevice and `stream` is non-zero, the copy may overlap with operations in other streams.

  *   * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Use of a string naming a variable as the `symbol` parameter was deprecated in CUDA 4.1 and removed in CUDA 5.0.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemcpy, cudaMemcpy2D, cudaMemcpy2DToArray, cudaMemcpy2DFromArray, cudaMemcpy2DArrayToArray, cudaMemcpyToSymbol, cudaMemcpyFromSymbol, cudaMemcpyAsync, cudaMemcpy2DAsync, cudaMemcpy2DToArrayAsync, cudaMemcpy2DFromArrayAsync, cudaMemcpyFromSymbolAsync, cuMemcpyAsync, cuMemcpyHtoDAsync, cuMemcpyDtoDAsync

__host__ cudaError_t cudaMemset ( void* devPtr, int  value, size_t count )


Initializes or sets device memory to a value.

######  Parameters

`devPtr`
    \- Pointer to device memory
`value`
    \- Value to set for each byte of specified memory
`count`
    \- Size in bytes to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Fills the first `count` bytes of the memory area pointed to by `devPtr` with the constant byte value `value`.

Note that this function is asynchronous with respect to the host unless `devPtr` refers to pinned host memory.

  *   * See also memset synchronization details.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cuMemsetD8, cuMemsetD16, cuMemsetD32

__host__ cudaError_t cudaMemset2D ( void* devPtr, size_t pitch, int  value, size_t width, size_t height )


Initializes or sets device memory to a value.

######  Parameters

`devPtr`
    \- Pointer to 2D device memory
`pitch`
    \- Pitch in bytes of 2D device memory(Unused if `height` is 1)
`value`
    \- Value to set for each byte of specified memory
`width`
    \- Width of matrix set (columns in bytes)
`height`
    \- Height of matrix set (rows)

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets to the specified value `value` a matrix (`height` rows of `width` bytes each) pointed to by `dstPtr`. `pitch` is the width in bytes of the 2D array pointed to by `dstPtr`, including any padding added to the end of each row. This function performs fastest when the pitch is one that has been passed back by cudaMallocPitch().

Note that this function is asynchronous with respect to the host unless `devPtr` refers to pinned host memory.

  *   * See also memset synchronization details.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemset, cudaMemset3D, cudaMemsetAsync, cudaMemset2DAsync, cudaMemset3DAsync, cuMemsetD2D8, cuMemsetD2D16, cuMemsetD2D32

__host__  __device__ cudaError_t cudaMemset2DAsync ( void* devPtr, size_t pitch, int  value, size_t width, size_t height, cudaStream_t stream = 0 )


Initializes or sets device memory to a value.

######  Parameters

`devPtr`
    \- Pointer to 2D device memory
`pitch`
    \- Pitch in bytes of 2D device memory(Unused if `height` is 1)
`value`
    \- Value to set for each byte of specified memory
`width`
    \- Width of matrix set (columns in bytes)
`height`
    \- Height of matrix set (rows)
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets to the specified value `value` a matrix (`height` rows of `width` bytes each) pointed to by `dstPtr`. `pitch` is the width in bytes of the 2D array pointed to by `dstPtr`, including any padding added to the end of each row. This function performs fastest when the pitch is one that has been passed back by cudaMallocPitch().

cudaMemset2DAsync() is asynchronous with respect to the host, so the call may return before the memset is complete. The operation can optionally be associated to a stream by passing a non-zero `stream` argument. If `stream` is non-zero, the operation may overlap with operations in other streams.

The device version of this function only handles device to device copies and cannot be given local or shared pointers.

  *   * See also memset synchronization details.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemset, cudaMemset2D, cudaMemset3D, cudaMemsetAsync, cudaMemset3DAsync, cuMemsetD2D8Async, cuMemsetD2D16Async, cuMemsetD2D32Async

__host__ cudaError_t cudaMemset3D ( cudaPitchedPtr pitchedDevPtr, int  value, cudaExtent extent )


Initializes or sets device memory to a value.

######  Parameters

`pitchedDevPtr`
    \- Pointer to pitched device memory
`value`
    \- Value to set for each byte of specified memory
`extent`
    \- Size parameters for where to set device memory (`width` field in bytes)

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Initializes each element of a 3D array to the specified value `value`. The object to initialize is defined by `pitchedDevPtr`. The `pitch` field of `pitchedDevPtr` is the width in memory in bytes of the 3D array pointed to by `pitchedDevPtr`, including any padding added to the end of each row. The `xsize` field specifies the logical width of each row in bytes, while the `ysize` field specifies the height of each 2D slice in rows. The `pitch` field of `pitchedDevPtr` is ignored when `height` and `depth` are both equal to 1.

The extents of the initialized region are specified as a `width` in bytes, a `height` in rows, and a `depth` in slices.

Extents with `width` greater than or equal to the `xsize` of `pitchedDevPtr` may perform significantly faster than extents narrower than the `xsize`. Secondarily, extents with `height` equal to the `ysize` of `pitchedDevPtr` will perform faster than when the `height` is shorter than the `ysize`.

This function performs fastest when the `pitchedDevPtr` has been allocated by cudaMalloc3D().

Note that this function is asynchronous with respect to the host unless `pitchedDevPtr` refers to pinned host memory.

  *   * See also memset synchronization details.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemset, cudaMemset2D, cudaMemsetAsync, cudaMemset2DAsync, cudaMemset3DAsync, cudaMalloc3D, make_cudaPitchedPtr, make_cudaExtent

__host__  __device__ cudaError_t cudaMemset3DAsync ( cudaPitchedPtr pitchedDevPtr, int  value, cudaExtent extent, cudaStream_t stream = 0 )


Initializes or sets device memory to a value.

######  Parameters

`pitchedDevPtr`
    \- Pointer to pitched device memory
`value`
    \- Value to set for each byte of specified memory
`extent`
    \- Size parameters for where to set device memory (`width` field in bytes)
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Initializes each element of a 3D array to the specified value `value`. The object to initialize is defined by `pitchedDevPtr`. The `pitch` field of `pitchedDevPtr` is the width in memory in bytes of the 3D array pointed to by `pitchedDevPtr`, including any padding added to the end of each row. The `xsize` field specifies the logical width of each row in bytes, while the `ysize` field specifies the height of each 2D slice in rows. The `pitch` field of `pitchedDevPtr` is ignored when `height` and `depth` are both equal to 1.

The extents of the initialized region are specified as a `width` in bytes, a `height` in rows, and a `depth` in slices.

Extents with `width` greater than or equal to the `xsize` of `pitchedDevPtr` may perform significantly faster than extents narrower than the `xsize`. Secondarily, extents with `height` equal to the `ysize` of `pitchedDevPtr` will perform faster than when the `height` is shorter than the `ysize`.

This function performs fastest when the `pitchedDevPtr` has been allocated by cudaMalloc3D().

cudaMemset3DAsync() is asynchronous with respect to the host, so the call may return before the memset is complete. The operation can optionally be associated to a stream by passing a non-zero `stream` argument. If `stream` is non-zero, the operation may overlap with operations in other streams.

The device version of this function only handles device to device copies and cannot be given local or shared pointers.

  *   * See also memset synchronization details.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemset, cudaMemset2D, cudaMemset3D, cudaMemsetAsync, cudaMemset2DAsync, cudaMalloc3D, make_cudaPitchedPtr, make_cudaExtent

__host__  __device__ cudaError_t cudaMemsetAsync ( void* devPtr, int  value, size_t count, cudaStream_t stream = 0 )


Initializes or sets device memory to a value.

######  Parameters

`devPtr`
    \- Pointer to device memory
`value`
    \- Value to set for each byte of specified memory
`count`
    \- Size in bytes to set
`stream`
    \- Stream identifier

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Fills the first `count` bytes of the memory area pointed to by `devPtr` with the constant byte value `value`.

cudaMemsetAsync() is asynchronous with respect to the host, so the call may return before the memset is complete. The operation can optionally be associated to a stream by passing a non-zero `stream` argument. If `stream` is non-zero, the operation may overlap with operations in other streams.

The device version of this function only handles device to device copies and cannot be given local or shared pointers.

  *   * See also memset synchronization details.

  * This function uses standard default stream semantics.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaMemset, cudaMemset2D, cudaMemset3D, cudaMemset2DAsync, cudaMemset3DAsync, cuMemsetD8Async, cuMemsetD16Async, cuMemsetD32Async

__host__ cudaError_t cudaMipmappedArrayGetMemoryRequirements ( cudaArrayMemoryRequirements* memoryRequirements, cudaMipmappedArray_t mipmap, int  device )


Returns the memory requirements of a CUDA mipmapped array.

######  Parameters

`memoryRequirements`
    \- Pointer to cudaArrayMemoryRequirements
`mipmap`
    \- CUDA mipmapped array to get the memory requirements of
`device`
    \- Device to get the memory requirements for

###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Returns the memory requirements of a CUDA mipmapped array in `memoryRequirements` If the CUDA mipmapped array is not allocated with flag cudaArrayDeferredMappingcudaErrorInvalidValue will be returned.

The returned value in cudaArrayMemoryRequirements::size represents the total size of the CUDA mipmapped array. The returned value in cudaArrayMemoryRequirements::alignment represents the alignment necessary for mapping the CUDA mipmapped array.

**See also:**

cudaArrayGetMemoryRequirements

__host__ cudaError_t cudaMipmappedArrayGetSparseProperties ( cudaArraySparseProperties* sparseProperties, cudaMipmappedArray_t mipmap )


Returns the layout properties of a sparse CUDA mipmapped array.

######  Parameters

`sparseProperties`
    \- Pointer to return cudaArraySparseProperties
`mipmap`
    \- The CUDA mipmapped array to get the sparse properties of

###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Returns the sparse array layout properties in `sparseProperties`. If the CUDA mipmapped array is not allocated with flag cudaArraySparsecudaErrorInvalidValue will be returned.

For non-layered CUDA mipmapped arrays, cudaArraySparseProperties::miptailSize returns the size of the mip tail region. The mip tail region includes all mip levels whose width, height or depth is less than that of the tile. For layered CUDA mipmapped arrays, if cudaArraySparseProperties::flags contains cudaArraySparsePropertiesSingleMipTail, then cudaArraySparseProperties::miptailSize specifies the size of the mip tail of all layers combined. Otherwise, cudaArraySparseProperties::miptailSize specifies mip tail size per layer. The returned value of cudaArraySparseProperties::miptailFirstLevel is valid only if cudaArraySparseProperties::miptailSize is non-zero.

**See also:**

cudaArrayGetSparseProperties, cuMemMapArrayAsync

__host__ cudaExtent make_cudaExtent ( size_t w, size_t h, size_t d )


Returns a cudaExtent based on input parameters.

######  Parameters

`w`
    \- Width in elements when referring to array memory, in bytes when referring to linear memory
`h`
    \- Height in elements
`d`
    \- Depth in elements

###### Returns

cudaExtent specified by `w`, `h`, and `d`

###### Description

Returns a cudaExtent based on the specified input parameters `w`, `h`, and `d`.

**See also:**

make_cudaPitchedPtr, make_cudaPos

__host__ cudaPitchedPtr make_cudaPitchedPtr ( void* d, size_t p, size_t xsz, size_t ysz )


Returns a cudaPitchedPtr based on input parameters.

######  Parameters

`d`
    \- Pointer to allocated memory
`p`
    \- Pitch of allocated memory in bytes
`xsz`
    \- Logical width of allocation in elements
`ysz`
    \- Logical height of allocation in elements

###### Returns

cudaPitchedPtr specified by `d`, `p`, `xsz`, and `ysz`

###### Description

Returns a cudaPitchedPtr based on the specified input parameters `d`, `p`, `xsz`, and `ysz`.

**See also:**

make_cudaExtent, make_cudaPos

__host__ cudaPos make_cudaPos ( size_t x, size_t y, size_t z )


Returns a cudaPos based on input parameters.

######  Parameters

`x`
    \- X position
`y`
    \- Y position
`z`
    \- Z position

###### Returns

cudaPos specified by `x`, `y`, and `z`

###### Description

Returns a cudaPos based on the specified input parameters `x`, `y`, and `z`.

**See also:**

make_cudaExtent, make_cudaPitchedPtr

* * *

!


Copyright © 2025 NVIDIA Corporation