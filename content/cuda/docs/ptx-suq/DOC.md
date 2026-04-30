---
name: ptx-suq
description: Query a surface attribute.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.11.4. Surface Instructions:suq

---
title: "9.7.11.4. Surface Instructions:suq"
section: 9.7.11.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.11.4. Surface Instructions:suq


`suq`

Query a surface attribute.

Syntax

suq.query.b32   d, [a];
    
    .query = { .width, .height, .depth,
               .channel_data_type, .channel_order,
               .array_size, .memory_layout };

Description

Query an attribute of a surface. Operand `a` is a `.surfref` variable or a `.u64` register.

Query | Returns  
---|---  
`.width` `.height` `.depth` | value in elements  
`.channel_data_type` | Unsigned integer corresponding to source language’s channel data type enumeration. If the source language combines channel data type and channel order into a single enumeration type, that value is returned for both `channel_data_type` and `channel_order` queries.  
`.channel_order` | Unsigned integer corresponding to source language’s channel order enumeration. If the source language combines channel data type and channel order into a single enumeration type, that value is returned for both `channel_data_type` and `channel_order` queries.  
`.array_size` | For a surface array, number of surfaces in array, 0 otherwise.  
`.memory_layout` | `1` for surface with linear memory layout; `0` otherwise

Indirect surface access

Beginning with PTX ISA version 3.1, indirect surface access is supported for target architecture `sm_20` or higher. In indirect access, operand `a` is a `.u64` register holding the address of a `.surfref` variable.

PTX ISA Notes

Introduced in PTX ISA version 1.5.

Channel data type and channel order queries added in PTX ISA version 2.1.

Indirect surface access introduced in PTX ISA version 3.1.

The `.array_size` query was added in PTX ISA version 4.1.

The `.memory_layout` query was added in PTX ISA version 4.2.

Target ISA Notes

Supported on all target architectures.

Indirect surface access requires `sm_20` or higher.

Examples

suq.width.b32       %r1, [surf_A];