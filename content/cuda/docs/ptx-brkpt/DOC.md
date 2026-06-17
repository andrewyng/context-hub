---
name: ptx-brkpt
description: Breakpoint.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.19.1. Miscellaneous Instructions:brkpt

---
title: "9.7.19.1. Miscellaneous Instructions:brkpt"
section: 9.7.19.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.19.1. Miscellaneous Instructions:brkpt


`brkpt`

Breakpoint.

Syntax

brkpt;

Description

Suspends execution.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

`brkpt` requires `sm_11` or higher.

Examples

brkpt;
    @p  brkpt;