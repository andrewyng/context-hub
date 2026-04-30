---
name: ptx-changes-in-ptx-isa-version-70
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.20. Changes in PTX ISA Version 7.0

---
title: "13.20. Changes in PTX ISA Version 7.0"
section: 13.20
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.20. Changes in PTX ISA Version 7.0


New Features

PTX ISA version 7.0 introduces the following new features:

* Support for `sm_80` target architecture.

  * Adds support for asynchronous copy instructions that allow copying of data asynchronously from one state space to another.

  * Adds support for `mbarrier` instructions that allow creation of _mbarrier objects_ in memory and use of these objects to synchronize threads and asynchronous copy operations initiated by threads.

  * Adds support for `redux.sync` instruction which allows reduction operation across threads in a warp.

  * Adds support for new alternate floating-point data formats `.bf16` and `.tf32`.

  * Extends `wmma` instruction to support `.f64` type with shape `.m8n8k4`.

  * Extends `wmma` instruction to support `.bf16` data format.

  * Extends `wmma` instruction to support `.tf32` data format with shape `.m16n16k8`.

  * Extends `mma` instruction to support `.f64` type with shape `.m8n8k4`.

  * Extends `mma` instruction to support `.bf16` and `.tf32` data formats with shape `.m16n8k8`.

  * Extends `mma` instruction to support new shapes `.m8n8k128`, `.m16n8k4`, `.m16n8k16`, `.m16n8k32`, `.m16n8k64`, `.m16n8k128` and `.m16n8k256`.

  * Extends `abs` and `neg` instructions to support `.bf16` and `.bf16x2` data formats.

  * Extends `min` and `max` instructions to support `.NaN` modifier and `.f16`, `.f16x2`, `.bf16` and `.bf16x2` data formats.

  * Extends `fma` instruction to support `.relu` saturation mode and `.bf16` and `.bf16x2` data formats.

  * Extends `cvt` instruction to support `.relu` saturation mode and `.f16`, `.f16x2`, `.bf16`, `.bf16x2` and `.tf32` destination formats.

  * Adds support for `tanh` instruction that computes hyperbolic-tangent.

  * Extends `ex2` instruction to support `.f16` and `.f16x2` types.

Semantic Changes and Clarifications

None.