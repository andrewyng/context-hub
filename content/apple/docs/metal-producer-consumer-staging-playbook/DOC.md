---
name: metal-producer-consumer-staging-playbook
description: "Apple Metal producer-consumer staging playbook: explicit ownership, handoff points, intermediate resources, and synchronization boundaries for chained kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,producer-consumer,staging,handoff,intermediate-resource,synchronization,compute-pipeline,compute"
---

# Metal Producer-Consumer Staging Playbook

Use this page when one Metal kernel produces an intermediate that another kernel consumes, and the handoff itself is where correctness or performance starts to break down.

## The Main Rule

Treat every intermediate resource as a contract between one producer and one consumer.

That contract should answer:

- who writes it
- who reads it next
- when it becomes valid
- when it may be reused or discarded

If those four points are vague, the pipeline usually becomes fragile.

## Safe Staging Pattern

- give each intermediate a clear producer and consumer role
- keep resource type aligned with access pattern
- place synchronization only at real handoff boundaries
- validate each stage separately before fusing or aliasing resources

## Review Checklist

- does the consumer read the intermediate only after the producer signaled completion?
- is the intermediate buffer or texture type still appropriate for the next stage?
- can the handoff be expressed in one command buffer, or does it need an explicit event or fence?
- is the same intermediate reused too early by another stage?

## Common Failure Modes

- the consumer is launched before the producer made the intermediate valid
- one intermediate is shared by several stages without explicit ownership
- synchronization is added globally instead of just around the true handoff
- the resource type was chosen for the producer and is poor for the consumer

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Implementing a multistage image filter using heaps and events: https://developer.apple.com/documentation/metal/implementing-a-multistage-image-filter-using-heaps-and-events
- Synchronizing passes with a fence: https://developer.apple.com/documentation/metal/synchronizing-passes-with-a-fence

Last cross-check date: 2026-03-21
