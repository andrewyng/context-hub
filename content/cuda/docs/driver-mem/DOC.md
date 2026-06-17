---
name: driver-mem
description: '**Source:** group__CUDA__MEM.html#group__CUDA__MEM'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.13. Memory Management

**Source:** group__CUDA__MEM.html#group__CUDA__MEM


### Classes

struct

CUmemDecompressParams

     Structure describing the parameters that compose a single decompression operation.

### Enumerations

enum CUmemDecompressAlgorithm
     Bitmasks for CU_DEVICE_ATTRIBUTE_MEM_DECOMPRESS_ALGORITHM_MASK.

### Functions

CUresult cuArray3DCreate ( CUarray* pHandle, const CUDA_ARRAY3D_DESCRIPTOR* pAllocateArray )


Creates a 3D CUDA array.

######  Parameters

`pHandle`
    \- Returned array
`pAllocateArray`
    \- 3D array descriptor

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_UNKNOWN

###### Description

Creates a CUDA array according to the CUDA_ARRAY3D_DESCRIPTOR structure `pAllocateArray` and returns a handle to the new CUDA array in `*pHandle`. The CUDA_ARRAY3D_DESCRIPTOR is defined as:


    ‎    typedef struct {
                  unsigned int Width;
                  unsigned int Height;
                  unsigned int Depth;
                  CUarray_format Format;
                  unsigned int NumChannels;
                  unsigned int Flags;
              } CUDA_ARRAY3D_DESCRIPTOR;

where:

  * `Width`, `Height`, and `Depth` are the width, height, and depth of the CUDA array (in elements); the following types of CUDA arrays can be allocated:
    * A 1D array is allocated if `Height` and `Depth` extents are both zero.

    * A 2D array is allocated if only `Depth` extent is zero.

    * A 3D array is allocated if all three extents are non-zero.

    * A 1D layered CUDA array is allocated if only `Height` is zero and the CUDA_ARRAY3D_LAYERED flag is set. Each layer is a 1D array. The number of layers is determined by the depth extent.

    * A 2D layered CUDA array is allocated if all three extents are non-zero and the CUDA_ARRAY3D_LAYERED flag is set. Each layer is a 2D array. The number of layers is determined by the depth extent.

    * A cubemap CUDA array is allocated if all three extents are non-zero and the CUDA_ARRAY3D_CUBEMAP flag is set. `Width` must be equal to `Height`, and `Depth` must be six. A cubemap is a special type of 2D layered CUDA array, where the six layers represent the six faces of a cube. The order of the six layers in memory is the same as that listed in CUarray_cubemap_face.

    * A cubemap layered CUDA array is allocated if all three extents are non-zero, and both, CUDA_ARRAY3D_CUBEMAP and CUDA_ARRAY3D_LAYERED flags are set. `Width` must be equal to `Height`, and `Depth` must be a multiple of six. A cubemap layered CUDA array is a special type of 2D layered CUDA array that consists of a collection of cubemaps. The first six layers represent the first cubemap, the next six layers form the second cubemap, and so on.


  * Format specifies the format of the elements; CUarray_format is defined as:

        ‎    typedef enum CUarray_format_enum {
                      CU_AD_FORMAT_UNSIGNED_INT8 = 0x01
                      CU_AD_FORMAT_UNSIGNED_INT16 = 0x02
                      CU_AD_FORMAT_UNSIGNED_INT32 = 0x03
                      CU_AD_FORMAT_SIGNED_INT8 = 0x08
                      CU_AD_FORMAT_SIGNED_INT16 = 0x09
                      CU_AD_FORMAT_SIGNED_INT32 = 0x0a
                      CU_AD_FORMAT_HALF = 0x10
                      CU_AD_FORMAT_FLOAT = 0x20
                      CU_AD_FORMAT_NV12 = 0xb0
                      CU_AD_FORMAT_UNORM_INT8X1 = 0xc0
                      CU_AD_FORMAT_UNORM_INT8X2 = 0xc1
                      CU_AD_FORMAT_UNORM_INT8X4 = 0xc2
                      CU_AD_FORMAT_UNORM_INT16X1 = 0xc3
                      CU_AD_FORMAT_UNORM_INT16X2 = 0xc4
                      CU_AD_FORMAT_UNORM_INT16X4 = 0xc5
                      CU_AD_FORMAT_SNORM_INT8X1 = 0xc6
                      CU_AD_FORMAT_SNORM_INT8X2 = 0xc7
                      CU_AD_FORMAT_SNORM_INT8X4 = 0xc8
                      CU_AD_FORMAT_SNORM_INT16X1 = 0xc9
                      CU_AD_FORMAT_SNORM_INT16X2 = 0xca
                      CU_AD_FORMAT_SNORM_INT16X4 = 0xcb
                      CU_AD_FORMAT_BC1_UNORM = 0x91
                      CU_AD_FORMAT_BC1_UNORM_SRGB = 0x92
                      CU_AD_FORMAT_BC2_UNORM = 0x93
                      CU_AD_FORMAT_BC2_UNORM_SRGB = 0x94
                      CU_AD_FORMAT_BC3_UNORM = 0x95
                      CU_AD_FORMAT_BC3_UNORM_SRGB = 0x96
                      CU_AD_FORMAT_BC4_UNORM = 0x97
                      CU_AD_FORMAT_BC4_SNORM = 0x98
                      CU_AD_FORMAT_BC5_UNORM = 0x99
                      CU_AD_FORMAT_BC5_SNORM = 0x9a
                      CU_AD_FORMAT_BC6H_UF16 = 0x9b
                      CU_AD_FORMAT_BC6H_SF16 = 0x9c
                      CU_AD_FORMAT_BC7_UNORM = 0x9d
                      CU_AD_FORMAT_BC7_UNORM_SRGB = 0x9e
                      CU_AD_FORMAT_P010 = 0x9f
                      CU_AD_FORMAT_P016 = 0xa1
                      CU_AD_FORMAT_NV16 = 0xa2
                      CU_AD_FORMAT_P210 = 0xa3
                      CU_AD_FORMAT_P216 = 0xa4
                      CU_AD_FORMAT_YUY2 = 0xa5
                      CU_AD_FORMAT_Y210 = 0xa6
                      CU_AD_FORMAT_Y216 = 0xa7
                      CU_AD_FORMAT_AYUV = 0xa8
                      CU_AD_FORMAT_Y410 = 0xa9
                      CU_AD_FORMAT_Y416 = 0xb1
                      CU_AD_FORMAT_Y444_PLANAR8 = 0xb2
                      CU_AD_FORMAT_Y444_PLANAR10 = 0xb3
                      CU_AD_FORMAT_YUV444_8bit_SemiPlanar = 0xb4
                      CU_AD_FORMAT_YUV444_16bit_SemiPlanar = 0xb5
                      CU_AD_FORMAT_UNORM_INT_101010_2 = 0x50
                  } CUarray_format;


  * `NumChannels` specifies the number of packed components per CUDA array element; it may be 1, 2, or 4;


  * Flags may be set to
    * CUDA_ARRAY3D_LAYERED to enable creation of layered CUDA arrays. If this flag is set, `Depth` specifies the number of layers, not the depth of a 3D array.

    * CUDA_ARRAY3D_SURFACE_LDST to enable surface references to be bound to the CUDA array. If this flag is not set, cuSurfRefSetArray will fail when attempting to bind the CUDA array to a surface reference.

    * CUDA_ARRAY3D_CUBEMAP to enable creation of cubemaps. If this flag is set, `Width` must be equal to `Height`, and `Depth` must be six. If the CUDA_ARRAY3D_LAYERED flag is also set, then `Depth` must be a multiple of six.

    * CUDA_ARRAY3D_TEXTURE_GATHER to indicate that the CUDA array will be used for texture gather. Texture gather can only be performed on 2D CUDA arrays.


`Width`, `Height` and `Depth` must meet certain size requirements as listed in the following table. All values are specified in elements. Note that for brevity's sake, the full name of the device attribute is not specified. For ex., TEXTURE1D_WIDTH refers to the device attribute CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE1D_WIDTH.

Note that 2D CUDA arrays have different size requirements if the CUDA_ARRAY3D_TEXTURE_GATHER flag is set. `Width` and `Height` must not be greater than CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE2D_GATHER_WIDTH and CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE2D_GATHER_HEIGHT respectively, in that case.

**CUDA array type** |  **Valid extents that must always be met {(width range in elements), (height range), (depth range)}** |  **Valid extents with CUDA_ARRAY3D_SURFACE_LDST set {(width range in elements), (height range), (depth range)}**
---|---|---
1D  |  { (1,TEXTURE1D_WIDTH), 0, 0 }  |  { (1,SURFACE1D_WIDTH), 0, 0 }
2D  |  { (1,TEXTURE2D_WIDTH), (1,TEXTURE2D_HEIGHT), 0 }  |  { (1,SURFACE2D_WIDTH), (1,SURFACE2D_HEIGHT), 0 }
3D  |  { (1,TEXTURE3D_WIDTH), (1,TEXTURE3D_HEIGHT), (1,TEXTURE3D_DEPTH) } OR { (1,TEXTURE3D_WIDTH_ALTERNATE), (1,TEXTURE3D_HEIGHT_ALTERNATE), (1,TEXTURE3D_DEPTH_ALTERNATE) }  |  { (1,SURFACE3D_WIDTH), (1,SURFACE3D_HEIGHT), (1,SURFACE3D_DEPTH) }
1D Layered  |  { (1,TEXTURE1D_LAYERED_WIDTH), 0, (1,TEXTURE1D_LAYERED_LAYERS) }  |  { (1,SURFACE1D_LAYERED_WIDTH), 0, (1,SURFACE1D_LAYERED_LAYERS) }
2D Layered  |  { (1,TEXTURE2D_LAYERED_WIDTH), (1,TEXTURE2D_LAYERED_HEIGHT), (1,TEXTURE2D_LAYERED_LAYERS) }  |  { (1,SURFACE2D_LAYERED_WIDTH), (1,SURFACE2D_LAYERED_HEIGHT), (1,SURFACE2D_LAYERED_LAYERS) }
Cubemap  |  { (1,TEXTURECUBEMAP_WIDTH), (1,TEXTURECUBEMAP_WIDTH), 6 }  |  { (1,SURFACECUBEMAP_WIDTH), (1,SURFACECUBEMAP_WIDTH), 6 }
Cubemap Layered  |  { (1,TEXTURECUBEMAP_LAYERED_WIDTH), (1,TEXTURECUBEMAP_LAYERED_WIDTH), (1,TEXTURECUBEMAP_LAYERED_LAYERS) }  |  { (1,SURFACECUBEMAP_LAYERED_WIDTH), (1,SURFACECUBEMAP_LAYERED_WIDTH), (1,SURFACECUBEMAP_LAYERED_LAYERS) }

Here are examples of CUDA array descriptions:

Description for a CUDA array of 2048 floats:


    ‎    CUDA_ARRAY3D_DESCRIPTOR desc;
              desc.Format = CU_AD_FORMAT_FLOAT;
              desc.NumChannels = 1;
              desc.Width = 2048;
              desc.Height = 0;
              desc.Depth = 0;

Description for a 64 x 64 CUDA array of floats:


    ‎    CUDA_ARRAY3D_DESCRIPTOR desc;
              desc.Format = CU_AD_FORMAT_FLOAT;
              desc.NumChannels = 1;
              desc.Width = 64;
              desc.Height = 64;
              desc.Depth = 0;

Description for a `width` x `height` x `depth` CUDA array of 64-bit, 4x16-bit float16's:


    ‎    CUDA_ARRAY3D_DESCRIPTOR desc;
              desc.Format = CU_AD_FORMAT_HALF;
              desc.NumChannels = 4;
              desc.Width = width;
              desc.Height = height;
              desc.Depth = depth;

CUresult cuArray3DGetDescriptor ( CUDA_ARRAY3D_DESCRIPTOR* pArrayDescriptor, CUarray hArray )


Get a 3D CUDA array descriptor.

######  Parameters

`pArrayDescriptor`
    \- Returned 3D array descriptor
`hArray`
    \- 3D array to get descriptor of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Returns in `*pArrayDescriptor` a descriptor containing information on the format and dimensions of the CUDA array `hArray`. It is useful for subroutines that have been passed a CUDA array, but need to know the CUDA array parameters for validation or other purposes.

This function may be called on 1D and 2D arrays, in which case the `Height` and/or `Depth` members of the descriptor struct will be set to 0.

CUresult cuArrayCreate ( CUarray* pHandle, const CUDA_ARRAY_DESCRIPTOR* pAllocateArray )


Creates a 1D or 2D CUDA array.

######  Parameters

`pHandle`
    \- Returned array
`pAllocateArray`
    \- Array descriptor

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_UNKNOWN

###### Description

Creates a CUDA array according to the CUDA_ARRAY_DESCRIPTOR structure `pAllocateArray` and returns a handle to the new CUDA array in `*pHandle`. The CUDA_ARRAY_DESCRIPTOR is defined as:


    ‎    typedef struct {
                  unsigned int Width;
                  unsigned int Height;
                  CUarray_format Format;
                  unsigned int NumChannels;
              } CUDA_ARRAY_DESCRIPTOR;

