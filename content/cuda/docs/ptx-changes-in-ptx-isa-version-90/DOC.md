---
name: ptx-changes-in-ptx-isa-version-90
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.2. Changes in PTX ISA Version 9.0

---
title: "13.2. Changes in PTX ISA Version 9.0"
section: 13.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.2. Changes in PTX ISA Version 9.0


New Features

PTX ISA version 9.0 introduces the following new features:

* Adds support for `sm_88` target architecture.

  * Adds support for `sm_110` target architecture.

  * Adds support for target `sm_110f` that supports family-specific features.

  * Adds support for target `sm_110a` that supports architecture-specific features.

  * Adds support for pragma `enable_smem_spilling` that is used to enable shared memory spilling for a function.

  * Adds support for pragma `frequency` that is used to specify the execution frequency of a basic block.

  * Adds support for directive `.blocksareclusters` that is used to specify that CUDA thread blocks are mapped to clusters.

  * Extends `size` operand of `st.bulk` instruction to support 32-bit length.

  * Adds support for performance-tuning directives `.abi_preserve` and `.abi_preserve_control` that are used to specify the number of data and control registers that should be preserved by the callers of a function.

Notes

* Targets `sm_{101,101f,101a}` are renamed to targets `sm_{110,110f,110a}` from PTX ISA version 9.0.

Semantic Changes and Clarifications

* All `tcgen05` instructions(`tcgen05.alloc`, `tcgen05.dealloc`, `tcgen05.relinquish_alloc_permit`, `tcgen05.cp`, `tcgen05.shift`, `tcgen05.mma`, `tcgen05.mma.sp`, `tcgen05.mma.ws, tcgen05.mma.ws.sp`, `tcgen05.commit`) within a kernel must specify the same value for the `.cta_group` qualifier.