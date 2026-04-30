---
name: ptx-control-flow-directivesbranchtargets
description: Declare a list of potential branch targets.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.3.1. Control Flow Directives:.branchtargets

---
title: "11.3.1. Control Flow Directives:.branchtargets"
section: 11.3.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.3.1. Control Flow Directives:.branchtargets


`.branchtargets`

Declare a list of potential branch targets.

Syntax

Label:   .branchtargets  list-of-labels ;

Description

Declares a list of potential branch targets for a subsequent `brx.idx`, and associates the list with the label at the start of the line.

All control flow labels in the list must occur within the same function as the declaration.

The list of labels may use the compact, shorthand syntax for enumerating a range of labels having a common prefix, similar to the syntax described in [Parameterized Variable Names](<#parameterized-variable-names>).

PTX ISA Notes

Introduced in PTX ISA version 2.1.

Target ISA Notes

Requires `sm_20` or higher.

Examples

.function foo () {
          .reg .u32 %r0;
          ...
          L1:
          ...
          L2:
          ...
          L3:
          ...
          ts: .branchtargets L1, L2, L3;
          @p brx.idx %r0, ts;
          ...
    
    .function bar() {
          .reg .u32 %r0;
          ...
          N0:
          ...
          N1:
          ...
          N2:
          ...
          N3:
          ...
          N4:
          ...
          ts: .branchtargets N<5>;
          @p brx.idx %r0, ts;
          ...