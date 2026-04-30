---
name: ptx-discard
description: Discard the data at the specified address range and cache level.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.17. Data Movement and Conversion Instructions:discard

---
title: "9.7.9.17. Data Movement and Conversion Instructions:discard"
section: 9.7.9.17
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.17. Data Movement and Conversion Instructions:discard


`discard`

Discard the data at the specified address range and cache level.

Syntax

discard{.global}.level  [a], size;
    
    .level = { .L2 };

Description

Semantically, this behaves like a weak write of an _unstable indeterminate value_ : reads of memory locations with _unstable indeterminate values_ may return different bit patterns each time until the memory is overwritten. This operation _hints_ to the implementation that data in the specified cache `.level` can be destructively discarded without writing it back to memory.

The operand `size` is an integer constant that specifies the length in bytes of the address range `[a, a + size)` to write _unstable indeterminate values_ into. The only supported value for the `size` operand is `128`.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the specified address does not fall within the address window of `.global` state space then the behavior is undefined.

Supported addressing modes for address operand `a` are described in [Addresses as Operands](<#addresses-as-operands>). `a` must be aligned to 128 bytes.

PTX ISA Notes

Introduced in PTX ISA version 7.4.

Target ISA Notes

Requires `sm_80` or higher.

Examples

discard.global.L2 [ptr], 128;
    ld.weak.u32 r0, [ptr];
    ld.weak.u32 r1, [ptr];
    // The values in r0 and r1 may differ!