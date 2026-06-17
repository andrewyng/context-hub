---
name: ptx-call
description: Call a function, recording the return location.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.12.5. Control Flow Instructions:call

---
title: "9.7.12.5. Control Flow Instructions:call"
section: 9.7.12.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.12.5. Control Flow Instructions:call


`call`

Call a function, recording the return location.

Syntax

// direct call to named function, func is a symbol
    call{.uni} (ret-param), func, (param-list);
    call{.uni} func, (param-list);
    call{.uni} func;
    
    // indirect call via pointer, with full list of call targets
    call{.uni} (ret-param), fptr, (param-list), flist;
    call{.uni} fptr, (param-list), flist;
    call{.uni} fptr, flist;
    
    // indirect call via pointer, with no knowledge of call targets
    call{.uni} (ret-param), fptr, (param-list), fproto;
    call{.uni} fptr, (param-list), fproto;
    call{.uni} fptr, fproto;

Description

The `call` instruction stores the address of the next instruction, so execution can resume at that point after executing a `ret` instruction. A `call` is assumed to be divergent unless the `.uni` suffix is present. The `.uni` suffix indicates that the `call` is guaranteed to be non-divergent, i.e. all active threads in a warp that are currently executing this instruction have identical values for the guard predicate and `call` target.

For direct calls, the called location `func` must be a symbolic function name; for indirect calls, the called location `fptr` must be an address of a function held in a register. Input arguments and return values are optional. Arguments may be registers, immediate constants, or variables in `.param` space. Arguments are pass-by-value.

Indirect calls require an additional operand, `flist` or `fproto`, to communicate the list of potential `call` targets or the common function prototype of all `call` targets, respectively. In the first case, `flist` gives a complete list of potential `call` targets and the optimizing backend is free to optimize the calling convention. In the second case, where the complete list of potential `call` targets may not be known, the common function prototype is given and the `call` must obey the ABI’s calling convention.

The `flist` operand is either the name of an array (call table) initialized to a list of function names; or a label associated with a `.calltargets` directive, which declares a list of potential `call` targets. In both cases the fptr register holds the address of a function listed in the call table or `.calltargets` list, and the `call` operands are type-checked against the type signature of the functions indicated by `flist`.

The fproto operand is the name of a label associated with a `.callprototype` directive. This operand is used when a complete list of potential targets is not known. The `call` operands are type-checked against the prototype, and code generation will follow the ABI calling convention. If a function that doesn’t match the prototype is called, the behavior is undefined.

Call tables may be declared at module scope or local scope, in either the constant or global state space. The `.calltargets` and `.callprototype` directives must be declared within a function body. All functions must be declared prior to being referenced in a `call` table initializer or `.calltargets` directive.

PTX ISA Notes

Direct `call` introduced in PTX ISA version 1.0. Indirect `call` introduced in PTX ISA version 2.1.

Target ISA Notes

Direct `call` supported on all target architectures. Indirect `call` requires `sm_20` or higher.

Examples

// examples of direct call
        call     init;    // call function 'init'
        call.uni g, (a);  // call function 'g' with parameter 'a'
    @p  call     (d), h, (a, b);  // return value into register d
    
    // call-via-pointer using jump table
    .func (.reg .u32 rv) foo (.reg .u32 a, .reg .u32 b) ...
    .func (.reg .u32 rv) bar (.reg .u32 a, .reg .u32 b) ...
    .func (.reg .u32 rv) baz (.reg .u32 a, .reg .u32 b) ...
    
    .global .u32 jmptbl[5] = { foo, bar, baz };
          ...
    @p    ld.global.u32  %r0, [jmptbl+4];
    @p    ld.global.u32  %r0, [jmptbl+8];
          call  (retval), %r0, (x, y), jmptbl;
    
    // call-via-pointer using .calltargets directive
    .func (.reg .u32 rv) foo (.reg .u32 a, .reg .u32 b) ...
    .func (.reg .u32 rv) bar (.reg .u32 a, .reg .u32 b) ...
    .func (.reg .u32 rv) baz (.reg .u32 a, .reg .u32 b) ...
          ...
    @p    mov.u32  %r0, foo;
    @q    mov.u32  %r0, baz;
    Ftgt: .calltargets foo, bar, baz;
          call  (retval), %r0, (x, y), Ftgt;
    
    // call-via-pointer using .callprototype directive
    .func dispatch (.reg .u32 fptr, .reg .u32 idx)
    {
    ...
    Fproto: .callprototype _ (.param .u32 _, .param .u32 _);
          call  %fptr, (x, y), Fproto;
    ...