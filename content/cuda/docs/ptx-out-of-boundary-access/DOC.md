---
name: ptx-out-of-boundary-access
description: 'PTX Tensor operation can detect and handle the case when the Bounding
  Box crosses the tensor boundary in any dimension. There are 2 modes:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.3.3. Out of Boundary Access

---
title: "5.5.3.3. Out of Boundary Access"
section: 5.5.3.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.3.3. Out of Boundary Access


PTX Tensor operation can detect and handle the case when the Bounding Box crosses the tensor boundary in any dimension. There are 2 modes:

* Zero fill mode:

Elements in the Bounding Box which fall outside of the tensor boundary are set to 0.

  * `OOB-NaN` fill mode:

Elements in the Bounding Box which fall outside of the tensor boundary are set to a special NaN called `OOB-NaN`.

[Figure 9](<#tensor-oob-access>) shows an example of the out of boundary access.

![_images/tensor-oob-access.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-oob-access.png)

Figure 9 Out of boundary access