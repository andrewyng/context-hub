---
name: runtime-graph
description: '**Source:** group__CUDART__GRAPH.html#group__CUDART__GRAPH'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,api
---

# 6.30. Graph Management

**Source:** group__CUDART__GRAPH.html#group__CUDART__GRAPH


### Functions

__host__ cudaError_t cudaDeviceGetGraphMemAttribute ( int  device, cudaGraphMemAttributeType attr, void* value )


Query asynchronous allocation attributes related to graphs.

######  Parameters

`device`
    \- Specifies the scope of the query
`attr`
    \- attribute to get
`value`
    \- retrieved value

###### Returns

cudaSuccess, cudaErrorInvalidDevice

###### Description

Valid attributes are:

  * cudaGraphMemAttrUsedMemCurrent: Amount of memory, in bytes, currently associated with graphs

  * cudaGraphMemAttrUsedMemHigh: High watermark of memory, in bytes, associated with graphs since the last time it was reset. High watermark can only be reset to zero.

  * cudaGraphMemAttrReservedMemCurrent: Amount of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.

  * cudaGraphMemAttrReservedMemHigh: High watermark of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.


  * Graph objects are not threadsafe. More here.


**See also:**

cudaDeviceSetGraphMemAttribute, cudaGraphAddMemAllocNode, cudaGraphAddMemFreeNode, cudaDeviceGraphMemTrim, cudaMallocAsync, cudaFreeAsync

__host__ cudaError_t cudaDeviceGraphMemTrim ( int  device )


Free unused memory that was cached on the specified device for use with graphs back to the OS.

######  Parameters

`device`
    \- The device for which cached memory should be freed.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Blocks which are not in use by a graph that is either currently executing or scheduled to execute are freed back to the operating system.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddMemAllocNode, cudaGraphAddMemFreeNode, cudaDeviceGetGraphMemAttribute, cudaDeviceSetGraphMemAttribute, cudaMallocAsync, cudaFreeAsync

__host__ cudaError_t cudaDeviceSetGraphMemAttribute ( int  device, cudaGraphMemAttributeType attr, void* value )


Set asynchronous allocation attributes related to graphs.

######  Parameters

`device`
    \- Specifies the scope of the query
`attr`
    \- attribute to get
`value`
    \- pointer to value to set

###### Returns

cudaSuccess, cudaErrorInvalidDevice

###### Description

Valid attributes are:

  * cudaGraphMemAttrUsedMemHigh: High watermark of memory, in bytes, associated with graphs since the last time it was reset. High watermark can only be reset to zero.

  * cudaGraphMemAttrReservedMemHigh: High watermark of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.


  * Graph objects are not threadsafe. More here.


**See also:**

cudaDeviceGetGraphMemAttribute, cudaGraphAddMemAllocNode, cudaGraphAddMemFreeNode, cudaDeviceGraphMemTrim, cudaMallocAsync, cudaFreeAsync

__device__ cudaGraphExec_t cudaGetCurrentGraphExec ( void ) [inline]


Get the currently running device graph id.

###### Returns

Returns the current device graph id, 0 if the call is outside of a device graph.

###### Description

Get the currently running device graph id.

**See also:**

cudaGraphLaunch

__host__ cudaError_t cudaGraphAddChildGraphNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, cudaGraph_t childGraph )


Creates a child graph node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`childGraph`
    \- The graph to clone into this node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new node which executes an embedded graph, and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

If `childGraph` contains allocation nodes, free nodes, or conditional nodes, this call will return an error.

The node executes an embedded child graph. The child graph is cloned in this call.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphChildGraphNodeGetGraph, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode, cudaGraphClone

__host__ cudaError_t cudaGraphAddDependencies ( cudaGraph_t graph, const cudaGraphNode_t* from, const cudaGraphNode_t* to, const cudaGraphEdgeData* edgeData, size_t numDependencies )


Adds dependency edges to a graph.

######  Parameters

`graph`
    \- Graph to which dependencies are added
`from`
    \- Array of nodes that provide the dependencies
`to`
    \- Array of dependent nodes
`edgeData`
    \- Optional array of edge data. If NULL, default (zeroed) edge data is assumed.
`numDependencies`
    \- Number of dependencies to be added

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

The number of dependencies to be added is defined by `numDependencies` Elements in `pFrom` and `pTo` at corresponding indices define a dependency. Each node in `pFrom` and `pTo` must belong to `graph`.

If `numDependencies` is 0, elements in `pFrom` and `pTo` will be ignored. Specifying an existing dependency will return an error.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphRemoveDependencies, cudaGraphGetEdges, cudaGraphNodeGetDependencies, cudaGraphNodeGetDependentNodes

__host__ cudaError_t cudaGraphAddEmptyNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies )


Creates an empty node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new node which performs no operation, and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

An empty node performs no operation during execution, but can be used for transitive ordering. For example, a phased execution graph with 2 groups of n nodes with a barrier between them can be represented using an empty node and 2*n dependency edges, rather than no empty node and n^2 dependency edges.

  * Graph objects are not threadsafe. More here.

  * Note that this function may also return cudaErrorInitializationError, cudaErrorInsufficientDriver or cudaErrorNoDevice if this call tries to initialize internal CUDA RT state.


**See also:**

cudaGraphAddNode, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddEventRecordNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, cudaEvent_t event )


Creates an event record node and adds it to a graph.

######  Parameters

`pGraphNode`

`graph`

`pDependencies`

`numDependencies`
    \- Number of dependencies
`event`
    \- Event for the node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new event record node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and event specified in `event`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

Each launch of the graph will record `event` to capture execution of the node's dependencies.

These nodes may not be used in loops or conditionals.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphAddEventWaitNode, cudaEventRecordWithFlags, cudaStreamWaitEvent, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddEventWaitNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, cudaEvent_t event )


Creates an event wait node and adds it to a graph.

######  Parameters

`pGraphNode`

`graph`

`pDependencies`

`numDependencies`
    \- Number of dependencies
`event`
    \- Event for the node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new event wait node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and event specified in `event`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

The graph node will wait for all work captured in `event`. See cuEventRecord() for details on what is captured by an event. The synchronization will be performed efficiently on the device when applicable. `event` may be from a different context or device than the launch stream.

These nodes may not be used in loops or conditionals.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphAddEventRecordNode, cudaEventRecordWithFlags, cudaStreamWaitEvent, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddExternalSemaphoresSignalNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const cudaExternalSemaphoreSignalNodeParams* nodeParams )


Creates an external semaphore signal node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new external semaphore signal node and adds it to `graph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

Performs a signal operation on a set of externally allocated semaphore objects when the node is launched. The operation(s) will occur after all of the node's dependencies have completed.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphExternalSemaphoresSignalNodeGetParams, cudaGraphExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaImportExternalSemaphore, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddEventRecordNode, cudaGraphAddEventWaitNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddExternalSemaphoresWaitNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const cudaExternalSemaphoreWaitNodeParams* nodeParams )


Creates an external semaphore wait node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new external semaphore wait node and adds it to `graph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

Performs a wait operation on a set of externally allocated semaphore objects when the node is launched. The node's dependencies will not be launched until the wait operation has completed.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphExternalSemaphoresWaitNodeGetParams, cudaGraphExternalSemaphoresWaitNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphAddExternalSemaphoresSignalNode, cudaImportExternalSemaphore, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddEventRecordNode, cudaGraphAddEventWaitNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddHostNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const cudaHostNodeParams* pNodeParams )


Creates a host execution node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`pNodeParams`
    \- Parameters for the host node

###### Returns

cudaSuccess, cudaErrorNotSupported, cudaErrorInvalidValue

###### Description

Creates a new CPU execution node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies` and arguments specified in `pNodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

When the graph is launched, the node will invoke the specified CPU function. Host nodes are not supported under MPS with pre-Volta GPUs.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaLaunchHostFunc, cudaGraphHostNodeGetParams, cudaGraphHostNodeSetParams, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddKernelNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const cudaKernelNodeParams* pNodeParams )


Creates a kernel execution node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`pNodeParams`
    \- Parameters for the GPU execution node

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDeviceFunction

###### Description

Creates a new kernel execution node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies` and arguments specified in `pNodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

The cudaKernelNodeParams structure is defined as:


    ‎  struct cudaKernelNodeParams
            {
                void* func;
                dim3 gridDim;
                dim3 blockDim;
                unsigned int sharedMemBytes;
                void **kernelParams;
                void **extra;
            };

When the graph is launched, the node will invoke kernel `func` on a (`gridDim.x` x `gridDim.y` x `gridDim.z`) grid of blocks. Each block contains (`blockDim.x` x `blockDim.y` x `blockDim.z`) threads.

`sharedMem` sets the amount of dynamic shared memory that will be available to each thread block.

Kernel parameters to `func` can be specified in one of two ways:

1) Kernel parameters can be specified via `kernelParams`. If the kernel has N parameters, then `kernelParams` needs to be an array of N pointers. Each pointer, from `kernelParams`[0] to `kernelParams`[N-1], points to the region of memory from which the actual parameter will be copied. The number of kernel parameters and their offsets and sizes do not need to be specified as that information is retrieved directly from the kernel's image.

2) Kernel parameters can also be packaged by the application into a single buffer that is passed in via `extra`. This places the burden on the application of knowing each kernel parameter's size and alignment/padding within the buffer. The `extra` parameter exists to allow this function to take additional less commonly used arguments. `extra` specifies a list of names of extra settings and their corresponding values. Each extra setting name is immediately followed by the corresponding value. The list must be terminated with either NULL or CU_LAUNCH_PARAM_END.

  * CU_LAUNCH_PARAM_END, which indicates the end of the `extra` array;

  * CU_LAUNCH_PARAM_BUFFER_POINTER, which specifies that the next value in `extra` will be a pointer to a buffer containing all the kernel parameters for launching kernel `func`;

  * CU_LAUNCH_PARAM_BUFFER_SIZE, which specifies that the next value in `extra` will be a pointer to a size_t containing the size of the buffer specified with CU_LAUNCH_PARAM_BUFFER_POINTER;


The error cudaErrorInvalidValue will be returned if kernel parameters are specified with both `kernelParams` and `extra` (i.e. both `kernelParams` and `extra` are non-NULL).

The `kernelParams` or `extra` array, as well as the argument values it points to, are copied during this call.

Kernels launched using graphs must not use texture and surface references. Reading or writing through any texture or surface reference is undefined behavior. This restriction does not apply to texture and surface objects.

  * Graph objects are not threadsafe. More here.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaGraphAddNode, cudaLaunchKernel, cudaGraphKernelNodeGetParams, cudaGraphKernelNodeSetParams, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddHostNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemAllocNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, cudaMemAllocNodeParams* nodeParams )


Creates an allocation node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorNotSupported, cudaErrorInvalidValue, cudaErrorOutOfMemory

###### Description

Creates a new allocation node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

