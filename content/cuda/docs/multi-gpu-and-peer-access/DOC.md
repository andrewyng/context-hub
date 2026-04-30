---
name: multi-gpu-and-peer-access
description: "CUDA multi-GPU essentials: device selection, peer access (P2P), topology constraints, and cross-device synchronization basics."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,multi-gpu,peer-access,p2p,cudaDeviceEnablePeerAccess,cudaMemcpyPeerAsync,topology,nvlink"
---

# CUDA Multi-GPU And Peer Access (C++)

Use this page for process-level multi-GPU programming and direct device-to-device data movement.

## Device Selection Basics

Multi-GPU programs typically:

1. query device count and capabilities
2. assign work partitions per device
3. set active device with `cudaSetDevice`
4. create per-device streams/resources

Avoid frequent device switching in tight host loops unless necessary.

## Peer Access (P2P)

Peer access allows one GPU to access memory on another GPU directly when topology and capability permit it.

Core APIs:

- `cudaDeviceCanAccessPeer`
- `cudaDeviceEnablePeerAccess`
- `cudaMemcpyPeerAsync`

Always check capability before enabling peer access.

## Why P2P Matters

When supported, P2P can reduce host staging overhead for inter-GPU exchange.

Performance depends on topology:

- NVLink-connected peers often outperform PCIe-only paths
- some GPU pairs may not support peer access at all

## Synchronization Notes

Cross-device workflows still need explicit ordering and synchronization.

- use stream/event patterns per device
- avoid global sync unless required
- ensure destination-side readiness before kernel consumption

## Common Mistakes

- assuming all GPU pairs support P2P
- forgetting to set the correct active device before API calls
- building one global stream strategy across devices without per-device ownership

## Related Topics

- Streams and events: `../streams-and-events/DOC.md`
- Pinned memory and transfers: `../pinned-memory-and-transfers/DOC.md`
- Unified Memory: `../unified-memory/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, multi-device and peer access: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA Runtime API, peer-device memory access APIs: https://docs.nvidia.com/cuda/cuda-runtime-api/index.html

Last cross-check date: 2026-03-20
