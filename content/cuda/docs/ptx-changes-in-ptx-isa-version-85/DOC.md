---
name: ptx-changes-in-ptx-isa-version-85
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.6. Changes in PTX ISA Version 8.5

---
title: "13.6. Changes in PTX ISA Version 8.5"
section: 13.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.6. Changes in PTX ISA Version 8.5


New Features

PTX ISA version 8.5 introduces the following new features:

* Adds support for `mma.sp::ordered_metadata` instruction.

Semantic Changes and Clarifications

* Values `0b0000`, `0b0101`, `0b1010`, `0b1111` for sparsity metadata (operand `e`) of instruction `mma.sp` are invalid and their usage results in undefined behavior.