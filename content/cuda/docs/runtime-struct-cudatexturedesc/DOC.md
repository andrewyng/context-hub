---
name: runtime-struct-cudatexturedesc
description: '**Source:** structcudaTextureDesc.html#structcudaTextureDesc'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.66. cudaTextureDesc

**Source:** structcudaTextureDesc.html#structcudaTextureDesc


### Public Variables

enumcudaTextureAddressMode addressMode[3]

float borderColor[4]

int disableTrilinearOptimization

enumcudaTextureFilterMode filterMode

unsigned int maxAnisotropy

float maxMipmapLevelClamp

float minMipmapLevelClamp

enumcudaTextureFilterMode mipmapFilterMode

float mipmapLevelBias

int normalizedCoords

enumcudaTextureReadMode readMode

int sRGB

int seamlessCubemap


### Variables

enumcudaTextureAddressModecudaTextureDesc::addressMode[3]


Texture address mode for up to 3 dimensions

float cudaTextureDesc::borderColor[4]


Texture Border Color

int cudaTextureDesc::disableTrilinearOptimization


Disable any trilinear filtering optimizations.

enumcudaTextureFilterModecudaTextureDesc::filterMode


Texture filter mode

unsigned int cudaTextureDesc::maxAnisotropy


Limit to the anisotropy ratio

float cudaTextureDesc::maxMipmapLevelClamp


Upper end of the mipmap level range to clamp access to

float cudaTextureDesc::minMipmapLevelClamp


Lower end of the mipmap level range to clamp access to

enumcudaTextureFilterModecudaTextureDesc::mipmapFilterMode


Mipmap filter mode

float cudaTextureDesc::mipmapLevelBias


Offset applied to the supplied mipmap level

int cudaTextureDesc::normalizedCoords


Indicates whether texture reads are normalized or not

enumcudaTextureReadModecudaTextureDesc::readMode


Texture read mode

int cudaTextureDesc::sRGB


Perform sRGB->linear conversion during texture read

int cudaTextureDesc::seamlessCubemap


Enable seamless cube map filtering.

* * *

!


Copyright © 2025 NVIDIA Corporation