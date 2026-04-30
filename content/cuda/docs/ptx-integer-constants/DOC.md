---
name: ptx-integer-constants
description: Integer constants are 64-bits in size and are either signed or unsigned,
  i.e., every integer constant has type `.s64` or `.u64`. The signed/unsigned nature
  of an integer constant is needed to correctl...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.5.1. Integer Constants

---
title: "4.5.1. Integer Constants"
section: 4.5.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.5.1. Integer Constants


Integer constants are 64-bits in size and are either signed or unsigned, i.e., every integer constant has type `.s64` or `.u64`. The signed/unsigned nature of an integer constant is needed to correctly evaluate constant expressions containing operations such as division and ordered comparisons, where the behavior of the operation depends on the operand types. When used in an instruction or data initialization, each integer constant is converted to the appropriate size based on the data or instruction type at its use.

Integer literals may be written in decimal, hexadecimal, octal, or binary notation. The syntax follows that of C. Integer literals may be followed immediately by the letter `U` to indicate that the literal is unsigned.

hexadecimal literal:  0[xX]{hexdigit}+U?
    octal literal:        0{octal digit}+U?
    binary literal:       0[bB]{bit}+U?
    decimal literal       {nonzero-digit}{digit}*U?

Integer literals are non-negative and have a type determined by their magnitude and optional type suffix as follows: literals are signed (`.s64`) unless the value cannot be fully represented in `.s64` or the unsigned suffix is specified, in which case the literal is unsigned (`.u64`).

The predefined integer constant `WARP_SZ` specifies the number of threads per warp for the target platform; to date, all target architectures have a `WARP_SZ` value of 32.