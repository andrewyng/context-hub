---
name: ptx-initializers
description: Declared variables may specify an initial value using a syntax similar
  to C/C++, where the variable name is followed by an equals sign and the initial
  value or values for the variable. A scalar takes ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.4. Initializers

---
title: "5.4.4. Initializers"
section: 5.4.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.4. Initializers


Declared variables may specify an initial value using a syntax similar to C/C++, where the variable name is followed by an equals sign and the initial value or values for the variable. A scalar takes a single value, while vectors and arrays take nested lists of values inside of curly braces (the nesting matches the dimensionality of the declaration).

As in C, array initializers may be incomplete, i.e., the number of initializer elements may be less than the extent of the corresponding array dimension, with remaining array locations initialized to the default value for the specified array type.

Examples

.const  .f32 vals[8] = { 0.33, 0.25, 0.125 };
    .global .s32 x[3][2] = { {1,2}, {3} };

is equivalent to

.const  .f32 vals[8] = { 0.33, 0.25, 0.125, 0.0, 0.0, 0.0, 0.0, 0.0 };
    .global .s32 x[3][2] = { {1,2}, {3,0}, {0,0} };

Currently, variable initialization is supported only for constant and global state spaces. Variables in constant and global state spaces with no explicit initializer are initialized to zero by default. Initializers are not allowed in external variable declarations.

Variable names appearing in initializers represent the address of the variable; this can be used to statically initialize a pointer to a variable. Initializers may also contain _var+offset_ expressions, where _offset_ is a byte offset added to the address of _var_. Only variables in `.global` or `.const` state spaces may be used in initializers. By default, the resulting address is the offset in the variable’s state space (as is the case when taking the address of a variable with a `mov` instruction). An operator, `generic()`, is provided to create a generic address for variables used in initializers.

Starting PTX ISA version 7.1, an operator `mask()` is provided, where `mask` is an integer immediate. The only allowed expressions in the `mask()` operator are integer constant expression and symbol expression representing address of variable. The `mask()` operator extracts `n` consecutive bits from the expression used in initializers and inserts these bits at the lowest position of the initialized variable. The number `n` and the starting position of the bits to be extracted is specified by the integer immediate `mask`. PTX ISA version 7.1 only supports extracting a single byte starting at byte boundary from the address of the variable. PTX ISA version 7.3 supports Integer constant expression as an operand in the `mask()` operator.

Supported values for `mask` are: 0xFF, 0xFF00, 0XFF0000, 0xFF000000, 0xFF00000000, 0xFF0000000000, 0xFF000000000000, 0xFF00000000000000.

Examples

.const  .u32 foo = 42;
    .global .u32 bar[] = { 2, 3, 5 };
    .global .u32 p1 = foo;          // offset of foo in .const space
    .global .u32 p2 = generic(foo); // generic address of foo
    
    // array of generic-address pointers to elements of bar
    .global .u32 parr[] = { generic(bar), generic(bar)+4,
    generic(bar)+8 };
    
    // examples using mask() operator are pruned for brevity
    .global .u8 addr[] = {0xff(foo), 0xff00(foo), 0xff0000(foo), ...};
    
    .global .u8 addr2[] = {0xff(foo+4), 0xff00(foo+4), 0xff0000(foo+4),...}
    
    .global .u8 addr3[] = {0xff(generic(foo)), 0xff00(generic(foo)),...}
    
    .global .u8 addr4[] = {0xff(generic(foo)+4), 0xff00(generic(foo)+4),...}
    
    // mask() operator with integer const expression
    .global .u8 addr5[] = { 0xFF(1000 + 546), 0xFF00(131187), ...};

Note  
  
PTX 3.1 redefines the default addressing for global variables in initializers, from generic addresses to offsets in the global state space. Legacy PTX code is treated as having an implicit `generic()` operator for each global variable used in an initializer. PTX 3.1 code should either include explicit `generic()` operators in initializers, use `cvta.global` to form generic addresses at runtime, or load from the non-generic address using `ld.global`.

Device function names appearing in initializers represent the address of the first instruction in the function; this can be used to initialize a table of function pointers to be used with indirect calls. Beginning in PTX ISA version 3.1, kernel function names can be used as initializers e.g. to initialize a table of kernel function pointers, to be used with CUDA Dynamic Parallelism to launch kernels from GPU. See the _CUDA Dynamic Parallelism Programming Guide_ for details.

Labels cannot be used in initializers.

Variables that hold addresses of variables or functions should be of type `.u8` or `.u32` or `.u64`.

Type `.u8` is allowed only if the `mask()` operator is used.

Initializers are allowed for all types except `.f16`, `.f16x2` and `.pred`.

Examples

.global .s32 n = 10;
    .global .f32 blur_kernel[][3]
                   = {{.05,.1,.05},{.1,.4,.1},{.05,.1,.05}};
    
    .global .u32 foo[] = { 2, 3, 5, 7, 9, 11 };
    .global .u64 ptr = generic(foo);   // generic address of foo[0]
    .global .u64 ptr = generic(foo)+8; // generic address of foo[2]