When cudaGraphAddMemAllocNode creates an allocation node, it returns the address of the allocation in `nodeParams.dptr`. The allocation's address remains fixed across instantiations and launches.

If the allocation is freed in the same graph, by creating a free node using cudaGraphAddMemFreeNode, the allocation can be accessed by nodes ordered after the allocation node but before the free node. These allocations cannot be freed outside the owning graph, and they can only be freed once in the owning graph.

If the allocation is not freed in the same graph, then it can be accessed not only by nodes in the graph which are ordered after the allocation node, but also by stream operations ordered after the graph's execution but before the allocation is freed.

Allocations which are not freed in the same graph can be freed by:

  * passing the allocation to cudaMemFreeAsync or cudaMemFree;

  * launching a graph with a free node for that allocation; or

  * specifying cudaGraphInstantiateFlagAutoFreeOnLaunch during instantiation, which makes each launch behave as though it called cudaMemFreeAsync for every unfreed allocation.


It is not possible to free an allocation in both the owning graph and another graph. If the allocation is freed in the same graph, a free node cannot be added to another graph. If the allocation is freed in another graph, a free node can no longer be added to the owning graph.

The following restrictions apply to graphs which contain allocation and/or memory free nodes:

  * Nodes and edges of the graph cannot be deleted.

  * The graph can only be used in a child node if the ownership is moved to the parent.

  * Only one instantiation of the graph may exist at any point in time.

  * The graph cannot be cloned.


  * Graph objects are not threadsafe. More here.

  *
**See also:**

cudaGraphAddNode, cudaGraphAddMemFreeNode, cudaGraphMemAllocNodeGetParams, cudaDeviceGraphMemTrim, cudaDeviceGetGraphMemAttribute, cudaDeviceSetGraphMemAttribute, cudaMallocAsync, cudaFreeAsync, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddEventRecordNode, cudaGraphAddEventWaitNode, cudaGraphAddExternalSemaphoresSignalNode, cudaGraphAddExternalSemaphoresWaitNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemFreeNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, void* dptr )


Creates a memory free node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`dptr`
    \- Address of memory to free

###### Returns

cudaSuccess, cudaErrorCudartUnloading, cudaErrorInitializationError, cudaErrorNotSupported, cudaErrorInvalidValue, cudaErrorOutOfMemory

###### Description

Creates a new memory free node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies` and address specified in `dptr`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

cudaGraphAddMemFreeNode will return cudaErrorInvalidValue if the user attempts to free:

  * an allocation twice in the same graph.

  * an address that was not returned by an allocation node.

  * an invalid address.


The following restrictions apply to graphs which contain allocation and/or memory free nodes:

  * Nodes and edges of the graph cannot be deleted.

  * The graph can only be used in a child node if the ownership is moved to the parent.

  * Only one instantiation of the graph may exist at any point in time.

  * The graph cannot be cloned.


  * Graph objects are not threadsafe. More here.

  *
**See also:**

cudaGraphAddNode, cudaGraphAddMemAllocNode, cudaGraphMemFreeNodeGetParams, cudaDeviceGraphMemTrim, cudaDeviceGetGraphMemAttribute, cudaDeviceSetGraphMemAttribute, cudaMallocAsync, cudaFreeAsync, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddEventRecordNode, cudaGraphAddEventWaitNode, cudaGraphAddExternalSemaphoresSignalNode, cudaGraphAddExternalSemaphoresWaitNode, cudaGraphAddKernelNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemcpyNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const cudaMemcpy3DParms* pCopyParams )


Creates a memcpy node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`pCopyParams`
    \- Parameters for the memory copy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new memcpy node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

When the graph is launched, the node will perform the memcpy described by `pCopyParams`. See cudaMemcpy3D() for a description of the structure and its restrictions.

Memcpy nodes have some additional restrictions with regards to managed memory, if the system contains at least one device which has a zero value for the device attribute cudaDevAttrConcurrentManagedAccess.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaMemcpy3D, cudaGraphAddMemcpyNodeToSymbol, cudaGraphAddMemcpyNodeFromSymbol, cudaGraphAddMemcpyNode1D, cudaGraphMemcpyNodeGetParams, cudaGraphMemcpyNodeSetParams, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemcpyNode1D ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, void* dst, const void* src, size_t count, cudaMemcpyKind kind )


Creates a 1D memcpy node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`dst`
    \- Destination memory address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new 1D memcpy node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

When the graph is launched, the node will copy `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. Launching a memcpy node with dst and src pointers that do not match the direction of the copy results in an undefined behavior.

Memcpy nodes have some additional restrictions with regards to managed memory, if the system contains at least one device which has a zero value for the device attribute cudaDevAttrConcurrentManagedAccess.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpy, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeGetParams, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParams1D, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemcpyNodeFromSymbol ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, void* dst, const void* symbol, size_t count, size_t offset, cudaMemcpyKind kind )


Creates a memcpy node to copy from a symbol on the device and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`dst`
    \- Destination memory address
`symbol`
    \- Device symbol address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new memcpy node to copy from `symbol` and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

When the graph is launched, the node will copy `count` bytes from the memory area pointed to by `offset` bytes from the start of symbol `symbol` to the memory area pointed to by `dst`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

Memcpy nodes have some additional restrictions with regards to managed memory, if the system contains at least one device which has a zero value for the device attribute cudaDevAttrConcurrentManagedAccess.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpyFromSymbol, cudaGraphAddMemcpyNode, cudaGraphAddMemcpyNodeToSymbol, cudaGraphMemcpyNodeGetParams, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParamsFromSymbol, cudaGraphMemcpyNodeSetParamsToSymbol, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemcpyNodeToSymbol ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const void* symbol, const void* src, size_t count, size_t offset, cudaMemcpyKind kind )


Creates a memcpy node to copy to a symbol on the device and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`symbol`
    \- Device symbol address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates a new memcpy node to copy to `symbol` and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

When the graph is launched, the node will copy `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `offset` bytes from the start of symbol `symbol`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyHostToDevice, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

Memcpy nodes have some additional restrictions with regards to managed memory, if the system contains at least one device which has a zero value for the device attribute cudaDevAttrConcurrentManagedAccess.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpyToSymbol, cudaGraphAddMemcpyNode, cudaGraphAddMemcpyNodeFromSymbol, cudaGraphMemcpyNodeGetParams, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParamsToSymbol, cudaGraphMemcpyNodeSetParamsFromSymbol, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphAddMemsetNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, size_t numDependencies, const cudaMemsetParams* pMemsetParams )


Creates a memset node and adds it to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`pMemsetParams`
    \- Parameters for the memory set

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDevice

###### Description

Creates a new memset node and adds it to `graph` with `numDependencies` dependencies specified via `pDependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `pDependencies` may not have any duplicate entries. A handle to the new node will be returned in `pGraphNode`.

