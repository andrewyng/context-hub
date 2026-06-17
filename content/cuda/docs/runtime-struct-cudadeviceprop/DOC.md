---
name: runtime-struct-cudadeviceprop
description: '**Source:** structcudaDeviceProp.html#structcudaDeviceProp'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.9. cudaDeviceProp

**Source:** structcudaDeviceProp.html#structcudaDeviceProp


### Public Variables

int ECCEnabled

int accessPolicyMaxWindowSize

int asyncEngineCount

int canMapHostMemory

int canUseHostPointerForRegisteredMem

int clusterLaunch

int computePreemptionSupported

int concurrentKernels

int concurrentManagedAccess

int cooperativeLaunch

int deferredMappingCudaArraySupported

int deviceNumaConfig

int deviceNumaId

int directManagedMemAccessFromHost

int globalL1CacheSupported

unsigned int gpuDirectRDMAFlushWritesOptions

int gpuDirectRDMASupported

int gpuDirectRDMAWritesOrdering

unsigned int gpuPciDeviceID

unsigned int gpuPciSubsystemID

int hostNativeAtomicSupported

int hostNumaId

int hostNumaMultinodeIpcSupported

int hostRegisterReadOnlySupported

int hostRegisterSupported

int integrated

int ipcEventSupported

int isMultiGpuBoard

int l2CacheSize

int localL1CacheSupported

char luid[8]

unsigned int luidDeviceNodeMask

int major

int managedMemory

int maxBlocksPerMultiProcessor

int maxGridSize[3]

int maxSurface1D

int maxSurface1DLayered[2]

int maxSurface2D[2]

int maxSurface2DLayered[3]

int maxSurface3D[3]

int maxSurfaceCubemap

int maxSurfaceCubemapLayered[2]

int maxTexture1D

int maxTexture1DLayered[2]

int maxTexture1DMipmap

int maxTexture2D[2]

int maxTexture2DGather[2]

int maxTexture2DLayered[3]

int maxTexture2DLinear[3]

int maxTexture2DMipmap[2]

int maxTexture3D[3]

int maxTexture3DAlt[3]

int maxTextureCubemap

int maxTextureCubemapLayered[2]

int maxThreadsDim[3]

int maxThreadsPerBlock

int maxThreadsPerMultiProcessor

size_t memPitch

int memoryBusWidth

unsigned int memoryPoolSupportedHandleTypes

int memoryPoolsSupported

int minor

int mpsEnabled

int multiGpuBoardGroupID

int multiProcessorCount

char name[256]

int pageableMemoryAccess

int pageableMemoryAccessUsesHostPageTables

int pciBusID

int pciDeviceID

int pciDomainID

int persistingL2CacheMaxSize

int regsPerBlock

int regsPerMultiprocessor

int reserved[56]

size_t reservedSharedMemPerBlock

size_t sharedMemPerBlock

size_t sharedMemPerBlockOptin

size_t sharedMemPerMultiprocessor

int sparseCudaArraySupported

int streamPrioritiesSupported

size_t surfaceAlignment

int tccDriver

size_t textureAlignment

size_t texturePitchAlignment

int timelineSemaphoreInteropSupported

size_t totalConstMem

size_t totalGlobalMem

int unifiedAddressing

int unifiedFunctionPointers

cudaUUID_t uuid

int warpSize


### Variables

int cudaDeviceProp::ECCEnabled


Device has ECC support enabled

int cudaDeviceProp::accessPolicyMaxWindowSize


The maximum value of cudaAccessPolicyWindow::num_bytes.

int cudaDeviceProp::asyncEngineCount


Number of asynchronous engines

int cudaDeviceProp::canMapHostMemory


Device can map host memory with cudaHostAlloc/cudaHostGetDevicePointer

int cudaDeviceProp::canUseHostPointerForRegisteredMem


Device can access host registered memory at the same virtual address as the CPU

int cudaDeviceProp::clusterLaunch


Indicates device supports cluster launch

int cudaDeviceProp::computePreemptionSupported


Device supports Compute Preemption

int cudaDeviceProp::concurrentKernels


Device can possibly execute multiple kernels concurrently

int cudaDeviceProp::concurrentManagedAccess


Device can coherently access managed memory concurrently with the CPU

int cudaDeviceProp::cooperativeLaunch


Device supports launching cooperative kernels via cudaLaunchCooperativeKernel

