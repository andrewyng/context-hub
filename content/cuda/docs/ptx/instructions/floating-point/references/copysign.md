# PTX 指令专题：copysign

`copysign` 返回带有第二操作数符号位的第一操作数值。

## 官方定位

- 文档章节：Floating Point Instructions: `copysign`

## 示例（PTX 风格）

```ptx
copysign.f32 d, a, b;
```

## 官方来源链接（事实核验）

- copysign: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-copysign
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

最后核对日期：2026-03-19
