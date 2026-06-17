---
name: driver-types
description: '**Source:** group__CUDA__TYPES.html'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# Next >

**Source:** group__CUDA__TYPES.html


### Classes

struct

CUDA_ARRAY3D_DESCRIPTOR_v2


struct

CUDA_ARRAY_DESCRIPTOR_v2


struct

CUDA_ARRAY_MEMORY_REQUIREMENTS_v1


struct

CUDA_ARRAY_SPARSE_PROPERTIES_v1


struct

CUDA_BATCH_MEM_OP_NODE_PARAMS_v1


struct

CUDA_BATCH_MEM_OP_NODE_PARAMS_v2


struct

CUDA_CHILD_GRAPH_NODE_PARAMS


struct

CUDA_CONDITIONAL_NODE_PARAMS


struct

CUDA_EVENT_RECORD_NODE_PARAMS


struct

CUDA_EVENT_WAIT_NODE_PARAMS


struct

CUDA_EXTERNAL_MEMORY_BUFFER_DESC_v1


struct

CUDA_EXTERNAL_MEMORY_HANDLE_DESC_v1


struct

CUDA_EXTERNAL_MEMORY_MIPMAPPED_ARRAY_DESC_v1


struct

CUDA_EXTERNAL_SEMAPHORE_HANDLE_DESC_v1


struct

CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS_v1


struct

CUDA_EXTERNAL_SEMAPHORE_WAIT_PARAMS_v1


struct

CUDA_EXT_SEM_SIGNAL_NODE_PARAMS_v1


struct

CUDA_EXT_SEM_SIGNAL_NODE_PARAMS_v2


struct

CUDA_EXT_SEM_WAIT_NODE_PARAMS_v1


struct

CUDA_EXT_SEM_WAIT_NODE_PARAMS_v2


struct

CUDA_GRAPH_INSTANTIATE_PARAMS


struct

CUDA_HOST_NODE_PARAMS_v1


struct

CUDA_HOST_NODE_PARAMS_v2


struct

CUDA_KERNEL_NODE_PARAMS_v1


struct

CUDA_KERNEL_NODE_PARAMS_v2


struct

CUDA_KERNEL_NODE_PARAMS_v3


struct

CUDA_LAUNCH_PARAMS_v1


struct

CUDA_MEMCPY2D_v2


struct

CUDA_MEMCPY3D_PEER_v1


struct

CUDA_MEMCPY3D_v2


struct

CUDA_MEMCPY_NODE_PARAMS


struct

CUDA_MEMSET_NODE_PARAMS_v1


struct

CUDA_MEMSET_NODE_PARAMS_v2


struct

CUDA_MEM_ALLOC_NODE_PARAMS_v1


struct

CUDA_MEM_ALLOC_NODE_PARAMS_v2


struct

CUDA_MEM_FREE_NODE_PARAMS


struct

CUDA_POINTER_ATTRIBUTE_P2P_TOKENS_v1


struct

CUDA_RESOURCE_DESC_v1


struct

CUDA_RESOURCE_VIEW_DESC_v1


struct

CUDA_TEXTURE_DESC_v1


struct

CUaccessPolicyWindow_v1


struct

CUarrayMapInfo_v1


struct

CUasyncNotificationInfo


struct

CUcheckpointCheckpointArgs


struct

CUcheckpointGpuPair


struct

CUcheckpointLockArgs


struct

CUcheckpointRestoreArgs


struct

CUcheckpointUnlockArgs


struct

CUctxCigParam


struct

CUctxCreateParams


struct

CUdevprop_v1


struct

CUeglFrame_v1


struct

CUexecAffinityParam_v1


struct

CUexecAffinitySmCount_v1


struct

CUextent3D_v1


struct

CUgraphEdgeData


struct

CUgraphExecUpdateResultInfo_v1


struct

CUgraphNodeParams


struct

CUipcEventHandle_v1


struct

CUipcMemHandle_v1


struct

CUlaunchAttribute


union

CUlaunchAttributeValue


struct

CUlaunchConfig


struct

CUlaunchMemSyncDomainMap


struct

CUmemAccessDesc_v1


struct

CUmemAllocationProp_v1


struct

CUmemFabricHandle_v1


struct

CUmemLocation_v1


struct

CUmemPoolProps_v1


struct

CUmemPoolPtrExportData_v1


struct

CUmemcpy3DOperand_v1


struct

CUmemcpyAttributes_v1


struct

CUmulticastObjectProp_v1


struct

CUoffset3D_v1