int cudaDeviceProp::deferredMappingCudaArraySupported


1 if the device supports deferred mapping CUDA arrays and CUDA mipmapped arrays

int cudaDeviceProp::deviceNumaConfig


NUMA configuration of a device: value is of type cudaDeviceNumaConfig enum

int cudaDeviceProp::deviceNumaId


NUMA node ID of the GPU memory

int cudaDeviceProp::directManagedMemAccessFromHost


Host can directly access managed memory on the device without migration.

int cudaDeviceProp::globalL1CacheSupported


Device supports caching globals in L1

unsigned int cudaDeviceProp::gpuDirectRDMAFlushWritesOptions


Bitmask to be interpreted according to the cudaFlushGPUDirectRDMAWritesOptions enum

int cudaDeviceProp::gpuDirectRDMASupported


1 if the device supports GPUDirect RDMA APIs, 0 otherwise

int cudaDeviceProp::gpuDirectRDMAWritesOrdering


See the cudaGPUDirectRDMAWritesOrdering enum for numerical values

unsigned int cudaDeviceProp::gpuPciDeviceID


The combined 16-bit PCI device ID and 16-bit PCI vendor ID

unsigned int cudaDeviceProp::gpuPciSubsystemID


The combined 16-bit PCI subsystem ID and 16-bit PCI subsystem vendor ID

int cudaDeviceProp::hostNativeAtomicSupported


Link between the device and the host supports native atomic operations

int cudaDeviceProp::hostNumaId


NUMA ID of the host node closest to the device or -1 when system does not support NUMA

int cudaDeviceProp::hostNumaMultinodeIpcSupported


1 if the device supports HostNuma location IPC between nodes in a multi-node system.

int cudaDeviceProp::hostRegisterReadOnlySupported


Device supports using the cudaHostRegister flag cudaHostRegisterReadOnly to register memory that must be mapped as read-only to the GPU

int cudaDeviceProp::hostRegisterSupported


Device supports host memory registration via cudaHostRegister.

int cudaDeviceProp::integrated


Device is integrated as opposed to discrete

int cudaDeviceProp::ipcEventSupported


Device supports IPC Events.

int cudaDeviceProp::isMultiGpuBoard


Device is on a multi-GPU board

int cudaDeviceProp::l2CacheSize


Size of L2 cache in bytes

int cudaDeviceProp::localL1CacheSupported


Device supports caching locals in L1

char cudaDeviceProp::luid[8]


8-byte locally unique identifier. Value is undefined on TCC and non-Windows platforms

unsigned int cudaDeviceProp::luidDeviceNodeMask


LUID device node mask. Value is undefined on TCC and non-Windows platforms

int cudaDeviceProp::major


Major compute capability

int cudaDeviceProp::managedMemory


Device supports allocating managed memory on this system

int cudaDeviceProp::maxBlocksPerMultiProcessor


Maximum number of resident blocks per multiprocessor

int cudaDeviceProp::maxGridSize[3]


Maximum size of each dimension of a grid

int cudaDeviceProp::maxSurface1D


Maximum 1D surface size

int cudaDeviceProp::maxSurface1DLayered[2]


Maximum 1D layered surface dimensions

int cudaDeviceProp::maxSurface2D[2]


Maximum 2D surface dimensions

int cudaDeviceProp::maxSurface2DLayered[3]


Maximum 2D layered surface dimensions

int cudaDeviceProp::maxSurface3D[3]


Maximum 3D surface dimensions

int cudaDeviceProp::maxSurfaceCubemap


Maximum Cubemap surface dimensions

int cudaDeviceProp::maxSurfaceCubemapLayered[2]


Maximum Cubemap layered surface dimensions

int cudaDeviceProp::maxTexture1D


Maximum 1D texture size

int cudaDeviceProp::maxTexture1DLayered[2]


Maximum 1D layered texture dimensions

int cudaDeviceProp::maxTexture1DMipmap


Maximum 1D mipmapped texture size

int cudaDeviceProp::maxTexture2D[2]


Maximum 2D texture dimensions

int cudaDeviceProp::maxTexture2DGather[2]


Maximum 2D texture dimensions if texture gather operations have to be performed

int cudaDeviceProp::maxTexture2DLayered[3]


Maximum 2D layered texture dimensions

int cudaDeviceProp::maxTexture2DLinear[3]


