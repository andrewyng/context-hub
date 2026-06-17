---
name: ptx-changes-in-ptx-isa-version-60
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.26. Changes in PTX ISA Version 6.0

---
title: "13.26. Changes in PTX ISA Version 6.0"
section: 13.26
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.26. Changes in PTX ISA Version 6.0


New Features

PTX ISA version 6.0 introduces the following new features:

* Support for `sm_70` target architecture.

  * Specifies the memory consistency model for programs running on `sm_70` and later architectures.

  * Various extensions to memory instructions to specify memory synchronization semantics and scopes at which such synchronization can be observed.

  * New instruction `wmma` for matrix operations which allows loading matrices from memory, performing multiply-and-accumulate on them and storing result in memory.

  * Support for new `barrier` instruction.

  * Extends `neg` instruction to support `.f16` and `.f16x2` types.

  * A new instruction `fns` which allows finding n-th set bit in integer.

  * A new instruction `bar.warp.sync` which allows synchronizing threads in warp.

  * Extends `vote` and `shfl` instructions with `.sync` modifier which waits for specified threads before executing the `vote` and `shfl` operation respectively.

  * A new instruction `match.sync` which allows broadcasting and comparing a value across threads in warp.

  * A new instruction `brx.idx` which allows branching to a label indexed from list of potential targets.

  * Support for unsized array parameter for `.func` which can be used to implement variadic functions.

  * Support for `.b16` integer type in dwarf-lines.

  * Support for taking address of device function return parameters using `mov` instruction.

Semantic Changes and Clarifications

* Semantics of `bar` instruction were updated to indicate that executing thread waits for other non-exited threads from it’s warp.

  * Support for indirect branch introduced in PTX 2.1 which was unimplemented has been removed from the spec.

  * Support for taking address of labels, using labels in initializers which was unimplemented has been removed from the spec.

  * Support for variadic functions which was unimplemented has been removed from the spec.