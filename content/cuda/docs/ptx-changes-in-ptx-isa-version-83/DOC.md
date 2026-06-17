---
name: ptx-changes-in-ptx-isa-version-83
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.8. Changes in PTX ISA Version 8.3

---
title: "13.8. Changes in PTX ISA Version 8.3"
section: 13.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.8. Changes in PTX ISA Version 8.3


New Features

PTX ISA version 8.3 introduces the following new features:

* Adds support for pragma `used_bytes_mask` that is used to specify mask for used bytes for a load operation.

  * Extends `isspacep`, `cvta.to`, `ld` and `st` instructions to accept `::entry` and `::func` sub-qualifiers with `.param` state space qualifier.

  * Adds support for `.b128` type on instructions `ld`, `ld.global.nc`, `ldu`, `st`, `mov` and `atom`.

  * Add support for instructions `tensormap.replace`, `tensormap.cp_fenceproxy` and support for qualifier `.to_proxykind::from_proxykind` on instruction `fence.proxy` to support modifying `tensor-map`.

Semantic Changes and Clarifications

None.