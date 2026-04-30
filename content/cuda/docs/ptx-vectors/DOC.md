---
name: ptx-vectors
description: Limited-length vector types are supported. Vectors of length 2 and 4
  of any non-predicate fundamental type can be declared by prefixing the type with
  `.v2` or `.v4`. Vectors must be based on a fundame...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.2. Vectors

---
title: "5.4.2. Vectors"
section: 5.4.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.2. Vectors


Limited-length vector types are supported. Vectors of length 2 and 4 of any non-predicate fundamental type can be declared by prefixing the type with `.v2` or `.v4`. Vectors must be based on a fundamental type, and they may reside in the register space. Vectors cannot exceed 128-bits in length; for example, `.v4 .f64` is not allowed. Three-element vectors may be handled by using a `.v4` vector, where the fourth element provides padding. This is a common case for three-dimensional grids, textures, etc.

Examples

.global .v4 .f32 V;   // a length-4 vector of floats
    .shared .v2 .u16 uv;  // a length-2 vector of unsigned ints
    .global .v4 .b8  v;   // a length-4 vector of bytes

By default, vector variables are aligned to a multiple of their overall size (vector length times base-type size), to enable vector load and store instructions which require addresses aligned to a multiple of the access size.