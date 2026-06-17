---
name: ptx-cvt
description: Convert a value from one type to another.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.21. Data Movement and Conversion Instructions:cvt

---
title: "9.7.9.21. Data Movement and Conversion Instructions:cvt"
section: 9.7.9.21
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.21. Data Movement and Conversion Instructions:cvt


`cvt`

Convert a value from one type to another.

Syntax

cvt{.irnd}{.ftz}{.sat}.dtype.atype         d, a;  // integer rounding
    cvt{.frnd}{.ftz}{.sat}.dtype.atype         d, a;  // fp rounding
    
    cvt.frnd2{.relu}{.satfinite}.f16.f32       d, a;
    cvt.frnd2{.relu}{.satfinite}.f16x2.f32     d, a, b;
    cvt.rs{.relu}{.satfinite}.f16x2.f32        d, a, b, rbits;
    
    cvt.frnd2{.relu}{.satfinite}.bf16.f32      d, a;
    cvt.frnd2{.relu}{.satfinite}.bf16x2.f32    d, a, b;
    cvt.rs{.relu}{.satfinite}.bf16x2.f32       d, a, b, rbits;
    
    cvt.rna{.satfinite}.tf32.f32               d, a;
    cvt.frnd2{.satfinite}{.relu}.tf32.f32      d, a;
    
    cvt.rn.satfinite{.relu}.f8x2type.f32       d, a, b;
    cvt.rn.satfinite{.relu}.f8x2type.fp16x2    d, a;
    cvt.rn.{.relu}.f16x2.f8x2type              d, a;
    cvt.rs{.relu}.satfinite.f8x4type.f32       d, {a, b, e, f}, rbits;
    
    cvt.rn.satfinite{.relu}.f4x2type.f32        d, a, b;
    cvt.rn.satfinite{.relu}.f4x2type.fp16x2type d, a;
    cvt.rn{.relu}.f16x2.f4x2type                d, a;
    cvt.rs{.relu}.satfinite.f4x4type.f32        d, {a, b, e, f}, rbits;
    
    cvt.rn.satfinite{.relu}.f6x2type.f32        d, a, b;
    cvt.rn.satfinite{.relu}.f6x2type.fp16x2type d, a;
    cvt.rn{.relu}.f16x2.f6x2type                d, a;
    cvt.rs{.relu}.satfinite.f6x4type.f32        d, {a, b, e, f}, rbits;
    
    cvt.frnd3{.satfinite}.ue8m0x2.f32          d, a, b;
    cvt.frnd3{.satfinite}.ue8m0x2.bf16x2       d, a;
    cvt.rn.bf16x2.ue8m0x2                      d, a;
    
    cvt.rn.satfinite{.relu}{.scaled::n2::ue8m0}.s2f6x2.f32      d, a, b{, scale-factor};
    cvt.rn.satfinite{.relu}{.scaled::n2::ue8m0}.s2f6x2.bf16x2   d, a{, scale-factor};
    cvt.rn{.satfinite}{.relu}{.scaled::n2::ue8m0}.bf16x2.s2f6x2 d, a{, scale-factor};
    
    .irnd   = { .rni, .rzi, .rmi, .rpi };
    .frnd   = { .rn,  .rz,  .rm,  .rp  };
    .frnd2  = { .rn,  .rz };
    .frnd3  = { .rz,  .rp };
    .dtype = .atype = { .u8,   .u16, .u32, .u64,
                        .s8,   .s16, .s32, .s64,
                        .bf16, .f16, .f32, .f64 };
    .f8x2type = { .e4m3x2, .e5m2x2 };
    .f4x2type = { .e2m1x2 };
    .f6x2type = { .e2m3x2, .e3m2x2 };
    .f4x4type = { .e2m1x4 };
    .f8x4type = { .e4m3x4, .e5m2x4 };
    .f6x4type = { .e2m3x4, .e3m2x4 };
    .fp16x2type = { .f16x2, .bf16x2 };

Description

Convert between different types and sizes.

For `.f16x2` and `.bf16x2` instruction type, two inputs `a` and `b` of `.f32` type are converted into `.f16` or `.bf16` type and the converted values are packed in the destination register `d`, such that the value converted from input `a` is stored in the upper half of `d` and the value converted from input `b` is stored in the lower half of `d`