The element size must be 1, 2, or 4 bytes. When the graph is launched, the node will perform the memset described by `pMemsetParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaMemset2D, cudaGraphMemsetNodeGetParams, cudaGraphMemsetNodeSetParams, cudaGraphCreate, cudaGraphDestroyNode, cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemcpyNode

__host__ cudaError_t cudaGraphAddNode ( cudaGraphNode_t* pGraphNode, cudaGraph_t graph, const cudaGraphNode_t* pDependencies, const cudaGraphEdgeData* dependencyData, size_t numDependencies, cudaGraphNodeParams* nodeParams )


Adds a node of arbitrary type to a graph.

######  Parameters

`pGraphNode`
    \- Returns newly created node
`graph`
    \- Graph to which to add the node
`pDependencies`
    \- Dependencies of the node
`dependencyData`
    \- Optional edge data for the dependencies. If NULL, the data is assumed to be default (zeroed) for all dependencies.
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Specification of the node

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDeviceFunction, cudaErrorNotSupported

###### Description

Creates a new node in `graph` described by `nodeParams` with `numDependencies` dependencies specified via `pDependencies`. `numDependencies` may be 0. `pDependencies` may be null if `numDependencies` is 0. `pDependencies` may not have any duplicate entries.

`nodeParams` is a tagged union. The node type should be specified in the `type` field, and type-specific parameters in the corresponding union member. All unused bytes - that is, `reserved0` and all bytes past the utilized union member - must be set to zero. It is recommended to use brace initialization or memset to ensure all bytes are initialized.

Note that for some node types, `nodeParams` may contain "out parameters" which are modified during the call, such as `nodeParams->alloc.dptr`.

A handle to the new node will be returned in `phGraphNode`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphCreate, cudaGraphNodeSetParams, cudaGraphExecNodeSetParams

__host__ cudaError_t cudaGraphChildGraphNodeGetGraph ( cudaGraphNode_t node, cudaGraph_t* pGraph )


Gets a handle to the embedded graph of a child graph node.

######  Parameters

`node`
    \- Node to get the embedded graph for
`pGraph`
    \- Location to store a handle to the graph

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Gets a handle to the embedded graph in a child graph node. This call does not clone the graph. Changes to the graph will be reflected in the node, and the node retains ownership of the graph.

Allocation and free nodes cannot be added to the returned graph. Attempting to do so will return an error.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddChildGraphNode, cudaGraphNodeFindInClone

__host__ cudaError_t cudaGraphClone ( cudaGraph_t* pGraphClone, cudaGraph_t originalGraph )


Clones a graph.

######  Parameters

`pGraphClone`
    \- Returns newly created cloned graph
`originalGraph`
    \- Graph to clone

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

This function creates a copy of `originalGraph` and returns it in `pGraphClone`. All parameters are copied into the cloned graph. The original graph may be modified after this call without affecting the clone.

Child graph nodes in the original graph are recursively copied into the clone.

: Cloning is not supported for graphs which contain memory allocation nodes, memory free nodes, or conditional nodes.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphCreate, cudaGraphNodeFindInClone

__host__ cudaError_t cudaGraphConditionalHandleCreate ( cudaGraphConditionalHandle* pHandle_out, cudaGraph_t graph, unsigned int  defaultLaunchValue = 0, unsigned int  flags = 0 )


Create a conditional handle.

######  Parameters

`pHandle_out`
    \- Pointer used to return the handle to the caller.
`graph`
    \- Graph which will contain the conditional node using this handle.
`defaultLaunchValue`
    \- Optional initial value for the conditional variable. Applied at the beginning of each graph execution if cudaGraphCondAssignDefault is set in `flags`.
`flags`
    \- Currently must be cudaGraphCondAssignDefault or 0.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Creates a conditional handle associated with `hGraph`.

The conditional handle must be associated with a conditional node in this graph or one of its children.

Handles not associated with a conditional node may cause graph instantiation to fail.

  * Graph objects are not threadsafe. More here.

  *
**See also:**

cuGraphAddNode

__host__ cudaError_t cudaGraphConditionalHandleCreate_v2 ( cudaGraphConditionalHandle* pHandle_out, cudaGraph_t graph, cudaExecutionContext_t ctx = NULL, unsigned int  defaultLaunchValue = 0, unsigned int  flags = 0 )


Create a conditional handle.

######  Parameters

`pHandle_out`
    \- Pointer used to return the handle to the caller.
`graph`
    \- Graph which will contain the conditional node using this handle.
`ctx`
    \- Execution context for the handle and associated conditional node. If NULL, current context will be used.
`defaultLaunchValue`
    \- Optional initial value for the conditional variable. Applied at the beginning of each graph execution if cudaGraphCondAssignDefault is set in `flags`.
`flags`
    \- Currently must be cudaGraphCondAssignDefault or 0.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Creates a conditional handle associated with `hGraph`.

The conditional handle must be associated with a conditional node in this graph or one of its children.

Handles not associated with a conditional node may cause graph instantiation to fail.

  * Graph objects are not threadsafe. More here.

  *
**See also:**

cuGraphAddNode

__host__ cudaError_t cudaGraphCreate ( cudaGraph_t* pGraph, unsigned int  flags )


Creates a graph.

######  Parameters

`pGraph`
    \- Returns newly created graph
`flags`
    \- Graph creation flags, must be 0

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorMemoryAllocation

###### Description

Creates an empty graph, which is returned via `pGraph`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode, cudaGraphInstantiate, cudaGraphDestroy, cudaGraphGetNodes, cudaGraphGetRootNodes, cudaGraphGetEdges, cudaGraphClone

__host__ cudaError_t cudaGraphDebugDotPrint ( cudaGraph_t graph, const char* path, unsigned int  flags )


Write a DOT file describing graph structure.

######  Parameters

`graph`
    \- The graph to create a DOT file from
`path`
    \- The path to write the DOT file to
`flags`
    \- Flags from cudaGraphDebugDotFlags for specifying which additional node information to write

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorOperatingSystem

###### Description

Using the provided `graph`, write to `path` a DOT formatted description of the graph. By default this includes the graph topology, node types, node id, kernel names and memcpy direction. `flags` can be specified to write more detailed information about each node type such as parameter values, kernel attributes, node and function handles.

__host__ cudaError_t cudaGraphDestroy ( cudaGraph_t graph )


Destroys a graph.

######  Parameters

`graph`
    \- Graph to destroy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Destroys the graph specified by `graph`, as well as all of its nodes.

  * Graph objects are not threadsafe. More here.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaGraphCreate

__host__ cudaError_t cudaGraphDestroyNode ( cudaGraphNode_t node )


Remove a node from the graph.

######  Parameters

`node`
    \- Node to remove

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Removes `node` from its graph. This operation also severs any dependencies of other nodes on `node` and vice versa.

Dependencies cannot be removed from graphs which contain allocation or free nodes. Any attempt to do so will return an error.

  * Graph objects are not threadsafe. More here.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaGraphAddChildGraphNode, cudaGraphAddEmptyNode, cudaGraphAddKernelNode, cudaGraphAddHostNode, cudaGraphAddMemcpyNode, cudaGraphAddMemsetNode

__host__ cudaError_t cudaGraphEventRecordNodeGetEvent ( cudaGraphNode_t node, cudaEvent_t* event_out )


Returns the event associated with an event record node.

######  Parameters

`node`

`event_out`
    \- Pointer to return the event

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the event of event record node `hNode` in `event_out`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddEventRecordNode, cudaGraphEventRecordNodeSetEvent, cudaGraphEventWaitNodeGetEvent, cudaEventRecordWithFlags, cudaStreamWaitEvent

__host__ cudaError_t cudaGraphEventRecordNodeSetEvent ( cudaGraphNode_t node, cudaEvent_t event )


Sets an event record node's event.

######  Parameters

`node`

`event`
    \- Event to use

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the event of event record node `hNode` to `event`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaGraphAddEventRecordNode, cudaGraphEventRecordNodeGetEvent, cudaGraphEventWaitNodeSetEvent, cudaEventRecordWithFlags, cudaStreamWaitEvent

__host__ cudaError_t cudaGraphEventWaitNodeGetEvent ( cudaGraphNode_t node, cudaEvent_t* event_out )


Returns the event associated with an event wait node.

######  Parameters

`node`

`event_out`
    \- Pointer to return the event

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the event of event wait node `hNode` in `event_out`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddEventWaitNode, cudaGraphEventWaitNodeSetEvent, cudaGraphEventRecordNodeGetEvent, cudaEventRecordWithFlags, cudaStreamWaitEvent

__host__ cudaError_t cudaGraphEventWaitNodeSetEvent ( cudaGraphNode_t node, cudaEvent_t event )


Sets an event wait node's event.

######  Parameters

`node`

`event`
    \- Event to use

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the event of event wait node `hNode` to `event`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaGraphAddEventWaitNode, cudaGraphEventWaitNodeGetEvent, cudaGraphEventRecordNodeSetEvent, cudaEventRecordWithFlags, cudaStreamWaitEvent

__host__ cudaError_t cudaGraphExecChildGraphNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, cudaGraph_t childGraph )


Updates node parameters in the child graph node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Host node from the graph which was used to instantiate graphExec
`childGraph`
    \- The graph supplying the updated parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though the nodes contained in `node's` graph had the parameters contained in `childGraph's` nodes at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

The topology of `childGraph`, as well as the node insertion order, must match that of the graph contained in `node`. See cudaGraphExecUpdate() for a list of restrictions on what can be updated in an instantiated graph. The update is recursive, so child graph nodes contained within the top level child graph will also be updated.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddChildGraphNode, cudaGraphChildGraphNodeGetGraph, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecDestroy ( cudaGraphExec_t graphExec )


Destroys an executable graph.

######  Parameters

`graphExec`
    \- Executable graph to destroy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Destroys the executable graph specified by `graphExec`.

  * Graph objects are not threadsafe. More here.

  * Use of the handle after this call is undefined behavior.


**See also:**

cudaGraphInstantiate, cudaGraphUpload, cudaGraphLaunch

__host__ cudaError_t cudaGraphExecEventRecordNodeSetEvent ( cudaGraphExec_t hGraphExec, cudaGraphNode_t hNode, cudaEvent_t event )


Sets the event for an event record node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Event record node from the graph from which graphExec was instantiated
`event`
    \- Updated event to use

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the event of an event record node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddEventRecordNode, cudaGraphEventRecordNodeGetEvent, cudaGraphEventWaitNodeSetEvent, cudaEventRecordWithFlags, cudaStreamWaitEvent, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecEventWaitNodeSetEvent ( cudaGraphExec_t hGraphExec, cudaGraphNode_t hNode, cudaEvent_t event )


Sets the event for an event wait node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Event wait node from the graph from which graphExec was instantiated
`event`
    \- Updated event to use

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the event of an event wait node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddEventWaitNode, cudaGraphEventWaitNodeGetEvent, cudaGraphEventRecordNodeSetEvent, cudaEventRecordWithFlags, cudaStreamWaitEvent, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecExternalSemaphoresSignalNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t hNode, const cudaExternalSemaphoreSignalNodeParams* nodeParams )


Sets the parameters for an external semaphore signal node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- semaphore signal node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of an external semaphore signal node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

Changing `nodeParams->numExtSems` is not supported.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddExternalSemaphoresSignalNode, cudaImportExternalSemaphore, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecExternalSemaphoresWaitNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t hNode, const cudaExternalSemaphoreWaitNodeParams* nodeParams )


Sets the parameters for an external semaphore wait node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- semaphore wait node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of an external semaphore wait node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

Changing `nodeParams->numExtSems` is not supported.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaImportExternalSemaphore, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecGetFlags ( cudaGraphExec_t graphExec, unsigned long long* flags )


Query the instantiation flags of an executable graph.

######  Parameters

`graphExec`
    \- The executable graph to query
`flags`
    \- Returns the instantiation flags

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the flags that were passed to instantiation for the given executable graph. cudaGraphInstantiateFlagUpload will not be returned by this API as it does not affect the resulting executable graph.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphInstantiate, cudaGraphInstantiateWithFlags, cudaGraphInstantiateWithParams

__host__ cudaError_t cudaGraphExecGetId ( cudaGraphExec_t hGraphExec, unsigned int* graphID )


Returns the id of a given graph exec.

######  Parameters

`hGraphExec`
    \- Graph to query
`graphID`


###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the id of `hGraphExec` in `*graphId`. The value in `*graphId` matches that referenced by cudaGraphDebugDotPrint.

**See also:**

cudaGraphGetNodes, cudaGraphDebugDotPrintcudaGraphNodeGetContainingGraphcudaGraphNodeGetLocalIdcudaGraphNodeGetToolsIdcudaGraphGetId

__host__ cudaError_t cudaGraphExecHostNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, const cudaHostNodeParams* pNodeParams )


Sets the parameters for a host node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Host node from the graph which was used to instantiate graphExec
`pNodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though `node` had contained `pNodeParams` at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddHostNode, cudaGraphHostNodeSetParams, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecKernelNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, const cudaKernelNodeParams* pNodeParams )


Sets the parameters for a kernel node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- kernel node from the graph from which graphExec was instantiated
`pNodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of a kernel node in an executable graph `hGraphExec`. The node is identified by the corresponding node `node` in the non-executable graph, from which the executable graph was instantiated.

`node` must not have been removed from the original graph. All `nodeParams` fields may change, but the following restrictions apply to `func` updates:

  * The owning device of the function cannot change.

  * A node whose function originally did not use CUDA dynamic parallelism cannot be updated to a function which uses CDP

  * A node whose function originally did not make device-side update calls cannot be updated to a function which makes device-side update calls.

  * If `hGraphExec` was not instantiated for device launch, a node whose function originally did not use device-side cudaGraphLaunch() cannot be updated to a function which uses device-side cudaGraphLaunch() unless the node resides on the same device as nodes which contained such calls at instantiate-time. If no such calls were present at instantiation, these updates cannot be performed at all.


The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

If `node` is a device-updatable kernel node, the next upload/launch of `hGraphExec` will overwrite any previous device-side updates. Additionally, applying host updates to a device-updatable kernel node while it is being updated from the device will result in undefined behavior.

  * Graph objects are not threadsafe. More here.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddKernelNode, cudaGraphKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecMemcpyNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, const cudaMemcpy3DParms* pNodeParams )


Sets the parameters for a memcpy node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Memcpy node from the graph which was used to instantiate graphExec
`pNodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though `node` had contained `pNodeParams` at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

The source and destination memory in `pNodeParams` must be allocated from the same contexts as the original source and destination memory. Both the instantiation-time memory operands and the memory operands in `pNodeParams` must be 1-dimensional. Zero-length operations are not supported.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

Returns cudaErrorInvalidValue if the memory operands' mappings changed or either the original or new memory operands are multidimensional.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeSetParams, cudaGraphExecMemcpyNodeSetParamsToSymbol, cudaGraphExecMemcpyNodeSetParamsFromSymbol, cudaGraphExecMemcpyNodeSetParams1D, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecMemcpyNodeSetParams1D ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, void* dst, const void* src, size_t count, cudaMemcpyKind kind )


