---
name: ptx-tensormapreplace
description: Modifies the field of a tensor-map object.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.28. Data Movement and Conversion Instructions:tensormap.replace

---
title: "9.7.9.28. Data Movement and Conversion Instructions:tensormap.replace"
section: 9.7.9.28
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.28. Data Movement and Conversion Instructions:tensormap.replace


`tensormap.replace`

Modifies the field of a tensor-map object.

Syntax

tensormap.replace.mode.field1{.ss}.b1024.type  [addr], new_val;
    tensormap.replace.mode.field2{.ss}.b1024.type  [addr], ord, new_val;
    tensormap.replace.mode.field3{.ss}.b1024.type  [addr], new_val;
    
    .mode    = { .tile }
    .field1  = { .global_address, .rank }
    .field2  = { .box_dim, .global_dim, .global_stride, .element_stride  }
    .field3  = { .elemtype,  .interleave_layout, .swizzle_mode, .swizzle_atomicity, .fill_mode }
    .ss      = { .global, .shared::cta }
    .type    = { .b32, .b64 }

Description

The `tensormap.replace` instruction replaces the field, specified by `.field` qualifier, of the tensor-map object at the location specified by the address operand `addr` with a new value. The new value is specified by the argument `new_val`.

Qualifier `.mode` specifies the mode of the [tensor-map](<#tensor-tensormap>) object located at the address operand `addr`.

Instruction type `.b1024` indicates the size of the [tensor-map](<#tensor-tensormap>) object, which is 1024 bits.

Operand `new_val` has the type `.type`. When `.field` is specified as `.global_address` or `.global_stride`, `.type` must be `.b64`. Otherwise, `.type` must be `.b32`.

The immediate integer operand `ord` specifies the ordinal of the field across the rank of the tensor which needs to be replaced in the [tensor-map](<#tensor-tensormap>) object.

For field `.rank`, the operand `new_val` must be ones less than the desired tensor rank as this field uses zero-based numbering.

When `.field3` is specified, the operand `new_val` must be an immediate and the [Table 33](<#tensormap-new-val-validity>) shows the mapping of the operand `new_val` across various fields.

Table 33 Tensormap new_val validity **new_val** | **.field3**  
---|---  
**.elemtype** | **.interleave_layout** | **.swizzle_mode** | **.swizzle_atomicity** | **.fill_mode**  
0 | `.u8` | No interleave | No swizzling | 16B | Zero fill  
1 | `.u16` | 16B interleave | 32B swizzling | 32B | OOB-NaN fill  
2 | `.u32` | 32B interleave | 64B swizzling | 32B + 8B flip | x  
3 | `.s32` | x | 128B swizzling | 64B | x  
4 | `.u64` | x | 96B swizzling | x | x  
5 | `.s64` | x | x | x | x  
6 | `.f16` | x | x | x | x  
7 | `.f32` | x | x | x | x  
8 | `.f32.ftz` | x | x | x | x  
9 | `.f64` | x | x | x | x  
10 | `.bf16` | x | x | x | x  
11 | `.tf32` | x | x | x | x  
12 | `.tf32.ftz` | x | x | x | x  
13 | `.b4x16` | x | x | x | x  
14 | `.b4x16_p64` | x | x | x | x  
15 | `.b6x16_p32` or `.b6p2x16` | x | x | x | x

Note  
  
The values of `.elemtype` do not correspond to the values of the `CUtensorMapDataType` enum used in the driver API.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.global` or `.shared::cta` state space then the behavior is undefined.

`tensormap.replace` is treated as a weak memory operation, on the entire 1024-bit opaque [tensor-map](<#tensor-tensormap>) object, in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 8.3.

Qualifier `.swizzle_atomicity` introduced in PTX ISA version 8.6.

Qualifier `.elemtype` with values from `13` to `15`, both inclusive, is supported in PTX ISA version 8.7 onwards.

Qualifier `.swizzle_mode` with value `4` is supported from PTX ISA version 8.8 onwards.

Target ISA Notes

Supported on following architectures:

* `sm_90a`

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

Qualifier `.swizzle_atomicity` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a` (refer to [section](<#data-movement-and-conversion-instructions-tensor-copy-restrictions>) for restrictions on sm_120a)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`.field3` variant `.elemtype` corresponding to `new_val` values `13`, `14` and `15` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a` (refer to [section](<#data-movement-and-conversion-instructions-tensor-copy-restrictions>) for restrictions on sm_120a)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`.field3` variant `.swizzle_mode` corresponding to `new_val` value `4` is supported on following architectures:

* `sm_103a` (refer to [section](<#data-movement-and-conversion-instructions-tensor-copy-restrictions>) for restrictions on sm_103a)

Examples

tensormap.replace.tile.global_address.shared::cta.b1024.b64   [sMem], new_val;