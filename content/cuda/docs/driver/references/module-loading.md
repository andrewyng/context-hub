# CUDA Driver Module Loading

You can load modules from:

- PTX text (JIT compiled): `cuModuleLoadData` or `cuModuleLoadDataEx`
- Cubin file (precompiled): `cuModuleLoad`

Common patterns:

```cpp
CUmodule module = nullptr;
CUresult r = cuModuleLoad(&module, "kernel.cubin");
// or
r = cuModuleLoadData(&module, ptx_string);
```

Notes:
- `cuModuleLoadDataEx` lets you pass JIT options for diagnostics or optimization.
- Always unload modules with `cuModuleUnload` when done.
