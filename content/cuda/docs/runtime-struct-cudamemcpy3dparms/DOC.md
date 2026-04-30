---
name: runtime-struct-cudamemcpy3dparms
description: '**Source:** structcudaMemcpy3DParms.html#structcudaMemcpy3DParms'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.50. cudaMemcpy3DParms

**Source:** structcudaMemcpy3DParms.html#structcudaMemcpy3DParms


### Public Variables

cudaArray_t dstArray

struct cudaPos dstPos

struct cudaPitchedPtr dstPtr

struct cudaExtent extent

enumcudaMemcpyKind kind

cudaArray_t srcArray

struct cudaPos srcPos

struct cudaPitchedPtr srcPtr


### Variables

cudaArray_tcudaMemcpy3DParms::dstArray


Destination memory address

struct cudaPoscudaMemcpy3DParms::dstPos


Destination position offset

struct cudaPitchedPtrcudaMemcpy3DParms::dstPtr


Pitched destination memory address

struct cudaExtentcudaMemcpy3DParms::extent


Requested memory copy size

enumcudaMemcpyKindcudaMemcpy3DParms::kind


Type of transfer

cudaArray_tcudaMemcpy3DParms::srcArray


Source memory address

struct cudaPoscudaMemcpy3DParms::srcPos


Source position offset

struct cudaPitchedPtrcudaMemcpy3DParms::srcPtr


Pitched source memory address

* * *

!


Copyright © 2025 NVIDIA Corporation