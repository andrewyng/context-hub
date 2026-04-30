---
name: ptx-changes-in-ptx-isa-version-80
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.11. Changes in PTX ISA Version 8.0

---
title: "13.11. Changes in PTX ISA Version 8.0"
section: 13.11
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.11. Changes in PTX ISA Version 8.0


New Features

PTX ISA version 8.0 introduces the following new features:

* Adds support for target `sm_90a` that supports architecture-specific features.

  * Adds support for asynchronous warpgroup-level matrix multiply-and-accumulate operation `wgmma`.

  * Extends the asynchronous copy operations with bulk operations that operate on large data, including tensor data.

  * Introduces packed integer types `.u16x2` and `.s16x2`.

  * Extends integer arithmetic instruction `add` to allow packed integer types `.u16x2` and `.s16x2`.

  * Extends integer arithmetic instructions `min` and `max` to allow packed integer types `.u16x2` and `.s16x2`, as well as saturation modifier `.relu` on `.s16x2` and `.s32` types.

  * Adds support for special register `%current_graph_exec` that identifies the currently executing CUDA device graph.

  * Adds support for `elect.sync` instruction.

  * Adds support for `.unified` attribute on functions and variables.

  * Adds support for `setmaxnreg` instruction.

  * Adds support for `.sem` qualifier on `barrier.cluster` instruction.

  * Extends the `fence` instruction to allow opcode-specific synchronizaion using `op_restrict` qualifier.

  * Adds support for `.cluster` scope on `mbarrier.arrive`, `mbarrier.arrive_drop`, `mbarrier.test_wait` and `mbarrier.try_wait` operations.

  * Adds support for transaction count operations on `mbarrier` objects, specified with `.expect_tx` and `.complete_tx` qualifiers.

Semantic Changes and Clarifications

None.