For `.f16x2` instruction type, destination operand `d` has `.f16x2` or `.b32` type. For `.bf16` instruction type, operand `d` has `.b16` type. For `.bf16x2` instruction type, operand `d` has `.b32` type. For `.tf32` instruction type, operand `d` has `.b32` type.

When converting to `.e4m3x2`/`.e5m2x2` data formats, the destination operand `d` has `.b16` type. When converting two `.f32` inputs to `.e4m3x2`/`.e5m2x2`, each input is converted to the specified format, and the converted values are packed in the destination operand `d` such that the value converted from input `a` is stored in the upper 8 bits of `d` and the value converted from input `b` is stored in the lower 8 bits of `d`. When converting an `.f16x2`/`.bf16x2` input to `.e4m3x2`/ `.e5m2x2`, each `.f16`/`.bf16` input from operand `a` is converted to the specified format. The converted values are packed in the destination operand `d` such that the value converted from the upper 16 bits of input `a` is stored in the upper 8 bits of `d` and the value converted from the lower 16 bits of input `a` is stored in the lower 8 bits of `d`.

When converting from `.e4m3x2`/`.e5m2x2` to `.f16x2`, source operand `a` has `.b16` type. Each 8-bit input value in operand `a` is converted to `.f16` type. The converted values are packed in the destination operand `d` such that the value converted from the upper 8 bits of `a` is stored in the upper 16 bits of `d` and the value converted from the lower 8 bits of `a` is stored in the lower 16 bits of `d`.

When converting to `.e2m1x2` data formats, the destination operand `d` has `.b8` type. When converting two `.f32` inputs to `.e2m1x2`, each input is converted to the specified format, and the converted values are packed in the destination operand `d` such that the value converted from input `a` is stored in the upper 4 bits of `d` and the value converted from input `b` is stored in the lower 4 bits of `d`. When converting an `.f16x2`/`.bf16x2` input to `.e2m1x2`, each `.f16`/`.bf16` input from operand `a` is converted to the specified format. The converted values are packed in `d` so that the value from the upper 16 bits of `a` is stored in the upper 4 bits of `d`, and the value from the lower 16 bits of `a` is stored in the lower 4 bits of `d`.

When converting from `.e2m1x2` to `.f16x2`, source operand `a` has `.b8` type. Each 4-bit input value in operand `a` is converted to `.f16` type. The converted values are packed in the destination operand `d` such that the value converted from the upper 4 bits of `a` is stored in the upper 16 bits of `d` and the value converted from the lower 4 bits of `a` is stored in the lower 16 bits of `d`.

When converting to `.e2m1x4` data format, the destination operand `d` has `.b16` type. When converting four `.f32` inputs to `.e2m1x4`, each input is converted to the specified format, and the converted values are packed in the destination operand `d` such that the value converted from inputs `a`, `b`, `e`, `f` are stored in each 4 bits starting from upper bits of `d`.

When converting to `.e2m3x2`/`.e3m2x2` data formats, the destination operand `d` has `.b16` type. When converting two `.f32` inputs to `.e2m3x2`/`.e3m2x2`, each input is converted to the specified format, and the converted values are packed in the destination operand `d` such that the value converted from input `a` is stored in the upper 8 bits of `d` with 2 MSB bits padded with zeros and the value converted from input `b` is stored in the lower 8 bits of `d` with 2 MSB bits padded with zeros. When converting an `.f16x2`/`.bf16x2` input to `.e2m3x2`/`.e3m2x2`, each `.f16`/`.bf16` input from operand `a` is converted to the specified format. The converted values are packed in the destination operand `d` so that the value from the upper 16 bits of input `a` is stored in the upper 8 bits of `d` with 2 MSB bits padded with zeros, and the value from the lower 16 bits of input `a` is stored in the lower 8 bits of `d` with 2 MSB bits padded with zeros.

When converting from `.e2m3x2`/`.e3m2x2` to `.f16x2`, source operand `a` has `.b16` type. Each 8-bit input value with 2 MSB bits 0 in operand `a` is converted to `.f16` type. The converted values are packed in the destination operand `d` such that the value converted from the upper 8 bits of `a` is stored in the upper 16 bits of `d` and the value converted from the lower 8 bits of `a` is stored in the lower 16 bits of `d`.

