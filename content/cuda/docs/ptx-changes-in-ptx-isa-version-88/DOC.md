---
name: ptx-changes-in-ptx-isa-version-88
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.3. Changes in PTX ISA Version 8.8

---
title: "13.3. Changes in PTX ISA Version 8.8"
section: 13.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.3. Changes in PTX ISA Version 8.8


New Features

PTX ISA version 8.8 introduces the following new features:

* Adds support for `sm_103` target architecture.

  * Adds support for target `sm_103a` that supports architecture-specific features.

  * Adds support for `sm_121` target architecture.

  * Adds support for target `sm_121a` that supports architecture-specific features.

  * Introduces family-specific target architectures that are represented with “f” suffix. PTX for family-specific targets is compatible with all subsequent targets in same family. Adds support for `sm_100f`, `sm_101f`, `sm_103f`, `sm_120f`, `sm_121f`.

  * Extends `min` and `max` instructions to support three input arguments.

  * Extends `tcgen05.mma` instruction to add support for new `scale_vectorsize` qualifiers `.block16` and `.block32` and K dimension 96.

  * Extends `.field3` of `tensormap.replace` instruction to support 96B swizzle mode.

  * Adds support for `tcgen05.ld.red` instruction.

  * Extends `ld`, `ld.global.nc` and `st` instructions to support 256b load/store operations.

  * [Table 61](<#changes-in-ptx-isa-8-8-family-specific-features>) shows the list of features that are supported on family-specific targets:

Table 61 List of features promoted to family-specific architecture Feature | Supported targets  
---|---  
`.m16n8`, `.m16n16`, `.m8n16` shapes and `.b8` type for `ldmatrix`/`stmatrix` | `sm_100f`, `sm_101f`, `sm_120f`  
Shapes for `tcgen05` `.16x64b` `.16x128b`, `.16x256b`, `.16x32bx2`, `.32x32b`, `.4x256b`, `.32x128b`, `.64x128b`, `.128x256b`, `.128x128b`, `.31x256b` | `sm_100f`, `sm_101f`  
`setmaxnreg` | `sm_100f`, `sm_101f`, `sm_120f`  
`.cta_group` modifier | `sm_100f`, `sm_101f`  
`cvt` with `.e2m1x2`, `.e3m2x2`, `.e2m3x2`, `.ue8m0x2` | `sm_100f`, `sm_101f`, `sm_120f`  
`multimem` with `.acc::f16` and `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2`, `.e4m3x4` types | `sm_100f`, `sm_101f`  
`tensormap.replace` | `sm_100f`, `sm_101f`, `sm_120f`  
`tcgen05.ld.red` | `sm_101f`, `sm_103f`  
`tcgen05.ld`/`st`/`fence`/ `wait`/`commit`/`cp`/ `alloc`/`dealloc`/ `relinquish_alloc_permit` | `sm_100f`, `sm_101f`  
`tcgen05.mma{.ws}{.sp}` (except `kind::mxf4`/ `kind::mxf4nvf4` for `.sp`) | `sm_100f`, `sm_101f`  
`tcgen05` `.kind::mxf4nvf4`, `.kind::mxf4`, `.kind::mxf8f6f4`, `.kind::f16`, `.kind::tf32`, `.kind::f8f6f4` | `sm_100f`, `sm_101f`  
`.ashift`, `.collector_usage` modifiers for `tcgen05` | `sm_100f`, `sm_101f`  
Modifiers `.b8x16`, `.b6x16_p32`, `.b4x16_p64` | `sm_100f`, `sm_101f`, `sm_120f`  
`.block_scale` modifier | `sm_100f`, `sm_101f`, `sm_120f`  
`mma{.sp}` with `.e3m2`, `.e2m3`, `.e2m1` types and `.kind`, `.block_scale`, `.scale_vec_size` modifiers (except `.sp` with `mxf4`/ `mxf4nvf4`) | `sm_120f`  
`.scale_vec::1X`/`2X`/`4X` modifiers | `sm_120f`  
`.block16`/`.block32` modifiers (alias to `scale_vec`) | `sm_100f`, `sm_101f`  
`.warpx2::02_13`, `.warpx2::01_23`, `.warpx4`, `.pack::16b`, `.unpack::16b` modifiers for `tcgen05` | `sm_100f`, `sm_101f`  
`clusterlaunchcontrol.try_cancel` `multicast::cluster::all` | `sm_100f`, `sm_101f`, `sm_120f`  
`.tile::scatter4`, `.tile::gather4`, `.im2col::w`, `.im2col::w::128` | `sm_100f`, `sm_101f`  
`redux.f32` | `sm_100f`  
`scale-input-d` for `tcgen05` | `sm_100f`

Semantic Changes and Clarifications

* Clarified the behavior of float-to-integer conversions for `NaN` input.