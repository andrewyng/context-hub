---
name: ptx-summary-of-constant-expression-evaluation-rules
description: '[Table 5](<#summary-of-constant-expression-evaluation-rules-constant-expression-evaluation-rules>)
  contains a summary of the constant expression evaluation rules.'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.5.6. Summary of Constant Expression Evaluation Rules

---
title: "4.5.6. Summary of Constant Expression Evaluation Rules"
section: 4.5.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.5.6. Summary of Constant Expression Evaluation Rules


[Table 5](<#summary-of-constant-expression-evaluation-rules-constant-expression-evaluation-rules>) contains a summary of the constant expression evaluation rules.

Table 5 Constant Expression Evaluation Rules Kind | Operator | Operand Types | Operand Interpretation | Result Type  
---|---|---|---|---  
Primary | `()` | any type | same as source | same as source  
constant literal | n/a | n/a | `.u64`, `.s64`, or `.f64`  
Unary | `+-` | any type | same as source | same as source  
`!` | integer | zero or non-zero | `.s64`  
`~` | integer | `.u64` | `.u64`  
Cast | `(.u64)` | integer | `.u64` | `.u64`  
`(.s64)` | integer | `.s64` | `.s64`  
Binary | `+- * /` | `.f64` | `.f64` | `.f64`  
integer | use usual conversions | converted type  
`< > <= >=` | `.f64` | `.f64` | `.s64`  
integer | use usual conversions | `.s64`  
`== !=` | `.f64` | `.f64` | `.s64`  
integer | use usual conversions | `.s64`  
`%` | integer | `.u64` | `.s64`  
`>> <<` | integer | 1st unchanged, 2nd is `.u64` | same as 1st operand  
`& | ^` | integer | `.u64` | `.u64`  
`&& ||` | integer | zero or non-zero | `.s64`  
Ternary | `?:` | `int ? .f64 : .f64` | same as sources | `.f64`  
`int ? int : int` | use usual conversions | converted type