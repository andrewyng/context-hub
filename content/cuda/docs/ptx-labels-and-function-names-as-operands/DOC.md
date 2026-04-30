---
name: ptx-labels-and-function-names-as-operands
description: Labels and function names can be used only in `bra`/`brx.idx` and `call`
  instructions respectively. Function names can be used in `mov` instruction to get
  the address of the function into a register, ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.4.4. Labels and Function Names as Operands

---
title: "6.4.4. Labels and Function Names as Operands"
section: 6.4.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 6.4.4. Labels and Function Names as Operands


Labels and function names can be used only in `bra`/`brx.idx` and `call` instructions respectively. Function names can be used in `mov` instruction to get the address of the function into a register, for use in an indirect call.

Beginning in PTX ISA version 3.1, the `mov` instruction may be used to take the address of kernel functions, to be passed to a system call that initiates a kernel launch from the GPU. This feature is part of the support for CUDA Dynamic Parallelism. See the _CUDA Dynamic Parallelism Programming Guide_ for details.