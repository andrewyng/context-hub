---
name: ptx-floating-point-comparisons
description: The ordered floating-point comparisons are `eq`, `ne`, `lt`, `le`, `gt`,
  and `ge`. If either operand is `NaN`, the result is `False`. [Table 23](<#floating-point-comparisons-floating-point-operators>)...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.3.1.2. Floating Point Comparisons

---
title: "9.3.1.2. Floating Point Comparisons"
section: 9.3.1.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.3.1.2. Floating Point Comparisons


The ordered floating-point comparisons are `eq`, `ne`, `lt`, `le`, `gt`, and `ge`. If either operand is `NaN`, the result is `False`. [Table 23](<#floating-point-comparisons-floating-point-operators>) lists the floating-point comparison operators.

Table 23 Floating-Point Comparison Operators Meaning | Floating-Point Operator  
---|---  
`a == b && !isNaN(a) && !isNaN(b)` | `eq`  
`a != b && !isNaN(a) && !isNaN(b)` | `ne`  
`a < b && !isNaN(a) && !isNaN(b)` | `lt`  
`a <= b && !isNaN(a) && !isNaN(b)` | `le`  
`a > b && !isNaN(a) && !isNaN(b)` | `gt`  
`a >= b && !isNaN(a) && !isNaN(b)` | `ge`

To aid comparison operations in the presence of `NaN` values, unordered floating-point comparisons are provided: `equ`, `neu`, `ltu`, `leu`, `gtu`, and `geu`. If both operands are numeric values (not `NaN`), then the comparison has the same result as its ordered counterpart. If either operand is `NaN`, then the result of the comparison is `True`.

[Table 24](<#floating-point-comparisons-floating-point-operators-nan>) lists the floating-point comparison operators accepting `NaN` values.

Table 24 Floating-Point Comparison Operators Accepting NaN Meaning | Floating-Point Operator  
---|---  
`a == b || isNaN(a) || isNaN(b)` | `equ`  
`a != b || isNaN(a) || isNaN(b)` | `neu`  
`a < b || isNaN(a) || isNaN(b)` | `ltu`  
`a <= b || isNaN(a) || isNaN(b)` | `leu`  
`a > b || isNaN(a) || isNaN(b)` | `gtu`  
`a >= b || isNaN(a) || isNaN(b)` | `geu`

To test for `NaN` values, two operators `num` (`numeric`) and `nan` (`isNaN`) are provided. `num` returns `True` if both operands are numeric values (not `NaN`), and `nan` returns `True` if either operand is `NaN`. [Table 25](<#floating-point-comparisons-floating-point-operators-testing-nan>) lists the floating-point comparison operators testing for `NaN` values.

Table 25 Floating-Point Comparison Operators Testing for NaN Meaning | Floating-Point Operator  
---|---  
`!isNaN(a) && !isNaN(b)` | `num`  
`isNaN(a) || isNaN(b)` | `nan`