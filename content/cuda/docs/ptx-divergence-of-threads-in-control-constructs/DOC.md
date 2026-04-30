---
name: ptx-divergence-of-threads-in-control-constructs
description: Threads in a CTA execute together, at least in appearance, until they
  come to a conditional control construct such as a conditional branch, conditional
  function call, or conditional return. If threads...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.5. Divergence of Threads in Control Constructs

---
title: "9.5. Divergence of Threads in Control Constructs"
section: 9.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 9.5. Divergence of Threads in Control Constructs


Threads in a CTA execute together, at least in appearance, until they come to a conditional control construct such as a conditional branch, conditional function call, or conditional return. If threads execute down different control flow paths, the threads are called _divergent_. If all of the threads act in unison and follow a single control flow path, the threads are called _uniform_. Both situations occur often in programs.

A CTA with divergent threads may have lower performance than a CTA with uniformly executing threads, so it is important to have divergent threads re-converge as soon as possible. All control constructs are assumed to be divergent points unless the control-flow instruction is marked as uniform, using the `.uni` suffix. For divergent control flow, the optimizing code generator automatically determines points of re-convergence. Therefore, a compiler or code author targeting PTX can ignore the issue of divergent threads, but has the opportunity to improve performance by marking branch points as uniform when the compiler or author can guarantee that the branch point is non-divergent.