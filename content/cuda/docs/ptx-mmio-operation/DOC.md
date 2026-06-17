---
name: ptx-mmio-operation
description: An _mmio_ operation is a memory operation with `.mmio` qualifier specified.
  It is usually performed on a memory location which is mapped to the control registers
  of peer I/O devices. It can also be us...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.4.1. mmio Operation

---
title: "8.4.1. mmio Operation"
section: 8.4.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.4.1. mmio Operation


An _mmio_ operation is a memory operation with `.mmio` qualifier specified. It is usually performed on a memory location which is mapped to the control registers of peer I/O devices. It can also be used for communication between threads but has poor performance relative to non-_mmio_ operations.

The semantic meaning of _mmio_ operations cannot be defined precisely as it is defined by the underlying I/O device. For formal specification of semantics of _mmio_ operation from Memory Consistency Model perspective, it is equivalent to the semantics of a _strong_ operation. But it follows a few implementation-specific properties, if it meets the _CUDA atomicity requirements_ at the specified scope:

* Writes are always performed and are never combined within the scope specified.

  * Reads are always performed, and are not forwarded, prefetched, combined, or allowed to hit any cache within the scope specified.

    * As an exception, in some implementations, the surrounding locations may also be loaded. In such cases the amount of data loaded is implementation specific and varies between 32 and 128 bytes in size.