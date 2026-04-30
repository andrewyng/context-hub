---
name: ptx-sampler-properties
description: The `normalized_coords` field indicates whether the texture or surface
  uses normalized coordinates in the range [0.0, 1.0) instead of unnormalized coordinates
  in the range [0, N). If no value is speci...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.3.2. Sampler Properties

---
title: "5.3.2. Sampler Properties"
section: 5.3.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.3.2. Sampler Properties


The `normalized_coords` field indicates whether the texture or surface uses normalized coordinates in the range [0.0, 1.0) instead of unnormalized coordinates in the range [0, N). If no value is specified, the default is set by the runtime system based on the source language.

The `filter_mode` field specifies how the values returned by texture reads are computed based on the input texture coordinates.

The `addr_mode_{0,1,2}` fields define the addressing mode in each dimension, which determine how out-of-range coordinates are handled.

See the _CUDA C++ Programming Guide_ for more details of these properties.

Table 11 Opaque Type Fields in Independent Texture Mode Member | .samplerref values | .texref values | .surfref values  
---|---|---|---  
`width` | N/A | in elements  
`height` | N/A | in elements  
`depth` | N/A | in elements  
`channel_data_type` | N/A | `enum` type corresponding to source language API  
`channel_order` | N/A | `enum` type corresponding to source language AP  
`normalized_coords` | N/A | `0`, `1` | N/A  
`force_unnormalized_coords` | `0`, `1` | N/A | N/A  
`filter_mode` | `nearest`, `linear` | ignored | N/A  
`addr_mode_0`, `addr_mode_1`, `addr_mode_2` | `wrap`, `mirror`, `clamp_ogl`, `clamp_to_edge`, `clamp_to_border` | N/A | N/A  
`array_size` | N/A | as number of textures in a texture array | as number of surfaces in a surface array  
`num_mipmap_levels` | N/A | as number of levels in a mipmapped texture | N/A  
`num_samples` | N/A | as number of samples in a multi-sample texture | N/A  
`memory_layout` | N/A | N/A | `1` for linear memory layout; `0` otherwise

In independent texture mode, the sampler properties are carried in an independent `.samplerref` variable, and these fields are disabled in the `.texref` variables. One additional sampler property, `force_unnormalized_coords`, is available in independent texture mode.

The `force_unnormalized_coords` field is a property of `.samplerref` variables that allows the sampler to override the texture header `normalized_coords` property. This field is defined only in independent texture mode. When `True`, the texture header setting is overridden and unnormalized coordinates are used; when `False`, the texture header setting is used.

The `force_unnormalized_coords` property is used in compiling OpenCL; in OpenCL, the property of normalized coordinates is carried in sampler headers. To compile OpenCL to PTX, texture headers are always initialized with `normalized_coords` set to True, and the OpenCL sampler-based `normalized_coords` flag maps (negated) to the PTX-level `force_unnormalized_coords` flag.

Variables using these types may be declared at module scope or within kernel entry parameter lists. At module scope, these variables must be in the `.global` state space. As kernel parameters, these variables are declared in the `.param` state space.

Example

.global .texref     my_texture_name;
    .global .samplerref my_sampler_name;
    .global .surfref    my_surface_name;

When declared at module scope, the types may be initialized using a list of static expressions assigning values to the named members.

Example

.global .texref tex1;
    .global .samplerref tsamp1 = { addr_mode_0 = clamp_to_border,
                                   filter_mode = nearest
                                 };