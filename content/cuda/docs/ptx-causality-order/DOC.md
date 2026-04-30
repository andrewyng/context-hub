---
name: ptx-causality-order
description: "_Causality order_ captures how memory operations become visible across\
  \ threads through synchronizing operations. The axiom \u201CCausality\u201D uses\
  \ this order to constrain the set of write operations from whi..."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.9.5. Causality Order

---
title: "8.9.5. Causality Order"
section: 8.9.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.9.5. Causality Order


_Causality order_ captures how memory operations become visible across threads through synchronizing operations. The axiom “Causality” uses this order to constrain the set of write operations from which a read operation may read a value.

Relations in the _causality order_ primarily consist of relations in _Base causality order_ 1 , which is a transitive order, determined at runtime.

Base causality order

An operation X precedes an operation Y in _base causality order_ if:

1. X precedes Y in _program order_ , or

  2. X _synchronizes_ with Y, or

  3. For some operation Z,

     1. X precedes Z in _program order_ and Z precedes Y in _base causality order_ , or

     2. X precedes Z in _base causality order_ and Z precedes Y in _program order_ , or

     3. X precedes Z in _base causality order_ and Z precedes Y in _base causality order_.

Proxy-preserved base causality order

A memory operation X precedes a memory operation Y in _proxy-preserved base causality order_ if X precedes Y in _base causality order_ , and:

1. X and Y are performed to the same address, using the _generic proxy_ , or

  2. X and Y are performed to the same address, using the same _proxy_ , and by the same thread block, or

  3. X and Y are aliases and there is an alias _proxy fence_ along the base causality path from X to Y.

Causality order

_Causality order_ combines _base causality order_ with some non-transitive relations as follows:

An operation X precedes an operation Y in _causality order_ if:

1. X precedes Y in _proxy-preserved base causality order_ , or

  2. For some operation Z, X precedes Z in observation order, and Z precedes Y in _proxy-preserved base causality order_.

1 The transitivity of _base causality order_ accounts for the “cumulativity” of synchronizing operations.