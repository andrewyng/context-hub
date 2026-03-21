---
name: metal-double-buffered-pipeline-patterns
description: "Apple Metal double-buffered pipeline patterns: alternating resources, producer-consumer overlap, and synchronization discipline for staged compute workflows."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,double-buffering,pipeline,producer-consumer,overlap,staging,synchronization,compute"
---

# Metal Double-Buffered Pipeline Patterns

Use this page when a compute pipeline benefits from alternating between two resource sets so that one stage can produce while another later stage consumes the previous result.

## What Double Buffering Solves

Double buffering is useful when:

- one stage writes data that a later stage reads
- the next iteration can start producing into a different buffer
- command scheduling can overlap work without read-write hazards

The goal is controlled overlap, not just owning two copies of the same resource.

## Core Structure

The usual pattern is:

1. allocate buffer set A and buffer set B
2. iteration `n` writes into one set
3. iteration `n + 1` writes into the other set
4. each consumer stage reads only the completed set for its iteration

This requires explicit ownership of which stage may read or write each slot.

## What To Verify

- producer and consumer never touch the same slot at the same time
- slot selection logic matches the iteration index exactly
- the first and last iterations handle warm-up and drain correctly
- synchronization is at the real producer-consumer boundary, not inserted everywhere

## Common Failure Modes

- slot parity logic is off by one and consumers read partially written data
- double buffering is introduced but both stages still serialize on one command buffer boundary
- warm-up or flush iterations are omitted, so the first or last result is wrong
- resource reuse starts before the previous iteration completed

## Official Source Links (Fact Check)

- Implementing a multistage image filter using heaps and events: https://developer.apple.com/documentation/metal/implementing-a-multistage-image-filter-using-heaps-and-events
- Synchronizing passes with a fence: https://developer.apple.com/documentation/metal/synchronizing-passes-with-a-fence
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes

Last cross-check date: 2026-03-21
