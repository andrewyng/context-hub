---
name: ptx-fns
description: Find the n-th set bit
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.17. Integer Arithmetic Instructions:fns

---
title: "9.7.1.17. Integer Arithmetic Instructions:fns"
section: 9.7.1.17
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.17. Integer Arithmetic Instructions:fns


`fns`

Find the n-th set bit

Syntax

fns.b32 d, mask, base, offset;

Description

Given a 32-bit value `mask` and an integer value `base` (between 0 and 31), find the n-th (given by offset) set bit in `mask` from the `base` bit, and store the bit position in `d`. If not found, store 0xffffffff in `d`.

Operand `mask` has a 32-bit type. Operand `base` has `.b32`, `.u32` or `.s32` type. Operand offset has `.s32` type. Destination `d` has type `.b32.`

Operand `base` must be <= 31, otherwise behavior is undefined.

Semantics

d = 0xffffffff;
    if (offset == 0) {
        if (mask[base] == 1) {
            d = base;
        }
    } else {
        pos = base;
        count = |offset| - 1;
        inc = (offset > 0) ? 1 : -1;
    
        while ((pos >= 0) && (pos < 32)) {
            if (mask[pos] == 1) {
                if (count == 0) {
                  d = pos;
                  break;
               } else {
                   count = count - 1;
               }
            }
            pos = pos + inc;
        }
    }

PTX ISA Notes

Introduced in PTX ISA version 6.0.

Target ISA Notes

`fns` requires `sm_30` or higher.

Examples

fns.b32 d, 0xaaaaaaaa, 3, 1;   // d = 3
    fns.b32 d, 0xaaaaaaaa, 3, -1;  // d = 3
    fns.b32 d, 0xaaaaaaaa, 2, 1;   // d = 3
    fns.b32 d, 0xaaaaaaaa, 2, -1;  // d = 1