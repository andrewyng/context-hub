---
name: ptx-applypriority
description: Apply the cache eviction priority to the specified address in the specified
  cache level.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.16. Data Movement and Conversion Instructions:applypriority

---
title: "9.7.9.16. Data Movement and Conversion Instructions:applypriority"
section: 9.7.9.16
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.16. Data Movement and Conversion Instructions:applypriority


`applypriority`

Apply the cache eviction priority to the specified address in the specified cache level.

Syntax

applypriority{.global}.level::eviction_priority  [a], size;
    
    .level::eviction_priority = { .L2::evict_normal };

Description

The `applypriority` instruction applies the cache eviction priority specified by the `.level::eviction_priority` qualifier to the address range `[a..a+size)` in the specified cache level.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the specified address does not fall within the address window of `.global` state space then the behavior is undefined.

The operand `size` is an integer constant that specifies the amount of data, in bytes, in the specified cache level on which the priority is to be applied. The only supported value for the `size` operand is 128.

Supported addressing modes for operand `a` are described in [Addresses as Operands](<#addresses-as-operands>). `a` must be aligned to 128 bytes.

PTX ISA Notes

Introduced in PTX ISA version 7.4.

Target ISA Notes

Requires `sm_80` or higher.

Examples

applypriority.global.L2::evict_normal [ptr], 128;