---
name: driver-peer--access
description: '**Source:** group__CUDA__PEER__ACCESS.html#group__CUDA__PEER__ACCESS'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.31. Peer Context Memory Access

**Source:** group__CUDA__PEER__ACCESS.html#group__CUDA__PEER__ACCESS


### Functions

CUresult cuCtxDisablePeerAccess ( CUcontext peerContext )


Disables direct access to memory allocations in a peer context and unregisters any registered allocations.

######  Parameters

`peerContext`
    \- Peer context to disable direct access to

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_PEER_ACCESS_NOT_ENABLED, CUDA_ERROR_INVALID_CONTEXT

###### Description

Returns CUDA_ERROR_PEER_ACCESS_NOT_ENABLED if direct peer access has not yet been enabled from `peerContext` to the current context.

Returns CUDA_ERROR_INVALID_CONTEXT if there is no current context, or if `peerContext` is not a valid context.

CUresult cuCtxEnablePeerAccess ( CUcontext peerContext, unsigned int  Flags )


Enables direct access to memory allocations in a peer context.

######  Parameters

`peerContext`
    \- Peer context to enable direct access to from the current context
`Flags`
    \- Reserved for future use and must be set to 0

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_PEER_ACCESS_ALREADY_ENABLED, CUDA_ERROR_TOO_MANY_PEERS, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_PEER_ACCESS_UNSUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

If both the current context and `peerContext` are on devices which support unified addressing (as may be queried using CU_DEVICE_ATTRIBUTE_UNIFIED_ADDRESSING) and same major compute capability, then on success all allocations from `peerContext` will immediately be accessible by the current context. See Unified Addressing for additional details.

Note that access granted by this call is unidirectional and that in order to access memory from the current context in `peerContext`, a separate symmetric call to cuCtxEnablePeerAccess() is required.

Note that there are both device-wide and system-wide limitations per system configuration, as noted in the CUDA Programming Guide under the section "Peer-to-Peer Memory Access".

Returns CUDA_ERROR_PEER_ACCESS_UNSUPPORTED if cuDeviceCanAccessPeer() indicates that the CUdevice of the current context cannot directly access memory from the CUdevice of `peerContext`.

Returns CUDA_ERROR_PEER_ACCESS_ALREADY_ENABLED if direct access of `peerContext` from the current context has already been enabled.

Returns CUDA_ERROR_TOO_MANY_PEERS if direct peer access is not possible because hardware resources required for peer access have been exhausted.

Returns CUDA_ERROR_INVALID_CONTEXT if there is no current context, `peerContext` is not a valid context, or if the current context is `peerContext`.

Returns CUDA_ERROR_INVALID_VALUE if `Flags` is not 0.

CUresult cuDeviceCanAccessPeer ( int* canAccessPeer, CUdevice dev, CUdevice peerDev )


Queries if a device may directly access a peer device's memory.

######  Parameters

`canAccessPeer`
    \- Returned access capability
`dev`
    \- Device from which allocations on `peerDev` are to be directly accessed.
`peerDev`
    \- Device on which the allocations to be directly accessed by `dev` reside.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*canAccessPeer` a value of 1 if contexts on `dev` are capable of directly accessing memory from contexts on `peerDev` and 0 otherwise. If direct access of `peerDev` from `dev` is possible, then access may be enabled on two specific contexts by calling cuCtxEnablePeerAccess().

CUresult cuDeviceGetP2PAtomicCapabilities ( unsigned int* capabilities, const CUatomicOperation ** operations, unsigned int  count, CUdevice srcDevice, CUdevice dstDevice )


Queries details about atomic operations supported between two devices.

######  Parameters

`capabilities`
    \- Returned capability details of each requested operation
`operations`
    \- Requested operations
`count`
    \- Count of requested operations and size of capabilities
`srcDevice`
    \- The source device of the target link
`dstDevice`
    \- The destination device of the target link

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*capabilities` the details about requested atomic `*operations` over the the link between `srcDevice` and `dstDevice`. The allocated size of `*operations` and `*capabilities` must be `count`.

For each CUatomicOperation in `*operations`, the corresponding result in `*capabilities` will be a bitmask indicating which of CUatomicOperationCapability the link supports natively.

Returns CUDA_ERROR_INVALID_DEVICE if `srcDevice` or `dstDevice` are not valid or if they represent the same device.

Returns CUDA_ERROR_INVALID_VALUE if `*capabilities` or `*operations` is NULL, if `count` is 0, or if any of `*operations` is not valid.

CUresult cuDeviceGetP2PAttribute ( int* value, CUdevice_P2PAttribute attrib, CUdevice srcDevice, CUdevice dstDevice )


Queries attributes of the link between two devices.

######  Parameters

`value`
    \- Returned value of the requested attribute
`attrib`
    \- The requested attribute of the link between `srcDevice` and `dstDevice`.
`srcDevice`
    \- The source device of the target link.
`dstDevice`
    \- The destination device of the target link.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*value` the value of the requested attribute `attrib` of the link between `srcDevice` and `dstDevice`. The supported attributes are:

  * CU_DEVICE_P2P_ATTRIBUTE_PERFORMANCE_RANK: A relative value indicating the performance of the link between two devices.

  * CU_DEVICE_P2P_ATTRIBUTE_ACCESS_SUPPORTED P2P: 1 if P2P Access is enable.

  * CU_DEVICE_P2P_ATTRIBUTE_NATIVE_ATOMIC_SUPPORTED: 1 if all CUDA-valid atomic operations over the link are supported.

  * CU_DEVICE_P2P_ATTRIBUTE_CUDA_ARRAY_ACCESS_SUPPORTED: 1 if cudaArray can be accessed over the link.

  * CU_DEVICE_P2P_ATTRIBUTE_ONLY_PARTIAL_NATIVE_ATOMIC_SUPPORTED: 1 if some CUDA-valid atomic operations over the link are supported. Information about specific operations can be retrieved with cuDeviceGetP2PAtomicCapabilities.


Returns CUDA_ERROR_INVALID_DEVICE if `srcDevice` or `dstDevice` are not valid or if they represent the same device.

Returns CUDA_ERROR_INVALID_VALUE if `attrib` is not valid or if `value` is a null pointer.


