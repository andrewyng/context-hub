# PTX 指令专题：cvt

`cvt` 用于数值类型转换（整数/浮点/位宽变化），是混合精度和接口适配的关键指令。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `cvt`
- 相关扩展章节：`cvt.pack`

## 核心约束

- 目标类型后缀决定舍入/截断行为。
- 浮点到整数转换需注意溢出和舍入规则。
- packed 变体需满足元素类型和打包格式要求。

## 示例（PTX 风格）

```ptx
cvt.rn.f32.f16 f1, h1;
cvt.rzi.s32.f32 r1, f1;
```

## 官方来源链接（事实核验）

- cvt: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvt
- cvt.pack: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvt-pack

最后核对日期：2026-03-19
