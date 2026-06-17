---
name: runtime-extres--interop
description: '**Source:** group__CUDART__EXTRES__INTEROP.html#group__CUDART__EXTRES__INTEROP'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.6. External Resource Interoperability

**Source:** group__CUDART__EXTRES__INTEROP.html#group__CUDART__EXTRES__INTEROP


### Functions

__host__ cudaError_t cudaDestroyExternalMemory ( cudaExternalMemory_t extMem )


Destroys an external memory object.

######  Parameters

`extMem`
    \- External memory object to be destroyed

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle

###### Description

Destroys the specified external memory object. Any existing buffers and CUDA mipmapped arrays mapped onto this object must no longer be used and must be explicitly freed using cudaFree and cudaFreeMipmappedArray respectively.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaImportExternalMemory, cudaExternalMemoryGetMappedBuffer, cudaExternalMemoryGetMappedMipmappedArray

__host__ cudaError_t cudaDestroyExternalSemaphore ( cudaExternalSemaphore_t extSem )


Destroys an external semaphore.

######  Parameters

`extSem`
    \- External semaphore to be destroyed

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle

###### Description

Destroys an external semaphore object and releases any references to the underlying resource. Any outstanding signals or waits must have completed before the semaphore is destroyed.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaImportExternalSemaphore, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaExternalMemoryGetMappedBuffer ( void** devPtr, cudaExternalMemory_t extMem, const cudaExternalMemoryBufferDesc* bufferDesc )


Maps a buffer onto an imported memory object.

######  Parameters

`devPtr`
    \- Returned device pointer to buffer
`extMem`
    \- Handle to external memory object
`bufferDesc`
    \- Buffer descriptor

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Maps a buffer onto an imported memory object and returns a device pointer in `devPtr`.

The properties of the buffer being mapped must be described in `bufferDesc`. The cudaExternalMemoryBufferDesc structure is defined as follows:


    ‎        typedef struct cudaExternalMemoryBufferDesc_st {
                      unsigned long long offset;
                      unsigned long long size;
                      unsigned int flags;
                  } cudaExternalMemoryBufferDesc;

where cudaExternalMemoryBufferDesc::offset is the offset in the memory object where the buffer's base address is. cudaExternalMemoryBufferDesc::size is the size of the buffer. cudaExternalMemoryBufferDesc::flags must be zero.

The offset and size have to be suitably aligned to match the requirements of the external API. Mapping two buffers whose ranges overlap may or may not result in the same virtual address being returned for the overlapped portion. In such cases, the application must ensure that all accesses to that region from the GPU are volatile. Otherwise writes made via one address are not guaranteed to be visible via the other address, even if they're issued by the same thread. It is recommended that applications map the combined range instead of mapping separate buffers and then apply the appropriate offsets to the returned pointer to derive the individual buffers.

The returned pointer `devPtr` must be freed using cudaFree.


**See also:**

cudaImportExternalMemory, cudaDestroyExternalMemory, cudaExternalMemoryGetMappedMipmappedArray

__host__ cudaError_t cudaExternalMemoryGetMappedMipmappedArray ( cudaMipmappedArray_t* mipmap, cudaExternalMemory_t extMem, const cudaExternalMemoryMipmappedArrayDesc* mipmapDesc )


Maps a CUDA mipmapped array onto an external memory object.

######  Parameters

`mipmap`
    \- Returned CUDA mipmapped array
`extMem`
    \- Handle to external memory object
`mipmapDesc`
    \- CUDA array descriptor

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Maps a CUDA mipmapped array onto an external object and returns a handle to it in `mipmap`.

The properties of the CUDA mipmapped array being mapped must be described in `mipmapDesc`. The structure cudaExternalMemoryMipmappedArrayDesc is defined as follows:


    ‎        typedef struct cudaExternalMemoryMipmappedArrayDesc_st {
                      unsigned long long offset;
                      cudaChannelFormatDesc formatDesc;
                      cudaExtent extent;
                      unsigned int flags;
                      unsigned int numLevels;
                  } cudaExternalMemoryMipmappedArrayDesc;