Sets the parameters for a memcpy node in the given graphExec to perform a 1-dimensional copy.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Memcpy node from the graph which was used to instantiate graphExec
`dst`
    \- Destination memory address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though `node` had contained the given params at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

`src` and `dst` must be allocated from the same contexts as the original source and destination memory. The instantiation-time memory operands must be 1-dimensional. Zero-length operations are not supported.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

Returns cudaErrorInvalidValue if the memory operands' mappings changed or the original memory operands are multidimensional.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddMemcpyNode, cudaGraphAddMemcpyNode1D, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParams1D, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecMemcpyNodeSetParamsFromSymbol ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, void* dst, const void* symbol, size_t count, size_t offset, cudaMemcpyKind kind )


Sets the parameters for a memcpy node in the given graphExec to copy from a symbol on the device.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Memcpy node from the graph which was used to instantiate graphExec
`dst`
    \- Destination memory address
`symbol`
    \- Device symbol address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though `node` had contained the given params at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

`symbol` and `dst` must be allocated from the same contexts as the original source and destination memory. The instantiation-time memory operands must be 1-dimensional. Zero-length operations are not supported.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

Returns cudaErrorInvalidValue if the memory operands' mappings changed or the original memory operands are multidimensional.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddMemcpyNode, cudaGraphAddMemcpyNodeFromSymbol, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParamsFromSymbol, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemcpyNodeSetParamsToSymbol, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecMemcpyNodeSetParamsToSymbol ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, const void* symbol, const void* src, size_t count, size_t offset, cudaMemcpyKind kind )


Sets the parameters for a memcpy node in the given graphExec to copy to a symbol on the device.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Memcpy node from the graph which was used to instantiate graphExec
`symbol`
    \- Device symbol address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though `node` had contained the given params at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

`src` and `symbol` must be allocated from the same contexts as the original source and destination memory. The instantiation-time memory operands must be 1-dimensional. Zero-length operations are not supported.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

Returns cudaErrorInvalidValue if the memory operands' mappings changed or the original memory operands are multidimensional.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddMemcpyNode, cudaGraphAddMemcpyNodeToSymbol, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParamsToSymbol, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecMemcpyNodeSetParamsFromSymbol, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemsetNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecMemsetNodeSetParams ( cudaGraphExec_t hGraphExec, cudaGraphNode_t node, const cudaMemsetParams* pNodeParams )


Sets the parameters for a memset node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`node`
    \- Memset node from the graph which was used to instantiate graphExec
`pNodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the work represented by `node` in `hGraphExec` as though `node` had contained `pNodeParams` at instantiation. `node` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `node` are ignored.

Zero sized operations are not supported.

The new destination pointer in `pNodeParams` must be to the same kind of allocation as the original destination pointer and have the same context association and device mapping as the original destination pointer.

Both the value and pointer address may be updated. Changing other aspects of the memset (width, height, element size or pitch) may cause the update to be rejected. Specifically, for 2d memsets, all dimension changes are rejected. For 1d memsets, changes in height are explicitly rejected and other changes are opportunistically allowed if the resulting work maps onto the work resources already allocated for the node.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `node` is also not modified by this call.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphExecNodeSetParams, cudaGraphAddMemsetNode, cudaGraphMemsetNodeSetParams, cudaGraphExecKernelNodeSetParams, cudaGraphExecMemcpyNodeSetParams, cudaGraphExecHostNodeSetParams, cudaGraphExecChildGraphNodeSetParams, cudaGraphExecEventRecordNodeSetEvent, cudaGraphExecEventWaitNodeSetEvent, cudaGraphExecExternalSemaphoresSignalNodeSetParams, cudaGraphExecExternalSemaphoresWaitNodeSetParams, cudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecNodeSetParams ( cudaGraphExec_t graphExec, cudaGraphNode_t node, cudaGraphNodeParams* nodeParams )


Update's a graph node's parameters in an instantiated graph.

######  Parameters

`graphExec`
    \- The executable graph in which to update the specified node
`node`
    \- Corresponding node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDeviceFunction, cudaErrorNotSupported

###### Description

Sets the parameters of a node in an executable graph `graphExec`. The node is identified by the corresponding node `node` in the non-executable graph from which the executable graph was instantiated. `node` must not have been removed from the original graph.

The modifications only affect future launches of `graphExec`. Already enqueued or running launches of `graphExec` are not affected by this call. `node` is also not modified by this call.

Allowed changes to parameters on executable graphs are as follows:

Node type |  Allowed changes
---|---
kernel |  See cudaGraphExecKernelNodeSetParams
memcpy |  Addresses for 1-dimensional copies if allocated in same context; see cudaGraphExecMemcpyNodeSetParams
memset |  Addresses for 1-dimensional memsets if allocated in same context; see cudaGraphExecMemsetNodeSetParams
host |  Unrestricted
child graph |  Topology must match and restrictions apply recursively; see cudaGraphExecUpdate
event wait |  Unrestricted
event record |  Unrestricted
external semaphore signal |  Number of semaphore operations cannot change
external semaphore wait |  Number of semaphore operations cannot change
memory allocation |  API unsupported
memory free |  API unsupported

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphNodeSetParamscudaGraphExecUpdate, cudaGraphInstantiate

__host__ cudaError_t cudaGraphExecUpdate ( cudaGraphExec_t hGraphExec, cudaGraph_t hGraph, cudaGraphExecUpdateResultInfo* resultInfo )


Check whether an executable graph can be updated with a graph and perform the update if possible.

######  Parameters

`hGraphExec`
    The instantiated graph to be updated
`hGraph`
    The graph containing the updated parameters
`resultInfo`
    the error info structure

###### Returns

cudaSuccess, cudaErrorGraphExecUpdateFailure

###### Description

Updates the node parameters in the instantiated graph specified by `hGraphExec` with the node parameters in a topologically identical graph specified by `hGraph`.

Limitations:

  * Kernel nodes:
    * The owning context of the function cannot change.

    * A node whose function originally did not use CUDA dynamic parallelism cannot be updated to a function which uses CDP.

    * A node whose function originally did not make device-side update calls cannot be updated to a function which makes device-side update calls.

    * A cooperative node cannot be updated to a non-cooperative node, and vice-versa.

    * If the graph was instantiated with cudaGraphInstantiateFlagUseNodePriority, the priority attribute cannot change. Equality is checked on the originally requested priority values, before they are clamped to the device's supported range.

    * If `hGraphExec` was not instantiated for device launch, a node whose function originally did not use device-side cudaGraphLaunch() cannot be updated to a function which uses device-side cudaGraphLaunch() unless the node resides on the same device as nodes which contained such calls at instantiate-time. If no such calls were present at instantiation, these updates cannot be performed at all.

    * Neither `hGraph` nor `hGraphExec` may contain device-updatable kernel nodes.

  * Memset and memcpy nodes:
    * The CUDA device(s) to which the operand(s) was allocated/mapped cannot change.

    * The source/destination memory must be allocated from the same contexts as the original source/destination memory.

    * For 2d memsets, only address and assigned value may be updated.

    * For 1d memsets, updating dimensions is also allowed, but may fail if the resulting operation doesn't map onto the work resources already allocated for the node.

  * Additional memcpy node restrictions:
    * Changing either the source or destination memory type(i.e. CU_MEMORYTYPE_DEVICE, CU_MEMORYTYPE_ARRAY, etc.) is not supported.

  * Conditional nodes:
    * Changing node parameters is not supported.

    * Changing parameters of nodes within the conditional body graph is subject to the rules above.

    * Conditional handle flags and default values are updated as part of the graph update.


Note: The API may add further restrictions in future releases. The return code should always be checked.

cudaGraphExecUpdate sets the result member of `resultInfo` to cudaGraphExecUpdateErrorTopologyChanged under the following conditions:

  * The count of nodes directly in `hGraphExec` and `hGraph` differ, in which case resultInfo->errorNode is set to NULL.

  * `hGraph` has more exit nodes than `hGraph`, in which case resultInfo->errorNode is set to one of the exit nodes in hGraph.

  * A node in `hGraph` has a different number of dependencies than the node from `hGraphExec` it is paired with, in which case resultInfo->errorNode is set to the node from `hGraph`.

  * A node in `hGraph` has a dependency that does not match with the corresponding dependency of the paired node from `hGraphExec`. resultInfo->errorNode will be set to the node from `hGraph`. resultInfo->errorFromNode will be set to the mismatched dependency. The dependencies are paired based on edge order and a dependency does not match when the nodes are already paired based on other edges examined in the graph.


cudaGraphExecUpdate sets `the` result member of `resultInfo` to:

  * cudaGraphExecUpdateError if passed an invalid value.

  * cudaGraphExecUpdateErrorTopologyChanged if the graph topology changed

  * cudaGraphExecUpdateErrorNodeTypeChanged if the type of a node changed, in which case `hErrorNode_out` is set to the node from `hGraph`.

  * cudaGraphExecUpdateErrorFunctionChanged if the function of a kernel node changed (CUDA driver < 11.2)

  * cudaGraphExecUpdateErrorUnsupportedFunctionChange if the func field of a kernel changed in an unsupported way(see note above), in which case `hErrorNode_out` is set to the node from `hGraph`

  * cudaGraphExecUpdateErrorParametersChanged if any parameters to a node changed in a way that is not supported, in which case `hErrorNode_out` is set to the node from `hGraph`

  * cudaGraphExecUpdateErrorAttributesChanged if any attributes of a node changed in a way that is not supported, in which case `hErrorNode_out` is set to the node from `hGraph`

  * cudaGraphExecUpdateErrorNotSupported if something about a node is unsupported, like the node's type or configuration, in which case `hErrorNode_out` is set to the node from `hGraph`


If the update fails for a reason not listed above, the result member of `resultInfo` will be set to cudaGraphExecUpdateError. If the update succeeds, the result member will be set to cudaGraphExecUpdateSuccess.

cudaGraphExecUpdate returns cudaSuccess when the updated was performed successfully. It returns cudaErrorGraphExecUpdateFailure if the graph update was not performed because it included changes which violated constraints specific to instantiated graph update.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphInstantiate

__host__ cudaError_t cudaGraphExternalSemaphoresSignalNodeGetParams ( cudaGraphNode_t hNode, cudaExternalSemaphoreSignalNodeParams* params_out )


Returns an external semaphore signal node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`params_out`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the parameters of an external semaphore signal node `hNode` in `params_out`. The `extSemArray` and `paramsArray` returned in `params_out`, are owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cudaGraphExternalSemaphoresSignalNodeSetParams to update the parameters of this node.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaLaunchKernel, cudaGraphAddExternalSemaphoresSignalNode, cudaGraphExternalSemaphoresSignalNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaGraphExternalSemaphoresSignalNodeSetParams ( cudaGraphNode_t hNode, const cudaExternalSemaphoreSignalNodeParams* nodeParams )


Sets an external semaphore signal node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of an external semaphore signal node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaGraphAddExternalSemaphoresSignalNode, cudaGraphExternalSemaphoresSignalNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaGraphExternalSemaphoresWaitNodeGetParams ( cudaGraphNode_t hNode, cudaExternalSemaphoreWaitNodeParams* params_out )


Returns an external semaphore wait node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`params_out`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the parameters of an external semaphore wait node `hNode` in `params_out`. The `extSemArray` and `paramsArray` returned in `params_out`, are owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cudaGraphExternalSemaphoresSignalNodeSetParams to update the parameters of this node.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaLaunchKernel, cudaGraphAddExternalSemaphoresWaitNode, cudaGraphExternalSemaphoresWaitNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaGraphExternalSemaphoresWaitNodeSetParams ( cudaGraphNode_t hNode, const cudaExternalSemaphoreWaitNodeParams* nodeParams )


Sets an external semaphore wait node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of an external semaphore wait node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaGraphExternalSemaphoresWaitNodeSetParams, cudaGraphAddExternalSemaphoresWaitNode, cudaSignalExternalSemaphoresAsync, cudaWaitExternalSemaphoresAsync

__host__ cudaError_t cudaGraphGetEdges ( cudaGraph_t graph, cudaGraphNode_t* from, cudaGraphNode_t* to, cudaGraphEdgeData* edgeData, size_t* numEdges )


Returns a graph's dependency edges.

######  Parameters

`graph`
    \- Graph to get the edges from
`from`
    \- Location to return edge endpoints
`to`
    \- Location to return edge endpoints
`edgeData`
    \- Optional location to return edge data
`numEdges`
    \- See description

###### Returns

cudaSuccess, cudaErrorLossyQuery, cudaErrorInvalidValue

###### Description

Returns a list of `graph's` dependency edges. Edges are returned via corresponding indices in `from`, `to` and `edgeData`; that is, the node in `to`[i] has a dependency on the node in `from`[i] with data `edgeData`[i]. `from` and `to` may both be NULL, in which case this function only returns the number of edges in `numEdges`. Otherwise, `numEdges` entries will be filled in. If `numEdges` is higher than the actual number of edges, the remaining entries in `from` and `to` will be set to NULL, and the number of edges actually returned will be written to `numEdges`. `edgeData` may alone be NULL, in which case the edges must all have default (zeroed) edge data. Attempting a losst query via NULL `edgeData` will result in cudaErrorLossyQuery. If `edgeData` is non-NULL then `from` and `to` must be as well.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphGetNodes, cudaGraphGetRootNodes, cudaGraphAddDependencies, cudaGraphRemoveDependencies, cudaGraphNodeGetDependencies, cudaGraphNodeGetDependentNodes

