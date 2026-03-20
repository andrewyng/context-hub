# PTX 指令专题：cvt.pack

`cvt.pack` 用于把多个转换结果打包到更紧凑的数据表示中。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `cvt.pack`
- 常用于低位宽数据通路和向量化紧凑存储

## 核心约束

- 输入元素类型、目标打包类型和舍入语义必须匹配。
- packed 结果常用于后续向量化 load/store 或 MMA 输入准备。

## 示例（PTX 风格，示意）

```ptx
cvt.pack.sat.u8.s32.b32 d, a, b, c;
```

## 官方来源链接（事实核验）

- cvt.pack: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvt-pack
- cvt: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvt

最后核对日期：2026-03-19
