---
name: ptx-integer-constant-expression-evaluation
description: Integer constant expressions are evaluated at compile time according
  to a set of rules that determine the type (signed `.s64` versus unsigned `.u64`)
  of each sub-expression. These rules are based on t...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.5.5. Integer Constant Expression Evaluation

---
title: "4.5.5. Integer Constant Expression Evaluation"
section: 4.5.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.5.5. Integer Constant Expression Evaluation


Integer constant expressions are evaluated at compile time according to a set of rules that determine the type (signed `.s64` versus unsigned `.u64`) of each sub-expression. These rules are based on the rules in C, but they’ve been simplified to apply only to 64-bit integers, and behavior is fully defined in all cases (specifically, for remainder and shift operators).

* Literals are signed unless unsigned is needed to prevent overflow, or unless the literal uses a `U` suffix. For example:  
  
    * `42`, `0x1234`, `0123` are signed.

    * `0xfabc123400000000`, `42U`, `0x1234U` are unsigned.

  * Unary plus and minus preserve the type of the input operand. For example:

    * `+123`, `-1`, `-(-42)` are signed.

    * `-1U`, `-0xfabc123400000000` are unsigned.

  * Unary logical negation (`!`) produces a signed result with value `0` or `1`.

  * Unary bitwise complement (`~`) interprets the source operand as unsigned and produces an unsigned result.

  * Some binary operators require normalization of source operands. This normalization is known as _the usual arithmetic conversions_ and simply converts both operands to unsigned type if either operand is unsigned.

  * Addition, subtraction, multiplication, and division perform the usual arithmetic conversions and produce a result with the same type as the converted operands. That is, the operands and result are unsigned if either source operand is unsigned, and is otherwise signed.

  * Remainder (`%`) interprets the operands as unsigned. Note that this differs from C, which allows a negative divisor but defines the behavior to be implementation dependent.

  * Left and right shift interpret the second operand as unsigned and produce a result with the same type as the first operand. Note that the behavior of right-shift is determined by the type of the first operand: right shift of a signed value is arithmetic and preserves the sign, and right shift of an unsigned value is logical and shifts in a zero bit.

  * AND (`&`), OR (`|`), and XOR (`^`) perform the usual arithmetic conversions and produce a result with the same type as the converted operands.

  * AND_OP (`&&`), OR_OP (`||`), Equal (`==`), and Not_Equal (`!=`) produce a signed result. The result value is 0 or 1.

  * Ordered comparisons (`<`, `<=`, `>`, `>=`) perform the usual arithmetic conversions on source operands and produce a signed result. The result value is `0` or `1`.

  * Casting of expressions to signed or unsigned is supported using (`.s64`) and (`.u64`) casts.

  * For the conditional operator ( `? :` ) , the first operand must be an integer, and the second and third operands are either both integers or both floating-point. The usual arithmetic conversions are performed on the second and third operands, and the result type is the same as the converted type.