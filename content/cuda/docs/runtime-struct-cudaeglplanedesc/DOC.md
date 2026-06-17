---
name: runtime-struct-cudaeglplanedesc
description: '**Source:** structcudaEglPlaneDesc.html#structcudaEglPlaneDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.16. cudaEglPlaneDesc

**Source:** structcudaEglPlaneDesc.html#structcudaEglPlaneDesc


### Public Variables

struct cudaChannelFormatDesc channelDesc

unsigned int depth

unsigned int height

unsigned int numChannels

unsigned int pitch

unsigned int reserved[4]

unsigned int width


### Variables

struct cudaChannelFormatDesccudaEglPlaneDesc::channelDesc


Channel Format Descriptor

unsigned int cudaEglPlaneDesc::depth


Depth of plane

unsigned int cudaEglPlaneDesc::height


Height of plane

unsigned int cudaEglPlaneDesc::numChannels


Number of channels for the plane

unsigned int cudaEglPlaneDesc::pitch


Pitch of plane

unsigned int cudaEglPlaneDesc::reserved[4]


Reserved for future use

unsigned int cudaEglPlaneDesc::width


Width of plane

* * *

!


Copyright © 2025 NVIDIA Corporation