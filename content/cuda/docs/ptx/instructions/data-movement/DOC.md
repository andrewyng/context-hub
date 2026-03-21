---
name: ptx-data-movement-instructions
description: "PTX data movement instructions in ISA 9.2, including ld/st/ldu, cvt/cvt.pack/cvta, cp.async paths, and prefetch hints."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,load,store,memory,cp.async,cp.async.bulk,ld,ldu,ld.global.nc,st,st.async,st.bulk,cvt,cvt.pack,cvta,mov,prefetch,prefetchu,data-movement"
---

# PTX Data Movement

This page covers PTX load/store, conversion, and async movement patterns that dominate memory-side kernel behavior.

## Representative Syntax

```ptx
cp.async.ca.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size} [dst], [src], cp-size{, src-size}{, cache-policy};
cp.async.commit_group;
cp.async.wait_group N;
cp.async.wait_all;
```

## Minimal Async Copy Pattern

```ptx
cp.async.ca.shared.global [smem_ptr], [gmem_ptr], 16;
cp.async.commit_group;
cp.async.wait_group 0;
```

## Constraints and Pitfalls

- Source/destination state spaces must match the instruction form.
- Async copy completion must be explicitly synchronized before consumer access.
- Conversion/load/store variants have operand width and alignment constraints.

## Official Source Links (fact check)

- Data Movement and Conversion Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions
- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- cp.async.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-commit-group
- cp.async.wait_group/wait_all: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-wait-group-cp-async-wait-all
- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld

Last verified date: 2026-03-19

## Single-Instruction References

- `references/cp-async.md`
- `references/cp-async-bulk.md`
- `references/ld.md`
- `references/st.md`
- `references/cp-async-wait-group.md`
- `references/prefetch.md`
- `references/cvta.md`
- `references/mov.md`
- `references/cvt.md`
- `references/ld-global-nc.md`
- `references/st-async.md`
- `references/st-bulk.md`
- `references/cvt-pack.md`
- `references/ldu.md`
