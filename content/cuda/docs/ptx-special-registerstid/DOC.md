---
name: ptx-special-registerstid
description: Thread identifier within a CTA.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.1. Special Registers:%tid

---
title: "10.1. Special Registers:%tid"
section: 10.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.1. Special Registers:%tid


`%tid`

Thread identifier within a CTA.

Syntax (predefined)

.sreg .v4 .u32 %tid;                  // thread id vector
    .sreg .u32 %tid.x, %tid.y, %tid.z;    // thread id components

Description

A predefined, read-only, per-thread special register initialized with the thread identifier within the CTA. The `%tid` special register contains a 1D, 2D, or 3D vector to match the CTA shape; the `%tid` value in unused dimensions is `0`. The fourth element is unused and always returns zero. The number of threads in each dimension are specified by the predefined special register `%ntid`.

Every thread in the CTA has a unique `%tid`.

`%tid` component values range from `0` through `%ntid-1` in each CTA dimension.

`%tid.y == %tid.z == 0` in 1D CTAs. `%tid.z == 0` in 2D CTAs.

It is guaranteed that:

0  <=  %tid.x <  %ntid.x
    0  <=  %tid.y <  %ntid.y
    0  <=  %tid.z <  %ntid.z

PTX ISA Notes

Introduced in PTX ISA version 1.0 with type `.v4.u16`.

Redefined as type `.v4.u32` in PTX ISA version 2.0. For compatibility with legacy PTX code, 16-bit `mov` and `cvt` instructions may be used to read the lower 16-bits of each component of `%tid`.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u32      %r1,%tid.x;  // move tid.x to %rh
    
    // legacy code accessing 16-bit components of %tid
    mov.u16      %rh,%tid.x;
    cvt.u32.u16  %r2,%tid.z;  // zero-extend tid.z to %r2