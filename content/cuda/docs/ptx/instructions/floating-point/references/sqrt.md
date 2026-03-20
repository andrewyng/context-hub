# PTX 指令专题：sqrt

`sqrt` 执行平方根计算，支持精确或近似相关变体（依章节定义）。

## 官方定位

- 文档章节：Floating Point Instructions: `sqrt`

## 核心约束

- 负输入、NaN、Inf 等边界语义以官方定义为准。
- 近似变体与精确变体的误差/性能需权衡。

## 示例（PTX 风格）

```ptx
sqrt.rn.f32 d, a;
```

## 官方来源链接（事实核验）

- sqrt: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sqrt
- Floating point instruction set: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

最后核对日期：2026-03-19
