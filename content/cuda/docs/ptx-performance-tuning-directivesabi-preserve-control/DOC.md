---
name: ptx-performance-tuning-directivesabi-preserve-control
description: '`.abi_preserve_control`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.9. Performance-Tuning Directives:.abi_preserve_control

---
title: "11.4.9. Performance-Tuning Directives:.abi_preserve_control"
section: 11.4.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.9. Performance-Tuning Directives:.abi_preserve_control


`.abi_preserve_control`

Specify number of control registers that should be preserved by the callers of this function.

Syntax

.abi_preserve_control N

Description

It is an architecture agnostic value specifying the number of divergent program points that happen in the calltree leading to current function call. Internally ABI defines some control registers as preserved (callee save) registers. Integer N specifies the actual number of control registers that should be preserved by the function.

`.abi_preserve_control` directive can only be specified on device functions and must appear between a `.func` directive and its body.

Semantics

When this directive is specified compiler backend modifies low level ABI components to ensure that number of live control variables in the callers of this function that are stored in the callee save control registers are less than specified value.

PTX ISA Notes

Introduced in PTX ISA version 9.0.

Target ISA Notes

Requires `sm_80` or higher.

Examples

.func foo() .abi_preserve_control 14
    
    // Indirect call via call prototype
    .func (.param .b32 out[30]) bar (.param .b32 in[30]) .abi_preserve_control 10 { ... }
    ...
    mov.b64 lpbar, bar;
    prot: .callprototype (.param .b32 out[30]) _ (.param .b32 in[30]) .abi_preserve_control 10;
    call (out), lpbar, (in), prot;