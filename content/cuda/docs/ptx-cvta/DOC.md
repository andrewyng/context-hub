---
name: ptx-cvta
description: Convert address from `.const`, [Kernel Function Parameters](<#kernel-function-parameters>)
  (`.param`), `.global`, `.local`, or `.shared` state space to generic, or vice-versa.
  Take the generic address...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.20. Data Movement and Conversion Instructions:cvta

---
title: "9.7.9.20. Data Movement and Conversion Instructions:cvta"
section: 9.7.9.20
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.20. Data Movement and Conversion Instructions:cvta


`cvta`

Convert address from `.const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `.global`, `.local`, or `.shared` state space to generic, or vice-versa. Take the generic address of a variable declared in `.const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `.global`, `.local`, or `.shared` state space.

Syntax

// convert const, global, local, or shared address to generic address
    cvta.space.size  p, a;        // source address in register a
    cvta.space.size  p, var;      // get generic address of var
    cvta.space.size  p, var+imm;  // generic address of var+offset
    
    // convert generic address to const, global, local, or shared address
    cvta.to.space.size  p, a;
    
    .space = { .const, .global, .local, .shared{::cta, ::cluster}, .param{::entry} };
    .size  = { .u32, .u64 };

Description

Convert a `const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `global`, `local`, or `shared` address to a generic address, or vice-versa. The source and destination addresses must be the same size. Use `cvt.u32.u64` or `cvt.u64.u32` to truncate or zero-extend addresses.

For variables declared in `.const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `.global`, `.local`, or `.shared` state space, the generic address of the variable may be taken using `cvta`. The source is either a register or a variable defined in `const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `global`, `local`, or `shared` memory with an optional offset.

When converting a generic address into a `const`, [Kernel Function Parameters](<#kernel-function-parameters>) (`.param`), `global`, `local`, or `shared` address, the resulting address is undefined in cases where the generic address does not fall within the address window of the specified state space. A program may use `isspacep` to guard against such incorrect behavior.

For `cvta` with `.shared` state space, the address must belong to the space specified by `::cta` or `::cluster` sub-qualifier, otherwise the behavior is undefined. If no sub-qualifier is specified with `.shared` state space, then `::cta` is assumed by default.

If `.param` is specified without any sub-qualifiers then it defaults to `.param::entry`. For `.param{::entry}` state space, operand `a` must be a kernel parameter address, otherwise behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

`cvta.const` and `cvta.to.const` introduced in PTX ISA version 3.1.

`cvta.param` and `cvta.to.param` introduced in PTX ISA version 7.7.

**Note:** The current implementation does not allow generic pointers to `const` space variables in programs that contain pointers to constant buffers passed as kernel parameters.

Support for `::cta` and `::cluster` sub-qualifiers introduced in PTX ISA version 7.8.

Support for sub-qualifier `::entry` on `.param` space introduced in PTX ISA version 8.3.

Target ISA Notes

`cvta` requires `sm_20` or higher.

`cvta.param{::entry}` and `cvta.to.param{::entry}` requires `sm_70` or higher.

Sub-qualifier `::cta` requires `sm_30` or higher.

Sub-qualifier `::cluster` requires `sm_90` or higher.

Examples

cvta.const.u32   ptr,cvar;
    cvta.local.u32   ptr,lptr;
    cvta.shared::cta.u32  p,As+4;
    cvta.shared::cluster.u32 ptr, As;
    cvta.to.global.u32  p,gptr;
    cvta.param.u64   ptr,pvar;
    cvta.to.param::entry.u64  epptr, ptr;