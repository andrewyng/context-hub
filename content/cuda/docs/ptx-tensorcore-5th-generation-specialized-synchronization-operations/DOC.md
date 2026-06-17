---
name: ptx-tensorcore-5th-generation-specialized-synchronization-operations
description: Specialized fence for the asynchronous tcgen05 operations.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.16.11. TensorCore 5th Generation Specialized Synchronization Operations

---
title: "9.7.16.11. TensorCore 5th Generation Specialized Synchronization Operations"
section: 9.7.16.11
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.16.11. TensorCore 5th Generation Specialized Synchronization Operations


#####  9.7.16.11.1. [TensorCore 5th Generation Instructions: `tcgen05.fence`](<#tcgen05-special-sync-operations-fence>)

`tcgen05.fence`

Specialized fence for the asynchronous tcgen05 operations.

Syntax
    
    
    tcgen05.fence::before_thread_sync ;
    tcgen05.fence::after_thread_sync  ;
    

Description

The instruction `tcgen05.fence::before_thread_sync` orders all the prior asynchronous `tcgen05` operations with respect to the subsequent `tcgen05` and the execution ordering operations.

The instruction `tcgen05.fence::after_thread_sync` orders all the subsequent asynchronous `tcgen05` operations with respect to the prior `tcgen05` and the execution ordering operations.

The `tcgen05.fence::*` instructions compose with execution ordering instructions across a thread scope and provide ordering between `tcgen05` instructions across the same scope.

The `tcgen05.fence::before_thread_sync` instructions behave as code motion fence for prior `tcgen05` instructions as they cannot be hoisted across. The `tcgen05.fence::after_thread_sync` instructions behave as code motion fence for subsequent `tcgen05` instructions as they cannot be hoisted across.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Target ISA Notes

Supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Examples
    
    
    // Producer thread:
    
    tcgen05.cp.cta_group::1.128x256b  [taddr0], sdesc0;
    
    tcgen05.fence::before_thread_sync;
    st.relaxed.b32 [flag], 1;
    
    // Consumer thread:
    
    loop:
    ld.relaxed.b32 r, [flag];
    setp.eq.u32 p, r, 1;
    @!p bra loop;
    
    tcgen05.fence::after_thread_sync;
    tcgen05.mma.cta_group.kind   [taddr0], adesc, bdesc, idesc, p;