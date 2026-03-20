# PTX 指令专题：cos

`cos` 计算余弦函数，是三角函数路径常用指令。

## 官方定位

- 文档章节：Floating Point Instructions: `cos`

## 示例（PTX 风格）

```ptx
cos.approx.f32 d, a;
```

## 官方来源链接（事实核验）

- cos: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-cos
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

最后核对日期：2026-03-19
