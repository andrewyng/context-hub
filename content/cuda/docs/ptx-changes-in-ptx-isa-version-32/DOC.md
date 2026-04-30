---
name: ptx-changes-in-ptx-isa-version-32
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.32. Changes in PTX ISA Version 3.2

---
title: "13.32. Changes in PTX ISA Version 3.2"
section: 13.32
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.32. Changes in PTX ISA Version 3.2


New Features

PTX ISA version 3.2 introduces the following new features:

* The texture instruction supports reads from multi-sample and multisample array textures.

  * Extends `.section` debugging directive to include label + immediate expressions.

  * Extends `.file` directive to include timestamp and file size information.

Semantic Changes and Clarifications

The `vavrg2` and `vavrg4` instruction semantics were updated to indicate that instruction adds 1 only if Va[i] + Vb[i] is non-negative, and that the addition result is shifted by 1 (rather than being divided by 2).