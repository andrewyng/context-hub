---
name: ptx-changes-in-ptx-isa-version-86
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.5. Changes in PTX ISA Version 8.6

---
title: "13.5. Changes in PTX ISA Version 8.6"
section: 13.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.5. Changes in PTX ISA Version 8.6


New Features

PTX ISA version 8.6 introduces the following new features:

* Adds support for `sm_100` target architecture.

  * Adds support for target `sm_100a` that supports architecture-specific features.

  * Adds support for `sm_101` target architecture.

  * Adds support for target `sm_101a` that supports architecture-specific features.

  * Extends `cp.async.bulk` and `cp.async.bulk.tensor` instructions to add `.shared::cta` as destination state space.

  * Extends `fence` instruction to add support for `.acquire` and `.release` qualifiers.

  * Extends `fence` and `fence.proxy` instructions to add support for `.sync_restrict` qualifier.

  * Extends `ldmatrix` instruction to support `.m16n16`, `.m8n16` shapes and `.b8` type.

  * Extends `ldmatrix` instruction to support `.src_fmt`, `.dst_fmt` qualifiers.

  * Extends `stmatrix` instruction to support `.m16n8` shape and `.b8` type.

  * Adds support for `clusterlaunchcontrol` instruction.

  * Extends `add`, `sub` and `fma` instructions to support mixed precision floating point operations with `.f32` as destaination operand type and `.f16`/`.bf16` as source operand types.

  * Extends `add`, `sub`, `mul` and `fma` instructions to support `.f32x2` type.

  * Extends `cvt` instruction with `.tf32` type to support `.satfinite` qualifier for `.rn`/`.rz` rounding modes.

  * Extends `cp.async.bulk` instruction to support `.cp_mask` qualifier and `byteMask` operand.

  * Extends `multimem.ld_reduce` and `multimem.st` instructions to support `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2` and `.e4m3x4` types.

  * Extends `cvt` instruction to support conversions to/from `.e2m1x2`, `.e3m2x2`, `.e2m3x2` and `.ue8m0x2` types.

  * Extends `cp.async.bulk.tensor` and `cp.async.bulk.prefetch.tensor` instructions to support new load_mode qualifiers `.tile::scatter4` and `.tile::gather4`.

  * Extends `tensormap.replace` instruction to add support for new qualifier `.swizzle_atomicity` for supporting new swizzle modes.

  * Extends `mbarrier.arrive`, `mbarrier.arrive_drop`, `.mbarrier.test_wait` and `.mbarrier.try_wait` instructions to support `.relaxed` qualifier.

  * Extends `cp.async.bulk.tensor` and `cp.async.bulk.prefetch.tensor` instructions to support new load_mode qualifiers `.im2col::w` and `.im2col::w::128`.

  * Extends `cp.async.bulk.tensor` instruction to support new qualifier `.cta_group`.

  * Add support for `st.bulk` instruction.

  * Adds support for tcgen05 features and related instructions: `tcgen05.alloc`, `tcgen05.dealloc`, `tcgen05.relinquish_alloc_permit`, `tcgen05.ld`, `tcgen05.st`, `tcgen05.wait`, `tcgen05.cp`, `tcgen05.shift`, `tcgen05.mma`, `tcgen05.mma.sp`, `tcgen05.mma.ws`, `tcgen05.mma.ws.sp`, `tcgen05.fence` and `tcgen05.commit`.

  * Extends `redux.sync` instruction to add support for `.f32` type with qualifiers `.abs` and `.NaN`.

Semantic Changes and Clarifications

None.