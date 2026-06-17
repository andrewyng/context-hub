---
name: ptx-brxidx
description: Branch to a label indexed from a list of potential branch targets.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.12.4. Control Flow Instructions:brx.idx

---
title: "9.7.12.4. Control Flow Instructions:brx.idx"
section: 9.7.12.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.12.4. Control Flow Instructions:brx.idx


`brx.idx`

Branch to a label indexed from a list of potential branch targets.

Syntax

@p    brx.idx{.uni} index, tlist;
          brx.idx{.uni} index, tlist;

Description

Index into a list of possible destination labels, and continue execution from the chosen label. Conditional branches are specified by using a guard predicate.

`brx.idx.uni` guarantees that the branch is non-divergent, i.e. all active threads in a warp that are currently executing this instruction have identical values for the guard predicate and the `index` argument.

The `index` operand is a `.u32` register. The `tlist` operand must be the label of a `.branchtargets` directive. It is accessed as a zero-based sequence using `index`. Behaviour is undefined if the value of `index` is greater than or equal to the length of `tlist`.

The `.branchtargets` directive must be defined in the local function scope before it is used. It must refer to labels within the current function.

Semantics

if (p) {
        if (index < length(tlist)) {
          pc = tlist[index];
        } else {
          pc = undefined;
        }
    }

PTX ISA Notes

Introduced in PTX ISA version 6.0.

Target ISA Notes

Requires `sm_30` or higher.

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
    }