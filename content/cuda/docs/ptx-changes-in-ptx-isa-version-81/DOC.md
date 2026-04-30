---
name: ptx-changes-in-ptx-isa-version-81
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.10. Changes in PTX ISA Version 8.1

---
title: "13.10. Changes in PTX ISA Version 8.1"
section: 13.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.10. Changes in PTX ISA Version 8.1


New Features

PTX ISA version 8.1 introduces the following new features:

* Adds support for `st.async` and `red.async` instructions for asynchronous store and asynchronous reduction operations respectively on shared memory.

  * Adds support for `.oob` modifier on half-precision `fma` instruction.

  * Adds support for `.satfinite` saturation modifer on `cvt` instruction for `.f16`, `.bf16` and `.tf32` formats.

  * Extends support for `cvt` with `.e4m3`/`.e5m2` to `sm_89`.

  * Extends `atom` and `red` instructions to support vector types.

  * Adds support for special register `%aggr_smem_size`.

  * Extends `sured` instruction with 64-bit `min`/`max` operations.

  * Adds support for increased kernel parameter size of 32764 bytes.

  * Adds support for multimem addresses in memory consistency model.

  * Adds support for `multimem.ld_reduce`, `multimem.st` and `multimem.red` instructions to perform memory operations on multimem addresses.

Semantic Changes and Clarifications

None.