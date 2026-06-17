---
name: cooperative-groups
description: "CUDA Cooperative Groups essentials: thread_block, tiled_partition, coalesced_threads, cluster groups, and collective participation rules."
metadata:
  languages: "cpp"
  versions: "13.1"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cooperative-groups,thread_block,tiled_partition,coalesced_threads,this_grid,this_cluster,group-sync"
---

# CUDA Cooperative Groups (C++)

Use this page when kernels need explicit group objects rather than hard-coding assumptions about blocks and warps.

## Why Cooperative Groups Exists

Cooperative Groups makes the participating set of threads explicit.

Instead of assuming "all threads in the block" or "one warp", code can pass a group object into a helper and make the collective scope explicit.

This improves:

- software composition
- readability
- portability across newer GPU behaviors

## Common Group Handles

Frequently used accessors include:

- `this_thread_block()`
- `this_grid()`
- `coalesced_threads()`
- `this_cluster()`

Common types and concepts include:

- `thread_group`
- `thread_block`
- tiled partitions
- cluster groups

## Basic Thread Block Example

```cpp
namespace cg = cooperative_groups;

cg::thread_block block = cg::this_thread_block();
block.sync();
```

`block.sync()` is the Cooperative Groups form of block-wide synchronization.

## Tiled Partition

Use `tiled_partition()` to decompose a block into smaller groups:

```cpp
auto block = cg::this_thread_block();
auto tile32 = cg::tiled_partition(block, 32);
```

This is useful for warp-sized or sub-warp collectives without manually reasoning about lane groups everywhere in the code.

## Participation Rule

Collective operations require correct participation.

- all threads in the group must participate in collective operations
- the group handle should be created consistently
- it is best to obtain implicit groups early, before divergence

Violating participation assumptions leads to undefined behavior.

## Practical Guidance

- pass group handles by reference into helper functions
- prefer specialized groups instead of over-generic abstractions when performance matters
- create implicit handles early in the kernel

## Where It Connects To Other Features

Cooperative Groups is the user-facing bridge for several advanced CUDA features:

- tiled warp/block decomposition
- async copy collectives like `memcpy_async`
- cluster groups with `this_cluster()`

## Related Topics

- Synchronization rules: `../synchronization/DOC.md`
- Warp primitives: `../warp-primitives/DOC.md`
- Async copy: `../async-copy/DOC.md`
- Thread Block Clusters: `../thread-block-clusters/DOC.md`

## Official Source Links (Fact Check)

- CUDA Programming Guide, Cooperative Groups: https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cooperative-groups.html
- CUDA Programming Guide, classic Cooperative Groups overview: https://docs.nvidia.com/cuda/archive/9.2/cuda-c-programming-guide/
- CUDA Programming Guide, modern cluster and implicit-group accessors: https://docs.nvidia.com/cuda/archive/13.1.1/cuda-programming-guide/01-introduction/programming-model.html

Last cross-check date: 2026-03-20
