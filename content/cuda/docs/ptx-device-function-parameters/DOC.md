---
name: ptx-device-function-parameters
description: PTX ISA version 2.0 extended the use of parameter space to device function
  parameters. The most common use is for passing objects by value that do not fit
  within a PTX register, such as C structures l...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.6.4. Device Function Parameters

---
title: "5.1.6.4. Device Function Parameters"
section: 5.1.6.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.1.6.4. Device Function Parameters


PTX ISA version 2.0 extended the use of parameter space to device function parameters. The most common use is for passing objects by value that do not fit within a PTX register, such as C structures larger than 8 bytes. In this case, a byte array in parameter space is used. Typically, the caller will declare a locally-scoped `.param` byte array variable that represents a flattened C structure or union. This will be passed by value to a callee, which declares a `.param` formal parameter having the same size and alignment as the passed argument.

Example

// pass object of type struct { double d; int y; };
    .func foo ( .reg .b32 N, .param .align 8 .b8 buffer[12] )
    {
        .reg .f64 %d;
        .reg .s32 %y;
    
        ld.param.f64 %d, [buffer];
        ld.param.s32 %y, [buffer+8];
        ...
    }
    
    // code snippet from the caller
    // struct { double d; int y; } mystruct; is flattened, passed to foo
        ...
        .reg .f64 dbl;
        .reg .s32 x;
        .param .align 8 .b8 mystruct;
        ...
        st.param.f64 [mystruct+0], dbl;
        st.param.s32 [mystruct+8], x;
        call foo, (4, mystruct);
        ...

See the section on function call syntax for more details.

Function input parameters may be read via `ld.param` and function return parameters may be written using `st.param`; it is illegal to write to an input parameter or read from a return parameter.

Aside from passing structures by value, `.param` space is also required whenever a formal parameter has its address taken within the called function. In PTX, the address of a function input parameter may be moved into a register using the `mov` instruction. Note that the parameter will be copied to the stack if necessary, and so the address will be in the `.local` state space and is accessed via `ld.local` and `st.local` instructions. It is not possible to use `mov` to get the address of or a locally-scoped `.param` space variable. Starting PTX ISA version 6.0, it is possible to use `mov` instruction to get address of return parameter of device function.

Example

// pass array of up to eight floating-point values in buffer
    .func foo ( .param .b32 N, .param .b32 buffer[32] )
    {
        .reg .u32  %n, %r;
        .reg .f32  %f;
        .reg .pred %p;
    
        ld.param.u32 %n, [N];
        mov.u32      %r, buffer;  // forces buffer to .local state space
    Loop:
        setp.eq.u32  %p, %n, 0;
    @%p bra         Done;
        ld.local.f32 %f, [%r];
        ...
        add.u32      %r, %r, 4;
        sub.u32      %n, %n, 1;
        bra          Loop;
    Done:
        ...
    }