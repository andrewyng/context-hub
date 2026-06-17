---
name: driver-memop
description: '**Source:** group__CUDA__MEMOP.html#group__CUDA__MEMOP'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.21. Stream Memory Operations

**Source:** group__CUDA__MEMOP.html#group__CUDA__MEMOP


### Functions

CUresult cuStreamBatchMemOp ( CUstream stream, unsigned int  count, CUstreamBatchMemOpParams* paramArray, unsigned int  flags )


Batch operations to synchronize the stream via memory operations.

######  Parameters

`stream`
    The stream to enqueue the operations in.
`count`
    The number of operations in the array. Must be less than 256.
`paramArray`
    The types and parameters of the individual operations.
`flags`
    Reserved for future expansion; must be 0.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

This is a batch version of cuStreamWaitValue32() and cuStreamWriteValue32(). Batching operations may avoid some performance overhead in both the API call and the device execution versus adding them to the stream in separate API calls. The operations are enqueued in the order they appear in the array.

See CUstreamBatchMemOpType for the full set of supported operations, and cuStreamWaitValue32(), cuStreamWaitValue64(), cuStreamWriteValue32(), and cuStreamWriteValue64() for details of specific operations.

See related APIs for details on querying support for specific operations.

Warning: Improper use of this API may deadlock the application. Synchronization ordering established through this API is not visible to CUDA. CUDA tasks that are (even indirectly) ordered by this API should also have that order expressed with CUDA-visible dependencies such as events. This ensures that the scheduler does not serialize them in an improper order.

CUresult cuStreamWaitValue32 ( CUstream stream, CUdeviceptr addr, cuuint32_t value, unsigned int  flags )


Wait on a memory location.

######  Parameters

`stream`
    The stream to synchronize on the memory location.
`addr`
    The memory location to wait on.
`value`
    The value to compare with the memory location.
`flags`
    See CUstreamWaitValue_flags.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Enqueues a synchronization of the stream on the given memory location. Work ordered after the operation will block until the given condition on the memory is satisfied. By default, the condition is to wait for (int32_t)(*addr - value) >= 0, a cyclic greater-or-equal. Other condition types can be specified via `flags`.

If the memory was registered via cuMemHostRegister(), the device pointer should be obtained with cuMemHostGetDevicePointer(). This function cannot be used with managed memory (cuMemAllocManaged).

Support for CU_STREAM_WAIT_VALUE_NOR can be queried with cuDeviceGetAttribute() and CU_DEVICE_ATTRIBUTE_CAN_USE_STREAM_WAIT_VALUE_NOR_V2.

Warning: Improper use of this API may deadlock the application. Synchronization ordering established through this API is not visible to CUDA. CUDA tasks that are (even indirectly) ordered by this API should also have that order expressed with CUDA-visible dependencies such as events. This ensures that the scheduler does not serialize them in an improper order.

CUresult cuStreamWaitValue64 ( CUstream stream, CUdeviceptr addr, cuuint64_t value, unsigned int  flags )


Wait on a memory location.

######  Parameters

`stream`
    The stream to synchronize on the memory location.
`addr`
    The memory location to wait on.
`value`
    The value to compare with the memory location.
`flags`
    See CUstreamWaitValue_flags.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Enqueues a synchronization of the stream on the given memory location. Work ordered after the operation will block until the given condition on the memory is satisfied. By default, the condition is to wait for (int64_t)(*addr - value) >= 0, a cyclic greater-or-equal. Other condition types can be specified via `flags`.

If the memory was registered via cuMemHostRegister(), the device pointer should be obtained with cuMemHostGetDevicePointer().

Support for this can be queried with cuDeviceGetAttribute() and CU_DEVICE_ATTRIBUTE_CAN_USE_64_BIT_STREAM_MEM_OPS.

Warning: Improper use of this API may deadlock the application. Synchronization ordering established through this API is not visible to CUDA. CUDA tasks that are (even indirectly) ordered by this API should also have that order expressed with CUDA-visible dependencies such as events. This ensures that the scheduler does not serialize them in an improper order.

CUresult cuStreamWriteValue32 ( CUstream stream, CUdeviceptr addr, cuuint32_t value, unsigned int  flags )


Write a value to memory.

######  Parameters

`stream`
    The stream to do the write in.
`addr`
    The device address to write to.
`value`
    The value to write.
`flags`
    See CUstreamWriteValue_flags.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Write a value to memory.

If the memory was registered via cuMemHostRegister(), the device pointer should be obtained with cuMemHostGetDevicePointer(). This function cannot be used with managed memory (cuMemAllocManaged).

CUresult cuStreamWriteValue64 ( CUstream stream, CUdeviceptr addr, cuuint64_t value, unsigned int  flags )


Write a value to memory.

######  Parameters

`stream`
    The stream to do the write in.
`addr`
    The device address to write to.
`value`
    The value to write.
`flags`
    See CUstreamWriteValue_flags.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Write a value to memory.

If the memory was registered via cuMemHostRegister(), the device pointer should be obtained with cuMemHostGetDevicePointer().

Support for this can be queried with cuDeviceGetAttribute() and CU_DEVICE_ATTRIBUTE_CAN_USE_64_BIT_STREAM_MEM_OPS.


