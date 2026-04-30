---
name: ptx-changes-in-ptx-isa-version-30
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.34. Changes in PTX ISA Version 3.0

---
title: "13.34. Changes in PTX ISA Version 3.0"
section: 13.34
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.34. Changes in PTX ISA Version 3.0


New Features

PTX ISA version 3.0 introduces the following new features:

* Support for `sm_30` target architectures.

  * SIMD video instructions.

  * A new warp shuffle instruction.

  * Instructions `mad.cc` and `madc` for efficient, extended-precision integer multiplication.

  * Surface instructions with 3D and array geometries.

  * The texture instruction supports reads from cubemap and cubemap array textures.

  * Platform option `.target` debug to declare that a PTX module contains `DWARF` debug information.

  * `pmevent.mask`, for triggering multiple performance monitor events.

  * Performance monitor counter special registers `%pm4..%pm7`.

Semantic Changes and Clarifications

Special register `%gridid` has been extended from 32-bits to 64-bits.

PTX ISA version 3.0 deprecates module-scoped `.reg` and `.local` variables when compiling to the Application Binary Interface (ABI). When compiling without use of the ABI, module-scoped `.reg` and `.local` variables are supported as before. When compiling legacy PTX code (ISA versions prior to 3.0) containing module-scoped `.reg` or `.local` variables, the compiler silently disables use of the ABI.

The `shfl` instruction semantics were updated to clearly indicate that value of source operand `a` is unpredictable for inactive and predicated-off threads within the warp.

PTX modules no longer allow duplicate `.version` directives. This feature was unimplemented, so there is no semantic change.

Unimplemented instructions `suld.p` and `sust.p.{u32,s32,f32}` have been removed.