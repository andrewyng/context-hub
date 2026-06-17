---
name: ptx-kernel-function-parameter-attributes
description: Kernel function parameters may be declared with an optional .ptr attribute
  to indicate that a parameter is a pointer to memory, and also indicate the state
  space and alignment of the memory being poin...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.6.2. Kernel Function Parameter Attributes

---
title: "5.1.6.2. Kernel Function Parameter Attributes"
section: 5.1.6.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.1.6.2. Kernel Function Parameter Attributes


Kernel function parameters may be declared with an optional .ptr attribute to indicate that a parameter is a pointer to memory, and also indicate the state space and alignment of the memory being pointed to. [Kernel Parameter Attribute: .ptr](<#kernel-parameter-attribute-ptr>) describes the `.ptr` kernel parameter attribute.