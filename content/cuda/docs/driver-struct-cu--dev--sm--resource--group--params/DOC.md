---
name: driver-struct-cu--dev--sm--resource--group--params
description: '**Source:** structCU__DEV__SM__RESOURCE__GROUP__PARAMS.html'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# Next >

**Source:** structCU__DEV__SM__RESOURCE__GROUP__PARAMS.html


### Public Variables

unsigned int coscheduledSmCount

unsigned int flags

unsigned int preferredCoscheduledSmCount

unsigned int reserved[12]

unsigned int smCount


### Variables

unsigned int CU_DEV_SM_RESOURCE_GROUP_PARAMS::coscheduledSmCount


The amount of co-scheduled SMs grouped together for locality purposes.

unsigned int CU_DEV_SM_RESOURCE_GROUP_PARAMS::flags


Combination of `CUdevSmResourceGroup_flags` values to indicate this this group is created.

unsigned int CU_DEV_SM_RESOURCE_GROUP_PARAMS::preferredCoscheduledSmCount


When possible, combine co-scheduled groups together into larger groups of this size.

unsigned int CU_DEV_SM_RESOURCE_GROUP_PARAMS::reserved[12]


Reserved for future use - ensure this is is zero initialized.

unsigned int CU_DEV_SM_RESOURCE_GROUP_PARAMS::smCount


The amount of SMs available in this resource.

