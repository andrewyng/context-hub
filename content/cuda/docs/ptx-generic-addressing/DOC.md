---
name: ptx-generic-addressing
description: If a memory instruction does not specify a state space, the operation
  is performed using generic addressing. The state spaces `.const`, [Kernel Function
  Parameters](<#kernel-function-parameters>) (`.p...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.4.1.1. Generic Addressing

---
title: "6.4.1.1. Generic Addressing"
section: 6.4.1.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 6.4.1.1. Generic Addressing


If a memory instruction does not specify a state space, the operation is performed using generic addressing. The state spaces `.const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `.local` and `.shared` are modeled as windows within the generic address space. Each window is defined by a window base and a window size that is equal to the size of the corresponding state space. A generic address maps to `global` memory unless it falls within the window for `const`, `local`, or `shared` memory. The [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`) window is contained within the `.global` window. Within each window, a generic address maps to an address in the underlying state space by subtracting the window base from the generic address.