---
name: runtime-types
description: '**Source:** group__CUDART__TYPES.html'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# Data types used by CUDA Runtime

**Source:** group__CUDART__TYPES.html


### Classes

struct

CUuuid_st


struct

cudaAccessPolicyWindow


struct

cudaArrayMemoryRequirements


struct

cudaArraySparseProperties


struct

cudaAsyncNotificationInfo_t


struct

cudaChannelFormatDesc


struct

cudaChildGraphNodeParams


struct

cudaConditionalNodeParams


struct

cudaDevResource


struct

cudaDevSmResource


struct

cudaDevSmResourceGroupParams


struct

cudaDevWorkqueueConfigResource


struct

cudaDevWorkqueueResource


struct

cudaDeviceProp


struct

cudaEglFrame


struct

cudaEglPlaneDesc


struct

cudaEventRecordNodeParams


struct

cudaEventWaitNodeParams


struct

cudaExtent


struct

cudaExternalMemoryBufferDesc


struct

cudaExternalMemoryHandleDesc


struct

cudaExternalMemoryMipmappedArrayDesc


struct

cudaExternalSemaphoreHandleDesc


struct

cudaExternalSemaphoreSignalNodeParams


struct

cudaExternalSemaphoreSignalNodeParamsV2


struct

cudaExternalSemaphoreSignalParams


struct

cudaExternalSemaphoreWaitNodeParams


struct

cudaExternalSemaphoreWaitNodeParamsV2


struct

cudaExternalSemaphoreWaitParams


struct

cudaFuncAttributes


struct

cudaGraphEdgeData


struct

cudaGraphExecUpdateResultInfo


struct

cudaGraphInstantiateParams


struct

cudaGraphKernelNodeUpdate


struct

cudaGraphNodeParams


struct

cudaHostNodeParams


struct

cudaHostNodeParamsV2


struct

cudaIpcEventHandle_t


struct

cudaIpcMemHandle_t


struct

cudaKernelNodeParams


struct

cudaKernelNodeParamsV2


struct

cudaLaunchAttribute


union

cudaLaunchAttributeValue


struct

cudaLaunchConfig_t


struct

cudaLaunchMemSyncDomainMap


struct

cudaMemAccessDesc


struct

cudaMemAllocNodeParams


struct

cudaMemAllocNodeParamsV2


struct

cudaMemFreeNodeParams


struct

cudaMemLocation


struct

cudaMemPoolProps


struct

cudaMemPoolPtrExportData


struct

cudaMemcpy3DOperand


struct

cudaMemcpy3DParms


struct

cudaMemcpy3DPeerParms


struct

cudaMemcpyAttributes


struct

cudaMemcpyNodeParams


struct

cudaMemsetParams


struct

cudaMemsetParamsV2


struct

cudaOffset3D


struct

cudaPitchedPtr


struct

cudaPointerAttributes


struct

cudaPos


struct

cudaResourceDesc


struct

cudaResourceViewDesc


struct

cudaTextureDesc


### Defines

#define CUDA_EGL_MAX_PLANES 3

#define CUDA_IPC_HANDLE_SIZE 64

#define cudaArrayColorAttachment 0x20

#define cudaArrayCubemap 0x04

#define cudaArrayDefault 0x00

#define cudaArrayDeferredMapping 0x80

#define cudaArrayLayered 0x01

#define cudaArraySparse 0x40

#define cudaArraySparsePropertiesSingleMipTail 0x1

#define cudaArraySurfaceLoadStore 0x02

#define cudaArrayTextureGather 0x08

#define cudaCpuDeviceId ((int)-1)

#define cudaDeviceBlockingSync 0x04

#define cudaDeviceLmemResizeToMax 0x10

#define cudaDeviceMapHost 0x08

#define cudaDeviceMask 0xff

#define cudaDeviceScheduleAuto 0x00

#define cudaDeviceScheduleBlockingSync 0x04

#define cudaDeviceScheduleMask 0x07

#define cudaDeviceScheduleSpin 0x01

#define cudaDeviceScheduleYield 0x02

#define cudaDeviceSyncMemops 0x80

#define cudaEventBlockingSync 0x01

#define cudaEventDefault 0x00

#define cudaEventDisableTiming 0x02

#define cudaEventInterprocess 0x04

#define cudaEventRecordDefault 0x00

#define cudaEventRecordExternal 0x01

#define cudaEventWaitDefault 0x00

#define cudaEventWaitExternal 0x01

#define cudaExternalMemoryDedicated 0x1

#define cudaExternalSemaphoreSignalSkipNvSciBufMemSync 0x01

#define cudaExternalSemaphoreWaitSkipNvSciBufMemSync 0x02

#define cudaGraphKernelNodePortDefault 0

#define cudaGraphKernelNodePortLaunchCompletion 2

#define cudaGraphKernelNodePortProgrammatic 1

#define cudaHostAllocDefault 0x00

#define cudaHostAllocMapped 0x02

#define cudaHostAllocPortable 0x01

#define cudaHostAllocWriteCombined 0x04

#define cudaHostRegisterDefault 0x00

#define cudaHostRegisterIoMemory 0x04

#define cudaHostRegisterMapped 0x02

#define cudaHostRegisterPortable 0x01

#define cudaHostRegisterReadOnly 0x08

#define cudaInitDeviceFlagsAreValid 0x01

#define cudaInvalidDeviceId ((int)-2)

#define cudaIpcMemLazyEnablePeerAccess 0x01

#define cudaMemAttachGlobal 0x01

#define cudaMemAttachHost 0x02

#define cudaMemAttachSingle 0x04

#define cudaMemPoolCreateUsageHwDecompress 0x2

#define cudaNvSciSyncAttrSignal 0x1

#define cudaNvSciSyncAttrWait 0x2

#define cudaOccupancyDefault 0x00

#define cudaOccupancyDisableCachingOverride 0x01

#define cudaPeerAccessDefault 0x00

#define cudaStreamDefault 0x00

#define cudaStreamLegacy ((cudaStream_t)0x1)

#define cudaStreamNonBlocking 0x01

#define cudaStreamPerThread ((cudaStream_t)0x2)


### Typedefs

typedef cudaArray * cudaArray_const_t

typedef cudaArray * cudaArray_t

typedef cudaAsyncCallbackEntry * cudaAsyncCallbackHandle_t

typedef CUdevResourceDesc_st * cudaDevResourceDesc_t

typedef CUeglStreamConnection_st * cudaEglStreamConnection

typedef enumcudaError cudaError_t

typedef CUevent_st * cudaEvent_t

typedef cudaExecutionContext_st * cudaExecutionContext_t

typedef CUexternalMemory_st * cudaExternalMemory_t

typedef CUexternalSemaphore_st * cudaExternalSemaphore_t

typedef CUfunc_st * cudaFunction_t

typedef unsigned long long cudaGraphConditionalHandle

typedef CUgraphDeviceUpdatableNode_st * cudaGraphDeviceNode_t

typedef CUgraphExec_st * cudaGraphExec_t

typedef CUgraphNode_st * cudaGraphNode_t

typedef CUgraph_st * cudaGraph_t

typedef cudaGraphicsResource * cudaGraphicsResource_t

typedef void(CUDART_CB* cudaHostFn_t )( void*  userData )

typedef CUkern_st * cudaKernel_t

typedef CUlib_st * cudaLibrary_t

typedef CUmemPoolHandle_st * cudaMemPool_t

typedef cudaMipmappedArray * cudaMipmappedArray_const_t

typedef cudaMipmappedArray * cudaMipmappedArray_t

typedef CUstream_st * cudaStream_t

typedef unsigned long long cudaSurfaceObject_t

typedef unsigned long long cudaTextureObject_t

typedef CUuserObject_st * cudaUserObject_t


### Enumerations

enum cudaAccessProperty

enum cudaAsyncNotificationType

enum cudaAtomicOperation

enum cudaAtomicOperationCapability

enum cudaCGScope

enum cudaChannelFormatKind

enum cudaClusterSchedulingPolicy

enum cudaComputeMode

enum cudaDevResourceType

enum cudaDevWorkqueueConfigScope

enum cudaDeviceAttr

enum cudaDeviceNumaConfig

enum cudaDeviceP2PAttr

enum cudaDriverEntryPointQueryResult

enum cudaEglColorFormat

enum cudaEglFrameType

enum cudaEglResourceLocationFlags

enum cudaError

enum cudaExternalMemoryHandleType

enum cudaExternalSemaphoreHandleType

enum cudaFlushGPUDirectRDMAWritesOptions

enum cudaFlushGPUDirectRDMAWritesScope

enum cudaFlushGPUDirectRDMAWritesTarget

enum cudaFuncAttribute

enum cudaFuncCache

enum cudaGPUDirectRDMAWritesOrdering

enum cudaGetDriverEntryPointFlags

enum cudaGraphChildGraphNodeOwnership

enum cudaGraphConditionalNodeType

enum cudaGraphDebugDotFlags

enum cudaGraphDependencyType

enum cudaGraphExecUpdateResult

enum cudaGraphInstantiateFlags

enum cudaGraphInstantiateResult

enum cudaGraphKernelNodeField

enum cudaGraphMemAttributeType

enum cudaGraphNodeType

enum cudaGraphicsCubeFace

enum cudaGraphicsMapFlags

enum cudaGraphicsRegisterFlags

enum cudaJitOption

enum cudaJit_CacheMode

enum cudaJit_Fallback

enum cudaLaunchAttributeID

enum cudaLaunchMemSyncDomain

enum cudaLibraryOption

enum cudaLimit

enum cudaMemAccessFlags

enum cudaMemAllocationHandleType

enum cudaMemAllocationType

enum cudaMemLocationType

enum cudaMemPoolAttr

enum cudaMemRangeAttribute

enum cudaMemcpy3DOperandType

enum cudaMemcpyFlags

enum cudaMemcpyKind

enum cudaMemoryAdvise

enum cudaMemoryType

enum cudaResourceType

enum cudaResourceViewFormat

enum cudaSharedCarveout

enum cudaSharedMemConfig

enum cudaStreamCaptureMode

enum cudaStreamCaptureStatus

enum cudaStreamUpdateCaptureDependenciesFlags

enum cudaSurfaceBoundaryMode

enum cudaSurfaceFormatMode

enum cudaTextureAddressMode

enum cudaTextureFilterMode

enum cudaTextureReadMode

enum cudaUserObjectFlags

enum cudaUserObjectRetainFlags


### Defines

#define CUDA_EGL_MAX_PLANES 3


Maximum number of planes per frame

#define CUDA_IPC_HANDLE_SIZE 64


CUDA IPC Handle Size

#define cudaArrayColorAttachment 0x20


Must be set in cudaExternalMemoryGetMappedMipmappedArray if the mipmapped array is used as a color target in a graphics API

#define cudaArrayCubemap 0x04


Must be set in cudaMalloc3DArray to create a cubemap CUDA array

#define cudaArrayDefault 0x00


Default CUDA array allocation flag

#define cudaArrayDeferredMapping 0x80


Must be set in cudaMallocArray, cudaMalloc3DArray or cudaMallocMipmappedArray in order to create a deferred mapping CUDA array or CUDA mipmapped array

#define cudaArrayLayered 0x01


Must be set in cudaMalloc3DArray to create a layered CUDA array

#define cudaArraySparse 0x40


Must be set in cudaMallocArray, cudaMalloc3DArray or cudaMallocMipmappedArray in order to create a sparse CUDA array or CUDA mipmapped array

#define cudaArraySparsePropertiesSingleMipTail 0x1


Indicates that the layered sparse CUDA array or CUDA mipmapped array has a single mip tail region for all layers

#define cudaArraySurfaceLoadStore 0x02


Must be set in cudaMallocArray or cudaMalloc3DArray in order to bind surfaces to the CUDA array

#define cudaArrayTextureGather 0x08


Must be set in cudaMallocArray or cudaMalloc3DArray in order to perform texture gather operations on the CUDA array

#define cudaCpuDeviceId ((int)-1)


Device id that represents the CPU

#define cudaDeviceBlockingSync 0x04


###### Deprecated

This flag was deprecated as of CUDA 4.0 and replaced with cudaDeviceScheduleBlockingSync.

Device flag - Use blocking synchronization

#define cudaDeviceLmemResizeToMax 0x10


Device flag - Keep local memory allocation after launch

#define cudaDeviceMapHost 0x08


Device flag - Support mapped pinned allocations

#define cudaDeviceMask 0xff


Device flags mask

#define cudaDeviceScheduleAuto 0x00


Device flag - Automatic scheduling

#define cudaDeviceScheduleBlockingSync 0x04


Device flag - Use blocking synchronization

#define cudaDeviceScheduleMask 0x07


Device schedule flags mask

#define cudaDeviceScheduleSpin 0x01


Device flag - Spin default scheduling

#define cudaDeviceScheduleYield 0x02


Device flag - Yield default scheduling

#define cudaDeviceSyncMemops 0x80


Device flag - Ensure synchronous memory operations on this context will synchronize

#define cudaEventBlockingSync 0x01


Event uses blocking synchronization

#define cudaEventDefault 0x00


Default event flag

#define cudaEventDisableTiming 0x02


Event will not record timing data

#define cudaEventInterprocess 0x04


Event is suitable for interprocess use. cudaEventDisableTiming must be set

#define cudaEventRecordDefault 0x00


Default event record flag

#define cudaEventRecordExternal 0x01


Event is captured in the graph as an external event node when performing stream capture

#define cudaEventWaitDefault 0x00


Default event wait flag

#define cudaEventWaitExternal 0x01


Event is captured in the graph as an external event node when performing stream capture

#define cudaExternalMemoryDedicated 0x1


Indicates that the external memory object is a dedicated resource

#define cudaExternalSemaphoreSignalSkipNvSciBufMemSync 0x01


When the /p flags parameter of cudaExternalSemaphoreSignalParams contains this flag, it indicates that signaling an external semaphore object should skip performing appropriate memory synchronization operations over all the external memory objects that are imported as cudaExternalMemoryHandleTypeNvSciBuf, which otherwise are performed by default to ensure data coherency with other importers of the same NvSciBuf memory objects.

#define cudaExternalSemaphoreWaitSkipNvSciBufMemSync 0x02


When the /p flags parameter of cudaExternalSemaphoreWaitParams contains this flag, it indicates that waiting an external semaphore object should skip performing appropriate memory synchronization operations over all the external memory objects that are imported as cudaExternalMemoryHandleTypeNvSciBuf, which otherwise are performed by default to ensure data coherency with other importers of the same NvSciBuf memory objects.

#define cudaGraphKernelNodePortDefault 0


This port activates when the kernel has finished executing.

#define cudaGraphKernelNodePortLaunchCompletion 2


This port activates when all blocks of the kernel have begun execution. See also cudaLaunchAttributeLaunchCompletionEvent.

#define cudaGraphKernelNodePortProgrammatic 1


This port activates when all blocks of the kernel have performed cudaTriggerProgrammaticLaunchCompletion() or have terminated. It must be used with edge type cudaGraphDependencyTypeProgrammatic. See also cudaLaunchAttributeProgrammaticEvent.

#define cudaHostAllocDefault 0x00


Default page-locked allocation flag

#define cudaHostAllocMapped 0x02


Map allocation into device space

#define cudaHostAllocPortable 0x01


Pinned memory accessible by all CUDA contexts

#define cudaHostAllocWriteCombined 0x04


Write-combined memory

#define cudaHostRegisterDefault 0x00


Default host memory registration flag

#define cudaHostRegisterIoMemory 0x04


Memory-mapped I/O space

#define cudaHostRegisterMapped 0x02


Map registered memory into device space

#define cudaHostRegisterPortable 0x01


Pinned memory accessible by all CUDA contexts

#define cudaHostRegisterReadOnly 0x08


Memory-mapped read-only

#define cudaInitDeviceFlagsAreValid 0x01


