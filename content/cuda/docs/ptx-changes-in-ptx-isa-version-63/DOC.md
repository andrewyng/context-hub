---
name: ptx-changes-in-ptx-isa-version-63
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.23. Changes in PTX ISA Version 6.3

---
title: "13.23. Changes in PTX ISA Version 6.3"
section: 13.23
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.23. Changes in PTX ISA Version 6.3


New Features

PTX ISA version 6.3 introduces the following new features:

* Support for `sm_75` target architecture.

  * Adds support for a new instruction `nanosleep` that suspends a thread for a specified duration.

  * Adds support for `.alias` directive which allows definining alias to function symbol.

  * Extends `atom` instruction to perform `.f16` addition operation and `.cas.b16` operation.

  * Extends `red` instruction to perform `.f16` addition operation.

  * The `wmma` instructions are extended to support multiplicand matrices of type `.s8`, `.u8`, `.s4`, `.u4`, `.b1` and accumulator matrices of type `.s32`.

Semantic Changes and Clarifications

* Introduced the mandatory `.aligned` qualifier for all `wmma` instructions.

  * Specified the alignment required for the base address and stride parameters passed to `wmma.load` and `wmma.store`.

  * Clarified that layout of fragment returned by `wmma` operation is architecture dependent and passing `wmma` fragments around functions compiled for different link compatible SM architectures may not work as expected.

  * Clarified that atomicity for `{atom/red}.f16x2}` operations is guranteed separately for each of the two `.f16` elements but not guranteed to be atomic as single 32-bit access.