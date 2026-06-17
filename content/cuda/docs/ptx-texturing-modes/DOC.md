---
name: ptx-texturing-modes
description: For working with textures and samplers, PTX has two modes of operation.
  In the _unified mode,_ texture and sampler information is accessed through a single
  `.texref` handle. In the _independent mode_ ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.10.1. Texturing Modes

---
title: "9.7.10.1. Texturing Modes"
section: 9.7.10.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.10.1. Texturing Modes


For working with textures and samplers, PTX has two modes of operation. In the _unified mode,_ texture and sampler information is accessed through a single `.texref` handle. In the _independent mode_ , texture and sampler information each have their own handle, allowing them to be defined separately and combined at the site of usage in the program.

The advantage of unified mode is that it allows 256 samplers per kernel (128 for architectures prior to `sm_3x`), with the restriction that they correspond 1-to-1 with the 256 possible textures per kernel (128 for architectures prior to `sm_3x`). The advantage of independent mode is that textures and samplers can be mixed and matched, but the number of samplers is greatly restricted to 32 per kernel (16 for architectures prior to `sm_3x`).

[Table 34](<#texturing-modes-textures-samplers-surfaces>) summarizes the number of textures, samplers and surfaces available in different texturing modes.

Table 34 Texture, sampler and surface limits Texturing mode | Resource | `sm_1x`, `sm_2x` | `sm_3x+`  
---|---|---|---  
Unified mode | Textures | 128 | 256  
Samplers | 128 | 256  
Surfaces | 8 | 16  
Independent mode | Textures | 128 | 256  
Samplers | 16 | 32  
Surfaces | 8 | 16

The texturing mode is selected using `.target` options `texmode_unified` and `texmode_independent`. A PTX module may declare only one texturing mode. If no texturing mode is declared, the module is assumed to use unified mode.

**Example** : calculate an element’s power contribution as element’s power/total number of elements.

.target texmode_independent
    .global .samplerref tsamp1 = { addr_mode_0 = clamp_to_border,
                                   filter_mode = nearest
                                 };
    ...
    .entry compute_power
      ( .param .texref tex1 )
    {
      txq.width.b32  r6, [tex1]; // get tex1's width
      txq.height.b32 r5, [tex1]; // get tex1's height
      tex.2d.v4.f32.f32  {r1,r2,r3,r4}, [tex1, tsamp1, {f1,f2}];
      mul.u32 r5, r5, r6;
      add.f32 r1, r1, r2;
      add.f32 r3, r3, r4;
      add.f32 r1, r1, r3;
      cvt.f32.u32 r5, r5;
      div.f32 r1, r1, r5;
    }