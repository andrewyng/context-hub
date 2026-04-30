---
name: ptx-ld
description: Load a register variable from an addressable state space variable.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.8. Data Movement and Conversion Instructions:ld

---
title: "9.7.9.8. Data Movement and Conversion Instructions:ld"
section: 9.7.9.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.8. Data Movement and Conversion Instructions:ld


`ld`

Load a register variable from an addressable state space variable.

Syntax

ld{.weak}{.ss}{.cop}{.level::cache_hint}{.level::prefetch_size}{.vec}.type  d, [a]{.unified}{, cache-policy};
    
    ld{.weak}{.ss}{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.level::prefetch_size}{.vec}.type  d, [a]{.unified}{, cache-policy};
    
    ld.volatile{.ss}{.level::prefetch_size}{.vec}.type  d, [a];
    
    ld.relaxed.scope{.ss}{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.level::prefetch_size}{.vec}.type  d, [a]{, cache-policy};
    
    ld.acquire.scope{.ss}{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.level::prefetch_size}{.vec}.type  d, [a]{, cache-policy};
    
    ld.mmio.relaxed.sys{.global}.type  d, [a];
    
    .ss =                       { .const, .global, .local, .param{::entry, ::func}, .shared{::cta, ::cluster} };
    .cop =                      { .ca, .cg, .cs, .lu, .cv };
    .level1::eviction_priority = { .L1::evict_normal, .L1::evict_unchanged,
                                   .L1::evict_first, .L1::evict_last, .L1::no_allocate };
    .level2::eviction_priority = {.L2::evict_normal, .L2::evict_first, .L2::evict_last};
    .level::cache_hint =        { .L2::cache_hint };
    .level::prefetch_size =     { .L2::64B, .L2::128B, .L2::256B }
    .scope =                    { .cta, .cluster, .gpu, .sys };
    .vec =                      { .v2, .v4, .v8 };
    .type =                     { .b8, .b16, .b32, .b64, .b128,
                                  .u8, .u16, .u32, .u64,
                                  .s8, .s16, .s32, .s64,
                                  .f32, .f64 };

Description

