---
name: ptx-variadic-functions
description: Note
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 7.2. Variadic Functions

---
title: "7.2. Variadic Functions"
section: 7.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 7.2. Variadic Functions


Note

**Support for variadic functions which was unimplemented has been removed from the spec.**

PTX version 6.0 supports passing unsized array parameter to a function which can be used to implement variadic functions.

Refer to [Kernel and Function Directives: .func](<#kernel-and-function-directives-func>) for details