---
name: driver-tensor--memory
description: '**Source:** group__CUDA__TENSOR__MEMORY.html#group__CUDA__TENSOR__MEMORY'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.30. Tensor Map Object Managment

**Source:** group__CUDA__TENSOR__MEMORY.html#group__CUDA__TENSOR__MEMORY


### Functions

CUresult cuTensorMapEncodeIm2col ( CUtensorMap* tensorMap, CUtensorMapDataType tensorDataType, cuuint32_t tensorRank, void* globalAddress, const cuuint64_t* globalDim, const cuuint64_t* globalStrides, const int* pixelBoxLowerCorner, const int* pixelBoxUpperCorner, cuuint32_t channelsPerPixel, cuuint32_t pixelsPerColumn, const cuuint32_t* elementStrides, CUtensorMapInterleave interleave, CUtensorMapSwizzle swizzle, CUtensorMapL2promotion l2Promotion, CUtensorMapFloatOOBfill oobFill )


Create a tensor map descriptor object representing im2col memory region.

######  Parameters

`tensorMap`
    \- Tensor map object to create
`tensorDataType`
    \- Tensor data type
`tensorRank`
    \- Dimensionality of tensor; must be at least 3
`globalAddress`
    \- Starting address of memory region described by tensor
`globalDim`
    \- Array containing tensor size (number of elements) along each of the `tensorRank` dimensions
`globalStrides`
    \- Array containing stride size (in bytes) along each of the `tensorRank` \- 1 dimensions
`pixelBoxLowerCorner`
    \- Array containing DHW dimensions of lower box corner
`pixelBoxUpperCorner`
    \- Array containing DHW dimensions of upper box corner
`channelsPerPixel`
    \- Number of channels per pixel
`pixelsPerColumn`
    \- Number of pixels per column
`elementStrides`
    \- Array containing traversal stride in each of the `tensorRank` dimensions
`interleave`
    \- Type of interleaved layout the tensor addresses
`swizzle`
    \- Bank swizzling pattern inside shared memory
`l2Promotion`
    \- L2 promotion size
`oobFill`
    \- Indicate whether zero or special NaN constant will be used to fill out-of-bound elements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a descriptor for Tensor Memory Access (TMA) object specified by the parameters describing a im2col memory layout and returns it in `tensorMap`.

Tensor map objects are only supported on devices of compute capability 9.0 or higher. Additionally, a tensor map object is an opaque value, and, as such, should only be accessed through CUDA APIs and PTX.

The parameters passed are bound to the following requirements:

  * `tensorMap` address must be aligned to 64 bytes.


  * `tensorDataType` has to be an enum from CUtensorMapDataType which is defined as:

        ‎    typedef enum CUtensorMapDataType_enum {
                      CU_TENSOR_MAP_DATA_TYPE_UINT8 = 0,       // 1 byte
                      CU_TENSOR_MAP_DATA_TYPE_UINT16,          // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_UINT32,          // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_INT32,           // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_UINT64,          // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_INT64,           // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT16,         // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT32,         // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT64,         // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_BFLOAT16,        // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT32_FTZ,     // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_TFLOAT32,        // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_TFLOAT32_FTZ     // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B,    // 4 bits
                      CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B,   // 4 bits
                      CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B    // 6 bits
                  } CUtensorMapDataType;

CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B copies '16 x U4' packed values to memory aligned as 8 bytes. There are no gaps between packed values. CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B copies '16 x U4' packed values to memory aligned as 16 bytes. There are 8 byte gaps between every 8 byte chunk of packed values. CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B copies '16 x U6' packed values to memory aligned as 16 bytes. There are 4 byte gaps between every 12 byte chunk of packed values.


  * `tensorRank`, which specifies the number of tensor dimensions, must be 3, 4, or 5.


  * `globalAddress`, which specifies the starting address of the memory region described, must be 16 byte aligned. The following requirements need to also be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, `globalAddress` must be 32 byte aligned.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, `globalAddress` must be 32 byte aligned.


  * `globalDim` array, which specifies tensor size of each of the `tensorRank` dimensions, must be non-zero and less than or equal to 2^32. Additionally, the following requirements need to be met for the packed data types:
    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, globalDim[0] must be a multiple of 128.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B, `globalDim`[0] must be a multiple of 2.

    * Dimension for the packed data types must reflect the number of individual U# values.


  * `globalStrides` array, which specifies tensor stride of each of the lower `tensorRank` \- 1 dimensions in bytes, must be a multiple of 16 and less than 2^40. Additionally, the following requirements need to be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, the strides must be a multiple of 32.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, the strides must be a multiple of 32. Each following dimension specified includes previous dimension stride:

          ‎    globalStrides[0] = globalDim[0] * elementSizeInBytes(tensorDataType) + padding[0];
                    for (i = 1; i < tensorRank - 1; i++)
                        globalStrides[i] = globalStrides[i – 1] * (globalDim[i] + padding[i]);
                        assert(globalStrides[i] >= globalDim[i]);


  * `pixelBoxLowerCorner` array specifies the coordinate offsets {D, H, W} of the bounding box from top/left/front corner. The number of offsets and their precision depend on the tensor dimensionality:
    * When `tensorRank` is 3, one signed offset within range [-32768, 32767] is supported.

    * When `tensorRank` is 4, two signed offsets each within range [-128, 127] are supported.

    * When `tensorRank` is 5, three offsets each within range [-16, 15] are supported.


  * `pixelBoxUpperCorner` array specifies the coordinate offsets {D, H, W} of the bounding box from bottom/right/back corner. The number of offsets and their precision depend on the tensor dimensionality:
    * When `tensorRank` is 3, one signed offset within range [-32768, 32767] is supported.

    * When `tensorRank` is 4, two signed offsets each within range [-128, 127] are supported.

    * When `tensorRank` is 5, three offsets each within range [-16, 15] are supported. The bounding box specified by `pixelBoxLowerCorner` and `pixelBoxUpperCorner` must have non-zero area.


  * `channelsPerPixel`, which specifies the number of elements which must be accessed along C dimension, must be less than or equal to 256. Additionally, when `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, `channelsPerPixel` must be 128.


  * `pixelsPerColumn`, which specifies the number of elements that must be accessed along the {N, D, H, W} dimensions, must be less than or equal to 1024.


  * `elementStrides` array, which specifies the iteration step along each of the `tensorRank` dimensions, must be non-zero and less than or equal to 8. Note that when `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE, the first element of this array is ignored since TMA doesn’t support the stride for dimension zero. When all elements of the `elementStrides` array are one, `boxDim` specifies the number of elements to load. However, if `elementStrides`[i] is not equal to one for some `i`, then TMA loads ceil( `boxDim`[i] / `elementStrides`[i]) number of elements along i-th dimension. To load N elements along i-th dimension, `boxDim`[i] must be set to N * `elementStrides`[i].


  * `interleave` specifies the interleaved layout of type CUtensorMapInterleave, which is defined as:

        ‎    typedef enum CUtensorMapInterleave_enum {
                      CU_TENSOR_MAP_INTERLEAVE_NONE = 0
                      CU_TENSOR_MAP_INTERLEAVE_16B
                      CU_TENSOR_MAP_INTERLEAVE_32B
                  } CUtensorMapInterleave;

