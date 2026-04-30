---
name: ptx-txq
description: Query texture and sampler attributes.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.10.5. Texture Instructions:txq

---
title: "9.7.10.5. Texture Instructions:txq"
section: 9.7.10.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.10.5. Texture Instructions:txq


`txq`

Query texture and sampler attributes.

Syntax

txq.tquery.b32         d, [a];       // texture attributes
    txq.level.tlquery.b32  d, [a], lod;  // texture attributes
    txq.squery.b32         d, [a];       // sampler attributes
    
    .tquery  = { .width, .height, .depth,
                 .channel_data_type, .channel_order,
                 .normalized_coords, .array_size,
                 .num_mipmap_levels, .num_samples};
    
    .tlquery = { .width, .height, .depth };
    
    .squery  = { .force_unnormalized_coords, .filter_mode,
                 .addr_mode_0, addr_mode_1, addr_mode_2 };

Description

Query an attribute of a texture or sampler. Operand `a` is either a `.texref` or `.samplerref` variable, or a `.u64` register.

Query | Returns  
---|---  
`.width` `.height` `.depth` | value in elements  
`.channel_data_type` | Unsigned integer corresponding to source language’s channel data type enumeration. If the source language combines channel data type and channel order into a single enumeration type, that value is returned for both `channel_data_type` and channel_order queries.  
`.channel_order` | Unsigned integer corresponding to source language’s channel order enumeration. If the source language combines channel data type and channel order into a single enumeration type, that value is returned for both `channel_data_type` and `channel_order` queries.  
`.normalized_coords` | `1` (`True`) or `0` (`False`).  
`.force_unnormalized_coords` | `1` (`True)` or `0` (`False).` Defined only for `.samplerref` variables in independent texture mode. Overrides the `normalized_coords` field of a `.texref` variable used with a `.samplerref` in a `tex` instruction.  
`.filter_mode` | Integer from `enum { nearest, linear }`  
`.addr_mode_0` `.addr_mode_1` `.addr_mode_2` | Integer from `enum { wrap, mirror, clamp_ogl, clamp_to_edge, clamp_to_border }`  
`.array_size` | For a texture array, number of textures in array, 0 otherwise.  
`.num_mipmap_levels` | For a mipmapped texture, number of levels of details (LOD), 0 otherwise.  
`.num_samples` | For a multi-sample texture, number of samples, 0 otherwise.

Texture attributes are queried by supplying a `.texref` argument to `txq`. In unified mode, sampler attributes are also accessed via a `.texref` argument, and in independent mode sampler attributes are accessed via a separate `.samplerref` argument.

`txq.level`

`txq.level` requires an additional 32bit integer argument, `lod`, which specifies LOD and queries requested attribute for the specified LOD.

Indirect texture access

Beginning with PTX ISA version 3.1, indirect texture access is supported in unified mode for target architecture `sm_20` or higher. In indirect access, operand `a` is a `.u64` register holding the address of a `.texref` variable.

PTX ISA Notes

Introduced in PTX ISA version 1.5.

Channel data type and channel order queries were added in PTX ISA version 2.1.

The `.force_unnormalized_coords` query was added in PTX ISA version 2.2.

Indirect texture access introduced in PTX ISA version 3.1.

`.array_size`, `.num_mipmap_levels`, `.num_samples` samples queries were added in PTX ISA version 4.1.

`txq.level` introduced in PTX ISA version 4.3.

Target ISA Notes

Supported on all target architectures.

Indirect texture access requires `sm_20` or higher.

Querying the number of mipmap levels requires `sm_20` or higher.

Querying the number of samples requires `sm_30` or higher.

`txq.level` requires `sm_30` or higher.

Examples

txq.width.b32       %r1, [tex_A];
    txq.filter_mode.b32 %r1, [tex_A];   // unified mode
    txq.addr_mode_0.b32 %r1, [smpl_B];  // independent mode
    txq.level.width.b32 %r1, [tex_A], %r_lod;