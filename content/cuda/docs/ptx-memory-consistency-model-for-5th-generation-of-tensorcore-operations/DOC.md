---
name: ptx-memory-consistency-model-for-5th-generation-of-tensorcore-operations
description: 'Ordering of `tcgen05` instructions is described in terms of two key
  concepts:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.16.6. Memory Consistency Model for 5th generation of TensorCore operations

---
title: "9.7.16.6. Memory Consistency Model for 5th generation of TensorCore operations"
section: 9.7.16.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.16.6. Memory Consistency Model for 5th generation of TensorCore operations


Ordering of `tcgen05` instructions is described in terms of two key concepts:

1. Pipelined tcgen05 instructions

  2. Specialized tcgen05-specific inter-thread synchronization mechanisms.

These concepts combine to form four canonical synchronization patterns, as described further below.

#####  9.7.16.6.1. [Asynchronous Operations](<#tcgen05-memory-consistency-model-async-operations>)

The tcgen05 family of instructions are divided into 2 categories:

  1. Asynchronous instructions:

These `tcgen05` operations are not inherently ordered with respect to other `tcgen05` operations in the same thread (unless pipelined as mentioned below).

  2. Synchronous instructions:

These `tcgen05` operations are inherently ordered with respect to other `tcgen05` operations in the same order.

The Tensor Memory allocation related instructions that access shared memory maintain same-address ordering with respect to non-`tcgen05` instructions.


The following table lists the category of each of the `tcgen05` instruction:

tcgen05.* operation | Category  
---|---  
`.alloc` |  Synchronous instructions  
`.dealloc`  
`.relinquish_alloc_permit`  
`.fence::*`  
`.wait::*`  
`.commit`  
`.mma` |  Asynchronous instructions  
`.cp`  
`.shift`  
`.ld`  
`.st`

#####  9.7.16.6.2. [Pipelined tcgen05 Instructions](<#tcgen05-memory-consistency-model-pipelined-instructions>)  
  
The asynchronous `tcgen05` operations may execute and complete in a different order than they were issued. However, some specific pairs of the asynchronous `tcgen05` instructions form `tcgen05` pipelines, where in the two asynchronous operations are guaranteed to execute in the same order as the instructions that issued them. The specific pairings are as follows:

  1. `tcgen05.mma.cta_group::N` -> `tcgen05.mma.cta_group::N` (same N and accumulator and shape)

  2. `tcgen05.copy.cta_group::N` -> `tcgen05.mma.cta_group::N` (same N)

  3. `tcgen05.shift.cta_group::N` -> `tcgen05.mma.cta_group::N` (same N)

  4. `tcgen05.shift.cta_group::N` -> `tcgen05.cp.4x256b.cta_group::N` (same N)

  5. `tcgen05.mma.cta_group::N` -> `tcgen05.shift.cta_group::N` (same N)


######  9.7.16.6.2.1. [Implicitly pipelined tcgen05 Instructions](<#tcgen05-memory-consistency-model-pipelined-instructions-implicit>)

Instructions `tcgen05.commit` and `tcgen05.wait` are implicitly pipelined with respect to previously issued `tcgen05.{mma,cp,shift}` and `tcgen05.{ld,st}` instructions respectively that they track from the same thread.

####### 9.7.16.6.2.1.1. [mbarrier based completion mechanism](<#tcgen05-memory-consistency-model-mbarrier-completion>)

Completion of the following instruction’s asynchronous operations is observed through the mbarrier based waiting mechanism:

  1. `tcgen05.mma`

  2. `tcgen05.cp`

  3. `tcgen05.shift`


`tcgen05.commit` is used to track the completion of the above asynchronous instructions.

Following are the implicitly pipelined `tcgen05` instruction pairing that uses mbarrier based completion mechanism:

  * `tcgen05.mma.cta_group::N` -> `tcgen05.commit.cta_group::N` (same N)

  * `tcgen05.cp.cta_group::N` -> `tcgen05.commit.cta_group::N` (same N)

  * `tcgen05.shift.cta_group::N` -> `tcgen05.commit.cta_group::N` (same N)


