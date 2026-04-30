---
name: ptx-suld
description: Load from surface memory.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.11.1. Surface Instructions:suld

---
title: "9.7.11.1. Surface Instructions:suld"
section: 9.7.11.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.11.1. Surface Instructions:suld


`suld`

Load from surface memory.

Syntax

suld.b.geom{.cop}.vec.dtype.clamp  d, [a, b];  // unformatted
    
    .geom  = { .1d, .2d, .3d, .a1d, .a2d };
    .cop   = { .ca, .cg, .cs, .cv };               // cache operation
    .vec   = { none, .v2, .v4 };
    .dtype = { .b8 , .b16, .b32, .b64 };
    .clamp = { .trap, .clamp, .zero };

Description

`suld.b.{1d,2d,3d}`

Load from surface memory using a surface coordinate vector. The instruction loads data from the surface named by operand `a` at coordinates given by operand `b` into destination `d`. Operand `a` is a `.surfref` variable or `.u64` register. Operand `b` is a scalar or singleton tuple for 1d surfaces; is a two-element vector for 2d surfaces; and is a four-element vector for 3d surfaces, where the fourth element is ignored. Coordinate elements are of type `.s32`.

`suld.b` performs an unformatted load of binary data. The lowest dimension coordinate represents a byte offset into the surface and is not scaled, and the size of the data transfer matches the size of destination operand `d`.

`suld.b.{a1d,a2d}`

Surface layer selection, followed by a load from the selected surface. The instruction first selects a surface layer from the surface array named by operand `a` using the index given by the first element of the array coordinate vector `b`. The instruction then loads data from the selected surface at coordinates given by the remaining elements of operand `b` into destination `d`. Operand `a` is a `.surfref` variable or `.u64` register. Operand `b` is a bit-size type vector or tuple containing an index into the array of surfaces followed by coordinates within the selected surface, as follows:

For 1d surface arrays, operand `b` has type `.v2.b32`. The first element is interpreted as an unsigned integer index (`.u32`) into the surface array, and the second element is interpreted as a 1d surface coordinate of type `.s32`.

For 2d surface arrays, operand `b` has type `.v4.b32`. The first element is interpreted as an unsigned integer index (`.u32`) into the surface array, and the next two elements are interpreted as 2d surface coordinates of type `.s32`. The fourth element is ignored.

A surface base address is assumed to be aligned to a 16 byte boundary, and the address given by the coordinate vector must be naturally aligned to a multiple of the access size. If an address is not properly aligned, the resulting behavior is undefined; i.e., the access may proceed by silently masking off low-order address bits to achieve proper rounding, or the instruction may fault.

The `.clamp` field specifies how to handle out-of-bounds addresses:

`.trap`  
    

causes an execution trap on out-of-bounds addresses

`.clamp`
    

loads data at the nearest surface location (sized appropriately)

`.zero`
    

loads zero for out-of-bounds addresses

Indirect surface access

Beginning with PTX ISA version 3.1, indirect surface access is supported for target architecture `sm_20` or higher. In indirect access, operand `a` is a `.u64` register holding the address of a `.surfref` variable.

PTX ISA Notes

`suld.b.trap` introduced in PTX ISA version 1.5.

Additional clamp modifiers and cache operations introduced in PTX ISA version 2.0.

`suld.b.3d` and `suld.b.{a1d,a2d}` introduced in PTX ISA version 3.0.

Indirect surface access introduced in PTX ISA version 3.1.

Target ISA Notes

`suld.b` supported on all target architectures.

`sm_1x` targets support only the `.trap` clamping modifier.

`suld.3d` and `suld.{a1d,a2d}` require `sm_20` or higher.

Indirect surface access requires `sm_20` or higher.

Cache operations require `sm_20` or higher.

Examples

suld.b.1d.v4.b32.trap  {s1,s2,s3,s4}, [surf_B, {x}];
    suld.b.3d.v2.b64.trap  {r1,r2}, [surf_A, {x,y,z,w}];
    suld.b.a1d.v2.b32      {r0,r1}, [surf_C, {idx,x}];
    suld.b.a2d.b32         r0, [surf_D, {idx,x,y,z}];  // z ignored