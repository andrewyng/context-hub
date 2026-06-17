---
name: ptx-tensor-access-modes
description: 'Tensor data can be accessed in two modes:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.2. Tensor Access Modes

---
title: "5.5.2. Tensor Access Modes"
section: 5.5.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.5.2. Tensor Access Modes


Tensor data can be accessed in two modes:

* Tiled mode:  
  
In tiled mode, the source multi-dimensional tensor layout is preserved at the destination.

  * Im2col mode:

In im2col mode, the elements in the Bounding Box of the source tensor are rearranged into columns at the destination. Refer [here](<https://in.mathworks.com/help/images/ref/im2col.html>) for more details.