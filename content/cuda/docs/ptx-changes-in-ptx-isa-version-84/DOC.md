---
name: ptx-changes-in-ptx-isa-version-84
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.7. Changes in PTX ISA Version 8.4

---
title: "13.7. Changes in PTX ISA Version 8.4"
section: 13.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.7. Changes in PTX ISA Version 8.4


New Features

PTX ISA version 8.4 introduces the following new features:

* Extends `ld`, `st` and `atom` instructions with `.b128` type to support `.sys` scope.

  * Extends integer `wgmma.mma_async` instruction to support `.u8.s8` and `.s8.u8` as `.atype` and `.btype` respectively.

  * Extends `mma`, `mma.sp` instructions to support FP8 types `.e4m3` and `.e5m2`.

Semantic Changes and Clarifications

None.