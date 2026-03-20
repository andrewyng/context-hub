# PTX 指令专题：testp

`testp` 用于测试浮点数的类别/属性并生成谓词结果。

## 官方定位

- 文档章节：Floating Point Instructions: `testp`

## 核心约束

- 测试条件依具体修饰符定义（如有限性、NaN 等）。
- 结果写入谓词寄存器，常配合分支或 `selp`。

## 示例（PTX 风格，示意）

```ptx
testp.nan.f32 p, a;
```

## 官方来源链接（事实核验）

- testp: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-testp
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

最后核对日期：2026-03-19
