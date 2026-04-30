---
name: driver-texobject
description: '**Source:** group__CUDA__TEXOBJECT.html#group__CUDA__TEXOBJECT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.28. Texture Object Management

**Source:** group__CUDA__TEXOBJECT.html#group__CUDA__TEXOBJECT


### Functions

CUresult cuTexObjectCreate ( CUtexObject* pTexObject, const CUDA_RESOURCE_DESC* pResDesc, const CUDA_TEXTURE_DESC* pTexDesc, const CUDA_RESOURCE_VIEW_DESC* pResViewDesc )


Creates a texture object.

######  Parameters

`pTexObject`
    \- Texture object to create
`pResDesc`
    \- Resource descriptor
`pTexDesc`
    \- Texture descriptor
`pResViewDesc`
    \- Resource view descriptor

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a texture object and returns it in `pTexObject`. `pResDesc` describes the data to texture from. `pTexDesc` describes how the data should be sampled. `pResViewDesc` is an optional argument that specifies an alternate format for the data described by `pResDesc`, and also describes the subresource region to restrict access to when texturing. `pResViewDesc` can only be specified if the type of resource is a CUDA array or a CUDA mipmapped array not in a block compressed format.

Texture objects are only supported on devices of compute capability 3.0 or higher. Additionally, a texture object is an opaque value, and, as such, should only be accessed through CUDA API calls.

The CUDA_RESOURCE_DESC structure is defined as:


    ‎        typedef struct CUDA_RESOURCE_DESC_st
                  {
                      CUresourcetype resType;

                      union {
                          struct {
                              CUarray hArray;
                          } array;
                          struct {
                              CUmipmappedArray hMipmappedArray;
                          } mipmap;
                          struct {
                              CUdeviceptr devPtr;
                              CUarray_format format;
                              unsigned int numChannels;
                              size_t sizeInBytes;
                          } linear;
                          struct {
                              CUdeviceptr devPtr;
                              CUarray_format format;
                              unsigned int numChannels;
                              size_t width;
                              size_t height;
                              size_t pitchInBytes;
                          } pitch2D;
                      } res;

                      unsigned int flags;
                  } CUDA_RESOURCE_DESC;

where:

  * CUDA_RESOURCE_DESC::resType specifies the type of resource to texture from. CUresourceType is defined as:

        ‎        typedef enum CUresourcetype_enum {
                          CU_RESOURCE_TYPE_ARRAY           = 0x00
                          CU_RESOURCE_TYPE_MIPMAPPED_ARRAY = 0x01
                          CU_RESOURCE_TYPE_LINEAR          = 0x02
                          CU_RESOURCE_TYPE_PITCH2D         = 0x03
                      } CUresourcetype;


If CUDA_RESOURCE_DESC::resType is set to CU_RESOURCE_TYPE_ARRAY, CUDA_RESOURCE_DESC::res::array::hArray must be set to a valid CUDA array handle.

If CUDA_RESOURCE_DESC::resType is set to CU_RESOURCE_TYPE_MIPMAPPED_ARRAY, CUDA_RESOURCE_DESC::res::mipmap::hMipmappedArray must be set to a valid CUDA mipmapped array handle.

If CUDA_RESOURCE_DESC::resType is set to CU_RESOURCE_TYPE_LINEAR, CUDA_RESOURCE_DESC::res::linear::devPtr must be set to a valid device pointer, that is aligned to CU_DEVICE_ATTRIBUTE_TEXTURE_ALIGNMENT. CUDA_RESOURCE_DESC::res::linear::format and CUDA_RESOURCE_DESC::res::linear::numChannels describe the format of each component and the number of components per array element. CUDA_RESOURCE_DESC::res::linear::sizeInBytes specifies the size of the array in bytes. The total number of elements in the linear address range cannot exceed CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE1D_LINEAR_WIDTH. The number of elements is computed as (sizeInBytes / (sizeof(format) * numChannels)).