TMA supports interleaved layouts like NC/8HWC8 where C8 utilizes 16 bytes in memory assuming 2 byte per channel or NC/16HWC16 where C16 uses 32 bytes. When `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE and `swizzle` is not CU_TENSOR_MAP_SWIZZLE_NONE, the bounding box inner dimension (computed as `channelsPerPixel` multiplied by element size in bytes derived from `tensorDataType`) must be less than or equal to the swizzle size.
    * CU_TENSOR_MAP_SWIZZLE_32B requires the bounding box inner dimension to be <= 32.

    * CU_TENSOR_MAP_SWIZZLE_64B requires the bounding box inner dimension to be <= 64.

    * CU_TENSOR_MAP_SWIZZLE_128B* require the bounding box inner dimension to be <= 128. Additionally, `tensorDataType` of CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B requires `interleave` to be CU_TENSOR_MAP_INTERLEAVE_NONE.


  * `swizzle`, which specifies the shared memory bank swizzling pattern, has to be of type CUtensorMapSwizzle which is defined as:

        ‎    typedef enum CUtensorMapSwizzle_enum {
                      CU_TENSOR_MAP_SWIZZLE_NONE = 0
                      CU_TENSOR_MAP_SWIZZLE_32B,                   // Swizzle 16B chunks within 32B  span
                      CU_TENSOR_MAP_SWIZZLE_64B,                   // Swizzle 16B chunks within 64B  span
                      CU_TENSOR_MAP_SWIZZLE_128B,                  // Swizzle 16B chunks within 128B span
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B,         // Swizzle 32B chunks within 128B span
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B_FLIP_8B, // Swizzle 32B chunks within 128B span, additionally swap lower 8B with upper 8B within each 16B for every alternate row
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_64B          // Swizzle 64B chunks within 128B span
                  } CUtensorMapSwizzle;

Data are organized in a specific order in global memory; however, this may not match the order in which the application accesses data in shared memory. This difference in data organization may cause bank conflicts when shared memory is accessed. In order to avoid this problem, data can be loaded to shared memory with shuffling across shared memory banks. When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, `swizzle` must be CU_TENSOR_MAP_SWIZZLE_32B. Other interleave modes can have any swizzling pattern. When the `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B, only the following swizzle modes are supported:
    * CU_TENSOR_MAP_SWIZZLE_NONE (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_64B (Store only) When the `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, only the following swizzle modes are supported:

    * CU_TENSOR_MAP_SWIZZLE_NONE (Load only)

    * CU_TENSOR_MAP_SWIZZLE_128B (Load only)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B (Load only)


  * `l2Promotion` specifies L2 fetch size which indicates the byte granularity at which L2 requests are filled from DRAM. It must be of type CUtensorMapL2promotion, which is defined as:

        ‎    typedef enum CUtensorMapL2promotion_enum {
                      CU_TENSOR_MAP_L2_PROMOTION_NONE = 0
                      CU_TENSOR_MAP_L2_PROMOTION_L2_64B
                      CU_TENSOR_MAP_L2_PROMOTION_L2_128B
                      CU_TENSOR_MAP_L2_PROMOTION_L2_256B
                  } CUtensorMapL2promotion;


  * `oobFill`, which indicates whether zero or a special NaN constant should be used to fill out-of-bound elements, must be of type CUtensorMapFloatOOBfill which is defined as:

        ‎    typedef enum CUtensorMapFloatOOBfill_enum {
                      CU_TENSOR_MAP_FLOAT_OOB_FILL_NONE = 0
                      CU_TENSOR_MAP_FLOAT_OOB_FILL_NAN_REQUEST_ZERO_FMA
                  } CUtensorMapFloatOOBfill;

Note that CU_TENSOR_MAP_FLOAT_OOB_FILL_NAN_REQUEST_ZERO_FMA can only be used when `tensorDataType` represents a floating-point data type, and when `tensorDataType` is not CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B, CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, and CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B.


CUresult cuTensorMapEncodeIm2colWide ( CUtensorMap* tensorMap, CUtensorMapDataType tensorDataType, cuuint32_t tensorRank, void* globalAddress, const cuuint64_t* globalDim, const cuuint64_t* globalStrides, int  pixelBoxLowerCornerWidth, int  pixelBoxUpperCornerWidth, cuuint32_t channelsPerPixel, cuuint32_t pixelsPerColumn, const cuuint32_t* elementStrides, CUtensorMapInterleave interleave, CUtensorMapIm2ColWideMode mode, CUtensorMapSwizzle swizzle, CUtensorMapL2promotion l2Promotion, CUtensorMapFloatOOBfill oobFill )


Create a tensor map descriptor object representing im2col memory region, but where the elements are exclusively loaded along the W dimension.

######  Parameters

`tensorMap`
    \- Tensor map object to create
`tensorDataType`
    \- Tensor data type
`tensorRank`
    \- Dimensionality of tensor; must be at least 3
`globalAddress`
    \- Starting address of memory region described by tensor
`globalDim`
    \- Array containing tensor size (number of elements) along each of the `tensorRank` dimensions
`globalStrides`
    \- Array containing stride size (in bytes) along each of the `tensorRank` \- 1 dimensions
`pixelBoxLowerCornerWidth`
    \- Width offset of left box corner
`pixelBoxUpperCornerWidth`
    \- Width offset of right box corner
`channelsPerPixel`
    \- Number of channels per pixel
`pixelsPerColumn`
    \- Number of pixels per column
`elementStrides`
    \- Array containing traversal stride in each of the `tensorRank` dimensions
`interleave`
    \- Type of interleaved layout the tensor addresses
`mode`
    \- W or W128 mode
`swizzle`
    \- Bank swizzling pattern inside shared memory
`l2Promotion`
    \- L2 promotion size
`oobFill`
    \- Indicate whether zero or special NaN constant will be used to fill out-of-bound elements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a descriptor for Tensor Memory Access (TMA) object specified by the parameters describing a im2col memory layout and where the row is always loaded along the W dimensuin and returns it in `tensorMap`. This assumes the tensor layout in memory is either NDHWC, NHWC, or NWC.

This API is only supported on devices of compute capability 10.0 or higher. Additionally, a tensor map object is an opaque value, and, as such, should only be accessed through CUDA APIs and PTX.

The parameters passed are bound to the following requirements:

  * `tensorMap` address must be aligned to 64 bytes.


  * `tensorDataType` has to be an enum from CUtensorMapDataType which is defined as:

        ‎    typedef enum CUtensorMapDataType_enum {
                      CU_TENSOR_MAP_DATA_TYPE_UINT8 = 0,       // 1 byte
                      CU_TENSOR_MAP_DATA_TYPE_UINT16,          // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_UINT32,          // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_INT32,           // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_UINT64,          // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_INT64,           // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT16,         // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT32,         // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT64,         // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_BFLOAT16,        // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT32_FTZ,     // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_TFLOAT32,        // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_TFLOAT32_FTZ     // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B,    // 4 bits
                      CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B,   // 4 bits
                      CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B    // 6 bits
                  } CUtensorMapDataType;

CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B copies '16 x U4' packed values to memory aligned as 8 bytes. There are no gaps between packed values. CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B copies '16 x U4' packed values to memory aligned as 16 bytes. There are 8 byte gaps between every 8 byte chunk of packed values. CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B copies '16 x U6' packed values to memory aligned as 16 bytes. There are 4 byte gaps between every 12 byte chunk of packed values.


  * `tensorRank`, which specifies the number of tensor dimensions, must be 3, 4, or 5.


  * `globalAddress`, which specifies the starting address of the memory region described, must be 16 byte aligned. The following requirements need to also be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, `globalAddress` must be 32 byte aligned.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, `globalAddress` must be 32 byte aligned.


  * `globalDim` array, which specifies tensor size of each of the `tensorRank` dimensions, must be non-zero and less than or equal to 2^32. Additionally, the following requirements need to be met for the packed data types:
    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, globalDim[0] must be a multiple of 128.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B, `globalDim`[0] must be a multiple of 2.

    * Dimension for the packed data types must reflect the number of individual U# values.


  * `globalStrides` array, which specifies tensor stride of each of the lower `tensorRank` \- 1 dimensions in bytes, must be a multiple of 16 and less than 2^40. Additionally, the following requirements need to be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, the strides must be a multiple of 32.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, the strides must be a multiple of 32. Each following dimension specified includes previous dimension stride:

          ‎    globalStrides[0] = globalDim[0] * elementSizeInBytes(tensorDataType) + padding[0];
                    for (i = 1; i < tensorRank - 1; i++)
                        globalStrides[i] = globalStrides[i – 1] * (globalDim[i] + padding[i]);
                        assert(globalStrides[i] >= globalDim[i]);


  * `pixelBoxLowerCornerWidth` specifies the coordinate offset W of the bounding box from left corner. The offset must be within range [-32768, 32767].


  * `pixelBoxUpperCornerWidth` specifies the coordinate offset W of the bounding box from right corner. The offset must be within range [-32768, 32767].


The bounding box specified by `pixelBoxLowerCornerWidth` and `pixelBoxUpperCornerWidth` must have non-zero area. Note that the size of the box along D and H dimensions is always equal to one.

  * `channelsPerPixel`, which specifies the number of elements which must be accessed along C dimension, must be less than or equal to 256. Additionally, when `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, `channelsPerPixel` must be 128.


  * `pixelsPerColumn`, which specifies the number of elements that must be accessed along the W dimension, must be less than or equal to 1024. This field is ignored when `mode` is CU_TENSOR_MAP_IM2COL_WIDE_MODE_W128.


  * `elementStrides` array, which specifies the iteration step along each of the `tensorRank` dimensions, must be non-zero and less than or equal to 8. Note that when `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE, the first element of this array is ignored since TMA doesn’t support the stride for dimension zero. When all elements of the `elementStrides` array are one, `boxDim` specifies the number of elements to load. However, if `elementStrides`[i] is not equal to one for some `i`, then TMA loads ceil( `boxDim`[i] / `elementStrides`[i]) number of elements along i-th dimension. To load N elements along i-th dimension, `boxDim`[i] must be set to N * `elementStrides`[i].


  * `interleave` specifies the interleaved layout of type CUtensorMapInterleave, which is defined as:

        ‎    typedef enum CUtensorMapInterleave_enum {
                      CU_TENSOR_MAP_INTERLEAVE_NONE = 0
                      CU_TENSOR_MAP_INTERLEAVE_16B
                      CU_TENSOR_MAP_INTERLEAVE_32B
                  } CUtensorMapInterleave;

TMA supports interleaved layouts like NC/8HWC8 where C8 utilizes 16 bytes in memory assuming 2 byte per channel or NC/16HWC16 where C16 uses 32 bytes. When `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE, the bounding box inner dimension (computed as `channelsPerPixel` multiplied by element size in bytes derived from `tensorDataType`) must be less than or equal to the swizzle size.
    * CU_TENSOR_MAP_SWIZZLE_64B requires the bounding box inner dimension to be <= 64.

    * CU_TENSOR_MAP_SWIZZLE_128B* require the bounding box inner dimension to be <= 128. Additionally, `tensorDataType` of CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B requires `interleave` to be CU_TENSOR_MAP_INTERLEAVE_NONE.


  * `mode`, which describes loading of elements loaded along the W dimension, has to be one of the following CUtensorMapIm2ColWideMode types:

        ‎          CU_TENSOR_MAP_IM2COL_WIDE_MODE_W
                        CU_TENSOR_MAP_IM2COL_WIDE_MODE_W128

CU_TENSOR_MAP_IM2COL_WIDE_MODE_W allows the number of elements loaded along the W dimension to be specified via the `pixelsPerColumn` field.


  * `swizzle`, which specifies the shared memory bank swizzling pattern, must be one of the following CUtensorMapSwizzle modes (other swizzle modes are not supported):

        ‎    typedef enum CUtensorMapSwizzle_enum {
                      CU_TENSOR_MAP_SWIZZLE_64B,                   // Swizzle 16B chunks within 64B  span
                      CU_TENSOR_MAP_SWIZZLE_128B,                  // Swizzle 16B chunks within 128B span
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B,         // Swizzle 32B chunks within 128B span
                  } CUtensorMapSwizzle;

Data are organized in a specific order in global memory; however, this may not match the order in which the application accesses data in shared memory. This difference in data organization may cause bank conflicts when shared memory is accessed. In order to avoid this problem, data can be loaded to shared memory with shuffling across shared memory banks. When the `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B, only the following swizzle modes are supported:
    * CU_TENSOR_MAP_SWIZZLE_128B (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B (Load & Store) When the `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, only the following swizzle modes are supported:

    * CU_TENSOR_MAP_SWIZZLE_128B (Load only)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B (Load only)


  * `l2Promotion` specifies L2 fetch size which indicates the byte granularity at which L2 requests are filled from DRAM. It must be of type CUtensorMapL2promotion, which is defined as:

        ‎    typedef enum CUtensorMapL2promotion_enum {
                      CU_TENSOR_MAP_L2_PROMOTION_NONE = 0
                      CU_TENSOR_MAP_L2_PROMOTION_L2_64B
                      CU_TENSOR_MAP_L2_PROMOTION_L2_128B
                      CU_TENSOR_MAP_L2_PROMOTION_L2_256B
                  } CUtensorMapL2promotion;


  * `oobFill`, which indicates whether zero or a special NaN constant should be used to fill out-of-bound elements, must be of type CUtensorMapFloatOOBfill which is defined as:

        ‎    typedef enum CUtensorMapFloatOOBfill_enum {
                      CU_TENSOR_MAP_FLOAT_OOB_FILL_NONE = 0
                      CU_TENSOR_MAP_FLOAT_OOB_FILL_NAN_REQUEST_ZERO_FMA
                  } CUtensorMapFloatOOBfill;

Note that CU_TENSOR_MAP_FLOAT_OOB_FILL_NAN_REQUEST_ZERO_FMA can only be used when `tensorDataType` represents a floating-point data type, and when `tensorDataType` is not CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B, CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, and CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B.


CUresult cuTensorMapEncodeTiled ( CUtensorMap* tensorMap, CUtensorMapDataType tensorDataType, cuuint32_t tensorRank, void* globalAddress, const cuuint64_t* globalDim, const cuuint64_t* globalStrides, const cuuint32_t* boxDim, const cuuint32_t* elementStrides, CUtensorMapInterleave interleave, CUtensorMapSwizzle swizzle, CUtensorMapL2promotion l2Promotion, CUtensorMapFloatOOBfill oobFill )


Create a tensor map descriptor object representing tiled memory region.

######  Parameters

`tensorMap`
    \- Tensor map object to create
`tensorDataType`
    \- Tensor data type
`tensorRank`
    \- Dimensionality of tensor
`globalAddress`
    \- Starting address of memory region described by tensor
`globalDim`
    \- Array containing tensor size (number of elements) along each of the `tensorRank` dimensions
`globalStrides`
    \- Array containing stride size (in bytes) along each of the `tensorRank` \- 1 dimensions
`boxDim`
    \- Array containing traversal box size (number of elments) along each of the `tensorRank` dimensions. Specifies how many elements to be traversed along each tensor dimension.
`elementStrides`
    \- Array containing traversal stride in each of the `tensorRank` dimensions
`interleave`
    \- Type of interleaved layout the tensor addresses
`swizzle`
    \- Bank swizzling pattern inside shared memory
`l2Promotion`
    \- L2 promotion size
`oobFill`
    \- Indicate whether zero or special NaN constant must be used to fill out-of-bound elements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a descriptor for Tensor Memory Access (TMA) object specified by the parameters describing a tiled region and returns it in `tensorMap`.

Tensor map objects are only supported on devices of compute capability 9.0 or higher. Additionally, a tensor map object is an opaque value, and, as such, should only be accessed through CUDA APIs and PTX.

The parameters passed are bound to the following requirements:

  * `tensorMap` address must be aligned to 64 bytes.


  * `tensorDataType` has to be an enum from CUtensorMapDataType which is defined as:

        ‎    typedef enum CUtensorMapDataType_enum {
                      CU_TENSOR_MAP_DATA_TYPE_UINT8 = 0,       // 1 byte
                      CU_TENSOR_MAP_DATA_TYPE_UINT16,          // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_UINT32,          // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_INT32,           // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_UINT64,          // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_INT64,           // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT16,         // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT32,         // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT64,         // 8 bytes
                      CU_TENSOR_MAP_DATA_TYPE_BFLOAT16,        // 2 bytes
                      CU_TENSOR_MAP_DATA_TYPE_FLOAT32_FTZ,     // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_TFLOAT32,        // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_TFLOAT32_FTZ,    // 4 bytes
                      CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B,    // 4 bits
                      CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B,   // 4 bits
                      CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B    // 6 bits
                  } CUtensorMapDataType;

CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B copies '16 x U4' packed values to memory aligned as 8 bytes. There are no gaps between packed values. CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B copies '16 x U4' packed values to memory aligned as 16 bytes. There are 8 byte gaps between every 8 byte chunk of packed values. CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B copies '16 x U6' packed values to memory aligned as 16 bytes. There are 4 byte gaps between every 12 byte chunk of packed values.


  * `tensorRank` must be non-zero and less than or equal to the maximum supported dimensionality of 5. If `interleave` is not CU_TENSOR_MAP_INTERLEAVE_NONE, then `tensorRank` must additionally be greater than or equal to 3.


  * `globalAddress`, which specifies the starting address of the memory region described, must be 16 byte aligned. The following requirements need to also be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, `globalAddress` must be 32 byte aligned.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, `globalAddress` must be 32 byte aligned.


  * `globalDim` array, which specifies tensor size of each of the `tensorRank` dimensions, must be non-zero and less than or equal to 2^32. Additionally, the following requirements need to be met for the packed data types:
    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, globalDim[0] must be a multiple of 128.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B, `globalDim`[0] must be a multiple of 2.

    * Dimension for the packed data types must reflect the number of individual U# values.


  * `globalStrides` array, which specifies tensor stride of each of the lower `tensorRank` \- 1 dimensions in bytes, must be a multiple of 16 and less than 2^40. Additionally, the following requirements need to be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, the strides must be a multiple of 32.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, the strides must be a multiple of 32. Each following dimension specified includes previous dimension stride:

          ‎    globalStrides[0] = globalDim[0] * elementSizeInBytes(tensorDataType) + padding[0];
                    for (i = 1; i < tensorRank - 1; i++)
                        globalStrides[i] = globalStrides[i – 1] * (globalDim[i] + padding[i]);
                        assert(globalStrides[i] >= globalDim[i]);


  * `boxDim` array, which specifies number of elements to be traversed along each of the `tensorRank` dimensions, must be non-zero and less than or equal to 256. Additionally, the following requirements need to be met:
    * When `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE, { `boxDim`[0] * elementSizeInBytes( `tensorDataType` ) } must be a multiple of 16 bytes.

    * When `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B or CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, boxDim[0] must be 128.


  * `elementStrides` array, which specifies the iteration step along each of the `tensorRank` dimensions, must be non-zero and less than or equal to 8. Note that when `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE, the first element of this array is ignored since TMA doesn’t support the stride for dimension zero. When all elements of `elementStrides` array is one, `boxDim` specifies the number of elements to load. However, if the `elementStrides`[i] is not equal to one, then TMA loads ceil( `boxDim`[i] / `elementStrides`[i]) number of elements along i-th dimension. To load N elements along i-th dimension, `boxDim`[i] must be set to N * `elementStrides`[i].


  * `interleave` specifies the interleaved layout of type CUtensorMapInterleave, which is defined as:

        ‎    typedef enum CUtensorMapInterleave_enum {
                      CU_TENSOR_MAP_INTERLEAVE_NONE = 0
                      CU_TENSOR_MAP_INTERLEAVE_16B
                      CU_TENSOR_MAP_INTERLEAVE_32B
                  } CUtensorMapInterleave;

TMA supports interleaved layouts like NC/8HWC8 where C8 utilizes 16 bytes in memory assuming 2 byte per channel or NC/16HWC16 where C16 uses 32 bytes. When `interleave` is CU_TENSOR_MAP_INTERLEAVE_NONE and `swizzle` is not CU_TENSOR_MAP_SWIZZLE_NONE, the bounding box inner dimension (computed as `boxDim`[0] multiplied by element size derived from `tensorDataType`) must be less than or equal to the swizzle size.
    * CU_TENSOR_MAP_SWIZZLE_32B requires the bounding box inner dimension to be <= 32.

    * CU_TENSOR_MAP_SWIZZLE_64B requires the bounding box inner dimension to be <= 64.

    * CU_TENSOR_MAP_SWIZZLE_128B* require the bounding box inner dimension to be <= 128. Additionally, `tensorDataType` of CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B requires `interleave` to be CU_TENSOR_MAP_INTERLEAVE_NONE.


  * `swizzle`, which specifies the shared memory bank swizzling pattern, has to be of type CUtensorMapSwizzle which is defined as:

        ‎    typedef enum CUtensorMapSwizzle_enum {
                      CU_TENSOR_MAP_SWIZZLE_NONE = 0
                      CU_TENSOR_MAP_SWIZZLE_32B,                   // Swizzle 16B chunks within 32B  span
                      CU_TENSOR_MAP_SWIZZLE_64B,                   // Swizzle 16B chunks within 64B  span
                      CU_TENSOR_MAP_SWIZZLE_128B,                  // Swizzle 16B chunks within 128B span
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B,         // Swizzle 32B chunks within 128B span
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B_FLIP_8B, // Swizzle 32B chunks within 128B span, additionally swap lower 8B with upper 8B within each 16B for every alternate row
                      CU_TENSOR_MAP_SWIZZLE_128B_ATOM_64B          // Swizzle 64B chunks within 128B span
                  } CUtensorMapSwizzle;

Data are organized in a specific order in global memory; however, this may not match the order in which the application accesses data in shared memory. This difference in data organization may cause bank conflicts when shared memory is accessed. In order to avoid this problem, data can be loaded to shared memory with shuffling across shared memory banks. When `interleave` is CU_TENSOR_MAP_INTERLEAVE_32B, `swizzle` must be CU_TENSOR_MAP_SWIZZLE_32B. Other interleave modes can have any swizzling pattern. When the `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B, only the following swizzle modes are supported:
    * CU_TENSOR_MAP_SWIZZLE_NONE (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B (Load & Store)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_64B (Store only) When the `tensorDataType` is CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, only the following swizzle modes are supported:

    * CU_TENSOR_MAP_SWIZZLE_NONE (Load only)

    * CU_TENSOR_MAP_SWIZZLE_128B (Load only)

    * CU_TENSOR_MAP_SWIZZLE_128B_ATOM_32B (Load only)


  * `l2Promotion` specifies L2 fetch size which indicates the byte granurality at which L2 requests is filled from DRAM. It must be of type CUtensorMapL2promotion, which is defined as:

        ‎    typedef enum CUtensorMapL2promotion_enum {
                      CU_TENSOR_MAP_L2_PROMOTION_NONE = 0
                      CU_TENSOR_MAP_L2_PROMOTION_L2_64B
                      CU_TENSOR_MAP_L2_PROMOTION_L2_128B
                      CU_TENSOR_MAP_L2_PROMOTION_L2_256B
                  } CUtensorMapL2promotion;


  * `oobFill`, which indicates whether zero or a special NaN constant should be used to fill out-of-bound elements, must be of type CUtensorMapFloatOOBfill which is defined as:

        ‎    typedef enum CUtensorMapFloatOOBfill_enum {
                      CU_TENSOR_MAP_FLOAT_OOB_FILL_NONE = 0
                      CU_TENSOR_MAP_FLOAT_OOB_FILL_NAN_REQUEST_ZERO_FMA
                  } CUtensorMapFloatOOBfill;

Note that CU_TENSOR_MAP_FLOAT_OOB_FILL_NAN_REQUEST_ZERO_FMA can only be used when `tensorDataType` represents a floating-point data type, and when `tensorDataType` is not CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN8B, CU_TENSOR_MAP_DATA_TYPE_16U4_ALIGN16B, and CU_TENSOR_MAP_DATA_TYPE_16U6_ALIGN16B.


CUresult cuTensorMapReplaceAddress ( CUtensorMap* tensorMap, void* globalAddress )


Modify an existing tensor map descriptor with an updated global address.

######  Parameters

`tensorMap`
    \- Tensor map object to modify
`globalAddress`
    \- Starting address of memory region described by tensor, must follow previous alignment requirements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Modifies the descriptor for Tensor Memory Access (TMA) object passed in `tensorMap` with an updated `globalAddress`.

Tensor map objects are only supported on devices of compute capability 9.0 or higher. Additionally, a tensor map object is an opaque value, and, as such, should only be accessed through CUDA API calls.
