# PTX 指令专题：multimem.cp.reduce.async.bulk

`multimem.cp.reduce.async.bulk` 在多 GPU 目标内存上执行异步归约更新。

## 官方语法（节选）

```ptx
multimem.cp.reduce.async.bulk.dst.src.completion_mechanism.redOp.type [dstMem], [srcMem], size;
```

## 关键语义

- 对 `dstMem` 指向的多 GPU 内存范围执行元素级异步归约。
- 使用 `.bulk_group` 完成机制。
- 文档指出该路径按内存模型属于 weak memory 操作，并定义 `.relaxed.sys` 语义。

## 约束要点

- 数据类型与归约操作符必须匹配。
- 部分浮点 `add` 子类型有 `.noftz` 要求。

## 官方来源链接（事实核验）

- multimem.cp.reduce.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-multimem-cp-reduce-async-bulk
- cp.reduce.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-reduce-async-bulk
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

最后核对日期：2026-03-19
