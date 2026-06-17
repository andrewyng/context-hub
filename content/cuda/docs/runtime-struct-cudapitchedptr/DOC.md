---
name: runtime-struct-cudapitchedptr
description: '**Source:** structcudaPitchedPtr.html#structcudaPitchedPtr'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.61. cudaPitchedPtr

**Source:** structcudaPitchedPtr.html#structcudaPitchedPtr


### Public Variables

size_t pitch

void * ptr

size_t xsize

size_t ysize


### Variables

size_t cudaPitchedPtr::pitch


Pitch of allocated memory in bytes

void * cudaPitchedPtr::ptr


Pointer to allocated memory

size_t cudaPitchedPtr::xsize


Logical width of allocation in elements

size_t cudaPitchedPtr::ysize


Logical height of allocation in elements

* * *

!


Copyright © 2025 NVIDIA Corporation