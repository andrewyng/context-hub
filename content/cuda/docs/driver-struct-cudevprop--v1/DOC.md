---
name: driver-struct-cudevprop--v1
description: '**Source:** structCUdevprop__v1.html#structCUdevprop__v1'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.52. CUdevprop_v1

**Source:** structCUdevprop__v1.html#structCUdevprop__v1


### Public Variables

int SIMDWidth

int clockRate

int maxGridSize[3]

int maxThreadsDim[3]

int maxThreadsPerBlock

int memPitch

int regsPerBlock

int sharedMemPerBlock

int textureAlign

int totalConstantMemory


### Variables

int CUdevprop_v1::SIMDWidth


Warp size in threads

int CUdevprop_v1::clockRate


Clock frequency in kilohertz

int CUdevprop_v1::maxGridSize[3]


Maximum size of each dimension of a grid

int CUdevprop_v1::maxThreadsDim[3]


Maximum size of each dimension of a block

int CUdevprop_v1::maxThreadsPerBlock


Maximum number of threads per block

int CUdevprop_v1::memPitch


Maximum pitch in bytes allowed by memory copies

int CUdevprop_v1::regsPerBlock


32-bit registers available per block

int CUdevprop_v1::sharedMemPerBlock


Shared memory available per block in bytes

int CUdevprop_v1::textureAlign


Alignment requirement for textures

int CUdevprop_v1::totalConstantMemory


Constant memory available on device in bytes

