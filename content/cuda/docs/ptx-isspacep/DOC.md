---
name: ptx-isspacep
description: Query whether a generic address falls within a specified state space
  window.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.19. Data Movement and Conversion Instructions:isspacep

---
title: "9.7.9.19. Data Movement and Conversion Instructions:isspacep"
section: 9.7.9.19
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.19. Data Movement and Conversion Instructions:isspacep


`isspacep`

Query whether a generic address falls within a specified state space window.

Syntax

isspacep.space  p, a;    // result is .pred
    
    .space = { const, .global, .local, .shared{::cta, ::cluster}, .param{::entry} };

Description

Write predicate register `p` with `1` if generic address a falls within the specified state space window and with `0` otherwise. Destination `p` has type `.pred`; the source address operand must be of type `.u32` or `.u64`.

`isspacep.param{::entry}` returns `1` if the generic address falls within the window of [Kernel Function Parameters](<#kernel-function-parameters>), otherwise returns `0`. If `.param` is specified without any sub-qualifiers then it defaults to `.param::entry`.

`isspacep.global` returns `1` for [Kernel Function Parameters](<#kernel-function-parameters>) as `.param` window is contained within the `.global` window.

If no sub-qualifier is specified with `.shared` state space, then `::cta` is assumed by default.

Note

`ispacep.shared::cluster` will return 1 for every shared memory address that is accessible to the threads in the cluster, whereas `ispacep.shared::cta` will return 1 only if the address is of a variable declared in the executing CTA.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

`isspacep.const` introduced in PTX ISA version 3.1.

`isspacep.param` introduced in PTX ISA version 7.7.

Support for `::cta` and `::cluster` sub-qualifiers introduced in PTX ISA version 7.8.

Support for sub-qualifier `::entry` on `.param` space introduced in PTX ISA version 8.3.

Target ISA Notes

`isspacep` requires `sm_20` or higher.

`isspacep.param{::entry}` requires `sm_70` or higher.

Sub-qualifier `::cta` requires `sm_30` or higher.

Sub-qualifier `::cluster` requires `sm_90` or higher.

Examples

isspacep.const           iscnst, cptr;
    isspacep.global          isglbl, gptr;
    isspacep.local           islcl,  lptr;
    isspacep.shared          isshrd, sptr;
    isspacep.param::entry    isparam, pptr;
    isspacep.shared::cta     isshrdcta, sptr;
    isspacep.shared::cluster ishrdany sptr;