Tell the CUDA runtime that DeviceFlags is being set in cudaInitDevice call

#define cudaInvalidDeviceId ((int)-2)


Device id that represents an invalid device

#define cudaIpcMemLazyEnablePeerAccess 0x01


Automatically enable peer access between remote devices as needed

#define cudaMemAttachGlobal 0x01


Memory can be accessed by any stream on any device

#define cudaMemAttachHost 0x02


Memory cannot be accessed by any stream on any device

#define cudaMemAttachSingle 0x04


Memory can only be accessed by a single stream on the associated device

#define cudaMemPoolCreateUsageHwDecompress 0x2


This flag, if set, indicates that the memory will be used as a buffer for hardware accelerated decompression.

#define cudaNvSciSyncAttrSignal 0x1


When /p flags of cudaDeviceGetNvSciSyncAttributes is set to this, it indicates that application need signaler specific NvSciSyncAttr to be filled by cudaDeviceGetNvSciSyncAttributes.

#define cudaNvSciSyncAttrWait 0x2


When /p flags of cudaDeviceGetNvSciSyncAttributes is set to this, it indicates that application need waiter specific NvSciSyncAttr to be filled by cudaDeviceGetNvSciSyncAttributes.

#define cudaOccupancyDefault 0x00


Default behavior

#define cudaOccupancyDisableCachingOverride 0x01


Assume global caching is enabled and cannot be automatically turned off

#define cudaPeerAccessDefault 0x00


Default peer addressing enable flag

#define cudaStreamDefault 0x00


Default stream flag

#define cudaStreamLegacy ((cudaStream_t)0x1)


Legacy stream handle

Stream handle that can be passed as a cudaStream_t to use an implicit stream with legacy synchronization behavior.

See details of the synchronization behavior.

#define cudaStreamNonBlocking 0x01


Stream does not synchronize with stream 0 (the NULL stream)

#define cudaStreamPerThread ((cudaStream_t)0x2)


Per-thread stream handle

Stream handle that can be passed as a cudaStream_t to use an implicit stream with per-thread synchronization behavior.

See details of the synchronization behavior.

### Typedefs

typedef cudaArray * cudaArray_const_t


CUDA array (as source copy argument)

typedef cudaArray * cudaArray_t


CUDA array

typedef cudaAsyncCallbackEntry * cudaAsyncCallbackHandle_t


CUDA async callback handle

typedef CUdevResourceDesc_st * cudaDevResourceDesc_t


An opaque descriptor handle. The descriptor encapsulates multiple created and configured resources. Created via cudaDeviceResourceGenerateDesc

typedef CUeglStreamConnection_st * cudaEglStreamConnection


CUDA EGLSream Connection

typedef enumcudaError cudaError_t


CUDA Error types

typedef CUevent_st * cudaEvent_t


CUDA event types

typedef cudaExecutionContext_st * cudaExecutionContext_t


An opaque handle to a CUDA execution context. It represents an execution context created via CUDA Runtime APIs such as cudaGreenCtxCreate.

typedef CUexternalMemory_st * cudaExternalMemory_t


CUDA external memory

typedef CUexternalSemaphore_st * cudaExternalSemaphore_t


CUDA external semaphore

typedef CUfunc_st * cudaFunction_t


CUDA function

typedef unsigned long long cudaGraphConditionalHandle


CUDA handle for conditional graph nodes

typedef CUgraphDeviceUpdatableNode_st * cudaGraphDeviceNode_t


CUDA device node handle for device-side node update

typedef CUgraphExec_st * cudaGraphExec_t


CUDA executable (launchable) graph

typedef CUgraphNode_st * cudaGraphNode_t


CUDA graph node.

typedef CUgraph_st * cudaGraph_t


CUDA graph

typedef cudaGraphicsResource * cudaGraphicsResource_t


CUDA graphics resource types

void(CUDART_CB* cudaHostFn_t )( void*  userData )


CUDA host function

######  Parameters

`userData`
    Argument value passed to the function

typedef CUkern_st * cudaKernel_t


CUDA kernel

typedef CUlib_st * cudaLibrary_t


CUDA library

typedef CUmemPoolHandle_st * cudaMemPool_t


CUDA memory pool

typedef cudaMipmappedArray * cudaMipmappedArray_const_t


CUDA mipmapped array (as source argument)

typedef cudaMipmappedArray * cudaMipmappedArray_t


CUDA mipmapped array

typedef CUstream_st * cudaStream_t


CUDA stream

typedef unsigned long long cudaSurfaceObject_t


An opaque value that represents a CUDA Surface object

typedef unsigned long long cudaTextureObject_t


An opaque value that represents a CUDA texture object

typedef CUuserObject_st * cudaUserObject_t


CUDA user object for graphs

### Enumerations

enum cudaAccessProperty


Specifies performance hint with cudaAccessPolicyWindow for hitProp and missProp members.

######  Values

cudaAccessPropertyNormal = 0
    Normal cache persistence.
cudaAccessPropertyStreaming = 1
    Streaming access is less likely to persit from cache.
cudaAccessPropertyPersisting = 2
    Persisting access is more likely to persist in cache.

enum cudaAsyncNotificationType


Types of async notification that can occur

######  Values

cudaAsyncNotificationTypeOverBudget = 0x1
    Sent when the process has exceeded its device memory budget

enum cudaAtomicOperation


CUDA-valid Atomic Operations

######  Values

cudaAtomicOperationIntegerAdd = 0

cudaAtomicOperationIntegerMin = 1

cudaAtomicOperationIntegerMax = 2

cudaAtomicOperationIntegerIncrement = 3

cudaAtomicOperationIntegerDecrement = 4

cudaAtomicOperationAnd = 5

cudaAtomicOperationOr = 6

cudaAtomicOperationXOR = 7

cudaAtomicOperationExchange = 8

cudaAtomicOperationCAS = 9

cudaAtomicOperationFloatAdd = 10

cudaAtomicOperationFloatMin = 11

cudaAtomicOperationFloatMax = 12


enum cudaAtomicOperationCapability


CUDA-valid Atomic Operation capabilities

######  Values

cudaAtomicCapabilitySigned = 1u<<0

cudaAtomicCapabilityUnsigned = 1u<<1

cudaAtomicCapabilityReduction = 1u<<2

cudaAtomicCapabilityScalar32 = 1u<<3

cudaAtomicCapabilityScalar64 = 1u<<4

cudaAtomicCapabilityScalar128 = 1u<<5

cudaAtomicCapabilityVector32x4 = 1u<<6


enum cudaCGScope


CUDA cooperative group scope

######  Values

cudaCGScopeInvalid = 0
    Invalid cooperative group scope
cudaCGScopeGrid = 1
    Scope represented by a grid_group
cudaCGScopeReserved = 2
    Reserved

enum cudaChannelFormatKind


Channel format kind

######  Values

cudaChannelFormatKindSigned = 0
    Signed channel format
cudaChannelFormatKindUnsigned = 1
    Unsigned channel format
cudaChannelFormatKindFloat = 2
    Float channel format
cudaChannelFormatKindNone = 3
    No channel format
cudaChannelFormatKindNV12 = 4
    Unsigned 8-bit integers, planar 4:2:0 YUV format
cudaChannelFormatKindUnsignedNormalized8X1 = 5
    1 channel unsigned 8-bit normalized integer
cudaChannelFormatKindUnsignedNormalized8X2 = 6
    2 channel unsigned 8-bit normalized integer
cudaChannelFormatKindUnsignedNormalized8X4 = 7
    4 channel unsigned 8-bit normalized integer
cudaChannelFormatKindUnsignedNormalized16X1 = 8
    1 channel unsigned 16-bit normalized integer
cudaChannelFormatKindUnsignedNormalized16X2 = 9
    2 channel unsigned 16-bit normalized integer
cudaChannelFormatKindUnsignedNormalized16X4 = 10
    4 channel unsigned 16-bit normalized integer
cudaChannelFormatKindSignedNormalized8X1 = 11
    1 channel signed 8-bit normalized integer
cudaChannelFormatKindSignedNormalized8X2 = 12
    2 channel signed 8-bit normalized integer
cudaChannelFormatKindSignedNormalized8X4 = 13
    4 channel signed 8-bit normalized integer
cudaChannelFormatKindSignedNormalized16X1 = 14
    1 channel signed 16-bit normalized integer
cudaChannelFormatKindSignedNormalized16X2 = 15
    2 channel signed 16-bit normalized integer
cudaChannelFormatKindSignedNormalized16X4 = 16
    4 channel signed 16-bit normalized integer
cudaChannelFormatKindUnsignedBlockCompressed1 = 17
    4 channel unsigned normalized block-compressed (BC1 compression) format
cudaChannelFormatKindUnsignedBlockCompressed1SRGB = 18
    4 channel unsigned normalized block-compressed (BC1 compression) format with sRGB encoding
cudaChannelFormatKindUnsignedBlockCompressed2 = 19
    4 channel unsigned normalized block-compressed (BC2 compression) format
cudaChannelFormatKindUnsignedBlockCompressed2SRGB = 20
    4 channel unsigned normalized block-compressed (BC2 compression) format with sRGB encoding
cudaChannelFormatKindUnsignedBlockCompressed3 = 21
    4 channel unsigned normalized block-compressed (BC3 compression) format
cudaChannelFormatKindUnsignedBlockCompressed3SRGB = 22
    4 channel unsigned normalized block-compressed (BC3 compression) format with sRGB encoding
cudaChannelFormatKindUnsignedBlockCompressed4 = 23
    1 channel unsigned normalized block-compressed (BC4 compression) format
cudaChannelFormatKindSignedBlockCompressed4 = 24
    1 channel signed normalized block-compressed (BC4 compression) format
cudaChannelFormatKindUnsignedBlockCompressed5 = 25
    2 channel unsigned normalized block-compressed (BC5 compression) format
cudaChannelFormatKindSignedBlockCompressed5 = 26
    2 channel signed normalized block-compressed (BC5 compression) format
cudaChannelFormatKindUnsignedBlockCompressed6H = 27
    3 channel unsigned half-float block-compressed (BC6H compression) format
cudaChannelFormatKindSignedBlockCompressed6H = 28
    3 channel signed half-float block-compressed (BC6H compression) format
cudaChannelFormatKindUnsignedBlockCompressed7 = 29
    4 channel unsigned normalized block-compressed (BC7 compression) format
cudaChannelFormatKindUnsignedBlockCompressed7SRGB = 30
    4 channel unsigned normalized block-compressed (BC7 compression) format with sRGB encoding
cudaChannelFormatKindUnsignedNormalized1010102 = 31
    4 channel unsigned normalized (10-bit, 10-bit, 10-bit, 2-bit) format

enum cudaClusterSchedulingPolicy


Cluster scheduling policies. These may be passed to cudaFuncSetAttribute

######  Values

cudaClusterSchedulingPolicyDefault = 0
    the default policy
cudaClusterSchedulingPolicySpread = 1
    spread the blocks within a cluster to the SMs
cudaClusterSchedulingPolicyLoadBalancing = 2
    allow the hardware to load-balance the blocks in a cluster to the SMs

enum cudaComputeMode


CUDA device compute modes

######  Values

cudaComputeModeDefault = 0
    Default compute mode (Multiple threads can use cudaSetDevice() with this device)
cudaComputeModeExclusive = 1
    Compute-exclusive-thread mode (Only one thread in one process will be able to use cudaSetDevice() with this device)
cudaComputeModeProhibited = 2
    Compute-prohibited mode (No threads can use cudaSetDevice() with this device)
cudaComputeModeExclusiveProcess = 3
    Compute-exclusive-process mode (Many threads in one process will be able to use cudaSetDevice() with this device)

enum cudaDevResourceType


Type of resource

######  Values

cudaDevResourceTypeInvalid = 0

cudaDevResourceTypeSm = 1
    Streaming multiprocessors related information
cudaDevResourceTypeWorkqueueConfig = 1000
    Workqueue configuration related information
cudaDevResourceTypeWorkqueue = 10000
    Pre-existing workqueue related information

enum cudaDevWorkqueueConfigScope


Sharing scope for workqueues

######  Values

cudaDevWorkqueueConfigScopeDeviceCtx = 0
    Use all shared workqueue resources on the device. Default driver behaviour.
cudaDevWorkqueueConfigScopeGreenCtxBalanced = 1
    When possible, use non-overlapping workqueue resources with other balanced green contexts.

enum cudaDeviceAttr


CUDA device attributes

######  Values

cudaDevAttrMaxThreadsPerBlock = 1
    Maximum number of threads per block
cudaDevAttrMaxBlockDimX = 2
    Maximum block dimension X
cudaDevAttrMaxBlockDimY = 3
    Maximum block dimension Y
cudaDevAttrMaxBlockDimZ = 4
    Maximum block dimension Z
cudaDevAttrMaxGridDimX = 5
    Maximum grid dimension X
cudaDevAttrMaxGridDimY = 6
    Maximum grid dimension Y
cudaDevAttrMaxGridDimZ = 7
    Maximum grid dimension Z
cudaDevAttrMaxSharedMemoryPerBlock = 8
    Maximum shared memory available per block in bytes
cudaDevAttrTotalConstantMemory = 9
    Memory available on device for __constant__ variables in a CUDA C kernel in bytes
cudaDevAttrWarpSize = 10
    Warp size in threads
cudaDevAttrMaxPitch = 11
    Maximum pitch in bytes allowed by memory copies
cudaDevAttrMaxRegistersPerBlock = 12
    Maximum number of 32-bit registers available per block
cudaDevAttrClockRate = 13
    Peak clock frequency in kilohertz
cudaDevAttrTextureAlignment = 14
    Alignment requirement for textures
cudaDevAttrGpuOverlap = 15
    Device can possibly copy memory and execute a kernel concurrently
cudaDevAttrMultiProcessorCount = 16
    Number of multiprocessors on device
cudaDevAttrKernelExecTimeout = 17
    Specifies whether there is a run time limit on kernels
cudaDevAttrIntegrated = 18
    Device is integrated with host memory
cudaDevAttrCanMapHostMemory = 19
    Device can map host memory into CUDA address space
cudaDevAttrComputeMode = 20
    Compute mode (See cudaComputeMode for details)
cudaDevAttrMaxTexture1DWidth = 21
    Maximum 1D texture width
cudaDevAttrMaxTexture2DWidth = 22
    Maximum 2D texture width
cudaDevAttrMaxTexture2DHeight = 23
    Maximum 2D texture height
cudaDevAttrMaxTexture3DWidth = 24
    Maximum 3D texture width
cudaDevAttrMaxTexture3DHeight = 25
    Maximum 3D texture height
cudaDevAttrMaxTexture3DDepth = 26
    Maximum 3D texture depth
cudaDevAttrMaxTexture2DLayeredWidth = 27
    Maximum 2D layered texture width
cudaDevAttrMaxTexture2DLayeredHeight = 28
    Maximum 2D layered texture height
cudaDevAttrMaxTexture2DLayeredLayers = 29
    Maximum layers in a 2D layered texture
cudaDevAttrSurfaceAlignment = 30
    Alignment requirement for surfaces
cudaDevAttrConcurrentKernels = 31
    Device can possibly execute multiple kernels concurrently
cudaDevAttrEccEnabled = 32
    Device has ECC support enabled
cudaDevAttrPciBusId = 33
    PCI bus ID of the device
cudaDevAttrPciDeviceId = 34
    PCI device ID of the device
cudaDevAttrTccDriver = 35
    Device is using TCC driver model
cudaDevAttrMemoryClockRate = 36
    Peak memory clock frequency in kilohertz
cudaDevAttrGlobalMemoryBusWidth = 37
    Global memory bus width in bits
cudaDevAttrL2CacheSize = 38
    Size of L2 cache in bytes
cudaDevAttrMaxThreadsPerMultiProcessor = 39
    Maximum resident threads per multiprocessor
