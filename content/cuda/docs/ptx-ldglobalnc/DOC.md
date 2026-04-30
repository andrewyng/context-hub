---
name: ptx-ldglobalnc
description: Load a register variable from global state space via non-coherent cache.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.9. Data Movement and Conversion Instructions:ld.global.nc

---
title: "9.7.9.9. Data Movement and Conversion Instructions:ld.global.nc"
section: 9.7.9.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.9. Data Movement and Conversion Instructions:ld.global.nc


`ld.global.nc`

Load a register variable from global state space via non-coherent cache.

Syntax

ld.global{.cop}.nc{.level::cache_hint}{.level::prefetch_size}.type                 d, [a]{, cache-policy};
    ld.global{.cop}.nc{.level::cache_hint}{.level::prefetch_size}.vec.type             d, [a]{, cache-policy};
    
    ld.global.nc{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.level::prefetch_size}.type      d, [a]{, cache-policy};
    ld.global.nc{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.level::prefetch_size}.vec.type  d, [a]{, cache-policy};
    
    .cop  =                     { .ca, .cg, .cs };     // cache operation
    .level1::eviction_priority = { .L1::evict_normal, .L1::evict_unchanged,
                                   .L1::evict_first, .L1::evict_last, .L1::no_allocate};
    .level2::eviction_priority = {.L2::evict_normal, .L2::evict_first, .L2::evict_last};
    .level::cache_hint =        { .L2::cache_hint };
    .level::prefetch_size =     { .L2::64B, .L2::128B, .L2::256B }
    .vec  =                     { .v2, .v4, .v8 };
    .type =                     { .b8, .b16, .b32, .b64, .b128,
                                  .u8, .u16, .u32, .u64,
                                  .s8, .s16, .s32, .s64,
                                  .f32, .f64 };

Description

Load register variable `d` from the location specified by the source address operand `a` in the global state space, and optionally cache in non-coherent read-only cache.

Note

On some architectures, the texture cache is larger, has higher bandwidth, and longer latency than the global memory cache. For applications with sufficient parallelism to cover the longer latency, `ld.global.nc` should offer better performance than `ld.global` on such architectures.

The address operand `a` shall contain a global address. Supported addressing modes for operand `a` and alignment requirements are described in [Addresses as Operands](<#addresses-as-operands>).

The `.v8` (`.vec`) qualifier is supported if:

* `.type` is `.b32`, `.s32`, `.u32`, or `.f32` AND

  * State space is `.global` or with generic addressing where address points to `.global` state space

The `.v4` (`.vec`) qualifier with type `.b64` or `.s64` or `.u64` or `.f64` is supported if:

* State space is `.global` or with generic addressing where address points to `.global` state space

Qualifiers `.level1::eviction_priority` and `.level2::eviction_priority` specify the eviction policy for L1 and L2 cache respectively which may be applied during memory access.

Qualifier `.level2::eviction_priority` is supported if:

* `.vec` is `.v8` and `.type` is `.b32` or `.s32` or `.u32` or `.f32`

    * AND Operand `d` is vector of 8 registers with type specified with `.type`

  * OR `.vec` is `.v4` and `.type` is `.b64` or `.s64` or `.u64` or `.f64`

    * AND Operand `d` is vector of 4 registers with type specified with `.type`

Optionally, sink symbol ‘_’ can be used in vector expression `d` when:

* `.vec` is `.v8` and `.type` is `.b32` or `.s32` or `.u32` or `.f32` OR

  * `.vec` is `.v4` and `.type` is `.b64` or `.s64` or `.u64` or `.f64`

which indicates that data from corresponding memory location is not read.

The `.level::prefetch_size` qualifier is a hint to fetch additional data of the specified size into the respective cache level.The sub-qualifier `prefetch_size` can be set to either of `64B`, `128B`, `256B` thereby allowing the prefetch size to be 64 Bytes, 128 Bytes or 256 Bytes respectively.

The `.level::prefetch_size` qualifier is treated as a performance hint only.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

Semantics

d = a;             // named variable a
    d = *(&a+immOff)   // variable-plus-offset
    d = *a;            // register
    d = *(a+immOff);   // register-plus-offset
    d = *(immAddr);    // immediate address

Notes

Destination `d` must be in the `.reg` state space.

A destination register wider than the specified type may be used. The value loaded is sign-extended to the destination register width for signed integers, and is zero-extended to the destination register width for unsigned and bit-size types.

`.f16` data may be loaded using `ld.b16`, and then converted to `.f32` or `.f64` using `cvt`.

PTX ISA Notes

Introduced in PTX ISA version 3.1.

Support for `.level::eviction_priority`, `.level::prefetch_size` and `.level::cache_hint` qualifiers introduced in PTX ISA version 7.4.

Support for `.b128` type introduced in PTX ISA version 8.3.

Support for `.level2::eviction_priority` qualifier and `.v8.b32`/`.v4.b64` introduced in PTX ISA version 8.8.

Target ISA Notes

Requires `sm_32` or higher.

Support for `.level1::eviction_priority` qualifier requires `sm_70` or higher.

Support for `.level::prefetch_size` qualifier requires `sm_75` or higher.

Support for `.level::cache_hint` qualifier requires `sm_80` or higher.

Support for `.b128` type requires `sm_70` or higher.

Support for `.level2::eviction_priority` qualifier and `.v8.b32`/`.v4.b64` require `sm_100` or higher.

Examples

ld.global.nc.f32           d, [a];
    ld.gloal.nc.L1::evict_last.u32 d, [a];
    
    createpolicy.fractional.L2::evict_last.b64 cache-policy, 0.5;
    ld.global.nc.L2::cache_hint.f32  d, [a], cache-policy;
    
    ld.global.nc.L2::64B.b32      d,  [a];     // Prefetch 64B to L2
    ld.global.nc.L2::256B.f64     d,  [a];     // Prefetch 256B to L2
    
    ld.global.nc.b128             d,  [a];
    
    ld.global.nc.L2::evict_first.v4.f64 {%reg0, %reg1. %reg2, %reg3}. [a]; // 256-bit load