---
name: runtime-struct-cudaresourcedesc
description: '**Source:** structcudaResourceDesc.html#structcudaResourceDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.64. cudaResourceDesc

**Source:** structcudaResourceDesc.html#structcudaResourceDesc


### Public Variables

cudaArray_t array

struct cudaChannelFormatDesc desc

void * devPtr

unsigned int flags

size_t height

cudaMipmappedArray_t mipmap

size_t pitchInBytes

enumcudaResourceType resType

size_t sizeInBytes

size_t width


### Variables

cudaArray_tcudaResourceDesc::array


CUDA array

struct cudaChannelFormatDesccudaResourceDesc::desc


Channel descriptor

void * cudaResourceDesc::devPtr


Device pointer

unsigned int cudaResourceDesc::flags


Flags (must be zero)

size_t cudaResourceDesc::height


Height of the array in elements

cudaMipmappedArray_tcudaResourceDesc::mipmap


CUDA mipmapped array

size_t cudaResourceDesc::pitchInBytes


Pitch between two rows in bytes

enumcudaResourceTypecudaResourceDesc::resType


Resource type

size_t cudaResourceDesc::sizeInBytes


Size in bytes

size_t cudaResourceDesc::width


Width of the array in elements

* * *

!


Copyright © 2025 NVIDIA Corporation