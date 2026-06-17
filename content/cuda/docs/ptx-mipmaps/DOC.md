---
name: ptx-mipmaps
description: A _mipmap_ is a sequence of textures, each of which is a progressively
  lower resolution representation of the same image. The height and width of each
  image, or level of detail (LOD), in the mipmap is...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.10.2. Mipmaps

---
title: "9.7.10.2. Mipmaps"
section: 9.7.10.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.10.2. Mipmaps


A _mipmap_ is a sequence of textures, each of which is a progressively lower resolution representation of the same image. The height and width of each image, or level of detail (LOD), in the mipmap is a power of two smaller than the previous level. Mipmaps are used in graphics applications to improve rendering speed and reduce aliasing artifacts. For example, a high-resolution mipmap image is used for objects that are close to the user; lower-resolution images are used as the object appears farther away. Mipmap filtering modes are provided when switching between two levels of detail (LODs) in order to avoid abrupt changes in visual fidelity.

**Example:** If the texture has a basic size of 256 by 256 pixels, then the associated mipmap set may contain a series of eight images, each one-fourth the total area of the previous one: 128x128 pixels, 64x64, 32x32, 16x16, 8x8, 4x4, 2x2, 1x1 (a single pixel). If, for example, a scene is rendering this texture in a space of 40x40 pixels, then either a scaled up version of the 32x32 (without trilinear interpolation) or an interpolation of the 64x64 and the 32x32 mipmaps (with trilinear interpolation) would be used.

The total number of LODs in a complete mipmap pyramid is calculated through the following equation:

numLODs = 1 + floor(log2(max(w, h, d)))

The finest LOD is called the base level and is the 0th level. The next (coarser) level is the 1st level, and so on. The coarsest level is the level of size (1 x 1 x 1). Each successively smaller mipmap level has half the {width, height, depth} of the previous level, but if this half value is a fractional value, it’s rounded down to the next largest integer. Essentially, the size of a mipmap level can be specified as:

max(1, floor(w_b / 2^i)) x
    max(1, floor(h_b / 2^i)) x
    max(1, floor(d_b / 2^i))

where _i_ is the ith level beyond the 0th level (the base level). And _w_b_ , _h_b_ and _d_b_ are the width, height and depth of the base level respectively.

PTX support for mipmaps

The PTX `tex` instruction supports three modes for specifying the LOD: _base_ , _level_ , and _grad_ ient. In base mode, the instruction always picks level 0. In level mode, an additional argument is provided to specify the LOD to fetch from. In gradmode, two floating-point vector arguments provide _partials_ (e.g., `{ds/dx, dt/dx}` and `{ds/dy, dt/dy}` for a 2d texture), which the `tex` instruction uses to compute the LOD.

These instructions provide access to texture memory.

* `tex`  
  
  * `tld4`

  * `txq`