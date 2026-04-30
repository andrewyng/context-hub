---
name: ptx-createpolicy
description: Create a cache eviction policy for the specified cache level.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.18. Data Movement and Conversion Instructions:createpolicy

---
title: "9.7.9.18. Data Movement and Conversion Instructions:createpolicy"
section: 9.7.9.18
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.18. Data Movement and Conversion Instructions:createpolicy


`createpolicy`

Create a cache eviction policy for the specified cache level.

Syntax

// Range-based policy
    createpolicy.range{.global}.level::primary_priority{.level::secondary_priority}.b64
                                       cache-policy, [a], primary-size, total-size;
    
    // Fraction-based policy
    createpolicy.fractional.level::primary_priority{.level::secondary_priority}.b64
                                       cache-policy{, fraction};
    
    // Converting the access property from CUDA APIs
    createpolicy.cvt.L2.b64            cache-policy, access-property;
    
    .level::primary_priority =   { .L2::evict_last, .L2::evict_normal,
                                   .L2::evict_first, .L2::evict_unchanged };
    .level::secondary_priority = { .L2::evict_first, .L2::evict_unchanged };

Description

The `createpolicy` instruction creates a cache eviction policy for the specified cache level in an opaque 64-bit register specified by the destination operand `cache-policy`. The cache eviction policy specifies how cache eviction priorities are applied to global memory addresses used in memory operations with `.level::cache_hint` qualifier.

There are two types of cache eviction policies:

* Range-based policy

The cache eviction policy created using `createpolicy.range` specifies the cache eviction behaviors for the following three address ranges:

    * `[a .. a + (primary-size - 1)]` referred to as primary range.

    * `[a + primary-size .. a + (total-size - 1)]` referred to as trailing secondary range.

    * `[a - (total-size - primary-size) .. (a - 1)]` referred to as preceding secondary range.

When a range-based cache eviction policy is used in a memory operation with `.level::cache_hint` qualifier, the eviction priorities are applied as follows:

    * If the memory address falls in the primary range, the eviction priority specified by `.L2::primary_priority` is applied.

    * If the memory address falls in any of the secondary ranges, the eviction priority specified by `.L2::secondary_priority` is applied.

    * If the memory address does not fall in either of the above ranges, then the applied eviction priority is unspecified.

The 32-bit operand `primary-size` specifies the size, in bytes, of the primary range. The 32-bit operand `total-size` specifies the combined size, in bytes, of the address range including primary and secondary ranges. The value of `primary-size` must be less than or equal to the value of `total-size`. Maximum allowed value of `total-size` is 4GB.

If `.L2::secondary_priority` is not specified, then it defaults to `.L2::evict_unchanged`.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the specified address does not fall within the address window of `.global` state space then the behavior is undefined.

  * Fraction-based policy

A memory operation with `.level::cache_hint` qualifier can use the fraction-based cache eviction policy to request the cache eviction priority specified by `.L2:primary_priority` to be applied to a fraction of cache accesses specified by the 32-bit floating point operand `fraction`. The remainder of the cache accesses get the eviction priority specified by `.L2::secondary_priority`. This implies that in a memory operation that uses a fraction-based cache policy, the memory access has a probability specified by the operand `fraction` of getting the cache eviction priority specified by `.L2::primary_priority`.

The valid range of values for the operand `fraction` is `(0.0,.., 1.0]`. If the operand `fraction` is not specified, it defaults to 1.0.

If `.L2::secondary_priority` is not specified, then it defaults to `.L2::evict_unchanged`.

The access property created using the CUDA APIs can be converted into cache eviction policy by the instruction `createpolicy.cvt`. The source operand `access-property` is a 64-bit opaque register. Refer to _CUDA programming guide_ for more details.

PTX ISA Notes

Introduced in PTX ISA version 7.4.

Target ISA Notes

Requires `sm_80` or higher.

Examples

createpolicy.fractional.L2::evict_last.b64                      policy, 1.0;
    createpolicy.fractional.L2::evict_last.L2::evict_unchanged.b64  policy, 0.5;
    
    createpolicy.range.L2::evict_last.L2::evict_first.b64
                                                policy, [ptr], 0x100000, 0x200000;
    
    // access-prop is created by CUDA APIs.
    createpolicy.cvt.L2.b64 policy, access-prop;