When converting to `.e5m2x4`/`.e4m3x4`/`.e3m2x4`/`.e2m3x4` data format, the destination operand `d` has `.b32` type. When converting four `.f32` inputs to `.e5m2x4`/`.e4m3x4`/`.e3m2x4`/`.e2m3x4`, each input is converted to the specified format, and the converted values are packed in the destination operand `d` such that the value converted from inputs `a`, `b`, `e`, `f` are stored in each 8 bits starting from upper bits of `d`. For `.e3m2x4`/`.e2m3x4`, each 8-bit output will have 2 MSB bits padded with zeros.

When converting to `.ue8m0x2` data formats, the destination operand `d` has `.b16` type. When converting two `.f32` or two packed `.bf16` inputs to `.ue8m0x2`, each input is converted to the specified format, and the converted values are packed in the destination operand `d` such that the value converted from input `a` is stored in the upper 8 bits of `d` and the value converted from input `b` is stored in the lower 8 bits of `d`.

When converting from `.ue8m0x2` to `.bf16x2`, source operand `a` has `.b16` type. Each 8-bit input value in operand `a` is converted to `.bf16` type. The converted values are packed in the destination operand `d` such that the value converted from the upper 8 bits of `a` is stored in the upper 16 bits of `d` and the value converted from the lower 8 bits of `a` is stored in the lower 16 bits of `d`.

When converting to `.s2f6x2` data formats, the destination operand `d` has `.b16` type. When converting two `.f32` inputs to `.s2f6x2`, each input is converted to the `.s2f6` value, and the converted values are packed in the destination operand `d` such that the value converted from input `a` is stored in the upper 8 bits of `d` and the value converted from input `b` is stored in the lower 8 bits of `d`. When converting from `.bf16x2`, each input packed in operand `a` is converted to `.s2f6` value and converted values are packed in the destination operand `d` such that value converted from upper 8 bits of input `a` is stored in upper 8 bits of operand `d` and the value converted from lower 8 bits of input `a` is stored in lower 8 bits of operand `d`. Optional operand `scale-factor` has type `.b16` and stores two packed scaling factors of type `.ue8m0`. For down conversion, inputs are divided by `scale-factor` and then conversion is performed. The scaling factor of input `a`/`.bf16` input from upper 16 bits of `a` is stored in the upper 8 bits of operand `scale-factor` and the scaling factor of input `b`/`.bf16` input from lower 16 bits of `a` is stored in the lower 8 bits of operand `scale-factor`. If not specified explicitly, value of `scale-factor` will be assumed to be `0x7f7f`, that is, assumed as value `1` for both input scale factors.

When converting from `.s2f6x2` to `.bf16x2`, source operand `a` has `.b16` type. Each 8-bit input value in operand `a` is converted to `.bf16` type. The converted values are packed in the destination operand `d` such that the value converted from the upper 8 bits of `a` is stored in the upper 16 bits of `d` and the value converted from the lower 8 bits of `a` is stored in the lower 16 bits of `d`. Optional operand `scale-factor` has type `.b16` and stores two packed scaling factors of type `.ue8m0`. For up-conversion, inputs are converted to destination type and then multiplied by `scale-factor`. The scaling factor of `.s2f6` input from upper 8 bits of `a` is stored in the upper 8 bits of operand `scale-factor` and the scaling factor of `.s2f6` input from lower 8 bits of `a` is stored in the lower 8 bits of operand `scale-factor`. If not specified explicitly, value of `scale-factor` will be assumed to be `0x7f7f`, that is, assumed as value `1` for both input scale factors.

Optional qualifier `.scaled::n2::ue8m0` specifies that the instruction uses packed scale-factor with 2 scale values of `ue8m0` type. Operand `scale-factor` and qualifier `.scaled::n2::ue8m0` must be used together.

`rbits` is a `.b32` type register operand used for providing random bits for `.rs` rounding mode.

When converting to `.f16x2`, two 16-bit values are provided from `rbits` where 13 LSBs from upper 16-bits are used as random bits for operand `a` with 3 MSBs are 0 and 13 LSBs from lower 16-bits are used as random bits for operand `b` with 3 MSBs are 0.

