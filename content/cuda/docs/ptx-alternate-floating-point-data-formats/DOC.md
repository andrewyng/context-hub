---
name: ptx-alternate-floating-point-data-formats
description: The fundamental floating-point types supported in PTX have implicit bit
  representations that indicate the number of bits used to store exponent and mantissa.
  For example, the `.f16` type indicates 5 b...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.3. Alternate Floating-Point Data Formats

---
title: "5.2.3. Alternate Floating-Point Data Formats"
section: 5.2.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.2.3. Alternate Floating-Point Data Formats


The fundamental floating-point types supported in PTX have implicit bit representations that indicate the number of bits used to store exponent and mantissa. For example, the `.f16` type indicates 5 bits reserved for exponent and 10 bits reserved for mantissa. In addition to the floating-point representations assumed by the fundamental types, PTX allows the following alternate floating-point data formats:

`bf16` data format:  
    

This data format is a 16-bit floating point format with 8 bits for exponent and 7 bits for mantissa. A register variable containing `bf16` data must be declared with `.b16` type.

`e4m3` data format:
    

This data format is an 8-bit floating point format with 4 bits for exponent and 3 bits for mantissa. The `e4m3` encoding does not support infinity and `NaN` values are limited to `0x7f` and `0xff`. A register variable containing `e4m3` value must be declared using bit-size type.

`e5m2` data format:
    

This data format is an 8-bit floating point format with 5 bits for exponent and 2 bits for mantissa. A register variable containing `e5m2` value must be declared using bit-size type.

`tf32` data format:
    

This data format is a special 32-bit floating point format supported by the matrix multiply-and-accumulate instructions, with the same range as `.f32` and reduced precision (>=10 bits). The internal layout of `tf32` format is implementation defined. PTX facilitates conversion from single precision `.f32` type to `tf32` format. A register variable containing `tf32` data must be declared with `.b32` type.

`e2m1` data format:
    

This data format is a 4-bit floating point format with 2 bits for exponent and 1 bit for mantissa. The `e2m1` encoding does not support infinity and `NaN`. `e2m1` values must be used in a packed format specified as `e2m1x2`. A register variable containing two `e2m1` values must be declared with `.b8` type.

`e2m3` data format:
    

This data format is a 6-bit floating point format with 2 bits for exponent and 3 bits for mantissa. The `e2m3` encoding does not support infinity and `NaN`. `e2m3` values must be used in a packed format specified as `e2m3x2`. A register variable containing two `e2m3` values must be declared with `.b16` type where each `.b8` element has 6-bit floating point value and 2 MSB bits padded with zeros.

`e3m2` data format:
    

This data format is a 6-bit floating point format with 3 bits for exponent and 2 bits for mantissa. The `e3m2` encoding does not support infinity and `NaN`. `e3m2` values must be used in a packed format specified as `e3m2x2`. A register variable containing two `e3m2` values must be declared with `.b16` type where each `.b8` element has 6-bit floating point value and 2 MSB bits padded with zeros.

`ue8m0` data format:
    

This data format is an 8-bit unsigned floating-point format with 8 bits for exponent and 0 bits for mantissa. The `ue8m0` encoding does not support infinity. `NaN` value is limited to `0xff`. `ue8m0` values must be used in a packed format specified as `ue8m0x2`. A register variable containing two `ue8m0` values must be declared with `.b16` type.

`ue4m3` data format:
    

This data format is a 7-bit unsigned floating-point format with 4 bits for exponent and 3 bits for mantissa. The `ue4m3` encoding does not support infinity. `NaN` value is limited to `0x7f`. A register variable containing single `ue4m3` value must be declared with `.b8` type having MSB bit padded with zero.

Alternate data formats cannot be used as fundamental types. They are supported as source or destination formats by certain instructions.