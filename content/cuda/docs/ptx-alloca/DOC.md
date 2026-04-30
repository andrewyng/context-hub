---
name: ptx-alloca
description: PTX provides `alloca` instruction for allocating storage at runtime on
  the per-thread local memory stack. The allocated stack memory can be accessed with
  `ld.local` and `st.local` instructions using t...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 7.3. Alloca

---
title: "7.3. Alloca"
section: 7.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 7.3. Alloca


PTX provides `alloca` instruction for allocating storage at runtime on the per-thread local memory stack. The allocated stack memory can be accessed with `ld.local` and `st.local` instructions using the pointer returned by `alloca`.

In order to facilitate deallocation of memory allocated with `alloca`, PTX provides two additional instructions: `stacksave` which allows reading the value of stack pointer in a local variable, and `stackrestore` which can restore the stack pointer with the saved value.

`alloca`, `stacksave`, and `stackrestore` instructions are described in [Stack Manipulation Instructions](<#stack-manipulation-instructions>).