When converting to `.bf16x2`, two 16-bit values are provided from `rbits` where upper 16-bits are used as random bits for operand `a` and lower 16-bits are used as random bits for operand `b`.

When converting to `.e4m3x4`/`.e5m2x4`/`.e2m3x4`/`.e3m2x4`, two 16-bit values are provided from `rbits` where lower 16-bits are used for operands `e`, `f` and upper 16 bits are used for operands `a`, `b`.

When converting to `.e2m1x4`, two 16-bit values are provided from `rbits` where lower 8-bits from both 16-bits half of `rbits` are used for operands `e`, `f` and upper 8-bits from both 16-bits half of `rbits` are used for operands `a`, `b`.

Rounding modifier is mandatory in all of the following cases:

* float-to-float conversions, when destination type is smaller than source type

  * All float-to-int conversions

  * All int-to-float conversions

  * All conversions involving `.f16x2`, `.e4m3x2, .e5m2x2,`, `.bf16x2`, `.tf32`, `.e2m1x2`, `.e2m3x2`, `.e3m2x2`, `.e4m3x4`, `.e5m2x4`, `.e2m1x4`, `.e2m3x4`, `.e3m2x4`, `.s2f6x2` and `.ue8m0x2` instruction types.

`.satfinite` modifier is only supported for conversions involving the following types:

* `.e4m3x2`, `.e5m2x2`, `.e2m1x2`, `.e2m3x2`, `.e3m2x2`, `.e4m3x4`, `.e5m2x4`, `.e2m1x4`, `.e2m3x4`, `.e3m2x4`, `.s2f6x2` destination types. `.satfinite` modifier is mandatory for such conversions.

  * `.f16`, `.bf16`, `.f16x2`, `.bf16x2`, `.tf32`, `.ue8m0x2` as destination types.

Semantics

if (/* inst type is .f16x2 or .bf16x2 */) {
        d[31:16] = convert(a);
        d[15:0]  = convert(b);
    } else if (/* inst destination type is .e5m2x2 or .e4m3x2 or .ue8m0x2 */) {
        if (/* inst source type is .f32 */) {
            d[15:8] = convert(a);
            d[7:0]  = convert(b);
        } else {
            d[15:8] = convert(a[31:16]);
            d[7:0]  = convert(a[15:0]);
        }
    } else if (/* inst destination type is .s2f6x2 */) {
        if (/* inst source type is .f32 */) {
            d[15:8] = convert(a / scale-factor[15:8]);
            d[7:0]  = convert(b / scale-factor[7:0]);
        } else {
            d[15:8] = convert(a[15:8] / scale-factor[15:8]);
            d[7:0]  = convert(a[7:0] / scale-factor[7:0]);
        }
    } else if (/* inst source type is .s2f6x2 */) {
            d[31:16] = convert(a[15:8]) * scale-factor[15:8];
            d[15:0]  = convert(a[7:0]) * scale-factor[7:0];
    } else if (/* inst destination type is .e2m1x2 */) {
        if (/* inst source type is .f32 */) {
            d[7:4] = convert(a);
            d[3:0] = convert(b);
        } else {
            d[7:4] = convert(a[31:16]);
            d[3:0]  = convert(a[15:0]);
        }
    } else if (/* inst destination type is .e2m3x2 or .e3m2x2 */) {
        if (/* inst source type is .f32 */) {
            d[15:14] = 0;
            d[13:8] = convert(a);
            d[7:6] = 0;
            d[5:0] = convert(b);
        } else {
            d[15:14] = 0;
            d[13:8] = convert(a[31:16]);
            d[7:6] = 0;
            d[5:0] = convert(a[15:0]);
        }
    } else if (/* inst destination type is .e2m1x4 */) {
        d[15:12] = convert(a);
        d[11:8] = convert(b);
        d[7:4] = convert(e);
        d[3:0] = convert(f);
    } else if (/* inst destination type is .e4m3x4 or .e5m2x4 */) {
        d[31:24] = convert(a);
        d[23:16] = convert(b);
        d[15:8] = convert(e);
        d[7:0] = convert(f);
    } else if (/* inst destination type is .e2m3x4 or .e3m2x4 */) {
        d[31:30] = 0;
        d[29:24] = convert(a);
        d[23:22] = 0;
        d[21:16] = convert(b);
        d[15:14] = 0;
        d[13:8] = convert(e);
        d[7:6] = 0;
        d[5:0] = convert(f);
    } else {
        d = convert(a);
    }

