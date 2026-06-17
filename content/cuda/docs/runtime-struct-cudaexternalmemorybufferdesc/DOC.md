---
name: runtime-struct-cudaexternalmemorybufferdesc
description: '**Source:** structcudaExternalMemoryBufferDesc.html#structcudaExternalMemoryBufferDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.20. cudaExternalMemoryBufferDesc

**Source:** structcudaExternalMemoryBufferDesc.html#structcudaExternalMemoryBufferDesc


### Public Variables

unsigned int flags

unsigned long long offset

unsigned int reserved[16]

unsigned long long size


### Variables

unsigned int cudaExternalMemoryBufferDesc::flags


Flags reserved for future use. Must be zero.

unsigned long long cudaExternalMemoryBufferDesc::offset


Offset into the memory object where the buffer's base is

unsigned int cudaExternalMemoryBufferDesc::reserved[16]


Must be zero

unsigned long long cudaExternalMemoryBufferDesc::size


Size of the buffer

* * *

!


Copyright © 2025 NVIDIA Corporation