where:

  * `Width`, and `Height` are the width, and height of the CUDA array (in elements); the CUDA array is one-dimensional if height is 0, two-dimensional otherwise;

  * Format specifies the format of the elements; CUarray_format is defined as:

        ‎    typedef enum CUarray_format_enum {
                      CU_AD_FORMAT_UNSIGNED_INT8 = 0x01
                      CU_AD_FORMAT_UNSIGNED_INT16 = 0x02
                      CU_AD_FORMAT_UNSIGNED_INT32 = 0x03
                      CU_AD_FORMAT_SIGNED_INT8 = 0x08
                      CU_AD_FORMAT_SIGNED_INT16 = 0x09
                      CU_AD_FORMAT_SIGNED_INT32 = 0x0a
                      CU_AD_FORMAT_HALF = 0x10
                      CU_AD_FORMAT_FLOAT = 0x20
                      CU_AD_FORMAT_NV12 = 0xb0
                      CU_AD_FORMAT_UNORM_INT8X1 = 0xc0
                      CU_AD_FORMAT_UNORM_INT8X2 = 0xc1
                      CU_AD_FORMAT_UNORM_INT8X4 = 0xc2
                      CU_AD_FORMAT_UNORM_INT16X1 = 0xc3
                      CU_AD_FORMAT_UNORM_INT16X2 = 0xc4
                      CU_AD_FORMAT_UNORM_INT16X4 = 0xc5
                      CU_AD_FORMAT_SNORM_INT8X1 = 0xc6
                      CU_AD_FORMAT_SNORM_INT8X2 = 0xc7
                      CU_AD_FORMAT_SNORM_INT8X4 = 0xc8
                      CU_AD_FORMAT_SNORM_INT16X1 = 0xc9
                      CU_AD_FORMAT_SNORM_INT16X2 = 0xca
                      CU_AD_FORMAT_SNORM_INT16X4 = 0xcb
                      CU_AD_FORMAT_BC1_UNORM = 0x91
                      CU_AD_FORMAT_BC1_UNORM_SRGB = 0x92
                      CU_AD_FORMAT_BC2_UNORM = 0x93
                      CU_AD_FORMAT_BC2_UNORM_SRGB = 0x94
                      CU_AD_FORMAT_BC3_UNORM = 0x95
                      CU_AD_FORMAT_BC3_UNORM_SRGB = 0x96
                      CU_AD_FORMAT_BC4_UNORM = 0x97
                      CU_AD_FORMAT_BC4_SNORM = 0x98
                      CU_AD_FORMAT_BC5_UNORM = 0x99
                      CU_AD_FORMAT_BC5_SNORM = 0x9a
                      CU_AD_FORMAT_BC6H_UF16 = 0x9b
                      CU_AD_FORMAT_BC6H_SF16 = 0x9c
                      CU_AD_FORMAT_BC7_UNORM = 0x9d
                      CU_AD_FORMAT_BC7_UNORM_SRGB = 0x9e
                      CU_AD_FORMAT_P010 = 0x9f
                      CU_AD_FORMAT_P016 = 0xa1
                      CU_AD_FORMAT_NV16 = 0xa2
                      CU_AD_FORMAT_P210 = 0xa3
                      CU_AD_FORMAT_P216 = 0xa4
                      CU_AD_FORMAT_YUY2 = 0xa5
                      CU_AD_FORMAT_Y210 = 0xa6
                      CU_AD_FORMAT_Y216 = 0xa7
                      CU_AD_FORMAT_AYUV = 0xa8
                      CU_AD_FORMAT_Y410 = 0xa9
                      CU_AD_FORMAT_Y416 = 0xb1
                      CU_AD_FORMAT_Y444_PLANAR8 = 0xb2
                      CU_AD_FORMAT_Y444_PLANAR10 = 0xb3
                      CU_AD_FORMAT_YUV444_8bit_SemiPlanar = 0xb4
                      CU_AD_FORMAT_YUV444_16bit_SemiPlanar = 0xb5
                      CU_AD_FORMAT_UNORM_INT_101010_2 = 0x50
                      CU_AD_FORMAT_UINT8_PACKED_422 = 0x51
                      CU_AD_FORMAT_UINT8_PACKED_444 = 0x52
                      CU_AD_FORMAT_UINT8_SEMIPLANAR_420 = 0x53
                      CU_AD_FORMAT_UINT16_SEMIPLANAR_420 = 0x54
                      CU_AD_FORMAT_UINT8_SEMIPLANAR_422 = 0x55
                      CU_AD_FORMAT_UINT16_SEMIPLANAR_422 = 0x56
                      CU_AD_FORMAT_UINT8_SEMIPLANAR_444 = 0x57
                      CU_AD_FORMAT_UINT16_SEMIPLANAR_444 = 0x58
                      CU_AD_FORMAT_UINT8_PLANAR_420 = 0x59
                      CU_AD_FORMAT_UINT16_PLANAR_420 = 0x5a
                      CU_AD_FORMAT_UINT8_PLANAR_422 = 0x5b
                      CU_AD_FORMAT_UINT16_PLANAR_422 = 0x5c
                      CU_AD_FORMAT_UINT8_PLANAR_444 = 0x5d
                      CU_AD_FORMAT_UINT16_PLANAR_444 = 0x5e
                 } CUarray_format;

  * `NumChannels` specifies the number of packed components per CUDA array element; it may be 1, 2, or 4;


Here are examples of CUDA array descriptions:

Description for a CUDA array of 2048 floats:


    ‎    CUDA_ARRAY_DESCRIPTOR desc;
              desc.Format = CU_AD_FORMAT_FLOAT;
              desc.NumChannels = 1;
              desc.Width = 2048;
              desc.Height = 1;

Description for a 64 x 64 CUDA array of floats:


    ‎    CUDA_ARRAY_DESCRIPTOR desc;
              desc.Format = CU_AD_FORMAT_FLOAT;
              desc.NumChannels = 1;
              desc.Width = 64;
              desc.Height = 64;

Description for a `width` x `height` CUDA array of 64-bit, 4x16-bit float16's:


    ‎    CUDA_ARRAY_DESCRIPTOR desc;
              desc.Format = CU_AD_FORMAT_HALF;
              desc.NumChannels = 4;
              desc.Width = width;
              desc.Height = height;

Description for a `width` x `height` CUDA array of 16-bit elements, each of which is two 8-bit unsigned chars:


    ‎    CUDA_ARRAY_DESCRIPTOR arrayDesc;
              desc.Format = CU_AD_FORMAT_UNSIGNED_INT8;
              desc.NumChannels = 2;
              desc.Width = width;
              desc.Height = height;

CUresult cuArrayDestroy ( CUarray hArray )


Destroys a CUDA array.

######  Parameters

`hArray`
    \- Array to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_ARRAY_IS_MAPPED, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Destroys the CUDA array `hArray`.

CUresult cuArrayGetDescriptor ( CUDA_ARRAY_DESCRIPTOR* pArrayDescriptor, CUarray hArray )


Get a 1D or 2D CUDA array descriptor.

######  Parameters

`pArrayDescriptor`
    \- Returned array descriptor
`hArray`
    \- Array to get descriptor of

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Returns in `*pArrayDescriptor` a descriptor containing information on the format and dimensions of the CUDA array `hArray`. It is useful for subroutines that have been passed a CUDA array, but need to know the CUDA array parameters for validation or other purposes.

CUresult cuArrayGetMemoryRequirements ( CUDA_ARRAY_MEMORY_REQUIREMENTS* memoryRequirements, CUarray array, CUdevice device )


Returns the memory requirements of a CUDA array.

######  Parameters

`memoryRequirements`
    \- Pointer to CUDA_ARRAY_MEMORY_REQUIREMENTS
`array`
    \- CUDA array to get the memory requirements of
`device`
    \- Device to get the memory requirements for

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the memory requirements of a CUDA array in `memoryRequirements` If the CUDA array is not allocated with flag CUDA_ARRAY3D_DEFERRED_MAPPINGCUDA_ERROR_INVALID_VALUE will be returned.

The returned value in CUDA_ARRAY_MEMORY_REQUIREMENTS::size represents the total size of the CUDA array. The returned value in CUDA_ARRAY_MEMORY_REQUIREMENTS::alignment represents the alignment necessary for mapping the CUDA array.

CUresult cuArrayGetPlane ( CUarray* pPlaneArray, CUarray hArray, unsigned int  planeIdx )


Gets a CUDA array plane from a CUDA array.

######  Parameters

`pPlaneArray`
    \- Returned CUDA array referenced by the `planeIdx`
`hArray`
    \- Multiplanar CUDA array
`planeIdx`
    \- Plane index

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Returns in `pPlaneArray` a CUDA array that represents a single format plane of the CUDA array `hArray`.

If `planeIdx` is greater than the maximum number of planes in this array or if the array does not have a multi-planar format e.g: CU_AD_FORMAT_NV12, then CUDA_ERROR_INVALID_VALUE is returned.

Note that if the `hArray` has format CU_AD_FORMAT_NV12, then passing in 0 for `planeIdx` returns a CUDA array of the same size as `hArray` but with one channel and CU_AD_FORMAT_UNSIGNED_INT8 as its format. If 1 is passed for `planeIdx`, then the returned CUDA array has half the height and width of `hArray` with two channels and CU_AD_FORMAT_UNSIGNED_INT8 as its format.

CUresult cuArrayGetSparseProperties ( CUDA_ARRAY_SPARSE_PROPERTIES* sparseProperties, CUarray array )


Returns the layout properties of a sparse CUDA array.

######  Parameters

`sparseProperties`
    \- Pointer to CUDA_ARRAY_SPARSE_PROPERTIES
`array`
    \- CUDA array to get the sparse properties of

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the layout properties of a sparse CUDA array in `sparseProperties` If the CUDA array is not allocated with flag CUDA_ARRAY3D_SPARSECUDA_ERROR_INVALID_VALUE will be returned.

If the returned value in CUDA_ARRAY_SPARSE_PROPERTIES::flags contains CU_ARRAY_SPARSE_PROPERTIES_SINGLE_MIPTAIL, then CUDA_ARRAY_SPARSE_PROPERTIES::miptailSize represents the total size of the array. Otherwise, it will be zero. Also, the returned value in CUDA_ARRAY_SPARSE_PROPERTIES::miptailFirstLevel is always zero. Note that the `array` must have been allocated using cuArrayCreate or cuArray3DCreate. For CUDA arrays obtained using cuMipmappedArrayGetLevel, CUDA_ERROR_INVALID_VALUE will be returned. Instead, cuMipmappedArrayGetSparseProperties must be used to obtain the sparse properties of the entire CUDA mipmapped array to which `array` belongs to.

CUresult cuDeviceGetByPCIBusId ( CUdevice* dev, const char* pciBusId )


Returns a handle to a compute device.

######  Parameters

`dev`
    \- Returned device handle
`pciBusId`
    \- String in one of the following forms: [domain]:[bus]:[device].[function] [domain]:[bus]:[device] [bus]:[device].[function] where `domain`, `bus`, `device`, and `function` are all hexadecimal values

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns in `*device` a device handle given a PCI bus ID string.

CUresult cuDeviceGetPCIBusId ( char* pciBusId, int  len, CUdevice dev )


Returns a PCI Bus Id string for the device.

######  Parameters

`pciBusId`
    \- Returned identifier string for the device in the following format [domain]:[bus]:[device].[function] where `domain`, `bus`, `device`, and `function` are all hexadecimal values. pciBusId should be large enough to store 13 characters including the NULL-terminator.
`len`
    \- Maximum length of string to store in `name`
`dev`
    \- Device to get identifier string for

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_DEVICE

###### Description

Returns an ASCII string identifying the device `dev` in the NULL-terminated string pointed to by `pciBusId`. `len` specifies the maximum length of the string that may be returned.

CUresult cuDeviceRegisterAsyncNotification ( CUdevice device, CUasyncCallback callbackFunc, void* userData, CUasyncCallbackHandle* callback )


Registers a callback function to receive async notifications.

######  Parameters

`device`
    \- The device on which to register the callback
`callbackFunc`
    \- The function to register as a callback
`userData`
    \- A generic pointer to user data. This is passed into the callback function.
`callback`
    \- A handle representing the registered callback instance

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_UNKNOWN

###### Description

Registers `callbackFunc` to receive async notifications.

The `userData` parameter is passed to the callback function at async notification time. Likewise, `callback` is also passed to the callback function to distinguish between multiple registered callbacks.

The callback function being registered should be designed to return quickly (~10ms). Any long running tasks should be queued for execution on an application thread.

Callbacks may not call cuDeviceRegisterAsyncNotification or cuDeviceUnregisterAsyncNotification. Doing so will result in CUDA_ERROR_NOT_PERMITTED. Async notification callbacks execute in an undefined order and may be serialized.

Returns in `*callback` a handle representing the registered callback instance.

CUresult cuDeviceUnregisterAsyncNotification ( CUdevice device, CUasyncCallbackHandle callback )


Unregisters an async notification callback.

######  Parameters

`device`
    \- The device from which to remove `callback`.
`callback`
    \- The callback instance to unregister from receiving async notifications.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_DEVICE, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_UNKNOWN

###### Description

Unregisters `callback` so that the corresponding callback function will stop receiving async notifications.

CUresult cuIpcCloseMemHandle ( CUdeviceptr dptr )


Attempts to close memory mapped with cuIpcOpenMemHandle.

######  Parameters

`dptr`
    \- Device pointer returned by cuIpcOpenMemHandle

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_MAP_FAILED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

Decrements the reference count of the memory returned by cuIpcOpenMemHandle by 1. When the reference count reaches 0, this API unmaps the memory. The original allocation in the exporting process as well as imported mappings in other processes will be unaffected.

Any resources used to enable peer access will be freed if this is the last mapping using them.

IPC functionality is restricted to devices with support for unified addressing on Linux and Windows operating systems. IPC functionality on Windows is supported for compatibility purposes but not recommended as it comes with performance cost. Users can test their device for IPC functionality by calling cuapiDeviceGetAttribute with CU_DEVICE_ATTRIBUTE_IPC_EVENT_SUPPORTED

CUresult cuIpcGetEventHandle ( CUipcEventHandle* pHandle, CUevent event )


Gets an interprocess handle for a previously allocated event.

######  Parameters

`pHandle`
    \- Pointer to a user allocated CUipcEventHandle in which to return the opaque event handle
`event`
    \- Event allocated with CU_EVENT_INTERPROCESS and CU_EVENT_DISABLE_TIMING flags.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_MAP_FAILED, CUDA_ERROR_INVALID_VALUE

###### Description

Takes as input a previously allocated event. This event must have been created with the CU_EVENT_INTERPROCESS and CU_EVENT_DISABLE_TIMING flags set. This opaque handle may be copied into other processes and opened with cuIpcOpenEventHandle to allow efficient hardware synchronization between GPU work in different processes.

After the event has been opened in the importing process, cuEventRecord, cuEventSynchronize, cuStreamWaitEvent and cuEventQuery may be used in either process. Performing operations on the imported event after the exported event has been freed with cuEventDestroy will result in undefined behavior.

IPC functionality is restricted to devices with support for unified addressing on Linux and Windows operating systems. IPC functionality on Windows is supported for compatibility purposes but not recommended as it comes with performance cost. Users can test their device for IPC functionality by calling cuDeviceGetAttribute with CU_DEVICE_ATTRIBUTE_IPC_EVENT_SUPPORTED

CUresult cuIpcGetMemHandle ( CUipcMemHandle* pHandle, CUdeviceptr dptr )


Gets an interprocess memory handle for an existing device memory allocation.

######  Parameters

`pHandle`
    \- Pointer to user allocated CUipcMemHandle to return the handle in.
`dptr`
    \- Base pointer to previously allocated device memory

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_MAP_FAILED, CUDA_ERROR_INVALID_VALUE

###### Description

