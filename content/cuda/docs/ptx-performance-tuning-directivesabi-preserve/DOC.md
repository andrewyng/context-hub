---
name: ptx-performance-tuning-directivesabi-preserve
description: Specify number of general purpose registers that should be preserved
  by the callers of this function.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.8. Performance-Tuning Directives:.abi_preserve

---
title: "11.4.8. Performance-Tuning Directives:.abi_preserve"
section: 11.4.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.8. Performance-Tuning Directives:.abi_preserve


`.abi_preserve`

Specify number of general purpose registers that should be preserved by the callers of this function.

Syntax

.abi_preserve N

Description

It is an architecture agnostic value specifying actual number of general purpose registers. Internally ABI defines some general purpose registers as preserved (callee save) registers. Integer N specifies the actual number of general purpose registers that should be preserved by the function.

`.abi_preserve` directive can only be specified on device functions and must appear between a `.func` directive and its body.

Semantics

When this directive is specified compiler backend modifies low level ABI components to ensure that number of live data variables in the callers of this function that are stored in the callee save registers are less than specified value.

PTX ISA Notes

Introduced in PTX ISA version 9.0.

Target ISA Notes

Requires `sm_80` or higher.

Examples

.func bar() .abi_preserve 8
    
    // Indirect call via call prototype
    .func (.param .b32 out[30]) foo (.param .b32 in[30]) .abi_preserve 10 { ... }
    ...
    mov.b64 lpfoo, foo;
    prot: .callprototype (.param .b32 out[30]) _ (.param .b32 in[30]) .abi_preserve 10;
    call (out), lpfoo, (in), prot;