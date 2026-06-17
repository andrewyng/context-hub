---
name: ptx-tld4
description: Perform a texture fetch of the 4-texel bilerp footprint.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.10.4. Texture Instructions:tld4

---
title: "9.7.10.4. Texture Instructions:tld4"
section: 9.7.10.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.10.4. Texture Instructions:tld4


`tld4`

Perform a texture fetch of the 4-texel bilerp footprint.

Syntax

tld4.comp.2d.v4.dtype.f32    d[|p], [a, c] {, e} {, f};
    tld4.comp.geom.v4.dtype.f32  d[|p], [a, b, c] {, e} {, f};  // explicit sampler
    
    .comp  = { .r, .g, .b, .a };
    .geom  = { .2d, .a2d, .cube, .acube };
    .dtype = { .u32, .s32, .f32 };

Description

Texture fetch of the 4-texel bilerp footprint using a texture coordinate vector. The instruction loads the bilerp footprint from the texture named by operand `a` at coordinates given by operand `c` into vector destination `d`. The texture component fetched for each texel sample is specified by `.comp`. The four texel samples are placed into destination vector `d` in counter-clockwise order starting at lower left.

An optional texture sampler `b` may be specified. If no sampler is specified, the sampler behavior is a property of the named texture.

The optional destination predicate `p` is set to `True` if data from texture at specified coordinates is resident in memory, `False` otherwise. When optional destination predicate `p` is set to `False`, data loaded will be all zeros. Memory residency of Texture Data at specified coordinates is dependent on execution environment setup using Driver API calls, prior to kernel launch. Refer to Driver API documentation for more details including any system/implementation specific behavior.

An optional operand `f` may be specified for _depth textures_. Depth textures are special type of textures which hold data from the depth buffer. Depth buffer contains depth information of each pixel. Operand `f` is `.f32` scalar value that specifies depth compare value for depth textures. Each element fetched from texture is compared against value given in `f` operand. If comparison passes, result is 1.0; otherwise result is 0.0. These per-element comparison results are used for the filtering.

A texture base address is assumed to be aligned to a 16 byte boundary, and the address given by the coordinate vector must be naturally aligned to a multiple of the access size. If an address is not properly aligned, the resulting behavior is undefined; i.e., the access may proceed by silently masking off low-order address bits to achieve proper rounding, or the instruction may fault.

`tld4.2d`

For 2D textures, operand `c` specifies coordinates as a two-element, 32-bit floating-point vector.

An optional operand `e` may be specified. Operand `e` is a vector of type `.v2.s32` that specifies coordinate offset. Offset is applied to coordinates before doing texture fetch. Offset value is in the range of -8 to +7.

`tld4.a2d`

Texture array selection, followed by `tld4` texture fetch of 2d texture. For 2d texture arrays operand `c` is a four element, 32-bit vector. The first element in operand c is interpreted as an unsigned integer index (`.u32`) into the texture array, and the next two elements are interpreted as 32-bit floating point coordinates of 2d texture. The fourth element is ignored.

An optional operand `e` may be specified. Operand `e` is a vector of type `.v2.s32` that specifies coordinate offset. Offset is applied to coordinates before doing texture fetch. Offset value is in the range of -8 to +7.

`tld4.cube`

For cubemap textures, operand `c` specifies four-element vector which comprises three floating-point coordinates (s, t, r) and a fourth padding argument which is ignored.

Cubemap textures are special two-dimensional layered textures consisting of six layers that represent the faces of a cube. All layers in a cubemap are of the same size and are square (i.e., width equals height).

Coordinates (s, t, r) are projected onto one of the six cube faces. The (s, t, r) coordinates can be thought of as a direction vector emanating from the center of the cube. Of the three coordinates (s, t, r), the coordinate of the largest magnitude (the major axis) selects the cube face. Then, the other two coordinates (the minor axes) are divided by the absolute value of the major axis to produce a new (s, t) coordinate pair to lookup into the selected cube face.

Offset vector operand `e` is not supported for cubemap textures.

`tld4.acube`

Cubemap array selection, followed by `tld4` texture fetch of cubemap texture. The first element in operand `c` is interpreted as an unsigned integer index (`.u32`) into the cubemap texture array, and the remaining three elements are interpreted as floating-point cubemap coordinates (s, t, r), used to lookup in the selected cubemap.

Offset vector operand `e` is not supported for cubemap texture arrays.

Indirect texture access

Beginning with PTX ISA version 3.1, indirect texture access is supported in unified mode for target architecture `sm_20` or higher. In indirect access, operand `a` is a `.u64` register holding the address of a `.texref` variable.

PTX ISA Notes

Introduced in PTX ISA version 2.2.

Indirect texture access introduced in PTX ISA version 3.1.

`tld4.{a2d,cube,acube}` introduced in PTX ISA version 4.3.

Offset vector operand introduced in PTX ISA version 4.3.

Depth compare operand introduced in PTX ISA version 4.3.

Support for optional destination predicate introduced in PTX ISA version 7.1.

Target ISA Notes

`tld4` requires `sm_20` or higher.

Indirect texture access requires `sm_20` or higher.

`tld4.{a2d,cube,acube}` requires `sm_30` or higher.

Offset vector operand requires `sm_30` or higher.

Depth compare operand requires `sm_30` or higher.

Support for optional destination predicate requires `sm_60` or higher.

Examples

//Example of unified mode texturing
    tld4.r.2d.v4.s32.f32  {r1,r2,r3,r4}, [tex_a,{f1,f2}];
    
    // Example of independent mode texturing
    tld4.r.2d.v4.u32.f32  {u1,u2,u3,u4}, [tex_a,smpl_x,{f1,f2}];
    
    // Example of unified mode texturing using offset
    tld4.r.2d.v4.s32.f32  {r1,r2,r3,r4}, [tex_a,{f1,f2}], {r5, r6};
    
    // Example of unified mode texturing using compare
    tld4.r.2d.v4.f32.f32  {f1,f2,f3,f4}, [tex_a,{f5,f6}], f7;
    
    // Example of optional destination predicate
    tld4.r.2d.v4.f32.f32 {f1,f2,f3,f4}|p, [tex_a,{f5,f6}], f7;