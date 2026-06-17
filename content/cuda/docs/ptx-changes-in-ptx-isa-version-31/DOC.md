---
name: ptx-changes-in-ptx-isa-version-31
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.33. Changes in PTX ISA Version 3.1

---
title: "13.33. Changes in PTX ISA Version 3.1"
section: 13.33
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.33. Changes in PTX ISA Version 3.1


New Features

PTX ISA version 3.1 introduces the following new features:

* Support for `sm_35` target architecture.

  * Support for CUDA Dynamic Parallelism, which enables a kernel to create and synchronize new work.

  * `ld.global.nc` for loading read-only global data though the non-coherent texture cache.

  * A new funnel shift instruction, `shf`.

  * Extends atomic and reduction instructions to perform 64-bit `{and, or, xor}` operations, and 64-bit integer `{min, max}` operations.

  * Adds support for `mipmaps`.

  * Adds support for indirect access to textures and surfaces.

  * Extends support for generic addressing to include the `.const` state space, and adds a new operator, `generic()`, to form a generic address for `.global` or `.const` variables used in initializers.

  * A new `.weak` directive to permit linking multiple object files containing declarations of the same symbol.

Semantic Changes and Clarifications

PTX 3.1 redefines the default addressing for global variables in initializers, from generic addresses to offsets in the global state space. Legacy PTX code is treated as having an implicit `generic()` operator for each global variable used in an initializer. PTX 3.1 code should either include explicit `generic()` operators in initializers, use `cvta.global` to form generic addresses at runtime, or load from the non-generic address using `ld.global`.

Instruction `mad.f32` requires a rounding modifier for `sm_20` and higher targets. However for PTX ISA version 3.0 and earlier, ptxas does not enforce this requirement and `mad.f32` silently defaults to `mad.rn.f32`. For PTX ISA version 3.1, ptxas generates a warning and defaults to `mad.rn.f32`, and in subsequent releases ptxas will enforce the requirement for PTX ISA version 3.2 and later.