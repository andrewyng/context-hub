---
name: ptx-integer-and-bit-size-comparisons
description: The signed integer comparisons are the traditional `eq` (equal), `ne`
  (not-equal), `lt` (less-than), `le` (less-than-or-equal), `gt` (greater-than), and
  `ge` (greater-than-or-equal). The unsigned comp...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.3.1.1. Integer and Bit-Size Comparisons

---
title: "9.3.1.1. Integer and Bit-Size Comparisons"
section: 9.3.1.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.3.1.1. Integer and Bit-Size Comparisons


The signed integer comparisons are the traditional `eq` (equal), `ne` (not-equal), `lt` (less-than), `le` (less-than-or-equal), `gt` (greater-than), and `ge` (greater-than-or-equal). The unsigned comparisons are `eq`, `ne`, `lo` (lower), `ls` (lower-or-same), `hi` (higher), and `hs` (higher-or-same). The bit-size comparisons are `eq` and `ne`; ordering comparisons are not defined for bit-size types.

[Table 22](<#integer-and-bit-size-comparisons-operators-for-signed-integer-unsigned-integer-and-bit-size-types>) shows the operators for signed integer, unsigned integer, and bit-size types.

Table 22 Operators for Signed Integer, Unsigned Integer, and Bit-Size Types Meaning | Signed Operator | Unsigned Operator | Bit-Size Operator  
---|---|---|---  
`a == b` | `eq` | `eq` | `eq`  
`a != b` | `ne` | `ne` | `ne`  
`a < b` | `lt` | `lo` | n/a  
`a <= b` | `le` | `ls` | n/a  
`a > b` | `gt` | `hi` | n/a  
`a >= b` | `ge` | `hs` | n/a