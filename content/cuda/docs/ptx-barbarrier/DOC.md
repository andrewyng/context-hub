---
name: ptx-barbarrier
description: '`bar`, `bar.cta`, `barrier`, `barrier.cta`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.1. Parallel Synchronization and Communication Instructions:bar,barrier

---
title: "9.7.13.1. Parallel Synchronization and Communication Instructions:bar,barrier"
section: 9.7.13.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.1. Parallel Synchronization and Communication Instructions:bar,barrier


`bar`, `bar.cta`, `barrier`, `barrier.cta`

Barrier synchronization.

Syntax

barrier{.cta}.sync{.aligned}      a{, b};
    barrier{.cta}.arrive{.aligned}    a, b;
    
    barrier{.cta}.red.popc{.aligned}.u32  d, a{, b}, {!}c;
    barrier{.cta}.red.op{.aligned}.pred   p, a{, b}, {!}c;
    
    bar{.cta}.sync      a{, b};
    bar{.cta}.arrive    a, b;
    
    bar{.cta}.red.popc.u32  d, a{, b}, {!}c;
    bar{.cta}.red.op.pred   p, a{, b}, {!}c;
    
    .op = { .and, .or };

Description

Performs barrier synchronization and communication within a CTA. Each CTA instance has sixteen barriers numbered `0..15`.

`barrier{.cta}` instructions can be used by the threads within the CTA for synchronization and communication.

Operands `a`, `b`, and `d` have type `.u32`; operands `p` and `c` are predicates. Source operand `a` specifies a logical barrier resource as an immediate constant or register with value `0` through `15`. Operand `b` specifies the number of threads participating in the barrier. If no thread count is specified, all threads in the CTA participate in the barrier. When specifying a thread count, the value must be a multiple of the warp size. Note that a non-zero thread count is required for `barrier{.cta}.arrive`.

Depending on operand `b`, either specified number of threads (in multiple of warp size) or all threads in the CTA participate in `barrier{.cta}` instruction. The `barrier{.cta}` instructions signal the arrival of the executing threads at the named barrier.

`barrier{.cta}` instruction causes executing thread to wait for all non-exited threads from its warp and marks warps’ arrival at barrier. In addition to signaling its arrival at the barrier, the `barrier{.cta}.red` and `barrier{.cta}.sync` instructions causes executing thread to wait for non-exited threads of all other warps participating in the barrier to arrive. `barrier{.cta}.arrive` does not cause executing thread to wait for threads of other participating warps.

When a barrier completes, the waiting threads are restarted without delay, and the barrier is reinitialized so that it can be immediately reused.

The `barrier{.cta}.sync` or `barrier{.cta}.red` or `barrier{.cta}.arrive` instruction guarantees that when the barrier completes, prior memory accesses requested by this thread are performed relative to all threads participating in the barrier. The `barrier{.cta}.sync` and `barrier{.cta}.red` instruction further guarantees that no new memory access is requested by this thread before the barrier completes.

A memory read (e.g., by `ld` or `atom`) has been performed when the value read has been transmitted from memory and cannot be modified by another thread participating in the barrier. A memory write (e.g., by `st`, `red` or `atom`) has been performed when the value written has become visible to other threads participating in the barrier, that is, when the previous value can no longer be read.

`barrier{.cta}.red` performs a reduction operation across threads. The `c` predicate (or its complement) from all threads in the CTA are combined using the specified reduction operator. Once the barrier count is reached, the final value is written to the destination register in all threads waiting at the barrier.

The reduction operations for `barrier{.cta}.red` are population-count (`.popc`), all-threads-True (`.and`), and any-thread-True (`.or`). The result of `.popc` is the number of threads with a `True` predicate, while `.and` and `.or` indicate if all the threads had a `True` predicate or if any of the threads had a `True` predicate.

Instruction `barrier{.cta}` has optional `.aligned` modifier. When specified, it indicates that all threads in CTA will execute the same `barrier{.cta}` instruction. In conditionally executed code, an aligned `barrier{.cta}` instruction should only be used if it is known that all threads in CTA evaluate the condition identically, otherwise behavior is undefined.