If CUDA_RESOURCE_DESC::resType is set to CU_RESOURCE_TYPE_PITCH2D, CUDA_RESOURCE_DESC::res::pitch2D::devPtr must be set to a valid device pointer, that is aligned to CU_DEVICE_ATTRIBUTE_TEXTURE_ALIGNMENT. CUDA_RESOURCE_DESC::res::pitch2D::format and CUDA_RESOURCE_DESC::res::pitch2D::numChannels describe the format of each component and the number of components per array element. CUDA_RESOURCE_DESC::res::pitch2D::width and CUDA_RESOURCE_DESC::res::pitch2D::height specify the width and height of the array in elements, and cannot exceed CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE2D_LINEAR_WIDTH and CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE2D_LINEAR_HEIGHT respectively. CUDA_RESOURCE_DESC::res::pitch2D::pitchInBytes specifies the pitch between two rows in bytes and has to be aligned to CU_DEVICE_ATTRIBUTE_TEXTURE_PITCH_ALIGNMENT. Pitch cannot exceed CU_DEVICE_ATTRIBUTE_MAXIMUM_TEXTURE2D_LINEAR_PITCH.

  * flags must be set to zero.


The CUDA_TEXTURE_DESC struct is defined as


    ‎        typedef struct CUDA_TEXTURE_DESC_st {
                      CUaddress_mode addressMode[3];
                      CUfilter_mode filterMode;
                      unsigned int flags;
                      unsigned int maxAnisotropy;
                      CUfilter_mode mipmapFilterMode;
                      float mipmapLevelBias;
                      float minMipmapLevelClamp;
                      float maxMipmapLevelClamp;
                  } CUDA_TEXTURE_DESC;

where

  * CUDA_TEXTURE_DESC::addressMode specifies the addressing mode for each dimension of the texture data. CUaddress_mode is defined as:

        ‎        typedef enum CUaddress_mode_enum {
                          CU_TR_ADDRESS_MODE_WRAP = 0
                          CU_TR_ADDRESS_MODE_CLAMP = 1
                          CU_TR_ADDRESS_MODE_MIRROR = 2
                          CU_TR_ADDRESS_MODE_BORDER = 3
                      } CUaddress_mode;

This is ignored if CUDA_RESOURCE_DESC::resType is CU_RESOURCE_TYPE_LINEAR. Also, if the flag, CU_TRSF_NORMALIZED_COORDINATES is not set, the only supported address mode is CU_TR_ADDRESS_MODE_CLAMP.


  * CUDA_TEXTURE_DESC::filterMode specifies the filtering mode to be used when fetching from the texture. CUfilter_mode is defined as:

        ‎        typedef enum CUfilter_mode_enum {
                          CU_TR_FILTER_MODE_POINT = 0
                          CU_TR_FILTER_MODE_LINEAR = 1
                      } CUfilter_mode;

