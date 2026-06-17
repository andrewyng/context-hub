---
name: ptx-stacksave
description: Save the value of stack pointer into a register.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.17.1. Stack Manipulation Instructions:stacksave

---
title: "9.7.17.1. Stack Manipulation Instructions:stacksave"
section: 9.7.17.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.17.1. Stack Manipulation Instructions:stacksave


`stacksave`

Save the value of stack pointer into a register.

Syntax

stacksave.type  d;
    
    .type = { .u32, .u64 };

Description

Copies the current value of stack pointer into the destination register `d`. Pointer returned by `stacksave` can be used in a subsequent `stackrestore` instruction to restore the stack pointer. If `d` is modified prior to use in `stackrestore` instruction, it may corrupt data in the stack.

Destination operand `d` has the same type as the instruction type.

Semantics

d = stackptr;

PTX ISA Notes

Introduced in PTX ISA version 7.3.

Target ISA Notes

`stacksave` requires `sm_52` or higher.

Examples

.reg .u32 rd;
    stacksave.u32 rd;
    
    .reg .u64 rd1;
    stacksave.u64 rd1;