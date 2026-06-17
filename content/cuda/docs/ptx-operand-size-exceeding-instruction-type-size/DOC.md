---
name: ptx-operand-size-exceeding-instruction-type-size
description: For convenience, `ld`, `st`, and `cvt` instructions permit source and
  destination data operands to be wider than the instruction-type size, so that narrow
  values may be loaded, stored, and converted u...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.4.1. Operand Size Exceeding Instruction-Type Size

---
title: "9.4.1. Operand Size Exceeding Instruction-Type Size"
section: 9.4.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 9.4.1. Operand Size Exceeding Instruction-Type Size


For convenience, `ld`, `st`, and `cvt` instructions permit source and destination data operands to be wider than the instruction-type size, so that narrow values may be loaded, stored, and converted using regular-width registers. For example, 8-bit or 16-bit values may be held directly in 32-bit or 64-bit registers when being loaded, stored, or converted to other types and sizes. The operand type checking rules are relaxed for bit-size and integer (signed and unsigned) instruction types; floating-point instruction types still require that the operand type-size matches exactly, unless the operand is of bit-size type.

When a source operand has a size that exceeds the instruction-type size, the source data is truncated (chopped) to the appropriate number of bits specified by the instruction type-size.

[Table 27](<#operand-size-exceeding-instruction-type-size-relaxed-type-checking-rules-source-operands>) summarizes the relaxed type-checking rules for source operands. Note that some combinations may still be invalid for a particular instruction; for example, the `cvt` instruction does not support `.bX` instruction types, so those rows are invalid for `cvt`.

Table 27 Relaxed Type-checking Rules for Source Operands | **Source Operand Type**  
---|---  
**b8** | **b16** | **b32** | **b64** | **b128** | **s8** | **s16** | **s32** | **s64** | **u8** | **u16** | **u32** | **u64** | **f16** | **f32** | **f64**  
**Instruction Type** | **b8** | – | chop | chop | chop | chop | – | chop | chop | chop | – | chop | chop | chop | chop | chop | chop  
**b16** | inv | – | chop | chop | chop | inv | – | chop | chop | inv | – | chop | chop | – | chop | chop  
**b32** | inv | inv | – | chop | chop | inv | inv | – | chop | inv | inv | – | chop | inv | – | chop  
**b64** | inv | inv | inv | – | chop | inv | inv | inv | – | inv | inv | inv | – | inv | inv | –  
**b128** | inv | inv | inv | inv | – | inv | inv | inv | inv | inv | inv | inv | inv | inv | inv | inv  
**s8** | – | chop | chop | chop | chop | – | chop | chop | chop | – | chop | chop | chop | inv | inv | inv  
**s16** | inv | – | chop | chop | chop | inv | – | chop | chop | inv | – | chop | chop | inv | inv | inv  
**s32** | inv | inv | – | chop | chop | inv | inv | – | chop | inv | inv | – | chop | inv | inv | inv  
**s64** | inv | inv | inv | – | chop | inv | inv | inv | – | inv | inv | inv | – | inv | inv | inv  
**u8** | – | chop | chop | chop | chop | – | chop | chop | chop | – | chop | chop | chop | inv | inv | inv  
**u16** | inv | – | chop | chop | chop | inv | – | chop | chop | inv | – | chop | chop | inv | inv | inv  
**u32** | inv | inv | – | chop | chop | inv | inv | – | chop | inv | inv | – | chop | inv | inv | inv  
**u64** | inv | inv | inv | – | chop | inv | inv | inv | – | inv | inv | inv | – | inv | inv | inv  
**f16** | inv | – | chop | chop | chop | inv | inv | inv | inv | inv | inv | inv | inv | – | inv | inv  
**f32** | inv | inv | – | chop | chop | inv | inv | inv | inv | inv | inv | inv | inv | inv | – | inv  
**f64** | inv | inv | inv | – | chop | inv | inv | inv | inv | inv | inv | inv | inv | inv | inv | –  
**Notes** |  chop = keep only low bits that fit; “–” = allowed, but no conversion needed; inv = invalid, parse error.

  1. Source register size must be of equal or greater size than the instruction-type size.
  2. Bit-size source registers may be used with any appropriately-sized instruction type. The data are truncated (“chopped”) to the instruction-type size and interpreted according to the instruction type.
  3. Integer source registers may be used with any appropriately-sized bit-size or integer instruction type. The data are truncated to the instruction-type size and interpreted according to the instruction type.
  4. Floating-point source registers can only be used with bit-size or floating-point instruction types. When used with a narrower bit-size instruction type, the data are truncated. When used with a floating-point instruction type, the size must match exactly.

When a destination operand has a size that exceeds the instruction-type size, the destination data is zero- or sign-extended to the size of the destination register. If the corresponding instruction type is signed integer, the data is sign-extended; otherwise, the data is zero-extended.

[Table 28](<#operand-size-exceeding-instruction-type-size-relaxed-type-checking-rules-destination-operands>) summarizes the relaxed type-checking rules for destination operands.

Table 28 Relaxed Type-checking Rules for Destination Operands | **Destination Operand Type**  
---|---  
**b8** | **b16** | **b32** | **b64** | **b128** | **s8** | **s16** | **s32** | **s64** | **u8** | **u16** | **u32** | **u64** | **f16** | **f32** | **f64**  
**Instruction Type** | **b8** | – | zext | zext | zext | zext | – | zext | zext | zext | – | zext | zext | zext | zext | zext | zext  
**b16** | inv | – | zext | zext | zext | inv | – | zext | zext | inv | – | zext | zext | – | zext | zext  
**b32** | inv | inv | – | zext | zext | inv | inv | – | zext | inv | inv | – | zext | inv | – | zext  
**b64** | inv | inv | inv | – | zext | inv | inv | inv | – | inv | inv | inv | – | inv | inv | –  
**b128** | inv | inv | inv | inv | – | inv | inv | inv | inv | inv | inv | inv | inv | inv | inv | inv  
**s8** | – | sext | sext | sext | sext | – | sext | sext | sext | – | sext | sext | sext | inv | inv | inv  
**s16** | inv | – | sext | sext | sext | inv | – | sext | sext | inv | – | sext | sext | inv | inv | inv  
**s32** | inv | inv | – | sext | sext | inv | inv | – | sext | inv | inv | – | sext | inv | inv | inv  
**s64** | inv | inv | inv | – | sext | inv | inv | inv | – | inv | inv | inv | – | inv | inv | inv  
**u8** | – | zext | zext | zext | zext | – | zext | zext | zext | – | zext | zext | zext | inv | inv | inv  
**u16** | inv | – | zext | zext | zext | inv | – | zext | zext | inv | – | zext | zext | inv | inv | inv  
**u32** | inv | inv | – | zext | zext | inv | inv | – | zext | inv | inv | – | zext | inv | inv | inv  
**u64** | inv | inv | inv | – | zext | inv | inv | inv | – | inv | inv | inv | – | inv | inv | inv  
**f16** | inv | – | zext | zext | zext | inv | inv | inv | inv | inv | inv | inv | inv | – | inv | inv  
**f32** | inv | inv | – | zext | zext | inv | inv | inv | inv | inv | inv | inv | inv | inv | – | inv  
**f64** | inv | inv | inv | – | zext | inv | inv | inv | inv | inv | inv | inv | inv | inv | inv | –  
**Notes** |  sext = sign-extend; zext = zero-extend; “–” = allowed, but no conversion needed; inv = invalid, parse error.

  1. Destination register size must be of equal or greater size than the instruction-type size.
  2. Bit-size destination registers may be used with any appropriately-sized instruction type. The data are sign-extended to the destination register width for signed integer instruction types, and are zero-extended to the destination register width otherwise.
  3. Integer destination registers may be used with any appropriately-sized bit-size or integer instruction type. The data are sign-extended to the destination register width for signed integer instruction types, and are zero-extended to the destination register width for bit-size an d unsigned integer instruction types.
  4. Floating-point destination registers can only be used with bit-size or floating-point instruction types. When used with a narrower bit-size instruction type, the data are zero-extended. When used with a floating-point instruction type, the size must match exactly.