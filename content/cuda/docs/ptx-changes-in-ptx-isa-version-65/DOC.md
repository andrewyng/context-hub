---
name: ptx-changes-in-ptx-isa-version-65
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.21. Changes in PTX ISA Version 6.5

---
title: "13.21. Changes in PTX ISA Version 6.5"
section: 13.21
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.21. Changes in PTX ISA Version 6.5


New Features

PTX ISA version 6.5 introduces the following new features:

* Adds support for integer destination types for half precision comparison instruction `set`.

  * Extends `abs` instruction to support `.f16` and `.f16x2` types.

  * Adds support for `cvt.pack` instruction which allows converting two integer values and packing the results together.

  * Adds new shapes `.m16n8k8`, `.m8n8k16` and `.m8n8k32` on the `mma` instruction.

  * Adds support for `ldmatrix` instruction which loads one or more matrices from shared memory for `mma` instruction.

Removed Features

PTX ISA version 6.5 removes the following features:

* Support for `.satfinite` qualifier on floating point `wmma.mma` instruction has been removed. This support was deprecated since PTX ISA version 6.4.

Semantic Changes and Clarifications

None.