---
name: runtime-struct-cudaeglframe
description: '**Source:** structcudaEglFrame.html#structcudaEglFrame'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.15. cudaEglFrame

**Source:** structcudaEglFrame.html#structcudaEglFrame


### Public Variables

cudaEglColorFormat eglColorFormat

cudaEglFrameType frameType

cudaArray_t pArray[CUDA_EGL_MAX_PLANES]

struct cudaPitchedPtr pPitch[CUDA_EGL_MAX_PLANES]

unsigned int planeCount

struct cudaEglPlaneDesc planeDesc[CUDA_EGL_MAX_PLANES]


### Variables

cudaEglColorFormatcudaEglFrame::eglColorFormat


CUDA EGL Color Format

cudaEglFrameTypecudaEglFrame::frameType


Array or Pitch

cudaArray_tcudaEglFrame::pArray[CUDA_EGL_MAX_PLANES]


Array of CUDA arrays corresponding to each plane

struct cudaPitchedPtrcudaEglFrame::pPitch[CUDA_EGL_MAX_PLANES]


Array of Pointers corresponding to each plane

unsigned int cudaEglFrame::planeCount


Number of planes

struct cudaEglPlaneDesccudaEglFrame::planeDesc[CUDA_EGL_MAX_PLANES]


CUDA EGL Plane Descriptor cudaEglPlaneDesc

* * *

!


Copyright © 2025 NVIDIA Corporation