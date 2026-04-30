---
name: ptx-tensormapcp-fenceproxy
description: '`tensormap.cp_fenceproxy`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.16. Parallel Synchronization and Communication Instructions:tensormap.cp_fenceproxy

---
title: "9.7.13.16. Parallel Synchronization and Communication Instructions:tensormap.cp_fenceproxy"
section: 9.7.13.16
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.16. Parallel Synchronization and Communication Instructions:tensormap.cp_fenceproxy


`tensormap.cp_fenceproxy`

A fused copy and fence operation.

Syntax

tensormap.cp_fenceproxy.cp_qualifiers.fence_qualifiers.sync.aligned  [dst], [src], size;
    
    .cp_qualifiers    = { .global.shared::cta }
    .fence_qualifiers = { .to_proxy::from_proxy.release.scope }
    .to_proxy::from_proxy  = { .tensormap::generic }
    .scope            = { .cta, .cluster, .gpu , .sys }

Description

The `tensormap.cp_fenceproxy` instructions perform the following operations in order :

* Copies data of size specified by the `size` argument, in bytes, from the location specified by the address operand `src` in shared memory to the location specified by the address operand `dst` in the global memory, in the generic proxy.

  * Establishes a _uni-directional_ proxy release pattern on the ordering from the copy operation to the subsequent access performed in the tensormap proxy on the address `dst`.

The valid value of immediate operand `size` is 128.

The operands `src` and `dst` specify non-generic addresses in `shared::cta` and `global` state space respectively.

The `.scope` qualifier specifies the set of threads that can directly observe the proxy synchronizing effect of this operation, as described in [Memory Consistency Model](<#memory-consistency-model>).

The mandatory `.sync` qualifier indicates that `tensormap.cp_fenceproxy` causes the executing thread to wait until all threads in the warp execute the same `tensormap.cp_fenceproxy` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warp must execute the same `tensormap.cp_fenceproxy` instruction. In conditionally executed code, an aligned `tensormap.cp_fenceproxy` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.3.

Target ISA Notes

Requires `sm_90` or higher.

Examples

// Example: manipulate a tensor-map object and then consume it in cp.async.bulk.tensor
    
    .reg .b64 new_addr;
    .global .align 128 .b8 gbl[128];
    .shared .align 128 .b8 sMem[128];
    
    cp.async.bulk.shared::cluster.global.mbarrier::complete_tx::bytes [sMem], [gMem], 128, [mbar];
    ...
    try_wait_loop:
    mbarrier.try_wait.shared.b64 p, [mbar], state;
    @!p bra try_wait loop;
    
    tensormap.replace.tile.global_address.shared.b1024.b64   [sMem], new_addr;
    tensormap.cp_fenceproxy.global.shared::cta.tensormap::generic.release.gpu.sync.aligned
                                                             [gbl], [sMem], 128;
    fence.proxy.tensormap::generic.acquire.gpu [gbl], 128;
    cp.async.bulk.tensor.1d.shared::cluster.global.tile  [addr0], [gbl, {tc0}], [mbar0];