---
name: ptx-ret
description: Return from function to instruction after call.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.12.6. Control Flow Instructions:ret

---
title: "9.7.12.6. Control Flow Instructions:ret"
section: 9.7.12.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.12.6. Control Flow Instructions:ret


`ret`

Return from function to instruction after call.

Syntax

ret{.uni};

Description

Return execution to caller’s environment. A divergent return suspends threads until all threads are ready to return to the caller. This allows multiple divergent `ret` instructions.

A `ret` is assumed to be divergent unless the `.uni` suffix is present, indicating that the return is guaranteed to be non-divergent.

Any values returned from a function should be moved into the return parameter variables prior to executing the `ret` instruction.

A return instruction executed in a top-level entry routine will terminate thread execution.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

ret;
    @p  ret;