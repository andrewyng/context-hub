---
name: ptx-changes-in-ptx-isa-version-43
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.28. Changes in PTX ISA Version 4.3

---
title: "13.28. Changes in PTX ISA Version 4.3"
section: 13.28
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.28. Changes in PTX ISA Version 4.3


New Features

PTX ISA version 4.3 introduces the following new features:

* A new `lop3` instruction which allows arbitrary logical operation on 3 inputs.

  * Adds support for 64-bit computations in extended precision arithmetic instructions.

  * Extends `tex.grad` instruction to support `cube` and `acube` geometries.

  * Extends `tld4` instruction to support `a2d`, `cube` and `acube` geometries.

  * Extends `tex` and `tld4` instructions to support optional operands for offset vector and depth compare.

  * Extends `txq` instruction to support querying texture fields from specific LOD.

Semantic Changes and Clarifications

None.