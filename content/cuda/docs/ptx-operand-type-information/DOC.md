---
name: ptx-operand-type-information
description: All operands in instructions have a known type from their declarations.
  Each operand type must be compatible with the type determined by the instruction
  template and instruction type. There is no auto...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.1. Operand Type Information

---
title: "6.1. Operand Type Information"
section: 6.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 6.1. Operand Type Information


All operands in instructions have a known type from their declarations. Each operand type must be compatible with the type determined by the instruction template and instruction type. There is no automatic conversion between types.

The bit-size type is compatible with every type having the same size. Integer types of a common size are compatible with each other. Operands having type different from but compatible with the instruction type are silently cast to the instruction type.