__host__ cudaError_t cudaGraphGetId ( cudaGraph_t hGraph, unsigned int* graphID )


Returns the id of a given graph.

######  Parameters

`hGraph`
    \- Graph to query
`graphID`


###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the id of `hGraph` in `*graphId`. The value in `*graphId` matches that referenced by cudaGraphDebugDotPrint.

**See also:**

cudaGraphGetNodes, cudaGraphDebugDotPrintcudaGraphNodeGetContainingGraphcudaGraphNodeGetLocalIdcudaGraphNodeGetToolsIdcudaGraphExecGetId

__host__ cudaError_t cudaGraphGetNodes ( cudaGraph_t graph, cudaGraphNode_t* nodes, size_t* numNodes )


Returns a graph's nodes.

######  Parameters

`graph`
    \- Graph to query
`nodes`
    \- Pointer to return the nodes
`numNodes`
    \- See description

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns a list of `graph's` nodes. `nodes` may be NULL, in which case this function will return the number of nodes in `numNodes`. Otherwise, `numNodes` entries will be filled in. If `numNodes` is higher than the actual number of nodes, the remaining entries in `nodes` will be set to NULL, and the number of nodes actually obtained will be returned in `numNodes`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphCreate, cudaGraphGetRootNodes, cudaGraphGetEdges, cudaGraphNodeGetType, cudaGraphNodeGetDependencies, cudaGraphNodeGetDependentNodes

__host__ cudaError_t cudaGraphGetRootNodes ( cudaGraph_t graph, cudaGraphNode_t* pRootNodes, size_t* pNumRootNodes )


Returns a graph's root nodes.

######  Parameters

`graph`
    \- Graph to query
`pRootNodes`
    \- Pointer to return the root nodes
`pNumRootNodes`
    \- See description

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns a list of `graph's` root nodes. `pRootNodes` may be NULL, in which case this function will return the number of root nodes in `pNumRootNodes`. Otherwise, `pNumRootNodes` entries will be filled in. If `pNumRootNodes` is higher than the actual number of root nodes, the remaining entries in `pRootNodes` will be set to NULL, and the number of nodes actually obtained will be returned in `pNumRootNodes`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphCreate, cudaGraphGetNodes, cudaGraphGetEdges, cudaGraphNodeGetType, cudaGraphNodeGetDependencies, cudaGraphNodeGetDependentNodes

__host__ cudaError_t cudaGraphHostNodeGetParams ( cudaGraphNode_t node, cudaHostNodeParams* pNodeParams )


Returns a host node's parameters.

######  Parameters

`node`
    \- Node to get the parameters for
