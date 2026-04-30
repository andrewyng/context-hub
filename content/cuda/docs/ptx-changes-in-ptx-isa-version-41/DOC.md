---
name: ptx-changes-in-ptx-isa-version-41
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.30. Changes in PTX ISA Version 4.1

---
title: "13.30. Changes in PTX ISA Version 4.1"
section: 13.30
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.30. Changes in PTX ISA Version 4.1


New Features

PTX ISA version 4.1 introduces the following new features:

* Support for `sm_37` and `sm_52` target architectures.

  * Support for new fields `array_size`, `num_mipmap_levels` and `num_samples` for Textures, and the `txq` instruction support for querying these fields.

  * Support for new field `array_size` for Surfaces, and the `suq` instruction support for querying this field.

  * Support for special registers `%total_smem_size` and `%dynamic_smem_size`.

Semantic Changes and Clarifications

None.