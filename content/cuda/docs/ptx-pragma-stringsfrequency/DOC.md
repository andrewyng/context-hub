---
name: ptx-pragma-stringsfrequency
description: Specify frequency for basic block execution.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 12.4. Pragma Strings:

---
title: "12.4. Pragma Strings:"frequency""
section: 12.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 12.4. Pragma Strings:"frequency"


`"frequency"`

Specify frequency for basic block execution.

Syntax

.pragma "frequency n";

Description

The `"frequency" pragma` is a directive that specifies the number of times a basic block is executed by an executing thread. The optimizing compiler backend treats this pragma as a hint which will be used for optimizations.

Operand `n` is a 64-bit non-negative integer constant that specifies the execution frequency.

Note that in order to have the desired effect of this pragma, it should be specified at the start of the basic block. Basic block is defined as a straight-line sequence of instructions with only one entry point and one exit point.

PTX ISA Notes

Introduced in PTX ISA version 9.0.

Target ISA Notes

Supported on all target architectures.

Examples

.entry foo (...)
    {
        .pragma "frequency 32";
        ...
    }