Takes a pointer to the base of an existing device memory allocation created with cuMemAlloc and exports it for use in another process. This is a lightweight operation and may be called multiple times on an allocation without adverse effects.

If a region of memory is freed with cuMemFree and a subsequent call to cuMemAlloc returns memory with the same device address, cuIpcGetMemHandle will return a unique handle for the new memory.

IPC functionality is restricted to devices with support for unified addressing on Linux and Windows operating systems. IPC functionality on Windows is supported for compatibility purposes but not recommended as it comes with performance cost. Users can test their device for IPC functionality by calling cuapiDeviceGetAttribute with CU_DEVICE_ATTRIBUTE_IPC_EVENT_SUPPORTED

CUresult cuIpcOpenEventHandle ( CUevent* phEvent, CUipcEventHandle handle )


Opens an interprocess event handle for use in the current process.

######  Parameters

`phEvent`
    \- Returns the imported event
`handle`
    \- Interprocess handle to open

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_MAP_FAILED, CUDA_ERROR_PEER_ACCESS_UNSUPPORTED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_INVALID_VALUE

###### Description

Opens an interprocess event handle exported from another process with cuIpcGetEventHandle. This function returns a CUevent that behaves like a locally created event with the CU_EVENT_DISABLE_TIMING flag specified. This event must be freed with cuEventDestroy.

Performing operations on the imported event after the exported event has been freed with cuEventDestroy will result in undefined behavior.

IPC functionality is restricted to devices with support for unified addressing on Linux and Windows operating systems. IPC functionality on Windows is supported for compatibility purposes but not recommended as it comes with performance cost. Users can test their device for IPC functionality by calling cuapiDeviceGetAttribute with CU_DEVICE_ATTRIBUTE_IPC_EVENT_SUPPORTED

CUresult cuIpcOpenMemHandle ( CUdeviceptr* pdptr, CUipcMemHandle handle, unsigned int  Flags )


Opens an interprocess memory handle exported from another process and returns a device pointer usable in the local process.

######  Parameters

`pdptr`
    \- Returned device pointer
`handle`
    \- CUipcMemHandle to open
`Flags`
    \- Flags for this operation. Must be specified as CU_IPC_MEM_LAZY_ENABLE_PEER_ACCESS

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_MAP_FAILED, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_TOO_MANY_PEERS, CUDA_ERROR_INVALID_VALUE

###### Description

Maps memory exported from another process with cuIpcGetMemHandle into the current device address space. For contexts on different devices cuIpcOpenMemHandle can attempt to enable peer access between the devices as if the user called cuCtxEnablePeerAccess. This behavior is controlled by the CU_IPC_MEM_LAZY_ENABLE_PEER_ACCESS flag. cuDeviceCanAccessPeer can determine if a mapping is possible.

Contexts that may open CUipcMemHandles are restricted in the following way. CUipcMemHandles from each CUdevice in a given process may only be opened by one CUcontext per CUdevice per other process.

If the memory handle has already been opened by the current context, the reference count on the handle is incremented by 1 and the existing device pointer is returned.

Memory returned from cuIpcOpenMemHandle must be freed with cuIpcCloseMemHandle.

Calling cuMemFree on an exported memory region before calling cuIpcCloseMemHandle in the importing context will result in undefined behavior.

IPC functionality is restricted to devices with support for unified addressing on Linux and Windows operating systems. IPC functionality on Windows is supported for compatibility purposes but not recommended as it comes with performance cost. Users can test their device for IPC functionality by calling cuapiDeviceGetAttribute with CU_DEVICE_ATTRIBUTE_IPC_EVENT_SUPPORTED

No guarantees are made about the address returned in `*pdptr`. In particular, multiple processes may not receive the same address for the same `handle`.

CUresult cuMemAlloc ( CUdeviceptr* dptr, size_t bytesize )


Allocates device memory.

######  Parameters

`dptr`
    \- Returned device pointer
`bytesize`
    \- Requested allocation size in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Allocates `bytesize` bytes of linear memory on the device and returns in `*dptr` a pointer to the allocated memory. The allocated memory is suitably aligned for any kind of variable. The memory is not cleared. If `bytesize` is 0, cuMemAlloc() returns CUDA_ERROR_INVALID_VALUE.

CUresult cuMemAllocHost ( void** pp, size_t bytesize )


Allocates page-locked host memory.

######  Parameters

`pp`
    \- Returned pointer to host memory
`bytesize`
    \- Requested allocation size in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Allocates `bytesize` bytes of host memory that is page-locked and accessible to the device. The driver tracks the virtual memory ranges allocated with this function and automatically accelerates calls to functions such as cuMemcpy(). Since the memory can be accessed directly by the device, it can be read or written with much higher bandwidth than pageable memory obtained with functions such as malloc().

On systems where CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES is true, cuMemAllocHost may not page-lock the allocated memory.

Page-locking excessive amounts of memory with cuMemAllocHost() may degrade system performance, since it reduces the amount of memory available to the system for paging. As a result, this function is best used sparingly to allocate staging areas for data exchange between host and device.

Note all host memory allocated using cuMemAllocHost() will automatically be immediately accessible to all contexts on all devices which support unified addressing (as may be queried using CU_DEVICE_ATTRIBUTE_UNIFIED_ADDRESSING). The device pointer that may be used to access this host memory from those contexts is always equal to the returned host pointer `*pp`. See Unified Addressing for additional details.

CUresult cuMemAllocManaged ( CUdeviceptr* dptr, size_t bytesize, unsigned int  flags )


Allocates memory that will be automatically managed by the Unified Memory system.

######  Parameters

`dptr`
    \- Returned device pointer
`bytesize`
    \- Requested allocation size in bytes
`flags`
    \- Must be one of CU_MEM_ATTACH_GLOBAL or CU_MEM_ATTACH_HOST

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Allocates `bytesize` bytes of managed memory on the device and returns in `*dptr` a pointer to the allocated memory. If the device doesn't support allocating managed memory, CUDA_ERROR_NOT_SUPPORTED is returned. Support for managed memory can be queried using the device attribute CU_DEVICE_ATTRIBUTE_MANAGED_MEMORY. The allocated memory is suitably aligned for any kind of variable. The memory is not cleared. If `bytesize` is 0, cuMemAllocManaged returns CUDA_ERROR_INVALID_VALUE. The pointer is valid on the CPU and on all GPUs in the system that support managed memory. All accesses to this pointer must obey the Unified Memory programming model.

`flags` specifies the default stream association for this allocation. `flags` must be one of CU_MEM_ATTACH_GLOBAL or CU_MEM_ATTACH_HOST. If CU_MEM_ATTACH_GLOBAL is specified, then this memory is accessible from any stream on any device. If CU_MEM_ATTACH_HOST is specified, then the allocation should not be accessed from devices that have a zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS; an explicit call to cuStreamAttachMemAsync will be required to enable access on such devices.

If the association is later changed via cuStreamAttachMemAsync to a single stream, the default association as specified during cuMemAllocManaged is restored when that stream is destroyed. For __managed__ variables, the default association is always CU_MEM_ATTACH_GLOBAL. Note that destroying a stream is an asynchronous operation, and as a result, the change to default association won't happen until all work in the stream has completed.

Memory allocated with cuMemAllocManaged should be released with cuMemFree.

Device memory oversubscription is possible for GPUs that have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. Managed memory on such GPUs may be evicted from device memory to host memory at any time by the Unified Memory driver in order to make room for other allocations.

In a system where all GPUs have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS, managed memory may not be populated when this API returns and instead may be populated on access. In such systems, managed memory can migrate to any processor's memory at any time. The Unified Memory driver will employ heuristics to maintain data locality and prevent excessive page faults to the extent possible. The application can also guide the driver about memory usage patterns via cuMemAdvise. The application can also explicitly migrate memory to a desired processor's memory via cuMemPrefetchAsync.

In a multi-GPU system where all of the GPUs have a zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS and all the GPUs have peer-to-peer support with each other, the physical storage for managed memory is created on the GPU which is active at the time cuMemAllocManaged is called. All other GPUs will reference the data at reduced bandwidth via peer mappings over the PCIe bus. The Unified Memory driver does not migrate memory among such GPUs.

In a multi-GPU system where not all GPUs have peer-to-peer support with each other and where the value of the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS is zero for at least one of those GPUs, the location chosen for physical storage of managed memory is system-dependent.

  * On Linux, the location chosen will be device memory as long as the current set of active contexts are on devices that either have peer-to-peer support with each other or have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. If there is an active context on a GPU that does not have a non-zero value for that device attribute and it does not have peer-to-peer support with the other devices that have active contexts on them, then the location for physical storage will be 'zero-copy' or host memory. Note that this means that managed memory that is located in device memory is migrated to host memory if a new context is created on a GPU that doesn't have a non-zero value for the device attribute and does not support peer-to-peer with at least one of the other devices that has an active context. This in turn implies that context creation may fail if there is insufficient host memory to migrate all managed allocations.

  * On Windows, the physical storage is always created in 'zero-copy' or host memory. All GPUs will reference the data at reduced bandwidth over the PCIe bus. In these circumstances, use of the environment variable CUDA_VISIBLE_DEVICES is recommended to restrict CUDA to only use those GPUs that have peer-to-peer support. Alternatively, users can also set CUDA_MANAGED_FORCE_DEVICE_ALLOC to a non-zero value to force the driver to always use device memory for physical storage. When this environment variable is set to a non-zero value, all contexts created in that process on devices that support managed memory have to be peer-to-peer compatible with each other. Context creation will fail if a context is created on a device that supports managed memory and is not peer-to-peer compatible with any of the other managed memory supporting devices on which contexts were previously created, even if those contexts have been destroyed. These environment variables are described in the CUDA programming guide under the "CUDA environment variables" section.

  * On ARM, managed memory is not available on discrete gpu with Drive PX-2.


CUresult cuMemAllocPitch ( CUdeviceptr* dptr, size_t* pPitch, size_t WidthInBytes, size_t Height, unsigned int  ElementSizeBytes )


Allocates pitched device memory.

######  Parameters

`dptr`
    \- Returned device pointer
`pPitch`
    \- Returned pitch of allocation in bytes
`WidthInBytes`
    \- Requested allocation width in bytes
`Height`
    \- Requested allocation height in rows
`ElementSizeBytes`
    \- Size of largest reads/writes for range

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Allocates at least `WidthInBytes` * `Height` bytes of linear memory on the device and returns in `*dptr` a pointer to the allocated memory. The function may pad the allocation to ensure that corresponding pointers in any given row will continue to meet the alignment requirements for coalescing as the address is updated from row to row. `ElementSizeBytes` specifies the size of the largest reads and writes that will be performed on the memory range. `ElementSizeBytes` may be 4, 8 or 16 (since coalesced memory transactions are not possible on other data sizes). If `ElementSizeBytes` is smaller than the actual read/write size of a kernel, the kernel will run correctly, but possibly at reduced speed. The pitch returned in `*pPitch` by cuMemAllocPitch() is the width in bytes of the allocation. The intended usage of pitch is as a separate parameter of the allocation, used to compute addresses within the 2D array. Given the row and column of an array element of type **T** , the address is computed as:


    ‎   T* pElement = (T*)((char*)BaseAddress + Row * Pitch) + Column;

The pitch returned by cuMemAllocPitch() is guaranteed to work with cuMemcpy2D() under all circumstances. For allocations of 2D arrays, it is recommended that programmers consider performing pitch allocations using cuMemAllocPitch(). Due to alignment restrictions in the hardware, this is especially true if the application will be performing 2D memory copies between different regions of device memory (whether linear memory or CUDA arrays).

The byte alignment of the pitch returned by cuMemAllocPitch() is guaranteed to match or exceed the alignment requirement for texture binding with cuTexRefSetAddress2D().

CUresult cuMemBatchDecompressAsync ( CUmemDecompressParams* paramsArray, size_t count, unsigned int  flags, size_t* errorIndex, CUstream stream )


Submit a batch of `count` independent decompression operations.

######  Parameters

`paramsArray`
    The array of structures describing the independent decompression operations.
`count`
    The number of entries in `paramsArray` array.
`flags`
    Must be 0.
`errorIndex`
    The index into `paramsArray` of the decompression operation for which the error returned by this function pertains to. If `index` is SIZE_MAX and the value returned is not CUDA_SUCCESS, then the error returned by this function should be considered a general error that does not pertain to a particular decompression operation. May be `NULL`, in which case, no index will be recorded in the event of error.
`stream`
    The stream where the work will be enqueued.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Each of the `count` decompression operations is described by a single entry in the `paramsArray` array. Once the batch has been submitted, the function will return, and decompression will happen asynchronously w.r.t. the CPU. To the work completion tracking mechanisms in the CUDA driver, the batch will be considered a single unit of work and processed according to stream semantics, i.e., it is not possible to query the completion of individual decompression operations within a batch.

The memory pointed to by each of CUmemDecompressParams.src, CUmemDecompressParams.dst, and CUmemDecompressParams.dstActBytes, must be capable of usage with the hardware decompress feature. That is, for each of said pointers, the pointer attribute CU_POINTER_ATTRIBUTE_IS_HW_DECOMPRESS_CAPABLE should give a non-zero value. To ensure this, the memory backing the pointers should have been allocated using one of the following CUDA memory allocators: * cuMemAlloc() * cuMemCreate() with the usage flag CU_MEM_CREATE_USAGE_HW_DECOMPRESS * cuMemAllocFromPoolAsync() from a pool that was created with the usage flag CU_MEM_POOL_CREATE_USAGE_HW_DECOMPRESS Additionally, CUmemDecompressParams.src, CUmemDecompressParams.dst, and CUmemDecompressParams.dstActBytes, must all be accessible from the device associated with the context where `stream` was created. For information on how to ensure this, see the documentation for the allocator of interest.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemFree ( CUdeviceptr dptr )


Frees device memory.

######  Parameters

`dptr`
    \- Pointer to memory to free

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Frees the memory space pointed to by `dptr`, which must have been returned by a previous call to one of the following memory allocation APIs - cuMemAlloc(), cuMemAllocPitch(), cuMemAllocManaged(), cuMemAllocAsync(), cuMemAllocFromPoolAsync()

Note - This API will not perform any implict synchronization when the pointer was allocated with cuMemAllocAsync or cuMemAllocFromPoolAsync. Callers must ensure that all accesses to these pointer have completed before invoking cuMemFree. For best performance and memory reuse, users should use cuMemFreeAsync to free memory allocated via the stream ordered memory allocator. For all other pointers, this API may perform implicit synchronization.

CUresult cuMemFreeHost ( void* p )