where cudaExternalMemoryMipmappedArrayDesc::offset is the offset in the memory object where the base level of the mipmap chain is. cudaExternalMemoryMipmappedArrayDesc::formatDesc describes the format of the data. cudaExternalMemoryMipmappedArrayDesc::extent specifies the dimensions of the base level of the mipmap chain. cudaExternalMemoryMipmappedArrayDesc::flags are flags associated with CUDA mipmapped arrays. For further details, please refer to the documentation for cudaMalloc3DArray. Note that if the mipmapped array is bound as a color target in the graphics API, then the flag cudaArrayColorAttachment must be specified in cudaExternalMemoryMipmappedArrayDesc::flags. cudaExternalMemoryMipmappedArrayDesc::numLevels specifies the total number of levels in the mipmap chain.

The returned CUDA mipmapped array must be freed using cudaFreeMipmappedArray.


**See also:**

cudaImportExternalMemory, cudaDestroyExternalMemory, cudaExternalMemoryGetMappedBuffer

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeNvSciBuf, then cudaExternalMemoryMipmappedArrayDesc::numLevels must not be greater than 1.

__host__ cudaError_t cudaImportExternalMemory ( cudaExternalMemory_t* extMem_out, const cudaExternalMemoryHandleDesc* memHandleDesc )


Imports an external memory object.

######  Parameters

`extMem_out`
    \- Returned handle to an external memory object
`memHandleDesc`
    \- Memory import handle descriptor

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorOperatingSystem

###### Description

Imports an externally allocated memory object and returns a handle to that in `extMem_out`.

The properties of the handle being imported must be described in `memHandleDesc`. The cudaExternalMemoryHandleDesc structure is defined as follows:


    ‎        typedef struct cudaExternalMemoryHandleDesc_st {
                      cudaExternalMemoryHandleType type;
                      union {
                          int fd;
                          struct {
                              void *handle;
                              const void *name;
                          } win32;
                          const void *nvSciBufObject;
                      } handle;
                      unsigned long long size;
                      unsigned int flags;
                  } cudaExternalMemoryHandleDesc;

where cudaExternalMemoryHandleDesc::type specifies the type of handle being imported. cudaExternalMemoryHandleType is defined as:


    ‎        typedef enum cudaExternalMemoryHandleType_enum {
                      cudaExternalMemoryHandleTypeOpaqueFd         = 1
                      cudaExternalMemoryHandleTypeOpaqueWin32      = 2
                      cudaExternalMemoryHandleTypeOpaqueWin32Kmt   = 3
                      cudaExternalMemoryHandleTypeD3D12Heap        = 4
                      cudaExternalMemoryHandleTypeD3D12Resource    = 5
                      cudaExternalMemoryHandleTypeD3D11Resource    = 6
                      cudaExternalMemoryHandleTypeD3D11ResourceKmt = 7
                      cudaExternalMemoryHandleTypeNvSciBuf         = 8
                  } cudaExternalMemoryHandleType;

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeOpaqueFd, then cudaExternalMemoryHandleDesc::handle::fd must be a valid file descriptor referencing a memory object. Ownership of the file descriptor is transferred to the CUDA driver when the handle is imported successfully. Performing any operations on the file descriptor after it is imported results in undefined behavior.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeOpaqueWin32, then exactly one of cudaExternalMemoryHandleDesc::handle::win32::handle and cudaExternalMemoryHandleDesc::handle::win32::name must not be NULL. If cudaExternalMemoryHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that references a memory object. Ownership of this handle is not transferred to CUDA after the import operation, so the application must release the handle using the appropriate system call. If cudaExternalMemoryHandleDesc::handle::win32::name is not NULL, then it must point to a NULL-terminated array of UTF-16 characters that refers to a memory object.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeOpaqueWin32Kmt, then cudaExternalMemoryHandleDesc::handle::win32::handle must be non-NULL and cudaExternalMemoryHandleDesc::handle::win32::name must be NULL. The handle specified must be a globally shared KMT handle. This handle does not hold a reference to the underlying object, and thus will be invalid when all references to the memory object are destroyed.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeD3D12Heap, then exactly one of cudaExternalMemoryHandleDesc::handle::win32::handle and cudaExternalMemoryHandleDesc::handle::win32::name must not be NULL. If cudaExternalMemoryHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that is returned by ID3D12Device::CreateSharedHandle when referring to a ID3D12Heap object. This handle holds a reference to the underlying object. If cudaExternalMemoryHandleDesc::handle::win32::name is not NULL, then it must point to a NULL-terminated array of UTF-16 characters that refers to a ID3D12Heap object.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeD3D12Resource, then exactly one of cudaExternalMemoryHandleDesc::handle::win32::handle and cudaExternalMemoryHandleDesc::handle::win32::name must not be NULL. If cudaExternalMemoryHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that is returned by ID3D12Device::CreateSharedHandle when referring to a ID3D12Resource object. This handle holds a reference to the underlying object. If cudaExternalMemoryHandleDesc::handle::win32::name is not NULL, then it must point to a NULL-terminated array of UTF-16 characters that refers to a ID3D12Resource object.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeD3D11Resource,then exactly one of cudaExternalMemoryHandleDesc::handle::win32::handle and cudaExternalMemoryHandleDesc::handle::win32::name must not be NULL. If cudaExternalMemoryHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that is returned by IDXGIResource1::CreateSharedHandle when referring to a ID3D11Resource object. If cudaExternalMemoryHandleDesc::handle::win32::name is not NULL, then it must point to a NULL-terminated array of UTF-16 characters that refers to a ID3D11Resource object.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeD3D11ResourceKmt, then cudaExternalMemoryHandleDesc::handle::win32::handle must be non-NULL and cudaExternalMemoryHandleDesc::handle::win32::name must be NULL. The handle specified must be a valid shared KMT handle that is returned by IDXGIResource::GetSharedHandle when referring to a ID3D11Resource object.

