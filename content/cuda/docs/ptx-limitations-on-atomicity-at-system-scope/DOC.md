---
name: ptx-limitations-on-atomicity-at-system-scope
description: When communicating with the host CPU, certain strong operations with
  system scope may not be performed atomically on some systems. For more details on
  atomicity guarantees to host memory, see the _CUD...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.1.1. Limitations on atomicity at system scope

---
title: "8.1.1. Limitations on atomicity at system scope"
section: 8.1.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.1.1. Limitations on atomicity at system scope


When communicating with the host CPU, certain strong operations with system scope may not be performed atomically on some systems. For more details on atomicity guarantees to host memory, see the _CUDA Atomicity Requirements_.