# PTX 指令专题：tanh

`tanh` 计算双曲正切，适用于激活函数等非线性路径。

## 官方定位

- 文档章节：Floating Point Instructions: `tanh`
- 相关扩展：Half precision `tanh`

## 核心约束

- 不同精度下的数值误差要结合模型容忍度评估。
- 边界输入的饱和行为以官方定义为准。

## 示例（PTX 风格）

```ptx
tanh.approx.f32 d, a;
```

## 官方来源链接（事实核验）

- tanh: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-tanh
- Half precision tanh: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-tanh

最后核对日期：2026-03-19
