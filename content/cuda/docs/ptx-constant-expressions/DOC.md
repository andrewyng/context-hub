---
name: ptx-constant-expressions
description: In PTX, constant expressions are formed using operators as in C and are
  evaluated using rules similar to those in C, but simplified by restricting types
  and sizes, removing most casts, and defining fu...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.5.4. Constant Expressions

---
title: "4.5.4. Constant Expressions"
section: 4.5.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.5.4. Constant Expressions


In PTX, constant expressions are formed using operators as in C and are evaluated using rules similar to those in C, but simplified by restricting types and sizes, removing most casts, and defining full semantics to eliminate cases where expression evaluation in C is implementation dependent.

Constant expressions are formed from constant literals, unary plus and minus, basic arithmetic operators (addition, subtraction, multiplication, division), comparison operators, the conditional ternary operator ( `?:` ), and parentheses. Integer constant expressions also allow unary logical negation (`!`), bitwise complement (`~`), remainder (`%`), shift operators (`<<` and `>>`), bit-type operators (`&`, `|`, and `^`), and logical operators (`&&`, `||`).

Constant expressions in PTX do not support casts between integer and floating-point.

Constant expressions are evaluated using the same operator precedence as in C. [Table 4](<#constant-expressions-operator-precedence>) gives operator precedence and associativity. Operator precedence is highest for unary operators and decreases with each line in the chart. Operators on the same line have the same precedence and are evaluated right-to-left for unary operators and left-to-right for binary operators.

Table 4 Operator Precedence Kind | Operator Symbols | Operator Names | Associates  
---|---|---|---  
Primary | `()` | parenthesis | n/a  
Unary | `+- ! ~` | plus, minus, negation, complement | right  
`(.s64)``(.u64)` | casts | right  
Binary | `*/ %` | multiplication, division, remainder | left  
`+-` | addition, subtraction  
`>> <<` | shifts  
`< > <= >=` | ordered comparisons  
`== !=` | equal, not equal  
`&` | bitwise AND  
`^` | bitwise XOR  
`|` | bitwise OR  
`&&` | logical AND  
`||` | logical OR  
Ternary | `?:` | conditional | right