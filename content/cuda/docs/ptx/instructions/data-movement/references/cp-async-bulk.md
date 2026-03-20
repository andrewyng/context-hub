# PTX 指令专题：cp.async.bulk

`cp.async.bulk` 是 bulk 异步拷贝指令，支持 mbarrier 完成机制，适合较大块数据搬运。

## 官方语法（代表形式）

```ptx
cp.async.bulk.shared::cta.global.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
cp.async.bulk.shared::cluster.global.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
```

## 关键语义

- 指令在 async proxy 执行，属于 weak memory operation。
- 可通过 `.mbarrier::complete_tx::bytes` 指定完成机制。
- complete-tx 在 mbarrier 上携带 `completeCount=字节数`。

## 可见性与顺序

- 文档说明其完成后跟随 implicit generic-async proxy fence。
- 仍需使用 async-group 或 mbarrier 机制等待完成后再消费数据。

## 官方来源链接（事实核验）

- cp.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk
- Asynchronous data movement: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-data-movement-and-conversion-instructions
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

最后核对日期：2026-03-19
