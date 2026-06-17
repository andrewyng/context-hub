---
name: runtime-struct-cudamemsetparams
description: '**Source:** structcudaMemsetParams.html#structcudaMemsetParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.58. cudaMemsetParams

**Source:** structcudaMemsetParams.html#structcudaMemsetParams


### Public Variables

void * dst

unsigned int elementSize

size_t height

size_t pitch

unsigned int value

size_t width


### Variables

void * cudaMemsetParams::dst


Destination device pointer

unsigned int cudaMemsetParams::elementSize


Size of each element in bytes. Must be 1, 2, or 4.

size_t cudaMemsetParams::height


Number of rows

size_t cudaMemsetParams::pitch


Pitch of destination device pointer. Unused if height is 1

unsigned int cudaMemsetParams::value


Value to be set

size_t cudaMemsetParams::width


Width of the row in elements

* * *

!


Copyright © 2025 NVIDIA Corporation