---
name: runtime-vdpau
description: '**Source:** group__CUDART__VDPAU.html#group__CUDART__VDPAU'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.23. VDPAU Interoperability

**Source:** group__CUDART__VDPAU.html#group__CUDART__VDPAU


### Functions

__host__ cudaError_t cudaGraphicsVDPAURegisterOutputSurface ( cudaGraphicsResource** resource, VdpOutputSurface vdpSurface, unsigned int  flags )


Register a VdpOutputSurface object.

######  Parameters

`resource`
    \- Pointer to the returned object handle
`vdpSurface`
    \- VDPAU object to be registered
`flags`
    \- Map flags

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Description

Registers the VdpOutputSurface specified by `vdpSurface` for access by CUDA. A handle to the registered object is returned as `resource`. The surface's intended usage is specified using `flags`, as follows:

  * cudaGraphicsMapFlagsNone: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA. This is the default value.

  * cudaGraphicsMapFlagsReadOnly: Specifies that CUDA will not write to this resource.

  * cudaGraphicsMapFlagsWriteDiscard: Specifies that CUDA will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


**See also:**

cudaVDPAUSetVDPAUDevice, cudaGraphicsUnregisterResource, cudaGraphicsSubResourceGetMappedArray, cuGraphicsVDPAURegisterOutputSurface

__host__ cudaError_t cudaGraphicsVDPAURegisterVideoSurface ( cudaGraphicsResource** resource, VdpVideoSurface vdpSurface, unsigned int  flags )


Register a VdpVideoSurface object.

######  Parameters

`resource`
    \- Pointer to the returned object handle
`vdpSurface`
    \- VDPAU object to be registered
`flags`
    \- Map flags

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorUnknown

###### Description

Registers the VdpVideoSurface specified by `vdpSurface` for access by CUDA. A handle to the registered object is returned as `resource`. The surface's intended usage is specified using `flags`, as follows:

  * cudaGraphicsMapFlagsNone: Specifies no hints about how this resource will be used. It is therefore assumed that this resource will be read from and written to by CUDA. This is the default value.

  * cudaGraphicsMapFlagsReadOnly: Specifies that CUDA will not write to this resource.

  * cudaGraphicsMapFlagsWriteDiscard: Specifies that CUDA will not read from this resource and will write over the entire contents of the resource, so none of the data previously stored in the resource will be preserved.


**See also:**

cudaVDPAUSetVDPAUDevice, cudaGraphicsUnregisterResource, cudaGraphicsSubResourceGetMappedArray, cuGraphicsVDPAURegisterVideoSurface

__host__ cudaError_t cudaVDPAUGetDevice ( int* device, VdpDevice vdpDevice, VdpGetProcAddress* vdpGetProcAddress )


Gets the CUDA device associated with a VdpDevice.

######  Parameters

`device`
    \- Returns the device associated with vdpDevice, or -1 if the device associated with vdpDevice is not a compute device.
`vdpDevice`
    \- A VdpDevice handle
`vdpGetProcAddress`
    \- VDPAU's VdpGetProcAddress function pointer

###### Returns

cudaSuccess

###### Description

Returns the CUDA device associated with a VdpDevice, if applicable.

**See also:**

cudaVDPAUSetVDPAUDevice, cuVDPAUGetDevice

__host__ cudaError_t cudaVDPAUSetVDPAUDevice ( int  device, VdpDevice vdpDevice, VdpGetProcAddress* vdpGetProcAddress )


Sets a CUDA device to use VDPAU interoperability.

######  Parameters

`device`
    \- Device to use for VDPAU interoperability
`vdpDevice`
    \- The VdpDevice to interoperate with
`vdpGetProcAddress`
    \- VDPAU's VdpGetProcAddress function pointer

###### Returns

cudaSuccess, cudaErrorInvalidDevice, cudaErrorSetOnActiveProcess

###### Description

Records `vdpDevice` as the VdpDevice for VDPAU interoperability with the CUDA device `device` and sets `device` as the current device for the calling host thread.

This function will immediately initialize the primary context on `device` if needed.

If `device` has already been initialized then this call will fail with the error cudaErrorSetOnActiveProcess. In this case it is necessary to reset `device` using cudaDeviceReset() before VDPAU interoperability on `device` may be enabled.

**See also:**

cudaGraphicsVDPAURegisterVideoSurface, cudaGraphicsVDPAURegisterOutputSurface, cudaDeviceReset

* * *

!


Copyright © 2025 NVIDIA Corporation