Frees page-locked host memory.

######  Parameters

`p`
    \- Pointer to memory to free

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Frees the memory space pointed to by `p`, which must have been returned by a previous call to cuMemAllocHost().

CUresult cuMemGetAddressRange ( CUdeviceptr* pbase, size_t* psize, CUdeviceptr dptr )


Get information on memory allocations.

######  Parameters

`pbase`
    \- Returned base address
`psize`
    \- Returned size of device memory allocation
`dptr`
    \- Device pointer to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_NOT_FOUND, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the base address in `*pbase` and size in `*psize` of the allocation that contains the input pointer `dptr`. Both parameters `pbase` and `psize` are optional. If one of them is NULL, it is ignored.

CUresult cuMemGetHandleForAddressRange ( void* handle, CUdeviceptr dptr, size_t size, CUmemRangeHandleType handleType, unsigned long long flags )


Retrieve handle for an address range.

######  Parameters

`handle`
    \- Pointer to the location where the returned handle will be stored.
`dptr`
    \- Pointer to a valid CUDA device allocation. Must be aligned to host page size.
`size`
    \- Length of the address range. Must be aligned to host page size.
`handleType`
    \- Type of handle requested (defines type and size of the `handle` output parameter)
`flags`
    \- When requesting CUmemRangeHandleType::CU_MEM_RANGE_HANDLE_TYPE_DMA_BUF_FD the value could be CU_MEM_RANGE_FLAG_DMA_BUF_MAPPING_TYPE_PCIE, otherwise 0.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Get a handle of the specified type to an address range. When requesting CUmemRangeHandleType::CU_MEM_RANGE_HANDLE_TYPE_DMA_BUF_FD, address range obtained by a prior call to either cuMemAlloc or cuMemAddressReserve is supported if the CU_DEVICE_ATTRIBUTE_DMA_BUF_SUPPORTED device attribute returns true. If the address range was obtained via cuMemAddressReserve, it must also be fully mapped via cuMemMap. Address range obtained by a prior call to either cuMemAllocHost or cuMemHostAlloc is supported if the CU_DEVICE_ATTRIBUTE_HOST_ALLOC_DMA_BUF_SUPPORTED device attribute returns true.

As of CUDA 13.0, querying support for address range obtained by calling cuMemAllocHost or cuMemHostAlloc using the CU_DEVICE_ATTRIBUTE_DMA_BUF_SUPPORTED device attribute is deprecated.

Users must ensure the `dptr` and `size` are aligned to the host page size.

The `handle` will be interpreted as a pointer to an integer to store the dma_buf file descriptor. Users must ensure the entire address range is backed and mapped when the address range is allocated by cuMemAddressReserve. All the physical allocations backing the address range must be resident on the same device and have identical allocation properties. Users are also expected to retrieve a new handle every time the underlying physical allocation(s) corresponding to a previously queried VA range are changed.

For CUmemRangeHandleType::CU_MEM_RANGE_HANDLE_TYPE_DMA_BUF_FD, users may set flags to CU_MEM_RANGE_FLAG_DMA_BUF_MAPPING_TYPE_PCIE. Which when set on a supported platform, will give a DMA_BUF handle mapped via PCIE BAR1 or will return an error otherwise.

CUresult cuMemGetInfo ( size_t* free, size_t* total )


Gets free and total memory.

######  Parameters

`free`
    \- Returned free memory in bytes
`total`
    \- Returned total memory in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns in `*total` the total amount of memory available to the the current context. Returns in `*free` the amount of memory on the device that is free according to the OS. CUDA is not guaranteed to be able to allocate all of the memory that the OS reports as free. In a multi-tenet situation, free estimate returned is prone to race condition where a new allocation/free done by a different process or a different thread in the same process between the time when free memory was estimated and reported, will result in deviation in free value reported and actual free memory.

The integrated GPU on Tegra shares memory with CPU and other component of the SoC. The free and total values returned by the API excludes the SWAP memory space maintained by the OS on some platforms. The OS may move some of the memory pages into swap area as the GPU or CPU allocate or access memory. See Tegra app note on how to calculate total and free memory on Tegra.

CUresult cuMemHostAlloc ( void** pp, size_t bytesize, unsigned int  Flags )


Allocates page-locked host memory.

######  Parameters

`pp`
    \- Returned pointer to host memory
`bytesize`
    \- Requested allocation size in bytes
`Flags`
    \- Flags for allocation request

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Allocates `bytesize` bytes of host memory that is page-locked and accessible to the device. The driver tracks the virtual memory ranges allocated with this function and automatically accelerates calls to functions such as cuMemcpyHtoD(). Since the memory can be accessed directly by the device, it can be read or written with much higher bandwidth than pageable memory obtained with functions such as malloc().

On systems where CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES is true, cuMemHostAlloc may not page-lock the allocated memory.

Page-locking excessive amounts of memory may degrade system performance, since it reduces the amount of memory available to the system for paging. As a result, this function is best used sparingly to allocate staging areas for data exchange between host and device.

The `Flags` parameter enables different options to be specified that affect the allocation, as follows.

  * CU_MEMHOSTALLOC_PORTABLE: The memory returned by this call will be considered as pinned memory by all CUDA contexts, not just the one that performed the allocation.


  * CU_MEMHOSTALLOC_DEVICEMAP: Maps the allocation into the CUDA address space. The device pointer to the memory may be obtained by calling cuMemHostGetDevicePointer().


  * CU_MEMHOSTALLOC_WRITECOMBINED: Allocates the memory as write-combined (WC). WC memory can be transferred across the PCI Express bus more quickly on some system configurations, but cannot be read efficiently by most CPUs. WC memory is a good option for buffers that will be written by the CPU and read by the GPU via mapped pinned memory or host->device transfers.


All of these flags are orthogonal to one another: a developer may allocate memory that is portable, mapped and/or write-combined with no restrictions.

The CU_MEMHOSTALLOC_DEVICEMAP flag may be specified on CUDA contexts for devices that do not support mapped pinned memory. The failure is deferred to cuMemHostGetDevicePointer() because the memory may be mapped into other CUDA contexts via the CU_MEMHOSTALLOC_PORTABLE flag.

The memory allocated by this function must be freed with cuMemFreeHost().

Note all host memory allocated using cuMemHostAlloc() will automatically be immediately accessible to all contexts on all devices which support unified addressing (as may be queried using CU_DEVICE_ATTRIBUTE_UNIFIED_ADDRESSING). Unless the flag CU_MEMHOSTALLOC_WRITECOMBINED is specified, the device pointer that may be used to access this host memory from those contexts is always equal to the returned host pointer `*pp`. If the flag CU_MEMHOSTALLOC_WRITECOMBINED is specified, then the function cuMemHostGetDevicePointer() must be used to query the device pointer, even if the context supports unified addressing. See Unified Addressing for additional details.

CUresult cuMemHostGetDevicePointer ( CUdeviceptr* pdptr, void* p, unsigned int  Flags )


Passes back device pointer of mapped pinned memory.

######  Parameters

`pdptr`
    \- Returned device pointer
`p`
    \- Host pointer
`Flags`
    \- Options (must be 0)

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Passes back the device pointer `pdptr` corresponding to the mapped, pinned host buffer `p` allocated by cuMemHostAlloc.

cuMemHostGetDevicePointer() will fail if the CU_MEMHOSTALLOC_DEVICEMAP flag was not specified at the time the memory was allocated, or if the function is called on a GPU that does not support mapped pinned memory.

For devices that have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CAN_USE_HOST_POINTER_FOR_REGISTERED_MEM, the memory can also be accessed from the device using the host pointer `p`. The device pointer returned by cuMemHostGetDevicePointer() may or may not match the original host pointer `p` and depends on the devices visible to the application. If all devices visible to the application have a non-zero value for the device attribute, the device pointer returned by cuMemHostGetDevicePointer() will match the original pointer `p`. If any device visible to the application has a zero value for the device attribute, the device pointer returned by cuMemHostGetDevicePointer() will not match the original host pointer `p`, but it will be suitable for use on all devices provided Unified Virtual Addressing is enabled. In such systems, it is valid to access the memory using either pointer on devices that have a non-zero value for the device attribute. Note however that such devices should access the memory using only one of the two pointers and not both.

`Flags` provides for future releases. For now, it must be set to 0.

CUresult cuMemHostGetFlags ( unsigned int* pFlags, void* p )


Passes back flags that were used for a pinned allocation.

######  Parameters

`pFlags`
    \- Returned flags word
`p`
    \- Host pointer

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Passes back the flags `pFlags` that were specified when allocating the pinned host buffer `p` allocated by cuMemHostAlloc.

cuMemHostGetFlags() will fail if the pointer does not reside in an allocation performed by cuMemAllocHost() or cuMemHostAlloc().

CUresult cuMemHostRegister ( void* p, size_t bytesize, unsigned int  Flags )


Registers an existing host memory range for use by CUDA.

######  Parameters

`p`
    \- Host pointer to memory to page-lock
`bytesize`
    \- Size in bytes of the address range to page-lock
`Flags`
    \- Flags for allocation request

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_HOST_MEMORY_ALREADY_REGISTERED, CUDA_ERROR_NOT_PERMITTED, CUDA_ERROR_NOT_SUPPORTED

###### Description

Page-locks the memory range specified by `p` and `bytesize` and maps it for the device(s) as specified by `Flags`. This memory range also is added to the same tracking mechanism as cuMemHostAlloc to automatically accelerate calls to functions such as cuMemcpyHtoD(). Since the memory can be accessed directly by the device, it can be read or written with much higher bandwidth than pageable memory that has not been registered. Page-locking excessive amounts of memory may degrade system performance, since it reduces the amount of memory available to the system for paging. As a result, this function is best used sparingly to register staging areas for data exchange between host and device.

On systems where CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES is true, cuMemHostRegister will not page-lock the memory range specified by `ptr` but only populate unpopulated pages.

The `Flags` parameter enables different options to be specified that affect the allocation, as follows.

  * CU_MEMHOSTREGISTER_PORTABLE: The memory returned by this call will be considered as pinned memory by all CUDA contexts, not just the one that performed the allocation.


  * CU_MEMHOSTREGISTER_DEVICEMAP: Maps the allocation into the CUDA address space. The device pointer to the memory may be obtained by calling cuMemHostGetDevicePointer().


  * CU_MEMHOSTREGISTER_IOMEMORY: The pointer is treated as pointing to some I/O memory space, e.g. the PCI Express resource of a 3rd party device.


  * CU_MEMHOSTREGISTER_READ_ONLY: The pointer is treated as pointing to memory that is considered read-only by the device. On platforms without CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS_USES_HOST_PAGE_TABLES, this flag is required in order to register memory mapped to the CPU as read-only. Support for the use of this flag can be queried from the device attribute CU_DEVICE_ATTRIBUTE_READ_ONLY_HOST_REGISTER_SUPPORTED. Using this flag with a current context associated with a device that does not have this attribute set will cause cuMemHostRegister to error with CUDA_ERROR_NOT_SUPPORTED.


All of these flags are orthogonal to one another: a developer may page-lock memory that is portable or mapped with no restrictions.

The CU_MEMHOSTREGISTER_DEVICEMAP flag may be specified on CUDA contexts for devices that do not support mapped pinned memory. The failure is deferred to cuMemHostGetDevicePointer() because the memory may be mapped into other CUDA contexts via the CU_MEMHOSTREGISTER_PORTABLE flag.

For devices that have a non-zero value for the device attribute CU_DEVICE_ATTRIBUTE_CAN_USE_HOST_POINTER_FOR_REGISTERED_MEM, the memory can also be accessed from the device using the host pointer `p`. The device pointer returned by cuMemHostGetDevicePointer() may or may not match the original host pointer `ptr` and depends on the devices visible to the application. If all devices visible to the application have a non-zero value for the device attribute, the device pointer returned by cuMemHostGetDevicePointer() will match the original pointer `ptr`. If any device visible to the application has a zero value for the device attribute, the device pointer returned by cuMemHostGetDevicePointer() will not match the original host pointer `ptr`, but it will be suitable for use on all devices provided Unified Virtual Addressing is enabled. In such systems, it is valid to access the memory using either pointer on devices that have a non-zero value for the device attribute. Note however that such devices should access the memory using only of the two pointers and not both.

The memory page-locked by this function must be unregistered with cuMemHostUnregister().

CUresult cuMemHostUnregister ( void* p )


Unregisters a memory range that was registered with cuMemHostRegister.

######  Parameters

`p`
    \- Host pointer to memory to unregister

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_HOST_MEMORY_NOT_REGISTERED

###### Description

Unmaps the memory range whose base address is specified by `p`, and makes it pageable again.

The base address must be the same one specified to cuMemHostRegister().

CUresult cuMemcpy ( CUdeviceptr dst, CUdeviceptr src, size_t ByteCount )


Copies memory.

######  Parameters

`dst`
    \- Destination unified virtual address space pointer
`src`
    \- Source unified virtual address space pointer
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies data between two pointers. `dst` and `src` are base pointers of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy. Note that this function infers the type of the transfer (host to host, host to device, device to device, or device to host) from the pointer values. This function is only allowed in contexts which support unified addressing.

  *

  * This function exhibits synchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpy2D ( const CUDA_MEMCPY2D* pCopy )


Copies memory for 2D arrays.

######  Parameters

`pCopy`
    \- Parameters for the memory copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Perform a 2D memory copy according to the parameters specified in `pCopy`. The CUDA_MEMCPY2D structure is defined as:


    ‎   typedef struct CUDA_MEMCPY2D_st {
                unsigned int srcXInBytes, srcY;
                CUmemorytype srcMemoryType;
                    const void *srcHost;
                    CUdeviceptr srcDevice;
                    CUarray srcArray;
                    unsigned int srcPitch;

                unsigned int dstXInBytes, dstY;
                CUmemorytype dstMemoryType;
                    void *dstHost;
                    CUdeviceptr dstDevice;
                    CUarray dstArray;
                    unsigned int dstPitch;

                unsigned int WidthInBytes;
                unsigned int Height;
             } CUDA_MEMCPY2D;

where:

  * srcMemoryType and dstMemoryType specify the type of memory of the source and destination, respectively; CUmemorytype_enum is defined as:




    ‎   typedef enum CUmemorytype_enum {
                CU_MEMORYTYPE_HOST = 0x01
                CU_MEMORYTYPE_DEVICE = 0x02
                CU_MEMORYTYPE_ARRAY = 0x03
                CU_MEMORYTYPE_UNIFIED = 0x04
             } CUmemorytype;

