---
name: runtime-struct-cudaexternalmemorymipmappedarraydesc
description: '**Source:** structcudaExternalMemoryMipmappedArrayDesc.html#structcudaExternalMemoryMipmappedArrayDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.22. cudaExternalMemoryMipmappedArrayDesc

**Source:** structcudaExternalMemoryMipmappedArrayDesc.html#structcudaExternalMemoryMipmappedArrayDesc


### Public Variables

struct cudaExtent extent

unsigned int flags

struct cudaChannelFormatDesc formatDesc

unsigned int numLevels

unsigned long long offset

unsigned int reserved[16]


### Variables

struct cudaExtentcudaExternalMemoryMipmappedArrayDesc::extent


Dimensions of base level of the mipmap chain

unsigned int cudaExternalMemoryMipmappedArrayDesc::flags


Flags associated with CUDA mipmapped arrays. See cudaMallocMipmappedArray

struct cudaChannelFormatDesccudaExternalMemoryMipmappedArrayDesc::formatDesc


Format of base level of the mipmap chain

unsigned int cudaExternalMemoryMipmappedArrayDesc::numLevels


Total number of levels in the mipmap chain

unsigned long long cudaExternalMemoryMipmappedArrayDesc::offset


Offset into the memory object where the base level of the mipmap chain is.

unsigned int cudaExternalMemoryMipmappedArrayDesc::reserved[16]


Must be zero

* * *

!


Copyright © 2025 NVIDIA Corporation