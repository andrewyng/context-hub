---
name: ptx-stbulk
description: Initializes a region of memory as specified by state space.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.13. Data Movement and Conversion Instructions:st.bulk

---
title: "9.7.9.13. Data Movement and Conversion Instructions:st.bulk"
section: 9.7.9.13
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.13. Data Movement and Conversion Instructions:st.bulk


`st.bulk`

Initializes a region of memory as specified by state space.

Syntax

st.bulk{.weak}{.shared::cta}  [a], size, initval; // initval must be zero

Description

`st.bulk` instruction initializes a region of shared memory starting from the location specified by destination address operand `a`.

The 32-bit or 64-bit integer operand `size` specifies the amount of memory to be initialized in terms of number of bytes. `size` must be a multiple of 8. If the value is not a multiple of 8, then the behavior is undefined. The maximum value of `size` operand can be 16777216.

The integer immediate operand `initval` specifies the initialization value for the memory locations. The only numeric value allowed for operand `initval` is 0.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `a` does not fall within the address window of `.shared` state space then the behavior is undefined.

The optional qualifier `.weak` specify the memory synchronizing effect of the `st.bulk` instruction as described in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Support for `size` operand with 32-bit length is introduced in PTX ISA version 9.0.

Target ISA Notes

Requires `sm_100` or higher.

Examples

st.bulk.weak.shared::cta  [dst], n, 0;
    
    st.bulk                   [gdst], 4096, 0;