If cudaExternalMemoryHandleDesc::type is cudaExternalMemoryHandleTypeNvSciBuf, then cudaExternalMemoryHandleDesc::handle::nvSciBufObject must be NON-NULL and reference a valid NvSciBuf object. If the NvSciBuf object imported into CUDA is also mapped by other drivers, then the application must use cudaWaitExternalSemaphoresAsync or cudaSignalExternalSemaphoresAsync as approprriate barriers to maintain coherence between CUDA and the other drivers. See cudaExternalSemaphoreWaitSkipNvSciBufMemSync and cudaExternalSemaphoreSignalSkipNvSciBufMemSync for memory synchronization.

The size of the memory object must be specified in cudaExternalMemoryHandleDesc::size.

Specifying the flag cudaExternalMemoryDedicated in cudaExternalMemoryHandleDesc::flags indicates that the resource is a dedicated resource. The definition of what a dedicated resource is outside the scope of this extension. This flag must be set if cudaExternalMemoryHandleDesc::type is one of the following: cudaExternalMemoryHandleTypeD3D12ResourcecudaExternalMemoryHandleTypeD3D11ResourcecudaExternalMemoryHandleTypeD3D11ResourceKmt

  * If the Vulkan memory imported into CUDA is mapped on the CPU then the application must use vkInvalidateMappedMemoryRanges/vkFlushMappedMemoryRanges as well as appropriate Vulkan pipeline barriers to maintain coherence between CPU and GPU. For more information on these APIs, please refer to "Synchronization and Cache Control" chapter from Vulkan specification.


**See also:**

cudaDestroyExternalMemory, cudaExternalMemoryGetMappedBuffer, cudaExternalMemoryGetMappedMipmappedArray

__host__ cudaError_t cudaImportExternalSemaphore ( cudaExternalSemaphore_t* extSem_out, const cudaExternalSemaphoreHandleDesc* semHandleDesc )


Imports an external semaphore.

######  Parameters

`extSem_out`
    \- Returned handle to an external semaphore
`semHandleDesc`
    \- Semaphore import handle descriptor

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle, cudaErrorOperatingSystem

###### Description

Imports an externally allocated synchronization object and returns a handle to that in `extSem_out`.

The properties of the handle being imported must be described in `semHandleDesc`. The cudaExternalSemaphoreHandleDesc is defined as follows:


    ‎        typedef struct cudaExternalSemaphoreHandleDesc_st {
                      cudaExternalSemaphoreHandleType type;
                      union {
                          int fd;
                          struct {
                              void *handle;
                              const void *name;
                          } win32;
                          const void* NvSciSyncObj;
                      } handle;
                      unsigned int flags;
                  } cudaExternalSemaphoreHandleDesc;

