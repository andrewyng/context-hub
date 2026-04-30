---
name: ptx-parameterized-variable-names
description: Since PTX supports virtual registers, it is quite common for a compiler
  frontend to generate a large number of register names. Rather than require explicit
  declaration of every name, PTX supports a sy...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.6. Parameterized Variable Names

---
title: "5.4.6. Parameterized Variable Names"
section: 5.4.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.6. Parameterized Variable Names


Since PTX supports virtual registers, it is quite common for a compiler frontend to generate a large number of register names. Rather than require explicit declaration of every name, PTX supports a syntax for creating a set of variables having a common prefix string appended with integer suffixes.

For example, suppose a program uses a large number, say one hundred, of `.b32` variables, named `%r0`, `%r1`, …, `%r99`. These 100 register variables can be declared as follows:

.reg .b32 %r<100>;    // declare %r0, %r1, ..., %r99

This shorthand syntax may be used with any of the fundamental types and with any state space, and may be preceded by an alignment specifier. Array variables cannot be declared this way, nor are initializers permitted.