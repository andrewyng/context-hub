# PTX 指令专题：mov

`mov` 用于寄存器间传递、常量装载和部分特殊值转移，是最常用基础指令之一。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `mov`
- 在寄存器重命名、数据重排和参数准备中高频出现

## 核心约束

- 目的和源类型需要与 `mov` 变体兼容。
- 某些特殊寄存器读取也通过 `mov` 完成。

## 示例（PTX 风格）

```ptx
mov.u32 r1, r2;
mov.u32 r_tid, %tid.x;
```

## 官方来源链接（事实核验）

- mov: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-mov
- Special registers: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers

最后核对日期：2026-03-19
