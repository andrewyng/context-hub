---
name: ptx-sured
description: Reduce surface memory.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.11.3. Surface Instructions:sured

---
title: "9.7.11.3. Surface Instructions:sured"
section: 9.7.11.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.11.3. Surface Instructions:sured


`sured`

Reduce surface memory.

Syntax

sured.b.op.geom.ctype.clamp  [a,b],c; // byte addressing
    sured.p.op.geom.ctype.clamp  [a,b],c; // sample addressing
    
    .op    = { .add, .min, .max, .and, .or };
    .geom  = { .1d, .2d, .3d };
    .ctype = { .u32, .u64, .s32, .b32, .s64 };  // for sured.b
    .ctype = { .b32, .b64 };                    // for sured.p
    .clamp = { .trap, .clamp, .zero };

Description

Reduction to surface memory using a surface coordinate vector. The instruction performs a reduction operation with data from operand `c` to the surface named by operand `a` at coordinates given by operand `b`. Operand `a` is a `.surfref` variable or `.u64` register. Operand `b` is a scalar or singleton tuple for 1d surfaces; is a two-element vector for 2d surfaces; and is a four-element vector for 3d surfaces, where the fourth element is ignored. Coordinate elements are of type `.s32`.

`sured.b` performs an unformatted reduction on `.u32`, `.s32`, `.b32`, `.u64`, or `.s64` data. The lowest dimension coordinate represents a byte offset into the surface and is not scaled. Operation `add` applies to `.u32`, `.u64`, and `.s32` types; `min` and `max` apply to `.u32`, `.s32`, `.u64` and `.s64` types; operations `and` and `or` apply to `.b32` type.

`sured.p` performs an unformatted reduction on sample-addressed data. The lowest dimension coordinate represents a sample offset rather than a byte offset and is scaled by the data-size given by `.ctype`. The instruction type `.b64` is restricted to `min` and `max` operations. For type `.b32`, the data is interpreted as `.u32` or `.s32` based on the surface sample format as follows: if the surface format contains `UINT` data, then `.u32` is assumed; if the surface format contains `SINT` data, then `.s32` is assumed. For type `.b64`, if the surface format contains `UINT` data, then `.u64` is assumed; if the surface format contains `SINT` data, then `.s64` is assumed.

A surface base address is assumed to be aligned to a 16 byte boundary, and the address given by the coordinate vector must be naturally aligned to a multiple of the access size. If an address is not properly aligned, the resulting behavior is undefined; i.e., the access may proceed by silently masking off low-order address bits to achieve proper rounding, or the instruction may fault.

The `.clamp` field specifies how to handle out-of-bounds addresses:

`.trap`
    

causes an execution trap on out-of-bounds addresses

`.clamp`
    

stores data at the nearest surface location (sized appropriately)

`.zero`
    

drops stores to out-of-bounds addresses

Indirect surface access

Beginning with PTX ISA version 3.1, indirect surface access is supported for target architecture `sm_20` or higher. In indirect access, operand `a` is a `.u64` register holding the address of a `.surfref` variable.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Indirect surface access introduced in PTX ISA version 3.1.

`.u64`/`.s64`/`.b64` types with `.min`/`.max` operations introduced in PTX ISA version 8.1.

Target ISA Notes

sured requires `sm_20` or higher.

Indirect surface access requires `sm_20` or higher.

`.u64`/`.s64`/`.b64` types with `.min`/`.max` operations requires `sm_50` or higher.

Examples

sured.b.add.2d.u32.trap  [surf_A, {x,y}], r1;
    sured.p.min.1d.u32.trap  [surf_B, {x}], r1;
    sured.b.max.1d.u64.trap  [surf_C, {x}], r1;
    sured.p.min.1d.b64.trap  [surf_D, {x}], r1;