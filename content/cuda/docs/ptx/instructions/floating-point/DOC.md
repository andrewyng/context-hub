---
name: ptx-floating-point-instructions
description: "PTX floating-point instructions, rounding behavior, and type constraints in ISA 9.2."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,floating-point,math"
---

# PTX Floating-Point

本页聚焦 PTX 浮点路径、舍入语义和常见陷阱。

## 常见指令

- `add` / `sub` / `mul`
- `fma`
- `div`
- `sqrt`

## 语法示例（PTX 风格）

```ptx
fma.rn.f32 d, a, b, c;
sqrt.rn.f32 d, a;
```

## 约束与坑点

- 必须明确舍入修饰（如 `.rn`）。
- 半精度/混合精度路径受目标架构影响较大。
- 特殊值（NaN/Inf）行为以官方章节语义为准。

## 使用建议

- 推理/训练内核分开验证数值精度。
- 混合精度链路建议加参考实现比对误差。

## 官方来源链接（事实核验）

- Floating Point Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions
- fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-fma
- sqrt: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sqrt
- Half Precision instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions

最后核对日期：2026-03-19

## 单指令专题
- `references/add.md`
- `references/sub.md`
- `references/mul.md`
- `references/fma.md`
- `references/sqrt.md`
- `references/rcp.md`
- `references/rsqrt.md`
- `references/sin.md`
- `references/cos.md`
- `references/lg2.md`
- `references/ex2.md`
- `references/tanh.md`
- `references/copysign.md`
- `references/testp.md`
