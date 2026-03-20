# PTX 指令专题：mul（floating-point）

`mul` 执行浮点乘法，常用于标量乘与矩阵内核基础算子。

## 官方定位

- 文档章节：Floating Point Instructions: `mul`

## 核心约束

- 类型与舍入模式应显式指定。
- 半精度/混合精度路径请核查目标架构支持。

## 示例（PTX 风格）

```ptx
mul.rn.f32 d, a, b;
```

## 官方来源链接（事实核验）

- mul: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-mul
- Half precision mul: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-mul

最后核对日期：2026-03-19
