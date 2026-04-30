---
name: ptx-tilescatter4andtilegather4modes
description: These modes are similar to the tiled mode with restriction that these
  modes work only on 2D tensor data. `Tile::scatter4` and `Tile::gather4` modes are
  used to access multiple non-contiguous rows of t...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.3.4. .tile::scatter4and.tile::gather4modes

---
title: "5.5.3.4. .tile::scatter4and.tile::gather4modes"
section: 5.5.3.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.3.4. .tile::scatter4and.tile::gather4modes


These modes are similar to the tiled mode with restriction that these modes work only on 2D tensor data. `Tile::scatter4` and `Tile::gather4` modes are used to access multiple non-contiguous rows of tensor data.

In `Tile::scatter4` mode single 2D source tensor is divided into four rows in the 2D destination tensor. In `Tile::gather4` mode four rows in the source 2D tensor are combined to form single 2D destination tensor.

These modes work on four rows and hence the instruction will take:

1. four tensor coordinates across the dimension 0

  2. one tensor coordinate across the dimension 1

The interleave layout is not supported for `.tile::scatter4` and `.tile::gather4` modes.

All other constraints and rules of the tile mode apply to these modes as well.

#####  5.5.3.4.1. [Bounding Box](<#tensor-tiled-scatter4-gather4-modes-bounding-box>)

For `Tile::scatter4` and `Tile::gather4` modes, four request coordinates will form four Bounding Boxes in the tensor space.

[Figure 10](<#tiled-scatter4-gather4-bounding-box>) shows an example of the same with start coordinates (1, 2), (1, 5), (1, 0) and (1, 9).

The size of the bounding box in the dimension 0 represents the length of the rows. The size of the bounding box in the dimension 1 must be one.

![_images/tiled-scatter4-gather4-bounding-box.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tiled-scatter4-gather4-bounding-box.png)

Figure 10 tiled::scatter4/tiled::gather4 mode bounding box example