This is ignored if CUDA_RESOURCE_DESC::resType is CU_RESOURCE_TYPE_LINEAR.


  * CUDA_TEXTURE_DESC::flags can be any combination of the following:
    * CU_TRSF_READ_AS_INTEGER, which suppresses the default behavior of having the texture promote integer data to floating point data in the range [0, 1]. Note that texture with 32-bit integer format would not be promoted, regardless of whether or not this flag is specified.

    * CU_TRSF_NORMALIZED_COORDINATES, which suppresses the default behavior of having the texture coordinates range from 0, Dim) where Dim is the width or height of the CUDA array. Instead, the texture coordinates [0, 1.0) reference the entire breadth of the array dimension; Note that for CUDA mipmapped arrays, this flag has to be set.

    * [CU_TRSF_DISABLE_TRILINEAR_OPTIMIZATION, which disables any trilinear filtering optimizations. Trilinear optimizations improve texture filtering performance by allowing bilinear filtering on textures in scenarios where it can closely approximate the expected results.

    * CU_TRSF_SEAMLESS_CUBEMAP, which enables seamless cube map filtering. This flag can only be specified if the underlying resource is a CUDA array or a CUDA mipmapped array that was created with the flag CUDA_ARRAY3D_CUBEMAP. When seamless cube map filtering is enabled, texture address modes specified by CUDA_TEXTURE_DESC::addressMode are ignored. Instead, if the CUDA_TEXTURE_DESC::filterMode is set to CU_TR_FILTER_MODE_POINT the address mode CU_TR_ADDRESS_MODE_CLAMP will be applied for all dimensions. If the CUDA_TEXTURE_DESC::filterMode is set to CU_TR_FILTER_MODE_LINEAR seamless cube map filtering will be performed when sampling along the cube face borders.


  * CUDA_TEXTURE_DESC::maxAnisotropy specifies the maximum anisotropy ratio to be used when doing anisotropic filtering. This value will be clamped to the range [1,16].


  * CUDA_TEXTURE_DESC::mipmapFilterMode specifies the filter mode when the calculated mipmap level lies between two defined mipmap levels.


  * CUDA_TEXTURE_DESC::mipmapLevelBias specifies the offset to be applied to the calculated mipmap level.


  * CUDA_TEXTURE_DESC::minMipmapLevelClamp specifies the lower end of the mipmap level range to clamp access to.


  * CUDA_TEXTURE_DESC::maxMipmapLevelClamp specifies the upper end of the mipmap level range to clamp access to.


The CUDA_RESOURCE_VIEW_DESC struct is defined as


    ‎        typedef struct CUDA_RESOURCE_VIEW_DESC_st
                  {
                      CUresourceViewFormat format;
                      size_t width;
                      size_t height;
                      size_t depth;
                      unsigned int firstMipmapLevel;
                      unsigned int lastMipmapLevel;
                      unsigned int firstLayer;
                      unsigned int lastLayer;
                  } CUDA_RESOURCE_VIEW_DESC;

where:

  * CUDA_RESOURCE_VIEW_DESC::format specifies how the data contained in the CUDA array or CUDA mipmapped array should be interpreted. Note that this can incur a change in size of the texture data. If the resource view format is a block compressed format, then the underlying CUDA array or CUDA mipmapped array has to have a base of format CU_AD_FORMAT_UNSIGNED_INT32. with 2 or 4 channels, depending on the block compressed format. For ex., BC1 and BC4 require the underlying CUDA array to have a format of CU_AD_FORMAT_UNSIGNED_INT32 with 2 channels. The other BC formats require the underlying resource to have the same base format but with 4 channels.


  * CUDA_RESOURCE_VIEW_DESC::width specifies the new width of the texture data. If the resource view format is a block compressed format, this value has to be 4 times the original width of the resource. For non block compressed formats, this value has to be equal to that of the original resource.


  * CUDA_RESOURCE_VIEW_DESC::height specifies the new height of the texture data. If the resource view format is a block compressed format, this value has to be 4 times the original height of the resource. For non block compressed formats, this value has to be equal to that of the original resource.


  * CUDA_RESOURCE_VIEW_DESC::depth specifies the new depth of the texture data. This value has to be equal to that of the original resource.


  * CUDA_RESOURCE_VIEW_DESC::firstMipmapLevel specifies the most detailed mipmap level. This will be the new mipmap level zero. For non-mipmapped resources, this value has to be zero.CUDA_TEXTURE_DESC::minMipmapLevelClamp and CUDA_TEXTURE_DESC::maxMipmapLevelClamp will be relative to this value. For ex., if the firstMipmapLevel is set to 2, and a minMipmapLevelClamp of 1.2 is specified, then the actual minimum mipmap level clamp will be 3.2.


  * CUDA_RESOURCE_VIEW_DESC::lastMipmapLevel specifies the least detailed mipmap level. For non-mipmapped resources, this value has to be zero.


  * CUDA_RESOURCE_VIEW_DESC::firstLayer specifies the first layer index for layered textures. This will be the new layer zero. For non-layered resources, this value has to be zero.


  * CUDA_RESOURCE_VIEW_DESC::lastLayer specifies the last layer index for layered textures. For non-layered resources, this value has to be zero.


CUresult cuTexObjectDestroy ( CUtexObject texObject )


Destroys a texture object.

######  Parameters

`texObject`
    \- Texture object to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Destroys the texture object specified by `texObject`.

CUresult cuTexObjectGetResourceDesc ( CUDA_RESOURCE_DESC* pResDesc, CUtexObject texObject )


Returns a texture object's resource descriptor.

######  Parameters

`pResDesc`
    \- Resource descriptor
`texObject`
    \- Texture object

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the resource descriptor for the texture object specified by `texObject`.

CUresult cuTexObjectGetResourceViewDesc ( CUDA_RESOURCE_VIEW_DESC* pResViewDesc, CUtexObject texObject )


Returns a texture object's resource view descriptor.

######  Parameters

`pResViewDesc`
    \- Resource view descriptor
`texObject`
    \- Texture object

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the resource view descriptor for the texture object specified by `texObject`. If no resource view was set for `texObject`, the CUDA_ERROR_INVALID_VALUE is returned.

CUresult cuTexObjectGetTextureDesc ( CUDA_TEXTURE_DESC* pTexDesc, CUtexObject texObject )


Returns a texture object's texture descriptor.

######  Parameters

`pTexDesc`
    \- Texture descriptor
`texObject`
    \- Texture object

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the texture descriptor for the texture object specified by `texObject`.
