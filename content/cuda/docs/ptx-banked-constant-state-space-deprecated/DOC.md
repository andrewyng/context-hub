---
name: ptx-banked-constant-state-space-deprecated
description: Previous versions of PTX exposed constant memory as a set of eleven 64
  KB banks, with explicit bank numbers required for variable declaration and during
  access.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.3.1. Banked Constant State Space (deprecated)

---
title: "5.1.3.1. Banked Constant State Space (deprecated)"
section: 5.1.3.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.1.3.1. Banked Constant State Space (deprecated)


Previous versions of PTX exposed constant memory as a set of eleven 64 KB banks, with explicit bank numbers required for variable declaration and during access.

Prior to PTX ISA version 2.2, the constant memory was organized into fixed size banks. There were eleven 64 KB banks, and banks were specified using the `.const[bank]` modifier, where _bank_ ranged from 0 to 10. If no bank number was given, bank zero was assumed.

By convention, bank zero was used for all statically-sized constant variables. The remaining banks were used to declare _incomplete_ constant arrays (as in C, for example), where the size is not known at compile time. For example, the declaration

.extern .const[2] .b32 const_buffer[];

resulted in `const_buffer` pointing to the start of constant bank two. This pointer could then be used to access the entire 64 KB constant bank. Multiple incomplete array variables declared in the same bank were aliased, with each pointing to the start address of the specified constant bank.

To access data in contant banks 1 through 10, the bank number was required in the state space of the load instruction. For example, an incomplete array in bank 2 was accessed as follows:

.extern .const[2] .b32 const_buffer[];
    ld.const[2].b32  %r1, [const_buffer+4]; // load second word

In PTX ISA version 2.2, we eliminated explicit banks and replaced the incomplete array representation of driver-allocated constant buffers with kernel parameter attributes that allow pointers to constant buffers to be passed as kernel parameters.