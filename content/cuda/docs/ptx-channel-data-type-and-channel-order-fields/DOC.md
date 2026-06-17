---
name: ptx-channel-data-type-and-channel-order-fields
description: The `channel_data_type` and `channel_order` fields have enumeration types
  corresponding to the source language API. Currently, OpenCL is the only source language
  that defines these fields. [Table 13](...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.3.3. Channel Data Type and Channel Order Fields

---
title: "5.3.3. Channel Data Type and Channel Order Fields"
section: 5.3.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.3.3. Channel Data Type and Channel Order Fields


The `channel_data_type` and `channel_order` fields have enumeration types corresponding to the source language API. Currently, OpenCL is the only source language that defines these fields. [Table 13](<#channel-data-type-and-channel-order-fields-opencl-channel-order-definition>) and [Table 12](<#channel-data-type-and-channel-order-fields-opencl-channel-data-type-definition>) show the enumeration values defined in OpenCL version 1.0 for channel data type and channel order.

Table 12 OpenCL 1.0 Channel Data Type Definition `CL_SNORM_INT8` | `0x10D0`  
---|---  
`CL_SNORM_INT16` | `0x10D1`  
`CL_UNORM_INT8` | `0x10D2`  
`CL_UNORM_INT16` | `0x10D3`  
`CL_UNORM_SHORT_565` | `0x10D4`  
`CL_UNORM_SHORT_555` | `0x10D5`  
`CL_UNORM_INT_101010` | `0x10D6`  
`CL_SIGNED_INT8` | `0x10D7`  
`CL_SIGNED_INT16` | `0x10D8`  
`CL_SIGNED_INT32` | `0x10D9`  
`CL_UNSIGNED_INT8` | `0x10DA`  
`CL_UNSIGNED_INT16` | `0x10DB`  
`CL_UNSIGNED_INT32` | `0x10DC`  
`CL_HALF_FLOAT` | `0x10DD`  
`CL_FLOAT` | `0x10DE`

Table 13 OpenCL 1.0 Channel Order Definition `CL_R` | `0x10B0`  
---|---  
`CL_A` | `0x10B1`  
`CL_RG` | `0x10B2`  
`CL_RA` | `0x10B3`  
`CL_RGB` | `0x10B4`  
`CL_RGBA` | `0x10B5`  
`CL_BGRA` | `0x10B6`  
`CL_ARGB` | `0x10B7`  
`CL_INTENSITY` | `0x10B8`  
`CL_LUMINANCE` | `0x10B9`