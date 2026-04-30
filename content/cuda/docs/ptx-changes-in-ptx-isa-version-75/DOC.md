---
name: ptx-changes-in-ptx-isa-version-75
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.15. Changes in PTX ISA Version 7.5

---
title: "13.15. Changes in PTX ISA Version 7.5"
section: 13.15
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.15. Changes in PTX ISA Version 7.5


New Features

PTX ISA version 7.5 introduces the following new features:

* Debug information enhancements to support label difference and negative values in the `.section` debugging directive.

  * Support for `ignore-src` operand on `cp.async` instruction.

  * Extensions to the memory consistency model to introduce the following new concepts:

>     * A _memory proxy_ as an abstract label for different methods of memory access.
> 
>     * Virtual aliases as distinct memory addresses accessing the same physical memory location.

  * Support for new `fence.proxy` and `membar.proxy` instructions to allow synchronization of memory accesses performed via virtual aliases.

Semantic Changes and Clarifications

None.