cudaDevAttrAsyncEngineCount = 40
    Number of asynchronous engines
cudaDevAttrUnifiedAddressing = 41
    Device shares a unified address space with the host
cudaDevAttrMaxTexture1DLayeredWidth = 42
    Maximum 1D layered texture width
cudaDevAttrMaxTexture1DLayeredLayers = 43
    Maximum layers in a 1D layered texture
cudaDevAttrMaxTexture2DGatherWidth = 45
    Maximum 2D texture width if cudaArrayTextureGather is set
cudaDevAttrMaxTexture2DGatherHeight = 46
    Maximum 2D texture height if cudaArrayTextureGather is set
cudaDevAttrMaxTexture3DWidthAlt = 47
    Alternate maximum 3D texture width
cudaDevAttrMaxTexture3DHeightAlt = 48
    Alternate maximum 3D texture height
cudaDevAttrMaxTexture3DDepthAlt = 49
    Alternate maximum 3D texture depth
cudaDevAttrPciDomainId = 50
    PCI domain ID of the device
cudaDevAttrTexturePitchAlignment = 51
    Pitch alignment requirement for textures
cudaDevAttrMaxTextureCubemapWidth = 52
    Maximum cubemap texture width/height
cudaDevAttrMaxTextureCubemapLayeredWidth = 53
    Maximum cubemap layered texture width/height
cudaDevAttrMaxTextureCubemapLayeredLayers = 54
    Maximum layers in a cubemap layered texture
cudaDevAttrMaxSurface1DWidth = 55
    Maximum 1D surface width
cudaDevAttrMaxSurface2DWidth = 56
    Maximum 2D surface width
cudaDevAttrMaxSurface2DHeight = 57
    Maximum 2D surface height
cudaDevAttrMaxSurface3DWidth = 58
    Maximum 3D surface width
cudaDevAttrMaxSurface3DHeight = 59
    Maximum 3D surface height
cudaDevAttrMaxSurface3DDepth = 60
    Maximum 3D surface depth
cudaDevAttrMaxSurface1DLayeredWidth = 61
    Maximum 1D layered surface width
cudaDevAttrMaxSurface1DLayeredLayers = 62
    Maximum layers in a 1D layered surface
cudaDevAttrMaxSurface2DLayeredWidth = 63
    Maximum 2D layered surface width
cudaDevAttrMaxSurface2DLayeredHeight = 64
    Maximum 2D layered surface height
cudaDevAttrMaxSurface2DLayeredLayers = 65
    Maximum layers in a 2D layered surface
cudaDevAttrMaxSurfaceCubemapWidth = 66
    Maximum cubemap surface width
cudaDevAttrMaxSurfaceCubemapLayeredWidth = 67
    Maximum cubemap layered surface width
cudaDevAttrMaxSurfaceCubemapLayeredLayers = 68
    Maximum layers in a cubemap layered surface
cudaDevAttrMaxTexture1DLinearWidth = 69
    Maximum 1D linear texture width
cudaDevAttrMaxTexture2DLinearWidth = 70
    Maximum 2D linear texture width
cudaDevAttrMaxTexture2DLinearHeight = 71
    Maximum 2D linear texture height
cudaDevAttrMaxTexture2DLinearPitch = 72
    Maximum 2D linear texture pitch in bytes
cudaDevAttrMaxTexture2DMipmappedWidth = 73
    Maximum mipmapped 2D texture width
cudaDevAttrMaxTexture2DMipmappedHeight = 74
    Maximum mipmapped 2D texture height
cudaDevAttrComputeCapabilityMajor = 75
    Major compute capability version number
cudaDevAttrComputeCapabilityMinor = 76
    Minor compute capability version number
cudaDevAttrMaxTexture1DMipmappedWidth = 77
    Maximum mipmapped 1D texture width
cudaDevAttrStreamPrioritiesSupported = 78
    Device supports stream priorities
cudaDevAttrGlobalL1CacheSupported = 79
    Device supports caching globals in L1
cudaDevAttrLocalL1CacheSupported = 80
    Device supports caching locals in L1
cudaDevAttrMaxSharedMemoryPerMultiprocessor = 81
    Maximum shared memory available per multiprocessor in bytes
cudaDevAttrMaxRegistersPerMultiprocessor = 82
    Maximum number of 32-bit registers available per multiprocessor
cudaDevAttrManagedMemory = 83
    Device can allocate managed memory on this system
cudaDevAttrIsMultiGpuBoard = 84
    Device is on a multi-GPU board
cudaDevAttrMultiGpuBoardGroupID = 85
    Unique identifier for a group of devices on the same multi-GPU board
cudaDevAttrHostNativeAtomicSupported = 86
    Link between the device and the host supports native atomic operations
cudaDevAttrSingleToDoublePrecisionPerfRatio = 87
    Ratio of single precision performance (in floating-point operations per second) to double precision performance
cudaDevAttrPageableMemoryAccess = 88
    Device supports coherently accessing pageable memory without calling cudaHostRegister on it
cudaDevAttrConcurrentManagedAccess = 89
    Device can coherently access managed memory concurrently with the CPU
cudaDevAttrComputePreemptionSupported = 90
    Device supports Compute Preemption
cudaDevAttrCanUseHostPointerForRegisteredMem = 91
    Device can access host registered memory at the same virtual address as the CPU
cudaDevAttrReserved92 = 92

cudaDevAttrReserved93 = 93

cudaDevAttrReserved94 = 94

cudaDevAttrCooperativeLaunch = 95
    Device supports launching cooperative kernels via cudaLaunchCooperativeKernel
cudaDevAttrReserved96 = 96

cudaDevAttrMaxSharedMemoryPerBlockOptin = 97
    The maximum optin shared memory per block. This value may vary by chip. See cudaFuncSetAttribute
cudaDevAttrCanFlushRemoteWrites = 98
    Device supports flushing of outstanding remote writes.
cudaDevAttrHostRegisterSupported = 99
    Device supports host memory registration via cudaHostRegister.
cudaDevAttrPageableMemoryAccessUsesHostPageTables = 100
    Device accesses pageable memory via the host's page tables.
cudaDevAttrDirectManagedMemAccessFromHost = 101
    Host can directly access managed memory on the device without migration.
cudaDevAttrMaxBlocksPerMultiprocessor = 106
    Maximum number of blocks per multiprocessor
cudaDevAttrMaxPersistingL2CacheSize = 108
    Maximum L2 persisting lines capacity setting in bytes.
cudaDevAttrMaxAccessPolicyWindowSize = 109
    Maximum value of cudaAccessPolicyWindow::num_bytes.
cudaDevAttrReservedSharedMemoryPerBlock = 111
    Shared memory reserved by CUDA driver per block in bytes
cudaDevAttrSparseCudaArraySupported = 112
    Device supports sparse CUDA arrays and sparse CUDA mipmapped arrays
cudaDevAttrHostRegisterReadOnlySupported = 113
    Device supports using the cudaHostRegister flag cudaHostRegisterReadOnly to register memory that must be mapped as read-only to the GPU
cudaDevAttrTimelineSemaphoreInteropSupported = 114
    External timeline semaphore interop is supported on the device
cudaDevAttrMemoryPoolsSupported = 115
    Device supports using the cudaMallocAsync and cudaMemPool family of APIs
