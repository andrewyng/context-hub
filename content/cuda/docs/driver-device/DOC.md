---
name: driver-device
description: '**Source:** group__CUDA__DEVICE.html#group__CUDA__DEVICE'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.5. Device Management

**Source:** group__CUDA__DEVICE.html#group__CUDA__DEVICE


### Functions

CUresult cuDeviceGet ( CUdevice* device, int  ordinal )


Returns a handle to a compute device.

######  Parameters

`device`
    \- Returned device handle
`ordinal`
    \- Device number to get handle for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*device` a device handle given an ordinal in the range **0,[cuDeviceGetCount()-1]**.

CUresult cuDeviceGetAttribute ( int* pi, CUdevice_attribute attrib, CUdevice dev )


Returns information about the device.

######  Parameters

`pi`
    \- Returned device attribute value
`attrib`
    \- Device attribute to query
`dev`
    \- Device handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*pi` the integer value of the attribute `attrib` on device `dev`.

CUresult cuDeviceGetCount ( int* count )


Returns the number of compute-capable devices.

######  Parameters

`count`
    \- Returned number of compute-capable devices

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*count` the number of devices with compute capability greater than or equal to 2.0 that are available for execution. If there is no such device, cuDeviceGetCount() returns 0.

CUresult cuDeviceGetDefaultMemPool ( CUmemoryPool* pool_out, CUdevice dev )


Returns the default mempool of a device.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZEDCUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_NOT_SUPPORTED

###### Description

The default mempool of a device contains device memory from that device.

CUresult cuDeviceGetExecAffinitySupport ( int* pi, CUexecAffinityType type, CUdevice dev )


Returns information about the execution affinity support of the device.

######  Parameters

`pi`
    \- 1 if the execution affinity type `type` is supported by the device, or 0 if not
`type`
    \- Execution affinity type to query
`dev`
    \- Device handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*pi` whether execution affinity type `type` is supported by device `dev`. The supported types are:

  * CU_EXEC_AFFINITY_TYPE_SM_COUNT: 1 if context with limited SMs is supported by the device, or 0 if not;


CUresult cuDeviceGetHostAtomicCapabilities ( unsigned int* capabilities, const CUatomicOperation ** operations, unsigned int  count, CUdevice dev )


Queries details about atomic operations supported between the device and host.

######  Parameters

`capabilities`
    \- Returned capability details of each requested operation
`operations`
    \- Requested operations
`count`
    \- Count of requested operations and size of capabilities
