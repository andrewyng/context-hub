---
name: ptx-multimemld-reducemultimemstmultimemred
description: The multimem.* operations operate on multimem addresses and accesses
  all of the multiple memory locations which the multimem address points to.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.14. Data Movement and Conversion Instructions:multimem.ld_reduce,multimem.st,multimem.red

---
title: "9.7.9.14. Data Movement and Conversion Instructions:multimem.ld_reduce,multimem.st,multimem.red"
section: 9.7.9.14
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.14. Data Movement and Conversion Instructions:multimem.ld_reduce,multimem.st,multimem.red


The multimem.* operations operate on multimem addresses and accesses all of the multiple memory locations which the multimem address points to.

Multimem addresses can only be accessed only by multimem.* operations. Accessing a multimem address with `ld`, `st` or any other memory operations results in undefined behavior.

Refer to _CUDA programming guide_ for creation and management of the multimem addresses.

`multimem.ld_reduce`, `multimem.st`, `multimem.red`

Perform memory operations on the multimem address.

Syntax

// Integer type:
    
    multimem.ld_reduce{.ldsem}{.scope}{.ss}.op.type      d, [a];
    multimem.ld_reduce.weak{.ss}.op.type                 d, [a];
    
    multimem.st{.stsem}{.scope}{.ss}.type                [a], b;
    multimem.st.weak{.ss}.type                           [a], b;
    
    multimem.red{.redsem}{.scope}{.ss}.op.type           [a], b;
    
    .ss =       { .global }
    .ldsem =    { .relaxed, .acquire }
    .stsem =    { .relaxed, .release }
    .redsem =   { .relaxed, .release }
    .scope =    { .cta, .cluster, .gpu, .sys }
    .op  =      { .min, .max, .add, .and, .or, .xor }
    .type =     { .b32, .b64,  .u32, .u64, .s32, .s64 }
    
    // Floating point type:
    
    multimem.ld_reduce{.ldsem}{.scope}{.ss}.op{.acc_prec}{.vec}.type    d, [a];
    multimem.ld_reduce.weak{.ss}.op{.acc_prec}{.vec}.type               d, [a];
    
    multimem.st{.stsem}{.scope}{.ss}{.vec}.type                         [a], b;
    multimem.st.weak{.ss}{.vec}.type                                    [a], b;
    
    multimem.red{.redsem}{.scope}{.ss}.redop{.vec}.redtype              [a], b;
    
    .ss =       { .global }
    .ldsem =    { .relaxed, .acquire }
    .stsem =    { .relaxed, .release }
    .redsem =   { .relaxed, .release }
    .scope =    { .cta, .cluster, .gpu, .sys }
    .op  =      { .min, .max, .add }
    .redop  =   { .add }
    .acc_prec = { .acc::f32, .acc::f16 }
    .vec =      { .v2, .v4, .v8 }
    .type=      { .f16, .f16x2, .bf16, .bf16x2, .f32, .f64, .e5m2, .e5m2x2, .e5m2x4, .e4m3, .e4m3x2, .e4m3x4 }
    .redtype =  { .f16, .f16x2, .bf16, .bf16x2, .f32, .f64 }

Description

Instruction `multimem.ld_reduce` performs the following operations:

* load operation on the multimem address `a`, which involves loading of data from all of the multiple memory locations pointed to by the multimem address `a`,

  * reduction operation specified by `.op` on the multiple data loaded from the multimem address `a`.

The result of the reduction operation in returned in register `d`.

Instruction `multimem.st` performs a store operation of the input operand `b` to all the memory locations pointed to by the multimem address `a`.

Instruction `multimem.red` performs a reduction operation on all the memory locations pointed to by the multimem address `a`, with operand `b`.

Instruction `multimem.ld_reduce` performs reduction on the values loaded from all the memory locations that the multimem address points to. In contrast, the `multimem.red` perform reduction on all the memory locations that the multimem address points to.

