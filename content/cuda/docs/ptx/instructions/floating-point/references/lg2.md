# PTX 指令专题：lg2

`lg2` 计算以 2 为底的对数。

## 官方定位

- 文档章节：Floating Point Instructions: `lg2`

## 核心约束

- 输入域和特殊值语义（0、负数、NaN）以官方定义为准。
- 近似与精确语义请按变体区分使用。

## 示例（PTX 风格）

```ptx
lg2.approx.f32 d, a;
```

## 官方来源链接（事实核验）

- lg2: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-lg2
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

最后核对日期：2026-03-19
