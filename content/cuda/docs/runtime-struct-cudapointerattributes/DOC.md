---
name: runtime-struct-cudapointerattributes
description: '**Source:** structcudaPointerAttributes.html#structcudaPointerAttributes'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.62. cudaPointerAttributes

**Source:** structcudaPointerAttributes.html#structcudaPointerAttributes


### Public Variables

int device

void * devicePointer

void * hostPointer

long reserved[8]

enumcudaMemoryType type


### Variables

int cudaPointerAttributes::device


The device against which the memory was allocated or registered. If the memory type is cudaMemoryTypeDevice then this identifies the device on which the memory referred physically resides. If the memory type is cudaMemoryTypeHostor::cudaMemoryTypeManaged then this identifies the device which was current when the memory was allocated or registered (and if that device is deinitialized then this allocation will vanish with that device's state).

void * cudaPointerAttributes::devicePointer


The address which may be dereferenced on the current device to access the memory or NULL if no such address exists.

void * cudaPointerAttributes::hostPointer


The address which may be dereferenced on the host to access the memory or NULL if no such address exists.

CUDA doesn't check if unregistered memory is allocated so this field may contain invalid pointer if an invalid pointer has been passed to CUDA.

long cudaPointerAttributes::reserved[8]


Must be zero

enumcudaMemoryTypecudaPointerAttributes::type


The type of memory - cudaMemoryTypeUnregistered, cudaMemoryTypeHost, cudaMemoryTypeDevice or cudaMemoryTypeManaged.

* * *

!


Copyright © 2025 NVIDIA Corporation