where cudaExternalSemaphoreHandleDesc::type specifies the type of handle being imported. cudaExternalSemaphoreHandleType is defined as:


    ‎        typedef enum cudaExternalSemaphoreHandleType_enum {
                      cudaExternalSemaphoreHandleTypeOpaqueFd                = 1
                      cudaExternalSemaphoreHandleTypeOpaqueWin32             = 2
                      cudaExternalSemaphoreHandleTypeOpaqueWin32Kmt          = 3
                      cudaExternalSemaphoreHandleTypeD3D12Fence              = 4
                      cudaExternalSemaphoreHandleTypeD3D11Fence              = 5
                      cudaExternalSemaphoreHandleTypeNvSciSync               = 6
                      cudaExternalSemaphoreHandleTypeKeyedMutex              = 7
                      cudaExternalSemaphoreHandleTypeKeyedMutexKmt           = 8
                      cudaExternalSemaphoreHandleTypeTimelineSemaphoreFd     = 9
                      cudaExternalSemaphoreHandleTypeTimelineSemaphoreWin32  = 10
                  } cudaExternalSemaphoreHandleType;

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeOpaqueFd, then cudaExternalSemaphoreHandleDesc::handle::fd must be a valid file descriptor referencing a synchronization object. Ownership of the file descriptor is transferred to the CUDA driver when the handle is imported successfully. Performing any operations on the file descriptor after it is imported results in undefined behavior.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeOpaqueWin32, then exactly one of cudaExternalSemaphoreHandleDesc::handle::win32::handle and cudaExternalSemaphoreHandleDesc::handle::win32::name must not be NULL. If cudaExternalSemaphoreHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that references a synchronization object. Ownership of this handle is not transferred to CUDA after the import operation, so the application must release the handle using the appropriate system call. If cudaExternalSemaphoreHandleDesc::handle::win32::name is not NULL, then it must name a valid synchronization object.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeOpaqueWin32Kmt, then cudaExternalSemaphoreHandleDesc::handle::win32::handle must be non-NULL and cudaExternalSemaphoreHandleDesc::handle::win32::name must be NULL. The handle specified must be a globally shared KMT handle. This handle does not hold a reference to the underlying object, and thus will be invalid when all references to the synchronization object are destroyed.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeD3D12Fence, then exactly one of cudaExternalSemaphoreHandleDesc::handle::win32::handle and cudaExternalSemaphoreHandleDesc::handle::win32::name must not be NULL. If cudaExternalSemaphoreHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that is returned by ID3D12Device::CreateSharedHandle when referring to a ID3D12Fence object. This handle holds a reference to the underlying object. If cudaExternalSemaphoreHandleDesc::handle::win32::name is not NULL, then it must name a valid synchronization object that refers to a valid ID3D12Fence object.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeD3D11Fence, then exactly one of cudaExternalSemaphoreHandleDesc::handle::win32::handle and cudaExternalSemaphoreHandleDesc::handle::win32::name must not be NULL. If cudaExternalSemaphoreHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that is returned by ID3D11Fence::CreateSharedHandle. If cudaExternalSemaphoreHandleDesc::handle::win32::name is not NULL, then it must name a valid synchronization object that refers to a valid ID3D11Fence object.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeNvSciSync, then cudaExternalSemaphoreHandleDesc::handle::nvSciSyncObj represents a valid NvSciSyncObj.

cudaExternalSemaphoreHandleTypeKeyedMutex, then exactly one of cudaExternalSemaphoreHandleDesc::handle::win32::handle and cudaExternalSemaphoreHandleDesc::handle::win32::name must not be NULL. If cudaExternalSemaphoreHandleDesc::handle::win32::handle is not NULL, then it represent a valid shared NT handle that is returned by IDXGIResource1::CreateSharedHandle when referring to a IDXGIKeyedMutex object.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeKeyedMutexKmt, then cudaExternalSemaphoreHandleDesc::handle::win32::handle must be non-NULL and cudaExternalSemaphoreHandleDesc::handle::win32::name must be NULL. The handle specified must represent a valid KMT handle that is returned by IDXGIResource::GetSharedHandle when referring to a IDXGIKeyedMutex object.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeTimelineSemaphoreFd, then cudaExternalSemaphoreHandleDesc::handle::fd must be a valid file descriptor referencing a synchronization object. Ownership of the file descriptor is transferred to the CUDA driver when the handle is imported successfully. Performing any operations on the file descriptor after it is imported results in undefined behavior.

If cudaExternalSemaphoreHandleDesc::type is cudaExternalSemaphoreHandleTypeTimelineSemaphoreWin32, then exactly one of cudaExternalSemaphoreHandleDesc::handle::win32::handle and cudaExternalSemaphoreHandleDesc::handle::win32::name must not be NULL. If cudaExternalSemaphoreHandleDesc::handle::win32::handle is not NULL, then it must represent a valid shared NT handle that references a synchronization object. Ownership of this handle is not transferred to CUDA after the import operation, so the application must release the handle using the appropriate system call. If cudaExternalSemaphoreHandleDesc::handle::win32::name is not NULL, then it must name a valid synchronization object.


