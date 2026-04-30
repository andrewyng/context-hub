---
name: ptx-membarfence
description: Enforce an ordering of memory operations.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.4. Parallel Synchronization and Communication Instructions:membar/fence

---
title: "9.7.13.4. Parallel Synchronization and Communication Instructions:membar/fence"
section: 9.7.13.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.4. Parallel Synchronization and Communication Instructions:membar/fence


`membar`, `fence`

Enforce an ordering of memory operations.

Syntax

// Thread fence:
    fence{.sem}.scope;
    
    // Thread fence:
    fence.acquire.sync_restrict::shared::cluster.cluster;
    fence.release.sync_restrict::shared::cta.cluster;
    
    // Operation fence:
    fence.op_restrict.release.cluster;
    
    // Proxy fence (bi-directional):
    fence.proxy.proxykind;
    
    // Proxy fence (uni-directional):
    fence.proxy.to_proxykind::from_proxykind.release.scope;
    fence.proxy.to_proxykind::from_proxykind.acquire.scope  [addr], size;
    fence.proxy.async::generic.acquire.sync_restrict::shared::cluster.cluster;
    fence.proxy.async::generic.release.sync_restrict::shared::cta.cluster;
    
    // Old style membar:
    membar.level;
    membar.proxy.proxykind;
    
    .sem       = { .sc, .acq_rel, .acquire, .release };
    .scope     = { .cta, .cluster, .gpu, .sys };
    .level     = { .cta, .gl, .sys };
    .proxykind = { .alias, .async, .async.global, .async.shared::{cta, cluster} };
    .op_restrict = { .mbarrier_init };
    .to_proxykind::from_proxykind = {.tensormap::generic};

Description

The `membar` instruction guarantees that prior memory accesses requested by this thread (`ld`, `st`, `atom` and `red` instructions) are performed at the specified `level`, before later memory operations requested by this thread following the `membar` instruction. The `level` qualifier specifies the set of threads that may observe the ordering effect of this operation.

A memory read (e.g., by `ld` or `atom`) has been performed when the value read has been transmitted from memory and cannot be modified by another thread at the indicated level. A memory write (e.g., by `st`, `red` or `atom`) has been performed when the value written has become visible to other threads at the specified level, that is, when the previous value can no longer be read.