union

CUstreamBatchMemOpParams_v1


struct

CUtensorMap



### Defines

#define CUDA_ARRAY3D_2DARRAY 0x01

#define CUDA_ARRAY3D_COLOR_ATTACHMENT 0x20

#define CUDA_ARRAY3D_CUBEMAP 0x04

#define CUDA_ARRAY3D_DEFERRED_MAPPING 0x80

#define CUDA_ARRAY3D_DEPTH_TEXTURE 0x10

#define CUDA_ARRAY3D_LAYERED 0x01

#define CUDA_ARRAY3D_SPARSE 0x40

#define CUDA_ARRAY3D_SURFACE_LDST 0x02

#define CUDA_ARRAY3D_TEXTURE_GATHER 0x08

#define CUDA_ARRAY3D_VIDEO_ENCODE_DECODE 0x100

#define CUDA_COOPERATIVE_LAUNCH_MULTI_DEVICE_NO_POST_LAUNCH_SYNC 0x02

#define CUDA_COOPERATIVE_LAUNCH_MULTI_DEVICE_NO_PRE_LAUNCH_SYNC 0x01

#define CUDA_EGL_INFINITE_TIMEOUT 0xFFFFFFFF

#define CUDA_EXTERNAL_MEMORY_DEDICATED 0x1

#define CUDA_EXTERNAL_SEMAPHORE_SIGNAL_SKIP_NVSCIBUF_MEMSYNC 0x01

#define CUDA_EXTERNAL_SEMAPHORE_WAIT_SKIP_NVSCIBUF_MEMSYNC 0x02

#define CUDA_NVSCISYNC_ATTR_SIGNAL 0x1

#define CUDA_NVSCISYNC_ATTR_WAIT 0x2

#define CUDA_VERSION 13010

#define CU_ARRAY_SPARSE_PROPERTIES_SINGLE_MIPTAIL 0x1

#define CU_DEVICE_CPU ((CUdevice)-1)

#define CU_DEVICE_INVALID ((CUdevice)-2)

#define CU_GRAPH_COND_ASSIGN_DEFAULT 0x1

#define CU_GRAPH_KERNEL_NODE_PORT_DEFAULT 0

#define CU_GRAPH_KERNEL_NODE_PORT_LAUNCH_ORDER 2

#define CU_GRAPH_KERNEL_NODE_PORT_PROGRAMMATIC 1

#define CU_IPC_HANDLE_SIZE 64

#define CU_LAUNCH_KERNEL_REQUIRED_BLOCK_DIM 1

#define CU_LAUNCH_PARAM_BUFFER_POINTER

#define CU_LAUNCH_PARAM_BUFFER_POINTER_AS_INT 0x01

#define CU_LAUNCH_PARAM_BUFFER_SIZE

#define CU_LAUNCH_PARAM_BUFFER_SIZE_AS_INT 0x02

#define CU_LAUNCH_PARAM_END

#define CU_LAUNCH_PARAM_END_AS_INT 0x00

#define CU_MEMHOSTALLOC_DEVICEMAP 0x02

#define CU_MEMHOSTALLOC_PORTABLE 0x01

#define CU_MEMHOSTALLOC_WRITECOMBINED 0x04

#define CU_MEMHOSTREGISTER_DEVICEMAP 0x02

#define CU_MEMHOSTREGISTER_IOMEMORY 0x04

#define CU_MEMHOSTREGISTER_PORTABLE 0x01

#define CU_MEMHOSTREGISTER_READ_ONLY 0x08

#define CU_MEM_CREATE_USAGE_HW_DECOMPRESS 0x2

#define CU_MEM_CREATE_USAGE_TILE_POOL 0x1

#define CU_MEM_POOL_CREATE_USAGE_HW_DECOMPRESS 0x2

#define CU_PARAM_TR_DEFAULT -1

#define CU_STREAM_LEGACY ((CUstream)0x1)

#define CU_STREAM_PER_THREAD ((CUstream)0x2)

#define CU_TENSOR_MAP_NUM_QWORDS 16

#define CU_TRSA_OVERRIDE_FORMAT 0x01

#define CU_TRSF_DISABLE_TRILINEAR_OPTIMIZATION 0x20

#define CU_TRSF_NORMALIZED_COORDINATES 0x02

#define CU_TRSF_READ_AS_INTEGER 0x01

#define CU_TRSF_SEAMLESS_CUBEMAP 0x40

#define CU_TRSF_SRGB 0x10

#define MAX_PLANES 3


### Typedefs
