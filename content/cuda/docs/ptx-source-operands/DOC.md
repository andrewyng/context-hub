---
name: ptx-source-operands
description: The source operands are denoted in the instruction descriptions by the
  names `a`, `b`, and `c`. PTX describes a load-store machine, so operands for ALU
  instructions must all be in variables declared i...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.2. Source Operands

---
title: "6.2. Source Operands"
section: 6.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 6.2. Source Operands


The source operands are denoted in the instruction descriptions by the names `a`, `b`, and `c`. PTX describes a load-store machine, so operands for ALU instructions must all be in variables declared in the `.reg` register state space. For most operations, the sizes of the operands must be consistent.

The `cvt` (convert) instruction takes a variety of operand types and sizes, as its job is to convert from nearly any data type to any other data type (and size).

The `ld`, `st`, `mov`, and `cvt` instructions copy data from one location to another. Instructions `ld` and `st` move data from/to addressable state spaces to/from registers. The `mov` instruction copies data between registers.

Most instructions have an optional predicate guard that controls conditional execution, and a few instructions have additional predicate source operands. Predicate operands are denoted by the names `p`, `q`, `r`, `s`.