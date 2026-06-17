---
name: ptx-volatile-operation
description: A _volatile_ operation is a memory operation with `.volatile` qualifier
  specified. The semantics of volatile operations are equivalent to a relaxed memory
  operation with system-scope but with the foll...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.4.2. volatile Operation

---
title: "8.4.2. volatile Operation"
section: 8.4.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.4.2. volatile Operation


A _volatile_ operation is a memory operation with `.volatile` qualifier specified. The semantics of volatile operations are equivalent to a relaxed memory operation with system-scope but with the following extra implementation-specific constraints:

* The number of volatile _instructions_ (not operations) executed by a program is preserved. Hardware may combine and merge volatile _operations_ issued by multiple different volatile _instructions_ , that is, the number of volatile _operations_ in the program is not preserved.

  * Volatile _instructions_ are not re-ordered around other volatile _instructions_ , but the memory _operations_ performed by those _instructions_ may be re-ordered around each other.

Note

PTX volatile operations are intended for compilers to lower volatile read and write operations from CUDA C++, and other programming languages sharing CUDA C++ volatile semantics, to PTX.

Since volatile operations are relaxed at system-scope with extra constraints, prefer using other _strong_ read or write operations (e.g. `ld.relaxed.sys` or `st.relaxed.sys`) for **Inter-Thread Synchronization** instead, which may deliver better performance.

PTX volatile operations are not suited for **Memory Mapped IO (MMIO)** because volatile operations do not preserve the number of memory operations performed, and may perform more or less operations than requested in a non-deterministic way. Use [.mmio operations](<#mmio-operation>) instead, which strictly preserve the number of operations performed.