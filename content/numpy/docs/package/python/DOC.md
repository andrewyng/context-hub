---
name: package
description: "NumPy package guide for Python 2.4.6: ndarray, dtype, shape, indexing, broadcasting, ufuncs, random, linalg"
metadata:
  languages: "python"
  versions: "2.4.6"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "numpy,python,ndarray,dtype,broadcasting,ufunc,random,linalg"
---

# NumPy Python Package Guide

## Golden Rule

`import numpy as np`. Operate on whole arrays. Check `.shape` and `.dtype` before assuming a result; check view-vs-copy before mutating.

## Installation

```bash
python -m pip install numpy==2.4.6
```

```bash
conda install -c conda-forge numpy
```

Verify:

```bash
python -c "import numpy as np; print(np.__version__)"
```

## ndarray

```python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([[1, 2, 3], [4, 5, 6]])

a.shape   # (3,)
a.ndim    # 1
a.dtype   # int64 (or platform default int)
a.size    # 3
a.nbytes
```

### Constructors

```python
np.zeros((2, 3))
np.ones((2, 3), dtype=np.float32)
np.full((2, 2), 7)
np.empty((3,))
np.arange(0, 10, 2)
np.linspace(0.0, 1.0, num=5)
np.eye(3)
np.identity(3)
```

### From Python data without unnecessary copies

```python
arr = np.asarray([[1, 2], [3, 4]], dtype=np.float64, copy=None)
```

In NumPy 2.x, `copy=False` is strict and raises if a copy would be required. Use `copy=None` for "copy only if needed".

## dtype

```python
a = np.array([1, 2, 3], dtype=np.int32)
b = a.astype(np.float64)        # makes a copy
c = a.astype(np.float64, copy=False)  # share if possible

np.int8, np.int16, np.int32, np.int64
np.uint8, np.uint16, np.uint32, np.uint64
np.float32, np.float64
np.complex64, np.complex128
np.bool_
```

Be explicit about dtype before mixing scalars and arrays. In-place ops with mismatched dtypes can raise:

```python
arr = np.array([1, 2, 3], dtype=np.int64)
arr += 0.5   # raises: cannot cast float to int64 safely
```

## Shape / Reshape

```python
arr = np.arange(12)

arr.reshape(3, 4)
arr.reshape(2, -1)        # -1 infers
arr.reshape(3, 4).ravel() # flatten (view if possible)
arr.reshape(3, 4).flatten()  # always copy

np.transpose(arr.reshape(3, 4))
arr.reshape(3, 4).T

np.expand_dims(arr, axis=0)
np.squeeze(np.zeros((1, 3, 1)))

np.concatenate([a, b], axis=0)
np.stack([a, b])             # new axis
np.hstack, np.vstack
```

`reshape` requires the element count to match.

## Indexing / Slicing / Boolean Masks

### Basic

```python
arr = np.arange(10)

arr[0]
arr[-1]
arr[2:7]
arr[2:7:2]
arr[::-1]
```

### Multi-dim

```python
grid = np.arange(12).reshape(3, 4)

grid[1, 2]
grid[:, 0]
grid[1:3, :2]
grid[..., 0]        # ellipsis = "all remaining axes"
```

### Boolean masks (copies)

```python
arr = np.array([1, 2, 3, 4, 5])
arr[arr > 2]          # [3 4 5]
arr[(arr > 1) & (arr < 5)]
```

### Fancy indexing (copies)

```python
arr[[0, 2, 4]]
grid[[0, 2], [1, 3]]   # picks (0,1) and (2,3)
np.where(arr > 2, arr, 0)
```

### Views vs copies

```python
arr = np.array([1, 2, 3, 4])
view = arr[1:3]    # view: shares memory
view[0] = 99
arr                # [1, 99, 3, 4]

copy = arr[[1, 3]] # fancy index: independent copy
copy[0] = 0
arr                # unchanged
```

## Broadcasting

```python
data = np.array([[1.0, 2.0, 3.0],
                 [4.0, 5.0, 6.0]])
offset = np.array([10.0, 20.0, 30.0])

data + offset         # offset broadcast across rows

col = np.array([[1.0], [10.0]])
data * col            # col broadcast across columns
```

