---
name: ptx-changes-in-ptx-isa-version-71
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.19. Changes in PTX ISA Version 7.1

---
title: "13.19. Changes in PTX ISA Version 7.1"
section: 13.19
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.19. Changes in PTX ISA Version 7.1


New Features

PTX ISA version 7.1 introduces the following new features:

* Support for `sm_86` target architecture.

  * Adds a new operator, `mask()`, to extract a specific byte from variable’s address used in initializers.

  * Extends `tex` and `tld4` instructions to return an optional predicate that indicates if data at specified coordinates is resident in memory.

  * Extends single-bit `wmma` and `mma` instructions to support `.and` operation.

  * Extends `mma` instruction to support `.sp` modifier that allows matrix multiply-accumulate operation when input matrix A is sparse.

  * Extends `mbarrier.test_wait` instruction to test the completion of specific phase parity.

Semantic Changes and Clarifications

None.