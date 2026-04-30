---
name: ptx-changes-in-ptx-isa-version-50
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.27. Changes in PTX ISA Version 5.0

---
title: "13.27. Changes in PTX ISA Version 5.0"
section: 13.27
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.27. Changes in PTX ISA Version 5.0


New Features

PTX ISA version 5.0 introduces the following new features:

* Support for `sm_60`, `sm_61`, `sm_62` target architecture.

  * Extends atomic and reduction instructions to perform double-precision add operation.

  * Extends atomic and reduction instructions to specify `scope` modifier.

  * A new `.common` directive to permit linking multiple object files containing declarations of the same symbol with different size.

  * A new `dp4a` instruction which allows 4-way dot product with accumulate operation.

  * A new `dp2a` instruction which allows 2-way dot product with accumulate operation.

  * Support for special register `%clock_hi`.

Semantic Changes and Clarifications

Semantics of cache modifiers on `ld` and `st` instructions were clarified to reflect cache operations are treated as performance hint only and do not change memory consistency behavior of the program.

Semantics of `volatile` operations on `ld` and `st` instructions were clarified to reflect how `volatile` operations are handled by optimizing compiler.