---
name: driver-struct-cuda--array--sparse--properties--v1
description: '**Source:** structCUDA__ARRAY__SPARSE__PROPERTIES__v1.html#structCUDA__ARRAY__SPARSE__PROPERTIES__v1'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.15. CUDA_ARRAY_SPARSE_PROPERTIES_v1

**Source:** structCUDA__ARRAY__SPARSE__PROPERTIES__v1.html#structCUDA__ARRAY__SPARSE__PROPERTIES__v1


### Public Variables

unsigned int depth

unsigned int flags

unsigned int height

unsigned int miptailFirstLevel

unsigned long long miptailSize

unsigned int width


### Variables

unsigned int CUDA_ARRAY_SPARSE_PROPERTIES_v1::depth


Depth of sparse tile in elements

unsigned int CUDA_ARRAY_SPARSE_PROPERTIES_v1::flags


Flags will either be zero or CU_ARRAY_SPARSE_PROPERTIES_SINGLE_MIPTAIL

unsigned int CUDA_ARRAY_SPARSE_PROPERTIES_v1::height


Height of sparse tile in elements

unsigned int CUDA_ARRAY_SPARSE_PROPERTIES_v1::miptailFirstLevel


First mip level at which the mip tail begins.

unsigned long long CUDA_ARRAY_SPARSE_PROPERTIES_v1::miptailSize


Total size of the mip tail.

unsigned int CUDA_ARRAY_SPARSE_PROPERTIES_v1::width


Width of sparse tile in elements