**See also:**

cudaDestroyExternalSemaphore, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaSignalExternalSemaphoresAsync ( const cudaExternalSemaphore_t* extSemArray, const cudaExternalSemaphoreSignalParams* paramsArray, unsigned int  numExtSems, cudaStream_t stream = 0 )


Signals a set of external semaphore objects.

######  Parameters

`extSemArray`
    \- Set of external semaphores to be signaled
`paramsArray`
    \- Array of semaphore parameters
`numExtSems`
    \- Number of semaphores to signal
`stream`
    \- Stream to enqueue the signal operations in

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandle

###### Description

Enqueues a signal operation on a set of externally allocated semaphore object in the specified stream. The operations will be executed when all prior operations in the stream complete.

The exact semantics of signaling a semaphore depends on the type of the object.

If the semaphore object is any one of the following types: cudaExternalSemaphoreHandleTypeOpaqueFd, cudaExternalSemaphoreHandleTypeOpaqueWin32, cudaExternalSemaphoreHandleTypeOpaqueWin32Kmt then signaling the semaphore will set it to the signaled state.

If the semaphore object is any one of the following types: cudaExternalSemaphoreHandleTypeD3D12Fence, cudaExternalSemaphoreHandleTypeD3D11Fence, cudaExternalSemaphoreHandleTypeTimelineSemaphoreFd, cudaExternalSemaphoreHandleTypeTimelineSemaphoreWin32 then the semaphore will be set to the value specified in cudaExternalSemaphoreSignalParams::params::fence::value.

If the semaphore object is of the type cudaExternalSemaphoreHandleTypeNvSciSync this API sets cudaExternalSemaphoreSignalParams::params::nvSciSync::fence to a value that can be used by subsequent waiters of the same NvSciSync object to order operations with those currently submitted in `stream`. Such an update will overwrite previous contents of cudaExternalSemaphoreSignalParams::params::nvSciSync::fence. By default, signaling such an external semaphore object causes appropriate memory synchronization operations to be performed over all the external memory objects that are imported as cudaExternalMemoryHandleTypeNvSciBuf. This ensures that any subsequent accesses made by other importers of the same set of NvSciBuf memory object(s) are coherent. These operations can be skipped by specifying the flag cudaExternalSemaphoreSignalSkipNvSciBufMemSync, which can be used as a performance optimization when data coherency is not required. But specifying this flag in scenarios where data coherency is required results in undefined behavior. Also, for semaphore object of the type cudaExternalSemaphoreHandleTypeNvSciSync, if the NvSciSyncAttrList used to create the NvSciSyncObj had not set the flags in cudaDeviceGetNvSciSyncAttributes to cudaNvSciSyncAttrSignal, this API will return cudaErrorNotSupported.

cudaExternalSemaphoreSignalParams::params::nvSciSync::fence associated with semaphore object of the type cudaExternalSemaphoreHandleTypeNvSciSync can be deterministic. For this the NvSciSyncAttrList used to create the semaphore object must have value of NvSciSyncAttrKey_RequireDeterministicFences key set to true. Deterministic fences allow users to enqueue a wait over the semaphore object even before corresponding signal is enqueued. For such a semaphore object, CUDA guarantees that each signal operation will increment the fence value by '1'. Users are expected to track count of signals enqueued on the semaphore object and insert waits accordingly. When such a semaphore object is signaled from multiple streams, due to concurrent stream execution, it is possible that the order in which the semaphore gets signaled is indeterministic. This could lead to waiters of the semaphore getting unblocked incorrectly. Users are expected to handle such situations, either by not using the same semaphore object with deterministic fence support enabled in different streams or by adding explicit dependency amongst such streams so that the semaphore is signaled in order. cudaExternalSemaphoreSignalParams::params::nvSciSync::fence associated with semaphore object of the type cudaExternalSemaphoreHandleTypeNvSciSync can be timestamp enabled. For this the NvSciSyncAttrList used to create the object must have the value of NvSciSyncAttrKey_WaiterRequireTimestamps key set to true. Timestamps are emitted asynchronously by the GPU and CUDA saves the GPU timestamp in the corresponding NvSciSyncFence at the time of signal on GPU. Users are expected to convert GPU clocks to CPU clocks using appropriate scaling functions. Users are expected to wait for the completion of the fence before extracting timestamp using appropriate NvSciSync APIs. Users are expected to ensure that there is only one outstanding timestamp enabled fence per Cuda-NvSciSync object at any point of time, failing which leads to undefined behavior. Extracting the timestamp before the corresponding fence is signalled could lead to undefined behaviour. Timestamp extracted via appropriate NvSciSync API would be in microseconds.