Maximum dimensions (width, height, pitch) for 2D textures bound to pitched memory

int cudaDeviceProp::maxTexture2DMipmap[2]


Maximum 2D mipmapped texture dimensions

int cudaDeviceProp::maxTexture3D[3]


Maximum 3D texture dimensions

int cudaDeviceProp::maxTexture3DAlt[3]


Maximum alternate 3D texture dimensions

int cudaDeviceProp::maxTextureCubemap


Maximum Cubemap texture dimensions

int cudaDeviceProp::maxTextureCubemapLayered[2]


Maximum Cubemap layered texture dimensions

int cudaDeviceProp::maxThreadsDim[3]


Maximum size of each dimension of a block

int cudaDeviceProp::maxThreadsPerBlock


Maximum number of threads per block

int cudaDeviceProp::maxThreadsPerMultiProcessor


Maximum resident threads per multiprocessor

size_t cudaDeviceProp::memPitch


Maximum pitch in bytes allowed by memory copies

int cudaDeviceProp::memoryBusWidth


Global memory bus width in bits

unsigned int cudaDeviceProp::memoryPoolSupportedHandleTypes


Bitmask of handle types supported with mempool-based IPC

int cudaDeviceProp::memoryPoolsSupported


1 if the device supports using the cudaMallocAsync and cudaMemPool family of APIs, 0 otherwise

int cudaDeviceProp::minor


Minor compute capability

int cudaDeviceProp::mpsEnabled


Indicates if contexts created on this device will be shared via MPS

int cudaDeviceProp::multiGpuBoardGroupID


Unique identifier for a group of devices on the same multi-GPU board

int cudaDeviceProp::multiProcessorCount


Number of multiprocessors on device

char cudaDeviceProp::name[256]


ASCII string identifying device

int cudaDeviceProp::pageableMemoryAccess


Device supports coherently accessing pageable memory without calling cudaHostRegister on it

int cudaDeviceProp::pageableMemoryAccessUsesHostPageTables


Device accesses pageable memory via the host's page tables

int cudaDeviceProp::pciBusID


PCI bus ID of the device

int cudaDeviceProp::pciDeviceID


PCI device ID of the device

int cudaDeviceProp::pciDomainID


PCI domain ID of the device

int cudaDeviceProp::persistingL2CacheMaxSize


Device's maximum l2 persisting lines capacity setting in bytes

int cudaDeviceProp::regsPerBlock


32-bit registers available per block

int cudaDeviceProp::regsPerMultiprocessor


32-bit registers available per multiprocessor

int cudaDeviceProp::reserved[56]


Reserved for future use

size_t cudaDeviceProp::reservedSharedMemPerBlock


Shared memory reserved by CUDA driver per block in bytes

size_t cudaDeviceProp::sharedMemPerBlock


Shared memory available per block in bytes

size_t cudaDeviceProp::sharedMemPerBlockOptin


Per device maximum shared memory per block usable by special opt in

size_t cudaDeviceProp::sharedMemPerMultiprocessor


Shared memory available per multiprocessor in bytes

int cudaDeviceProp::sparseCudaArraySupported


1 if the device supports sparse CUDA arrays and sparse CUDA mipmapped arrays, 0 otherwise

int cudaDeviceProp::streamPrioritiesSupported


Device supports stream priorities

size_t cudaDeviceProp::surfaceAlignment


Alignment requirements for surfaces

int cudaDeviceProp::tccDriver


1 if device is a Tesla device using TCC driver, 0 otherwise

size_t cudaDeviceProp::textureAlignment


Alignment requirement for textures

size_t cudaDeviceProp::texturePitchAlignment


Pitch alignment requirement for texture references bound to pitched memory

int cudaDeviceProp::timelineSemaphoreInteropSupported


External timeline semaphore interop is supported on the device

size_t cudaDeviceProp::totalConstMem


Constant memory available on device in bytes

size_t cudaDeviceProp::totalGlobalMem


Global memory available on device in bytes

int cudaDeviceProp::unifiedAddressing


Device shares a unified address space with the host

int cudaDeviceProp::unifiedFunctionPointers


Indicates device supports unified pointers

cudaUUID_t cudaDeviceProp::uuid


16-byte unique identifier

int cudaDeviceProp::warpSize


Warp size in threads

* * *

!


Copyright © 2025 NVIDIA Corporation