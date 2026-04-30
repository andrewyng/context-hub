---
name: ptx-release-and-acquire-patterns
description: Some sequences of instructions give rise to patterns that participate
  in memory synchronization as described later. The _release_ pattern makes prior
  operations from the current thread1 visible to som...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.8. Release and Acquire Patterns

---
title: "8.8. Release and Acquire Patterns"
section: 8.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 8.8. Release and Acquire Patterns


Some sequences of instructions give rise to patterns that participate in memory synchronization as described later. The _release_ pattern makes prior operations from the current thread1 visible to some operations from other threads. The _acquire_ pattern makes some operations from other threads visible to later operations from the current thread.

A _release_ pattern on a location M consists of one of the following:

1. A _release_ operation on M  
  
E.g.: `st.release [M];` or `atom.release [M];` or `mbarrier.arrive.release [M];`

  2. Or a _release_ or _acquire-release_ operation on M followed by a _strong_ write on M in _program order_

E.g.: `st.release [M]`; `st.relaxed [M];`

  3. Or a _release_ or _acquire-release_ _memory fence_ followed by a _strong_ write on M in _program order_

E.g.: `fence.release; st.relaxed [M];` or `fence.release; atom.relaxed [M];`

Any _memory synchronization_ established by a _release_ pattern only affects operations occurring in _program order_ before the first instruction in that pattern.

An _acquire_ pattern on a location M consists of one of the following:

1. An _acquire_ operation on M

E.g.: `ld.acquire [M];` or `atom.acquire [M];` or `mbarrier.test_wait.acquire [M];`

  2. Or a _strong_ read on M followed by an _acquire_ operation on M in _program order_

E.g.: `ld.relaxed [M]; ld.acquire [M];`

  3. Or a _strong_ read on M followed by an acquire _memory fence_ in _program order_

E.g.: `ld.relaxed [M]; fence.acquire;` or `atom.relaxed [M]; fence.acquire;`

Any _memory synchronization_ established by an _acquire_ pattern only affects operations occurring in _program order_ after the last instruction in that pattern.

Note that while atomic reductions conceptually perform a strong read as part of its read-modify-write sequence, this strong read does not form an acquire pattern.

> E.g.: `red.add [M], 1; fence.acquire;` is not an acquire pattern.

1 For both _release_ and _acquire_ patterns, this effect is further extended to operations in other threads through the transitive nature of _causality order_.