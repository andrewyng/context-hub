---
name: metal-host-device-synchronization-checklist
description: "Apple Metal host-device synchronization checklist: command completion, CPU visibility, resource lifetime, and debugging rules for wrapper-level correctness."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,host-device-synchronization,completion,resource-lifetime,cpu-visibility,command-buffer,wrapper,compute"
---

# Metal Host-Device Synchronization Checklist

Use this page when the kernel itself may be correct, but the wrapper reads results too early, overwrites resources too soon, or otherwise mishandles CPU-GPU coordination.

## First Principles

The CPU and GPU do not execute in lockstep.

The wrapper must answer:

- when the GPU has finished writing a resource
- when the CPU is allowed to read it
- when a resource may be reused or destroyed
- whether multiple command buffers overlap on the same resource

## Safe Wrapper Rules

- treat command-buffer completion as the authoritative completion boundary
- keep resource lifetime longer than every in-flight use
- do not overwrite upload buffers or readback targets before the GPU is done with them
- make synchronization points explicit in code review and debugging

## What To Verify

- completion handlers or waits match the true resource dependency
- CPU reads only happen after GPU writes are complete
- reused buffers are not still in flight
- debug and benchmark modes use the same correctness-critical synchronization

## Common Failure Modes

- the CPU reads a buffer after encoding but before GPU completion
- a temporary resource is freed or reused while still referenced by an in-flight command buffer
- benchmark code removes synchronization that correctness silently depended on
- several command buffers touch the same resource and ownership is assumed rather than stated

## Official Source Links (Fact Check)

- Command organization and execution model: https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/Cmd-Submiss/Cmd-Submiss.html
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
