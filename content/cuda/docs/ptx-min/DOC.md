---
name: ptx-min
description: Find the minimum of two values.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.4.7. Half Precision Floating Point Instructions:min

---
title: "9.7.4.7. Half Precision Floating Point Instructions:min"
section: 9.7.4.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.4.7. Half Precision Floating Point Instructions:min


`min`

Find the minimum of two values.

Syntax

min{.ftz}{.NaN}{.xorsign.abs}.f16      d, a, b;
    min{.ftz}{.NaN}{.xorsign.abs}.f16x2    d, a, b;
    min{.NaN}{.xorsign.abs}.bf16           d, a, b;
    min{.NaN}{.xorsign.abs}.bf16x2         d, a, b;

Description

Store the minimum of `a` and `b` in `d`.

For `.f16x2` and `.bf16x2` instruction types, input vectors are formed with half-word values from source operands. Half-word operands are then processed in parallel to store `.f16x2` or `.bf16x2` result in destination.

For `.f16` instruction type, operands `d` and `a` have `.f16` or `.b16` type. For `.f16x2` instruction type, operands `d` and `a` have `.f16x2` or `.b32` type. For `.bf16` instruction type, operands `d` and `a` have `.b16` type. For `.bf16x2` instruction type, operands `d` and `a` have `.b32` type.

If `.NaN` modifier is specified, then the result is canonical `NaN` if either of the inputs is `NaN`.

If `.abs` modifier is specified, the magnitude of destination operand `d` is the minimum of absolute values of both the input arguments.

If `.xorsign` modifier is specified, the sign bit of destination `d` is equal to the XOR of the sign bits of both the inputs.

Modifiers `.abs` and `.xorsign` must be specified together and `.xorsign` considers the sign bit of both inputs before applying `.abs` operation.

If the result of `min` is `NaN` then the `.xorsign` and `.abs` modifiers will be ignored.

Semantics

if (type == f16 || type == bf16) {
        if (.xorsign) {
            xorsign = getSignBit(a) ^ getSignBit(b);
            if (.abs) {
                a = |a|;
                b = |b|;
            }
        }
        if (isNaN(a) && isNaN(b))              d = NaN;
        if (.NaN && (isNaN(a) || isNaN(b)))    d = NaN;
        else if (isNaN(a))                     d = b;
        else if (isNaN(b))                     d = a;
        else                                   d = (a < b) ? a : b;
        if (.xorsign && !isNaN(d)) {
             setSignBit(d, xorsign);
        }
    } else if (type == f16x2 || type == bf16x2) {
        fA[0] = a[0:15];
        fA[1] = a[16:31];
        fB[0] = b[0:15];
        fB[1] = b[16:31];
        for (i = 0; i < 2; i++) {
            if (.xorsign) {
                xorsign = getSignBit(fA[i]) ^ getSignBit(fB[i]);
                if (.abs) {
                   fA[i] = |fA[i]|;
                   fB[i] = |fB[i]|;
               }
            }
            if (isNaN(fA[i]) && isNaN(fB[i]))              d[i] = NaN;
            if (.NaN && (isNaN(fA[i]) || isNaN(fB[i])))    d[i] = NaN;
            else if (isNaN(fA[i]))                         d[i] = fB[i];
            else if (isNaN(fB[i]))                         d[i] = fA[i];
            else                                           d[i] = (fA[i] < fB[i]) ? fA[i] : fB[i];
            if (.xorsign && !isNaN(d[i])) {
                setSignBit(d[i], xorsign);
            }
        }
    }

Notes

Subnormal numbers:
    

By default, subnormal numbers are supported. `min.ftz.{f16, f16x2}` flushes subnormal inputs and results to sign-preserving zero.

If values of both inputs are 0.0, then +0.0 > -0.0.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

`min.xorsign` introduced in PTX ISA version 7.2.

Target ISA Notes

Requires `sm_80` or higher.

`min.xorsign.abs` support requires `sm_86` or higher.

Examples

min.ftz.f16       h0,h1,h2;
    min.f16x2         b0,b1,b2;
    // SIMD fp16 min with .NaN
    min.NaN.f16x2     b0,b1,b2;
    min.bf16          h0, h1, h2;
    // SIMD bf16 min with NaN
    min.NaN.bf16x2    b0, b1, b2;
    // scalar bf16 min with xorsign.abs
    min.xorsign.abs.bf16 Rd, Ra, Rb