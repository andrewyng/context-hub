---
name: ptx-brev
description: Bit reverse.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.18. Integer Arithmetic Instructions:brev

---
title: "9.7.1.18. Integer Arithmetic Instructions:brev"
section: 9.7.1.18
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.18. Integer Arithmetic Instructions:brev


`brev`

Bit reverse.

Syntax

brev.type  d, a;
    
    .type = { .b32, .b64 };

Description

Perform bitwise reversal of input.

Semantics

msb = (.type==.b32) ? 31 : 63;
    
    for (i=0; i<=msb; i++) {
        d[i] = a[msb-i];
    }

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`brev` requires `sm_20` or higher.

Examples

brev.b32  d, a;