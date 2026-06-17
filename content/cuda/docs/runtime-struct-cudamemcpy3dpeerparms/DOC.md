---
name: runtime-struct-cudamemcpy3dpeerparms
description: '**Source:** structcudaMemcpy3DPeerParms.html#structcudaMemcpy3DPeerParms'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.51. cudaMemcpy3DPeerParms

**Source:** structcudaMemcpy3DPeerParms.html#structcudaMemcpy3DPeerParms


### Public Variables

cudaArray_t dstArray

int dstDevice

struct cudaPos dstPos

struct cudaPitchedPtr dstPtr

struct cudaExtent extent

cudaArray_t srcArray

int srcDevice

struct cudaPos srcPos

struct cudaPitchedPtr srcPtr


### Variables

cudaArray_tcudaMemcpy3DPeerParms::dstArray


Destination memory address

int cudaMemcpy3DPeerParms::dstDevice


Destination device

struct cudaPoscudaMemcpy3DPeerParms::dstPos


Destination position offset

struct cudaPitchedPtrcudaMemcpy3DPeerParms::dstPtr


Pitched destination memory address

struct cudaExtentcudaMemcpy3DPeerParms::extent


Requested memory copy size

cudaArray_tcudaMemcpy3DPeerParms::srcArray


Source memory address

int cudaMemcpy3DPeerParms::srcDevice


Source device

struct cudaPoscudaMemcpy3DPeerParms::srcPos


Source position offset

struct cudaPitchedPtrcudaMemcpy3DPeerParms::srcPtr


Pitched source memory address

* * *

!


Copyright © 2025 NVIDIA Corporation