`pNodeParams`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the parameters of host node `node` in `pNodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaLaunchHostFunc, cudaGraphAddHostNode, cudaGraphHostNodeSetParams

__host__ cudaError_t cudaGraphHostNodeSetParams ( cudaGraphNode_t node, const cudaHostNodeParams* pNodeParams )


Sets a host node's parameters.

######  Parameters

`node`
    \- Node to set the parameters for
`pNodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of host node `node` to `nodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaLaunchHostFunc, cudaGraphAddHostNode, cudaGraphHostNodeGetParams

__host__ cudaError_t cudaGraphInstantiate ( cudaGraphExec_t* pGraphExec, cudaGraph_t graph, unsigned long long flags = 0 )


Creates an executable graph from a graph.

######  Parameters

`pGraphExec`
    \- Returns instantiated graph
`graph`
    \- Graph to instantiate
`flags`
    \- Flags to control instantiation. See CUgraphInstantiate_flags.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Instantiates `graph` as an executable graph. The graph is validated for any structural constraints or intra-node constraints which were not previously validated. If instantiation is successful, a handle to the instantiated graph is returned in `pGraphExec`.

The `flags` parameter controls the behavior of instantiation and subsequent graph launches. Valid flags are:

  * cudaGraphInstantiateFlagAutoFreeOnLaunch, which configures a graph containing memory allocation nodes to automatically free any unfreed memory allocations before the graph is relaunched.


  * cudaGraphInstantiateFlagDeviceLaunch, which configures the graph for launch from the device. If this flag is passed, the executable graph handle returned can be used to launch the graph from both the host and device. This flag cannot be used in conjunction with cudaGraphInstantiateFlagAutoFreeOnLaunch.


  * cudaGraphInstantiateFlagUseNodePriority, which causes the graph to use the priorities from the per-node attributes rather than the priority of the launch stream during execution. Note that priorities are only available on kernel nodes, and are copied from stream priority during stream capture.


If `graph` contains any allocation or free nodes, there can be at most one executable graph in existence for that graph at a time. An attempt to instantiate a second executable graph before destroying the first with cudaGraphExecDestroy will result in an error. The same also applies if `graph` contains any device-updatable kernel nodes.

Graphs instantiated for launch on the device have additional restrictions which do not apply to host graphs:

  * The graph's nodes must reside on a single device.

  * The graph can only contain kernel nodes, memcpy nodes, memset nodes, and child graph nodes.

  * The graph cannot be empty and must contain at least one kernel, memcpy, or memset node. Operation-specific restrictions are outlined below.

  * Kernel nodes:
    * Use of CUDA Dynamic Parallelism is not permitted.

    * Cooperative launches are permitted as long as MPS is not in use.

  * Memcpy nodes:
    * Only copies involving device memory and/or pinned device-mapped host memory are permitted.

    * Copies involving CUDA arrays are not permitted.

    * Both operands must be accessible from the current device, and the current device must match the device of other nodes in the graph.


If `graph` is not instantiated for launch on the device but contains kernels which call device-side cudaGraphLaunch() from multiple devices, this will result in an error.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphInstantiateWithFlags, cudaGraphCreate, cudaGraphUpload, cudaGraphLaunch, cudaGraphExecDestroy

__host__ cudaError_t cudaGraphInstantiateWithFlags ( cudaGraphExec_t* pGraphExec, cudaGraph_t graph, unsigned long long flags = 0 )


Creates an executable graph from a graph.

######  Parameters

`pGraphExec`
    \- Returns instantiated graph
`graph`
    \- Graph to instantiate
`flags`
    \- Flags to control instantiation. See CUgraphInstantiate_flags.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Instantiates `graph` as an executable graph. The graph is validated for any structural constraints or intra-node constraints which were not previously validated. If instantiation is successful, a handle to the instantiated graph is returned in `pGraphExec`.

The `flags` parameter controls the behavior of instantiation and subsequent graph launches. Valid flags are:

  * cudaGraphInstantiateFlagAutoFreeOnLaunch, which configures a graph containing memory allocation nodes to automatically free any unfreed memory allocations before the graph is relaunched.


  * cudaGraphInstantiateFlagDeviceLaunch, which configures the graph for launch from the device. If this flag is passed, the executable graph handle returned can be used to launch the graph from both the host and device. This flag can only be used on platforms which support unified addressing. This flag cannot be used in conjunction with cudaGraphInstantiateFlagAutoFreeOnLaunch.


  * cudaGraphInstantiateFlagUseNodePriority, which causes the graph to use the priorities from the per-node attributes rather than the priority of the launch stream during execution. Note that priorities are only available on kernel nodes, and are copied from stream priority during stream capture.


If `graph` contains any allocation or free nodes, there can be at most one executable graph in existence for that graph at a time. An attempt to instantiate a second executable graph before destroying the first with cudaGraphExecDestroy will result in an error. The same also applies if `graph` contains any device-updatable kernel nodes.

If `graph` contains kernels which call device-side cudaGraphLaunch() from multiple devices, this will result in an error.

Graphs instantiated for launch on the device have additional restrictions which do not apply to host graphs:

  * The graph's nodes must reside on a single device.

  * The graph can only contain kernel nodes, memcpy nodes, memset nodes, and child graph nodes.

  * The graph cannot be empty and must contain at least one kernel, memcpy, or memset node. Operation-specific restrictions are outlined below.

  * Kernel nodes:
    * Use of CUDA Dynamic Parallelism is not permitted.

    * Cooperative launches are permitted as long as MPS is not in use.

  * Memcpy nodes:
    * Only copies involving device memory and/or pinned device-mapped host memory are permitted.

    * Copies involving CUDA arrays are not permitted.

    * Both operands must be accessible from the current device, and the current device must match the device of other nodes in the graph.


  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphInstantiate, cudaGraphCreate, cudaGraphUpload, cudaGraphLaunch, cudaGraphExecDestroy

__host__ cudaError_t cudaGraphInstantiateWithParams ( cudaGraphExec_t* pGraphExec, cudaGraph_t graph, cudaGraphInstantiateParams* instantiateParams )


Creates an executable graph from a graph.

######  Parameters

`pGraphExec`
    \- Returns instantiated graph
`graph`
    \- Graph to instantiate
`instantiateParams`
    \- Instantiation parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Instantiates `graph` as an executable graph according to the `instantiateParams` structure. The graph is validated for any structural constraints or intra-node constraints which were not previously validated. If instantiation is successful, a handle to the instantiated graph is returned in `pGraphExec`.

`instantiateParams` controls the behavior of instantiation and subsequent graph launches, as well as returning more detailed information in the event of an error. cudaGraphInstantiateParams is defined as:


    ‎    typedef struct {
                  unsigned long long flags;
                  cudaStream_t uploadStream;
                  cudaGraphNode_t errNode_out;
                  cudaGraphInstantiateResult result_out;
              } cudaGraphInstantiateParams;

The `flags` field controls the behavior of instantiation and subsequent graph launches. Valid flags are:

  * cudaGraphInstantiateFlagAutoFreeOnLaunch, which configures a graph containing memory allocation nodes to automatically free any unfreed memory allocations before the graph is relaunched.


  * cudaGraphInstantiateFlagUpload, which will perform an upload of the graph into `uploadStream` once the graph has been instantiated.


  * cudaGraphInstantiateFlagDeviceLaunch, which configures the graph for launch from the device. If this flag is passed, the executable graph handle returned can be used to launch the graph from both the host and device. This flag can only be used on platforms which support unified addressing. This flag cannot be used in conjunction with cudaGraphInstantiateFlagAutoFreeOnLaunch.


  * cudaGraphInstantiateFlagUseNodePriority, which causes the graph to use the priorities from the per-node attributes rather than the priority of the launch stream during execution. Note that priorities are only available on kernel nodes, and are copied from stream priority during stream capture.


If `graph` contains any allocation or free nodes, there can be at most one executable graph in existence for that graph at a time. An attempt to instantiate a second executable graph before destroying the first with cudaGraphExecDestroy will result in an error. The same also applies if `graph` contains any device-updatable kernel nodes.

If `graph` contains kernels which call device-side cudaGraphLaunch() from multiple devices, this will result in an error.

Graphs instantiated for launch on the device have additional restrictions which do not apply to host graphs:

  * The graph's nodes must reside on a single device.

  * The graph can only contain kernel nodes, memcpy nodes, memset nodes, and child graph nodes.

  * The graph cannot be empty and must contain at least one kernel, memcpy, or memset node. Operation-specific restrictions are outlined below.

  * Kernel nodes:
    * Use of CUDA Dynamic Parallelism is not permitted.

    * Cooperative launches are permitted as long as MPS is not in use.

  * Memcpy nodes:
    * Only copies involving device memory and/or pinned device-mapped host memory are permitted.

    * Copies involving CUDA arrays are not permitted.

    * Both operands must be accessible from the current device, and the current device must match the device of other nodes in the graph.


In the event of an error, the `result_out` and `errNode_out` fields will contain more information about the nature of the error. Possible error reporting includes:

  * cudaGraphInstantiateError, if passed an invalid value or if an unexpected error occurred which is described by the return value of the function. `errNode_out` will be set to NULL.

  * cudaGraphInstantiateInvalidStructure, if the graph structure is invalid. `errNode_out` will be set to one of the offending nodes.

  * cudaGraphInstantiateNodeOperationNotSupported, if the graph is instantiated for device launch but contains a node of an unsupported node type, or a node which performs unsupported operations, such as use of CUDA dynamic parallelism within a kernel node. `errNode_out` will be set to this node.

  * cudaGraphInstantiateMultipleDevicesNotSupported, if the graph is instantiated for device launch but a node’s device differs from that of another node. This error can also be returned if a graph is not instantiated for device launch and it contains kernels which call device-side cudaGraphLaunch() from multiple devices. `errNode_out` will be set to this node.


If instantiation is successful, `result_out` will be set to cudaGraphInstantiateSuccess, and `hErrNode_out` will be set to NULL.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphCreate, cudaGraphInstantiate, cudaGraphInstantiateWithFlags, cudaGraphExecDestroy

__host__ cudaError_t cudaGraphKernelNodeCopyAttributes ( cudaGraphNode_t hDst, cudaGraphNode_t hSrc )


Copies attributes from source node to destination node.

######  Parameters

`hDst`
    Destination node
`hSrc`
    Source node For list of attributes see cudaKernelNodeAttrID

###### Returns

cudaSuccess, cudaErrorInvalidContext

###### Description

Copies attributes from source node `hSrc` to destination node `hDst`. Both node must have the same context.

**See also:**

cudaAccessPolicyWindow

__host__ cudaError_t cudaGraphKernelNodeGetAttribute ( cudaGraphNode_t hNode, cudaKernelNodeAttrID attr, cudaKernelNodeAttrValue* value_out )


Queries node attribute.

######  Parameters

`hNode`

`attr`

`value_out`


###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Queries attribute `attr` from node `hNode` and stores it in corresponding member of `value_out`.

**See also:**

cudaAccessPolicyWindow

__host__ cudaError_t cudaGraphKernelNodeGetParams ( cudaGraphNode_t node, cudaKernelNodeParams* pNodeParams )


Returns a kernel node's parameters.

######  Parameters

`node`
    \- Node to get the parameters for
`pNodeParams`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDeviceFunction

###### Description

Returns the parameters of kernel node `node` in `pNodeParams`. The `kernelParams` or `extra` array returned in `pNodeParams`, as well as the argument values it points to, are owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cudaGraphKernelNodeSetParams to update the parameters of this node.

The params will contain either `kernelParams` or `extra`, according to which of these was most recently set on the node.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaLaunchKernel, cudaGraphAddKernelNode, cudaGraphKernelNodeSetParams

__host__ cudaError_t cudaGraphKernelNodeSetAttribute ( cudaGraphNode_t hNode, cudaKernelNodeAttrID attr, const cudaKernelNodeAttrValue* value )


Sets node attribute.

######  Parameters

`hNode`

`attr`

`value`


###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle

###### Description

Sets attribute `attr` on node `hNode` from corresponding attribute of `value`.

**See also:**

cudaAccessPolicyWindow

__device__ cudaError_t cudaGraphKernelNodeSetEnabled ( cudaGraphDeviceNode_t node, bool  enable )


Enables or disables the given kernel node.

######  Parameters

`node`
    \- The node to update
`enable`
    \- Whether to enable or disable the node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Enables or disables `node` based upon `enable`. If `enable` is true, the node will be enabled; if it is false, the node will be disabled. Disabled nodes will act as a NOP during execution. `node` must be device-updatable, and must reside upon the same device as the calling kernel.

If this function is called for the node's immediate dependent and that dependent is configured for programmatic dependent launch, then a memory fence must be invoked via __threadfence() before kickoff of the dependent is triggered via cudaTriggerProgrammaticLaunchCompletion() to ensure that the update is visible to that dependent node before it is launched.

**See also:**

cudaGraphKernelNodeSetParam, cudaGraphKernelNodeSetGridDim, cudaGraphKernelNodeUpdatesApply

__device__ cudaError_t cudaGraphKernelNodeSetGridDim ( cudaGraphDeviceNode_t node, dim3 gridDim )


Updates the grid dimensions of the given kernel node.

######  Parameters

`node`
    \- The node to update
`gridDim`
    \- The grid dimensions to set

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the grid dimensions of `node` to `gridDim`. `node` must be device-updatable, and must reside upon the same device as thecalling kernel.

If this function is called for the node's immediate dependent and that dependent is configured for programmatic dependent launch, then a memory fence must be invoked via __threadfence() before kickoff of the dependent is triggered via cudaTriggerProgrammaticLaunchCompletion() to ensure that the update is visible to that dependent node before it is launched.

**See also:**

cudaGraphKernelNodeSetParam, cudaGraphKernelNodeSetEnabled, cudaGraphKernelNodeUpdatesApply

template < typename T >

__device__ cudaError_t cudaGraphKernelNodeSetParam ( cudaGraphDeviceNode_t node, size_t offset, const T& value ) [inline]


Updates the kernel parameters of the given kernel node.

######  Parameters

`node`
    \- The node to update
`offset`
    \- The offset into the params at which to make the update
`value`
    \- Parameter value to write

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates the kernel parameters of `node` at `offset` to `value`. `node` must be device-updatable, and must reside upon the same device as the calling kernel.

If this function is called for the node's immediate dependent and that dependent is configured for programmatic dependent launch, then a memory fence must be invoked via __threadfence() before kickoff of the dependent is triggered via cudaTriggerProgrammaticLaunchCompletion() to ensure that the update is visible to that dependent node before it is launched.

**See also:**

cudaGraphKernelNodeSetEnabled, cudaGraphKernelNodeSetGridDim, cudaGraphKernelNodeUpdatesApply

__device__ cudaError_t cudaGraphKernelNodeSetParam ( cudaGraphDeviceNode_t node, size_t offset, const void* value, size_t size )


Updates the kernel parameters of the given kernel node.

######  Parameters

`node`
    \- The node to update
`offset`
    \- The offset into the params at which to make the update
`value`
    \- Buffer containing the params to write
`size`
    \- Size in bytes to update

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Updates `size` bytes in the kernel parameters of `node` at `offset` to the contents of `value`. `node` must be device-updatable, and must reside upon the same device as the calling kernel.

If this function is called for the node's immediate dependent and that dependent is configured for programmatic dependent launch, then a memory fence must be invoked via __threadfence() before kickoff of the dependent is triggered via cudaTriggerProgrammaticLaunchCompletion() to ensure that the update is visible to that dependent node before it is launched.

**See also:**

cudaGraphKernelNodeSetEnabled, cudaGraphKernelNodeSetGridDim, cudaGraphKernelNodeUpdatesApply

__host__ cudaError_t cudaGraphKernelNodeSetParams ( cudaGraphNode_t node, const cudaKernelNodeParams* pNodeParams )


Sets a kernel node's parameters.

######  Parameters

`node`
    \- Node to set the parameters for
`pNodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidResourceHandle, cudaErrorMemoryAllocation

###### Description

Sets the parameters of kernel node `node` to `pNodeParams`.

  * Graph objects are not threadsafe. More here.

  * The API can also be used with a kernel cudaKernel_t by querying the handle using cudaLibraryGetKernel() or cudaGetKernel and then passing it to the API by casting to void*. The symbol `entryFuncAddr` passed to cudaGetKernel should be a symbol that is registered with the same CUDA Runtime instance.

  * Passing a symbol that belongs that belongs to a different runtime instance will result in undefined behavior. The only type that can be reliably passed to a different runtime instance is cudaKernel_t


