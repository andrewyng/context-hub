---
name: ptx-changes-in-ptx-isa-version-76
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.14. Changes in PTX ISA Version 7.6

---
title: "13.14. Changes in PTX ISA Version 7.6"
section: 13.14
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.14. Changes in PTX ISA Version 7.6


New Features

PTX ISA version 7.6 introduces the following new features:

* Support for `szext` instruction which performs sign-extension or zero-extension on a specified value.

  * Support for `bmsk` instruction which creates a bitmask of the specified width starting at the specified bit position.

  * Support for special registers `%reserved_smem_offset_begin`, `%reserved_smem_offset_end`, `%reserved_smem_offset_cap`, `%reserved_smem_offset<2>`.

Semantic Changes and Clarifications

None.