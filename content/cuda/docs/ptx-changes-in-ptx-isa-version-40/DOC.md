---
name: ptx-changes-in-ptx-isa-version-40
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.31. Changes in PTX ISA Version 4.0

---
title: "13.31. Changes in PTX ISA Version 4.0"
section: 13.31
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.31. Changes in PTX ISA Version 4.0


New Features

PTX ISA version 4.0 introduces the following new features:

* Support for `sm_32` and `sm_50` target architectures.

  * Support for 64bit performance counter special registers `%pm0_64,..,%pm7_64`.

  * A new `istypep` instruction.

  * A new instruction, `rsqrt.approx.ftz.f64` has been added to compute a fast approximation of the square root reciprocal of a value.

  * Support for a new directive `.attribute` for specifying special attributes of a variable.

  * Support for `.managed` variable attribute.

Semantic Changes and Clarifications

The `vote` instruction semantics were updated to clearly indicate that an inactive thread in a warp contributes a 0 for its entry when participating in `vote.ballot.b32`.