**See also:**

cudaGraphNodeSetParams, cudaLaunchKernel, cudaGraphAddKernelNode, cudaGraphKernelNodeGetParams

__device__ cudaError_t cudaGraphKernelNodeUpdatesApply ( const cudaGraphKernelNodeUpdate* updates, size_t updateCount )


Batch applies multiple kernel node updates.

######  Parameters

`updates`
    \- The updates to apply
`updateCount`
    \- The number of updates to apply

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Batch applies one or more kernel node updates based on the information provided in `updates`. `updateCount` specifies the number of updates to apply. Each entry in `updates` must specify a node to update, the type of update to apply, and the parameters for that type of update. See the documentation for cudaGraphKernelNodeUpdate for more detail.

If this function is called for the node's immediate dependent and that dependent is configured for programmatic dependent launch, then a memory fence must be invoked via __threadfence() before kickoff of the dependent is triggered via cudaTriggerProgrammaticLaunchCompletion() to ensure that the update is visible to that dependent node before it is launched.

**See also:**

cudaGraphKernelNodeSetParam, cudaGraphKernelNodeSetEnabled, cudaGraphKernelNodeSetGridDim

__host__  __device__ cudaError_t cudaGraphLaunch ( cudaGraphExec_t graphExec, cudaStream_t stream )


Launches an executable graph in a stream.

######  Parameters

`graphExec`
    \- Executable graph to launch
`stream`
    \- Stream in which to launch the graph

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Executes `graphExec` in `stream`. Only one instance of `graphExec` may be executing at a time. Each launch is ordered behind both any previous work in `stream` and any previous launches of `graphExec`. To execute a graph concurrently, it must be instantiated multiple times into multiple executable graphs.

If any allocations created by `graphExec` remain unfreed (from a previous launch) and `graphExec` was not instantiated with cudaGraphInstantiateFlagAutoFreeOnLaunch, the launch will fail with cudaErrorInvalidValue.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphInstantiate, cudaGraphUpload, cudaGraphExecDestroy

__host__ cudaError_t cudaGraphMemAllocNodeGetParams ( cudaGraphNode_t node, cudaMemAllocNodeParams* params_out )


Returns a memory alloc node's parameters.

######  Parameters

`node`
    \- Node to get the parameters for
`params_out`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the parameters of a memory alloc node `hNode` in `params_out`. The `poolProps` and `accessDescs` returned in `params_out`, are owned by the node. This memory remains valid until the node is destroyed. The returned parameters must not be modified.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddMemAllocNode, cudaGraphMemFreeNodeGetParams

__host__ cudaError_t cudaGraphMemFreeNodeGetParams ( cudaGraphNode_t node, void* dptr_out )


Returns a memory free node's parameters.

######  Parameters

`node`
    \- Node to get the parameters for
`dptr_out`
    \- Pointer to return the device address

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the address of a memory free node `hNode` in `dptr_out`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddMemFreeNode, cudaGraphMemFreeNodeGetParams

__host__ cudaError_t cudaGraphMemcpyNodeGetParams ( cudaGraphNode_t node, cudaMemcpy3DParms* pNodeParams )


Returns a memcpy node's parameters.

######  Parameters

`node`
    \- Node to get the parameters for
`pNodeParams`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the parameters of memcpy node `node` in `pNodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpy3D, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeSetParams

__host__ cudaError_t cudaGraphMemcpyNodeSetParams ( cudaGraphNode_t node, const cudaMemcpy3DParms* pNodeParams )


Sets a memcpy node's parameters.

######  Parameters

`node`
    \- Node to set the parameters for
`pNodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of memcpy node `node` to `pNodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaMemcpy3D, cudaGraphMemcpyNodeSetParamsToSymbol, cudaGraphMemcpyNodeSetParamsFromSymbol, cudaGraphMemcpyNodeSetParams1D, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeGetParams

__host__ cudaError_t cudaGraphMemcpyNodeSetParams1D ( cudaGraphNode_t node, void* dst, const void* src, size_t count, cudaMemcpyKind kind )


Sets a memcpy node's parameters to perform a 1-dimensional copy.

######  Parameters

`node`
    \- Node to set the parameters for
`dst`
    \- Destination memory address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of memcpy node `node` to the copy described by the provided parameters.

When the graph is launched, the node will copy `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `dst`, where `kind` specifies the direction of the copy, and must be one of cudaMemcpyHostToHost, cudaMemcpyHostToDevice, cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing. Launching a memcpy node with dst and src pointers that do not match the direction of the copy results in an undefined behavior.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpy, cudaGraphMemcpyNodeSetParams, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeGetParams

__host__ cudaError_t cudaGraphMemcpyNodeSetParamsFromSymbol ( cudaGraphNode_t node, void* dst, const void* symbol, size_t count, size_t offset, cudaMemcpyKind kind )


Sets a memcpy node's parameters to copy from a symbol on the device.

######  Parameters

`node`
    \- Node to set the parameters for
`dst`
    \- Destination memory address
`symbol`
    \- Device symbol address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of memcpy node `node` to the copy described by the provided parameters.

When the graph is launched, the node will copy `count` bytes from the memory area pointed to by `offset` bytes from the start of symbol `symbol` to the memory area pointed to by `dst`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyDeviceToHost, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpyFromSymbol, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParamsToSymbol, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeGetParams

__host__ cudaError_t cudaGraphMemcpyNodeSetParamsToSymbol ( cudaGraphNode_t node, const void* symbol, const void* src, size_t count, size_t offset, cudaMemcpyKind kind )


Sets a memcpy node's parameters to copy to a symbol on the device.

######  Parameters

`node`
    \- Node to set the parameters for
`symbol`
    \- Device symbol address
`src`
    \- Source memory address
`count`
    \- Size in bytes to copy
`offset`
    \- Offset from start of symbol in bytes
`kind`
    \- Type of transfer

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of memcpy node `node` to the copy described by the provided parameters.

When the graph is launched, the node will copy `count` bytes from the memory area pointed to by `src` to the memory area pointed to by `offset` bytes from the start of symbol `symbol`. The memory areas may not overlap. `symbol` is a variable that resides in global or constant memory space. `kind` can be either cudaMemcpyHostToDevice, cudaMemcpyDeviceToDevice, or cudaMemcpyDefault. Passing cudaMemcpyDefault is recommended, in which case the type of transfer is inferred from the pointer values. However, cudaMemcpyDefault is only allowed on systems that support unified virtual addressing.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemcpyToSymbol, cudaGraphMemcpyNodeSetParams, cudaGraphMemcpyNodeSetParamsFromSymbol, cudaGraphAddMemcpyNode, cudaGraphMemcpyNodeGetParams

__host__ cudaError_t cudaGraphMemsetNodeGetParams ( cudaGraphNode_t node, cudaMemsetParams* pNodeParams )


Returns a memset node's parameters.

######  Parameters

`node`
    \- Node to get the parameters for
`pNodeParams`
    \- Pointer to return the parameters

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the parameters of memset node `node` in `pNodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaMemset2D, cudaGraphAddMemsetNode, cudaGraphMemsetNodeSetParams

__host__ cudaError_t cudaGraphMemsetNodeSetParams ( cudaGraphNode_t node, const cudaMemsetParams* pNodeParams )


Sets a memset node's parameters.

######  Parameters

`node`
    \- Node to set the parameters for
`pNodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets the parameters of memset node `node` to `pNodeParams`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetParams, cudaMemset2D, cudaGraphAddMemsetNode, cudaGraphMemsetNodeGetParams

__host__ cudaError_t cudaGraphNodeFindInClone ( cudaGraphNode_t* pNode, cudaGraphNode_t originalNode, cudaGraph_t clonedGraph )


Finds a cloned version of a node.

######  Parameters

`pNode`
    \- Returns handle to the cloned node
`originalNode`
    \- Handle to the original node
`clonedGraph`
    \- Cloned graph to query

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

This function returns the node in `clonedGraph` corresponding to `originalNode` in the original graph.

`clonedGraph` must have been cloned from `originalGraph` via cudaGraphClone. `originalNode` must have been in `originalGraph` at the time of the call to cudaGraphClone, and the corresponding cloned node in `clonedGraph` must not have been removed. The cloned node is then returned via `pClonedNode`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphClone

__host__ cudaError_t cudaGraphNodeGetContainingGraph ( cudaGraphNode_t hNode, cudaGraph_t* phGraph )


Returns the graph that contains a given graph node.

######  Parameters

`hNode`
    \- Node to query
`phGraph`
    \- Pointer to return the containing graph

###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Returns the graph that contains `hNode` in `*phGraph`. If hNode is in a child graph, the child graph it is in is returned.

**See also:**

cudaGraphGetNodes, cudaGraphDebugDotPrintcudaGraphNodeGetLocalIdcudaGraphNodeGetToolsIdcudaGraphGetIdcudaGraphExecGetId

__host__ cudaError_t cudaGraphNodeGetDependencies ( cudaGraphNode_t node, cudaGraphNode_t* pDependencies, cudaGraphEdgeData* edgeData, size_t* pNumDependencies )


Returns a node's dependencies.

######  Parameters

`node`
    \- Node to query
`pDependencies`
    \- Pointer to return the dependencies
`edgeData`
    \- Optional array to return edge data for each dependency
`pNumDependencies`
    \- See description

###### Returns

cudaSuccess, cudaErrorLossyQuery, cudaErrorInvalidValue

###### Description

Returns a list of `node's` dependencies. `pDependencies` may be NULL, in which case this function will return the number of dependencies in `pNumDependencies`. Otherwise, `pNumDependencies` entries will be filled in. If `pNumDependencies` is higher than the actual number of dependencies, the remaining entries in `pDependencies` will be set to NULL, and the number of nodes actually obtained will be returned in `pNumDependencies`.

Note that if an edge has non-zero (non-default) edge data and `edgeData` is NULL, this API will return cudaErrorLossyQuery. If `edgeData` is non-NULL, then `pDependencies` must be as well.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeGetDependentNodes, cudaGraphGetNodes, cudaGraphGetRootNodes, cudaGraphGetEdges, cudaGraphAddDependencies, cudaGraphRemoveDependencies

__host__ cudaError_t cudaGraphNodeGetDependentNodes ( cudaGraphNode_t node, cudaGraphNode_t* pDependentNodes, cudaGraphEdgeData* edgeData, size_t* pNumDependentNodes )


Returns a node's dependent nodes.

######  Parameters

`node`
    \- Node to query
`pDependentNodes`
    \- Pointer to return the dependent nodes
`edgeData`
    \- Optional pointer to return edge data for dependent nodes
`pNumDependentNodes`
    \- See description

###### Returns

cudaSuccess, cudaErrorLossyQuery, cudaErrorInvalidValue

