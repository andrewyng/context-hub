---
name: ptx-variable-and-function-attribute-directiveattribute
description: Variable and function attributes
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.8. Variable and Function Attribute Directive:.attribute

---
title: "5.4.8. Variable and Function Attribute Directive:.attribute"
section: 5.4.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.8. Variable and Function Attribute Directive:.attribute


`.attribute`

Variable and function attributes

Description

Used to specify special attributes of a variable or a function.

The following attributes are supported.

`.managed`
    

`.managed` attribute specifies that variable will be allocated at a location in unified virtual memory environment where host and other devices in the system can reference the variable directly. This attribute can only be used with variables in .global state space. See the _CUDA UVM-Lite Programming Guide_ for details.

`.unified`
    

`.unified` attribute specifies that function has the same memory address on the host and on other devices in the system. Integer constants `uuid1` and `uuid2` respectively specify upper and lower 64 bits of the unique identifier associated with the function or the variable. This attribute can only be used on device functions or on variables in the `.global` state space. Variables with `.unified` attribute are read-only and must be loaded by specifying `.unified` qualifier on the address operand of `ld` instruction, otherwise the behavior is undefined.

PTX ISA Notes

* Introduced in PTX ISA version 4.0.

  * Support for function attributes introduced in PTX ISA version 8.0.

Target ISA Notes

* `.managed` attribute requires `sm_30` or higher.

  * `.unified` attribute requires `sm_90` or higher.

Examples

.global .attribute(.managed) .s32 g;
    .global .attribute(.managed) .u64 x;
    
    .global .attribute(.unified(19,95)) .f32 f;
    
    .func .attribute(.unified(0xAB, 0xCD)) bar() { ... }