---
name: ptx-control-flow-instructions
description: "PTX control-flow instructions and divergence-related behaviors in ISA 9.2."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,control-flow,branch,call"
---

# PTX Control Flow

Control-flow instructions determine branching, calling, and exit behavior, while also affecting warp divergence and execution efficiency.

## Common Instructions

- `bra` conditional/unconditional branch
- `call` device function call
- `ret` function return
- `exit` thread exit
- `brx.idx` indirect branch

## Syntax Example (PTX style)

```ptx
@p bra L_done;
call.uni (_), my_func, (arg0);
ret;
```

## Constraints and Pitfalls

- Predicate-controlled branches can introduce warp divergence.
- `call` paths must satisfy parameter and ABI rules.
- Some branch variants have version or target ISA requirements.

## Official Source Links (fact check)

- Control Flow Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions
- bra: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-bra
- call: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-call
- ret: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-ret

Last verified date: 2026-03-19

## Single-Instruction References

- `references/bra.md`
- `references/call.md`
- `references/ret.md`
- `references/brx-idx.md`
- `references/exit.md`
- `references/trap.md`
