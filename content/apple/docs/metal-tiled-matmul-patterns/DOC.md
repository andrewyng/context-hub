---
name: metal-tiled-matmul-patterns
description: "Apple Metal tiled matmul patterns: threadgroup staging, tile indexing, synchronization points, and correctness-first optimization."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,matmul,gemm,tiled-matmul,threadgroup-memory,tiling,matrix-multiply,compute,kernel"
---

# Metal Tiled Matmul Patterns

Use this page when implementing a matrix multiply or GEMM-like kernel in Metal with threadgroup staging.

## Why Tiling Matters

For matrix multiplication, the naive kernel often reloads the same source data many times from device memory.

The standard optimization path is:

1. partition the problem into tiles
2. stage tile data into `threadgroup` memory
3. synchronize the threadgroup
4. accumulate over the K dimension tile by tile

This is the same broad optimization idea as tiled CUDA GEMM, but the implementation details live in Metal's threadgroup and dispatch model.

## Core Structure

A typical tiled matmul kernel needs:

- 2D mapping from grid coordinates to output tile coordinates
- `threadgroup` memory for A and B subtiles
- one barrier after staging
- one barrier before reusing the same threadgroup buffers for the next K tile

## Safe Baseline Pattern

- start with a correct 2D tiled kernel
- make tile sizes match dispatch shape
- keep bounds handling explicit for edge tiles
- only then tune threadgroup shape and staging layout

## What To Verify First

- global row and column indices are derived from grid position, not local threadgroup position alone
- local thread indices match the threadgroup tile layout
- all threads in the threadgroup reach both staging and reuse barriers
- threadgroup memory allocation matches tile dimensions exactly

## Common Failure Modes

- threadgroup tile indexing is correct for full tiles but wrong on edge tiles
- one barrier is missing, so later K-step accumulations read stale or partial tile data
- host dispatch geometry and kernel tile assumptions drift apart
- tile sizes are increased for arithmetic reuse but threadgroup memory or scheduling cost becomes the new bottleneck

## Optimization Order

1. correct tiled baseline
2. stable threadgroup sizing
3. better threadgroup layout and memory access pattern
4. wrapper-level reuse and batching
5. only then consider subgroup-sensitive refinements

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