Address operand `a` must be a multimem address. Otherwise, the behavior is undefined. Supported addressing modes for operand a and alignment requirements are described in [Addresses as Operands](<#addresses-as-operands>).

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `a` does not fall within the address window of `.global` state space then the behavior is undefined.

For floating-point type multi- operations, the size of the specified type along with `.vec` must equal either 32-bits or 64-bits or 128-bits. No other combinations of `.vec` and type are allowed. Type `.f64` cannot be used with `.vec` qualifier. The following table describes the valid usage of `.vec` and base floating-point type:

.vec | Base float-type supported  
---|---  
No `.vec` specified | `.f16x2`, `.bf16x2`, `.f32`, `.f64`, `.e5m2x4`, `.e4m3x4`  
`.v2` | `.f16`, `.f16x2`, `.bf16`, `.bf16x2` `.f32`, `.e5m2x2`, `.e5m2x4`, `.e4m3x2`, `.e4m3x4`  
`.v4` | `.f16`, `.f16x2`, `.bf16`, `.bf16x2` `.f32`, `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2`, `.e4m3x4`  
`.v8` | `.f16`, `.bf16`, `.e5m2`, `.e4m3`, `.e5m2x2`, `.e4m3x2`

The following table describes the valid combinations of `.op` and base type:

op | Base type  
---|---  
`.add` | `.u32`, `.u64`, `.s32` `.f16`, `.f16x2`, `.bf16`, `.bf16x2` `.f32`, `.f64`, `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2`, `.e4m3x4`  
`.and`, `.or`, `.xor` | `.b32`, `.b64`  
`.min`, `.max` | `.u32`, `.s32`, `.u64`, `.s64` `.f16`, `.f16x2`, `.bf16`, `.bf16x2` `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2`, `.e4m3x4`

For `multimem.ld_reduce`, the default precision of the intermediate accumulation is same as the specified type.

Optionally, `.acc_prec` qualifier can be specified to change the precision of intermediate accumulation as follows:

.type | .acc::prec | Changes precision to  
---|---|---  
`.f16`, `.f16x2`, `.bf16`, `.bf16x2` | `.acc::f32` | `.f32`  
`.e5m2`, `.e4m3`, `.e5m2x2`, `.e4m3x2`, `.e4m3x4`, `.e5m2x4` | `.acc::f16` | `.f16`

Optional qualifiers `.ldsem`, `.stsem` and `.redsem` specify the memory synchronizing effect of the `multimem.ld_reduce`, `multimem.st` and `multimem.red` respectively, as described in [Memory Consistency Model](<#memory-consistency-model>). If explicit semantics qualifiers are not specified, then `multimem.ld_reduce` and `multimem.st` default to `.weak` and `multimem.red` defaults to `.relaxed`.

The optional `.scope` qualifier specifies the set of threads that can directly observe the memory synchronizing effect of this operation, as described in [Memory Consistency Model](<#memory-consistency-model>). If the `.scope` qualifier is not specified for `multimem.red` then `.sys` scope is assumed by default.

PTX ISA Notes

Introduced in PTX ISA version 8.1.

Support for `.acc::f32` qualifier introduced in PTX ISA version 8.2.

Support for types `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2`, `.e4m3x4` introduced in PTX ISA version 8.6.

Support for `.acc::f16` qualifier introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_90` or higher.

Types `.e5m2`, `.e5m2x2`, `.e5m2x4`, `.e4m3`, `.e4m3x2`, `.e4m3x4` are supported on following architectures:

* `sm_100a`  
  
  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * `sm_121a`

  * And are supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family

Qualifier `.acc::f16` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * `sm_121a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

>     * `sm_100f` or higher in the same family
> 
>     * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family

Examples

multimem.ld_reduce.and.b32                    val1_b32, [addr1];
    multimem.ld_reduce.acquire.gpu.global.add.u32 val2_u32, [addr2];
    
    multimem.st.relaxed.gpu.b32                [addr3], val3_b32;
    multimem.st.release.cta.global.u32         [addr4], val4_u32;
    
    multimem.red.relaxed.gpu.max.f64           [addr5], val5_f64;
    multimem.red.release.cta.global.add.v4.f32 [addr6], {val6, val7, val8, val9};
    multimem.ld_reduce.add.acc::f32.v2.f16x2   {val_10, val_11}, [addr7];
    
    multimem.ld_reduce.relaxed.cta.min.v2.e4m3x2 {val_12, val_13}, [addr8];
    multimem.ld_reduce.relaxed.cta.add.v4.e4m3   {val_14, val_15, val_16, val_17}, [addr9];
    multimem.ld_reduce.add.acc::f16.v4.e5m2      {val_18, val_19, val_20, val_21}, [addr10];