If srcMemoryType is CU_MEMORYTYPE_UNIFIED, srcDevice and srcPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. srcArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If srcMemoryType is CU_MEMORYTYPE_HOST, srcHost and srcPitch specify the (host) base address of the source data and the bytes per row to apply. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_DEVICE, srcDevice and srcPitch specify the (device) base address of the source data and the bytes per row to apply. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_ARRAY, srcArray specifies the handle of the source data. srcHost, srcDevice and srcPitch are ignored.

If dstMemoryType is CU_MEMORYTYPE_HOST, dstHost and dstPitch specify the (host) base address of the destination data and the bytes per row to apply. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_UNIFIED, dstDevice and dstPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. dstArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If dstMemoryType is CU_MEMORYTYPE_DEVICE, dstDevice and dstPitch specify the (device) base address of the destination data and the bytes per row to apply. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_ARRAY, dstArray specifies the handle of the destination data. dstHost, dstDevice and dstPitch are ignored.

  * srcXInBytes and srcY specify the base address of the source data for the copy.


For host pointers, the starting address is


    ‎  void* Start = (void*)((char*)srcHost+srcY*srcPitch + srcXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr Start = srcDevice+srcY*srcPitch+srcXInBytes;

For CUDA arrays, srcXInBytes must be evenly divisible by the array element size.

  * dstXInBytes and dstY specify the base address of the destination data for the copy.


For host pointers, the base address is


    ‎  void* dstStart = (void*)((char*)dstHost+dstY*dstPitch + dstXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr dstStart = dstDevice+dstY*dstPitch+dstXInBytes;

For CUDA arrays, dstXInBytes must be evenly divisible by the array element size.

  * WidthInBytes and Height specify the width (in bytes) and height of the 2D copy being performed.

  * If specified, srcPitch must be greater than or equal to WidthInBytes + srcXInBytes, and dstPitch must be greater than or equal to WidthInBytes + dstXInBytes.


cuMemcpy2D() returns an error if any pitch is greater than the maximum allowed (CU_DEVICE_ATTRIBUTE_MAX_PITCH). cuMemAllocPitch() passes back pitches that always work with cuMemcpy2D(). On intra-device memory copies (device to device, CUDA array to device, CUDA array to CUDA array), cuMemcpy2D() may fail for pitches not computed by cuMemAllocPitch(). cuMemcpy2DUnaligned() does not have this restriction, but may run significantly slower in the cases where cuMemcpy2D() would have returned an error code.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpy2DAsync ( const CUDA_MEMCPY2D* pCopy, CUstream hStream )


Copies memory for 2D arrays.

######  Parameters

`pCopy`
    \- Parameters for the memory copy
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Perform a 2D memory copy according to the parameters specified in `pCopy`. The CUDA_MEMCPY2D structure is defined as:


    ‎   typedef struct CUDA_MEMCPY2D_st {
                unsigned int srcXInBytes, srcY;
                CUmemorytype srcMemoryType;
                const void *srcHost;
                CUdeviceptr srcDevice;
                CUarray srcArray;
                unsigned int srcPitch;
                unsigned int dstXInBytes, dstY;
                CUmemorytype dstMemoryType;
                void *dstHost;
                CUdeviceptr dstDevice;
                CUarray dstArray;
                unsigned int dstPitch;
                unsigned int WidthInBytes;
                unsigned int Height;
             } CUDA_MEMCPY2D;

where:

  * srcMemoryType and dstMemoryType specify the type of memory of the source and destination, respectively; CUmemorytype_enum is defined as:




    ‎   typedef enum CUmemorytype_enum {
                CU_MEMORYTYPE_HOST = 0x01
                CU_MEMORYTYPE_DEVICE = 0x02
                CU_MEMORYTYPE_ARRAY = 0x03
                CU_MEMORYTYPE_UNIFIED = 0x04
             } CUmemorytype;

If srcMemoryType is CU_MEMORYTYPE_HOST, srcHost and srcPitch specify the (host) base address of the source data and the bytes per row to apply. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_UNIFIED, srcDevice and srcPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. srcArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If srcMemoryType is CU_MEMORYTYPE_DEVICE, srcDevice and srcPitch specify the (device) base address of the source data and the bytes per row to apply. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_ARRAY, srcArray specifies the handle of the source data. srcHost, srcDevice and srcPitch are ignored.

If dstMemoryType is CU_MEMORYTYPE_UNIFIED, dstDevice and dstPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. dstArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If dstMemoryType is CU_MEMORYTYPE_HOST, dstHost and dstPitch specify the (host) base address of the destination data and the bytes per row to apply. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_DEVICE, dstDevice and dstPitch specify the (device) base address of the destination data and the bytes per row to apply. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_ARRAY, dstArray specifies the handle of the destination data. dstHost, dstDevice and dstPitch are ignored.

  * srcXInBytes and srcY specify the base address of the source data for the copy.


For host pointers, the starting address is


    ‎  void* Start = (void*)((char*)srcHost+srcY*srcPitch + srcXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr Start = srcDevice+srcY*srcPitch+srcXInBytes;

For CUDA arrays, srcXInBytes must be evenly divisible by the array element size.

  * dstXInBytes and dstY specify the base address of the destination data for the copy.


For host pointers, the base address is


    ‎  void* dstStart = (void*)((char*)dstHost+dstY*dstPitch + dstXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr dstStart = dstDevice+dstY*dstPitch+dstXInBytes;

For CUDA arrays, dstXInBytes must be evenly divisible by the array element size.

  * WidthInBytes and Height specify the width (in bytes) and height of the 2D copy being performed.

  * If specified, srcPitch must be greater than or equal to WidthInBytes + srcXInBytes, and dstPitch must be greater than or equal to WidthInBytes + dstXInBytes.

  * If specified, srcPitch must be greater than or equal to WidthInBytes + srcXInBytes, and dstPitch must be greater than or equal to WidthInBytes + dstXInBytes.

  * If specified, srcHeight must be greater than or equal to Height + srcY, and dstHeight must be greater than or equal to Height \+ dstY.


cuMemcpy2DAsync() returns an error if any pitch is greater than the maximum allowed (CU_DEVICE_ATTRIBUTE_MAX_PITCH). cuMemAllocPitch() passes back pitches that always work with cuMemcpy2D(). On intra-device memory copies (device to device, CUDA array to device, CUDA array to CUDA array), cuMemcpy2DAsync() may fail for pitches not computed by cuMemAllocPitch().

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemcpy2DUnaligned ( const CUDA_MEMCPY2D* pCopy )


Copies memory for 2D arrays.

######  Parameters

`pCopy`
    \- Parameters for the memory copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Perform a 2D memory copy according to the parameters specified in `pCopy`. The CUDA_MEMCPY2D structure is defined as:


    ‎   typedef struct CUDA_MEMCPY2D_st {
                unsigned int srcXInBytes, srcY;
                CUmemorytype srcMemoryType;
                const void *srcHost;
                CUdeviceptr srcDevice;
                CUarray srcArray;
                unsigned int srcPitch;
                unsigned int dstXInBytes, dstY;
                CUmemorytype dstMemoryType;
                void *dstHost;
                CUdeviceptr dstDevice;
                CUarray dstArray;
                unsigned int dstPitch;
                unsigned int WidthInBytes;
                unsigned int Height;
             } CUDA_MEMCPY2D;

where:

  * srcMemoryType and dstMemoryType specify the type of memory of the source and destination, respectively; CUmemorytype_enum is defined as:




    ‎   typedef enum CUmemorytype_enum {
                CU_MEMORYTYPE_HOST = 0x01
                CU_MEMORYTYPE_DEVICE = 0x02
                CU_MEMORYTYPE_ARRAY = 0x03
                CU_MEMORYTYPE_UNIFIED = 0x04
             } CUmemorytype;

If srcMemoryType is CU_MEMORYTYPE_UNIFIED, srcDevice and srcPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. srcArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If srcMemoryType is CU_MEMORYTYPE_HOST, srcHost and srcPitch specify the (host) base address of the source data and the bytes per row to apply. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_DEVICE, srcDevice and srcPitch specify the (device) base address of the source data and the bytes per row to apply. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_ARRAY, srcArray specifies the handle of the source data. srcHost, srcDevice and srcPitch are ignored.

If dstMemoryType is CU_MEMORYTYPE_UNIFIED, dstDevice and dstPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. dstArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If dstMemoryType is CU_MEMORYTYPE_HOST, dstHost and dstPitch specify the (host) base address of the destination data and the bytes per row to apply. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_DEVICE, dstDevice and dstPitch specify the (device) base address of the destination data and the bytes per row to apply. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_ARRAY, dstArray specifies the handle of the destination data. dstHost, dstDevice and dstPitch are ignored.

  * srcXInBytes and srcY specify the base address of the source data for the copy.


For host pointers, the starting address is


    ‎  void* Start = (void*)((char*)srcHost+srcY*srcPitch + srcXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr Start = srcDevice+srcY*srcPitch+srcXInBytes;

For CUDA arrays, srcXInBytes must be evenly divisible by the array element size.

  * dstXInBytes and dstY specify the base address of the destination data for the copy.


For host pointers, the base address is


    ‎  void* dstStart = (void*)((char*)dstHost+dstY*dstPitch + dstXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr dstStart = dstDevice+dstY*dstPitch+dstXInBytes;

For CUDA arrays, dstXInBytes must be evenly divisible by the array element size.

  * WidthInBytes and Height specify the width (in bytes) and height of the 2D copy being performed.

  * If specified, srcPitch must be greater than or equal to WidthInBytes + srcXInBytes, and dstPitch must be greater than or equal to WidthInBytes + dstXInBytes.


cuMemcpy2D() returns an error if any pitch is greater than the maximum allowed (CU_DEVICE_ATTRIBUTE_MAX_PITCH). cuMemAllocPitch() passes back pitches that always work with cuMemcpy2D(). On intra-device memory copies (device to device, CUDA array to device, CUDA array to CUDA array), cuMemcpy2D() may fail for pitches not computed by cuMemAllocPitch(). cuMemcpy2DUnaligned() does not have this restriction, but may run significantly slower in the cases where cuMemcpy2D() would have returned an error code.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpy3D ( const CUDA_MEMCPY3D* pCopy )


Copies memory for 3D arrays.

######  Parameters

`pCopy`
    \- Parameters for the memory copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Perform a 3D memory copy according to the parameters specified in `pCopy`. The CUDA_MEMCPY3D structure is defined as:


    ‎        typedef struct CUDA_MEMCPY3D_st {

                      unsigned int srcXInBytes, srcY, srcZ;
                      unsigned int srcLOD;
                      CUmemorytype srcMemoryType;
                          const void *srcHost;
                          CUdeviceptr srcDevice;
                          CUarray srcArray;
                          unsigned int srcPitch;  // ignored when src is array
                          unsigned int srcHeight; // ignored when src is array; may be 0 if Depth==1

                      unsigned int dstXInBytes, dstY, dstZ;
                      unsigned int dstLOD;
                      CUmemorytype dstMemoryType;
                          void *dstHost;
                          CUdeviceptr dstDevice;
                          CUarray dstArray;
                          unsigned int dstPitch;  // ignored when dst is array
                          unsigned int dstHeight; // ignored when dst is array; may be 0 if Depth==1

                      unsigned int WidthInBytes;
                      unsigned int Height;
                      unsigned int Depth;
                  } CUDA_MEMCPY3D;

where:

  * srcMemoryType and dstMemoryType specify the type of memory of the source and destination, respectively; CUmemorytype_enum is defined as:




    ‎   typedef enum CUmemorytype_enum {
                CU_MEMORYTYPE_HOST = 0x01
                CU_MEMORYTYPE_DEVICE = 0x02
                CU_MEMORYTYPE_ARRAY = 0x03
                CU_MEMORYTYPE_UNIFIED = 0x04
             } CUmemorytype;

If srcMemoryType is CU_MEMORYTYPE_UNIFIED, srcDevice and srcPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. srcArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If srcMemoryType is CU_MEMORYTYPE_HOST, srcHost, srcPitch and srcHeight specify the (host) base address of the source data, the bytes per row, and the height of each 2D slice of the 3D array. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_DEVICE, srcDevice, srcPitch and srcHeight specify the (device) base address of the source data, the bytes per row, and the height of each 2D slice of the 3D array. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_ARRAY, srcArray specifies the handle of the source data. srcHost, srcDevice, srcPitch and srcHeight are ignored.

If dstMemoryType is CU_MEMORYTYPE_UNIFIED, dstDevice and dstPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. dstArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If dstMemoryType is CU_MEMORYTYPE_HOST, dstHost and dstPitch specify the (host) base address of the destination data, the bytes per row, and the height of each 2D slice of the 3D array. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_DEVICE, dstDevice and dstPitch specify the (device) base address of the destination data, the bytes per row, and the height of each 2D slice of the 3D array. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_ARRAY, dstArray specifies the handle of the destination data. dstHost, dstDevice, dstPitch and dstHeight are ignored.

  * srcXInBytes, srcY and srcZ specify the base address of the source data for the copy.


For host pointers, the starting address is


    ‎  void* Start = (void*)((char*)srcHost+(srcZ*srcHeight+srcY)*srcPitch + srcXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr Start = srcDevice+(srcZ*srcHeight+srcY)*srcPitch+srcXInBytes;

For CUDA arrays, srcXInBytes must be evenly divisible by the array element size.

  * dstXInBytes, dstY and dstZ specify the base address of the destination data for the copy.


For host pointers, the base address is


    ‎  void* dstStart = (void*)((char*)dstHost+(dstZ*dstHeight+dstY)*dstPitch + dstXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr dstStart = dstDevice+(dstZ*dstHeight+dstY)*dstPitch+dstXInBytes;

For CUDA arrays, dstXInBytes must be evenly divisible by the array element size.

  * WidthInBytes, Height and Depth specify the width (in bytes), height and depth of the 3D copy being performed.

  * If specified, srcPitch must be greater than or equal to WidthInBytes + srcXInBytes, and dstPitch must be greater than or equal to WidthInBytes + dstXInBytes.

  * If specified, srcHeight must be greater than or equal to Height + srcY, and dstHeight must be greater than or equal to Height \+ dstY.


cuMemcpy3D() returns an error if any pitch is greater than the maximum allowed (CU_DEVICE_ATTRIBUTE_MAX_PITCH).

The srcLOD and dstLOD members of the CUDA_MEMCPY3D structure must be set to 0.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpy3DAsync ( const CUDA_MEMCPY3D* pCopy, CUstream hStream )


Copies memory for 3D arrays.

######  Parameters

`pCopy`
    \- Parameters for the memory copy
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Perform a 3D memory copy according to the parameters specified in `pCopy`. The CUDA_MEMCPY3D structure is defined as:


    ‎        typedef struct CUDA_MEMCPY3D_st {

                      unsigned int srcXInBytes, srcY, srcZ;
                      unsigned int srcLOD;
                      CUmemorytype srcMemoryType;
                          const void *srcHost;
                          CUdeviceptr srcDevice;
                          CUarray srcArray;
                          unsigned int srcPitch;  // ignored when src is array
                          unsigned int srcHeight; // ignored when src is array; may be 0 if Depth==1

                      unsigned int dstXInBytes, dstY, dstZ;
                      unsigned int dstLOD;
                      CUmemorytype dstMemoryType;
                          void *dstHost;
                          CUdeviceptr dstDevice;
                          CUarray dstArray;
                          unsigned int dstPitch;  // ignored when dst is array
                          unsigned int dstHeight; // ignored when dst is array; may be 0 if Depth==1

                      unsigned int WidthInBytes;
                      unsigned int Height;
                      unsigned int Depth;
                  } CUDA_MEMCPY3D;

where:

  * srcMemoryType and dstMemoryType specify the type of memory of the source and destination, respectively; CUmemorytype_enum is defined as:




    ‎   typedef enum CUmemorytype_enum {
                CU_MEMORYTYPE_HOST = 0x01
                CU_MEMORYTYPE_DEVICE = 0x02
                CU_MEMORYTYPE_ARRAY = 0x03
                CU_MEMORYTYPE_UNIFIED = 0x04
             } CUmemorytype;

If srcMemoryType is CU_MEMORYTYPE_UNIFIED, srcDevice and srcPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. srcArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If srcMemoryType is CU_MEMORYTYPE_HOST, srcHost, srcPitch and srcHeight specify the (host) base address of the source data, the bytes per row, and the height of each 2D slice of the 3D array. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_DEVICE, srcDevice, srcPitch and srcHeight specify the (device) base address of the source data, the bytes per row, and the height of each 2D slice of the 3D array. srcArray is ignored.

If srcMemoryType is CU_MEMORYTYPE_ARRAY, srcArray specifies the handle of the source data. srcHost, srcDevice, srcPitch and srcHeight are ignored.

If dstMemoryType is CU_MEMORYTYPE_UNIFIED, dstDevice and dstPitch specify the (unified virtual address space) base address of the source data and the bytes per row to apply. dstArray is ignored. This value may be used only if unified addressing is supported in the calling context.

If dstMemoryType is CU_MEMORYTYPE_HOST, dstHost and dstPitch specify the (host) base address of the destination data, the bytes per row, and the height of each 2D slice of the 3D array. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_DEVICE, dstDevice and dstPitch specify the (device) base address of the destination data, the bytes per row, and the height of each 2D slice of the 3D array. dstArray is ignored.

If dstMemoryType is CU_MEMORYTYPE_ARRAY, dstArray specifies the handle of the destination data. dstHost, dstDevice, dstPitch and dstHeight are ignored.

  * srcXInBytes, srcY and srcZ specify the base address of the source data for the copy.


For host pointers, the starting address is


    ‎  void* Start = (void*)((char*)srcHost+(srcZ*srcHeight+srcY)*srcPitch + srcXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr Start = srcDevice+(srcZ*srcHeight+srcY)*srcPitch+srcXInBytes;

For CUDA arrays, srcXInBytes must be evenly divisible by the array element size.

  * dstXInBytes, dstY and dstZ specify the base address of the destination data for the copy.


For host pointers, the base address is


    ‎  void* dstStart = (void*)((char*)dstHost+(dstZ*dstHeight+dstY)*dstPitch + dstXInBytes);

For device pointers, the starting address is


    ‎  CUdeviceptr dstStart = dstDevice+(dstZ*dstHeight+dstY)*dstPitch+dstXInBytes;

For CUDA arrays, dstXInBytes must be evenly divisible by the array element size.

  * WidthInBytes, Height and Depth specify the width (in bytes), height and depth of the 3D copy being performed.

  * If specified, srcPitch must be greater than or equal to WidthInBytes + srcXInBytes, and dstPitch must be greater than or equal to WidthInBytes + dstXInBytes.

  * If specified, srcHeight must be greater than or equal to Height + srcY, and dstHeight must be greater than or equal to Height \+ dstY.


cuMemcpy3DAsync() returns an error if any pitch is greater than the maximum allowed (CU_DEVICE_ATTRIBUTE_MAX_PITCH).

The srcLOD and dstLOD members of the CUDA_MEMCPY3D structure must be set to 0.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemcpy3DBatchAsync ( size_t numOps, CUDA_MEMCPY3D_BATCH_OP* opList, unsigned long long flags, CUstream hStream )


Performs a batch of 3D memory copies asynchronously.

######  Parameters

`numOps`
    \- Total number of memcpy operations.
`opList`
    \- Array of size `numOps` containing the actual memcpy operations.
`flags`
    \- Flags for future use, must be zero now.
`hStream`
    \- The stream to enqueue the operations in. Must not be default NULL stream.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Performs a batch of memory copies. The batch as a whole executes in stream order but copies within a batch are not guaranteed to execute in any specific order. Note that this means specifying any dependent copies within a batch will result in undefined behavior.

Performs memory copies as specified in the `opList` array. The length of this array is specified in `numOps`. Each entry in this array describes a copy operation. This includes among other things, the source and destination operands for the copy as specified in CUDA_MEMCPY3D_BATCH_OP::src and CUDA_MEMCPY3D_BATCH_OP::dst respectively. The source and destination operands of a copy can either be a pointer or a CUDA array. The width, height and depth of a copy is specified in CUDA_MEMCPY3D_BATCH_OP::extent. The width, height and depth of a copy are specified in elements and must not be zero. For pointer-to-pointer copies, the element size is considered to be 1. For pointer to CUDA array or vice versa copies, the element size is determined by the CUDA array. For CUDA array to CUDA array copies, the element size of the two CUDA arrays must match.

For a given operand, if CUmemcpy3DOperand::type is specified as CU_MEMCPY_OPERAND_TYPE_POINTER, then CUmemcpy3DOperand::op::ptr will be used. The CUmemcpy3DOperand::op::ptr::ptr field must contain the pointer where the copy should begin. The CUmemcpy3DOperand::op::ptr::rowLength field specifies the length of each row in elements and must either be zero or be greater than or equal to the width of the copy specified in CUDA_MEMCPY3D_BATCH_OP::extent::width. The CUmemcpy3DOperand::op::ptr::layerHeight field specifies the height of each layer and must either be zero or be greater than or equal to the height of the copy specified in CUDA_MEMCPY3D_BATCH_OP::extent::height. When either of these values is zero, that aspect of the operand is considered to be tightly packed according to the copy extent. For managed memory pointers on devices where CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS is true or system-allocated pageable memory on devices where CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS is true, the CUmemcpy3DOperand::op::ptr::locHint field can be used to hint the location of the operand.

If an operand's type is specified as CU_MEMCPY_OPERAND_TYPE_ARRAY, then CUmemcpy3DOperand::op::array will be used. The CUmemcpy3DOperand::op::array::array field specifies the CUDA array and CUmemcpy3DOperand::op::array::offset specifies the 3D offset into that array where the copy begins.

The CUmemcpyAttributes::srcAccessOrder indicates the source access ordering to be observed for copies associated with the attribute. If the source access order is set to CU_MEMCPY_SRC_ACCESS_ORDER_STREAM, then the source will be accessed in stream order. If the source access order is set to CU_MEMCPY_SRC_ACCESS_ORDER_DURING_API_CALL then it indicates that access to the source pointer can be out of stream order and all accesses must be complete before the API call returns. This flag is suited for ephemeral sources (ex., stack variables) when it's known that no prior operations in the stream can be accessing the memory and also that the lifetime of the memory is limited to the scope that the source variable was declared in. Specifying this flag allows the driver to optimize the copy and removes the need for the user to synchronize the stream after the API call. If the source access order is set to CU_MEMCPY_SRC_ACCESS_ORDER_ANY then it indicates that access to the source pointer can be out of stream order and the accesses can happen even after the API call returns. This flag is suited for host pointers allocated outside CUDA (ex., via malloc) when it's known that no prior operations in the stream can be accessing the memory. Specifying this flag allows the driver to optimize the copy on certain platforms. Each memcopy operation in `opList` must have a valid srcAccessOrder setting, otherwise this API will return CUDA_ERROR_INVALID_VALUE.

The CUmemcpyAttributes::flags field can be used to specify certain flags for copies. Setting the CU_MEMCPY_FLAG_PREFER_OVERLAP_WITH_COMPUTE flag indicates that the associated copies should preferably overlap with any compute work. Note that this flag is a hint and can be ignored depending on the platform and other parameters of the copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpy3DPeer ( const CUDA_MEMCPY3D_PEER* pCopy )


Copies memory between contexts.

######  Parameters

`pCopy`
    \- Parameters for the memory copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Perform a 3D memory copy according to the parameters specified in `pCopy`. See the definition of the CUDA_MEMCPY3D_PEER structure for documentation of its parameters.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpy3DPeerAsync ( const CUDA_MEMCPY3D_PEER* pCopy, CUstream hStream )


Copies memory between contexts asynchronously.

######  Parameters

`pCopy`
    \- Parameters for the memory copy
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Perform a 3D memory copy according to the parameters specified in `pCopy`. See the definition of the CUDA_MEMCPY3D_PEER structure for documentation of its parameters.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemcpyAsync ( CUdeviceptr dst, CUdeviceptr src, size_t ByteCount, CUstream hStream )


Copies memory asynchronously.

######  Parameters

`dst`
    \- Destination unified virtual address space pointer
`src`
    \- Source unified virtual address space pointer
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies data between two pointers. `dst` and `src` are base pointers of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy. Note that this function infers the type of the transfer (host to host, host to device, device to device, or device to host) from the pointer values. This function is only allowed in contexts which support unified addressing.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyAtoA ( CUarray dstArray, size_t dstOffset, CUarray srcArray, size_t srcOffset, size_t ByteCount )


Copies memory from Array to Array.

######  Parameters

`dstArray`
    \- Destination array
`dstOffset`
    \- Offset in bytes of destination array
`srcArray`
    \- Source array
`srcOffset`
    \- Offset in bytes of source array
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from one 1D CUDA array to another. `dstArray` and `srcArray` specify the handles of the destination and source CUDA arrays for the copy, respectively. `dstOffset` and `srcOffset` specify the destination and source offsets in bytes into the CUDA arrays. `ByteCount` is the number of bytes to be copied. The size of the elements in the CUDA arrays need not be the same format, but the elements must be the same size; and count must be evenly divisible by that size.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpyAtoD ( CUdeviceptr dstDevice, CUarray srcArray, size_t srcOffset, size_t ByteCount )


Copies memory from Array to Device.

######  Parameters

`dstDevice`
    \- Destination device pointer
`srcArray`
    \- Source array
`srcOffset`
    \- Offset in bytes of source array
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from one 1D CUDA array to device memory. `dstDevice` specifies the base pointer of the destination and must be naturally aligned with the CUDA array elements. `srcArray` and `srcOffset` specify the CUDA array handle and the offset in bytes into the array where the copy is to begin. `ByteCount` specifies the number of bytes to copy and must be evenly divisible by the array element size.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpyAtoH ( void* dstHost, CUarray srcArray, size_t srcOffset, size_t ByteCount )


Copies memory from Array to Host.

######  Parameters

`dstHost`
    \- Destination device pointer
`srcArray`
    \- Source array
`srcOffset`
    \- Offset in bytes of source array
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from one 1D CUDA array to host memory. `dstHost` specifies the base pointer of the destination. `srcArray` and `srcOffset` specify the CUDA array handle and starting offset in bytes of the source data. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyAtoHAsync ( void* dstHost, CUarray srcArray, size_t srcOffset, size_t ByteCount, CUstream hStream )


Copies memory from Array to Host.

######  Parameters

`dstHost`
    \- Destination pointer
`srcArray`
    \- Source array
`srcOffset`
    \- Offset in bytes of source array
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies from one 1D CUDA array to host memory. `dstHost` specifies the base pointer of the destination. `srcArray` and `srcOffset` specify the CUDA array handle and starting offset in bytes of the source data. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyBatchAsync ( CUdeviceptr* dsts, CUdeviceptr* srcs, size_t* sizes, size_t count, CUmemcpyAttributes* attrs, size_t* attrsIdxs, size_t numAttrs, CUstream hStream )


Performs a batch of memory copies asynchronously.

######  Parameters

`dsts`
    \- Array of destination pointers.
`srcs`
    \- Array of memcpy source pointers.
`sizes`
    \- Array of sizes for memcpy operations.
`count`
    \- Size of `dsts`, `srcs` and `sizes` arrays
`attrs`
    \- Array of memcpy attributes.
`attrsIdxs`
    \- Array of indices to specify which copies each entry in the `attrs` array applies to. The attributes specified in attrs[k] will be applied to copies starting from attrsIdxs[k] through attrsIdxs[k+1] \- 1. Also attrs[numAttrs-1] will apply to copies starting from attrsIdxs[numAttrs-1] through count - 1.
`numAttrs`
    \- Size of `attrs` and `attrsIdxs` arrays.
`hStream`
    \- The stream to enqueue the operations in. Must not be legacy NULL stream.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Performs a batch of memory copies. The batch as a whole executes in stream order but copies within a batch are not guaranteed to execute in any specific order. This API only supports pointer-to-pointer copies. For copies involving CUDA arrays, please see cuMemcpy3DBatchAsync.

Performs memory copies from source buffers specified in `srcs` to destination buffers specified in `dsts`. The size of each copy is specified in `sizes`. All three arrays must be of the same length as specified by `count`. Since there are no ordering guarantees for copies within a batch, specifying any dependent copies within a batch will result in undefined behavior.

Every copy in the batch has to be associated with a set of attributes specified in the `attrs` array. Each entry in this array can apply to more than one copy. This can be done by specifying in the `attrsIdxs` array, the index of the first copy that the corresponding entry in the `attrs` array applies to. Both `attrs` and `attrsIdxs` must be of the same length as specified by `numAttrs`. For example, if a batch has 10 copies listed in dst/src/sizes, the first 6 of which have one set of attributes and the remaining 4 another, then `numAttrs` will be 2, `attrsIdxs` will be {0, 6} and `attrs` will contains the two sets of attributes. Note that the first entry in `attrsIdxs` must always be 0. Also, each entry must be greater than the previous entry and the last entry should be less than `count`. Furthermore, `numAttrs` must be lesser than or equal to `count`.

The CUmemcpyAttributes::srcAccessOrder indicates the source access ordering to be observed for copies associated with the attribute. If the source access order is set to CU_MEMCPY_SRC_ACCESS_ORDER_STREAM, then the source will be accessed in stream order. If the source access order is set to CU_MEMCPY_SRC_ACCESS_ORDER_DURING_API_CALL then it indicates that access to the source pointer can be out of stream order and all accesses must be complete before the API call returns. This flag is suited for ephemeral sources (ex., stack variables) when it's known that no prior operations in the stream can be accessing the memory and also that the lifetime of the memory is limited to the scope that the source variable was declared in. Specifying this flag allows the driver to optimize the copy and removes the need for the user to synchronize the stream after the API call. If the source access order is set to CU_MEMCPY_SRC_ACCESS_ORDER_ANY then it indicates that access to the source pointer can be out of stream order and the accesses can happen even after the API call returns. This flag is suited for host pointers allocated outside CUDA (ex., via malloc) when it's known that no prior operations in the stream can be accessing the memory. Specifying this flag allows the driver to optimize the copy on certain platforms. Each memcpy operation in the batch must have a valid CUmemcpyAttributes corresponding to it including the appropriate srcAccessOrder setting, otherwise the API will return CUDA_ERROR_INVALID_VALUE.

The CUmemcpyAttributes::srcLocHint and CUmemcpyAttributes::dstLocHint allows applications to specify hint locations for operands of a copy when the operand doesn't have a fixed location. That is, these hints are only applicable for managed memory pointers on devices where CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS is true or system-allocated pageable memory on devices where CU_DEVICE_ATTRIBUTE_PAGEABLE_MEMORY_ACCESS is true. For other cases, these hints are ignored.

The CUmemcpyAttributes::flags field can be used to specify certain flags for copies. Setting the CU_MEMCPY_FLAG_PREFER_OVERLAP_WITH_COMPUTE flag indicates that the associated copies should preferably overlap with any compute work. Note that this flag is a hint and can be ignored depending on the platform and other parameters of the copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyDtoA ( CUarray dstArray, size_t dstOffset, CUdeviceptr srcDevice, size_t ByteCount )


Copies memory from Device to Array.

######  Parameters

`dstArray`
    \- Destination array
`dstOffset`
    \- Offset in bytes of destination array
`srcDevice`
    \- Source device pointer
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from device memory to a 1D CUDA array. `dstArray` and `dstOffset` specify the CUDA array handle and starting index of the destination data. `srcDevice` specifies the base pointer of the source. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpyDtoD ( CUdeviceptr dstDevice, CUdeviceptr srcDevice, size_t ByteCount )


Copies memory from Device to Device.

######  Parameters

`dstDevice`
    \- Destination device pointer
`srcDevice`
    \- Source device pointer
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from device memory to device memory. `dstDevice` and `srcDevice` are the base pointers of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpyDtoDAsync ( CUdeviceptr dstDevice, CUdeviceptr srcDevice, size_t ByteCount, CUstream hStream )


Copies memory from Device to Device.

######  Parameters

`dstDevice`
    \- Destination device pointer
`srcDevice`
    \- Source device pointer
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies from device memory to device memory. `dstDevice` and `srcDevice` are the base pointers of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemcpyDtoH ( void* dstHost, CUdeviceptr srcDevice, size_t ByteCount )


Copies memory from Device to Host.

######  Parameters

`dstHost`
    \- Destination host pointer
`srcDevice`
    \- Source device pointer
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from device to host memory. `dstHost` and `srcDevice` specify the base pointers of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyDtoHAsync ( void* dstHost, CUdeviceptr srcDevice, size_t ByteCount, CUstream hStream )


Copies memory from Device to Host.

######  Parameters

`dstHost`
    \- Destination host pointer
`srcDevice`
    \- Source device pointer
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies from device to host memory. `dstHost` and `srcDevice` specify the base pointers of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyHtoA ( CUarray dstArray, size_t dstOffset, const void* srcHost, size_t ByteCount )


Copies memory from Host to Array.

######  Parameters

`dstArray`
    \- Destination array
`dstOffset`
    \- Offset in bytes of destination array
`srcHost`
    \- Source host pointer
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from host memory to a 1D CUDA array. `dstArray` and `dstOffset` specify the CUDA array handle and starting offset in bytes of the destination data. `pSrc` specifies the base address of the source. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyHtoAAsync ( CUarray dstArray, size_t dstOffset, const void* srcHost, size_t ByteCount, CUstream hStream )


Copies memory from Host to Array.

######  Parameters

`dstArray`
    \- Destination array
`dstOffset`
    \- Offset in bytes of destination array
`srcHost`
    \- Source host pointer
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies from host memory to a 1D CUDA array. `dstArray` and `dstOffset` specify the CUDA array handle and starting offset in bytes of the destination data. `srcHost` specifies the base address of the source. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyHtoD ( CUdeviceptr dstDevice, const void* srcHost, size_t ByteCount )


Copies memory from Host to Device.

######  Parameters

`dstDevice`
    \- Destination device pointer
`srcHost`
    \- Source host pointer
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from host memory to device memory. `dstDevice` and `srcHost` are the base addresses of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyHtoDAsync ( CUdeviceptr dstDevice, const void* srcHost, size_t ByteCount, CUstream hStream )


Copies memory from Host to Device.

######  Parameters

`dstDevice`
    \- Destination device pointer
`srcHost`
    \- Source host pointer
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies from host memory to device memory. `dstDevice` and `srcHost` are the base addresses of the destination and source, respectively. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.

  * Memory regions requested must be either entirely registered with CUDA, or in the case of host pageable transfers, not registered at all. Memory regions spanning over allocations that are both registered and not registered with CUDA are not supported and will return CUDA_ERROR_INVALID_VALUE.


CUresult cuMemcpyPeer ( CUdeviceptr dstDevice, CUcontext dstContext, CUdeviceptr srcDevice, CUcontext srcContext, size_t ByteCount )


Copies device memory between two contexts.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstContext`
    \- Destination context
`srcDevice`
    \- Source device pointer
`srcContext`
    \- Source context
`ByteCount`
    \- Size of memory copy in bytes

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Copies from device memory in one context to device memory in another context. `dstDevice` is the base device pointer of the destination memory and `dstContext` is the destination context. `srcDevice` is the base device pointer of the source memory and `srcContext` is the source pointer. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits synchronous behavior for most use cases.


CUresult cuMemcpyPeerAsync ( CUdeviceptr dstDevice, CUcontext dstContext, CUdeviceptr srcDevice, CUcontext srcContext, size_t ByteCount, CUstream hStream )


Copies device memory between two contexts asynchronously.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstContext`
    \- Destination context
`srcDevice`
    \- Source device pointer
`srcContext`
    \- Source context
`ByteCount`
    \- Size of memory copy in bytes
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Copies from device memory in one context to device memory in another context. `dstDevice` is the base device pointer of the destination memory and `dstContext` is the destination context. `srcDevice` is the base device pointer of the source memory and `srcContext` is the source pointer. `ByteCount` specifies the number of bytes to copy.

  *

  * This function exhibits asynchronous behavior for most use cases.

  * This function uses standard default stream semantics.


CUresult cuMemsetD16 ( CUdeviceptr dstDevice, unsigned short us, size_t N )


Initializes device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`us`
    \- Value to set
`N`
    \- Number of elements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the memory range of `N` 16-bit values to the specified value `us`. The `dstDevice` pointer must be two byte aligned.

  *

  * See also memset synchronization details.


CUresult cuMemsetD16Async ( CUdeviceptr dstDevice, unsigned short us, size_t N, CUstream hStream )


Sets device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`us`
    \- Value to set
`N`
    \- Number of elements
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the memory range of `N` 16-bit values to the specified value `us`. The `dstDevice` pointer must be two byte aligned.

  *

  * See also memset synchronization details.

  * This function uses standard default stream semantics.


CUresult cuMemsetD2D16 ( CUdeviceptr dstDevice, size_t dstPitch, unsigned short us, size_t Width, size_t Height )


Initializes device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstPitch`
    \- Pitch of destination device pointer(Unused if `Height` is 1)
`us`
    \- Value to set
`Width`
    \- Width of row
`Height`
    \- Number of rows

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the 2D memory range of `Width` 16-bit values to the specified value `us`. `Height` specifies the number of rows to set, and `dstPitch` specifies the number of bytes between each row. The `dstDevice` pointer and `dstPitch` offset must be two byte aligned. This function performs fastest when the pitch is one that has been passed back by cuMemAllocPitch().

  *

  * See also memset synchronization details.


CUresult cuMemsetD2D16Async ( CUdeviceptr dstDevice, size_t dstPitch, unsigned short us, size_t Width, size_t Height, CUstream hStream )


Sets device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstPitch`
    \- Pitch of destination device pointer(Unused if `Height` is 1)
`us`
    \- Value to set
`Width`
    \- Width of row
`Height`
    \- Number of rows
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the 2D memory range of `Width` 16-bit values to the specified value `us`. `Height` specifies the number of rows to set, and `dstPitch` specifies the number of bytes between each row. The `dstDevice` pointer and `dstPitch` offset must be two byte aligned. This function performs fastest when the pitch is one that has been passed back by cuMemAllocPitch().

  *

  * See also memset synchronization details.

  * This function uses standard default stream semantics.


CUresult cuMemsetD2D32 ( CUdeviceptr dstDevice, size_t dstPitch, unsigned int  ui, size_t Width, size_t Height )


Initializes device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstPitch`
    \- Pitch of destination device pointer(Unused if `Height` is 1)
`ui`
    \- Value to set
`Width`
    \- Width of row
`Height`
    \- Number of rows

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the 2D memory range of `Width` 32-bit values to the specified value `ui`. `Height` specifies the number of rows to set, and `dstPitch` specifies the number of bytes between each row. The `dstDevice` pointer and `dstPitch` offset must be four byte aligned. This function performs fastest when the pitch is one that has been passed back by cuMemAllocPitch().

  *

  * See also memset synchronization details.


CUresult cuMemsetD2D32Async ( CUdeviceptr dstDevice, size_t dstPitch, unsigned int  ui, size_t Width, size_t Height, CUstream hStream )


Sets device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstPitch`
    \- Pitch of destination device pointer(Unused if `Height` is 1)
`ui`
    \- Value to set
`Width`
    \- Width of row
`Height`
    \- Number of rows
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the 2D memory range of `Width` 32-bit values to the specified value `ui`. `Height` specifies the number of rows to set, and `dstPitch` specifies the number of bytes between each row. The `dstDevice` pointer and `dstPitch` offset must be four byte aligned. This function performs fastest when the pitch is one that has been passed back by cuMemAllocPitch().

  *

  * See also memset synchronization details.

  * This function uses standard default stream semantics.


CUresult cuMemsetD2D8 ( CUdeviceptr dstDevice, size_t dstPitch, unsigned char  uc, size_t Width, size_t Height )


Initializes device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstPitch`
    \- Pitch of destination device pointer(Unused if `Height` is 1)
`uc`
    \- Value to set
`Width`
    \- Width of row
`Height`
    \- Number of rows

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the 2D memory range of `Width` 8-bit values to the specified value `uc`. `Height` specifies the number of rows to set, and `dstPitch` specifies the number of bytes between each row. This function performs fastest when the pitch is one that has been passed back by cuMemAllocPitch().

  *

  * See also memset synchronization details.


CUresult cuMemsetD2D8Async ( CUdeviceptr dstDevice, size_t dstPitch, unsigned char  uc, size_t Width, size_t Height, CUstream hStream )


Sets device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`dstPitch`
    \- Pitch of destination device pointer(Unused if `Height` is 1)
`uc`
    \- Value to set
`Width`
    \- Width of row
`Height`
    \- Number of rows
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the 2D memory range of `Width` 8-bit values to the specified value `uc`. `Height` specifies the number of rows to set, and `dstPitch` specifies the number of bytes between each row. This function performs fastest when the pitch is one that has been passed back by cuMemAllocPitch().

  *

  * See also memset synchronization details.

  * This function uses standard default stream semantics.


CUresult cuMemsetD32 ( CUdeviceptr dstDevice, unsigned int  ui, size_t N )


Initializes device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`ui`
    \- Value to set
`N`
    \- Number of elements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the memory range of `N` 32-bit values to the specified value `ui`. The `dstDevice` pointer must be four byte aligned.

  *

  * See also memset synchronization details.


CUresult cuMemsetD32Async ( CUdeviceptr dstDevice, unsigned int  ui, size_t N, CUstream hStream )


Sets device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`ui`
    \- Value to set
`N`
    \- Number of elements
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the memory range of `N` 32-bit values to the specified value `ui`. The `dstDevice` pointer must be four byte aligned.

  *

  * See also memset synchronization details.

  * This function uses standard default stream semantics.


CUresult cuMemsetD8 ( CUdeviceptr dstDevice, unsigned char  uc, size_t N )


Initializes device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`uc`
    \- Value to set
`N`
    \- Number of elements

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the memory range of `N` 8-bit values to the specified value `uc`.

  *

  * See also memset synchronization details.


CUresult cuMemsetD8Async ( CUdeviceptr dstDevice, unsigned char  uc, size_t N, CUstream hStream )


Sets device memory.

######  Parameters

`dstDevice`
    \- Destination device pointer
`uc`
    \- Value to set
`N`
    \- Number of elements
`hStream`
    \- Stream identifier

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the memory range of `N` 8-bit values to the specified value `uc`.

  *

  * See also memset synchronization details.

  * This function uses standard default stream semantics.


CUresult cuMipmappedArrayCreate ( CUmipmappedArray* pHandle, const CUDA_ARRAY3D_DESCRIPTOR* pMipmappedArrayDesc, unsigned int  numMipmapLevels )


Creates a CUDA mipmapped array.

######  Parameters

`pHandle`
    \- Returned mipmapped array
`pMipmappedArrayDesc`
    \- mipmapped array descriptor
`numMipmapLevels`
    \- Number of mipmap levels

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY, CUDA_ERROR_UNKNOWN

###### Description

Creates a CUDA mipmapped array according to the CUDA_ARRAY3D_DESCRIPTOR structure `pMipmappedArrayDesc` and returns a handle to the new CUDA mipmapped array in `*pHandle`. `numMipmapLevels` specifies the number of mipmap levels to be allocated. This value is clamped to the range [1, 1 + floor(log2(max(width, height, depth)))].

The CUDA_ARRAY3D_DESCRIPTOR is defined as:


    ‎    typedef struct {
                  unsigned int Width;
                  unsigned int Height;
                  unsigned int Depth;
                  CUarray_format Format;
                  unsigned int NumChannels;
                  unsigned int Flags;
              } CUDA_ARRAY3D_DESCRIPTOR;

where:

  * `Width`, `Height`, and `Depth` are the width, height, and depth of the CUDA array (in elements); the following types of CUDA arrays can be allocated:
    * A 1D mipmapped array is allocated if `Height` and `Depth` extents are both zero.

    * A 2D mipmapped array is allocated if only `Depth` extent is zero.

    * A 3D mipmapped array is allocated if all three extents are non-zero.

    * A 1D layered CUDA mipmapped array is allocated if only `Height` is zero and the CUDA_ARRAY3D_LAYERED flag is set. Each layer is a 1D array. The number of layers is determined by the depth extent.

    * A 2D layered CUDA mipmapped array is allocated if all three extents are non-zero and the CUDA_ARRAY3D_LAYERED flag is set. Each layer is a 2D array. The number of layers is determined by the depth extent.

    * A cubemap CUDA mipmapped array is allocated if all three extents are non-zero and the CUDA_ARRAY3D_CUBEMAP flag is set. `Width` must be equal to `Height`, and `Depth` must be six. A cubemap is a special type of 2D layered CUDA array, where the six layers represent the six faces of a cube. The order of the six layers in memory is the same as that listed in CUarray_cubemap_face.

    * A cubemap layered CUDA mipmapped array is allocated if all three extents are non-zero, and both, CUDA_ARRAY3D_CUBEMAP and CUDA_ARRAY3D_LAYERED flags are set. `Width` must be equal to `Height`, and `Depth` must be a multiple of six. A cubemap layered CUDA array is a special type of 2D layered CUDA array that consists of a collection of cubemaps. The first six layers represent the first cubemap, the next six layers form the second cubemap, and so on.


  * Format specifies the format of the elements; CUarray_format is defined as:

        ‎    typedef enum CUarray_format_enum {
                      CU_AD_FORMAT_UNSIGNED_INT8 = 0x01
                      CU_AD_FORMAT_UNSIGNED_INT16 = 0x02
                      CU_AD_FORMAT_UNSIGNED_INT32 = 0x03
                      CU_AD_FORMAT_SIGNED_INT8 = 0x08
                      CU_AD_FORMAT_SIGNED_INT16 = 0x09
                      CU_AD_FORMAT_SIGNED_INT32 = 0x0a
                      CU_AD_FORMAT_HALF = 0x10
                      CU_AD_FORMAT_FLOAT = 0x20
                      CU_AD_FORMAT_NV12 = 0xb0
                      CU_AD_FORMAT_UNORM_INT8X1 = 0xc0
                      CU_AD_FORMAT_UNORM_INT8X2 = 0xc1
                      CU_AD_FORMAT_UNORM_INT8X4 = 0xc2
                      CU_AD_FORMAT_UNORM_INT16X1 = 0xc3
                      CU_AD_FORMAT_UNORM_INT16X2 = 0xc4
                      CU_AD_FORMAT_UNORM_INT16X4 = 0xc5
                      CU_AD_FORMAT_SNORM_INT8X1 = 0xc6
                      CU_AD_FORMAT_SNORM_INT8X2 = 0xc7
                      CU_AD_FORMAT_SNORM_INT8X4 = 0xc8
                      CU_AD_FORMAT_SNORM_INT16X1 = 0xc9
                      CU_AD_FORMAT_SNORM_INT16X2 = 0xca
                      CU_AD_FORMAT_SNORM_INT16X4 = 0xcb
                      CU_AD_FORMAT_BC1_UNORM = 0x91
                      CU_AD_FORMAT_BC1_UNORM_SRGB = 0x92
                      CU_AD_FORMAT_BC2_UNORM = 0x93
                      CU_AD_FORMAT_BC2_UNORM_SRGB = 0x94
                      CU_AD_FORMAT_BC3_UNORM = 0x95
                      CU_AD_FORMAT_BC3_UNORM_SRGB = 0x96
                      CU_AD_FORMAT_BC4_UNORM = 0x97
                      CU_AD_FORMAT_BC4_SNORM = 0x98
                      CU_AD_FORMAT_BC5_UNORM = 0x99
                      CU_AD_FORMAT_BC5_SNORM = 0x9a
                      CU_AD_FORMAT_BC6H_UF16 = 0x9b
                      CU_AD_FORMAT_BC6H_SF16 = 0x9c
                      CU_AD_FORMAT_BC7_UNORM = 0x9d
                      CU_AD_FORMAT_BC7_UNORM_SRGB = 0x9e
                      CU_AD_FORMAT_P010 = 0x9f
                      CU_AD_FORMAT_P016 = 0xa1
                      CU_AD_FORMAT_NV16 = 0xa2
                      CU_AD_FORMAT_P210 = 0xa3
                      CU_AD_FORMAT_P216 = 0xa4
                      CU_AD_FORMAT_YUY2 = 0xa5
                      CU_AD_FORMAT_Y210 = 0xa6
                      CU_AD_FORMAT_Y216 = 0xa7
                      CU_AD_FORMAT_AYUV = 0xa8
                      CU_AD_FORMAT_Y410 = 0xa9
                      CU_AD_FORMAT_Y416 = 0xb1
                      CU_AD_FORMAT_Y444_PLANAR8 = 0xb2
                      CU_AD_FORMAT_Y444_PLANAR10 = 0xb3
                      CU_AD_FORMAT_YUV444_8bit_SemiPlanar = 0xb4
                      CU_AD_FORMAT_YUV444_16bit_SemiPlanar = 0xb5
                      CU_AD_FORMAT_UNORM_INT_101010_2 = 0x50
                      CU_AD_FORMAT_UINT8_PACKED_422 = 0x51
                      CU_AD_FORMAT_UINT8_PACKED_444 = 0x52
                      CU_AD_FORMAT_UINT8_SEMIPLANAR_420 = 0x53
                      CU_AD_FORMAT_UINT16_SEMIPLANAR_420 = 0x54
                      CU_AD_FORMAT_UINT8_SEMIPLANAR_422 = 0x55
                      CU_AD_FORMAT_UINT16_SEMIPLANAR_422 = 0x56
                      CU_AD_FORMAT_UINT8_SEMIPLANAR_444 = 0x57
                      CU_AD_FORMAT_UINT16_SEMIPLANAR_444 = 0x58
                      CU_AD_FORMAT_UINT8_PLANAR_420 = 0x59
                      CU_AD_FORMAT_UINT16_PLANAR_420 = 0x5a
                      CU_AD_FORMAT_UINT8_PLANAR_422 = 0x5b
                      CU_AD_FORMAT_UINT16_PLANAR_422 = 0x5c
                      CU_AD_FORMAT_UINT8_PLANAR_444 = 0x5d
                      CU_AD_FORMAT_UINT16_PLANAR_444 = 0x5e
                  } CUarray_format;


  * `NumChannels` specifies the number of packed components per CUDA array element; it may be 1, 2, or 4;


  * Flags may be set to
    * CUDA_ARRAY3D_LAYERED to enable creation of layered CUDA mipmapped arrays. If this flag is set, `Depth` specifies the number of layers, not the depth of a 3D array.

    * CUDA_ARRAY3D_SURFACE_LDST to enable surface references to be bound to individual mipmap levels of the CUDA mipmapped array. If this flag is not set, cuSurfRefSetArray will fail when attempting to bind a mipmap level of the CUDA mipmapped array to a surface reference.

    * CUDA_ARRAY3D_CUBEMAP to enable creation of mipmapped cubemaps. If this flag is set, `Width` must be equal to `Height`, and `Depth` must be six. If the CUDA_ARRAY3D_LAYERED flag is also set, then `Depth` must be a multiple of six.

    * CUDA_ARRAY3D_TEXTURE_GATHER to indicate that the CUDA mipmapped array will be used for texture gather. Texture gather can only be performed on 2D CUDA mipmapped arrays.


`Width`, `Height` and `Depth` must meet certain size requirements as listed in the following table. All values are specified in elements. Note that for brevity's sake, the full name of the device attribute is not specified. For ex., TEXTURE1D_MIPMAPPED_WIDTH refers to the device attribute CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE1D_MIPMAPPED_WIDTH.

**CUDA array type** |  **Valid extents that must always be met {(width range in elements), (height range), (depth range)}** |  **Valid extents with CUDA_ARRAY3D_SURFACE_LDST set {(width range in elements), (height range), (depth range)}**
---|---|---
1D  |  { (1,TEXTURE1D_MIPMAPPED_WIDTH), 0, 0 }  |  { (1,SURFACE1D_WIDTH), 0, 0 }
2D  |  { (1,TEXTURE2D_MIPMAPPED_WIDTH), (1,TEXTURE2D_MIPMAPPED_HEIGHT), 0 }  |  { (1,SURFACE2D_WIDTH), (1,SURFACE2D_HEIGHT), 0 }
3D  |  { (1,TEXTURE3D_WIDTH), (1,TEXTURE3D_HEIGHT), (1,TEXTURE3D_DEPTH) } OR { (1,TEXTURE3D_WIDTH_ALTERNATE), (1,TEXTURE3D_HEIGHT_ALTERNATE), (1,TEXTURE3D_DEPTH_ALTERNATE) }  |  { (1,SURFACE3D_WIDTH), (1,SURFACE3D_HEIGHT), (1,SURFACE3D_DEPTH) }
1D Layered  |  { (1,TEXTURE1D_LAYERED_WIDTH), 0, (1,TEXTURE1D_LAYERED_LAYERS) }  |  { (1,SURFACE1D_LAYERED_WIDTH), 0, (1,SURFACE1D_LAYERED_LAYERS) }
2D Layered  |  { (1,TEXTURE2D_LAYERED_WIDTH), (1,TEXTURE2D_LAYERED_HEIGHT), (1,TEXTURE2D_LAYERED_LAYERS) }  |  { (1,SURFACE2D_LAYERED_WIDTH), (1,SURFACE2D_LAYERED_HEIGHT), (1,SURFACE2D_LAYERED_LAYERS) }
Cubemap  |  { (1,TEXTURECUBEMAP_WIDTH), (1,TEXTURECUBEMAP_WIDTH), 6 }  |  { (1,SURFACECUBEMAP_WIDTH), (1,SURFACECUBEMAP_WIDTH), 6 }
Cubemap Layered  |  { (1,TEXTURECUBEMAP_LAYERED_WIDTH), (1,TEXTURECUBEMAP_LAYERED_WIDTH), (1,TEXTURECUBEMAP_LAYERED_LAYERS) }  |  { (1,SURFACECUBEMAP_LAYERED_WIDTH), (1,SURFACECUBEMAP_LAYERED_WIDTH), (1,SURFACECUBEMAP_LAYERED_LAYERS) }

CUresult cuMipmappedArrayDestroy ( CUmipmappedArray hMipmappedArray )


Destroys a CUDA mipmapped array.

######  Parameters

`hMipmappedArray`
    \- Mipmapped array to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_ARRAY_IS_MAPPED, CUDA_ERROR_CONTEXT_IS_DESTROYED

###### Description

Destroys the CUDA mipmapped array `hMipmappedArray`.

CUresult cuMipmappedArrayGetLevel ( CUarray* pLevelArray, CUmipmappedArray hMipmappedArray, unsigned int  level )


Gets a mipmap level of a CUDA mipmapped array.

######  Parameters

`pLevelArray`
    \- Returned mipmap level CUDA array
`hMipmappedArray`
    \- CUDA mipmapped array
`level`
    \- Mipmap level

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Returns in `*pLevelArray` a CUDA array that represents a single mipmap level of the CUDA mipmapped array `hMipmappedArray`.

If `level` is greater than the maximum number of levels in this mipmapped array, CUDA_ERROR_INVALID_VALUE is returned.

CUresult cuMipmappedArrayGetMemoryRequirements ( CUDA_ARRAY_MEMORY_REQUIREMENTS* memoryRequirements, CUmipmappedArray mipmap, CUdevice device )


Returns the memory requirements of a CUDA mipmapped array.

######  Parameters

`memoryRequirements`
    \- Pointer to CUDA_ARRAY_MEMORY_REQUIREMENTS
`mipmap`
    \- CUDA mipmapped array to get the memory requirements of
`device`
    \- Device to get the memory requirements for

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the memory requirements of a CUDA mipmapped array in `memoryRequirements` If the CUDA mipmapped array is not allocated with flag CUDA_ARRAY3D_DEFERRED_MAPPINGCUDA_ERROR_INVALID_VALUE will be returned.

The returned value in CUDA_ARRAY_MEMORY_REQUIREMENTS::size represents the total size of the CUDA mipmapped array. The returned value in CUDA_ARRAY_MEMORY_REQUIREMENTS::alignment represents the alignment necessary for mapping the CUDA mipmapped array.

CUresult cuMipmappedArrayGetSparseProperties ( CUDA_ARRAY_SPARSE_PROPERTIES* sparseProperties, CUmipmappedArray mipmap )


Returns the layout properties of a sparse CUDA mipmapped array.

######  Parameters

`sparseProperties`
    \- Pointer to CUDA_ARRAY_SPARSE_PROPERTIES
`mipmap`
    \- CUDA mipmapped array to get the sparse properties of

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the sparse array layout properties in `sparseProperties` If the CUDA mipmapped array is not allocated with flag CUDA_ARRAY3D_SPARSECUDA_ERROR_INVALID_VALUE will be returned.

For non-layered CUDA mipmapped arrays, CUDA_ARRAY_SPARSE_PROPERTIES::miptailSize returns the size of the mip tail region. The mip tail region includes all mip levels whose width, height or depth is less than that of the tile. For layered CUDA mipmapped arrays, if CUDA_ARRAY_SPARSE_PROPERTIES::flags contains CU_ARRAY_SPARSE_PROPERTIES_SINGLE_MIPTAIL, then CUDA_ARRAY_SPARSE_PROPERTIES::miptailSize specifies the size of the mip tail of all layers combined. Otherwise, CUDA_ARRAY_SPARSE_PROPERTIES::miptailSize specifies mip tail size per layer. The returned value of CUDA_ARRAY_SPARSE_PROPERTIES::miptailFirstLevel is valid only if CUDA_ARRAY_SPARSE_PROPERTIES::miptailSize is non-zero.
