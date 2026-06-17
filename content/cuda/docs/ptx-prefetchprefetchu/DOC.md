---
name: ptx-prefetchprefetchu
description: '`prefetch`, `prefetchu`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.15. Data Movement and Conversion Instructions:prefetch,prefetchu

---
title: "9.7.9.15. Data Movement and Conversion Instructions:prefetch,prefetchu"
section: 9.7.9.15
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.15. Data Movement and Conversion Instructions:prefetch,prefetchu


`prefetch`, `prefetchu`

Prefetch line containing a generic address at a specified level of memory hierarchy, in specified state space.

Syntax

prefetch{.space}.level                    [a];   // prefetch to data cache
    prefetch.global.level::eviction_priority  [a];   // prefetch to data cache
    
    prefetchu.L1  [a];             // prefetch to uniform cache
    
    prefetch{.tensormap_space}.tensormap [a];  // prefetch the tensormap
    
    .space =                    { .global, .local };
    .level =                    { .L1, .L2 };
    .level::eviction_priority = { .L2::evict_last, .L2::evict_normal };
    .tensormap_space =          { .const, .param };

Description

The `prefetch` instruction brings the cache line containing the specified address in global or local memory state space into the specified cache level.

If the `.tensormap` qualifier is specified then the `prefetch` instruction brings the cache line containing the specified address in the `.const` or `.param` memory state space for subsequent use by the `cp.async.bulk.tensor` instruction.

If no state space is given, the `prefetch` uses [Generic Addressing](<#generic-addressing>).

Optionally, the eviction priority to be applied on the prefetched cache line can be specified by the modifier `.level::eviction_priority`.

Supported addressing modes for operand `a` and alignment requirements are described in [Addresses as Operands](<#addresses-as-operands>)

The `prefetchu` instruction brings the cache line containing the specified generic address into the specified uniform cache level.

A `prefetch` to a shared memory location performs no operation.

A `prefetch` into the uniform cache requires a generic address, and no operation occurs if the address maps to a `const`, `local`, or `shared` memory location.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Support for `.level::eviction_priority` qualifier introduced in PTX ISA version 7.4.

Support for the `.tensormap` qualifier is introduced in PTX ISA version 8.0.

Target ISA Notes

`prefetch` and `prefetchu` require `sm_20` or higher.

Support for `.level::eviction_priority` qualifier requires `sm_80` or higher.

Support for the `.tensormap` qualifier requires `sm_90` or higher.

Examples

prefetch.global.L1             [ptr];
    prefetch.global.L2::evict_last [ptr];
    prefetchu.L1  [addr];
    prefetch.const.tensormap       [ptr];