Rules, compared from trailing dims backward:

- equal dims, or
- one of them is `1`

If incompatible: `ValueError: operands could not be broadcast together`.

## Ufuncs

Elementwise functions over arrays:

```python
np.sqrt(x)
np.exp(x)
np.log(x)
np.sin(x), np.cos(x)
np.abs(x)
np.maximum(x, y)
np.add(x, y)        # same as x + y
np.multiply(x, y)

# Use out= to reuse memory
out = np.empty_like(x)
np.multiply(x, 2.0, out=out)

# Reductions
np.sum(x), np.prod(x)
np.cumsum(x), np.cumprod(x)
```

## Common Math / Stats

```python
x = np.array([1.0, 2.0, 3.0, 4.0])

x.sum(); x.mean(); x.std(); x.var()
x.min(); x.max(); x.argmin(); x.argmax()
np.median(x); np.percentile(x, 95); np.quantile(x, 0.5)

m = np.array([[1, 2], [3, 4]])
m.sum(axis=0)     # column sums
m.sum(axis=1)     # row sums
m.mean(axis=0, keepdims=True)
```

## Random (default_rng)

```python
rng = np.random.default_rng(seed=42)

rng.integers(low=0, high=10, size=5)
rng.random(size=(2, 3))
rng.normal(loc=0.0, scale=1.0, size=(2, 3))
rng.uniform(0.0, 1.0, size=10)
rng.choice([10, 20, 30], size=5, replace=True)
rng.shuffle(arr)
rng.permutation(10)
```

Prefer `default_rng()` over the legacy `np.random.seed` / `np.random.rand` API for new code.

## Linalg Basics

```python
a = np.array([[1, 2], [3, 4]], dtype=np.float64)
b = np.array([[5, 6], [7, 8]], dtype=np.float64)

a @ b                  # matrix multiply
np.matmul(a, b)
np.dot(a[0], b[:, 0])  # vector dot

np.linalg.inv(a)
np.linalg.det(a)
np.linalg.norm(a)
np.linalg.eig(a)
np.linalg.svd(a)
np.linalg.qr(a)

# Solve A x = b without explicit inverse
x = np.linalg.solve(a, np.array([1.0, 2.0]))
```

`*` is elementwise; use `@` or `np.matmul` for matrix multiplication.

## Typing

```python
import numpy as np
import numpy.typing as npt

def normalize(x: npt.ArrayLike) -> npt.NDArray[np.float64]:
    arr = np.asarray(x, dtype=np.float64)
    n = np.linalg.norm(arr)
    return arr if n == 0.0 else arr / n
```

- `npt.ArrayLike` for inputs
- `npt.NDArray[dtype]` for return types

## Common Pitfalls

- Views vs copies: basic slicing returns views; fancy/boolean indexing returns copies.
- `np.arange` with float steps has precision artifacts. Use `np.linspace`.
- In-place ops with incompatible dtypes raise in NumPy 2.x.
- Shape bugs cause most runtime errors. `assert arr.shape == (...)` early.
- `copy=False` in `np.asarray` means "never copy" and raises if conversion would require one.

## Version-Sensitive Notes For NumPy 2.4.6

- Current PyPI release as of 2026-05-29 is `2.4.6`.
- NumPy 2.0 changed type-promotion behavior and `np.asarray` semantics (`copy=`, `device=`).
- Legacy aliases and compatibility shims were removed in 2.x.
- C-API extension modules need a 2.x-compatible build.

## Official Sources

- Install: https://numpy.org/install
- Quickstart: https://numpy.org/doc/stable/user/quickstart.html
- Broadcasting: https://numpy.org/doc/stable/user/basics.broadcasting.html
- Copies/views: https://numpy.org/doc/stable/user/basics.copies.html
- Indexing: https://numpy.org/doc/stable/user/basics.indexing.html
- Random Generator: https://numpy.org/doc/stable/reference/random/generator.html
- linalg reference: https://numpy.org/doc/stable/reference/routines.linalg.html
- Typing reference: https://numpy.org/doc/stable/reference/typing.html
- 2.0 migration guide: https://numpy.org/doc/stable/numpy_2_0_migration_guide.html
- PyPI: https://pypi.org/project/numpy/
