# PTX 指令专题：sub（floating-point）

`sub` 执行浮点减法，语义与 `add` 类似但操作方向相反。

## 官方定位

- 文档章节：Floating Point Instructions: `sub`

## 示例（PTX 风格）

```ptx
sub.rn.f32 d, a, b;
```

## 官方来源链接（事实核验）

- sub: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sub
- Half precision sub: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-sub
- Mixed precision sub: https://docs.nvidia.com/cuda/parallel-thread-execution/#mixed-precision-floating-point-instructions-sub

最后核对日期：2026-03-19