cudaDevAttrGPUDirectRDMASupported = 116
    Device supports GPUDirect RDMA APIs, like nvidia_p2p_get_pages (see <https://docs.nvidia.com/cuda/gpudirect-rdma> for more information)
cudaDevAttrGPUDirectRDMAFlushWritesOptions = 117
    The returned attribute shall be interpreted as a bitmask, where the individual bits are listed in the cudaFlushGPUDirectRDMAWritesOptions enum
cudaDevAttrGPUDirectRDMAWritesOrdering = 118
    GPUDirect RDMA writes to the device do not need to be flushed for consumers within the scope indicated by the returned attribute. See cudaGPUDirectRDMAWritesOrdering for the numerical values returned here.
cudaDevAttrMemoryPoolSupportedHandleTypes = 119
    Handle types supported with mempool based IPC
cudaDevAttrClusterLaunch = 120
    Indicates device supports cluster launch
cudaDevAttrDeferredMappingCudaArraySupported = 121
    Device supports deferred mapping CUDA arrays and CUDA mipmapped arrays
cudaDevAttrReserved122 = 122

cudaDevAttrReserved123 = 123

cudaDevAttrReserved124 = 124

cudaDevAttrIpcEventSupport = 125
    Device supports IPC Events.
cudaDevAttrMemSyncDomainCount = 126
    Number of memory synchronization domains the device supports.
cudaDevAttrReserved127 = 127

cudaDevAttrReserved128 = 128

cudaDevAttrReserved129 = 129

cudaDevAttrNumaConfig = 130
    NUMA configuration of a device: value is of type cudaDeviceNumaConfig enum
cudaDevAttrNumaId = 131
    NUMA node ID of the GPU memory
cudaDevAttrReserved132 = 132

cudaDevAttrMpsEnabled = 133
    Contexts created on this device will be shared via MPS
cudaDevAttrHostNumaId = 134
    NUMA ID of the host node closest to the device or -1 when system does not support NUMA
cudaDevAttrD3D12CigSupported = 135
    Device supports CIG with D3D12.
cudaDevAttrVulkanCigSupported = 138
    Device supports CIG with Vulkan.
cudaDevAttrGpuPciDeviceId = 139
    The combined 16-bit PCI device ID and 16-bit PCI vendor ID.
cudaDevAttrGpuPciSubsystemId = 140
    The combined 16-bit PCI subsystem ID and 16-bit PCI subsystem vendor ID.
cudaDevAttrReserved141 = 141

cudaDevAttrHostNumaMemoryPoolsSupported = 142
    Device supports HOST_NUMA location with the cudaMallocAsync and cudaMemPool family of APIs
cudaDevAttrHostNumaMultinodeIpcSupported = 143
    Device supports HostNuma location IPC between nodes in a multi-node system.
cudaDevAttrHostMemoryPoolsSupported = 144
    Device suports HOST location with the cuMemAllocAsync and cuMemPool family of APIs
cudaDevAttrReserved145 = 145

cudaDevAttrOnlyPartialHostNativeAtomicSupported = 147
    Link between the device and the host supports only some native atomic operations
cudaDevAttrMax


enum cudaDeviceNumaConfig


CUDA device NUMA config

######  Values

cudaDeviceNumaConfigNone = 0
    The GPU is not a NUMA node
cudaDeviceNumaConfigNumaNode
    The GPU is a NUMA node, cudaDevAttrNumaId contains its NUMA ID

enum cudaDeviceP2PAttr


CUDA device P2P attributes

######  Values

cudaDevP2PAttrPerformanceRank = 1
    A relative value indicating the performance of the link between two devices
cudaDevP2PAttrAccessSupported = 2
    Peer access is enabled
cudaDevP2PAttrNativeAtomicSupported = 3
    Native atomic operation over the link supported
cudaDevP2PAttrCudaArrayAccessSupported = 4
    Accessing CUDA arrays over the link supported
cudaDevP2PAttrOnlyPartialNativeAtomicSupported = 5
    Only some CUDA-valid atomic operations over the link are supported.

enum cudaDriverEntryPointQueryResult


Enum for status from obtaining driver entry points, used with cudaApiGetDriverEntryPoint

######  Values

cudaDriverEntryPointSuccess = 0
    Search for symbol found a match
cudaDriverEntryPointSymbolNotFound = 1
    Search for symbol was not found
cudaDriverEntryPointVersionNotSufficent = 2
    Search for symbol was found but version wasn't great enough

enum cudaEglColorFormat


CUDA EGL Color Format - The different planar and multiplanar formats currently supported for CUDA_EGL interops.

######  Values

cudaEglColorFormatYUV420Planar = 0
    Y, U, V in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYUV420SemiPlanar = 1
    Y, UV in two surfaces (UV as one surface) with VU byte ordering, width, height ratio same as YUV420Planar.
cudaEglColorFormatYUV422Planar = 2
    Y, U, V each in a separate surface, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYUV422SemiPlanar = 3
    Y, UV in two surfaces with VU byte ordering, width, height ratio same as YUV422Planar.
cudaEglColorFormatARGB = 6
    R/G/B/A four channels in one surface with BGRA byte ordering.
cudaEglColorFormatRGBA = 7
    R/G/B/A four channels in one surface with ABGR byte ordering.
cudaEglColorFormatL = 8
    single luminance channel in one surface.
cudaEglColorFormatR = 9
    single color channel in one surface.
cudaEglColorFormatYUV444Planar = 10
    Y, U, V in three surfaces, each in a separate surface, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYUV444SemiPlanar = 11
    Y, UV in two surfaces (UV as one surface) with VU byte ordering, width, height ratio same as YUV444Planar.
cudaEglColorFormatYUYV422 = 12
    Y, U, V in one surface, interleaved as UYVY in one channel.
cudaEglColorFormatUYVY422 = 13
    Y, U, V in one surface, interleaved as YUYV in one channel.
cudaEglColorFormatABGR = 14
    R/G/B/A four channels in one surface with RGBA byte ordering.
cudaEglColorFormatBGRA = 15
    R/G/B/A four channels in one surface with ARGB byte ordering.
cudaEglColorFormatA = 16
    Alpha color format - one channel in one surface.
cudaEglColorFormatRG = 17
    R/G color format - two channels in one surface with GR byte ordering
cudaEglColorFormatAYUV = 18
    Y, U, V, A four channels in one surface, interleaved as VUYA.
cudaEglColorFormatYVU444SemiPlanar = 19
    Y, VU in two surfaces (VU as one surface) with UV byte ordering, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYVU422SemiPlanar = 20
    Y, VU in two surfaces (VU as one surface) with UV byte ordering, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYVU420SemiPlanar = 21
    Y, VU in two surfaces (VU as one surface) with UV byte ordering, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY10V10U10_444SemiPlanar = 22
    Y10, V10U10 in two surfaces (VU as one surface) with UV byte ordering, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatY10V10U10_420SemiPlanar = 23
    Y10, V10U10 in two surfaces (VU as one surface) with UV byte ordering, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY12V12U12_444SemiPlanar = 24
    Y12, V12U12 in two surfaces (VU as one surface) with UV byte ordering, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatY12V12U12_420SemiPlanar = 25
    Y12, V12U12 in two surfaces (VU as one surface) with UV byte ordering, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatVYUY_ER = 26
    Extended Range Y, U, V in one surface, interleaved as YVYU in one channel.
cudaEglColorFormatUYVY_ER = 27
    Extended Range Y, U, V in one surface, interleaved as YUYV in one channel.
cudaEglColorFormatYUYV_ER = 28
    Extended Range Y, U, V in one surface, interleaved as UYVY in one channel.
cudaEglColorFormatYVYU_ER = 29
    Extended Range Y, U, V in one surface, interleaved as VYUY in one channel.
cudaEglColorFormatYUVA_ER = 31
    Extended Range Y, U, V, A four channels in one surface, interleaved as AVUY.
cudaEglColorFormatAYUV_ER = 32
    Extended Range Y, U, V, A four channels in one surface, interleaved as VUYA.
cudaEglColorFormatYUV444Planar_ER = 33
    Extended Range Y, U, V in three surfaces, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYUV422Planar_ER = 34
    Extended Range Y, U, V in three surfaces, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYUV420Planar_ER = 35
    Extended Range Y, U, V in three surfaces, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYUV444SemiPlanar_ER = 36
    Extended Range Y, UV in two surfaces (UV as one surface) with VU byte ordering, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYUV422SemiPlanar_ER = 37
    Extended Range Y, UV in two surfaces (UV as one surface) with VU byte ordering, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYUV420SemiPlanar_ER = 38
    Extended Range Y, UV in two surfaces (UV as one surface) with VU byte ordering, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYVU444Planar_ER = 39
    Extended Range Y, V, U in three surfaces, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYVU422Planar_ER = 40
    Extended Range Y, V, U in three surfaces, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYVU420Planar_ER = 41
    Extended Range Y, V, U in three surfaces, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYVU444SemiPlanar_ER = 42
    Extended Range Y, VU in two surfaces (VU as one surface) with UV byte ordering, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYVU422SemiPlanar_ER = 43
    Extended Range Y, VU in two surfaces (VU as one surface) with UV byte ordering, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYVU420SemiPlanar_ER = 44
    Extended Range Y, VU in two surfaces (VU as one surface) with UV byte ordering, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatBayerRGGB = 45
    Bayer format - one channel in one surface with interleaved RGGB ordering.
cudaEglColorFormatBayerBGGR = 46
    Bayer format - one channel in one surface with interleaved BGGR ordering.
cudaEglColorFormatBayerGRBG = 47
    Bayer format - one channel in one surface with interleaved GRBG ordering.
cudaEglColorFormatBayerGBRG = 48
    Bayer format - one channel in one surface with interleaved GBRG ordering.
cudaEglColorFormatBayer10RGGB = 49
    Bayer10 format - one channel in one surface with interleaved RGGB ordering. Out of 16 bits, 10 bits used 6 bits No-op.
cudaEglColorFormatBayer10BGGR = 50
    Bayer10 format - one channel in one surface with interleaved BGGR ordering. Out of 16 bits, 10 bits used 6 bits No-op.
cudaEglColorFormatBayer10GRBG = 51
    Bayer10 format - one channel in one surface with interleaved GRBG ordering. Out of 16 bits, 10 bits used 6 bits No-op.
cudaEglColorFormatBayer10GBRG = 52
    Bayer10 format - one channel in one surface with interleaved GBRG ordering. Out of 16 bits, 10 bits used 6 bits No-op.
cudaEglColorFormatBayer12RGGB = 53
    Bayer12 format - one channel in one surface with interleaved RGGB ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12BGGR = 54
    Bayer12 format - one channel in one surface with interleaved BGGR ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12GRBG = 55
    Bayer12 format - one channel in one surface with interleaved GRBG ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12GBRG = 56
    Bayer12 format - one channel in one surface with interleaved GBRG ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer14RGGB = 57
    Bayer14 format - one channel in one surface with interleaved RGGB ordering. Out of 16 bits, 14 bits used 2 bits No-op.
cudaEglColorFormatBayer14BGGR = 58
    Bayer14 format - one channel in one surface with interleaved BGGR ordering. Out of 16 bits, 14 bits used 2 bits No-op.
cudaEglColorFormatBayer14GRBG = 59
    Bayer14 format - one channel in one surface with interleaved GRBG ordering. Out of 16 bits, 14 bits used 2 bits No-op.
cudaEglColorFormatBayer14GBRG = 60
    Bayer14 format - one channel in one surface with interleaved GBRG ordering. Out of 16 bits, 14 bits used 2 bits No-op.
cudaEglColorFormatBayer20RGGB = 61
    Bayer20 format - one channel in one surface with interleaved RGGB ordering. Out of 32 bits, 20 bits used 12 bits No-op.
cudaEglColorFormatBayer20BGGR = 62
    Bayer20 format - one channel in one surface with interleaved BGGR ordering. Out of 32 bits, 20 bits used 12 bits No-op.
cudaEglColorFormatBayer20GRBG = 63
    Bayer20 format - one channel in one surface with interleaved GRBG ordering. Out of 32 bits, 20 bits used 12 bits No-op.
cudaEglColorFormatBayer20GBRG = 64
    Bayer20 format - one channel in one surface with interleaved GBRG ordering. Out of 32 bits, 20 bits used 12 bits No-op.
cudaEglColorFormatYVU444Planar = 65
    Y, V, U in three surfaces, each in a separate surface, U/V width = Y width, U/V height = Y height.
cudaEglColorFormatYVU422Planar = 66
    Y, V, U in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatYVU420Planar = 67
    Y, V, U in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatBayerIspRGGB = 68
    Nvidia proprietary Bayer ISP format - one channel in one surface with interleaved RGGB ordering and mapped to opaque integer datatype.
cudaEglColorFormatBayerIspBGGR = 69
    Nvidia proprietary Bayer ISP format - one channel in one surface with interleaved BGGR ordering and mapped to opaque integer datatype.
cudaEglColorFormatBayerIspGRBG = 70
    Nvidia proprietary Bayer ISP format - one channel in one surface with interleaved GRBG ordering and mapped to opaque integer datatype.
cudaEglColorFormatBayerIspGBRG = 71
    Nvidia proprietary Bayer ISP format - one channel in one surface with interleaved GBRG ordering and mapped to opaque integer datatype.
cudaEglColorFormatBayerBCCR = 72
    Bayer format - one channel in one surface with interleaved BCCR ordering.
cudaEglColorFormatBayerRCCB = 73
    Bayer format - one channel in one surface with interleaved RCCB ordering.
cudaEglColorFormatBayerCRBC = 74
    Bayer format - one channel in one surface with interleaved CRBC ordering.
cudaEglColorFormatBayerCBRC = 75
    Bayer format - one channel in one surface with interleaved CBRC ordering.
cudaEglColorFormatBayer10CCCC = 76
    Bayer10 format - one channel in one surface with interleaved CCCC ordering. Out of 16 bits, 10 bits used 6 bits No-op.
cudaEglColorFormatBayer12BCCR = 77
    Bayer12 format - one channel in one surface with interleaved BCCR ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12RCCB = 78
    Bayer12 format - one channel in one surface with interleaved RCCB ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12CRBC = 79
    Bayer12 format - one channel in one surface with interleaved CRBC ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12CBRC = 80
    Bayer12 format - one channel in one surface with interleaved CBRC ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatBayer12CCCC = 81
    Bayer12 format - one channel in one surface with interleaved CCCC ordering. Out of 16 bits, 12 bits used 4 bits No-op.
cudaEglColorFormatY = 82
    Color format for single Y plane.
cudaEglColorFormatYUV420SemiPlanar_2020 = 83
    Y, UV in two surfaces (UV as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYVU420SemiPlanar_2020 = 84
    Y, VU in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYUV420Planar_2020 = 85
    Y, U, V in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYVU420Planar_2020 = 86
    Y, V, U in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYUV420SemiPlanar_709 = 87
    Y, UV in two surfaces (UV as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYVU420SemiPlanar_709 = 88
    Y, VU in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYUV420Planar_709 = 89
    Y, U, V in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatYVU420Planar_709 = 90
    Y, V, U in three surfaces, each in a separate surface, U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY10V10U10_420SemiPlanar_709 = 91
    Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY10V10U10_420SemiPlanar_2020 = 92
    Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY10V10U10_422SemiPlanar_2020 = 93
    Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatY10V10U10_422SemiPlanar = 94
    Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatY10V10U10_422SemiPlanar_709 = 95
    Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = Y height.
cudaEglColorFormatY_ER = 96
    Extended Range Color format for single Y plane.
cudaEglColorFormatY_709_ER = 97
    Extended Range Color format for single Y plane.
cudaEglColorFormatY10_ER = 98
    Extended Range Color format for single Y10 plane.
cudaEglColorFormatY10_709_ER = 99
    Extended Range Color format for single Y10 plane.
cudaEglColorFormatY12_ER = 100
    Extended Range Color format for single Y12 plane.
cudaEglColorFormatY12_709_ER = 101
    Extended Range Color format for single Y12 plane.
cudaEglColorFormatYUVA = 102
    Y, U, V, A four channels in one surface, interleaved as AVUY.
cudaEglColorFormatYVYU = 104
    Y, U, V in one surface, interleaved as YVYU in one channel.
cudaEglColorFormatVYUY = 105
    Y, U, V in one surface, interleaved as VYUY in one channel.
cudaEglColorFormatY10V10U10_420SemiPlanar_ER = 106
    Extended Range Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY10V10U10_420SemiPlanar_709_ER = 107
    Extended Range Y10, V10U10 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY10V10U10_444SemiPlanar_ER = 108
    Extended Range Y10, V10U10 in two surfaces (VU as one surface) U/V width = Y width, U/V height = Y height.
cudaEglColorFormatY10V10U10_444SemiPlanar_709_ER = 109
    Extended Range Y10, V10U10 in two surfaces (VU as one surface) U/V width = Y width, U/V height = Y height.
cudaEglColorFormatY12V12U12_420SemiPlanar_ER = 110
    Extended Range Y12, V12U12 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY12V12U12_420SemiPlanar_709_ER = 111
    Extended Range Y12, V12U12 in two surfaces (VU as one surface) U/V width = 1/2 Y width, U/V height = 1/2 Y height.
cudaEglColorFormatY12V12U12_444SemiPlanar_ER = 112
    Extended Range Y12, V12U12 in two surfaces (VU as one surface) U/V width = Y width, U/V height = Y height.
cudaEglColorFormatY12V12U12_444SemiPlanar_709_ER = 113
    Extended Range Y12, V12U12 in two surfaces (VU as one surface) U/V width = Y width, U/V height = Y height.
cudaEglColorFormatUYVY709 = 114
    Y, U, V in one surface, interleaved as UYVY in one channel.
cudaEglColorFormatUYVY709_ER = 115
    Extended Range Y, U, V in one surface, interleaved as UYVY in one channel.
cudaEglColorFormatUYVY2020 = 116
    Y, U, V in one surface, interleaved as UYVY in one channel.

enum cudaEglFrameType


CUDA EglFrame type - array or pointer

######  Values

cudaEglFrameTypeArray = 0
    Frame type CUDA array
cudaEglFrameTypePitch = 1
    Frame type CUDA pointer

enum cudaEglResourceLocationFlags


Resource location flags- sysmem or vidmem

For CUDA context on iGPU, since video and system memory are equivalent - these flags will not have an effect on the execution.

For CUDA context on dGPU, applications can use the flag cudaEglResourceLocationFlags to give a hint about the desired location.

cudaEglResourceLocationSysmem \- the frame data is made resident on the system memory to be accessed by CUDA.

cudaEglResourceLocationVidmem \- the frame data is made resident on the dedicated video memory to be accessed by CUDA.

There may be an additional latency due to new allocation and data migration, if the frame is produced on a different memory.

######  Values

cudaEglResourceLocationSysmem = 0x00
    Resource location sysmem
cudaEglResourceLocationVidmem = 0x01
    Resource location vidmem

enum cudaError


CUDA error types

######  Values

cudaSuccess = 0
    The API call returned with no errors. In the case of query calls, this also means that the operation being queried is complete (see cudaEventQuery() and cudaStreamQuery()).
cudaErrorInvalidValue = 1
    This indicates that one or more of the parameters passed to the API call is not within an acceptable range of values.
cudaErrorMemoryAllocation = 2
    The API call failed because it was unable to allocate enough memory or other resources to perform the requested operation.
cudaErrorInitializationError = 3
    The API call failed because the CUDA driver and runtime could not be initialized.
cudaErrorCudartUnloading = 4
    This indicates that a CUDA Runtime API call cannot be executed because it is being called during process shut down, at a point in time after CUDA driver has been unloaded.
cudaErrorProfilerDisabled = 5
    This indicates profiler is not initialized for this run. This can happen when the application is running with external profiling tools like visual profiler.
cudaErrorProfilerNotInitialized = 6


###### Deprecated

This error return is deprecated as of CUDA 5.0. It is no longer an error to attempt to enable/disable the profiling via cudaProfilerStart or cudaProfilerStop without initialization.

cudaErrorProfilerAlreadyStarted = 7


###### Deprecated

This error return is deprecated as of CUDA 5.0. It is no longer an error to call cudaProfilerStart() when profiling is already enabled.

cudaErrorProfilerAlreadyStopped = 8


###### Deprecated

This error return is deprecated as of CUDA 5.0. It is no longer an error to call cudaProfilerStop() when profiling is already disabled.

cudaErrorInvalidConfiguration = 9
    This indicates that a kernel launch is requesting resources that can never be satisfied by the current device. Requesting more shared memory per block than the device supports will trigger this error, as will requesting too many threads or blocks. See cudaDeviceProp for more device limitations.
cudaErrorInvalidPitchValue = 12
    This indicates that one or more of the pitch-related parameters passed to the API call is not within the acceptable range for pitch.
cudaErrorInvalidSymbol = 13
    This indicates that the symbol name/identifier passed to the API call is not a valid name or identifier.
cudaErrorInvalidHostPointer = 16


###### Deprecated

This error return is deprecated as of CUDA 10.1.

This indicates that at least one host pointer passed to the API call is not a valid host pointer.

cudaErrorInvalidDevicePointer = 17


###### Deprecated

This error return is deprecated as of CUDA 10.1.

This indicates that at least one device pointer passed to the API call is not a valid device pointer.

cudaErrorInvalidTexture = 18
    This indicates that the texture passed to the API call is not a valid texture.
cudaErrorInvalidTextureBinding = 19
    This indicates that the texture binding is not valid. This occurs if you call cudaGetTextureAlignmentOffset() with an unbound texture.
cudaErrorInvalidChannelDescriptor = 20
    This indicates that the channel descriptor passed to the API call is not valid. This occurs if the format is not one of the formats specified by cudaChannelFormatKind, or if one of the dimensions is invalid.
cudaErrorInvalidMemcpyDirection = 21
    This indicates that the direction of the memcpy passed to the API call is not one of the types specified by cudaMemcpyKind.
cudaErrorAddressOfConstant = 22


###### Deprecated

This error return is deprecated as of CUDA 3.1. Variables in constant memory may now have their address taken by the runtime via cudaGetSymbolAddress().

This indicated that the user has taken the address of a constant variable, which was forbidden up until the CUDA 3.1 release.

cudaErrorTextureFetchFailed = 23


###### Deprecated

This error return is deprecated as of CUDA 3.1. Device emulation mode was removed with the CUDA 3.1 release.

This indicated that a texture fetch was not able to be performed. This was previously used for device emulation of texture operations.

cudaErrorTextureNotBound = 24


###### Deprecated

This error return is deprecated as of CUDA 3.1. Device emulation mode was removed with the CUDA 3.1 release.

This indicated that a texture was not bound for access. This was previously used for device emulation of texture operations.

cudaErrorSynchronizationError = 25


###### Deprecated

This error return is deprecated as of CUDA 3.1. Device emulation mode was removed with the CUDA 3.1 release.

This indicated that a synchronization operation had failed. This was previously used for some device emulation functions.

cudaErrorInvalidFilterSetting = 26
    This indicates that a non-float texture was being accessed with linear filtering. This is not supported by CUDA.
cudaErrorInvalidNormSetting = 27
    This indicates that an attempt was made to read an unsupported data type as a normalized float. This is not supported by CUDA.
cudaErrorMixedDeviceExecution = 28


###### Deprecated

This error return is deprecated as of CUDA 3.1. Device emulation mode was removed with the CUDA 3.1 release.

Mixing of device and device emulation code was not allowed.

cudaErrorNotYetImplemented = 31


###### Deprecated

This error return is deprecated as of CUDA 4.1.

This indicates that the API call is not yet implemented. Production releases of CUDA will never return this error.

cudaErrorMemoryValueTooLarge = 32


###### Deprecated

This error return is deprecated as of CUDA 3.1. Device emulation mode was removed with the CUDA 3.1 release.

This indicated that an emulated device pointer exceeded the 32-bit address range.

cudaErrorStubLibrary = 34
    This indicates that the CUDA driver that the application has loaded is a stub library. Applications that run with the stub rather than a real driver loaded will result in CUDA API returning this error.
cudaErrorInsufficientDriver = 35
    This indicates that the installed NVIDIA CUDA driver is older than the CUDA runtime library. This is not a supported configuration. Users should install an updated NVIDIA display driver to allow the application to run.
cudaErrorCallRequiresNewerDriver = 36
    This indicates that the API call requires a newer CUDA driver than the one currently installed. Users should install an updated NVIDIA CUDA driver to allow the API call to succeed.
cudaErrorInvalidSurface = 37
    This indicates that the surface passed to the API call is not a valid surface.
cudaErrorDuplicateVariableName = 43
    This indicates that multiple global or constant variables (across separate CUDA source files in the application) share the same string name.
cudaErrorDuplicateTextureName = 44
    This indicates that multiple textures (across separate CUDA source files in the application) share the same string name.
cudaErrorDuplicateSurfaceName = 45
    This indicates that multiple surfaces (across separate CUDA source files in the application) share the same string name.
cudaErrorDevicesUnavailable = 46
    This indicates that all CUDA devices are busy or unavailable at the current time. Devices are often busy/unavailable due to use of cudaComputeModeProhibited, cudaComputeModeExclusiveProcess, or when long running CUDA kernels have filled up the GPU and are blocking new work from starting. They can also be unavailable due to memory constraints on a device that already has active CUDA work being performed.
cudaErrorIncompatibleDriverContext = 49
    This indicates that the current context is not compatible with this the CUDA Runtime. This can only occur if you are using CUDA Runtime/Driver interoperability and have created an existing Driver context using the driver API. The Driver context may be incompatible either because the Driver context was created using an older version of the API, because the Runtime API call expects a primary driver context and the Driver context is not primary, or because the Driver context has been destroyed. Please see Interactions with the CUDA Driver API" for more information.
cudaErrorMissingConfiguration = 52
    The device function being invoked (usually via cudaLaunchKernel()) was not previously configured via the cudaConfigureCall() function.
cudaErrorPriorLaunchFailure = 53


###### Deprecated

This error return is deprecated as of CUDA 3.1. Device emulation mode was removed with the CUDA 3.1 release.

This indicated that a previous kernel launch failed. This was previously used for device emulation of kernel launches.

cudaErrorLaunchMaxDepthExceeded = 65
    This error indicates that a device runtime grid launch did not occur because the depth of the child grid would exceed the maximum supported number of nested grid launches.
cudaErrorLaunchFileScopedTex = 66
    This error indicates that a grid launch did not occur because the kernel uses file-scoped textures which are unsupported by the device runtime. Kernels launched via the device runtime only support textures created with the Texture Object API's.
cudaErrorLaunchFileScopedSurf = 67
    This error indicates that a grid launch did not occur because the kernel uses file-scoped surfaces which are unsupported by the device runtime. Kernels launched via the device runtime only support surfaces created with the Surface Object API's.
cudaErrorSyncDepthExceeded = 68
    This error indicates that a call to cudaDeviceSynchronize made from the device runtime failed because the call was made at grid depth greater than than either the default (2 levels of grids) or user specified device limit cudaLimitDevRuntimeSyncDepth. To be able to synchronize on launched grids at a greater depth successfully, the maximum nested depth at which cudaDeviceSynchronize will be called must be specified with the cudaLimitDevRuntimeSyncDepth limit to the cudaDeviceSetLimit api before the host-side launch of a kernel using the device runtime. Keep in mind that additional levels of sync depth require the runtime to reserve large amounts of device memory that cannot be used for user allocations. Note that cudaDeviceSynchronize made from device runtime is only supported on devices of compute capability < 9.0.
cudaErrorLaunchPendingCountExceeded = 69
    This error indicates that a device runtime grid launch failed because the launch would exceed the limit cudaLimitDevRuntimePendingLaunchCount. For this launch to proceed successfully, cudaDeviceSetLimit must be called to set the cudaLimitDevRuntimePendingLaunchCount to be higher than the upper bound of outstanding launches that can be issued to the device runtime. Keep in mind that raising the limit of pending device runtime launches will require the runtime to reserve device memory that cannot be used for user allocations.
cudaErrorInvalidDeviceFunction = 98
    The requested device function does not exist or is not compiled for the proper device architecture.
cudaErrorNoDevice = 100
    This indicates that no CUDA-capable devices were detected by the installed CUDA driver.
cudaErrorInvalidDevice = 101
    This indicates that the device ordinal supplied by the user does not correspond to a valid CUDA device or that the action requested is invalid for the specified device.
cudaErrorDeviceNotLicensed = 102
    This indicates that the device doesn't have a valid Grid License.
cudaErrorSoftwareValidityNotEstablished = 103
    By default, the CUDA runtime may perform a minimal set of self-tests, as well as CUDA driver tests, to establish the validity of both. Introduced in CUDA 11.2, this error return indicates that at least one of these tests has failed and the validity of either the runtime or the driver could not be established.
cudaErrorStartupFailure = 127
    This indicates an internal startup failure in the CUDA runtime.
cudaErrorInvalidKernelImage = 200
    This indicates that the device kernel image is invalid.
cudaErrorDeviceUninitialized = 201
    This most frequently indicates that there is no context bound to the current thread. This can also be returned if the context passed to an API call is not a valid handle (such as a context that has had cuCtxDestroy() invoked on it). This can also be returned if a user mixes different API versions (i.e. 3010 context with 3020 API calls). See cuCtxGetApiVersion() for more details.
cudaErrorMapBufferObjectFailed = 205
    This indicates that the buffer object could not be mapped.
cudaErrorUnmapBufferObjectFailed = 206
    This indicates that the buffer object could not be unmapped.
cudaErrorArrayIsMapped = 207
    This indicates that the specified array is currently mapped and thus cannot be destroyed.
cudaErrorAlreadyMapped = 208
    This indicates that the resource is already mapped.
cudaErrorNoKernelImageForDevice = 209
    This indicates that there is no kernel image available that is suitable for the device. This can occur when a user specifies code generation options for a particular CUDA source file that do not include the corresponding device configuration.
cudaErrorAlreadyAcquired = 210
    This indicates that a resource has already been acquired.
cudaErrorNotMapped = 211
    This indicates that a resource is not mapped.
cudaErrorNotMappedAsArray = 212
    This indicates that a mapped resource is not available for access as an array.
cudaErrorNotMappedAsPointer = 213
    This indicates that a mapped resource is not available for access as a pointer.
cudaErrorECCUncorrectable = 214
    This indicates that an uncorrectable ECC error was detected during execution.
cudaErrorUnsupportedLimit = 215
    This indicates that the cudaLimit passed to the API call is not supported by the active device.
cudaErrorDeviceAlreadyInUse = 216
    This indicates that a call tried to access an exclusive-thread device that is already in use by a different thread.
cudaErrorPeerAccessUnsupported = 217
    This error indicates that P2P access is not supported across the given devices.
cudaErrorInvalidPtx = 218
    A PTX compilation failed. The runtime may fall back to compiling PTX if an application does not contain a suitable binary for the current device.
cudaErrorInvalidGraphicsContext = 219
    This indicates an error with the OpenGL or DirectX context.
cudaErrorNvlinkUncorrectable = 220
    This indicates that an uncorrectable NVLink error was detected during the execution.
cudaErrorJitCompilerNotFound = 221
    This indicates that the PTX JIT compiler library was not found. The JIT Compiler library is used for PTX compilation. The runtime may fall back to compiling PTX if an application does not contain a suitable binary for the current device.
cudaErrorUnsupportedPtxVersion = 222
    This indicates that the provided PTX was compiled with an unsupported toolchain. The most common reason for this, is the PTX was generated by a compiler newer than what is supported by the CUDA driver and PTX JIT compiler.
cudaErrorJitCompilationDisabled = 223
    This indicates that the JIT compilation was disabled. The JIT compilation compiles PTX. The runtime may fall back to compiling PTX if an application does not contain a suitable binary for the current device.
cudaErrorUnsupportedExecAffinity = 224
    This indicates that the provided execution affinity is not supported by the device.
cudaErrorUnsupportedDevSideSync = 225
    This indicates that the code to be compiled by the PTX JIT contains unsupported call to cudaDeviceSynchronize.
cudaErrorContained = 226
    This indicates that an exception occurred on the device that is now contained by the GPU's error containment capability. Common causes are - a. Certain types of invalid accesses of peer GPU memory over nvlink b. Certain classes of hardware errors This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorInvalidSource = 300
    This indicates that the device kernel source is invalid.
cudaErrorFileNotFound = 301
    This indicates that the file specified was not found.
cudaErrorSharedObjectSymbolNotFound = 302
    This indicates that a link to a shared object failed to resolve.
cudaErrorSharedObjectInitFailed = 303
    This indicates that initialization of a shared object failed.
cudaErrorOperatingSystem = 304
    This error indicates that an OS call failed.
cudaErrorInvalidResourceHandle = 400
    This indicates that a resource handle passed to the API call was not valid. Resource handles are opaque types like cudaStream_t and cudaEvent_t.
cudaErrorIllegalState = 401
    This indicates that a resource required by the API call is not in a valid state to perform the requested operation.
cudaErrorLossyQuery = 402
    This indicates an attempt was made to introspect an object in a way that would discard semantically important information. This is either due to the object using funtionality newer than the API version used to introspect it or omission of optional return arguments.
cudaErrorSymbolNotFound = 500
    This indicates that a named symbol was not found. Examples of symbols are global/constant variable names, driver function names, texture names, and surface names.
cudaErrorNotReady = 600
    This indicates that asynchronous operations issued previously have not completed yet. This result is not actually an error, but must be indicated differently than cudaSuccess (which indicates completion). Calls that may return this value include cudaEventQuery() and cudaStreamQuery().
cudaErrorIllegalAddress = 700
    The device encountered a load or store instruction on an invalid memory address. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorLaunchOutOfResources = 701
    This indicates that a launch did not occur because it did not have appropriate resources. Although this error is similar to cudaErrorInvalidConfiguration, this error usually indicates that the user has attempted to pass too many arguments to the device kernel, or the kernel launch specifies too many threads for the kernel's register count.
cudaErrorLaunchTimeout = 702
    This indicates that the device kernel took too long to execute. This can only occur if timeouts are enabled - see the device attribute cudaDevAttrKernelExecTimeout for more information. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorLaunchIncompatibleTexturing = 703
    This error indicates a kernel launch that uses an incompatible texturing mode.
cudaErrorPeerAccessAlreadyEnabled = 704
    This error indicates that a call to cudaDeviceEnablePeerAccess() is trying to re-enable peer addressing on from a context which has already had peer addressing enabled.
cudaErrorPeerAccessNotEnabled = 705
    This error indicates that cudaDeviceDisablePeerAccess() is trying to disable peer addressing which has not been enabled yet via cudaDeviceEnablePeerAccess().
cudaErrorSetOnActiveProcess = 708
    This indicates that the user has called cudaSetValidDevices(), cudaSetDeviceFlags(), cudaD3D9SetDirect3DDevice(), cudaD3D10SetDirect3DDevice, cudaD3D11SetDirect3DDevice(), or cudaVDPAUSetVDPAUDevice() after initializing the CUDA runtime by calling non-device management operations (allocating memory and launching kernels are examples of non-device management operations). This error can also be returned if using runtime/driver interoperability and there is an existing CUcontext active on the host thread.
cudaErrorContextIsDestroyed = 709
    This error indicates that the context current to the calling thread has been destroyed using cuCtxDestroy, or is a primary context which has not yet been initialized.
cudaErrorAssert = 710
    An assert triggered in device code during kernel execution. The device cannot be used again. All existing allocations are invalid. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorTooManyPeers = 711
    This error indicates that the hardware resources required to enable peer access have been exhausted for one or more of the devices passed to cudaEnablePeerAccess().
cudaErrorHostMemoryAlreadyRegistered = 712
    This error indicates that the memory range passed to cudaHostRegister() has already been registered.
cudaErrorHostMemoryNotRegistered = 713
    This error indicates that the pointer passed to cudaHostUnregister() does not correspond to any currently registered memory region.
cudaErrorHardwareStackError = 714
    Device encountered an error in the call stack during kernel execution, possibly due to stack corruption or exceeding the stack size limit. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorIllegalInstruction = 715
    The device encountered an illegal instruction during kernel execution This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorMisalignedAddress = 716
    The device encountered a load or store instruction on a memory address which is not aligned. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorInvalidAddressSpace = 717
    While executing a kernel, the device encountered an instruction which can only operate on memory locations in certain address spaces (global, shared, or local), but was supplied a memory address not belonging to an allowed address space. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorInvalidPc = 718
    The device encountered an invalid program counter. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorLaunchFailure = 719
    An exception occurred on the device while executing a kernel. Common causes include dereferencing an invalid device pointer and accessing out of bounds shared memory. Less common cases can be system specific - more information about these cases can be found in the system specific user guide. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorCooperativeLaunchTooLarge = 720
    This error indicates that the number of blocks launched per grid for a kernel that was launched via either cudaLaunchCooperativeKernel exceeds the maximum number of blocks as allowed by cudaOccupancyMaxActiveBlocksPerMultiprocessor or cudaOccupancyMaxActiveBlocksPerMultiprocessorWithFlags times the number of multiprocessors as specified by the device attribute cudaDevAttrMultiProcessorCount.
cudaErrorTensorMemoryLeak = 721
    An exception occurred on the device while exiting a kernel using tensor memory: the tensor memory was not completely deallocated. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorNotPermitted = 800
    This error indicates the attempted operation is not permitted.
cudaErrorNotSupported = 801
    This error indicates the attempted operation is not supported on the current system or device.
cudaErrorSystemNotReady = 802
    This error indicates that the system is not yet ready to start any CUDA work. To continue using CUDA, verify the system configuration is in a valid state and all required driver daemons are actively running. More information about this error can be found in the system specific user guide.
cudaErrorSystemDriverMismatch = 803
    This error indicates that there is a mismatch between the versions of the display driver and the CUDA driver. Refer to the compatibility documentation for supported versions.
cudaErrorCompatNotSupportedOnDevice = 804
    This error indicates that the system was upgraded to run with forward compatibility but the visible hardware detected by CUDA does not support this configuration. Refer to the compatibility documentation for the supported hardware matrix or ensure that only supported hardware is visible during initialization via the CUDA_VISIBLE_DEVICES environment variable.
cudaErrorMpsConnectionFailed = 805
    This error indicates that the MPS client failed to connect to the MPS control daemon or the MPS server.
cudaErrorMpsRpcFailure = 806
    This error indicates that the remote procedural call between the MPS server and the MPS client failed.
cudaErrorMpsServerNotReady = 807
    This error indicates that the MPS server is not ready to accept new MPS client requests. This error can be returned when the MPS server is in the process of recovering from a fatal failure.
cudaErrorMpsMaxClientsReached = 808
    This error indicates that the hardware resources required to create MPS client have been exhausted.
cudaErrorMpsMaxConnectionsReached = 809
    This error indicates the the hardware resources required to device connections have been exhausted.
cudaErrorMpsClientTerminated = 810
    This error indicates that the MPS client has been terminated by the server. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorCdpNotSupported = 811
    This error indicates, that the program is using CUDA Dynamic Parallelism, but the current configuration, like MPS, does not support it.
cudaErrorCdpVersionMismatch = 812
    This error indicates, that the program contains an unsupported interaction between different versions of CUDA Dynamic Parallelism.
cudaErrorStreamCaptureUnsupported = 900
    The operation is not permitted when the stream is capturing.
cudaErrorStreamCaptureInvalidated = 901
    The current capture sequence on the stream has been invalidated due to a previous error.
cudaErrorStreamCaptureMerge = 902
    The operation would have resulted in a merge of two independent capture sequences.
cudaErrorStreamCaptureUnmatched = 903
    The capture was not initiated in this stream.
cudaErrorStreamCaptureUnjoined = 904
    The capture sequence contains a fork that was not joined to the primary stream.
cudaErrorStreamCaptureIsolation = 905
    A dependency would have been created which crosses the capture sequence boundary. Only implicit in-stream ordering dependencies are allowed to cross the boundary.
cudaErrorStreamCaptureImplicit = 906
    The operation would have resulted in a disallowed implicit dependency on a current capture sequence from cudaStreamLegacy.
cudaErrorCapturedEvent = 907
    The operation is not permitted on an event which was last recorded in a capturing stream.
cudaErrorStreamCaptureWrongThread = 908
    A stream capture sequence not initiated with the cudaStreamCaptureModeRelaxed argument to cudaStreamBeginCapture was passed to cudaStreamEndCapture in a different thread.
cudaErrorTimeout = 909
    This indicates that the wait operation has timed out.
cudaErrorGraphExecUpdateFailure = 910
    This error indicates that the graph update was not performed because it included changes which violated constraints specific to instantiated graph update.
cudaErrorExternalDevice = 911
    This indicates that an async error has occurred in a device outside of CUDA. If CUDA was waiting for an external device's signal before consuming shared data, the external device signaled an error indicating that the data is not valid for consumption. This leaves the process in an inconsistent state and any further CUDA work will return the same error. To continue using CUDA, the process must be terminated and relaunched.
cudaErrorInvalidClusterSize = 912
    This indicates that a kernel launch error has occurred due to cluster misconfiguration.
cudaErrorFunctionNotLoaded = 913
    Indiciates a function handle is not loaded when calling an API that requires a loaded function.
cudaErrorInvalidResourceType = 914
    This error indicates one or more resources passed in are not valid resource types for the operation.
cudaErrorInvalidResourceConfiguration = 915
    This error indicates one or more resources are insufficient or non-applicable for the operation.
cudaErrorStreamDetached = 917
    This error indicates that the requested operation is not permitted because the stream is in a detached state. This can occur if the green context associated with the stream has been destroyed, limiting the stream's operational capabilities.
cudaErrorUnknown = 999
    This indicates that an unknown internal error has occurred.
cudaErrorApiFailureBase = 10000


enum cudaExternalMemoryHandleType


External memory handle types

######  Values

cudaExternalMemoryHandleTypeOpaqueFd = 1
    Handle is an opaque file descriptor
cudaExternalMemoryHandleTypeOpaqueWin32 = 2
    Handle is an opaque shared NT handle
cudaExternalMemoryHandleTypeOpaqueWin32Kmt = 3
    Handle is an opaque, globally shared handle
cudaExternalMemoryHandleTypeD3D12Heap = 4
    Handle is a D3D12 heap object
cudaExternalMemoryHandleTypeD3D12Resource = 5
    Handle is a D3D12 committed resource
cudaExternalMemoryHandleTypeD3D11Resource = 6
    Handle is a shared NT handle to a D3D11 resource
cudaExternalMemoryHandleTypeD3D11ResourceKmt = 7
    Handle is a globally shared handle to a D3D11 resource
cudaExternalMemoryHandleTypeNvSciBuf = 8
    Handle is an NvSciBuf object

enum cudaExternalSemaphoreHandleType


External semaphore handle types

######  Values

cudaExternalSemaphoreHandleTypeOpaqueFd = 1
    Handle is an opaque file descriptor
cudaExternalSemaphoreHandleTypeOpaqueWin32 = 2
    Handle is an opaque shared NT handle
cudaExternalSemaphoreHandleTypeOpaqueWin32Kmt = 3
    Handle is an opaque, globally shared handle
cudaExternalSemaphoreHandleTypeD3D12Fence = 4
    Handle is a shared NT handle referencing a D3D12 fence object
cudaExternalSemaphoreHandleTypeD3D11Fence = 5
    Handle is a shared NT handle referencing a D3D11 fence object
cudaExternalSemaphoreHandleTypeNvSciSync = 6
    Opaque handle to NvSciSync Object
cudaExternalSemaphoreHandleTypeKeyedMutex = 7
    Handle is a shared NT handle referencing a D3D11 keyed mutex object
cudaExternalSemaphoreHandleTypeKeyedMutexKmt = 8
    Handle is a shared KMT handle referencing a D3D11 keyed mutex object
cudaExternalSemaphoreHandleTypeTimelineSemaphoreFd = 9
    Handle is an opaque handle file descriptor referencing a timeline semaphore
cudaExternalSemaphoreHandleTypeTimelineSemaphoreWin32 = 10
    Handle is an opaque handle file descriptor referencing a timeline semaphore

enum cudaFlushGPUDirectRDMAWritesOptions


CUDA GPUDirect RDMA flush writes APIs supported on the device

######  Values

cudaFlushGPUDirectRDMAWritesOptionHost = 1<<0
     cudaDeviceFlushGPUDirectRDMAWrites() and its CUDA Driver API counterpart are supported on the device.
cudaFlushGPUDirectRDMAWritesOptionMemOps = 1<<1
    The CU_STREAM_WAIT_VALUE_FLUSH flag and the CU_STREAM_MEM_OP_FLUSH_REMOTE_WRITES MemOp are supported on the CUDA device.

enum cudaFlushGPUDirectRDMAWritesScope


CUDA GPUDirect RDMA flush writes scopes

######  Values

cudaFlushGPUDirectRDMAWritesToOwner = 100
    Blocks until remote writes are visible to the CUDA device context owning the data.
cudaFlushGPUDirectRDMAWritesToAllDevices = 200
    Blocks until remote writes are visible to all CUDA device contexts.

enum cudaFlushGPUDirectRDMAWritesTarget


CUDA GPUDirect RDMA flush writes targets

######  Values

cudaFlushGPUDirectRDMAWritesTargetCurrentDevice
    Sets the target for cudaDeviceFlushGPUDirectRDMAWrites() to the currently active CUDA device context.

enum cudaFuncAttribute


CUDA function attributes that can be set using cudaFuncSetAttribute

######  Values

cudaFuncAttributeMaxDynamicSharedMemorySize = 8
    Maximum dynamic shared memory size
cudaFuncAttributePreferredSharedMemoryCarveout = 9
    Preferred shared memory-L1 cache split
cudaFuncAttributeClusterDimMustBeSet = 10
    Indicator to enforce valid cluster dimension specification on kernel launch
cudaFuncAttributeRequiredClusterWidth = 11
    Required cluster width
cudaFuncAttributeRequiredClusterHeight = 12
    Required cluster height
cudaFuncAttributeRequiredClusterDepth = 13
    Required cluster depth
cudaFuncAttributeNonPortableClusterSizeAllowed = 14
    Whether non-portable cluster scheduling policy is supported
cudaFuncAttributeClusterSchedulingPolicyPreference = 15
    Required cluster scheduling policy preference
cudaFuncAttributeMax


enum cudaFuncCache


CUDA function cache configurations

######  Values

cudaFuncCachePreferNone = 0
    Default function cache configuration, no preference
cudaFuncCachePreferShared = 1
    Prefer larger shared memory and smaller L1 cache
cudaFuncCachePreferL1 = 2
    Prefer larger L1 cache and smaller shared memory
cudaFuncCachePreferEqual = 3
    Prefer equal size L1 cache and shared memory

enum cudaGPUDirectRDMAWritesOrdering


CUDA GPUDirect RDMA flush writes ordering features of the device

######  Values

cudaGPUDirectRDMAWritesOrderingNone = 0
    The device does not natively support ordering of GPUDirect RDMA writes. cudaFlushGPUDirectRDMAWrites() can be leveraged if supported.
cudaGPUDirectRDMAWritesOrderingOwner = 100
    Natively, the device can consistently consume GPUDirect RDMA writes, although other CUDA devices may not.
cudaGPUDirectRDMAWritesOrderingAllDevices = 200
    Any CUDA device in the system can consistently consume GPUDirect RDMA writes to this device.

enum cudaGetDriverEntryPointFlags


Flags to specify search options to be used with cudaGetDriverEntryPoint For more details see cuGetProcAddress

######  Values

cudaEnableDefault = 0x0
    Default search mode for driver symbols.
cudaEnableLegacyStream = 0x1
    Search for legacy versions of driver symbols.
cudaEnablePerThreadDefaultStream = 0x2
    Search for per-thread versions of driver symbols.

enum cudaGraphChildGraphNodeOwnership


Child graph node ownership

######  Values

cudaGraphChildGraphOwnershipClone = 0
    Default behavior for a child graph node. Child graph is cloned into the parent and memory allocation/free nodes can't be present in the child graph.
cudaGraphChildGraphOwnershipMove = 1
    The child graph is moved to the parent. The handle to the child graph is owned by the parent and will be destroyed when the parent is destroyed.The following restrictions apply to child graphs after they have been moved: Cannot be independently instantiated or destroyed; Cannot be added as a child graph of a separate parent graph; Cannot be used as an argument to cudaGraphExecUpdate; Cannot have additional memory allocation or free nodes added.

enum cudaGraphConditionalNodeType


CUDA conditional node types

######  Values

cudaGraphCondTypeIf = 0
    Conditional 'if/else' Node. Body[0] executed if condition is non-zero. If `size` == 2, an optional ELSE graph is created and this is executed if the condition is zero.
cudaGraphCondTypeWhile = 1
    Conditional 'while' Node. Body executed repeatedly while condition value is non-zero.
cudaGraphCondTypeSwitch = 2
    Conditional 'switch' Node. Body[n] is executed once, where 'n' is the value of the condition. If the condition does not match a body index, no body is launched.

enum cudaGraphDebugDotFlags


CUDA Graph debug write options

######  Values

cudaGraphDebugDotFlagsVerbose = 1<<0
    Output all debug data as if every debug flag is enabled
cudaGraphDebugDotFlagsKernelNodeParams = 1<<2
    Adds cudaKernelNodeParams to output
cudaGraphDebugDotFlagsMemcpyNodeParams = 1<<3
    Adds cudaMemcpy3DParms to output
cudaGraphDebugDotFlagsMemsetNodeParams = 1<<4
    Adds cudaMemsetParams to output
cudaGraphDebugDotFlagsHostNodeParams = 1<<5
    Adds cudaHostNodeParams to output
cudaGraphDebugDotFlagsEventNodeParams = 1<<6
    Adds cudaEvent_t handle from record and wait nodes to output
cudaGraphDebugDotFlagsExtSemasSignalNodeParams = 1<<7
    Adds cudaExternalSemaphoreSignalNodeParams values to output
cudaGraphDebugDotFlagsExtSemasWaitNodeParams = 1<<8
    Adds cudaExternalSemaphoreWaitNodeParams to output
cudaGraphDebugDotFlagsKernelNodeAttributes = 1<<9
    Adds cudaKernelNodeAttrID values to output
cudaGraphDebugDotFlagsHandles = 1<<10
    Adds node handles and every kernel function handle to output
cudaGraphDebugDotFlagsConditionalNodeParams = 1<<15
    Adds cudaConditionalNodeParams to output

enum cudaGraphDependencyType


Type annotations that can be applied to graph edges as part of cudaGraphEdgeData.

######  Values

cudaGraphDependencyTypeDefault = 0
    This is an ordinary dependency.
cudaGraphDependencyTypeProgrammatic = 1
    This dependency type allows the downstream node to use `cudaGridDependencySynchronize()`. It may only be used between kernel nodes, and must be used with either the cudaGraphKernelNodePortProgrammatic or cudaGraphKernelNodePortLaunchCompletion outgoing port.

enum cudaGraphExecUpdateResult


CUDA Graph Update error types

######  Values

cudaGraphExecUpdateSuccess = 0x0
    The update succeeded
cudaGraphExecUpdateError = 0x1
    The update failed for an unexpected reason which is described in the return value of the function
cudaGraphExecUpdateErrorTopologyChanged = 0x2
    The update failed because the topology changed
cudaGraphExecUpdateErrorNodeTypeChanged = 0x3
    The update failed because a node type changed
cudaGraphExecUpdateErrorFunctionChanged = 0x4
    The update failed because the function of a kernel node changed (CUDA driver < 11.2)
cudaGraphExecUpdateErrorParametersChanged = 0x5
    The update failed because the parameters changed in a way that is not supported
cudaGraphExecUpdateErrorNotSupported = 0x6
    The update failed because something about the node is not supported
cudaGraphExecUpdateErrorUnsupportedFunctionChange = 0x7
    The update failed because the function of a kernel node changed in an unsupported way
cudaGraphExecUpdateErrorAttributesChanged = 0x8
    The update failed because the node attributes changed in a way that is not supported

enum cudaGraphInstantiateFlags


Flags for instantiating a graph

######  Values

cudaGraphInstantiateFlagAutoFreeOnLaunch = 1
    Automatically free memory allocated in a graph before relaunching.
cudaGraphInstantiateFlagUpload = 2
    Automatically upload the graph after instantiation. Only supported by cudaGraphInstantiateWithParams. The upload will be performed using the stream provided in `instantiateParams`.
cudaGraphInstantiateFlagDeviceLaunch = 4
    Instantiate the graph to be launchable from the device. This flag can only be used on platforms which support unified addressing. This flag cannot be used in conjunction with cudaGraphInstantiateFlagAutoFreeOnLaunch.
cudaGraphInstantiateFlagUseNodePriority = 8
    Run the graph using the per-node priority attributes rather than the priority of the stream it is launched into.

enum cudaGraphInstantiateResult


Graph instantiation results

######  Values

cudaGraphInstantiateSuccess = 0
    Instantiation succeeded
cudaGraphInstantiateError = 1
    Instantiation failed for an unexpected reason which is described in the return value of the function
cudaGraphInstantiateInvalidStructure = 2
    Instantiation failed due to invalid structure, such as cycles
cudaGraphInstantiateNodeOperationNotSupported = 3
    Instantiation for device launch failed because the graph contained an unsupported operation
cudaGraphInstantiateMultipleDevicesNotSupported = 4
    Instantiation for device launch failed due to the nodes belonging to different contexts
cudaGraphInstantiateConditionalHandleUnused = 5
    One or more conditional handles are not associated with conditional nodes

enum cudaGraphKernelNodeField


Specifies the field to update when performing multiple node updates from the device

######  Values

cudaGraphKernelNodeFieldInvalid = 0
    Invalid field
cudaGraphKernelNodeFieldGridDim
    Grid dimension update
cudaGraphKernelNodeFieldParam
    Kernel parameter update
cudaGraphKernelNodeFieldEnabled
    Node enable/disable

enum cudaGraphMemAttributeType


Graph memory attributes

######  Values

cudaGraphMemAttrUsedMemCurrent = 0x0
    (value type = cuuint64_t) Amount of memory, in bytes, currently associated with graphs.
cudaGraphMemAttrUsedMemHigh = 0x1
    (value type = cuuint64_t) High watermark of memory, in bytes, associated with graphs since the last time it was reset. High watermark can only be reset to zero.
cudaGraphMemAttrReservedMemCurrent = 0x2
    (value type = cuuint64_t) Amount of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.
cudaGraphMemAttrReservedMemHigh = 0x3
    (value type = cuuint64_t) High watermark of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.

enum cudaGraphNodeType


CUDA Graph node types

######  Values

cudaGraphNodeTypeKernel = 0x00
    GPU kernel node
cudaGraphNodeTypeMemcpy = 0x01
    Memcpy node
cudaGraphNodeTypeMemset = 0x02
    Memset node
cudaGraphNodeTypeHost = 0x03
    Host (executable) node
cudaGraphNodeTypeGraph = 0x04
    Node which executes an embedded graph
cudaGraphNodeTypeEmpty = 0x05
    Empty (no-op) node
cudaGraphNodeTypeWaitEvent = 0x06
    External event wait node
cudaGraphNodeTypeEventRecord = 0x07
    External event record node
cudaGraphNodeTypeExtSemaphoreSignal = 0x08
    External semaphore signal node
cudaGraphNodeTypeExtSemaphoreWait = 0x09
    External semaphore wait node
cudaGraphNodeTypeMemAlloc = 0x0a
    Memory allocation node
cudaGraphNodeTypeMemFree = 0x0b
    Memory free node
cudaGraphNodeTypeConditional = 0x0d
    Conditional nodeMay be used to implement a conditional execution path or loop inside of a graph. The graph(s) contained within the body of the conditional node can be selectively executed or iterated upon based on the value of a conditional variable.Handles must be created in advance of creating the node using cudaGraphConditionalHandleCreate.The following restrictions apply to graphs which contain conditional nodes: The graph cannot be used in a child node. Only one instantiation of the graph may exist at any point in time. The graph cannot be cloned.To set the control value, supply a default value when creating the handle and/or call cudaGraphSetConditional from device code.
cudaGraphNodeTypeCount


enum cudaGraphicsCubeFace


CUDA graphics interop array indices for cube maps

######  Values

cudaGraphicsCubeFacePositiveX = 0x00
    Positive X face of cubemap
cudaGraphicsCubeFaceNegativeX = 0x01
    Negative X face of cubemap
cudaGraphicsCubeFacePositiveY = 0x02
    Positive Y face of cubemap
cudaGraphicsCubeFaceNegativeY = 0x03
    Negative Y face of cubemap
cudaGraphicsCubeFacePositiveZ = 0x04
    Positive Z face of cubemap
cudaGraphicsCubeFaceNegativeZ = 0x05
    Negative Z face of cubemap

enum cudaGraphicsMapFlags


CUDA graphics interop map flags

######  Values

cudaGraphicsMapFlagsNone = 0
    Default; Assume resource can be read/written
cudaGraphicsMapFlagsReadOnly = 1
    CUDA will not write to this resource
cudaGraphicsMapFlagsWriteDiscard = 2
    CUDA will only write to and will not read from this resource

enum cudaGraphicsRegisterFlags


CUDA graphics interop register flags

######  Values

cudaGraphicsRegisterFlagsNone = 0
    Default
cudaGraphicsRegisterFlagsReadOnly = 1
    CUDA will not write to this resource
cudaGraphicsRegisterFlagsWriteDiscard = 2
    CUDA will only write to and will not read from this resource
cudaGraphicsRegisterFlagsSurfaceLoadStore = 4
    CUDA will bind this resource to a surface reference
cudaGraphicsRegisterFlagsTextureGather = 8
    CUDA will perform texture gather operations on this resource

enum cudaJitOption


Online compiler and linker options

######  Values

cudaJitMaxRegisters = 0
    Max number of registers that a thread may use. Option type: unsigned int Applies to: compiler only
cudaJitThreadsPerBlock = 1
    IN: Specifies minimum number of threads per block to target compilation for OUT: Returns the number of threads the compiler actually targeted. This restricts the resource utilization of the compiler (e.g. max registers) such that a block with the given number of threads should be able to launch based on register limitations. Note, this option does not currently take into account any other resource limitations, such as shared memory utilization. Option type: unsigned int Applies to: compiler only
cudaJitWallTime = 2
    Overwrites the option value with the total wall clock time, in milliseconds, spent in the compiler and linker Option type: float Applies to: compiler and linker
cudaJitInfoLogBuffer = 3
    Pointer to a buffer in which to print any log messages that are informational in nature (the buffer size is specified via option cudaJitInfoLogBufferSizeBytes) Option type: char * Applies to: compiler and linker
cudaJitInfoLogBufferSizeBytes = 4
    IN: Log buffer size in bytes. Log messages will be capped at this size (including null terminator) OUT: Amount of log buffer filled with messages Option type: unsigned int Applies to: compiler and linker
cudaJitErrorLogBuffer = 5
    Pointer to a buffer in which to print any log messages that reflect errors (the buffer size is specified via option cudaJitErrorLogBufferSizeBytes) Option type: char * Applies to: compiler and linker
cudaJitErrorLogBufferSizeBytes = 6
    IN: Log buffer size in bytes. Log messages will be capped at this size (including null terminator) OUT: Amount of log buffer filled with messages Option type: unsigned int Applies to: compiler and linker
cudaJitOptimizationLevel = 7
    Level of optimizations to apply to generated code (0 - 4), with 4 being the default and highest level of optimizations. Option type: unsigned int Applies to: compiler only
cudaJitFallbackStrategy = 10
    Specifies choice of fallback strategy if matching cubin is not found. Choice is based on supplied cudaJit_Fallback. Option type: unsigned int for enumerated type cudaJit_Fallback Applies to: compiler only
cudaJitGenerateDebugInfo = 11
    Specifies whether to create debug information in output (-g) (0: false, default) Option type: int Applies to: compiler and linker
cudaJitLogVerbose = 12
    Generate verbose log messages (0: false, default) Option type: int Applies to: compiler and linker
cudaJitGenerateLineInfo = 13
    Generate line number information (-lineinfo) (0: false, default) Option type: int Applies to: compiler only
cudaJitCacheMode = 14
    Specifies whether to enable caching explicitly (-dlcm) Choice is based on supplied cudaJit_CacheMode. Option type: unsigned int for enumerated type cudaJit_CacheMode Applies to: compiler only
cudaJitPositionIndependentCode = 30
    Generate position independent code (0: false) Option type: int Applies to: compiler only
cudaJitMinCtaPerSm = 31
    This option hints to the JIT compiler the minimum number of CTAs from the kernel’s grid to be mapped to a SM. This option is ignored when used together with cudaJitMaxRegisters or cudaJitThreadsPerBlock. Optimizations based on this option need cudaJitMaxThreadsPerBlock to be specified as well. For kernels already using PTX directive .minnctapersm, this option will be ignored by default. Use cudaJitOverrideDirectiveValues to let this option take precedence over the PTX directive. Option type: unsigned int Applies to: compiler only
cudaJitMaxThreadsPerBlock = 32
    Maximum number threads in a thread block, computed as the product of the maximum extent specifed for each dimension of the block. This limit is guaranteed not to be exeeded in any invocation of the kernel. Exceeding the the maximum number of threads results in runtime error or kernel launch failure. For kernels already using PTX directive .maxntid, this option will be ignored by default. Use cudaJitOverrideDirectiveValues to let this option take precedence over the PTX directive. Option type: int Applies to: compiler only
cudaJitOverrideDirectiveValues = 33
    This option lets the values specified using cudaJitMaxRegisters, cudaJitThreadsPerBlock, cudaJitMaxThreadsPerBlock and cudaJitMinCtaPerSm take precedence over any PTX directives. (0: Disable, default; 1: Enable) Option type: int Applies to: compiler only

enum cudaJit_CacheMode


Caching modes for dlcm

######  Values

cudaJitCacheOptionNone = 0
    Compile with no -dlcm flag specified
cudaJitCacheOptionCG
    Compile with L1 cache disabled
cudaJitCacheOptionCA
    Compile with L1 cache enabled

enum cudaJit_Fallback


Cubin matching fallback strategies

######  Values

cudaPreferPtx = 0
    Prefer to compile ptx if exact binary match not found
cudaPreferBinary
    Prefer to fall back to compatible binary code if exact match not found

enum cudaLaunchAttributeID


Launch attributes enum; used as id field of cudaLaunchAttribute

######  Values

cudaLaunchAttributeIgnore = 0
    Ignored entry, for convenient composition
cudaLaunchAttributeAccessPolicyWindow = 1
    Valid for streams, graph nodes, launches. See cudaLaunchAttributeValue::accessPolicyWindow.
cudaLaunchAttributeCooperative = 2
    Valid for graph nodes, launches. See cudaLaunchAttributeValue::cooperative.
cudaLaunchAttributeSynchronizationPolicy = 3
    Valid for streams. See cudaLaunchAttributeValue::syncPolicy.
cudaLaunchAttributeClusterDimension = 4
    Valid for graph nodes, launches. See cudaLaunchAttributeValue::clusterDim.
cudaLaunchAttributeClusterSchedulingPolicyPreference = 5
    Valid for graph nodes, launches. See cudaLaunchAttributeValue::clusterSchedulingPolicyPreference.
cudaLaunchAttributeProgrammaticStreamSerialization = 6
    Valid for launches. Setting cudaLaunchAttributeValue::programmaticStreamSerializationAllowed to non-0 signals that the kernel will use programmatic means to resolve its stream dependency, so that the CUDA runtime should opportunistically allow the grid's execution to overlap with the previous kernel in the stream, if that kernel requests the overlap. The dependent launches can choose to wait on the dependency using the programmatic sync (cudaGridDependencySynchronize() or equivalent PTX instructions).
cudaLaunchAttributeProgrammaticEvent = 7
    Valid for launches. Set cudaLaunchAttributeValue::programmaticEvent to record the event. Event recorded through this launch attribute is guaranteed to only trigger after all block in the associated kernel trigger the event. A block can trigger the event programmatically in a future CUDA release. A trigger can also be inserted at the beginning of each block's execution if triggerAtBlockStart is set to non-0. The dependent launches can choose to wait on the dependency using the programmatic sync (cudaGridDependencySynchronize() or equivalent PTX instructions). Note that dependents (including the CPU thread calling cudaEventSynchronize()) are not guaranteed to observe the release precisely when it is released. For example, cudaEventSynchronize() may only observe the event trigger long after the associated kernel has completed. This recording type is primarily meant for establishing programmatic dependency between device tasks. Note also this type of dependency allows, but does not guarantee, concurrent execution of tasks. The event supplied must not be an interprocess or interop event. The event must disable timing (i.e. must be created with the cudaEventDisableTiming flag set).
cudaLaunchAttributePriority = 8
    Valid for streams, graph nodes, launches. See cudaLaunchAttributeValue::priority.
cudaLaunchAttributeMemSyncDomainMap = 9
    Valid for streams, graph nodes, launches. See cudaLaunchAttributeValue::memSyncDomainMap.
cudaLaunchAttributeMemSyncDomain = 10
    Valid for streams, graph nodes, launches. See cudaLaunchAttributeValue::memSyncDomain.
cudaLaunchAttributePreferredClusterDimension = 11
    Valid for graph nodes and launches. Set cudaLaunchAttributeValue::preferredClusterDim to allow the kernel launch to specify a preferred substitute cluster dimension. Blocks may be grouped according to either the dimensions specified with this attribute (grouped into a "preferred substitute cluster"), or the one specified with cudaLaunchAttributeClusterDimension attribute (grouped into a "regular cluster"). The cluster dimensions of a "preferred substitute cluster" shall be an integer multiple greater than zero of the regular cluster dimensions. The device will attempt - on a best-effort basis - to group thread blocks into preferred clusters over grouping them into regular clusters. When it deems necessary (primarily when the device temporarily runs out of physical resources to launch the larger preferred clusters), the device may switch to launch the regular clusters instead to attempt to utilize as much of the physical device resources as possible. Each type of cluster will have its enumeration / coordinate setup as if the grid consists solely of its type of cluster. For example, if the preferred substitute cluster dimensions double the regular cluster dimensions, there might be simultaneously a regular cluster indexed at (1,0,0), and a preferred cluster indexed at (1,0,0). In this example, the preferred substitute cluster (1,0,0) replaces regular clusters (2,0,0) and (3,0,0) and groups their blocks. This attribute will only take effect when a regular cluster dimension has been specified. The preferred substitute cluster dimension must be an integer multiple greater than zero of the regular cluster dimension and must divide the grid. It must also be no more than `maxBlocksPerCluster`, if it is set in the kernel's `__launch_bounds__`. Otherwise it must be less than the maximum value the driver can support. Otherwise, setting this attribute to a value physically unable to fit on any particular device is permitted.
cudaLaunchAttributeLaunchCompletionEvent = 12
    Valid for launches. Set cudaLaunchAttributeValue::launchCompletionEvent to record the event. Nominally, the event is triggered once all blocks of the kernel have begun execution. Currently this is a best effort. If a kernel B has a launch completion dependency on a kernel A, B may wait until A is complete. Alternatively, blocks of B may begin before all blocks of A have begun, for example if B can claim execution resources unavailable to A (e.g. they run on different GPUs) or if B is a higher priority than A. Exercise caution if such an ordering inversion could lead to deadlock. A launch completion event is nominally similar to a programmatic event with `triggerAtBlockStart` set except that it is not visible to `cudaGridDependencySynchronize()` and can be used with compute capability less than 9.0. The event supplied must not be an interprocess or interop event. The event must disable timing (i.e. must be created with the cudaEventDisableTiming flag set).
cudaLaunchAttributeDeviceUpdatableKernelNode = 13
    Valid for graph nodes, launches. This attribute is graphs-only, and passing it to a launch in a non-capturing stream will result in an error. :cudaLaunchAttributeValue::deviceUpdatableKernelNode::deviceUpdatable can only be set to 0 or 1. Setting the field to 1 indicates that the corresponding kernel node should be device-updatable. On success, a handle will be returned via cudaLaunchAttributeValue::deviceUpdatableKernelNode::devNode which can be passed to the various device-side update functions to update the node's kernel parameters from within another kernel. For more information on the types of device updates that can be made, as well as the relevant limitations thereof, see cudaGraphKernelNodeUpdatesApply. Nodes which are device-updatable have additional restrictions compared to regular kernel nodes. Firstly, device-updatable nodes cannot be removed from their graph via cudaGraphDestroyNode. Additionally, once opted-in to this functionality, a node cannot opt out, and any attempt to set the deviceUpdatable attribute to 0 will result in an error. Device-updatable kernel nodes also cannot have their attributes copied to/from another kernel node via cudaGraphKernelNodeCopyAttributes. Graphs containing one or more device-updatable nodes also do not allow multiple instantiation, and neither the graph nor its instantiated version can be passed to cudaGraphExecUpdate. If a graph contains device-updatable nodes and updates those nodes from the device from within the graph, the graph must be uploaded with cuGraphUpload before it is launched. For such a graph, if host-side executable graph updates are made to the device-updatable nodes, the graph must be uploaded before it is launched again.
cudaLaunchAttributePreferredSharedMemoryCarveout = 14
    Valid for launches. On devices where the L1 cache and shared memory use the same hardware resources, setting cudaLaunchAttributeValue::sharedMemCarveout to a percentage between 0-100 signals sets the shared memory carveout preference in percent of the total shared memory for that kernel launch. This attribute takes precedence over cudaFuncAttributePreferredSharedMemoryCarveout. This is only a hint, and the driver can choose a different configuration if required for the launch.
cudaLaunchAttributeNvlinkUtilCentricScheduling = 16
    Valid for streams, graph nodes, launches. This attribute is a hint to the CUDA runtime that the launch should attempt to make the kernel maximize its NVLINK utilization. When possible to honor this hint, CUDA will assume each block in the grid launch will carry out an even amount of NVLINK traffic, and make a best-effort attempt to adjust the kernel launch based on that assumption. This attribute is a hint only. CUDA makes no functional or performance guarantee. Its applicability can be affected by many different factors, including driver version (i.e. CUDA doesn't guarantee the performance characteristics will be maintained between driver versions or a driver update could alter or regress previously observed perf characteristics.) It also doesn't guarantee a successful result, i.e. applying the attribute may not improve the performance of either the targeted kernel or the encapsulating application. Valid values for cudaLaunchAttributeValue::nvlinkUtilCentricScheduling are 0 (disabled) and 1 (enabled).

enum cudaLaunchMemSyncDomain


Memory Synchronization Domain

A kernel can be launched in a specified memory synchronization domain that affects all memory operations issued by that kernel. A memory barrier issued in one domain will only order memory operations in that domain, thus eliminating latency increase from memory barriers ordering unrelated traffic.

By default, kernels are launched in domain 0. Kernel launched with cudaLaunchMemSyncDomainRemote will have a different domain ID. User may also alter the domain ID with cudaLaunchMemSyncDomainMap for a specific stream / graph node / kernel launch. See cudaLaunchAttributeMemSyncDomain, cudaStreamSetAttribute, cudaLaunchKernelEx, cudaGraphKernelNodeSetAttribute.

Memory operations done in kernels launched in different domains are considered system-scope distanced. In other words, a GPU scoped memory synchronization is not sufficient for memory order to be observed by kernels in another memory synchronization domain even if they are on the same GPU.

######  Values

cudaLaunchMemSyncDomainDefault = 0
    Launch kernels in the default domain
cudaLaunchMemSyncDomainRemote = 1
    Launch kernels in the remote domain

enum cudaLibraryOption


Library options to be specified with cudaLibraryLoadData() or cudaLibraryLoadFromFile()

######  Values

cudaLibraryHostUniversalFunctionAndDataTable = 0

cudaLibraryBinaryIsPreserved = 1
    Specifes that the argument `code` passed to cudaLibraryLoadData() will be preserved. Specifying this option will let the driver know that `code` can be accessed at any point until cudaLibraryUnload(). The default behavior is for the driver to allocate and maintain its own copy of `code`. Note that this is only a memory usage optimization hint and the driver can choose to ignore it if required. Specifying this option with cudaLibraryLoadFromFile() is invalid and will return cudaErrorInvalidValue.

enum cudaLimit


CUDA Limits

######  Values

cudaLimitStackSize = 0x00
    GPU thread stack size
cudaLimitPrintfFifoSize = 0x01
    GPU printf FIFO size
cudaLimitMallocHeapSize = 0x02
    GPU malloc heap size
cudaLimitDevRuntimeSyncDepth = 0x03
    GPU device runtime synchronize depth
cudaLimitDevRuntimePendingLaunchCount = 0x04
    GPU device runtime pending launch count
cudaLimitMaxL2FetchGranularity = 0x05
    A value between 0 and 128 that indicates the maximum fetch granularity of L2 (in Bytes). This is a hint
cudaLimitPersistingL2CacheSize = 0x06
    A size in bytes for L2 persisting lines cache size

enum cudaMemAccessFlags


Specifies the memory protection flags for mapping.

######  Values

cudaMemAccessFlagsProtNone = 0
    Default, make the address range not accessible
cudaMemAccessFlagsProtRead = 1
    Make the address range read accessible
cudaMemAccessFlagsProtReadWrite = 3
    Make the address range read-write accessible

enum cudaMemAllocationHandleType


Flags for specifying particular handle types

######  Values

cudaMemHandleTypeNone = 0x0
    Does not allow any export mechanism. >
cudaMemHandleTypePosixFileDescriptor = 0x1
    Allows a file descriptor to be used for exporting. Permitted only on POSIX systems. (int)
cudaMemHandleTypeWin32 = 0x2
    Allows a Win32 NT handle to be used for exporting. (HANDLE)
cudaMemHandleTypeWin32Kmt = 0x4
    Allows a Win32 KMT handle to be used for exporting. (D3DKMT_HANDLE)
cudaMemHandleTypeFabric = 0x8
    Allows a fabric handle to be used for exporting. (cudaMemFabricHandle_t)

enum cudaMemAllocationType


Defines the allocation types available

######  Values

cudaMemAllocationTypeInvalid = 0x0

cudaMemAllocationTypePinned = 0x1
    This allocation type is 'pinned', i.e. cannot migrate from its current location while the application is actively using it
cudaMemAllocationTypeManaged = 0x2
    This allocation type is managed memory
cudaMemAllocationTypeMax = 0x7FFFFFFF


enum cudaMemLocationType


Specifies the type of location

######  Values

cudaMemLocationTypeInvalid = 0

cudaMemLocationTypeNone = 0
    Location is unspecified. This is used when creating a managed memory pool to indicate no preferred location for the pool
cudaMemLocationTypeDevice = 1
    Location is a device location, thus id is a device ordinal
cudaMemLocationTypeHost = 2
    Location is host, id is ignored
cudaMemLocationTypeHostNuma = 3
    Location is a host NUMA node, thus id is a host NUMA node id
cudaMemLocationTypeHostNumaCurrent = 4
    Location is the host NUMA node closest to the current thread's CPU, id is ignored

enum cudaMemPoolAttr


CUDA memory pool attributes

######  Values

cudaMemPoolReuseFollowEventDependencies = 0x1
    (value type = int) Allow cuMemAllocAsync to use memory asynchronously freed in another streams as long as a stream ordering dependency of the allocating stream on the free action exists. Cuda events and null stream interactions can create the required stream ordered dependencies. (default enabled)
cudaMemPoolReuseAllowOpportunistic = 0x2
    (value type = int) Allow reuse of already completed frees when there is no dependency between the free and allocation. (default enabled)
cudaMemPoolReuseAllowInternalDependencies = 0x3
    (value type = int) Allow cuMemAllocAsync to insert new stream dependencies in order to establish the stream ordering required to reuse a piece of memory released by cuFreeAsync (default enabled).
cudaMemPoolAttrReleaseThreshold = 0x4
    (value type = cuuint64_t) Amount of reserved memory in bytes to hold onto before trying to release memory back to the OS. When more than the release threshold bytes of memory are held by the memory pool, the allocator will try to release memory back to the OS on the next call to stream, event or context synchronize. (default 0)
cudaMemPoolAttrReservedMemCurrent = 0x5
    (value type = cuuint64_t) Amount of backing memory currently allocated for the mempool.
cudaMemPoolAttrReservedMemHigh = 0x6
    (value type = cuuint64_t) High watermark of backing memory allocated for the mempool since the last time it was reset. High watermark can only be reset to zero.
cudaMemPoolAttrUsedMemCurrent = 0x7
    (value type = cuuint64_t) Amount of memory from the pool that is currently in use by the application.
cudaMemPoolAttrUsedMemHigh = 0x8
    (value type = cuuint64_t) High watermark of the amount of memory from the pool that was in use by the application since the last time it was reset. High watermark can only be reset to zero.

enum cudaMemRangeAttribute


CUDA range attributes

######  Values

cudaMemRangeAttributeReadMostly = 1
    Whether the range will mostly be read and only occassionally be written to
cudaMemRangeAttributePreferredLocation = 2
    The preferred location of the range
cudaMemRangeAttributeAccessedBy = 3
    Memory range has cudaMemAdviseSetAccessedBy set for specified device
cudaMemRangeAttributeLastPrefetchLocation = 4
    The last location to which the range was prefetched
cudaMemRangeAttributePreferredLocationType = 5
    The preferred location type of the range
cudaMemRangeAttributePreferredLocationId = 6
    The preferred location id of the range
cudaMemRangeAttributeLastPrefetchLocationType = 7
    The last location type to which the range was prefetched
cudaMemRangeAttributeLastPrefetchLocationId = 8
    The last location id to which the range was prefetched

enum cudaMemcpy3DOperandType


These flags allow applications to convey the operand type for individual copies specified in cudaMemcpy3DBatchAsync.

######  Values

cudaMemcpyOperandTypePointer = 0x1
    Memcpy operand is a valid pointer.
cudaMemcpyOperandTypeArray = 0x2
    Memcpy operand is a CUarray.
cudaMemcpyOperandTypeMax = 0x7FFFFFFF


enum cudaMemcpyFlags


Flags to specify for copies within a batch. For more details see cudaMemcpyBatchAsync.

######  Values

cudaMemcpyFlagDefault = 0x0

cudaMemcpyFlagPreferOverlapWithCompute = 0x1
    Hint to the driver to try and overlap the copy with compute work on the SMs.

enum cudaMemcpyKind


CUDA memory copy types

######  Values

cudaMemcpyHostToHost = 0
    Host -> Host
cudaMemcpyHostToDevice = 1
    Host -> Device
cudaMemcpyDeviceToHost = 2
    Device -> Host
cudaMemcpyDeviceToDevice = 3
    Device -> Device
cudaMemcpyDefault = 4
    Direction of the transfer is inferred from the pointer values. Requires unified virtual addressing

enum cudaMemoryAdvise


CUDA Memory Advise values

######  Values

cudaMemAdviseSetReadMostly = 1
    Data will mostly be read and only occassionally be written to
cudaMemAdviseUnsetReadMostly = 2
    Undo the effect of cudaMemAdviseSetReadMostly
cudaMemAdviseSetPreferredLocation = 3
    Set the preferred location for the data as the specified device
cudaMemAdviseUnsetPreferredLocation = 4
    Clear the preferred location for the data
cudaMemAdviseSetAccessedBy = 5
    Data will be accessed by the specified device, so prevent page faults as much as possible
cudaMemAdviseUnsetAccessedBy = 6
    Let the Unified Memory subsystem decide on the page faulting policy for the specified device

enum cudaMemoryType


CUDA memory types

######  Values

cudaMemoryTypeUnregistered = 0
    Unregistered memory
cudaMemoryTypeHost = 1
    Host memory
cudaMemoryTypeDevice = 2
    Device memory
cudaMemoryTypeManaged = 3
    Managed memory

enum cudaResourceType


CUDA resource types

######  Values

cudaResourceTypeArray = 0x00
    Array resource
cudaResourceTypeMipmappedArray = 0x01
    Mipmapped array resource
cudaResourceTypeLinear = 0x02
    Linear resource
cudaResourceTypePitch2D = 0x03
    Pitch 2D resource

enum cudaResourceViewFormat


CUDA texture resource view formats

######  Values

cudaResViewFormatNone = 0x00
    No resource view format (use underlying resource format)
cudaResViewFormatUnsignedChar1 = 0x01
    1 channel unsigned 8-bit integers
cudaResViewFormatUnsignedChar2 = 0x02
    2 channel unsigned 8-bit integers
cudaResViewFormatUnsignedChar4 = 0x03
    4 channel unsigned 8-bit integers
cudaResViewFormatSignedChar1 = 0x04
    1 channel signed 8-bit integers
cudaResViewFormatSignedChar2 = 0x05
    2 channel signed 8-bit integers
cudaResViewFormatSignedChar4 = 0x06
    4 channel signed 8-bit integers
cudaResViewFormatUnsignedShort1 = 0x07
    1 channel unsigned 16-bit integers
cudaResViewFormatUnsignedShort2 = 0x08
    2 channel unsigned 16-bit integers
cudaResViewFormatUnsignedShort4 = 0x09
    4 channel unsigned 16-bit integers
cudaResViewFormatSignedShort1 = 0x0a
    1 channel signed 16-bit integers
cudaResViewFormatSignedShort2 = 0x0b
    2 channel signed 16-bit integers
cudaResViewFormatSignedShort4 = 0x0c
    4 channel signed 16-bit integers
cudaResViewFormatUnsignedInt1 = 0x0d
    1 channel unsigned 32-bit integers
cudaResViewFormatUnsignedInt2 = 0x0e
    2 channel unsigned 32-bit integers
cudaResViewFormatUnsignedInt4 = 0x0f
    4 channel unsigned 32-bit integers
cudaResViewFormatSignedInt1 = 0x10
    1 channel signed 32-bit integers
cudaResViewFormatSignedInt2 = 0x11
    2 channel signed 32-bit integers
cudaResViewFormatSignedInt4 = 0x12
    4 channel signed 32-bit integers
cudaResViewFormatHalf1 = 0x13
    1 channel 16-bit floating point
cudaResViewFormatHalf2 = 0x14
    2 channel 16-bit floating point
cudaResViewFormatHalf4 = 0x15
    4 channel 16-bit floating point
cudaResViewFormatFloat1 = 0x16
    1 channel 32-bit floating point
cudaResViewFormatFloat2 = 0x17
    2 channel 32-bit floating point
cudaResViewFormatFloat4 = 0x18
    4 channel 32-bit floating point
cudaResViewFormatUnsignedBlockCompressed1 = 0x19
    Block compressed 1
cudaResViewFormatUnsignedBlockCompressed2 = 0x1a
    Block compressed 2
cudaResViewFormatUnsignedBlockCompressed3 = 0x1b
    Block compressed 3
cudaResViewFormatUnsignedBlockCompressed4 = 0x1c
    Block compressed 4 unsigned
cudaResViewFormatSignedBlockCompressed4 = 0x1d
    Block compressed 4 signed
cudaResViewFormatUnsignedBlockCompressed5 = 0x1e
    Block compressed 5 unsigned
cudaResViewFormatSignedBlockCompressed5 = 0x1f
    Block compressed 5 signed
cudaResViewFormatUnsignedBlockCompressed6H = 0x20
    Block compressed 6 unsigned half-float
cudaResViewFormatSignedBlockCompressed6H = 0x21
    Block compressed 6 signed half-float
cudaResViewFormatUnsignedBlockCompressed7 = 0x22
    Block compressed 7

enum cudaSharedCarveout


Shared memory carveout configurations. These may be passed to cudaFuncSetAttribute

######  Values

cudaSharedmemCarveoutDefault = -1
    No preference for shared memory or L1 (default)
cudaSharedmemCarveoutMaxShared = 100
    Prefer maximum available shared memory, minimum L1 cache
cudaSharedmemCarveoutMaxL1 = 0
    Prefer maximum available L1 cache, minimum shared memory

enum cudaSharedMemConfig


###### Deprecated

CUDA shared memory configuration

######  Values

cudaSharedMemBankSizeDefault = 0

cudaSharedMemBankSizeFourByte = 1

cudaSharedMemBankSizeEightByte = 2


enum cudaStreamCaptureMode


Possible modes for stream capture thread interactions. For more details see cudaStreamBeginCapture and cudaThreadExchangeStreamCaptureMode

######  Values

cudaStreamCaptureModeGlobal = 0

cudaStreamCaptureModeThreadLocal = 1

cudaStreamCaptureModeRelaxed = 2


enum cudaStreamCaptureStatus


Possible stream capture statuses returned by cudaStreamIsCapturing

######  Values

cudaStreamCaptureStatusNone = 0
    Stream is not capturing
cudaStreamCaptureStatusActive = 1
    Stream is actively capturing
cudaStreamCaptureStatusInvalidated = 2
    Stream is part of a capture sequence that has been invalidated, but not terminated

enum cudaStreamUpdateCaptureDependenciesFlags


Flags for cudaStreamUpdateCaptureDependencies

######  Values

cudaStreamAddCaptureDependencies = 0x0
    Add new nodes to the dependency set
cudaStreamSetCaptureDependencies = 0x1
    Replace the dependency set with the new nodes

enum cudaSurfaceBoundaryMode


CUDA Surface boundary modes

######  Values

cudaBoundaryModeZero = 0
    Zero boundary mode
cudaBoundaryModeClamp = 1
    Clamp boundary mode
cudaBoundaryModeTrap = 2
    Trap boundary mode

enum cudaSurfaceFormatMode


CUDA Surface format modes

######  Values

cudaFormatModeForced = 0
    Forced format mode
cudaFormatModeAuto = 1
    Auto format mode

enum cudaTextureAddressMode


CUDA texture address modes

######  Values

cudaAddressModeWrap = 0
    Wrapping address mode
cudaAddressModeClamp = 1
    Clamp to edge address mode
cudaAddressModeMirror = 2
    Mirror address mode
cudaAddressModeBorder = 3
    Border address mode

enum cudaTextureFilterMode


CUDA texture filter modes

######  Values

cudaFilterModePoint = 0
    Point filter mode
cudaFilterModeLinear = 1
    Linear filter mode

enum cudaTextureReadMode


CUDA texture read modes

######  Values

cudaReadModeElementType = 0
    Read texture as specified element type
cudaReadModeNormalizedFloat = 1
    Read texture as normalized float

enum cudaUserObjectFlags


Flags for user objects for graphs

######  Values

cudaUserObjectNoDestructorSync = 0x1
    Indicates the destructor execution is not synchronized by any CUDA handle.

enum cudaUserObjectRetainFlags


Flags for retaining user object references for graphs

######  Values

cudaGraphUserObjectMove = 0x1
    Transfer references from the caller rather than creating new references.

* * *

!


Copyright © 2025 NVIDIA Corporation