The `fence` instruction establishes an ordering between memory accesses requested by this thread (`ld`, `st`, `atom` and `red` instructions) as described in the [Memory Consistency Model](<#memory-consistency-model>). The scope qualifier specifies the set of threads that may observe the ordering effect of this operation.

`fence.acq_rel` is a light-weight fence that is sufficient for memory synchronization in most programs. Instances of `fence.acq_rel` synchronize when combined with additional memory operations as described in `acquire` and `release` patterns in the [Memory Consistency Model](<#memory-consistency-model>). If the optional `.sem` qualifier is absent, `.acq_rel` is assumed by default.

`fence.sc` is a slower fence that can restore _sequential consistency_ when used in sufficient places, at the cost of performance. Instances of `fence.sc` with sufficient scope always synchronize by forming a total order per scope, determined at runtime. This total order can be constrained further by other synchronization in the program.

Qualifiers `.op_restrict` and `.sync_restrict` restrict the class of memory operations for which the `fence` instruction provides the memory ordering guarantees. When `.op_restrict` is `.mbarrier_init`, the synchronizing effect of the fence only applies to the prior `mbarrier.init` operations executed by the same thread on _mbarrier objects_ in `.shared::cta` state space. When `.sync_restrict` is `.sync_restrict::shared::cta`, `.sem` must be `.release`, and the effect of the fence only applies to operations performed on objects in `.shared::cta` state space. Likewise, when `.sync_restrict` is `.sync_restrict::shared::cluster`, `.sem` must be `.acquire`, and the effect of the fence only applies to operations performed on objects in `.shared::cluster` state space. When either `.sync_restrict::shared::cta` or `.sync_restrict::shared::cluster` is present, the `.scope` must be specified as `.cluster`.

The address operand `addr` and the operand `size` together specify the memory range `[addr, addr+size-1]` on which the ordering guarantees on the memory accesses across the proxies is to be provided. The only supported value for the `size` operand is 128, which must be a constant integer literal. [Generic Addressing](<#generic-addressing>) is used unconditionally, and the address specified by the operand `addr` must fall within the `.global` state space. Otherwise, the behavior is undefined.

On `sm_70` and higher `membar` is a synonym for `fence.sc`1, and the `membar` levels `cta`, `gl` and `sys` are synonymous with the `fence` scopes `cta`, `gpu` and `sys` respectively.

`membar.proxy` and `fence.proxy` instructions establish an ordering between memory accesses that may happen through different _proxies_.

A _uni-directional_ proxy ordering from the _from-proxykind_ to the _to-proxykind_ establishes ordering between a prior memory access performed via the _from-proxykind_ and a subsequent memory access performed via the _to-proxykind_.

A _bi-directional_ proxy ordering between two proxykinds establishes two _uni-directional_ proxy orderings : one from the first proxykind to the second proxykind and the other from the second proxykind to the first proxykind.

The `.proxykind` qualifier indicates the _bi-directional_ proxy ordering that is established between the memory accesses done between the generic proxy and the proxy specified by `.proxykind`.

Value `.alias` of the `.proxykind` qualifier refers to memory accesses performed using virtually aliased addresses to the same memory location. Value `.async` of the `.proxykind` qualifier specifies that the memory ordering is established between the async proxy and the generic proxy. The memory ordering is limited only to operations performed on objects in the state space specified. If no state space is specified, then the memory ordering applies on all state spaces.

A `.release` proxy fence can form a release sequence that synchronizes with an acquire sequence that contains a `.acquire` proxy fence. The `.to_proxykind` and `.from_proxykind` qualifiers indicate the _uni-directional_ proxy ordering that is established.

On `sm_70` and higher, `membar.proxy` is a synonym for `fence.proxy`.

1 The semantics of `fence.sc` introduced with `sm_70` is a superset of the semantics of `membar` and the two are compatible; when executing on `sm_70` or later architectures, `membar` acquires the full semantics of `fence.sc`.

PTX ISA Notes

`membar.{cta,gl}` introduced in PTX ISA version 1.4.

`membar.sys` introduced in PTX ISA version 2.0.

`fence` introduced in PTX ISA version 6.0.

`membar.proxy` and `fence.proxy` introduced in PTX ISA version 7.5.

`.cluster` scope qualifier introduced in PTX ISA version 7.8.

`.op_restrict` qualifier introduced in PTX ISA version 8.0.

`fence.proxy.async` is introduced in PTX ISA version 8.0.

`.to_proxykind::from_proxykind` qualifier introduced in PTX ISA version 8.3.

`.acquire` and `.release` qualifiers for `fence` instruction introduced in PTX ISA version 8.6.

`.sync_restrict` qualifier introduced in PTX ISA version 8.6.

Target ISA Notes

`membar.{cta,gl}` supported on all target architectures.

`membar.sys` requires `sm_20` or higher.

`fence` requires `sm_70` or higher.

`membar.proxy` requires `sm_60` or higher.

`fence.proxy` requires `sm_70` or higher.

`.cluster` scope qualifier requires `sm_90` or higher.

`.op_restrict` qualifier requires `sm_90` or higher.

`fence.proxy.async` requires `sm_90` or higher.

`.to_proxykind::from_proxykind` qualifier requires `sm_90` or higher.

`.acquire` and `.release` qualifiers for `fence` instruction require `sm_90` or higher..

`.sync_restrict` qualifier requires `sm_90` or higher..

Examples

membar.gl;
    membar.cta;
    membar.sys;
    fence.sc.cta;
    fence.sc.cluster;
    fence.proxy.alias;
    membar.proxy.alias;
    fence.mbarrier_init.release.cluster;
    fence.proxy.async;
    fence.proxy.async.shared::cta;
    fence.proxy.async.shared::cluster;
    fence.proxy.async.global;
    
    tensormap.replace.tile.global_address.global.b1024.b64   [gbl], new_addr;
    fence.proxy.tensormap::generic.release.gpu;
    cvta.global.u64  tmap, gbl;
    fence.proxy.tensormap::generic.acquire.gpu [tmap], 128;
    cp.async.bulk.tensor.1d.shared::cluster.global.tile  [addr0], [tmap, {tc0}], [mbar0];
    
    // Acquire remote barrier state via async proxy.
    barrier.cluster.wait.acquire;
    fence.proxy.async::generic.acquire.sync_restrict::shared::cluster.cluster;
    
    // Release local barrier state via generic proxy.
    mbarrier.init [bar];
    fence.mbarrier_init.release.cluster;
    barrier.cluster.arrive.relaxed;
    
    // Acquire local shared memory via generic proxy.
    mbarrier.try_wait.relaxed.cluster.shared::cta.b64 complete, [addr], parity;
    fence.acquire.sync_restrict::shared::cluster.cluster;
    
    // Release local shared memory via generic proxy.
    fence.release.sync_restrict::shared::cta.cluster;
    mbarrier.arrive.relaxed.cluster.shared::cluster.b64 state, [bar];