Load register variable `d` from the location specified by the source address operand `a` in specified state space. If no state space is given, perform the load using [Generic Addressing](<#generic-addressing>).

If no sub-qualifier is specified with `.shared` state space, then `::cta` is assumed by default.

Supported addressing modes for operand `a` and alignment requirements are described in [Addresses as Operands](<#addresses-as-operands>)

If no sub-qualifier is specified with `.param` state space, then:

* `::func` is assumed when access is inside a device function.  
  
  * `::entry` is assumed when accessing kernel function parameters from entry function. Otherwise, when accessing device function parameters or any other `.param` variables from entry function `::func` is assumed by default.

For `ld.param::entry` instruction, operand a must be a kernel parameter address, otherwise behavior is undefined. For `ld.param::func` instruction, operand a must be a device function parameter address, otherwise behavior is undefined.

Instruction `ld.param{::func}` used for reading value returned from device function call cannot be predicated. See [Parameter State Space](<#parameter-state-space>) and [Function Declarations and Definitions](<#function-declarations-and-definitions>) for descriptions of the proper use of `ld.param`.

The `.relaxed` and `.acquire` qualifiers indicate memory synchronization as described in the [Memory Consistency Model](<#memory-consistency-model>). The `.scope` qualifier indicates the set of threads with which an `ld.relaxed` or `ld.acquire` instruction can directly synchronize1. The `.weak` qualifier indicates a memory instruction with no synchronization. The effects of this instruction become visible to other threads only when synchronization is established by other means.

The semantic details of `.mmio` qualifier are described in the [Memory Consistency Model](<#memory-consistency-model>). Only `.sys` thread scope is valid for `ld.mmio` operation. The qualifiers `.mmio` and `.relaxed` must be specified together.

The semantic details of `.volatile` qualifier are described in the [Memory Consistency Model](<#memory-consistency-model>).

The `.weak`, `.volatile`, `.relaxed` and `.acquire` qualifiers are mutually exclusive. When none of these is specified, the `.weak` qualifier is assumed by default.

`.relaxed` and `.acquire`:

* May be used with `.global`, `.shared` spaces, or with generic addressing where the address points to `.global` or `.shared` space.

  * Cache operations are not allowed.

`.volatile`:

* May be used with `.global`, `.shared`, `.local` spaces, or with generic addressing where the address points to `.global`, `.shared`, or `.local` space.

  * Cache operations are not allowed.

`.mmio`:

* May be used only with `.global` space or with generic addressing where the address points to `.global` space.

The optional qualifier `.unified` must be specified on operand `a` if `a` is the address of a variable declared with `.unified` attribute as described in [Variable and Function Attribute Directive: .attribute](<#variable-and-function-attribute-directive-attribute>).

The `.v8` (`.vec`) qualifier is supported if:

* `.type` is `.b32` or `.s32` or `.u32` or `.f32` AND

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

The qualifier `.level::prefetch_size` may only be used with `.global` state space and with generic addressing where the address points to `.global` state space. If the generic address does not fall within the address window of the global memory, then the prefetching behavior is undefined.

The `.level::prefetch_size` qualifier is treated as a performance hint only.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

The qualifiers `.unified` and `.level::cache_hint` are only supported for `.global` state space and for generic addressing where the address points to the `.global` state space.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

1 This synchronization is further extended to other threads through the transitive nature of _causality order_ , as described in the memory consistency model.

Semantics

d = a;             // named variable a
    d = *(&a+immOff)   // variable-plus-offset
    d = *a;            // register
    d = *(a+immOff);   // register-plus-offset
    d = *(immAddr);    // immediate address

Notes

Destination `d` must be in the `.reg` state space.

A destination register wider than the specified type may be used. The value loaded is sign-extended to the destination register width for signed integers, and is zero-extended to the destination register width for unsigned and bit-size types. See [Table 28](<#operand-size-exceeding-instruction-type-size-relaxed-type-checking-rules-destination-operands>) for a description of these relaxed type-checking rules.

`.f16` data may be loaded using `ld.b16`, and then converted to `.f32` or `.f64` using `cvt` or can be used in half precision floating point instructions.

`.f16x2` data may be loaded using `ld.b32` and then used in half precision floating point instructions.

PTX ISA Notes

ld introduced in PTX ISA version 1.0. `ld.volatile` introduced in PTX ISA version 1.1.

Generic addressing and cache operations introduced in PTX ISA version 2.0.

Support for scope qualifier, `.relaxed`, `.acquire`, `.weak` qualifiers introduced in PTX ISA version 6.0.

Support for generic addressing of .const space added in PTX ISA version 3.1.

Support for `.level1::eviction_priority`, `.level::prefetch_size` and `.level::cache_hint` qualifiers introduced in PTX ISA version 7.4.

Support for `.cluster` scope qualifier introduced in PTX ISA version 7.8.

Support for `::cta` and `::cluster` sub-qualifiers introduced in PTX ISA version 7.8.

Support for `.unified` qualifier introduced in PTX ISA version 8.0.

Support for `.mmio` qualifier introduced in PTX ISA version 8.2.

Support for `::entry` and `::func` sub-qualifiers on `.param` space introduced in PTX ISA version 8.3.

Support for `.b128` type introduced in PTX ISA version 8.3.

Support for `.sys` scope with `.b128` type introduced in PTX ISA version 8.4.

Support for `.level2::eviction_priority` qualifier and `.v8.b32`/`.v4.b64` introduced in PTX ISA version 8.8.

Support for `.volatile` qualifier with `.local` state space introduced in PTX ISA version 9.1.

Target ISA Notes

`ld.f64` requires `sm_13` or higher.

Support for scope qualifier, `.relaxed`, `.acquire`, `.weak` qualifiers require `sm_70` or higher.

Generic addressing requires `sm_20` or higher.

Cache operations require `sm_20` or higher.

Support for `.level::eviction_priority` qualifier requires `sm_70` or higher.

Support for `.level::prefetch_size` qualifier requires `sm_75` or higher.

Support for `.L2::256B` and `.L2::cache_hint` qualifiers requires `sm_80` or higher.

Support for `.cluster` scope qualifier requires `sm_90` or higher.

Sub-qualifier `::cta` requires `sm_30` or higher.

Sub-qualifier `::cluster` requires `sm_90` or higher.

Support for `.unified` qualifier requires `sm_90` or higher.

Support for `.mmio` qualifier requires `sm_70` or higher.

Support for `.b128` type requires `sm_70` or higher.

Support for `.level2::eviction_priority` qualifier and `.v8.b32`/`.v4.b64` require `sm_100` or higher.

Examples

ld.global.f32    d,[a];
    ld.shared.v4.b32 Q,[p];
    ld.const.s32     d,[p+4];
    ld.local.b32     x,[p+-8]; // negative offset
    ld.local.b64     x,[240];  // immediate address
    
    ld.global.b16    %r,[fs];  // load .f16 data into 32-bit reg
    cvt.f32.f16      %r,%r;    // up-convert f16 data to f32
    
    ld.global.b32    %r0, [fs];     // load .f16x2 data in 32-bit reg
    ld.global.b32    %r1, [fs + 4]; // load .f16x2 data in 32-bit reg
    add.rn.f16x2     %d0, %r0, %r1; // addition of f16x2 data
    ld.global.relaxed.gpu.u32 %r0, [gbl];
    ld.shared.acquire.gpu.u32 %r1, [sh];
    ld.global.relaxed.cluster.u32 %r2, [gbl];
    ld.shared::cta.acquire.gpu.u32 %r2, [sh + 4];
    ld.shared::cluster.u32 %r3, [sh + 8];
    ld.global.mmio.relaxed.sys.u32 %r3, [gbl];
    ld.local.volatile.u32 %r4, [lcl];
    
    ld.global.f32    d,[ugbl].unified;
    ld.b32           %r0, [%r1].unified;
    
    ld.global.L1::evict_last.u32  d, [p];
    
    ld.global.L2::64B.b32   %r0, [gbl]; // Prefetch 64B to L2
    ld.L2::128B.f64         %r1, [gbl]; // Prefetch 128B to L2
    ld.global.L2::256B.f64  %r2, [gbl]; // Prefetch 256B to L2
    
    createpolicy.fractional.L2::evict_last.L2::evict_unchanged.b64 cache-policy, 1;
    ld.global.L2::cache_hint.b64  x, [p], cache-policy;
    ld.param::entry.b32 %rp1, [kparam1];
    
    ld.global.b128   %r0, [gbl];   // 128-bit load
    
    // 256-bit load
    ld.global.L2::evict_last.v8.f32 { %reg0, _, %reg2, %reg3, %reg4, %reg5, %reg6, %reg7}, [addr];
    ld.global.L2::evict_last.L1::evict_last.v4.u64 { %reg0, %reg1, %reg2, %reg3}, [addr];