---
name: ptx-changes-in-ptx-isa-version-87
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.4. Changes in PTX ISA Version 8.7

---
title: "13.4. Changes in PTX ISA Version 8.7"
section: 13.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.4. Changes in PTX ISA Version 8.7


New Features

PTX ISA version 8.7 introduces the following new features:

* Adds support for `sm_120` target architecture.

  * Adds support for target `sm_120a` that supports architecture-specific features.

  * Extends `tcgen05.mma` instruction to add support for `.kind::mxf4nvf4` and `.scale_vec::4X` qualifiers.

  * Extends `mma` instructions to support `.f16` type accumulator and shape `.m16n8k16` with FP8 types `.e4m3` and `.e5m2`.

  * Extends `cvt` instruction to add support for `.rs` rounding mode and destination types `.e2m1x4`, `.e4m3x4`, `.e5m2x4`, `.e3m2x4`, `.e2m3x4`.

  * Extends support for `st.async` and `red.async` instructions to add support for `.mmio`, `.release`, `.global` and `.scope` qualifiers.

  * Extends `tensormap.replace` instruction to add support for values `13` to `15` for `.elemtype` qualifier.

  * Extends `mma` and `mma.sp::ordered_metadata` instructions to add support for types `.e3m2`/`.e2m3`/ `.e2m1` and qualifiers `.kind`, `.block_scale`, `.scale_vec_size`.

Semantic Changes and Clarifications

* Clarified that in `.tile::gather4`, `.tile::scatter4` modes, tensor coordinates need to be specified as {col_idx, row_idx0, row_idx1, row_idx2, row_idx3} i.e. {x, y0, y1, y2, y3} instead of {x0, x1, x2, x3, y}.

  * Updated [Instruction descriptor](<#tcgen05-instruction-descriptor>) of `tcgen05.mma` instruction to clarify the bits that are reserved for future use.