####### 9.7.16.6.2.1.2. [`tcgen05.wait` instruction based completion mechanism](<#tcgen05-memory-consistency-model-wait-completion>)

Completion of the following instruction’s asynchronous operations is observed through `tcgen05.wait` based waiting mechanism:

  1. `tcgen05.ld`

  2. `tcgen05.st`


`tcgen05.wait::ld` and `tcgen05.wait::st` is used to track the completion of the `tcgen05.ld` and `tcgen05.st` asynchronous instructions.

Following are the implicitly pipelined `tcgen05` instruction pairing that uses `tcgen05.wait` based completion mechanism:

  * `tcgen05.ld` -> `tcgen05.wait::ld`

  * `tcgen05.st` -> `tcgen05.wait::st`

#####  9.7.16.6.3. [Specialized Inter-thread Synchronization for tcgen05 instructions](<#tcgen05-memory-consistency-model-inter-thread-sync>)

The `tcgen05` instructions support a specialized inter-thread synchronization which are optimized for `tcgen05` family of instructions. The standard memory consistency model synchronization mechanisms also apply to the `tcgen05` family of instructions.

The [TensorCore 5th Generation Specialized Synchronization Operations](<#tcgen05-special-sync-operations>) section contains the specialized inter-thread synchronization for tcgen05 instructions.

The `tcgen05.fence::before_thread_sync` and `tcgen05.fence::after_thread_sync` composes with execution ordering instructions, like morally strong `ld`/`st`/`atom` instructions, `mbarrier` instruction, `barrier` instructions and so on, to establish an ordering between the `tcgen05` operations across threads. The asynchronous `tcgen05` instructions that are ordered across threads also form a `tcgen05` pipeline.

An asynchronous `tcgen05` operation prior to a `tcgen05.fence::before_thread_sync` is ordered before all subsequent `tcgen05` and the execution ordering operations.

An asynchronous `tcgen05` operation subsequent to a `tcgen05.fence::after_thread_sync` is ordered after all the prior `tcgen05` and the execution ordering operations.

#####  9.7.16.6.4. [Canonical synchronization patterns](<#tcgen05-memory-consistency-model-canonical-sync-patterns>)

Using the above rules, the following are the five canonical synchronization patterns:

######  9.7.16.6.4.1. [Pipelined instructions, same thread](<#tcgen05-memory-consistency-model-canonical-sync-patterns-pipelined-same-thread>)

In this pattern, no explicit ordering mechanism is needed and the ordering guarantee is provided by the pipelined instruction pairing.

Example:
    
    
    tcgen05.mma
    tcgen05.mma (same shape and accumulator)
    

The two instructions will be executed in program order.

######  9.7.16.6.4.2. [Non-pipelined instructions, same thread](<#tcgen05-memory-consistency-model-canonical-sync-patterns-non-pipelined-same-thread>)

In this pattern, explicit waiting mechanisms are used to wait for the completion of the asynchronous `tcgen05` operations.

Example 1:
    
    
    tcgen05.st
    tcgen05.wait::st
    tcgen05.ld
    

`tcgen05.wait::st` is used to wait for the completion of the prior asynchronous instruction `tcgen05.st`.

Example 2:
    
    
    tcgen05.mma [d], ...
    tcgen05.commit.mbarrier::arrive::one
    mbarrier.try_wait.relaxed.cluster (loop until successful)
    tcgen05.fence::after_thread_sync
    tcgen05.ld [d], ...
    

For the completion of the asynchronous `tcgen05.mma`, `tcgen05.commit` is used.

As `tcgen05.ld` is an asynchronous operation, the instruction `tcgen05.fence::after_thread_sync` is needed.

No explicit `tcgen05.fence::before_thread_sync` is needed as this is implicitly performed by `tcgen05.commit`. The combination of `tcgen05.mma` and `tcgen05.commit` forms a conceptual asynchronous pipeline and establishes execution ordering.
    
    
    tcgen05.mma [d], ...
    tcgen05.fence::before_thread_sync
    mbarrier::arrive
    

######  9.7.16.6.4.3. [Pipelined instructions, different thread](<#tcgen05-memory-consistency-model-canonical-sync-patterns-pipelined-diff-thread>)

In this pattern, no explicit waiting mechanism is needed but proper synchronization between threads is needed.

Example:

Thread 0 | Thread 1  
---|---  
      
    
    tcgen05.cp
    tcgen05.fence::before_thread_sync
    mbarrier.arrive.relaxed.cluster
    

|   
| 
    
    
    mbarrier.try_wait.relaxed.cluster // loop till success
    tcgen05.fence::after_thread_sync
    tcgen05.mma
      
  
######  9.7.16.6.4.4. [Non-pipelined instructions, different thread](<#tcgen05-memory-consistency-model-canonical-sync-patterns-non-pipelined-diff-thread>)

In this pattern, the producer threads that issue the asynchronous `tcgen05` instructions must explicitly wait for the instructions’ completion before synchronizing with the consumer threads.

Example 1:

Thread 0 | Thread 1  
---|---  
      
    
    tcgen05.ld
    tcgen05.wait::ld
    tcgen05.fence::before_thread_sync
    mbarrier.arrive.relaxed.cluster
    

|   
| 
    
    
    mbarrier.try_wait.relaxed.cluster // loop till success
    tcgen05.fence::after_thread_sync
    tcgen05.mma
      
  
Example 1:

Thread 0 | Thread 1  
---|---  
      
    
    tcgen05.mma
    tcgen05.commit.mbarrier::arrive::one [mbar]
    

|   
| 
    
    
    mbarrier.try_wait.relaxed.cluster [mbar] // loop till success
    tcgen05.fence::after_thread_sync
    tcgen05.ld
      
  
The synchronization mechanisms can also be composed with each other. For example:

Thread 0 | Thread 1  
---|---  
      
    
    tcgen05.mma
    tcgen05.commit.mbarrier::arrive::one [bar1]
    mbarrier.try_wait.relaxed.cluster [bar1] // loop
    ...
    tcgen05.fence::after_thread_sync
    ...// completion is guaranteed
    tcgen05.fence::before_thread_sync
    mbarrier.arrive.relaxed.cluster   [bar2] // loop
    ...
    

|   
| 
    
    
    mbarrier.try_wait.relaxed.cluster [bar2] // loop
    ...
    tcgen05.fence::after_thread_sync
    tcgen05.ld
      
  
######  9.7.16.6.4.5. [Register dependencies, same thread](<#tcgen05-memory-consistency-model-canonical-sync-patterns-reg-dependency-same-thread>)

For `tcgen05.ld`, an intra-thread ordering through true register dependency will be respected regardless of the presence or absence of other forms of synchronization. This form of register dependency does not imply any other form of ordering. For example, a register dependency does not imply that a dependee instruction’s memory accesses will be performed before a dependent instruction’s memory accesses. To enforce such memory orderings and avoiding anti-dependency hazards around `tcgen05.ld`, `tcgen05.wait::ld` must be used.

Example:
    
    
    tcgen05.ld %r1, ...;
    tcgen05.mma ..., %r1, ...;

#####  9.7.16.6.5. [Shared Memory Accesses](<#tcgen05-memory-consistency-model-smem-access>)

The shared memory accesses by `tcgen05.mma` and `tcgen05.cp` operations are performed in the asynchronous proxy (async proxy).

Accessing the same memory location across miltiple proxies needs a cross-proxy fence. For the async proxy, `fence.proxy.async` should be used to synchronize memory between generic proxy and the async proxy.