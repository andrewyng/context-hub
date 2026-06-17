---
name: driver-checkpoint
description: '**Source:** group__CUDA__CHECKPOINT.html#group__CUDA__CHECKPOINT'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.37. CUDA Checkpointing

**Source:** group__CUDA__CHECKPOINT.html#group__CUDA__CHECKPOINT


### Functions

CUresult cuCheckpointProcessCheckpoint ( int  pid, CUcheckpointCheckpointArgs* args )


Checkpoint a CUDA process's GPU memory contents.

######  Parameters

`pid`
    \- The process ID of the CUDA process
`args`
    \- Optional checkpoint operation arguments

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUECUDA_ERROR_NOT_INITIALIZEDCUDA_ERROR_ILLEGAL_STATECUDA_ERROR_NOT_SUPPORTED

###### Description

Checkpoints a CUDA process specified by `pid` that is in the LOCKED state. The GPU memory contents will be brought into host memory and all underlying references will be released. Process must be in the LOCKED state to checkpoint.

Upon successful return the process will be in the CHECKPOINTED state.

CUresult cuCheckpointProcessGetRestoreThreadId ( int  pid, int* tid )


Returns the restore thread ID for a CUDA process.

######  Parameters

`pid`
    \- The process ID of the CUDA process
`tid`
    \- Returned restore thread ID

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUECUDA_ERROR_NOT_INITIALIZEDCUDA_ERROR_NOT_SUPPORTED

###### Description

Returns in `*tid` the thread ID of the CUDA restore thread for the process specified by `pid`.

CUresult cuCheckpointProcessGetState ( int  pid, CUprocessState* state )


Returns the process state of a CUDA process.

######  Parameters

`pid`
    \- The process ID of the CUDA process
`state`
    \- Returned CUDA process state

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUECUDA_ERROR_NOT_INITIALIZEDCUDA_ERROR_NOT_SUPPORTED

###### Description

Returns in `*state` the current state of the CUDA process specified by `pid`.

CUresult cuCheckpointProcessLock ( int  pid, CUcheckpointLockArgs* args )


Lock a running CUDA process.

######  Parameters

`pid`
    \- The process ID of the CUDA process
`args`
    \- Optional lock operation arguments

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUECUDA_ERROR_NOT_INITIALIZEDCUDA_ERROR_ILLEGAL_STATECUDA_ERROR_NOT_SUPPORTEDCUDA_ERROR_NOT_READY

###### Description

Lock the CUDA process specified by `pid` which will block further CUDA API calls. Process must be in the RUNNING state in order to lock.

Upon successful return the process will be in the LOCKED state.

If timeoutMs is specified and the timeout is reached the process will be left in the RUNNING state upon return.

CUresult cuCheckpointProcessRestore ( int  pid, CUcheckpointRestoreArgs* args )


Restore a CUDA process's GPU memory contents from its last checkpoint.

######  Parameters

`pid`
    \- The process ID of the CUDA process
`args`
    \- Optional restore operation arguments

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUECUDA_ERROR_NOT_INITIALIZEDCUDA_ERROR_ILLEGAL_STATECUDA_ERROR_NOT_SUPPORTED

###### Description

Restores a CUDA process specified by `pid` from its last checkpoint. Process must be in the CHECKPOINTED state to restore.

GPU UUID pairs can be specified in `args` to remap the process old GPUs onto new GPUs. The GPU to restore onto needs to have enough memory and be of the same chip type as the old GPU. If an array of GPU UUID pairs is specified, it must contain every checkpointed GPU.

Upon successful return the process will be in the LOCKED state.

CUDA process restore requires persistence mode to be enabled or cuInit has not been called, any function from the driver API will return CUDA_ERROR_NOT_INITIALIZED.") to have been called before execution.

CUresult cuCheckpointProcessUnlock ( int  pid, CUcheckpointUnlockArgs* args )


Unlock a CUDA process to allow CUDA API calls.

######  Parameters

`pid`
    \- The process ID of the CUDA process
`args`
    \- Optional unlock operation arguments

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUECUDA_ERROR_NOT_INITIALIZEDCUDA_ERROR_ILLEGAL_STATECUDA_ERROR_NOT_SUPPORTED

###### Description

Unlocks a process specified by `pid` allowing it to resume making CUDA API calls. Process must be in the LOCKED state.

Upon successful return the process will be in the RUNNING state.

