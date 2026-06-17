---
name: ptx-control-flow-directivescallprototype
description: Declare a prototype for use in an indirect call.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.3.3. Control Flow Directives:.callprototype

---
title: "11.3.3. Control Flow Directives:.callprototype"
section: 11.3.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.3.3. Control Flow Directives:.callprototype


`.callprototype`

Declare a prototype for use in an indirect call.

Syntax

// no input or return parameters
    label: .callprototype _ .noreturn {.abi_preserve N} {.abi_preserve_control N};
    // input params, no return params
    label: .callprototype _ (param-list) .noreturn {.abi_preserve N} {.abi_preserve_control N};
    // no input params, // return params
    label: .callprototype (ret-param) _ {.abi_preserve N} {.abi_preserve_control N};
    // input, return parameters
    label: .callprototype (ret-param) _ (param-list) {.abi_preserve N} {.abi_preserve_control N};

Description

Defines a prototype with no specific function name, and associates the prototype with a label. The prototype may then be used in indirect call instructions where there is incomplete knowledge of the possible call targets.

Parameters may have either base types in the register or parameter state spaces, or array types in parameter state space. The sink symbol `'_'` may be used to avoid dummy parameter names.

An optional `.noreturn` directive indicates that the function does not return to the caller function. `.noreturn` directive cannot be specified on functions which have return parameters. See the description of .noreturn directive in [Performance-Tuning Directives: .noreturn](<#performance-tuning-directives-noreturn>).

Optional `.abi_preserve` and `.abi_preserve_control` directives are used to specify the number of general purpose registers and control registers. See description of [Performance-Tuning Directives: .abi_preserve](<#performance-tuning-directives-abi-preserve>) and [Performance-Tuning Directives: .abi_preserve_control](<#performance-tuning-directives-abi-preserve-control>) for more details.

PTX ISA Notes

Introduced in PTX ISA version 2.1.

Support for `.noreturn` directive introduced in PTX ISA version 6.4.

Support for `.abi_preserve` and `.abi_preserve_control` directives introduced in PTX ISA version 9.0.

Target ISA Notes

Requires `sm_20` or higher.

`.noreturn` directive requires `sm_30` or higher.

`.abi_preserve` and `.abi_preserve_control` directives require `sm_80` or higher.

Examples

Fproto1: .callprototype  _ ;
    Fproto2: .callprototype  _ (.param .f32 _);
    Fproto3: .callprototype  (.param .u32 _) _ ;
    Fproto4: .callprototype  (.param .u32 _) _ (.param .f32 _);
    ...
    @p   call  (%val), %r0, (%f1), Fproto4;
    ...
    
    // example of array parameter
    Fproto5: .callprototype _ (.param .b8 _[12]);
    
    Fproto6: .callprototype  _ (.param .f32 _) .noreturn;
    ...
    @p   call  %r0, (%f1), Fproto6;
    ...
    
    // example of .abi_preserve
    Fproto7: .callprototype _ (.param .b32 _) .abi_preserve 10;
    ...
    @p   call %r0, (%r1), Fproto7;
    ...