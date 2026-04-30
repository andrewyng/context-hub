---
name: ptx-mapa
description: Map the address of the shared variable in the target CTA.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.23. Data Movement and Conversion Instructions:mapa

---
title: "9.7.9.23. Data Movement and Conversion Instructions:mapa"
section: 9.7.9.23
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.23. Data Movement and Conversion Instructions:mapa


`mapa`

Map the address of the shared variable in the target CTA.

Syntax

mapa{.space}.type          d, a, b;
    
    // Maps shared memory address in register a into CTA b.
    mapa.shared::cluster.type  d, a, b;
    
    // Maps shared memory variable into CTA b.
    mapa.shared::cluster.type  d, sh, b;
    
    // Maps shared memory variable into CTA b.
    mapa.shared::cluster.type  d, sh + imm, b;
    
    // Maps generic address in register a into CTA b.
    mapa.type                  d, a, b;
    
    .space = { .shared::cluster }
    .type  = { .u32, .u64 }

Description

Get address in the CTA specified by operand `b` which corresponds to the address specified by operand `a`.

Instruction type `.type` indicates the type of the destination operand `d` and the source operand `a`.

When space is `.shared::cluster`, source `a` is either a shared memory variable or a register containing a valid shared memory address and register `d` contains a shared memory address. When the optional qualifier `.space` is not specified, both `a` and `d` are registers containing generic addresses pointing to shared memory.

`b` is a 32-bit integer operand representing the rank of the target CTA.

Destination register `d` will hold an address in CTA `b` corresponding to operand `a`.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

mapa.shared::cluster.u64 d1, %reg1, cta;
    mapa.shared::cluster.u32 d2, sh, 3;
    mapa.u64                 d3, %reg2, cta;