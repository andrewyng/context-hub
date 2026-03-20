---
name: ptx
description: "NVIDIA PTX ISA 9.2 guide: instruction model, constraints, and architecture mapping."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,isa,gpu,assembly,nvidia,wmma,tensor-core,tensorcore,matrix-multiply,matrix-multiply-accumulate"
---

# PTX ISA 9.2 导航

本目录按 PTX 9.2 官方文档组织，目标是给 Agent 提供“可执行、可约束、可追溯”的指令与语义参考。

## 覆盖范围

- 程序模型：线程层级、状态空间、数据类型、函数与 ABI
- 指令格式：谓词、操作码、类型后缀、修饰符、操作数
- 内存模型：scope + semantic（relaxed/acquire/release 等）
- 指令族：整数、浮点、搬运、控制流、同步通信、WGMMA、TMA
- 特殊寄存器：`%tid`/`%ctaid`/`%smid` 等

## 推荐阅读路径

1. `references/programming-model.md`
2. `references/state-spaces-and-types.md`
3. `references/instruction-format-and-operands.md`
4. `references/memory-consistency-model.md`
5. `references/abi-and-calling-convention.md`
6. `instructions/*/DOC.md`

## 指令分类入口

- Integer Arithmetic: `instructions/integer/DOC.md`
- Floating-Point: `instructions/floating-point/DOC.md`
- Data Movement: `instructions/data-movement/DOC.md`
- Control Flow: `instructions/control-flow/DOC.md`
- Synchronization and Communication: `instructions/sync-comm/DOC.md`
- Warpgroup MMA: `instructions/wgmma/DOC.md`
- Tensor Memory Accelerator: `instructions/tma/DOC.md`
- Special Registers: `instructions/special-registers/DOC.md`

## 文档可信度说明

- 本目录中的语法与语义结论均对应 NVIDIA PTX ISA 页面章节。
- 每篇文档都提供章节锚点，便于逐条核验。
- 若未来 PTX 发布新版本，优先以 release notes 覆盖差异。

## 官方来源链接（事实核验）

- PTX 主文档: https://docs.nvidia.com/cuda/parallel-thread-execution/
- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- Release Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#release-notes

最后核对日期：2026-03-19

## B 系列专项入口

- H 系列专门指令整理：`references/h-series-special-instructions.md`
- 架构能力矩阵：`references/b-series-arch-matrix.md`
- 与 Hopper 差异：`references/b-series-delta-from-hopper.md`
- tcgen05 专题：`instructions/tcgen05/DOC.md`
