---
name: ptx-scope
description: Each _strong_ operation must specify a _scope_ , which is the set of
  threads that may interact directly with that operation and establish any of the
  relations described in the memory consistency model...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.5. Scope

---
title: "8.5. Scope"
section: 8.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 8.5. Scope


Each _strong_ operation must specify a _scope_ , which is the set of threads that may interact directly with that operation and establish any of the relations described in the memory consistency model. There are four scopes:

Table 21 Scopes Scope | Description  
---|---  
`.cta` | The set of all threads executing in the same CTA as the current thread.  
`.cluster` | The set of all threads executing in the same cluster as the current thread.  
`.gpu` | The set of all threads in the current program executing on the same compute device as the current thread. This also includes other kernel grids invoked by the host program on the same compute device.  
`.sys` | The set of all threads in the current program, including all kernel grids invoked by the host program on all compute devices, and all threads constituting the host program itself.

Note that the warp is not a _scope_ ; the CTA is the smallest collection of threads that qualifies as a _scope_ in the memory consistency model.