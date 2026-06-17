---
name: ptx-control-flow-directivescalltargets
description: Declare a list of potential call targets.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.3.2. Control Flow Directives:.calltargets

---
title: "11.3.2. Control Flow Directives:.calltargets"
section: 11.3.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.3.2. Control Flow Directives:.calltargets


`.calltargets`

Declare a list of potential call targets.

Syntax

Label:   .calltargets  list-of-functions ;

Description

Declares a list of potential call targets for a subsequent indirect call, and associates the list with the label at the start of the line.

All functions named in the list must be declared prior to the `.calltargets` directive, and all functions must have the same type signature.

PTX ISA Notes

Introduced in PTX ISA version 2.1.

Target ISA Notes

Requires `sm_20` or higher.

Examples

calltgt:  .calltargets  fastsin, fastcos;
    ...
    @p   call  (%f1), %r0, (%x), calltgt;
    ...