---
name: ptx-texture-state-space-deprecated
description: The texture (`.tex`) state space is global memory accessed via the texture
  instruction. It is shared by all threads in a context. Texture memory is read-only
  and cached, so accesses to texture memory ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.8. Texture State Space (deprecated)

---
title: "5.1.8. Texture State Space (deprecated)"
section: 5.1.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.1.8. Texture State Space (deprecated)


The texture (`.tex`) state space is global memory accessed via the texture instruction. It is shared by all threads in a context. Texture memory is read-only and cached, so accesses to texture memory are not coherent with global memory stores to the texture image.

The GPU hardware has a fixed number of texture bindings that can be accessed within a single kernel (typically 128). The .tex directive will bind the named texture memory variable to a hardware texture identifier, where texture identifiers are allocated sequentially beginning with zero. Multiple names may be bound to the same physical texture identifier. An error is generated if the maximum number of physical resources is exceeded. The texture name must be of type `.u32` or `.u64`.

Physical texture resources are allocated on a per-kernel granularity, and `.tex` variables are required to be defined in the global scope.

Texture memory is read-only. A texture’s base address is assumed to be aligned to a 16 byte boundary.

Example

.tex .u32 tex_a;         // bound to physical texture 0
    .tex .u32 tex_c, tex_d;  // both bound to physical texture 1
    .tex .u32 tex_d;         // bound to physical texture 2
    .tex .u32 tex_f;         // bound to physical texture 3

Note

Explicit declarations of variables in the texture state space is deprecated, and programs should instead reference texture memory through variables of type `.texref`. The `.tex` directive is retained for backward compatibility, and variables declared in the `.tex` state space are equivalent to module-scoped `.texref` variables in the `.global` state space.

For example, a legacy PTX definitions such as

.tex .u32 tex_a;

is equivalent to:

.global .texref tex_a;

See [Texture Sampler and Surface Types](<#texture-sampler-and-surface-types>) for the description of the `.texref` type and [Texture Instructions](<#texture-instructions>) for its use in texture instructions.