If the semaphore object is any one of the following types: cudaExternalSemaphoreHandleTypeKeyedMutex, cudaExternalSemaphoreHandleTypeKeyedMutexKmt, then the keyed mutex will be released with the key specified in cudaExternalSemaphoreSignalParams::params::keyedmutex::key.


**See also:**

cudaImportExternalSemaphore, cudaDestroyExternalSemaphore, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaWaitExternalSemaphoresAsync ( const cudaExternalSemaphore_t* extSemArray, const cudaExternalSemaphoreWaitParams* paramsArray, unsigned int  numExtSems, cudaStream_t stream = 0 )


Waits on a set of external semaphore objects.

######  Parameters

`extSemArray`
    \- External semaphores to be waited on
`paramsArray`
    \- Array of semaphore parameters
`numExtSems`
    \- Number of semaphores to wait on
`stream`
    \- Stream to enqueue the wait operations in

###### Returns

cudaSuccess, cudaErrorInvalidResourceHandlecudaErrorTimeout

###### Description

Enqueues a wait operation on a set of externally allocated semaphore object in the specified stream. The operations will be executed when all prior operations in the stream complete.

The exact semantics of waiting on a semaphore depends on the type of the object.

If the semaphore object is any one of the following types: cudaExternalSemaphoreHandleTypeOpaqueFd, cudaExternalSemaphoreHandleTypeOpaqueWin32, cudaExternalSemaphoreHandleTypeOpaqueWin32Kmt then waiting on the semaphore will wait until the semaphore reaches the signaled state. The semaphore will then be reset to the unsignaled state. Therefore for every signal operation, there can only be one wait operation.

If the semaphore object is any one of the following types: cudaExternalSemaphoreHandleTypeD3D12Fence, cudaExternalSemaphoreHandleTypeD3D11Fence, cudaExternalSemaphoreHandleTypeTimelineSemaphoreFd, cudaExternalSemaphoreHandleTypeTimelineSemaphoreWin32 then waiting on the semaphore will wait until the value of the semaphore is greater than or equal to cudaExternalSemaphoreWaitParams::params::fence::value.

If the semaphore object is of the type cudaExternalSemaphoreHandleTypeNvSciSync then, waiting on the semaphore will wait until the cudaExternalSemaphoreSignalParams::params::nvSciSync::fence is signaled by the signaler of the NvSciSyncObj that was associated with this semaphore object. By default, waiting on such an external semaphore object causes appropriate memory synchronization operations to be performed over all external memory objects that are imported as cudaExternalMemoryHandleTypeNvSciBuf. This ensures that any subsequent accesses made by other importers of the same set of NvSciBuf memory object(s) are coherent. These operations can be skipped by specifying the flag cudaExternalSemaphoreWaitSkipNvSciBufMemSync, which can be used as a performance optimization when data coherency is not required. But specifying this flag in scenarios where data coherency is required results in undefined behavior. Also, for semaphore object of the type cudaExternalSemaphoreHandleTypeNvSciSync, if the NvSciSyncAttrList used to create the NvSciSyncObj had not set the flags in cudaDeviceGetNvSciSyncAttributes to cudaNvSciSyncAttrWait, this API will return cudaErrorNotSupported.

If the semaphore object is any one of the following types: cudaExternalSemaphoreHandleTypeKeyedMutex, cudaExternalSemaphoreHandleTypeKeyedMutexKmt, then the keyed mutex will be acquired when it is released with the key specified in cudaExternalSemaphoreSignalParams::params::keyedmutex::key or until the timeout specified by cudaExternalSemaphoreSignalParams::params::keyedmutex::timeoutMs has lapsed. The timeout interval can either be a finite value specified in milliseconds or an infinite value. In case an infinite value is specified the timeout never elapses. The windows INFINITE macro must be used to specify infinite timeout


**See also:**

cudaImportExternalSemaphore, cudaDestroyExternalSemaphore, cudaSignalExternalSemaphoresAsync

* * *

!


Copyright © 2025 NVIDIA Corporation