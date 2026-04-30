---
name: metal-buffer-layout-and-alignment
description: "Apple Metal buffer layout and alignment: resource sizing, texture-from-buffer alignment, and host/kernel layout discipline."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,buffer,alignment,layout,mtlbuffer,minimumtexturebufferalignment,minimumlineartexturealignment,bytesperrow,heap-size-align"
---

# Metal Buffer Layout And Alignment

Use this page when host-side data layout, buffer sizing, or buffer-backed texture creation is part of the kernel path.

## Why This Matters

Many Metal failures that look like "bad math" are actually layout problems:

- host structs and shader expectations do not match
- offsets are aligned incorrectly
- buffer-backed textures use invalid row pitch or offset values
- heap sizing and alignment are estimated incorrectly

## Layout Discipline

- define host and kernel-visible struct layouts explicitly
- keep element size, stride, and offset calculations centralized
- treat texture-from-buffer paths as alignment-sensitive, not as generic byte blobs

## Alignment APIs Apple Exposes

Apple documents alignment helpers on `MTLDevice`, including:

- `minimumTextureBufferAlignment(for:)`
- `minimumLinearTextureAlignment(for:)`
- `heapBufferSizeAndAlign(length:options:)`
- `heapTextureSizeAndAlign(descriptor:)`

Use these APIs instead of guessing alignment from prior hardware experience.

## Buffer-Backed Texture Rules

When creating textures from buffers, values such as:

- buffer offset
- bytes per row
- pixel format alignment

must satisfy the device's documented alignment constraints.

Apple's documentation explicitly ties alignment values to texture creation parameters.

## Common Failure Modes

- Buffer length is correct in bytes, but element stride is wrong.
- Struct fields are logically correct but host/kernel padding expectations differ.
- Texture buffer offset is not aligned to the device minimum.
- `bytesPerRow` is computed from logical width only and ignores required alignment.
- Heap size estimates ignore size-and-align APIs and under-allocate.

## Safe Practice

1. Compute all offsets from element-size and alignment helpers.
2. Reuse one layout definition across host and shader-facing code.
3. Validate resource creation parameters before debugging kernel math.

## Official Source Links (Fact Check)

- `minimumTextureBufferAlignment(for:)`: https://developer.apple.com/documentation/metal/mtldevice/minimumtexturebufferalignment%28for%3A%29
- `minimumLinearTextureAlignment(for:)`: https://developer.apple.com/documentation/metal/mtldevice/minimumlineartexturealignment%28for%3A%29
- `heapBufferSizeAndAlign(length:options:)`: https://developer.apple.com/documentation/metal/mtldevice/heapbuffersizeandalign%28length%3Aoptions%3A%29
- `bufferBytesPerRow`: https://developer.apple.com/documentation/metal/mtltexture/bufferbytesperrow

Last cross-check date: 2026-03-21
