---
name: ptx-kernel-and-function-directivesfunc
description: Function definition.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.2.2. Kernel and Function Directives:.func

---
title: "11.2.2. Kernel and Function Directives:.func"
section: 11.2.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.2.2. Kernel and Function Directives:.func


`.func`

Function definition.

Syntax

.func {.attribute(attr-list)} fname {.noreturn} {.abi_preserve N} {.abi_preserve_control N} function-body
    .func {.attribute(attr-list)} fname (param-list) {.noreturn} {.abi_preserve N} {.abi_preserve_control N} function-body
    .func {.attribute(attr-list)} (ret-param) fname (param-list) {.abi_preserve N} {.abi_preserve_control N} function-body

Description

Defines a function, including input and return parameters and optional function body.

An optional `.noreturn` directive indicates that the function does not return to the caller function. `.noreturn` directive cannot be specified on functions which have return parameters. See the description of `.noreturn` directive in [Performance-Tuning Directives: .noreturn](<#performance-tuning-directives-noreturn>).

An optional `.attribute` directive specifies additional information associated with the function. See the description of [Variable and Function Attribute Directive: .attribute](<#variable-and-function-attribute-directive-attribute>) for allowed attributes.

Optional `.abi_preserve` and `.abi_preserve_control` directives are used to specify the number of general purpose registers and control registers. See description of [Performance-Tuning Directives: .abi_preserve](<#performance-tuning-directives-abi-preserve>) and [Performance-Tuning Directives: .abi_preserve_control](<#performance-tuning-directives-abi-preserve-control>) for more details.

Directives, if any specified, for a function, e.g. `.noreturn`, must be specified consistently between function declaration and definition.

A `.func` definition with no body provides a function prototype.

The parameter lists define locally-scoped variables in the function body. Parameters must be base types in either the register or parameter state space. Parameters in register state space may be referenced directly within instructions in the function body. Parameters in `.param` space are accessed using `ld.param{::func}` and `st.param{::func}` instructions in the body. Parameter passing is call-by-value.

The last parameter in the parameter list may be a `.param` array of type `.b8` with no size specified. It is used to pass an arbitrary number of parameters to the function packed into a single array object.

When calling a function with such an unsized last argument, the last argument may be omitted from the `call` instruction if no parameter is passed through it. Accesses to this array parameter must be within the bounds of the array. The result of an access is undefined if no array was passed, or if the access was outside the bounds of the actual array being passed.

Semantics

The PTX syntax hides all details of the underlying calling convention and ABI.

The implementation of parameter passing is left to the optimizing translator, which may use a combination of registers and stack locations to pass parameters.

Release Notes

For PTX ISA version 1.x code, parameters must be in the register state space, there is no stack, and recursion is illegal.

PTX ISA versions 2.0 and later with target `sm_20` or higher allow parameters in the `.param` state space, implements an ABI with stack, and supports recursion.

PTX ISA versions 2.0 and later with target `sm_20` or higher support at most one return value.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Support for unsized array parameter introduced in PTX ISA version 6.0.

Support for `.noreturn` directive introduced in PTX ISA version 6.4.

Support for `.attribute` directive introduced in PTX ISA version 8.0.

Support for `.abi_preserve` and `.abi_preserve_control` directives introduced in PTX ISA version 9.0.

Target ISA Notes

Functions without unsized array parameter supported on all target architectures.

Unsized array parameter requires `sm_30` or higher.

`.noreturn` directive requires `sm_30` or higher.

`.attribute` directive requires `sm_90` or higher.

`.abi_preserve` and `.abi_preserve_control` directives require `sm_80` or higher.

Examples

.func (.reg .b32 rval) foo (.reg .b32 N, .reg .f64 dbl)
    {
    .reg .b32 localVar;
    
    ... use N, dbl;
    other code;
    
    mov.b32 rval,result;
    ret;
    }
    
    ...
    call (fooval), foo, (val0, val1);  // return value in fooval
    ...
    
    .func foo (.reg .b32 N, .reg .f64 dbl) .noreturn
    {
    .reg .b32 localVar;
    ... use N, dbl;
    other code;
    mov.b32 rval, result;
    ret;
    }
    ...
    call foo, (val0, val1);
    ...
    
    .func (.param .u32 rval) bar(.param .u32 N, .param .align 4 .b8 numbers[])
    {
        .reg .b32 input0, input1;
        ld.param.b32   input0, [numbers + 0];
        ld.param.b32   input1, [numbers + 4];
        ...
        other code;
        ret;
    }
    ...
    
    .param .u32 N;
    .param .align 4 .b8 numbers[8];
    st.param.u32    [N], 2;
    st.param.b32    [numbers + 0], 5;
    st.param.b32    [numbers + 4], 10;
    call (rval), bar, (N, numbers);
    ...