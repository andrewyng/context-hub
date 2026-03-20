# PTX 指令专题：cp.reduce.async.bulk

`cp.reduce.async.bulk` 是异步 bulk 归约搬运指令，在搬运过程中执行元素级归约。

## 官方语法（节选）

```ptx
cp.reduce.async.bulk.dst.src.completion_mechanism.redOp.type [dstMem], [srcMem], size, [mbar];
cp.reduce.async.bulk.dst.src.completion_mechanism.add.noftz.type [dstMem], [srcMem], size, [mbar];
```

## 关键语义

- 指令 non-blocking，发起异步归约操作。
- `.mbarrier::complete_tx::bytes`：完成时在 mbarrier 上执行 complete-tx。
- `.bulk_group`：使用 bulk async-group 完成机制。
- 文档说明该路径为 weak memory operation；归约操作具备 `.relaxed.gpu` 语义。

## 细节约束（官方章节重点）

- `size` 指定源/目标数组相同长度。
- `add.f16/add.bf16` 需要 `.noftz`。
- 部分子字节类型存在不支持限制（见章节 restrictions）。

## 官方来源链接（事实核验）

- cp.reduce.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-reduce-async-bulk
- Async data movement instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-data-movement-and-conversion-instructions
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

最后核对日期：2026-03-19
