---
name: ptx-proxies
description: A _memory proxy_ , or a _proxy_ is an abstract label applied to a method
  of memory access. When two memory operations use distinct methods of memory access,
  they are said to be different _proxies_.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.6. Proxies

---
title: "8.6. Proxies"
section: 8.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 8.6. Proxies


A _memory proxy_ , or a _proxy_ is an abstract label applied to a method of memory access. When two memory operations use distinct methods of memory access, they are said to be different _proxies_.

Memory operations as defined in [Operation types](<#operation-types>) use _generic_ method of memory access, i.e. a _generic proxy_. Other operations such as textures and surfaces all use distinct methods of memory access, also distinct from the _generic_ method.

A _proxy fence_ is required to synchronize memory operations across different _proxies_. Although virtual aliases use the _generic_ method of memory access, since using distinct virtual addresses behaves as if using different _proxies_ , they require a _proxy fence_ to establish memory ordering.