---
name: metal-resource-binding-checklist
description: "Apple Metal resource binding checklist: buffer indices, texture binding, argument consistency, residency, and launch-time validation."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,resource-binding,buffer-index,texture-binding,argument-buffer,useResource,useHeap,compute-encoder,validation"
---

# Metal Resource Binding Checklist

Use this page when a Metal kernel compiles but returns wrong data because host-side resources are bound incorrectly.

## Binding Checklist

- `[[buffer(i)]]` indices match `setBuffer(... atIndex:i)`
- texture indices match `setTexture(... atIndex:i)`
- constant arguments are passed through the intended binding path
- offsets are aligned and within buffer bounds
- resources referenced indirectly are made resident when required

Binding errors often look like math bugs even though the shader logic is fine.

## Direct Binding Discipline

For ordinary compute encoders:

- define one authoritative table for buffer slots
- reuse the same slot definitions across wrapper and shader code
- keep optional resources explicit instead of shifting slot numbers dynamically

## Indirect Or Advanced Binding

When using argument-buffer-style or indirect resource binding, Apple documents that resource residency and dependency signaling still matter.

That means APIs such as:

- `useResource`
- `useHeap`

may be necessary depending on the binding model.

## Common Failure Modes

- one buffer index shifts after a wrapper refactor and all later bindings become wrong
- an offset is valid as a byte value but invalid for the element layout
- optional resources are omitted and later bindings silently slide into the wrong slots
- indirectly referenced resources are not made resident
- host code updates struct layout but not shader-side expectations

## Practical Review Method

1. Write down the full binding table.
2. Compare each slot against kernel attributes.
3. Validate offsets and sizes separately from kernel math.
4. Only after binding is proven correct, debug shader arithmetic.

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal shader converter resource binding notes: https://developer.apple.com/metal/shader-converter/
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
