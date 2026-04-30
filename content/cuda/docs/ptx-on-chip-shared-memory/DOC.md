---
name: ptx-on-chip-shared-memory
description: 'As illustrated by [Figure 4](<#set-of-simt-multiprocessors-hardware-model>),
  each multiprocessor has on-chip memory of the four following types:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 3.3. On-chip Shared Memory

---
title: "3.3. On-chip Shared Memory"
section: 3.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 3.3. On-chip Shared Memory


As illustrated by [Figure 4](<#set-of-simt-multiprocessors-hardware-model>), each multiprocessor has on-chip memory of the four following types:

* One set of local 32-bit _registers_ per processor,

  * A parallel data cache or _shared memory_ that is shared by all scalar processor cores and is where the shared memory space resides,

  * A read-only _constant cache_ that is shared by all scalar processor cores and speeds up reads from the constant memory space, which is a read-only region of device memory,

  * A read-only _texture cache_ that is shared by all scalar processor cores and speeds up reads from the texture memory space, which is a read-only region of device memory; each multiprocessor accesses the texture cache via a _texture unit_ that implements the various addressing modes and data filtering.

The local and global memory spaces are read-write regions of device memory.