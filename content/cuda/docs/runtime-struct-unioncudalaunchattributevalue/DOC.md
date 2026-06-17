---
name: runtime-struct-unioncudalaunchattributevalue
description: '**Source:** unioncudaLaunchAttributeValue.html#unioncudaLaunchAttributeValue'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.43. cudaLaunchAttributeValue

**Source:** unioncudaLaunchAttributeValue.html#unioncudaLaunchAttributeValue


### Public Variables

struct cudaAccessPolicyWindow accessPolicyWindow

cudaLaunchAttributeValue::@29 clusterDim

enumcudaClusterSchedulingPolicy clusterSchedulingPolicyPreference

int cooperative

cudaLaunchAttributeValue::@33 deviceUpdatableKernelNode

cudaLaunchAttributeValue::@32 launchCompletionEvent

cudaLaunchMemSyncDomain memSyncDomain

struct cudaLaunchMemSyncDomainMap memSyncDomainMap

unsigned int nvlinkUtilCentricScheduling

cudaLaunchAttributeValue::@31 preferredClusterDim

int priority

cudaLaunchAttributeValue::@30 programmaticEvent

int programmaticStreamSerializationAllowed

unsigned int sharedMemCarveout

enum cudaSynchronizationPolicy syncPolicy


### Variables

struct cudaAccessPolicyWindowcudaLaunchAttributeValue::accessPolicyWindow


Value of launch attribute cudaLaunchAttributeAccessPolicyWindow.

cudaLaunchAttributeValue::@29 cudaLaunchAttributeValue::clusterDim


Value of launch attribute cudaLaunchAttributeClusterDimension that represents the desired cluster dimensions for the kernel. Opaque type with the following fields:

  * `x` \- The X dimension of the cluster, in blocks. Must be a divisor of the grid X dimension.

  * `y` \- The Y dimension of the cluster, in blocks. Must be a divisor of the grid Y dimension.

  * `z` \- The Z dimension of the cluster, in blocks. Must be a divisor of the grid Z dimension.


enumcudaClusterSchedulingPolicycudaLaunchAttributeValue::clusterSchedulingPolicyPreference


Value of launch attribute cudaLaunchAttributeClusterSchedulingPolicyPreference. Cluster scheduling policy preference for the kernel.

int cudaLaunchAttributeValue::cooperative


Value of launch attribute cudaLaunchAttributeCooperative. Nonzero indicates a cooperative kernel (see cudaLaunchCooperativeKernel).

cudaLaunchAttributeValue::@33 cudaLaunchAttributeValue::deviceUpdatableKernelNode


Value of launch attribute cudaLaunchAttributeDeviceUpdatableKernelNode with the following fields:

  * `int` deviceUpdatable - Whether or not the resulting kernel node should be device-updatable.

  * `cudaGraphDeviceNode_t` devNode - Returns a handle to pass to the various device-side update functions.


cudaLaunchAttributeValue::@32 cudaLaunchAttributeValue::launchCompletionEvent


Value of launch attribute cudaLaunchAttributeLaunchCompletionEvent with the following fields:

  * `cudaEvent_t` event - Event to fire when the last block launches.

  * `int` flags - Event record flags, see cudaEventRecordWithFlags. Does not accept cudaEventRecordExternal.


cudaLaunchMemSyncDomaincudaLaunchAttributeValue::memSyncDomain


Value of launch attribute cudaLaunchAttributeMemSyncDomain. See cudaLaunchMemSyncDomain.

struct cudaLaunchMemSyncDomainMapcudaLaunchAttributeValue::memSyncDomainMap


Value of launch attribute cudaLaunchAttributeMemSyncDomainMap. See cudaLaunchMemSyncDomainMap.

unsigned int cudaLaunchAttributeValue::nvlinkUtilCentricScheduling


Value of launch attribute cudaLaunchAttributeNvlinkUtilCentricScheduling.

cudaLaunchAttributeValue::@31 cudaLaunchAttributeValue::preferredClusterDim


Value of launch attribute cudaLaunchAttributePreferredClusterDimension that represents the desired preferred cluster dimensions for the kernel. Opaque type with the following fields:

  * `x` \- The X dimension of the preferred cluster, in blocks. Must be a divisor of the grid X dimension, and must be a multiple of the `x` field of cudaLaunchAttributeValue::clusterDim.

  * `y` \- The Y dimension of the preferred cluster, in blocks. Must be a divisor of the grid Y dimension, and must be a multiple of the `y` field of cudaLaunchAttributeValue::clusterDim.

  * `z` \- The Z dimension of the preferred cluster, in blocks. Must be equal to the `z` field of cudaLaunchAttributeValue::clusterDim.


int cudaLaunchAttributeValue::priority


Value of launch attribute cudaLaunchAttributePriority. Execution priority of the kernel.

cudaLaunchAttributeValue::@30 cudaLaunchAttributeValue::programmaticEvent


Value of launch attribute cudaLaunchAttributeProgrammaticEvent with the following fields:

  * `cudaEvent_t` event - Event to fire when all blocks trigger it.

  * `int` flags; - Event record flags, see cudaEventRecordWithFlags. Does not accept cudaEventRecordExternal.

  * `int` triggerAtBlockStart - If this is set to non-0, each block launch will automatically trigger the event.


int cudaLaunchAttributeValue::programmaticStreamSerializationAllowed


Value of launch attribute cudaLaunchAttributeProgrammaticStreamSerialization.

unsigned int cudaLaunchAttributeValue::sharedMemCarveout


Value of launch attribute cudaLaunchAttributePreferredSharedMemoryCarveout.

enum cudaSynchronizationPolicy cudaLaunchAttributeValue::syncPolicy


Value of launch attribute cudaLaunchAttributeSynchronizationPolicy. cudaSynchronizationPolicy for work queued up in this stream.

* * *

!


Copyright © 2025 NVIDIA Corporation