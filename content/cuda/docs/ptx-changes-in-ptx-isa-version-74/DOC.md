---
name: ptx-changes-in-ptx-isa-version-74
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.16. Changes in PTX ISA Version 7.4

---
title: "13.16. Changes in PTX ISA Version 7.4"
section: 13.16
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.16. Changes in PTX ISA Version 7.4


New Features

PTX ISA version 7.4 introduces the following new features:

* Support for `sm_87` target architecture.

  * Support for `.level::eviction_priority` qualifier which allows specifying cache eviction priority hints on `ld`, `ld.global.nc`, `st`, and `prefetch` instructions.

  * Support for `.level::prefetch_size` qualifier which allows specifying data prefetch hints on `ld` and `cp.async` instructions.

  * Support for `createpolicy` instruction which allows construction of different types of cache eviction policies.

  * Support for `.level::cache_hint` qualifier which allows the use of cache eviction policies with `ld`, `ld.global.nc`, `st`, `atom`, `red` and `cp.async` instructions.

  * Support for `applypriority` and `discard` operations on cached data.

Semantic Changes and Clarifications

None.