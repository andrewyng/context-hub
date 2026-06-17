---
name: ptx-changes-in-ptx-isa-version-62
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.24. Changes in PTX ISA Version 6.2

---
title: "13.24. Changes in PTX ISA Version 6.2"
section: 13.24
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.24. Changes in PTX ISA Version 6.2


New Features

PTX ISA version 6.2 introduces the following new features:

* A new instruction `activemask` for querying active threads in a warp.

  * Extends atomic and reduction instructions to perform `.f16x2` addition operation with mandatory `.noftz` qualifier.

Deprecated Features

PTX ISA version 6.2 deprecates the following features:

* The use of `shfl` and `vote` instructions without the `.sync` is deprecated retrospectively from PTX ISA version 6.0, which introduced the `sm_70` architecture that implements [Independent Thread Scheduling](<#independent-thread-scheduling>).

Semantic Changes and Clarifications

* Clarified that `wmma` instructions can be used in conditionally executed code only if it is known that all threads in the warp evaluate the condition identically, otherwise behavior is undefined.

  * In the memory consistency model, the definition of _morally strong operations_ was updated to exclude fences from the requirement of _complete overlap_ since fences do not access memory.