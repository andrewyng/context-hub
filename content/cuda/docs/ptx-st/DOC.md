---
name: ptx-st
description: Store data to an addressable state space variable.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.11. Data Movement and Conversion Instructions:st

---
title: "9.7.9.11. Data Movement and Conversion Instructions:st"
section: 9.7.9.11
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.11. Data Movement and Conversion Instructions:st


`st`

Store data to an addressable state space variable.

Syntax

st{.weak}{.ss}{.cop}{.level::cache_hint}{.vec}.type   [a], b{, cache-policy};
    st{.weak}{.ss}{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.vec}.type
                                                          [a], b{, cache-policy};
    st.volatile{.ss}{.vec}.type                           [a], b;
    st.relaxed.scope{.ss}{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.vec}.type
                                                          [a], b{, cache-policy};
    st.release.scope{.ss}{.level1::eviction_priority}{.level2::eviction_priority}{.level::cache_hint}{.vec}.type
                                                          [a], b{, cache-policy};
    st.mmio.relaxed.sys{.global}.type         [a], b;
    
    .ss =                       { .global, .local, .param{::func}, .shared{::cta, ::cluster} };
    .level1::eviction_priority = { .L1::evict_normal, .L1::evict_unchanged,
                                   .L1::evict_first, .L1::evict_last, .L1::no_allocate };
    .level2::eviction_priority = { .L2::evict_normal, .L2::evict_first, .L2::evict_last };
    .level::cache_hint =        { .L2::cache_hint };
    .cop =                      { .wb, .cg, .cs, .wt };
    .sem =                      { .relaxed, .release };
    .scope =                    { .cta, .cluster, .gpu, .sys };
    .vec =                      { .v2, .v4, .v8 };
    .type =                     { .b8, .b16, .b32, .b64, .b128,
                                  .u8, .u16, .u32, .u64,
                                  .s8, .s16, .s32, .s64,
                                  .f32, .f64 };

Description

