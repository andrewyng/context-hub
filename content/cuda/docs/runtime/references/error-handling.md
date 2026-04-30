# CUDA Runtime Error Handling

Use a small helper to surface errors early. Check both launch errors and runtime errors.

```cpp
#include <cuda_runtime.h>
#include <stdio.h>

#define CUDA_CHECK(call) \
  do { \
    cudaError_t err = call; \
    if (err != cudaSuccess) { \
      fprintf(stderr, "CUDA error %s:%d: %s\n", __FILE__, __LINE__, cudaGetErrorString(err)); \
      exit(1); \
    } \
  } while (0)

// Usage
CUDA_CHECK(cudaMalloc(&d_x, bytes));
// After kernel launch
CUDA_CHECK(cudaGetLastError());
CUDA_CHECK(cudaDeviceSynchronize());
```

Notes:
- `cudaGetLastError()` catches launch errors.
- `cudaDeviceSynchronize()` surfaces runtime errors.
- For async workflows, prefer `cudaStreamSynchronize(stream)`.
