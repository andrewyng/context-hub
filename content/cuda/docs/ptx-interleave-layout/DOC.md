---
name: ptx-interleave-layout
description: 'Tensor can be interleaved and the following interleave layouts are supported:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.6. Interleave layout

---
title: "5.5.6. Interleave layout"
section: 5.5.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.5.6. Interleave layout


Tensor can be interleaved and the following interleave layouts are supported:

* No interleave (NDHWC)

  * 8 byte interleave (NC/8DHWC8) : C8 utilizes 16 bytes in memory assuming 2B per channel.

  * 16 byte interleave (NC/16HWC16) : C16 utilizes 32 bytes in memory assuming 4B per channel.

The _C_ information is organized in slices where sequential C elements are grouped in 16 byte or 32 byte quantities.

If the total number of channels is not a multiple of the number of channels per slice, then the last slice must be padded with zeros to make it complete 16B or 32B slice.

Interleaved layouts are supported only for the dimensionalities : 3D, 4D and 5D.

The interleave layout is not supported for `.im2col::w` and `.im2col::w::128` modes.