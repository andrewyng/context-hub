---
name: runtime-struct-cudaarraysparseproperties
description: '**Source:** structcudaArraySparseProperties.html#structcudaArraySparseProperties'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.4. cudaArraySparseProperties

**Source:** structcudaArraySparseProperties.html#structcudaArraySparseProperties


### Public Variables

unsigned int depth

unsigned int flags

unsigned int height

unsigned int miptailFirstLevel

unsigned long long miptailSize

unsigned int width


### Variables

unsigned int cudaArraySparseProperties::depth


Tile depth in elements

unsigned int cudaArraySparseProperties::flags


Flags will either be zero or cudaArraySparsePropertiesSingleMipTail

unsigned int cudaArraySparseProperties::height


Tile height in elements

unsigned int cudaArraySparseProperties::miptailFirstLevel


First mip level at which the mip tail begins

unsigned long long cudaArraySparseProperties::miptailSize


Total size of the mip tail.

unsigned int cudaArraySparseProperties::width


Tile width in elements

* * *

!


Copyright © 2025 NVIDIA Corporation