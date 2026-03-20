# PTX 指令专题：sin

`sin` 计算正弦函数，提供对应浮点变体。

## 官方定位

- 文档章节：Floating Point Instructions: `sin`

## 核心约束

- 通常存在近似计算特性，精度与性能需平衡。
- 数值敏感路径建议做误差基准测试。

## 示例（PTX 风格）

```ptx
sin.approx.f32 d, a;
```

## 官方来源链接（事实核验）

- sin: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sin
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

最后核对日期：2026-03-19