Different warps may execute different forms of the `barrier{.cta}` instruction using the same barrier name and thread count. One example mixes `barrier{.cta}.sync` and `barrier{.cta}.arrive` to implement producer/consumer models. The producer threads execute `barrier{.cta}.arrive` to announce their arrival at the barrier and continue execution without delay to produce the next value, while the consumer threads execute the `barrier{.cta}.sync` to wait for a resource to be produced. The roles are then reversed, using a different barrier, where the producer threads execute a `barrier{.cta}.sync` to wait for a resource to consumed, while the consumer threads announce that the resource has been consumed with `barrier{.cta}.arrive`. Care must be taken to keep a warp from executing more `barrier{.cta}` instructions than intended (`barrier{.cta}.arrive` followed by any other `barrier{.cta}` instruction to the same barrier) prior to the reset of the barrier. `barrier{.cta}.red` should not be intermixed with `barrier{.cta}.sync` or `barrier{.cta}.arrive` using the same active barrier. Execution in this case is unpredictable.

The optional `.cta` qualifier simply indicates CTA-level applicability of the barrier and it doesn’t change the semantics of the instruction.

`bar{.cta}.sync` is equivalent to `barrier{.cta}.sync.aligned`. `bar{.cta}.arrive` is equivalent to `barrier{.cta}.arrive.aligned`. `bar{.cta}.red` is equivalent to `barrier{.cta}.red.aligned`.

Note  
  
For .target `sm_6x` or below,

  1. `barrier{.cta}` instruction without `.aligned` modifier is equivalent to `.aligned` variant and has the same restrictions as of `.aligned` variant.

  2. All threads in warp (except for those have exited) must execute `barrier{.cta}` instruction in convergence.

PTX ISA Notes

`bar.sync` without a thread count introduced in PTX ISA version 1.0.

Register operands, thread count, and `bar.{arrive,red}` introduced in PTX ISA version 2.0.

`barrier` instruction introduced in PTX ISA version 6.0.

`.cta` qualifier introduced in PTX ISA version 7.8.

Target ISA Notes

Register operands, thread count, and `bar{.cta}.{arrive,red}` require `sm_20` or higher.

Only `bar{.cta}.sync` with an immediate barrier number is supported for `sm_1x` targets.

`barrier{.cta}` instruction requires `sm_30` or higher.

Examples

// Use bar.sync to arrive at a pre-computed barrier number and
    // wait for all threads in CTA to also arrive:
        st.shared [r0],r1;  // write my result to shared memory
        bar.cta.sync  1;    // arrive, wait for others to arrive
        ld.shared r2,[r3];  // use shared results from other threads
    
    // Use bar.sync to arrive at a pre-computed barrier number and
    // wait for fixed number of cooperating threads to arrive:
        #define CNT1 (8*12) // Number of cooperating threads
    
        st.shared [r0],r1;     // write my result to shared memory
        bar.cta.sync  1, CNT1; // arrive, wait for others to arrive
        ld.shared r2,[r3];     // use shared results from other threads
    
    // Use bar.red.and to compare results across the entire CTA:
        setp.eq.u32 p,r1,r2;         // p is True if r1==r2
        bar.cta.red.and.pred r3,1,p; // r3=AND(p) forall threads in CTA
    
    // Use bar.red.popc to compute the size of a group of threads
    // that have a specific condition True:
        setp.eq.u32 p,r1,r2;         // p is True if r1==r2
        bar.cta.red.popc.u32 r3,1,p; // r3=SUM(p) forall threads in CTA
    
    // Examples of barrier.cta.sync
        st.shared         [r0],r1;
        barrier.cta.sync  0;
        ld.shared         r1, [r0];
    
    /* Producer/consumer model. The producer deposits a value in
     * shared memory, signals that it is complete but does not wait
     * using bar.arrive, and begins fetching more data from memory.
     * Once the data returns from memory, the producer must wait
     * until the consumer signals that it has read the value from
     * the shared memory location. In the meantime, a consumer
     * thread waits until the data is stored by the producer, reads
     * it, and then signals that it is done (without waiting).
     */
        // Producer code places produced value in shared memory.
        st.shared   [r0],r1;
        bar.arrive  0,64;
        ld.global   r1,[r2];
        bar.sync    1,64;
        ...
    
        // Consumer code, reads value from shared memory
        bar.sync   0,64;
        ld.shared  r1,[r0];
        bar.arrive 1,64;
        ...