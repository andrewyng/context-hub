---
name: runtime-struct-cudaresourceviewdesc
description: '**Source:** structcudaResourceViewDesc.html#structcudaResourceViewDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.65. cudaResourceViewDesc

**Source:** structcudaResourceViewDesc.html#structcudaResourceViewDesc


### Public Variables

size_t depth

unsigned int firstLayer

unsigned int firstMipmapLevel

enumcudaResourceViewFormat format

size_t height

unsigned int lastLayer

unsigned int lastMipmapLevel

unsigned int reserved[16]

size_t width


### Variables

size_t cudaResourceViewDesc::depth


Depth of the resource view

unsigned int cudaResourceViewDesc::firstLayer


First layer index

unsigned int cudaResourceViewDesc::firstMipmapLevel


First defined mipmap level

enumcudaResourceViewFormatcudaResourceViewDesc::format


Resource view format

size_t cudaResourceViewDesc::height


Height of the resource view

unsigned int cudaResourceViewDesc::lastLayer


Last layer index

unsigned int cudaResourceViewDesc::lastMipmapLevel


Last defined mipmap level

unsigned int cudaResourceViewDesc::reserved[16]


Must be zero

size_t cudaResourceViewDesc::width


Width of the resource view

* * *

!


Copyright © 2025 NVIDIA Corporation