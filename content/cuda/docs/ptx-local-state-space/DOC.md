---
name: ptx-local-state-space
description: The local state space (`.local`) is private memory for each thread to
  keep its own data. It is typically standard memory with cache. The size is limited,
  as it must be allocated on a per-thread basis....
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.5. Local State Space

---
title: "5.1.5. Local State Space"
section: 5.1.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.1.5. Local State Space


The local state space (`.local`) is private memory for each thread to keep its own data. It is typically standard memory with cache. The size is limited, as it must be allocated on a per-thread basis. Use `ld.local` and `st.local` to access local variables.

When compiling to use the _Application Binary Interface (ABI)_ , `.local` state-space variables must be declared within function scope and are allocated on the stack. In implementations that do not support a stack, all local memory variables are stored at fixed addresses, recursive function calls are not supported, and `.local` variables may be declared at module scope. When compiling legacy PTX code (ISA versions prior to 3.0) containing module-scoped `.local` variables, the compiler silently disables use of the ABI.