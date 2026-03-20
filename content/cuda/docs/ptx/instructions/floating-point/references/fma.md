# PTX 指令专题：fma（floating-point）

`fma` 融合乘加（fused multiply-add），通常有更好的数值与性能特性。

## 官方定位

- 文档章节：Floating Point Instructions: `fma`
- 相关扩展：Half / Mixed Precision `fma`

## 核心约束

- 舍入模式影响最终结果；与拆分 `mul+add` 结果可能不同。
- 类型组合需符合变体定义。

## 示例（PTX 风格）

```ptx
fma.rn.f32 d, a, b, c;
```

## 官方来源链接（事实核验）

- fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-fma
- Half precision fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-fma
- Mixed precision fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#mixed-precision-floating-point-instructions-fma

最后核对日期：2026-03-19
