# PTX 指令专题：ex2

`ex2` 计算 `2^x`，与 `lg2` 常成对出现。

## 官方定位

- 文档章节：Floating Point Instructions: `ex2`
- 相关扩展：Half precision `ex2`

## 示例（PTX 风格）

```ptx
ex2.approx.f32 d, a;
```

## 官方来源链接（事实核验）

- ex2: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-ex2
- Half precision ex2: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-ex2

最后核对日期：2026-03-19
