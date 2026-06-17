---
name: ptx-restricted-use-of-sub-word-sizes
description: The `.u8`, `.s8`, and `.b8` instruction types are restricted to `ld`,
  `st`, and `cvt` instructions. The `.f16` floating-point type is allowed only in
  conversions to and from `.f32`, `.f64` types, in h...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.2. Restricted Use of Sub-Word Sizes

---
title: "5.2.2. Restricted Use of Sub-Word Sizes"
section: 5.2.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.2.2. Restricted Use of Sub-Word Sizes


The `.u8`, `.s8`, and `.b8` instruction types are restricted to `ld`, `st`, and `cvt` instructions. The `.f16` floating-point type is allowed only in conversions to and from `.f32`, `.f64` types, in half precision floating point instructions and texture fetch instructions. The `.f16x2` floating point type is allowed only in half precision floating point arithmetic instructions and texture fetch instructions.

For convenience, `ld`, `st`, and `cvt` instructions permit source and destination data operands to be wider than the instruction-type size, so that narrow values may be loaded, stored, and converted using regular-width registers. For example, 8-bit or 16-bit values may be held directly in 32-bit or 64-bit registers when being loaded, stored, or converted to other types and sizes.