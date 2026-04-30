---
name: ptx-changes-in-ptx-isa-version-82
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.9. Changes in PTX ISA Version 8.2

---
title: "13.9. Changes in PTX ISA Version 8.2"
section: 13.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.9. Changes in PTX ISA Version 8.2


New Features

PTX ISA version 8.2 introduces the following new features:

* Adds support for `.mmio` qualifier on `ld` and `st` instructions.

  * Extends `lop3` instruction to allow predicate destination.

  * Extends `multimem.ld_reduce` instruction to support `.acc::f32` qualifer to allow `.f32` precision of the intermediate accumulation.

  * Extends the asynchronous warpgroup-level matrix multiply-and-accumulate operation `wgmma.mma_async` to support `.sp` modifier that allows matrix multiply-accumulate operation when input matrix A is sparse.

Semantic Changes and Clarifications

The `.multicast::cluster` qualifier on `cp.async.bulk` and `cp.async.bulk.tensor` instructions is optimized for target architecture `sm_90a` and may have substantially reduced performance on other targets and hence `.multicast::cluster` is advised to be used with `sm_90a`.