Store the value of operand `b` in the location specified by the destination address operand `a` in specified state space. If no state space is given, perform the store using [Generic Addressing](<#generic-addressing>). Stores to const memory are illegal.

If no sub-qualifier is specified with `.shared` state space, then `::cta` is assumed by default.

Supported addressing modes for operand `a` and alignment requirements are described in [Addresses as Operands](<#addresses-as-operands>).

If `.param` is specified without any sub-qualifiers then it defaults to `.param::func`.

Instruction `st.param{::func}` used for passing arguments to device function cannot be predicated. See [Parameter State Space](<#parameter-state-space>) and [Function Declarations and Definitions](<#function-declarations-and-definitions>) for descriptions of the proper use of `st.param`.

The qualifiers `.relaxed` and `.release` indicate memory synchronization as described in the [Memory Consistency Model](<#memory-consistency-model>). The `.scope` qualifier indicates the set of threads with which an `st.relaxed` or `st.release` instruction can directly synchronize1. The `.weak` qualifier indicates a memory instruction with no synchronization. The effects of this instruction become visible to other threads only when synchronization is established by other means.

The semantic details of `.mmio` qualifier are described in the [Memory Consistency Model](<#memory-consistency-model>). Only `.sys` thread scope is valid for `st.mmio` operation. The qualifiers `.mmio` and `.relaxed` must be specified together.

The semantic details of `.volatile` qualifier are described in the [Memory Consistency Model](<#memory-consistency-model>).

The `.weak`, `.volatile`, `.relaxed` and `.release` qualifiers are mutually exclusive. When none of these is specified, the `.weak` qualifier is assumed by default.

`.relaxed` and `.release`:

* May be used with `.global`, `.shared` spaces or with generic addressing where the address points to `.global` or `.shared` space.

  * Cache operations are not allowed.

`.volatile`:

* May be used with `.global`, `.shared`, `.local` spaces or with generic addressing where the address points to `.global`, `.shared`, or `.local` space.

  * Cache operations are not allowed.

`.mmio`:

* May be used only with `.global` space or with generic addressing where the address points to `.global` space.

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

Optionally, sink symbol ‘_’ can be used in vector expression `b` when:

* `.vec` is `.v8` and `.type` is `.b32` or `.s32` or `.u32` or `.f32` OR

  * `.vec` is `.v4` and `.type` is `.b64` or `.s64` or `.u64` or `.f64`

which indicates that no data is being written at the corresponding destination address.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

The qualifier `.level::cache_hint` is only supported for `.global` state space and for generic addressing where the address points to the `.global` state space.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

1 This synchronization is further extended to other threads through the transitive nature of _causality order_ , as described in the memory consistency model.

Semantics

d = a;                // named variable d
    *(&a+immOffset) = b;            // variable-plus-offset
    *a = b;               // register
    *(a+immOffset) = b;   // register-plus-offset
    *(immAddr) = b;       // immediate address

Notes

Operand `b` must be in the `.reg` state space.

A source register wider than the specified type may be used. The lower `n` bits corresponding to the instruction-type width are stored to memory. See [Table 27](<#operand-size-exceeding-instruction-type-size-relaxed-type-checking-rules-source-operands>) for a description of these relaxed type-checking rules.

`.f16` data resulting from a `cvt` instruction may be stored using `st.b16`.

`.f16x2` data may be stored using `st.b32`.

PTX ISA Notes

st introduced in PTX ISA version 1.0. `st.volatile` introduced in PTX ISA version 1.1.

Generic addressing and cache operations introduced in PTX ISA version 2.0.

Support for scope qualifier, `.relaxed`, `.release`, `.weak` qualifiers introduced in PTX ISA version 6.0.

Support for `.level1::eviction_priority` and `.level::cache_hint` qualifiers introduced in PTX ISA version 7.4.

Support for `.cluster` scope qualifier introduced in PTX ISA version 7.8.

Support for `::cta` and `::cluster` sub-qualifiers introduced in PTX ISA version 7.8.

Support for `.mmio` qualifier introduced in PTX ISA version 8.2.

Support for `::func` sub-qualifier on `.param` space introduced in PTX ISA version 8.3.

Support for `.b128` type introduced in PTX ISA version 8.3.

Support for `.sys` scope with `.b128` type introduced in PTX ISA version 8.4.

Support for `.level2::eviction_priority` qualifier and `.v8.b32`/`.v4.b64` introduced in PTX ISA version 8.8.

Support for `.volatile` qualifier with `.local` state space introduced in PTX ISA version 9.1.

Target ISA Notes

`st.f64` requires `sm_13` or higher.

Support for scope qualifier, `.relaxed`, `.release`, `.weak` qualifiers require `sm_70` or higher.

Generic addressing requires `sm_20` or higher.

Cache operations require `sm_20` or higher.

Support for `.level1::eviction_priority` qualifier requires `sm_70` or higher.

Support for `.level::cache_hint` qualifier requires `sm_80` or higher.

Support for `.cluster` scope qualifier requires `sm_90` or higher.

Sub-qualifier `::cta` requires `sm_30` or higher.

Sub-qualifier `::cluster` requires `sm_90` or higher.

Support for `.mmio` qualifier requires `sm_70` or higher.

Support for `.b128` type requires `sm_70` or higher.

Support for `.level2::eviction_priority` qualifier and `.v8.b32`/`.v4.b64` require `sm_100` or higher.

Examples

st.global.f32    [a],b;
    st.local.b32     [q+4],a;
    st.global.v4.s32 [p],Q;
    st.local.b32     [q+-8],a; // negative offset
    st.local.s32     [100],r7; // immediate address
    
    cvt.f16.f32      %r,%r;    // %r is 32-bit register
    st.b16           [fs],%r;  // store lower
    st.global.relaxed.sys.u32 [gbl], %r0;
    st.shared.release.cta.u32 [sh], %r1;
    st.global.relaxed.cluster.u32 [gbl], %r2;
    st.shared::cta.release.cta.u32 [sh + 4], %r1;
    st.shared::cluster.u32 [sh + 8], %r1;
    st.global.mmio.relaxed.sys.u32 [gbl], %r1;
    st.local.volatile.u32 [lcl], %r2;
    
    st.global.L1::no_allocate.f32 [p], a;
    
    createpolicy.fractional.L2::evict_last.b64 cache-policy, 0.25;
    st.global.L2::cache_hint.b32  [a], b, cache-policy;
    
    st.param::func.b64 [param1], %rp1;
    
    st.global.b128  [a], b;  // 128-bit store
    
    // 256-bit store
    st.global.L2::evict_last.v8.f32 [addr], { %reg0, _, %reg2, %reg3, %reg4, %reg5, %reg6, %reg7};