---
name: ptx-state-spaces
description: The relations defined in the memory consistency model are independent
  of state spaces. In particular, causality order closes over all memory operations
  across all the state spaces. But the side-effect...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.3. State spaces

---
title: "8.3. State spaces"
section: 8.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 8.3. State spaces


The relations defined in the memory consistency model are independent of state spaces. In particular, causality order closes over all memory operations across all the state spaces. But the side-effect of a memory operation in one state space can be observed directly only by operations that also have access to the same state space. This further constrains the synchronizing effect of a memory operation in addition to scope. For example, the synchronizing effect of the PTX instruction `ld.relaxed.shared.sys` is identical to that of `ld.relaxed.shared.cluster`, since no thread outside the same cluster can execute an operation that accesses the same memory location.