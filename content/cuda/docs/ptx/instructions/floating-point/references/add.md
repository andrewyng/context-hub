# PTX 指令专题：add（floating-point）

`add` 执行浮点加法，支持不同精度与舍入模式变体。

## 官方定位

- 文档章节：Floating Point Instructions: `add`
- 相关扩展：Half Precision / Mixed Precision 的 `add`

## 核心约束

- 舍入模式与类型后缀需与目标精度匹配。
- 特殊值（NaN/Inf）行为以官方语义定义为准。

## 示例（PTX 风格）

```ptx
add.rn.f32 d, a, b;
```

## 官方来源链接（事实核验）

- add: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-add
- Half precision add: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-add
- Mixed precision add: https://docs.nvidia.com/cuda/parallel-thread-execution/#mixed-precision-floating-point-instructions-add

最后核对日期：2026-03-19
