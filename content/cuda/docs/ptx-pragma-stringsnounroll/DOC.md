---
name: ptx-pragma-stringsnounroll
description: Disable loop unrolling in optimizing the backend compiler.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 12.1. Pragma Strings:

---
title: "12.1. Pragma Strings:"nounroll""
section: 12.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 12.1. Pragma Strings:"nounroll"


`"nounroll"`

Disable loop unrolling in optimizing the backend compiler.

Syntax

.pragma "nounroll";

Description

The `"nounroll" pragma` is a directive to disable loop unrolling in the optimizing backend compiler.

The `"nounroll" pragma` is allowed at module, entry-function, and statement levels, with the following meanings:

module scope  
    

disables unrolling for all loops in module, including loops preceding the `.pragma`.

entry-function scope
    

disables unrolling for all loops in the entry function body.

statement-level pragma
    

disables unrolling of the loop for which the current block is the loop header.

Note that in order to have the desired effect at statement level, the `"nounroll"` directive must appear before any instruction statements in the loop header basic block for the desired loop. The loop header block is defined as the block that dominates all blocks in the loop body and is the target of the loop backedge. Statement-level `"nounroll"` directives appearing outside of loop header blocks are silently ignored.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

Requires `sm_20` or higher. Ignored for `sm_1x` targets.

Examples

.entry foo (...)
    .pragma "nounroll";  // do not unroll any loop in this function
    {
    ...
    }
    
    .func bar (...)
    {
    ...
    L1_head:
         .pragma "nounroll";  // do not unroll this loop
         ...
    @p   bra L1_end;
    L1_body:
         ...
    L1_continue:
         bra L1_head;
    L1_end:
         ...
    }