###### Description

Returns a list of `node's` dependent nodes. `pDependentNodes` may be NULL, in which case this function will return the number of dependent nodes in `pNumDependentNodes`. Otherwise, `pNumDependentNodes` entries will be filled in. If `pNumDependentNodes` is higher than the actual number of dependent nodes, the remaining entries in `pDependentNodes` will be set to NULL, and the number of nodes actually obtained will be returned in `pNumDependentNodes`.

Note that if an edge has non-zero (non-default) edge data and `edgeData` is NULL, this API will return cudaErrorLossyQuery. If `edgeData` is non-NULL, then `pDependentNodes` must be as well.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeGetDependencies, cudaGraphGetNodes, cudaGraphGetRootNodes, cudaGraphGetEdges, cudaGraphAddDependencies, cudaGraphRemoveDependencies

__host__ cudaError_t cudaGraphNodeGetEnabled ( cudaGraphExec_t hGraphExec, cudaGraphNode_t hNode, unsigned int* isEnabled )


Query whether a node in the given graphExec is enabled.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Node from the graph from which graphExec was instantiated
`isEnabled`
    \- Location to return the enabled status of the node

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets isEnabled to 1 if `hNode` is enabled, or 0 if `hNode` is disabled.

The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

Currently only kernel, memset and memcpy nodes are supported.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeSetEnabled, cudaGraphExecUpdate, cudaGraphInstantiatecudaGraphLaunch

__host__ cudaError_t cudaGraphNodeGetLocalId ( cudaGraphNode_t hNode, unsigned int* nodeId )


Returns the node id of a given graph node.

######  Parameters

`hNode`
    \- Node to query
`nodeId`
    \- Pointer to return the nodeId

###### Returns

cudaSuccesscudaErrorInvalidValue

###### Description

Returns the node id of `hNode` in `*nodeId`. The nodeId matches that referenced by cudaGraphDebugDotPrint. The local nodeId and graphId together can uniquely identify the node.

**See also:**

cudaGraphGetNodes, cudaGraphDebugDotPrintcudaGraphNodeGetContainingGraphcudaGraphNodeGetToolsIdcudaGraphGetIdcudaGraphExecGetId

__host__ cudaError_t cudaGraphNodeGetToolsId ( cudaGraphNode_t hNode, unsigned long long* toolsNodeId )


Returns an id used by tools to identify a given node.

######  Parameters

`hNode`
    \- Node to query
`toolsNodeId`


###### Returns

CUDA_SUCCESScudaErrorInvalidValue

###### Description

**See also:**

cudaGraphGetNodes, cudaGraphDebugDotPrintcudaGraphNodeGetContainingGraphcudaGraphNodeGetLocalIdcudaGraphGetIdcudaGraphExecGetId

__host__ cudaError_t cudaGraphNodeGetType ( cudaGraphNode_t node, cudaGraphNodeType ** pType )


Returns a node's type.

######  Parameters

`node`
    \- Node to query
`pType`
    \- Pointer to return the node type

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Returns the node type of `node` in `pType`.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphGetNodes, cudaGraphGetRootNodes, cudaGraphChildGraphNodeGetGraph, cudaGraphKernelNodeGetParams, cudaGraphKernelNodeSetParams, cudaGraphHostNodeGetParams, cudaGraphHostNodeSetParams, cudaGraphMemcpyNodeGetParams, cudaGraphMemcpyNodeSetParams, cudaGraphMemsetNodeGetParams, cudaGraphMemsetNodeSetParams

__host__ cudaError_t cudaGraphNodeSetEnabled ( cudaGraphExec_t hGraphExec, cudaGraphNode_t hNode, unsigned int  isEnabled )


Enables or disables the specified node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Node from the graph from which graphExec was instantiated
`isEnabled`
    \- Node is enabled if != 0, otherwise the node is disabled

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Sets `hNode` to be either enabled or disabled. Disabled nodes are functionally equivalent to empty nodes until they are reenabled. Existing node parameters are not affected by disabling/enabling the node.

The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

Currently only kernel, memset and memcpy nodes are supported.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphNodeGetEnabled, cudaGraphExecUpdate, cudaGraphInstantiatecudaGraphLaunch

__host__ cudaError_t cudaGraphNodeSetParams ( cudaGraphNode_t node, cudaGraphNodeParams* nodeParams )


Update's a graph node's parameters.

######  Parameters

`node`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

cudaSuccess, cudaErrorInvalidValue, cudaErrorInvalidDeviceFunction, cudaErrorNotSupported

###### Description

Sets the parameters of graph node `node` to `nodeParams`. The node type specified by `nodeParams->type` must match the type of `node`. `nodeParams` must be fully initialized and all unused bytes (reserved, padding) zeroed.

Modifying parameters is not supported for node types cudaGraphNodeTypeMemAlloc and cudaGraphNodeTypeMemFree.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddNode, cudaGraphExecNodeSetParams

__host__ cudaError_t cudaGraphReleaseUserObject ( cudaGraph_t graph, cudaUserObject_t object, unsigned int  count = 1 )


Release a user object reference from a graph.

######  Parameters

`graph`
    \- The graph that will release the reference
`object`
    \- The user object to release a reference for
`count`
    \- The number of references to release, typically 1. Must be nonzero and not larger than INT_MAX.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Releases user object references owned by a graph.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

**See also:**

cudaUserObjectCreatecudaUserObjectRetain, cudaUserObjectRelease, cudaGraphRetainUserObject, cudaGraphCreate

__host__ cudaError_t cudaGraphRemoveDependencies ( cudaGraph_t graph, const cudaGraphNode_t* from, const cudaGraphNode_t* to, const cudaGraphEdgeData* edgeData, size_t numDependencies )


Removes dependency edges from a graph.

######  Parameters

`graph`
    \- Graph from which to remove dependencies
`from`
    \- Array of nodes that provide the dependencies
`to`
    \- Array of dependent nodes
`edgeData`
    \- Optional array of edge data. If NULL, edge data is assumed to be default (zeroed).
`numDependencies`
    \- Number of dependencies to be removed

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

The number of `pDependencies` to be removed is defined by `numDependencies`. Elements in `pFrom` and `pTo` at corresponding indices define a dependency. Each node in `pFrom` and `pTo` must belong to `graph`.

If `numDependencies` is 0, elements in `pFrom` and `pTo` will be ignored. Specifying an edge that does not exist in the graph, with data matching `edgeData`, results in an error. `edgeData` is nullable, which is equivalent to passing default (zeroed) data for each edge.

  * Graph objects are not threadsafe. More here.


**See also:**

cudaGraphAddDependencies, cudaGraphGetEdges, cudaGraphNodeGetDependencies, cudaGraphNodeGetDependentNodes

__host__ cudaError_t cudaGraphRetainUserObject ( cudaGraph_t graph, cudaUserObject_t object, unsigned int  count = 1, unsigned int  flags = 0 )


Retain a reference to a user object from a graph.

######  Parameters

`graph`
    \- The graph to associate the reference with
`object`
    \- The user object to retain a reference for
`count`
    \- The number of references to add to the graph, typically 1. Must be nonzero and not larger than INT_MAX.
`flags`
    \- The optional flag cudaGraphUserObjectMove transfers references from the calling thread, rather than create new references. Pass 0 to create new references.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Creates or moves user object references that will be owned by a CUDA graph.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

**See also:**

cudaUserObjectCreatecudaUserObjectRetain, cudaUserObjectRelease, cudaGraphReleaseUserObject, cudaGraphCreate

__device__  void cudaGraphSetConditional ( cudaGraphConditionalHandle handle, unsigned int  value )


Sets the condition value associated with a conditional node.

###### Description

Sets the condition value associated with a conditional node.

Note: `handle` must be associated with the same context as the kernel calling this function. Note: It is undefined behavior to have racing / possibly concurrent calls to cudaGraphSetConditional.

**See also:**

cudaGraphConditionalHandleCreate

__host__ cudaError_t cudaGraphUpload ( cudaGraphExec_t graphExec, cudaStream_t stream )


Uploads an executable graph in a stream.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Uploads `hGraphExec` to the device in `hStream` without executing it. Uploads of the same `hGraphExec` will be serialized. Each upload is ordered behind both any previous work in `hStream` and any previous launches of `hGraphExec`. Uses memory cached by `stream` to back the allocations owned by `graphExec`.


**See also:**

cudaGraphInstantiate, cudaGraphLaunch, cudaGraphExecDestroy

__host__ cudaError_t cudaUserObjectCreate ( cudaUserObject_t* object_out, void* ptr, cudaHostFn_t destroy, unsigned int  initialRefcount, unsigned int  flags )


Create a user object.

######  Parameters

`object_out`
    \- Location to return the user object handle
`ptr`
    \- The pointer to pass to the destroy function
`destroy`
    \- Callback to free the user object when it is no longer in use
`initialRefcount`
    \- The initial refcount to create the object with, typically 1. The initial references are owned by the calling thread.
`flags`
    \- Currently it is required to pass cudaUserObjectNoDestructorSync, which is the only defined flag. This indicates that the destroy callback cannot be waited on by any CUDA API. Users requiring synchronization of the callback should signal its completion manually.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Create a user object with the specified destructor callback and initial reference count. The initial references are owned by the caller.

Destructor callbacks cannot make CUDA API calls and should avoid blocking behavior, as they are executed by a shared internal thread. Another thread may be signaled to perform such actions, if it does not block forward progress of tasks scheduled through CUDA.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

**See also:**

cudaUserObjectRetain, cudaUserObjectRelease, cudaGraphRetainUserObject, cudaGraphReleaseUserObject, cudaGraphCreate

__host__ cudaError_t cudaUserObjectRelease ( cudaUserObject_t object, unsigned int  count = 1 )


Release a reference to a user object.

######  Parameters

`object`
    \- The object to release
`count`
    \- The number of references to release, typically 1. Must be nonzero and not larger than INT_MAX.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Releases user object references owned by the caller. The object's destructor is invoked if the reference count reaches zero.

It is undefined behavior to release references not owned by the caller, or to use a user object handle after all references are released.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

**See also:**

cudaUserObjectCreate, cudaUserObjectRetain, cudaGraphRetainUserObject, cudaGraphReleaseUserObject, cudaGraphCreate

__host__ cudaError_t cudaUserObjectRetain ( cudaUserObject_t object, unsigned int  count = 1 )


Retain a reference to a user object.

######  Parameters

`object`
    \- The object to retain
`count`
    \- The number of references to retain, typically 1. Must be nonzero and not larger than INT_MAX.

###### Returns

cudaSuccess, cudaErrorInvalidValue

###### Description

Retains new references to a user object. The new references are owned by the caller.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

**See also:**

cudaUserObjectCreate, cudaUserObjectRelease, cudaGraphRetainUserObject, cudaGraphReleaseUserObject, cudaGraphCreate

* * *

!


Copyright © 2025 NVIDIA Corporation