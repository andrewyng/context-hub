---
name: metal-image-and-2d-kernel-patterns
description: "Apple Metal image and 2D kernel patterns: texture-based indexing, 2D dispatch layout, read/write texture rules, and bounds handling."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,image,texture,2d-kernel,texture2d,thread-position-in-grid,read-write-texture,bytesperrow,compute"
---

# Metal Image And 2D Kernel Patterns

Use this page when the kernel operates on 2D textures, image grids, or other width-height data layouts.

## 2D Dispatch Model

For texture and image kernels, use a 2D mapping between dispatched threads and output coordinates.

Typical pattern:

- `thread_position_in_grid` is interpreted as a 2D coordinate
- the kernel reads from one or more textures or buffers
- the kernel writes to an output texture or buffer-backed layout

## Why This Is Different From 1D Kernels

2D kernels usually combine:

- texture coordinate rules
- row/column bounds logic
- format and layout constraints
- potentially different read and write access modes

That makes them more sensitive to layout mistakes than simple 1D elementwise kernels.

## Read/Write Texture Rule

Apple documents explicit constraints for read-write textures in Metal.

For example:

- read-write textures use `access::read_write`
- they have usage restrictions compared with sampled textures
- not every texture type supports every access pattern

Treat read-write texture kernels as a separate class from sampled-image code.

## Practical Checklist

- dispatch grid matches output width and height
- bounds checks cover partial edge dispatches
- texture access mode matches the kernel's actual reads and writes
- host-side texture layout and row pitch are validated before kernel debugging

## Common Failure Modes

- 1D indexing logic is reused in a 2D dispatch
- bytes-per-row or texture layout assumptions are wrong on the host side
- read-write texture mode is chosen but later code assumes sampled-texture behavior
- output dimensions and dispatch dimensions drift apart after a resize path

## Official Source Links (Fact Check)

- Processing a texture in a compute function: https://developer.apple.com/documentation/metal/processing-a-texture-in-a-compute-function
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal Programming Guide (archive): https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/WhatsNewiniOS10tvOS10andOSX1012/WhatsNewiniOS10tvOS10andOSX1012.html

Last cross-check date: 2026-03-21