// Random bits `rbits` semantics for `.rs` rounding:

1. Destination type `.f16`: Refer [Figure 38](<#cvt-rs-rbits-layout-f16>) for random bits layout details.

![_images/cvt-rs-rbits-layout-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/cvt-rs-rbits-layout-f16.png)

Figure 38 Random bits layout for `.rs` rounding with `.f16` destination type

  2. Destination type `.bf16`: Refer [Figure 39](<#cvt-rs-rbits-layout-bf16>) for random bits layout details.

![_images/cvt-rs-rbits-layout-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/cvt-rs-rbits-layout-bf16.png)

Figure 39 Random bits layout for `.rs` rounding with `.bf16` destination type

  3. Destination type `.e2m1x4`: Refer [Figure 40](<#cvt-rs-rbits-layout-f4>) for random bits layout details.

![_images/cvt-rs-rbits-layout-f4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/cvt-rs-rbits-layout-f4.png)

Figure 40 Random bits layout for `.rs` rounding with `.e2m1x4` destination type

  4. Destination type `.e5m2x4`, `.e4m3x4`, `.e3m2x4`, `.e2m3x4`: Refer [Figure 41](<#cvt-rs-rbits-layout-f8-f6>) for random bits layout details.

![_images/cvt-rs-rbits-layout-f8-f6.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/cvt-rs-rbits-layout-f8-f6.png)

Figure 41 Random bits layout for `.rs` rounding with `.e5m2x4`/`.e4m3x4`/`.e3m2x4`/`.e2m3x4` destination type

Integer Notes

Integer rounding is required for float-to-integer conversions, and for same-size float-to-float conversions where the value is rounded to an integer. Integer rounding is illegal in all other instances.

Integer rounding modifiers:

`.rni`
    

round to nearest integer, choosing even integer if source is equidistant between two integers

`.rzi`
    

round to nearest integer in the direction of zero

`.rmi`
    

round to nearest integer in direction of negative infinity

`.rpi`
    

round to nearest integer in direction of positive infinity

In float-to-integer conversions, depending upon conversion types, `NaN` input results in following value:

1. Zero if source is not `.f64` and destination is not `.s64`, `.u64`.

  2. Otherwise 1 << (BitWidth(dst) - 1) corresponding to the value of (`MAXINT` >> 1) + 1 for unsigned type or `MININT` for signed type.

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported.

For `cvt.ftz.dtype.f32` float-to-integer conversions and `cvt.ftz.f32.f32` float-to-float conversions with integer rounding, subnormal inputs are flushed to sign-preserving zero. Modifier `.ftz` can only be specified when either `.dtype` or `.atype` is `.f32` and applies only to single precision (`.f32`) inputs and results.

`sm_1x`
    

For `cvt.ftz.dtype.f32` float-to-integer conversions and `cvt.ftz.f32.f32` float-to-float conversions with integer rounding, subnormal inputs are flushed to sign-preserving zero. The optional `.ftz` modifier may be specified in these cases for clarity.

**Note:** In PTX ISA versions 1.4 and earlier, the `cvt` instruction did not flush single-precision subnormal inputs or results to zero if the destination type size was 64-bits. The compiler will preserve this behavior for legacy PTX code.

Saturation modifier:

`.sat`
    

For integer destination types, `.sat` limits the result to `MININT..MAXINT` for the size of the operation. Note that saturation applies to both signed and unsigned integer types.

The saturation modifier is allowed only in cases where the destination type’s value range is not a superset of the source type’s value range; i.e., the `.sat` modifier is illegal in cases where saturation is not possible based on the source and destination types.

For float-to-integer conversions, the result is clamped to the destination range by default; i.e, `.sat` is redundant.

Floating Point Notes

Floating-point rounding is required for float-to-float conversions that result in loss of precision, and for integer-to-float conversions. Floating-point rounding is illegal in all other instances.

Floating-point rounding modifiers:

`.rn`
    

rounding to nearest, with ties to even

`.rna`
    

rounding to nearest, with ties away from zero

`.rz`
    

rounding toward zero

`.rm`
    

rounding toward negative infinity

`.rp`
    

rounding toward positive infinity

`.rs`
    

Stochastic rounding is achieved through the use of the supplied random bits. Operation’s result is rounded in the direction toward zero or away from zero based on the carry out of the integer addition of the supplied random bits (`rbits`) to the truncated off (discarded) bits of mantissa from the input.

A floating-point value may be rounded to an integral value using the integer rounding modifiers (see Integer Notes). The operands must be of the same size. The result is an integral value, stored in floating-point format.

Subnormal numbers:

`sm_20+`
    

By default, subnormal numbers are supported. Modifier `.ftz` may be specified to flush single-precision subnormal inputs and results to sign-preserving zero. Modifier `.ftz` can only be specified when either `.dtype` or `.atype` is `.f32` and applies only to single precision (`.f32`) inputs and results.

`sm_1x`
    

Single-precision subnormal inputs and results are flushed to sign-preserving zero. The optional `.ftz` modifier may be specified in these cases for clarity.

**Note:** In PTX ISA versions 1.4 and earlier, the `cvt` instruction did not flush single-precision subnormal inputs or results to zero if either source or destination type was `.f64`. The compiler will preserve this behavior for legacy PTX code. Specifically, if the PTX ISA version is 1.4 or earlier, single-precision subnormal inputs and results are flushed to sign-preserving zero only for `cvt.f32.f16`, `cvt.f16.f32`, and `cvt.f32.f32` instructions.

Saturation modifier:

`.sat`:
    

For floating-point destination types, `.sat` limits the result to the range [0.0, 1.0]. `NaN` results are flushed to positive zero. Applies to `.f16`, `.f32`, and `.f64` types.

`.relu`:
    

For `.f16`, `.f16x2`, `.bf16`, `.bf16x2`, `.e4m3x2`, `.e5m2x2`, `.e2m1x2`, `.e2m3x2`, `.e3m2x2`, `.e4m3x4`, `.e5m2x4`, `.e2m1x4`, `.e2m3x4`, `.e3m2x4`, `.s2f6x2` and `.tf32` destination types, `.relu` clamps the result to 0 if negative. `NaN` results are converted to canonical `NaN`.

`.satfinite`:
    

For `.f16`, `.f16x2`, `.bf16`, `.bf16x2`, `.e4m3x2`, `.e5m2x2`, `.ue8m0x2`, `.e4m3x4`, `.e5m2x4` and `.tf32` destination formats, if the input value is `NaN`, then the result is `NaN` in the specified destination format. For `.e2m1x2`, `.e2m3x2`, `.e3m2x2`, `.e2m1x4`, `.e2m3x4`, `.e3m2x4`, `.s2f6x2` destination formats `NaN` results are converted to positive _MAX_NORM_. If the absolute value of input (ignoring sign) is greater than _MAX_NORM_ of the specified destination format, then the result is sign-preserved _MAX_NORM_ of the destination format and a positive _MAX_NORM_ in `.ue8m0x2` for which the destination sign is not supported.

Notes

A source register wider than the specified type may be used, except when the source operand has `.bf16` or `.bf16x2` format. The lower `n` bits corresponding to the instruction-type width are used in the conversion. See [Operand Size Exceeding Instruction-Type Size](<#operand-size-exceeding-instruction-type-size>) for a description of these relaxed type-checking rules.

A destination register wider than the specified type may be used, except when the destination operand has `.bf16`, `.bf16x2` or `.tf32` format. The result of conversion is sign-extended to the destination register width for signed integers, and is zero-extended to the destination register width for unsigned, bit-size, and floating-point types. See [Operand Size Exceeding Instruction-Type Size](<#operand-size-exceeding-instruction-type-size>) for a description of these relaxed type-checking rules.

For `cvt.f32.bf16`, `NaN` input yields unspecified `NaN`.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

`.relu` modifier and {`.f16x2`, `.bf16`, `.bf16x2`, `.tf32`} destination formats introduced in PTX ISA version 7.0.

`cvt.f32.bf16` introduced in PTX ISA version 7.1.

`cvt.bf16.{u8/s8/u16/s16/u32/s32/u64/s64/f16/f64/bf16}`, `cvt.{u8/s8/u16/s16/u32/s32/u64/s64/f16/f64}.bf16`, and `cvt.tf32.f32.{relu}.{rn/rz}` introduced in PTX ISA version 7.8.

`.ftz` qualifier for `cvt.f32.bf16` introduced in PTX ISA version 7.8.

`cvt` with `.e4m3x2`/`.e5m2x2` for `sm_90` or higher introduced in PTX ISA version 7.8.

`cvt.satfinite.{e4m3x2, e5m2x2}.{f32, f16x2}` for `sm_90` or higher introduced in PTX ISA version 7.8.

`cvt` with `.e4m3x2`/`.e5m2x2` for `sm_89` introduced in PTX ISA version 8.1.

`cvt.satfinite.{e4m3x2, e5m2x2}.{f32, f16x2}` for `sm_89` introduced in PTX ISA version 8.1.

`cvt.satfinite.{f16, bf16, f16x2, bf16x2, tf32}.f32` introduced in PTX ISA version 8.1.

`cvt.{rn/rz}.satfinite.tf32.f32` introduced in PTX ISA version 8.6.

`cvt.rn.satfinite{.relu}.{e2m1x2/e2m3x2/e3m2x2/ue8m0x2}.f32` introduced in PTX ISA version 8.6.

`cvt.rn{.relu}.f16x2.{e2m1x2/e2m3x2/e3m2x2}` introduced in PTX ISA version 8.6.

`cvt.{rp/rz}{.satfinite}{.relu}.ue8m0x2.bf16x2` introduced in PTX ISA version 8.6.

`cvt.{rz/rp}.satfinite.ue8m0x2.f32` introduced in PTX ISA version 8.6.

`cvt.rn.bf16x2.ue8m0x2` introduced in PTX ISA version 8.6.

`.rs` rounding mode introduced in PTX ISA version 8.7.

`cvt.rs{.e2m1x4/.e4m3x4/.e5m2x4/.e3m2x4/.e2m3x4}.f32` introduced in PTX ISA version 8.7.

`cvt.rn.satfinite{.relu}{.e5m2x2/.e4m3x2}{.bf16x2}` introduced in PTX ISA version 9.1.

`cvt.rn.satfinite{.relu}{.e2m3x2/.e3m2x2/.e2m1x2}{.f16x2/.bf16x2}` introduced in PTX ISA version 9.1.

`cvt` with `.s2f6x2` instruction type introduced in PTX ISA version 9.1.

Target ISA Notes

`cvt` to or from `.f64` requires `sm_13` or higher.

`.relu` modifier and {`.f16x2`, `.bf16`, `.bf16x2`, `.tf32`} destination formats require `sm_80` or higher.

`cvt.f32.bf16` requires `sm_80` or higher.

`cvt.bf16.{u8/s8/u16/s16/u32/s32/u64/s64/f16/f64/bf16}`, `cvt.{u8/s8/u16/s16/u32/s32/u64/s64/f16/f64}.bf16`, and `cvt.tf32.f32.{relu}.{rn/rz}` require `sm_90` or higher.

`.ftz` qualifier for `cvt.f32.bf16` requires `sm_90` or higher.

`cvt` with `.e4m3x2`/`.e5m2x2` requires `sm89` or higher.

`cvt.satfinite.{e4m3x2, e5m2x2}.{f32, f16x2}` requires `sm_89` or higher.

`cvt.{rn/rz}.satfinite.tf32.f32` requires `sm_100` or higher.

`cvt.rn.satfinite{.relu}.{e2m1x2/e2m3x2/e3m2x2/ue8m0x2}.f32` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`cvt.rn{.relu}.f16x2.{e2m1x2/e2m3x2/e3m2x2}` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`cvt.{rz/rp}{.satfinite}{.relu}.ue8m0x2.bf16x2` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`cvt.{rz/rp}.satfinite.ue8m0x2.f32` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`cvt.rn.bf16x2.ue8m0x2` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

`.rs` rounding mode is supported on following architectures:

* `sm_100a`

  * `sm_103a`

`cvt.rs{.e2m1x4/.e4m3x4/.e5m2x4/.e3m2x4/.e2m3x4}.f32` is supported on following architectures:

* `sm_100a`

  * `sm_103a`

`cvt.rn.satfinite{.relu}{.e5m2x2/.e4m3x2}{.bf16x2}` is supported on following family-specific architectures:

* `sm_100f` or higher in the same family

  * `sm_110f` or higher in the same family

  * `sm_120f` or higher in the same family

`cvt.rn.satfinite{.relu}{.e2m3x2/.e3m2x2/.e2m1x2}{.f16x2/.bf16x2}` is supported on following family-specific architectures:

* `sm_100f` or higher in the same family

  * `sm_110f` or higher in the same family

  * `sm_120f` or higher in the same family

`cvt` with `.s2f6x2` instruction type is supported on following architectures:

* `sm_100a`

  * `sm_103a`

  * `sm_110a`

  * `sm_120a`

  * `sm_121a`

Examples

cvt.f32.s32 f,i;
    cvt.s32.f64 j,r;     // float-to-int saturates by default
    cvt.rni.f32.f32 x,y; // round to nearest int, result is fp
    cvt.f32.f32 x,y;     // note .ftz behavior for sm_1x targets
    cvt.rn.relu.f16.f32      b, f;        // result is saturated with .relu saturation mode
    cvt.rz.f16x2.f32         b1, f, f1;   // convert two fp32 values to packed fp16 outputs
    cvt.rn.relu.satfinite.f16x2.f32    b1, f, f1;   // convert two fp32 values to packed fp16 outputs with .relu saturation on each output
    cvt.rn.bf16.f32          b, f;        // convert fp32 to bf16
    cvt.rz.relu.satfinite.bf16.f3 2    b, f;        // convert fp32 to bf16 with .relu and .satfinite saturation
    cvt.rz.satfinite.bf16x2.f32        b1, f, f1;   // convert two fp32 values to packed bf16 outputs
    cvt.rn.relu.bf16x2.f32   b1, f, f1;   // convert two fp32 values to packed bf16 outputs with .relu saturation on each output
    cvt.rna.satfinite.tf32.f32         b1, f;       // convert fp32 to tf32 format
    cvt.rn.relu.tf32.f32     d, a;        // convert fp32 to tf32 format
    cvt.f64.bf16.rp          f, b;        // convert bf16 to f64 format
    cvt.bf16.f16.rz          b, f         // convert f16 to bf16 format
    cvt.bf16.u64.rz          b, u         // convert u64 to bf16 format
    cvt.s8.bf16.rpi          s, b         // convert bf16 to s8 format
    cvt.bf16.bf16.rpi        b1, b2       // convert bf16 to corresponding int represented in bf16 format
    cvt.rn.satfinite.e4m3x2.f32 d, a, b;  // convert a, b to .e4m3 and pack as .e4m3x2 output
    cvt.rn.relu.satfinite.e5m2x2.f16x2 d, a; // unpack a and convert the values to .e5m2 outputs with .relu
                                             // saturation on each output and pack as .e5m2x2
    cvt.rn.f16x2.e4m3x2 d, a;             // unpack a, convert two .e4m3 values to packed f16x2 output
    cvt.rn.satfinite.tf32.f32 d, a;       // convert fp32 to tf32 format
    cvt.rn.relu.f16x2.e2m1x2 d, a;        // unpack a, convert two .e2m1 values to packed f16x2 output
    cvt.rn.satfinite.e2m3x2.f32 d, a, b;  // convert a, b to .e2m3 and pack as .e2m3x2 output
    cvt.rn.relu.f16x2.e3m2x2 d, a;        // unpack a, convert two .e3m2 values to packed f16x2 output
    
    cvt.rs.f16x2.f32    d, a, b, rbits;  // convert 2 fp32 values to packed fp16 with applying .rs rounding
    cvt.rs.satfinite.e2m1x4.f32  d, {a, b, e, f}, rbits; // convert 4 fp32 values to packed 4 e2m1 values with applying .rs rounding
    
    cvt.rn.satfinite.relu.e2m1x2type.f16x2  d, a; // unpack a and covert to two .e2m1 values
    cvt.rn.satfinite.e2m3x2type.bf16x2  d, a; // unpack a and covert to two .e2m3 values
    
    // Convert 2 f32 values to s2f6 after applying scale factor for dividing the value
    cvt.rn.satfinite.scaled::n2::ue8m0.s2f6x2.f32 d, a, b, scale-factor;