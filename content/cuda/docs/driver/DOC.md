---
name: driver
description: "CUDA Driver API essentials: explicit context management, module loading, and kernel launch."
metadata:
  languages: "cpp"
  versions: "12.4"
  revision: 1
  updated-on: "2026-03-18"
  source: community
  tags: "cuda,gpu,kernel,driver,api,ptx"
---

# CUDA Driver API (C++)

Use the Driver API when you need explicit control over contexts, modules, and dynamic kernel loading. It is lower-level than the Runtime API.

## Basic Flow

1. Initialize the driver and pick a device
2. Create a context
3. Load a module (PTX or cubin)
4. Get the kernel function
5. Allocate memory and launch
6. Cleanup

```cpp
#include <cuda.h>
#include <stdio.h>

int main() {
  CUdevice dev;
  CUcontext ctx;
  cuInit(0);
  cuDeviceGet(&dev, 0);
  cuCtxCreate(&ctx, 0, dev);

  CUmodule module;
  CUfunction func;
  cuModuleLoad(&module, "kernel.ptx");
  cuModuleGetFunction(&func, module, "my_kernel");

  CUdeviceptr d_out;
  cuMemAlloc(&d_out, 1024);

  void* args[] = { &d_out };
  cuLaunchKernel(func,
                 1, 1, 1,
                 256, 1, 1,
                 0, 0, args, 0);

  cuMemFree(d_out);
  cuModuleUnload(module);
  cuCtxDestroy(ctx);
  return 0;
}
```

## Core Driver APIs

- Context: `cuInit`, `cuDeviceGet`, `cuCtxCreate`, `cuCtxDestroy`
- Module: `cuModuleLoad`, `cuModuleLoadData`, `cuModuleGetFunction`
- Memory: `cuMemAlloc`, `cuMemFree`, `cuMemcpyHtoD`, `cuMemcpyDtoH`
- Launch: `cuLaunchKernel`

## Common Pitfalls

- Forgetting to create a context before module operations
- Using mismatched kernel names between PTX and host code
- Not checking return codes (Driver API returns `CUresult`)

## Related Topics

- Module loading details: `references/module-loading.md`
