---
name: ptx-istypep
description: Query whether a register points to an opaque variable of a specified
  type.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.10.6. Texture Instructions:istypep

---
title: "9.7.10.6. Texture Instructions:istypep"
section: 9.7.10.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.10.6. Texture Instructions:istypep


`istypep`

Query whether a register points to an opaque variable of a specified type.

Syntax

istypep.type   p, a;  // result is .pred
    
    .type = { .texref, .samplerref, .surfref };

Description

Write predicate register `p` with 1 if register `a` points to an opaque variable of the specified type, and with 0 otherwise. Destination `p` has type `.pred`; the source address operand must be of type `.u64`.

PTX ISA Notes

Introduced in PTX ISA version 4.0.

Target ISA Notes

istypep requires `sm_30` or higher.

Examples

istypep.texref istex, tptr;
    istypep.samplerref issampler, sptr;
    istypep.surfref issurface, surfptr;