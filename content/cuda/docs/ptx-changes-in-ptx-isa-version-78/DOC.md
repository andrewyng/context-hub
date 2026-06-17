---
name: ptx-changes-in-ptx-isa-version-78
description: New Features
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 13.12. Changes in PTX ISA Version 7.8

---
title: "13.12. Changes in PTX ISA Version 7.8"
section: 13.12
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 13.12. Changes in PTX ISA Version 7.8


New Features

PTX ISA version 7.8 introduces the following new features:

* Adds support for `sm_89` target architecture.

  * Adds support for `sm_90` target architecture.

  * Extends `bar` and `barrier` instructions to accept optional scope qualifier `.cta`.

  * Extends `.shared` state space qualifier with optional sub-qualifier `::cta`.

  * Adds support for `movmatrix` instruction which transposes a matrix in registers across a warp.

  * Adds support for `stmatrix` instruction which stores one or more matrices to shared memory.

  * Extends the `.f64` floating point type `mma` operation with shapes `.m16n8k4`, `.m16n8k8`, and `.m16n8k16`.

  * Extends `add`, `sub`, `mul`, `set`, `setp`, `cvt`, `tanh`, `ex2`, `atom` and `red` instructions with `bf16` alternate floating point data format.

  * Adds support for new alternate floating-point data formats `.e4m3` and `.e5m2`.

  * Extends `cvt` instruction to convert `.e4m3` and `.e5m2` alternate floating point data formats.

  * Adds support for `griddepcontrol` instruction as a communication mechanism to control the execution of dependent grids.

  * Extends `mbarrier` instruction to allow a new phase completion check operation _try_wait_.

  * Adds support for new thread scope `.cluster` which is a set of Cooperative Thread Arrays (CTAs).

  * Extends `fence`/`membar`, `ld`, `st`, `atom`, and `red` instructions to accept `.cluster` scope.

  * Adds support for extended visibility of shared state space to all threads within a cluster.

  * Extends `.shared` state space qualifier with `::cluster` sub-qualifier for cluster-level visibility of shared memory.

  * Extends `isspacep`, `cvta`, `ld`, `st`, `atom`, and `red` instructions to accept `::cluster` sub-qualifier with `.shared` state space qualifier.

  * Adds support for `mapa` instruction to map a shared memory address to the corresponding address in a different CTA within the cluster.

  * Adds support for `getctarank` instruction to query the rank of the CTA that contains a given address.

  * Adds support for new barrier synchronization instruction `barrier.cluster`.

  * Extends the memory consistency model to include the new cluster scope.

  * Adds support for special registers related to cluster information: `%is_explicit_cluster`, `%clusterid`, `%nclusterid`, `%cluster_ctaid`, `%cluster_nctaid`, `%cluster_ctarank`, `%cluster_nctarank`.

  * Adds support for cluster dimension directives `.reqnctapercluster`, `.explicitcluster`, and `.maxclusterrank`.

Semantic Changes and Clarifications

None.