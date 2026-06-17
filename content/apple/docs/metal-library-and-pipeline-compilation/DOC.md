---
name: metal-library-and-pipeline-compilation
description: "Apple Metal library and pipeline compilation: build-time metallib usage, runtime loading, and avoiding unnecessary pipeline compilation overhead."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,metallib,mtllibrary,pipeline-compilation,compute-pipeline,pso,build-time-compilation,runtime-loading,metal4compiler"
---

# Metal Library And Pipeline Compilation

Use this page when the kernel exists, but you need a sane compilation and pipeline-creation strategy on the host side.

## First Principle

Apple's best-practices guidance is explicit:

- compile Metal shader code at build time whenever possible
- load compiled libraries at runtime
- avoid repeated runtime compilation unless shader code is genuinely generated dynamically

Compiling shader source at runtime is one of the most expensive stages in a Metal app lifecycle.

## Recommended Compilation Strategy

### Default Path

- compile `.metal` sources during the app build
- load the resulting library once at initialization
- create compute pipeline states once and reuse them

This is the right default for nearly all production compute wrappers.

### Runtime Compilation

Use runtime compilation only when:

- the shader source is generated dynamically
- the function set cannot reasonably be compiled ahead of time
- your tooling or research workflow truly requires runtime generation

Even then, isolate runtime compilation from the steady-state hot path.

## Pipeline Creation Strategy

- load or create the `MTLLibrary`
- resolve the kernel function by name
- create the `MTLComputePipelineState`
- cache it for future launches

For modern APIs, Apple also exposes newer compilation flows such as Metal 4 compilation interfaces and binary/pipeline tooling. These are useful when your pipeline management needs become more advanced, but they do not change the main rule: avoid repeated compilation in hot paths.

## Common Failure Modes

- source compilation is left inside per-inference or per-batch execution
- library loading is repeated across wrapper instances
- multiple pipelines for the same kernel are rebuilt because cache keys are not centralized
- runtime compilation is chosen for convenience even though the function set is static

## Practical Review Checklist

1. Are `.metal` files compiled at build time?
2. Is library loading done once during initialization?
3. Is pipeline creation cached by kernel/function identity?
4. Is any runtime compilation path isolated from steady-state execution?

## Official Source Links (Fact Check)

- Metal Best Practices Guide: Functions and Libraries: https://developer.apple.com/library/archive/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/FunctionsandLibraries.html
- Metal shader converter: https://developer.apple.com/metal/shader-converter/
- `MTL4Compiler`: https://developer.apple.com/documentation/metal/mtl4compiler

Last cross-check date: 2026-03-21
