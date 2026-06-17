---
name: ptx-exit
description: Terminate a thread.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.12.7. Control Flow Instructions:exit

---
title: "9.7.12.7. Control Flow Instructions:exit"
section: 9.7.12.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.12.7. Control Flow Instructions:exit


`exit`

Terminate a thread.

Syntax

exit;

Description

Ends execution of a thread.

Barriers exclusively waiting on arrivals from exited threads are always released.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

exit;
    @p  exit;