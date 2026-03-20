# PTX 指令专题：rsqrt

`rsqrt` 计算平方根倒数，是归一化等路径的常用算子。

## 官方定位

- 文档章节：Floating Point Instructions: `rsqrt`
- 相关扩展：`rsqrt.approx.ftz.f64`

## 核心约束

- 对精度敏感场景要评估近似误差。
- 输入边界（0/负数/NaN）语义应遵循官方定义。

## 示例（PTX 风格）

```ptx
rsqrt.approx.f32 d, a;
```

## 官方来源链接（事实核验）

- rsqrt: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rsqrt
- rsqrt.approx.ftz.f64: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rsqrt-approx-ftz-f64

最后核对日期：2026-03-19
