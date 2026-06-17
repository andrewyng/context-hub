---
name: ptx-changes-in-ptx-isa-version-73
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.17. Changes in PTX ISA Version 7.3

---
title: "13.17. Changes in PTX ISA Version 7.3"
section: 13.17
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.17. Changes in PTX ISA Version 7.3


New Features

PTX ISA version 7.3 introduces the following new features:

* Extends `mask()` operator used in initializers to also support integer constant expression.

  * Adds support for stack manpulation instructions that allow manipulating stack using `stacksave` and `stackrestore` instructions and allocation of per-thread stack using `alloca` instruction.

Semantic Changes and Clarifications

The unimplemented version of `alloca` from the older PTX ISA specification has been replaced with new stack manipulation instructions in PTX ISA version 7.3.