`dev`
    \- Device handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*capabilities` the details about requested atomic `*operations` over the the link between `dev` and the host. The allocated size of `*operations` and `*capabilities` must be `count`.

For each CUatomicOperation in `*operations`, the corresponding result in `*capabilities` will be a bitmask indicating which of CUatomicOperationCapability the link supports natively.

Returns CUDA_ERROR_INVALID_DEVICE if `dev` is not valid.

Returns CUDA_ERROR_INVALID_VALUE if `*capabilities` or `*operations` is NULL, if `count` is 0, or if any of `*operations` is not valid.

CUresult cuDeviceGetLuid ( char* luid, unsigned int* deviceNodeMask, CUdevice dev )


Return an LUID and device node mask for the device.

######  Parameters

`luid`
    \- Returned LUID
`deviceNodeMask`
    \- Returned device node mask
`dev`
    \- Device to get identifier string for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Return identifying information (`luid` and `deviceNodeMask`) to allow matching device with graphics APIs.

CUresult cuDeviceGetMemPool ( CUmemoryPool* pool, CUdevice dev )


Gets the current mempool for a device.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the last pool provided to cuDeviceSetMemPool for this device or the device's default memory pool if cuDeviceSetMemPool has never been called. By default the current mempool is the default mempool for a device. Otherwise the returned pool must have been set with cuDeviceSetMemPool.

CUresult cuDeviceGetName ( char* name, int  len, CUdevice dev )


Returns an identifier string for the device.

######  Parameters

`name`
    \- Returned identifier string for the device
`len`
    \- Maximum length of string to store in `name`
`dev`
    \- Device to get identifier string for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns an ASCII string identifying the device `dev` in the NULL-terminated string pointed to by `name`. `len` specifies the maximum length of the string that may be returned. `name` is shortened to the specified `len`, if `len` is less than the device name

CUresult cuDeviceGetNvSciSyncAttributes ( void* nvSciSyncAttrList, CUdevice dev, int  flags )


Return NvSciSync attributes that this device can support.

######  Parameters

`nvSciSyncAttrList`
    \- Return NvSciSync attributes supported.
`dev`
    \- Valid Cuda Device to get NvSciSync attributes for.
`flags`
    \- flags describing NvSciSync usage.

###### Description

Returns in `nvSciSyncAttrList`, the properties of NvSciSync that this CUDA device, `dev` can support. The returned `nvSciSyncAttrList` can be used to create an NvSciSync object that matches this device's capabilities.

If NvSciSyncAttrKey_RequiredPerm field in `nvSciSyncAttrList` is already set this API will return CUDA_ERROR_INVALID_VALUE.

The applications should set `nvSciSyncAttrList` to a valid NvSciSyncAttrList failing which this API will return CUDA_ERROR_INVALID_HANDLE.

The `flags` controls how applications intends to use the NvSciSync created from the `nvSciSyncAttrList`. The valid flags are:

  * CUDA_NVSCISYNC_ATTR_SIGNAL, specifies that the applications intends to signal an NvSciSync on this CUDA device.

  * CUDA_NVSCISYNC_ATTR_WAIT, specifies that the applications intends to wait on an NvSciSync on this CUDA device.


At least one of these flags must be set, failing which the API returns CUDA_ERROR_INVALID_VALUE. Both the flags are orthogonal to one another: a developer may set both these flags that allows to set both wait and signal specific attributes in the same `nvSciSyncAttrList`.

Note that this API updates the input `nvSciSyncAttrList` with values equivalent to the following public attribute key-values: NvSciSyncAttrKey_RequiredPerm is set to

  * NvSciSyncAccessPerm_SignalOnly if CUDA_NVSCISYNC_ATTR_SIGNAL is set in `flags`.

  * NvSciSyncAccessPerm_WaitOnly if CUDA_NVSCISYNC_ATTR_WAIT is set in `flags`.

  * NvSciSyncAccessPerm_WaitSignal if both CUDA_NVSCISYNC_ATTR_WAIT and CUDA_NVSCISYNC_ATTR_SIGNAL are set in `flags`. NvSciSyncAttrKey_PrimitiveInfo is set to

  * NvSciSyncAttrValPrimitiveType_SysmemSemaphore on any valid `device`.

  * NvSciSyncAttrValPrimitiveType_Syncpoint if `device` is a Tegra device.

  * NvSciSyncAttrValPrimitiveType_SysmemSemaphorePayload64b if `device` is GA10X+. NvSciSyncAttrKey_GpuId is set to the same UUID that is returned for this `device` from cuDeviceGetUuid.


CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_OUT_OF_MEMORY

CUresult cuDeviceGetTexture1DLinearMaxWidth ( size_t* maxWidthInElements, CUarray_format format, unsigned numChannels, CUdevice dev )


Returns the maximum number of elements allocatable in a 1D linear texture for a given texture element size.

######  Parameters

`maxWidthInElements`
    \- Returned maximum number of texture elements allocatable for given `format` and `numChannels`.
`format`
    \- Texture format.
`numChannels`
    \- Number of channels per texture element.
`dev`
    \- Device handle.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `maxWidthInElements` the maximum number of texture elements allocatable in a 1D linear texture for given `format` and `numChannels`.

CUresult cuDeviceGetUuid ( CUuuid* uuid, CUdevice dev )


Return an UUID for the device.

######  Parameters

`uuid`
    \- Returned UUID
`dev`
    \- Device to get identifier string for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns 16-octets identifying the device `dev` in the structure pointed by the `uuid`. If the device is in MIG mode, returns its MIG UUID which uniquely identifies the subscribed MIG compute instance.

CUresult cuDeviceSetMemPool ( CUdevice dev, CUmemoryPool pool )


Sets the current memory pool of a device.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

The memory pool must be local to the specified device. cuMemAllocAsync allocates from the current mempool of the provided stream's device. By default, a device's current memory pool is its default memory pool.

Use cuMemAllocFromPoolAsync to specify asynchronous allocations from a device different than the one the stream runs on.

CUresult cuDeviceTotalMem ( size_t* bytes, CUdevice dev )


Returns the total amount of memory on the device.

######  Parameters

`bytes`
    \- Returned memory available on device in bytes
`dev`
    \- Device handle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*bytes` the total amount of memory available on the device `dev` in bytes.

CUresult cuFlushGPUDirectRDMAWrites ( CUflushGPUDirectRDMAWritesTarget target, CUflushGPUDirectRDMAWritesScope scope )


Blocks until remote writes are visible to the specified scope.

######  Parameters

`target`
    \- The target of the operation, see CUflushGPUDirectRDMAWritesTarget
`scope`
    \- The scope of the operation, see CUflushGPUDirectRDMAWritesScope

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Blocks until GPUDirect RDMA writes to the target context via mappings created through APIs like nvidia_p2p_get_pages (see <https://docs.nvidia.com/cuda/gpudirect-rdma> for more information), are visible to the specified scope.

If the scope equals or lies within the scope indicated by CU_DEVICE_ATTRIBUTE_GPU_DIRECT_RDMA_WRITES_ORDERING, the call will be a no-op and can be safely omitted for performance. This can be determined by comparing the numerical values between the two enums, with smaller scopes having smaller values.

On platforms that support GPUDirect RDMA writes via more than one path in hardware (see CU_MEM_RANGE_FLAG_DMA_BUF_MAPPING_TYPE_PCIE), the user should consider those paths as belonging to separate ordering domains. Note that in such cases CUDA driver will report both RDMA writes ordering and RDMA write scope as ALL_DEVICES and a call to cuFlushGPUDirectRDMA will be a no-op, but when these multiple paths are used simultaneously, it is the user's responsibility to ensure ordering by using mechanisms outside the scope of CUDA.

Users may query support for this API via CU_DEVICE_ATTRIBUTE_FLUSH_FLUSH_GPU_DIRECT_RDMA_OPTIONS.



