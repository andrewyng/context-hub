---
name: ptx-changes-in-ptx-isa-version-64
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.22. Changes in PTX ISA Version 6.4

---
title: "13.22. Changes in PTX ISA Version 6.4"
section: 13.22
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.22. Changes in PTX ISA Version 6.4


New Features

PTX ISA version 6.4 introduces the following new features:

* Adds support for `.noreturn` directive which can be used to indicate a function does not return to it’s caller function.

  * Adds support for `mma` instruction which allows performing matrix multiply-and-accumulate operation.

Deprecated Features

PTX ISA version 6.4 deprecates the following features:

* Support for `.satfinite` qualifier on floating point `wmma.mma` instruction.

Removed Features

PTX ISA version 6.4 removes the following features:

* Support for `shfl` and `vote` instructions without the `.sync` qualifier has been removed for `.target``sm_70` and higher. This support was deprecated since PTX ISA version 6.0 as documented in PTX ISA version 6.2.

Semantic Changes and Clarifications

* Clarified that resolving references of a `.weak` symbol considers only `.weak` or `.visible` symbols with the same name and does not consider local symbols with the same name.

  * Clarified that in `cvt` instruction, modifier `.ftz` can only be specified when either `.atype` or `.dtype` is `.f32`.