---
name: driver-graph
description: '**Source:** group__CUDA__GRAPH.html#group__CUDA__GRAPH'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.24. Graph Management

**Source:** group__CUDA__GRAPH.html#group__CUDA__GRAPH


### Functions

CUresult cuDeviceGetGraphMemAttribute ( CUdevice device, CUgraphMem_attribute attr, void* value )


Query asynchronous allocation attributes related to graphs.

######  Parameters

`device`
    \- Specifies the scope of the query
`attr`
    \- attribute to get
`value`
    \- retrieved value

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_DEVICE

###### Description

Valid attributes are:

  * CU_GRAPH_MEM_ATTR_USED_MEM_CURRENT: Amount of memory, in bytes, currently associated with graphs

  * CU_GRAPH_MEM_ATTR_USED_MEM_HIGH: High watermark of memory, in bytes, associated with graphs since the last time it was reset. High watermark can only be reset to zero.

  * CU_GRAPH_MEM_ATTR_RESERVED_MEM_CURRENT: Amount of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.

  * CU_GRAPH_MEM_ATTR_RESERVED_MEM_HIGH: High watermark of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.


CUresult cuDeviceGraphMemTrim ( CUdevice device )


Free unused memory that was cached on the specified device for use with graphs back to the OS.

######  Parameters

`device`
    \- The device for which cached memory should be freed.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_DEVICE

###### Description

Blocks which are not in use by a graph that is either currently executing or scheduled to execute are freed back to the operating system.

CUresult cuDeviceSetGraphMemAttribute ( CUdevice device, CUgraphMem_attribute attr, void* value )


Set asynchronous allocation attributes related to graphs.

######  Parameters

`device`
    \- Specifies the scope of the query
`attr`
    \- attribute to get
`value`
    \- pointer to value to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_DEVICE

###### Description

Valid attributes are:

  * CU_GRAPH_MEM_ATTR_USED_MEM_HIGH: High watermark of memory, in bytes, associated with graphs since the last time it was reset. High watermark can only be reset to zero.

  * CU_GRAPH_MEM_ATTR_RESERVED_MEM_HIGH: High watermark of memory, in bytes, currently allocated for use by the CUDA graphs asynchronous allocator.


CUresult cuGraphAddBatchMemOpNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_BATCH_MEM_OP_NODE_PARAMS* nodeParams )


Creates a batch memory operation node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new batch memory operation node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

When the node is added, the paramArray inside `nodeParams` is copied and therefore it can be freed after the call returns.

Warning: Improper use of this API may deadlock the application. Synchronization ordering established through this API is not visible to CUDA. CUDA tasks that are (even indirectly) ordered by this API should also have that order expressed with CUDA-visible dependencies such as events. This ensures that the scheduler does not serialize them in an improper order.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddChildGraphNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, CUgraph childGraph )


Creates a child graph node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`childGraph`
    \- The graph to clone into this node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new node which executes an embedded graph, and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

If `childGraph` contains allocation nodes, free nodes, or conditional nodes, this call will return an error.

The node executes an embedded child graph. The child graph is cloned in this call.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddDependencies ( CUgraph hGraph, const CUgraphNode* from, const CUgraphNode* to, const CUgraphEdgeData* edgeData, size_t numDependencies )


Adds dependency edges to a graph.

######  Parameters

`hGraph`
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

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

The number of dependencies to be added is defined by `numDependencies` Elements in `from` and `to` at corresponding indices define a dependency. Each node in `from` and `to` must belong to `hGraph`.

If `numDependencies` is 0, elements in `from` and `to` will be ignored. Specifying an existing dependency will return an error.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddEmptyNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies )


Creates an empty node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new node which performs no operation, and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

An empty node performs no operation during execution, but can be used for transitive ordering. For example, a phased execution graph with 2 groups of n nodes with a barrier between them can be represented using an empty node and 2*n dependency edges, rather than no empty node and n^2 dependency edges.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddEventRecordNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, CUevent event )


Creates an event record node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`event`
    \- Event for the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new event record node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and event specified in `event`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

Each launch of the graph will record `event` to capture execution of the node's dependencies.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddEventWaitNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, CUevent event )


Creates an event wait node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`event`
    \- Event for the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new event wait node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and event specified in `event`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

The graph node will wait for all work captured in `event`. See cuEventRecord() for details on what is captured by an event. `event` may be from a different context or device than the launch stream.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddExternalSemaphoresSignalNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_EXT_SEM_SIGNAL_NODE_PARAMS* nodeParams )


Creates an external semaphore signal node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new external semaphore signal node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

Performs a signal operation on a set of externally allocated semaphore objects when the node is launched. The operation(s) will occur after all of the node's dependencies have completed.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddExternalSemaphoresWaitNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_EXT_SEM_WAIT_NODE_PARAMS* nodeParams )


Creates an external semaphore wait node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new external semaphore wait node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

Performs a wait operation on a set of externally allocated semaphore objects when the node is launched. The node's dependencies will not be launched until the wait operation has completed.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddHostNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_HOST_NODE_PARAMS* nodeParams )


Creates a host execution node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the host node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new CPU execution node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

When the graph is launched, the node will invoke the specified CPU function. Host nodes are not supported under MPS with pre-Volta GPUs.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddKernelNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_KERNEL_NODE_PARAMS* nodeParams )


Creates a kernel execution node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the GPU execution node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new kernel execution node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

The CUDA_KERNEL_NODE_PARAMS structure is defined as:


    ‎  typedef struct CUDA_KERNEL_NODE_PARAMS_st {
                CUfunction func;
                unsigned int gridDimX;
                unsigned int gridDimY;
                unsigned int gridDimZ;
                unsigned int blockDimX;
                unsigned int blockDimY;
                unsigned int blockDimZ;
                unsigned int sharedMemBytes;
                void **kernelParams;
                void **extra;
                CUkernel kern;
                CUcontext ctx;
            } CUDA_KERNEL_NODE_PARAMS;

When the graph is launched, the node will invoke kernel `func` on a (`gridDimX` x `gridDimY` x `gridDimZ`) grid of blocks. Each block contains (`blockDimX` x `blockDimY` x `blockDimZ`) threads.

`sharedMemBytes` sets the amount of dynamic shared memory that will be available to each thread block.

Kernel parameters to `func` can be specified in one of two ways:

1) Kernel parameters can be specified via `kernelParams`. If the kernel has N parameters, then `kernelParams` needs to be an array of N pointers. Each pointer, from `kernelParams`[0] to `kernelParams`[N-1], points to the region of memory from which the actual parameter will be copied. The number of kernel parameters and their offsets and sizes do not need to be specified as that information is retrieved directly from the kernel's image.

2) Kernel parameters for non-cooperative kernels can also be packaged by the application into a single buffer that is passed in via `extra`. This places the burden on the application of knowing each kernel parameter's size and alignment/padding within the buffer. The `extra` parameter exists to allow this function to take additional less commonly used arguments. `extra` specifies a list of names of extra settings and their corresponding values. Each extra setting name is immediately followed by the corresponding value. The list must be terminated with either NULL or CU_LAUNCH_PARAM_END.

  * CU_LAUNCH_PARAM_END, which indicates the end of the `extra` array;

  * CU_LAUNCH_PARAM_BUFFER_POINTER, which specifies that the next value in `extra` will be a pointer to a buffer containing all the kernel parameters for launching kernel `func`;

  * CU_LAUNCH_PARAM_BUFFER_SIZE, which specifies that the next value in `extra` will be a pointer to a size_t containing the size of the buffer specified with CU_LAUNCH_PARAM_BUFFER_POINTER;


The error CUDA_ERROR_INVALID_VALUE will be returned if kernel parameters are specified with both `kernelParams` and `extra` (i.e. both `kernelParams` and `extra` are non-NULL). CUDA_ERROR_INVALID_VALUE will be returned if `extra` is used for a cooperative kernel.

The `kernelParams` or `extra` array, as well as the argument values it points to, are copied during this call.

Kernels launched using graphs must not use texture and surface references. Reading or writing through any texture or surface reference is undefined behavior. This restriction does not apply to texture and surface objects.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddMemAllocNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, CUDA_MEM_ALLOC_NODE_PARAMS* nodeParams )


Creates an allocation node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Parameters for the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new allocation node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

When cuGraphAddMemAllocNode creates an allocation node, it returns the address of the allocation in `nodeParams.dptr`. The allocation's address remains fixed across instantiations and launches.

If the allocation is freed in the same graph, by creating a free node using cuGraphAddMemFreeNode, the allocation can be accessed by nodes ordered after the allocation node but before the free node. These allocations cannot be freed outside the owning graph, and they can only be freed once in the owning graph.

If the allocation is not freed in the same graph, then it can be accessed not only by nodes in the graph which are ordered after the allocation node, but also by stream operations ordered after the graph's execution but before the allocation is freed.

Allocations which are not freed in the same graph can be freed by:

  * passing the allocation to cuMemFreeAsync or cuMemFree;

  * launching a graph with a free node for that allocation; or

  * specifying CUDA_GRAPH_INSTANTIATE_FLAG_AUTO_FREE_ON_LAUNCH during instantiation, which makes each launch behave as though it called cuMemFreeAsync for every unfreed allocation.


It is not possible to free an allocation in both the owning graph and another graph. If the allocation is freed in the same graph, a free node cannot be added to another graph. If the allocation is freed in another graph, a free node can no longer be added to the owning graph.

The following restrictions apply to graphs which contain allocation and/or memory free nodes:

  * Nodes and edges of the graph cannot be deleted.

  * The graph can only be used in a child node if the ownership is moved to the parent.

  * Only one instantiation of the graph may exist at any point in time.

  * The graph cannot be cloned.


  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddMemFreeNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, CUdeviceptr dptr )


Creates a memory free node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`dptr`
    \- Address of memory to free

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_NOT_SUPPORTED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new memory free node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies` and arguments specified in `nodeParams`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

cuGraphAddMemFreeNode will return CUDA_ERROR_INVALID_VALUE if the user attempts to free:

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
CUresult cuGraphAddMemcpyNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_MEMCPY3D* copyParams, CUcontext ctx )


Creates a memcpy node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`copyParams`
    \- Parameters for the memory copy
`ctx`
    \- Context on which to run the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Creates a new memcpy node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

When the graph is launched, the node will perform the memcpy described by `copyParams`. See cuMemcpy3D() for a description of the structure and its restrictions.

Memcpy nodes have some additional restrictions with regards to managed memory, if the system contains at least one device which has a zero value for the device attribute CU_DEVICE_ATTRIBUTE_CONCURRENT_MANAGED_ACCESS. If one or more of the operands refer to managed memory, then using the memory type CU_MEMORYTYPE_UNIFIED is disallowed for those operand(s). The managed memory will be treated as residing on either the host or the device, depending on which memory type is specified.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddMemsetNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, size_t numDependencies, const CUDA_MEMSET_NODE_PARAMS* memsetParams, CUcontext ctx )


Creates a memset node and adds it to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`numDependencies`
    \- Number of dependencies
`memsetParams`
    \- Parameters for the memory set
`ctx`
    \- Context on which to run the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_CONTEXT

###### Description

Creates a new memset node and adds it to `hGraph` with `numDependencies` dependencies specified via `dependencies`. It is possible for `numDependencies` to be 0, in which case the node will be placed at the root of the graph. `dependencies` may not have any duplicate entries. A handle to the new node will be returned in `phGraphNode`.

The element size must be 1, 2, or 4 bytes. When the graph is launched, the node will perform the memset described by `memsetParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphAddNode ( CUgraphNode* phGraphNode, CUgraph hGraph, const CUgraphNode* dependencies, const CUgraphEdgeData* dependencyData, size_t numDependencies, CUgraphNodeParams* nodeParams )


Adds a node of arbitrary type to a graph.

######  Parameters

`phGraphNode`
    \- Returns newly created node
`hGraph`
    \- Graph to which to add the node
`dependencies`
    \- Dependencies of the node
`dependencyData`
    \- Optional edge data for the dependencies. If NULL, the data is assumed to be default (zeroed) for all dependencies.
`numDependencies`
    \- Number of dependencies
`nodeParams`
    \- Specification of the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_CONTEXT, CUDA_ERROR_NOT_SUPPORTED

###### Description

Creates a new node in `hGraph` described by `nodeParams` with `numDependencies` dependencies specified via `dependencies`. `numDependencies` may be 0. `dependencies` may be null if `numDependencies` is 0. `dependencies` may not have any duplicate entries.

`nodeParams` is a tagged union. The node type should be specified in the `type` field, and type-specific parameters in the corresponding union member. All unused bytes - that is, `reserved0` and all bytes past the utilized union member - must be set to zero. It is recommended to use brace initialization or memset to ensure all bytes are initialized.

Note that for some node types, `nodeParams` may contain "out parameters" which are modified during the call, such as `nodeParams->alloc.dptr`.

A handle to the new node will be returned in `phGraphNode`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphBatchMemOpNodeGetParams ( CUgraphNode hNode, CUDA_BATCH_MEM_OP_NODE_PARAMS* nodeParams_out )


Returns a batch mem op node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`nodeParams_out`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of batch mem op node `hNode` in `nodeParams_out`. The `paramArray` returned in `nodeParams_out` is owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cuGraphBatchMemOpNodeSetParams to update the parameters of this node.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphBatchMemOpNodeSetParams ( CUgraphNode hNode, const CUDA_BATCH_MEM_OP_NODE_PARAMS* nodeParams )


Sets a batch mem op node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Sets the parameters of batch mem op node `hNode` to `nodeParams`.

The paramArray inside `nodeParams` is copied and therefore it can be freed after the call returns.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphChildGraphNodeGetGraph ( CUgraphNode hNode, CUgraph* phGraph )


Gets a handle to the embedded graph of a child graph node.

######  Parameters

`hNode`
    \- Node to get the embedded graph for
`phGraph`
    \- Location to store a handle to the graph

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Gets a handle to the embedded graph in a child graph node. This call does not clone the graph. Changes to the graph will be reflected in the node, and the node retains ownership of the graph.

Allocation and free nodes cannot be added to the returned graph. Attempting to do so will return an error.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphClone ( CUgraph* phGraphClone, CUgraph originalGraph )


Clones a graph.

######  Parameters

`phGraphClone`
    \- Returns newly created cloned graph
`originalGraph`
    \- Graph to clone

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

This function creates a copy of `originalGraph` and returns it in `phGraphClone`. All parameters are copied into the cloned graph. The original graph may be modified after this call without affecting the clone.

Child graph nodes in the original graph are recursively copied into the clone.

: Cloning is not supported for graphs which contain memory allocation nodes, memory free nodes, or conditional nodes.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphConditionalHandleCreate ( CUgraphConditionalHandle* pHandle_out, CUgraph hGraph, CUcontext ctx, unsigned int  defaultLaunchValue, unsigned int  flags )


Create a conditional handle.

######  Parameters

`pHandle_out`
    \- Pointer used to return the handle to the caller.
`hGraph`
    \- Graph which will contain the conditional node using this handle.
`ctx`
    \- Context for the handle and associated conditional node.
`defaultLaunchValue`
    \- Optional initial value for the conditional variable. Applied at the beginning of each graph execution if CU_GRAPH_COND_ASSIGN_DEFAULT is set in `flags`.
`flags`
    \- Currently must be CU_GRAPH_COND_ASSIGN_DEFAULT or 0.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Creates a conditional handle associated with `hGraph`.

The conditional handle must be associated with a conditional node in this graph or one of its children.

Handles not associated with a conditional node may cause graph instantiation to fail.

Handles can only be set from the context with which they are associated.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphCreate ( CUgraph* phGraph, unsigned int  flags )


Creates a graph.

######  Parameters

`phGraph`
    \- Returns newly created graph
`flags`
    \- Graph creation flags, must be 0

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Creates an empty graph, which is returned via `phGraph`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphDebugDotPrint ( CUgraph hGraph, const char* path, unsigned int  flags )


Write a DOT file describing graph structure.

######  Parameters

`hGraph`
    \- The graph to create a DOT file from
`path`
    \- The path to write the DOT file to
`flags`
    \- Flags from CUgraphDebugDot_flags for specifying which additional node information to write

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_OPERATING_SYSTEM

###### Description

Using the provided `hGraph`, write to `path` a DOT formatted description of the graph. By default this includes the graph topology, node types, node id, kernel names and memcpy direction. `flags` can be specified to write more detailed information about each node type such as parameter values, kernel attributes, node and function handles.

CUresult cuGraphDestroy ( CUgraph hGraph )


Destroys a graph.

######  Parameters

`hGraph`
    \- Graph to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Destroys the graph specified by `hGraph`, as well as all of its nodes.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphDestroyNode ( CUgraphNode hNode )


Remove a node from the graph.

######  Parameters

`hNode`
    \- Node to remove

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Removes `hNode` from its graph. This operation also severs any dependencies of other nodes on `hNode` and vice versa.

Nodes which belong to a graph which contains allocation or free nodes cannot be destroyed. Any attempt to do so will return an error.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphEventRecordNodeGetEvent ( CUgraphNode hNode, CUevent* event_out )


Returns the event associated with an event record node.

######  Parameters

`hNode`
    \- Node to get the event for
`event_out`
    \- Pointer to return the event

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the event of event record node `hNode` in `event_out`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphEventRecordNodeSetEvent ( CUgraphNode hNode, CUevent event )


Sets an event record node's event.

######  Parameters

`hNode`
    \- Node to set the event for
`event`
    \- Event to use

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Sets the event of event record node `hNode` to `event`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphEventWaitNodeGetEvent ( CUgraphNode hNode, CUevent* event_out )


Returns the event associated with an event wait node.

######  Parameters

`hNode`
    \- Node to get the event for
`event_out`
    \- Pointer to return the event

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the event of event wait node `hNode` in `event_out`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphEventWaitNodeSetEvent ( CUgraphNode hNode, CUevent event )


Sets an event wait node's event.

######  Parameters

`hNode`
    \- Node to set the event for
`event`
    \- Event to use

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Sets the event of event wait node `hNode` to `event`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecBatchMemOpNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_BATCH_MEM_OP_NODE_PARAMS* nodeParams )


Sets the parameters for a batch mem op node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Batch mem op node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of a batch mem op node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

The following fields on operations may be modified on an executable graph:

op.waitValue.address op.waitValue.value[64] op.waitValue.flags bits corresponding to wait type (i.e. CU_STREAM_WAIT_VALUE_FLUSH bit cannot be modified) op.writeValue.address op.writeValue.value[64]

Other fields, such as the context, count or type of operations, and other types of operations such as membars, may not be modified.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

The paramArray inside `nodeParams` is copied and therefore it can be freed after the call returns.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecChildGraphNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, CUgraph childGraph )


Updates node parameters in the child graph node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Host node from the graph which was used to instantiate graphExec
`childGraph`
    \- The graph supplying the updated parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Updates the work represented by `hNode` in `hGraphExec` as though the nodes contained in `hNode's` graph had the parameters contained in `childGraph's` nodes at instantiation. `hNode` must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from `hNode` are ignored.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

The topology of `childGraph`, as well as the node insertion order, must match that of the graph contained in `hNode`. See cuGraphExecUpdate() for a list of restrictions on what can be updated in an instantiated graph. The update is recursive, so child graph nodes contained within the top level child graph will also be updated.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecDestroy ( CUgraphExec hGraphExec )


Destroys an executable graph.

######  Parameters

`hGraphExec`
    \- Executable graph to destroy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Destroys the executable graph specified by `hGraphExec`, as well as all of its executable nodes. If the executable graph is in-flight, it will not be terminated, but rather freed asynchronously on completion.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecEventRecordNodeSetEvent ( CUgraphExec hGraphExec, CUgraphNode hNode, CUevent event )


Sets the event for an event record node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- event record node from the graph from which graphExec was instantiated
`event`
    \- Updated event to use

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the event of an event record node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecEventWaitNodeSetEvent ( CUgraphExec hGraphExec, CUgraphNode hNode, CUevent event )


Sets the event for an event wait node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- event wait node from the graph from which graphExec was instantiated
`event`
    \- Updated event to use

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the event of an event wait node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecExternalSemaphoresSignalNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_EXT_SEM_SIGNAL_NODE_PARAMS* nodeParams )


Sets the parameters for an external semaphore signal node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- semaphore signal node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of an external semaphore signal node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

Changing `nodeParams->numExtSems` is not supported.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecExternalSemaphoresWaitNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_EXT_SEM_WAIT_NODE_PARAMS* nodeParams )


Sets the parameters for an external semaphore wait node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- semaphore wait node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of an external semaphore wait node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

Changing `nodeParams->numExtSems` is not supported.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecGetFlags ( CUgraphExec hGraphExec, cuuint64_t* flags )


Query the instantiation flags of an executable graph.

######  Parameters

`hGraphExec`
    \- The executable graph to query
`flags`
    \- Returns the instantiation flags

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the flags that were passed to instantiation for the given executable graph. CUDA_GRAPH_INSTANTIATE_FLAG_UPLOAD will not be returned by this API as it does not affect the resulting executable graph.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecGetId ( CUgraphExec hGraphExec, unsigned int* graphId )


Returns the id of a given graph exec.

######  Parameters

`hGraphExec`
    \- Graph to query
`graphId`


###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the id of `hGraphExec` in `*graphId`. The value in `*graphId` will match that referenced by cuGraphDebugDotPrint.

CUresult cuGraphExecHostNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_HOST_NODE_PARAMS* nodeParams )


Sets the parameters for a host node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Host node from the graph which was used to instantiate graphExec
`nodeParams`
    \- The updated parameters to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Updates the work represented by `hNode` in `hGraphExec` as though `hNode` had contained `nodeParams` at instantiation. hNode must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from hNode are ignored.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. hNode is also not modified by this call.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecKernelNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_KERNEL_NODE_PARAMS* nodeParams )


Sets the parameters for a kernel node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- kernel node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of a kernel node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph. All `nodeParams` fields may change, but the following restrictions apply to `func` updates:

  * The owning context of the function cannot change.

  * A node whose function originally did not use CUDA dynamic parallelism cannot be updated to a function which uses CDP

  * A node whose function originally did not make device-side update calls cannot be updated to a function which makes device-side update calls.

  * If `hGraphExec` was not instantiated for device launch, a node whose function originally did not use device-side cudaGraphLaunch() cannot be updated to a function which uses device-side cudaGraphLaunch() unless the node resides on the same context as nodes which contained such calls at instantiate-time. If no such calls were present at instantiation, these updates cannot be performed at all.


The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

If `hNode` is a device-updatable kernel node, the next upload/launch of `hGraphExec` will overwrite any previous device-side updates. Additionally, applying host updates to a device-updatable kernel node while it is being updated from the device will result in undefined behavior.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecMemcpyNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_MEMCPY3D* copyParams, CUcontext ctx )


Sets the parameters for a memcpy node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Memcpy node from the graph which was used to instantiate graphExec
`copyParams`
    \- The updated parameters to set
`ctx`
    \- Context on which to run the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Updates the work represented by `hNode` in `hGraphExec` as though `hNode` had contained `copyParams` at instantiation. hNode must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from hNode are ignored.

The source and destination memory in `copyParams` must be allocated from the same contexts as the original source and destination memory. Both the instantiation-time memory operands and the memory operands in `copyParams` must be 1-dimensional. Zero-length operations are not supported.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. hNode is also not modified by this call.

Returns CUDA_ERROR_INVALID_VALUE if the memory operands' mappings changed or either the original or new memory operands are multidimensional.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecMemsetNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, const CUDA_MEMSET_NODE_PARAMS* memsetParams, CUcontext ctx )


Sets the parameters for a memset node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Memset node from the graph which was used to instantiate graphExec
`memsetParams`
    \- The updated parameters to set
`ctx`
    \- Context on which to run the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Updates the work represented by `hNode` in `hGraphExec` as though `hNode` had contained `memsetParams` at instantiation. hNode must remain in the graph which was used to instantiate `hGraphExec`. Changed edges to and from hNode are ignored.

Zero sized operations are not supported.

The new destination pointer in memsetParams must be to the same kind of allocation as the original destination pointer and have the same context association and device mapping as the original destination pointer.

Both the value and pointer address may be updated. Changing other aspects of the memset (width, height, element size or pitch) may cause the update to be rejected. Specifically, for 2d memsets, all dimension changes are rejected. For 1d memsets, changes in height are explicitly rejected and other changes are opportunistically allowed if the resulting work maps onto the work resources already allocated for the node.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. hNode is also not modified by this call.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecNodeSetParams ( CUgraphExec hGraphExec, CUgraphNode hNode, CUgraphNodeParams* nodeParams )


Update's a graph node's parameters in an instantiated graph.

######  Parameters

`hGraphExec`
    \- The executable graph in which to update the specified node
`hNode`
    \- Corresponding node from the graph from which graphExec was instantiated
`nodeParams`
    \- Updated Parameters to set

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Sets the parameters of a node in an executable graph `hGraphExec`. The node is identified by the corresponding node `hNode` in the non-executable graph from which the executable graph was instantiated. `hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

Allowed changes to parameters on executable graphs are as follows:

Node type |  Allowed changes
---|---
kernel |  See cuGraphExecKernelNodeSetParams
memcpy |  Addresses for 1-dimensional copies if allocated in same context; see cuGraphExecMemcpyNodeSetParams
memset |  Addresses for 1-dimensional memsets if allocated in same context; see cuGraphExecMemsetNodeSetParams
host |  Unrestricted
child graph |  Topology must match and restrictions apply recursively; see cuGraphExecUpdate
event wait |  Unrestricted
event record |  Unrestricted
external semaphore signal |  Number of semaphore operations cannot change
external semaphore wait |  Number of semaphore operations cannot change
memory allocation |  API unsupported
memory free |  API unsupported
batch memops |  Addresses, values, and operation type for wait operations; see cuGraphExecBatchMemOpNodeSetParams

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExecUpdate ( CUgraphExec hGraphExec, CUgraph hGraph, CUgraphExecUpdateResultInfo* resultInfo )


Check whether an executable graph can be updated with a graph and perform the update if possible.

######  Parameters

`hGraphExec`
    The instantiated graph to be updated
`hGraph`
    The graph containing the updated parameters
`resultInfo`
    the error info structure

###### Returns

CUDA_SUCCESS, CUDA_ERROR_GRAPH_EXEC_UPDATE_FAILURE

###### Description

Updates the node parameters in the instantiated graph specified by `hGraphExec` with the node parameters in a topologically identical graph specified by `hGraph`.

Limitations:

  * Kernel nodes:
    * The owning context of the function cannot change.

    * A node whose function originally did not use CUDA dynamic parallelism cannot be updated to a function which uses CDP.

    * A node whose function originally did not make device-side update calls cannot be updated to a function which makes device-side update calls.

    * A cooperative node cannot be updated to a non-cooperative node, and vice-versa.

    * If the graph was instantiated with CUDA_GRAPH_INSTANTIATE_FLAG_USE_NODE_PRIORITY, the priority attribute cannot change. Equality is checked on the originally requested priority values, before they are clamped to the device's supported range.

    * If `hGraphExec` was not instantiated for device launch, a node whose function originally did not use device-side cudaGraphLaunch() cannot be updated to a function which uses device-side cudaGraphLaunch() unless the node resides on the same context as nodes which contained such calls at instantiate-time. If no such calls were present at instantiation, these updates cannot be performed at all.

    * Neither `hGraph` nor `hGraphExec` may contain device-updatable kernel nodes.

  * Memset and memcpy nodes:
    * The CUDA device(s) to which the operand(s) was allocated/mapped cannot change.

    * The source/destination memory must be allocated from the same contexts as the original source/destination memory.

    * For 2d memsets, only address and assigned value may be updated.

    * For 1d memsets, updating dimensions is also allowed, but may fail if the resulting operation doesn't map onto the work resources already allocated for the node.

  * Additional memcpy node restrictions:
    * Changing either the source or destination memory type(i.e. CU_MEMORYTYPE_DEVICE, CU_MEMORYTYPE_ARRAY, etc.) is not supported.

  * External semaphore wait nodes and record nodes:
    * Changing the number of semaphores is not supported.

  * Conditional nodes:
    * Changing node parameters is not supported.

    * Changing parameters of nodes within the conditional body graph is subject to the rules above.

    * Conditional handle flags and default values are updated as part of the graph update.


Note: The API may add further restrictions in future releases. The return code should always be checked.

cuGraphExecUpdate sets the result member of `resultInfo` to CU_GRAPH_EXEC_UPDATE_ERROR_TOPOLOGY_CHANGED under the following conditions:

  * The count of nodes directly in `hGraphExec` and `hGraph` differ, in which case resultInfo->errorNode is set to NULL.

  * `hGraph` has more exit nodes than `hGraph`, in which case resultInfo->errorNode is set to one of the exit nodes in hGraph.

  * A node in `hGraph` has a different number of dependencies than the node from `hGraphExec` it is paired with, in which case resultInfo->errorNode is set to the node from `hGraph`.

  * A node in `hGraph` has a dependency that does not match with the corresponding dependency of the paired node from `hGraphExec`. resultInfo->errorNode will be set to the node from `hGraph`. resultInfo->errorFromNode will be set to the mismatched dependency. The dependencies are paired based on edge order and a dependency does not match when the nodes are already paired based on other edges examined in the graph.


cuGraphExecUpdate sets the result member of `resultInfo` to:

  * CU_GRAPH_EXEC_UPDATE_ERROR if passed an invalid value.

  * CU_GRAPH_EXEC_UPDATE_ERROR_TOPOLOGY_CHANGED if the graph topology changed

  * CU_GRAPH_EXEC_UPDATE_ERROR_NODE_TYPE_CHANGED if the type of a node changed, in which case `hErrorNode_out` is set to the node from `hGraph`.

  * CU_GRAPH_EXEC_UPDATE_ERROR_UNSUPPORTED_FUNCTION_CHANGE if the function changed in an unsupported way(see note above), in which case `hErrorNode_out` is set to the node from `hGraph`

  * CU_GRAPH_EXEC_UPDATE_ERROR_PARAMETERS_CHANGED if any parameters to a node changed in a way that is not supported, in which case `hErrorNode_out` is set to the node from `hGraph`.

  * CU_GRAPH_EXEC_UPDATE_ERROR_ATTRIBUTES_CHANGED if any attributes of a node changed in a way that is not supported, in which case `hErrorNode_out` is set to the node from `hGraph`.

  * CU_GRAPH_EXEC_UPDATE_ERROR_NOT_SUPPORTED if something about a node is unsupported, like the node's type or configuration, in which case `hErrorNode_out` is set to the node from `hGraph`


If the update fails for a reason not listed above, the result member of `resultInfo` will be set to CU_GRAPH_EXEC_UPDATE_ERROR. If the update succeeds, the result member will be set to CU_GRAPH_EXEC_UPDATE_SUCCESS.

cuGraphExecUpdate returns CUDA_SUCCESS when the updated was performed successfully. It returns CUDA_ERROR_GRAPH_EXEC_UPDATE_FAILURE if the graph update was not performed because it included changes which violated constraints specific to instantiated graph update.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExternalSemaphoresSignalNodeGetParams ( CUgraphNode hNode, CUDA_EXT_SEM_SIGNAL_NODE_PARAMS* params_out )


Returns an external semaphore signal node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`params_out`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of an external semaphore signal node `hNode` in `params_out`. The `extSemArray` and `paramsArray` returned in `params_out`, are owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cuGraphExternalSemaphoresSignalNodeSetParams to update the parameters of this node.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExternalSemaphoresSignalNodeSetParams ( CUgraphNode hNode, const CUDA_EXT_SEM_SIGNAL_NODE_PARAMS* nodeParams )


Sets an external semaphore signal node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Sets the parameters of an external semaphore signal node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExternalSemaphoresWaitNodeGetParams ( CUgraphNode hNode, CUDA_EXT_SEM_WAIT_NODE_PARAMS* params_out )


Returns an external semaphore wait node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`params_out`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of an external semaphore wait node `hNode` in `params_out`. The `extSemArray` and `paramsArray` returned in `params_out`, are owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cuGraphExternalSemaphoresSignalNodeSetParams to update the parameters of this node.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphExternalSemaphoresWaitNodeSetParams ( CUgraphNode hNode, const CUDA_EXT_SEM_WAIT_NODE_PARAMS* nodeParams )


Sets an external semaphore wait node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Sets the parameters of an external semaphore wait node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphGetEdges ( CUgraph hGraph, CUgraphNode* from, CUgraphNode* to, CUgraphEdgeData* edgeData, size_t* numEdges )


Returns a graph's dependency edges.

######  Parameters

`hGraph`
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

CUDA_SUCCESS, CUDA_ERROR_LOSSY_QUERY, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns a list of `hGraph's` dependency edges. Edges are returned via corresponding indices in `from`, `to` and `edgeData`; that is, the node in `to`[i] has a dependency on the node in `from`[i] with data `edgeData`[i]. `from` and `to` may both be NULL, in which case this function only returns the number of edges in `numEdges`. Otherwise, `numEdges` entries will be filled in. If `numEdges` is higher than the actual number of edges, the remaining entries in `from` and `to` will be set to NULL, and the number of edges actually returned will be written to `numEdges`. `edgeData` may alone be NULL, in which case the edges must all have default (zeroed) edge data. Attempting a lossy query via NULL `edgeData` will result in CUDA_ERROR_LOSSY_QUERY. If `edgeData` is non-NULL then `from` and `to` must be as well.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphGetId ( CUgraph hGraph, unsigned int* graphId )


Returns the id of a given graph.

######  Parameters

`hGraph`
    \- Graph to query
`graphId`


###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the id of `hGraph` in `*graphId`. The value in `*graphId` will match that referenced by cuGraphDebugDotPrint.

CUresult cuGraphGetNodes ( CUgraph hGraph, CUgraphNode* nodes, size_t* numNodes )


Returns a graph's nodes.

######  Parameters

`hGraph`
    \- Graph to query
`nodes`
    \- Pointer to return the nodes
`numNodes`
    \- See description

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns a list of `hGraph's` nodes. `nodes` may be NULL, in which case this function will return the number of nodes in `numNodes`. Otherwise, `numNodes` entries will be filled in. If `numNodes` is higher than the actual number of nodes, the remaining entries in `nodes` will be set to NULL, and the number of nodes actually obtained will be returned in `numNodes`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphGetRootNodes ( CUgraph hGraph, CUgraphNode* rootNodes, size_t* numRootNodes )


Returns a graph's root nodes.

######  Parameters

`hGraph`
    \- Graph to query
`rootNodes`
    \- Pointer to return the root nodes
`numRootNodes`
    \- See description

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns a list of `hGraph's` root nodes. `rootNodes` may be NULL, in which case this function will return the number of root nodes in `numRootNodes`. Otherwise, `numRootNodes` entries will be filled in. If `numRootNodes` is higher than the actual number of root nodes, the remaining entries in `rootNodes` will be set to NULL, and the number of nodes actually obtained will be returned in `numRootNodes`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphHostNodeGetParams ( CUgraphNode hNode, CUDA_HOST_NODE_PARAMS* nodeParams )


Returns a host node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`nodeParams`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of host node `hNode` in `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphHostNodeSetParams ( CUgraphNode hNode, const CUDA_HOST_NODE_PARAMS* nodeParams )


Sets a host node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of host node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphInstantiate ( CUgraphExec* phGraphExec, CUgraph hGraph, unsigned long long flags )


Creates an executable graph from a graph.

######  Parameters

`phGraphExec`
    \- Returns instantiated graph
`hGraph`
    \- Graph to instantiate
`flags`
    \- Flags to control instantiation. See CUgraphInstantiate_flags.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Instantiates `hGraph` as an executable graph. The graph is validated for any structural constraints or intra-node constraints which were not previously validated. If instantiation is successful, a handle to the instantiated graph is returned in `phGraphExec`.

The `flags` parameter controls the behavior of instantiation and subsequent graph launches. Valid flags are:

  * CUDA_GRAPH_INSTANTIATE_FLAG_AUTO_FREE_ON_LAUNCH, which configures a graph containing memory allocation nodes to automatically free any unfreed memory allocations before the graph is relaunched.


  * CUDA_GRAPH_INSTANTIATE_FLAG_DEVICE_LAUNCH, which configures the graph for launch from the device. If this flag is passed, the executable graph handle returned can be used to launch the graph from both the host and device. This flag can only be used on platforms which support unified addressing. This flag cannot be used in conjunction with CUDA_GRAPH_INSTANTIATE_FLAG_AUTO_FREE_ON_LAUNCH.


  * CUDA_GRAPH_INSTANTIATE_FLAG_USE_NODE_PRIORITY, which causes the graph to use the priorities from the per-node attributes rather than the priority of the launch stream during execution. Note that priorities are only available on kernel nodes, and are copied from stream priority during stream capture.


If `hGraph` contains any allocation or free nodes, there can be at most one executable graph in existence for that graph at a time. An attempt to instantiate a second executable graph before destroying the first with cuGraphExecDestroy will result in an error. The same also applies if `hGraph` contains any device-updatable kernel nodes.

If `hGraph` contains kernels which call device-side cudaGraphLaunch() from multiple contexts, this will result in an error.

Graphs instantiated for launch on the device have additional restrictions which do not apply to host graphs:

  * The graph's nodes must reside on a single context.

  * The graph can only contain kernel nodes, memcpy nodes, memset nodes, and child graph nodes.

  * The graph cannot be empty and must contain at least one kernel, memcpy, or memset node. Operation-specific restrictions are outlined below.

  * Kernel nodes:
    * Use of CUDA Dynamic Parallelism is not permitted.

    * Cooperative launches are permitted as long as MPS is not in use.

  * Memcpy nodes:
    * Only copies involving device memory and/or pinned device-mapped host memory are permitted.

    * Copies involving CUDA arrays are not permitted.

    * Both operands must be accessible from the current context, and the current context must match the context of other nodes in the graph.


  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphInstantiateWithParams ( CUgraphExec* phGraphExec, CUgraph hGraph, CUDA_GRAPH_INSTANTIATE_PARAMS* instantiateParams )


Creates an executable graph from a graph.

######  Parameters

`phGraphExec`
    \- Returns instantiated graph
`hGraph`
    \- Graph to instantiate
`instantiateParams`
    \- Instantiation parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Instantiates `hGraph` as an executable graph according to the `instantiateParams` structure. The graph is validated for any structural constraints or intra-node constraints which were not previously validated. If instantiation is successful, a handle to the instantiated graph is returned in `phGraphExec`.

`instantiateParams` controls the behavior of instantiation and subsequent graph launches, as well as returning more detailed information in the event of an error. CUDA_GRAPH_INSTANTIATE_PARAMS is defined as:


    ‎    typedef struct {
                  cuuint64_t flags;
                  CUstream hUploadStream;
                  CUgraphNode hErrNode_out;
                  CUgraphInstantiateResult result_out;
              } CUDA_GRAPH_INSTANTIATE_PARAMS;

The `flags` field controls the behavior of instantiation and subsequent graph launches. Valid flags are:

  * CUDA_GRAPH_INSTANTIATE_FLAG_AUTO_FREE_ON_LAUNCH, which configures a graph containing memory allocation nodes to automatically free any unfreed memory allocations before the graph is relaunched.


  * CUDA_GRAPH_INSTANTIATE_FLAG_UPLOAD, which will perform an upload of the graph into `hUploadStream` once the graph has been instantiated.


  * CUDA_GRAPH_INSTANTIATE_FLAG_DEVICE_LAUNCH, which configures the graph for launch from the device. If this flag is passed, the executable graph handle returned can be used to launch the graph from both the host and device. This flag can only be used on platforms which support unified addressing. This flag cannot be used in conjunction with CUDA_GRAPH_INSTANTIATE_FLAG_AUTO_FREE_ON_LAUNCH.


  * CUDA_GRAPH_INSTANTIATE_FLAG_USE_NODE_PRIORITY, which causes the graph to use the priorities from the per-node attributes rather than the priority of the launch stream during execution. Note that priorities are only available on kernel nodes, and are copied from stream priority during stream capture.


If `hGraph` contains any allocation or free nodes, there can be at most one executable graph in existence for that graph at a time. An attempt to instantiate a second executable graph before destroying the first with cuGraphExecDestroy will result in an error. The same also applies if `hGraph` contains any device-updatable kernel nodes.

If `hGraph` contains kernels which call device-side cudaGraphLaunch() from multiple contexts, this will result in an error.

Graphs instantiated for launch on the device have additional restrictions which do not apply to host graphs:

  * The graph's nodes must reside on a single context.

  * The graph can only contain kernel nodes, memcpy nodes, memset nodes, and child graph nodes.

  * The graph cannot be empty and must contain at least one kernel, memcpy, or memset node. Operation-specific restrictions are outlined below.

  * Kernel nodes:
    * Use of CUDA Dynamic Parallelism is not permitted.

    * Cooperative launches are permitted as long as MPS is not in use.

  * Memcpy nodes:
    * Only copies involving device memory and/or pinned device-mapped host memory are permitted.

    * Copies involving CUDA arrays are not permitted.

    * Both operands must be accessible from the current context, and the current context must match the context of other nodes in the graph.


In the event of an error, the `result_out` and `hErrNode_out` fields will contain more information about the nature of the error. Possible error reporting includes:

  * CUDA_GRAPH_INSTANTIATE_ERROR, if passed an invalid value or if an unexpected error occurred which is described by the return value of the function. `hErrNode_out` will be set to NULL.

  * CUDA_GRAPH_INSTANTIATE_INVALID_STRUCTURE, if the graph structure is invalid. `hErrNode_out` will be set to one of the offending nodes.

  * CUDA_GRAPH_INSTANTIATE_NODE_OPERATION_NOT_SUPPORTED, if the graph is instantiated for device launch but contains a node of an unsupported node type, or a node which performs unsupported operations, such as use of CUDA dynamic parallelism within a kernel node. `hErrNode_out` will be set to this node.

  * CUDA_GRAPH_INSTANTIATE_MULTIPLE_CTXS_NOT_SUPPORTED, if the graph is instantiated for device launch but a node’s context differs from that of another node. This error can also be returned if a graph is not instantiated for device launch and it contains kernels which call device-side cudaGraphLaunch() from multiple contexts. `hErrNode_out` will be set to this node.


If instantiation is successful, `result_out` will be set to CUDA_GRAPH_INSTANTIATE_SUCCESS, and `hErrNode_out` will be set to NULL.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphKernelNodeCopyAttributes ( CUgraphNode dst, CUgraphNode src )


Copies attributes from source node to destination node.

######  Parameters

`dst`
    Destination node
`src`
    Source node For list of attributes see CUkernelNodeAttrID

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Copies attributes from source node `src` to destination node `dst`. Both node must have the same context.

CUresult cuGraphKernelNodeGetAttribute ( CUgraphNode hNode, CUkernelNodeAttrID attr, CUkernelNodeAttrValue* value_out )


Queries node attribute.

######  Parameters

`hNode`

`attr`

`value_out`


###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Queries attribute `attr` from node `hNode` and stores it in corresponding member of `value_out`.

CUresult cuGraphKernelNodeGetParams ( CUgraphNode hNode, CUDA_KERNEL_NODE_PARAMS* nodeParams )


Returns a kernel node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`nodeParams`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of kernel node `hNode` in `nodeParams`. The `kernelParams` or `extra` array returned in `nodeParams`, as well as the argument values it points to, are owned by the node. This memory remains valid until the node is destroyed or its parameters are modified, and should not be modified directly. Use cuGraphKernelNodeSetParams to update the parameters of this node.

The params will contain either `kernelParams` or `extra`, according to which of these was most recently set on the node.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphKernelNodeSetAttribute ( CUgraphNode hNode, CUkernelNodeAttrID attr, const CUkernelNodeAttrValue* value )


Sets node attribute.

######  Parameters

`hNode`

`attr`

`value`


###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE

###### Description

Sets attribute `attr` on node `hNode` from corresponding attribute of `value`.

CUresult cuGraphKernelNodeSetParams ( CUgraphNode hNode, const CUDA_KERNEL_NODE_PARAMS* nodeParams )


Sets a kernel node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_INVALID_HANDLE, CUDA_ERROR_OUT_OF_MEMORY

###### Description

Sets the parameters of kernel node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphLaunch ( CUgraphExec hGraphExec, CUstream hStream )


Launches an executable graph in a stream.

######  Parameters

`hGraphExec`
    \- Executable graph to launch
`hStream`
    \- Stream in which to launch the graph

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Executes `hGraphExec` in `hStream`. Only one instance of `hGraphExec` may be executing at a time. Each launch is ordered behind both any previous work in `hStream` and any previous launches of `hGraphExec`. To execute a graph concurrently, it must be instantiated multiple times into multiple executable graphs.

If any allocations created by `hGraphExec` remain unfreed (from a previous launch) and `hGraphExec` was not instantiated with CUDA_GRAPH_INSTANTIATE_FLAG_AUTO_FREE_ON_LAUNCH, the launch will fail with CUDA_ERROR_INVALID_VALUE.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphMemAllocNodeGetParams ( CUgraphNode hNode, CUDA_MEM_ALLOC_NODE_PARAMS* params_out )


Returns a memory alloc node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`params_out`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of a memory alloc node `hNode` in `params_out`. The `poolProps` and `accessDescs` returned in `params_out`, are owned by the node. This memory remains valid until the node is destroyed. The returned parameters must not be modified.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphMemFreeNodeGetParams ( CUgraphNode hNode, CUdeviceptr* dptr_out )


Returns a memory free node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`dptr_out`
    \- Pointer to return the device address

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the address of a memory free node `hNode` in `dptr_out`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphMemcpyNodeGetParams ( CUgraphNode hNode, CUDA_MEMCPY3D* nodeParams )


Returns a memcpy node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`nodeParams`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of memcpy node `hNode` in `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphMemcpyNodeSetParams ( CUgraphNode hNode, const CUDA_MEMCPY3D* nodeParams )


Sets a memcpy node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of memcpy node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphMemsetNodeGetParams ( CUgraphNode hNode, CUDA_MEMSET_NODE_PARAMS* nodeParams )


Returns a memset node's parameters.

######  Parameters

`hNode`
    \- Node to get the parameters for
`nodeParams`
    \- Pointer to return the parameters

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the parameters of memset node `hNode` in `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphMemsetNodeSetParams ( CUgraphNode hNode, const CUDA_MEMSET_NODE_PARAMS* nodeParams )


Sets a memset node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Sets the parameters of memset node `hNode` to `nodeParams`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeFindInClone ( CUgraphNode* phNode, CUgraphNode hOriginalNode, CUgraph hClonedGraph )


Finds a cloned version of a node.

######  Parameters

`phNode`
    \- Returns handle to the cloned node
`hOriginalNode`
    \- Handle to the original node
`hClonedGraph`
    \- Cloned graph to query

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

This function returns the node in `hClonedGraph` corresponding to `hOriginalNode` in the original graph.

`hClonedGraph` must have been cloned from `hOriginalGraph` via cuGraphClone. `hOriginalNode` must have been in `hOriginalGraph` at the time of the call to cuGraphClone, and the corresponding cloned node in `hClonedGraph` must not have been removed. The cloned node is then returned via `phClonedNode`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeGetContainingGraph ( CUgraphNode hNode, CUgraph* phGraph )


Returns the graph that contains a given graph node.

######  Parameters

`hNode`
    \- Node to query
`phGraph`


###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the graph that contains `hNode` in `*phGraph`. If `hNode` is in a child graph, the child graph it is in is returned.

CUresult cuGraphNodeGetDependencies ( CUgraphNode hNode, CUgraphNode* dependencies, CUgraphEdgeData* edgeData, size_t* numDependencies )


Returns a node's dependencies.

######  Parameters

`hNode`
    \- Node to query
`dependencies`
    \- Pointer to return the dependencies
`edgeData`
    \- Optional array to return edge data for each dependency
`numDependencies`
    \- See description

###### Returns

CUDA_SUCCESS, CUDA_ERROR_LOSSY_QUERY, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns a list of `node's` dependencies. `dependencies` may be NULL, in which case this function will return the number of dependencies in `numDependencies`. Otherwise, `numDependencies` entries will be filled in. If `numDependencies` is higher than the actual number of dependencies, the remaining entries in `dependencies` will be set to NULL, and the number of nodes actually obtained will be returned in `numDependencies`.

Note that if an edge has non-zero (non-default) edge data and `edgeData` is NULL, this API will return CUDA_ERROR_LOSSY_QUERY. If `edgeData` is non-NULL, then `dependencies` must be as well.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeGetDependentNodes ( CUgraphNode hNode, CUgraphNode* dependentNodes, CUgraphEdgeData* edgeData, size_t* numDependentNodes )


Returns a node's dependent nodes.

######  Parameters

`hNode`
    \- Node to query
`dependentNodes`
    \- Pointer to return the dependent nodes
`edgeData`
    \- Optional pointer to return edge data for dependent nodes
`numDependentNodes`
    \- See description

###### Returns

CUDA_SUCCESS, CUDA_ERROR_LOSSY_QUERY, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns a list of `node's` dependent nodes. `dependentNodes` may be NULL, in which case this function will return the number of dependent nodes in `numDependentNodes`. Otherwise, `numDependentNodes` entries will be filled in. If `numDependentNodes` is higher than the actual number of dependent nodes, the remaining entries in `dependentNodes` will be set to NULL, and the number of nodes actually obtained will be returned in `numDependentNodes`.

Note that if an edge has non-zero (non-default) edge data and `edgeData` is NULL, this API will return CUDA_ERROR_LOSSY_QUERY. If `edgeData` is non-NULL, then `dependentNodes` must be as well.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeGetEnabled ( CUgraphExec hGraphExec, CUgraphNode hNode, unsigned int* isEnabled )


Query whether a node in the given graphExec is enabled.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Node from the graph from which graphExec was instantiated
`isEnabled`
    \- Location to return the enabled status of the node

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets isEnabled to 1 if `hNode` is enabled, or 0 if `hNode` is disabled.

The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

  * Currently only kernel, memset and memcpy nodes are supported.

  * This function will not reflect device-side updates for device-updatable kernel nodes.


  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeGetLocalId ( CUgraphNode hNode, unsigned int* nodeId )


Returns the local node id of a given graph node.

######  Parameters

`hNode`
    \- Node to query
`nodeId`
    \- Pointer to return the nodeId

###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

Returns the node id of `hNode` in `*nodeId`. The nodeId matches that referenced by cuGraphDebugDotPrint. The local nodeId and graphId together can uniquely identify the node.

CUresult cuGraphNodeGetToolsId ( CUgraphNode hNode, unsigned long long* toolsNodeId )


Returns an id used by tools to identify a given node.

######  Parameters

`hNode`
    \- Node to query
`toolsNodeId`


###### Returns

CUDA_SUCCESSCUDA_ERROR_INVALID_VALUE

###### Description

CUresult cuGraphNodeGetType ( CUgraphNode hNode, CUgraphNodeType* type )


Returns a node's type.

######  Parameters

`hNode`
    \- Node to query
`type`
    \- Pointer to return the node type

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Returns the node type of `hNode` in `type`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeSetEnabled ( CUgraphExec hGraphExec, CUgraphNode hNode, unsigned int  isEnabled )


Enables or disables the specified node in the given graphExec.

######  Parameters

`hGraphExec`
    \- The executable graph in which to set the specified node
`hNode`
    \- Node from the graph from which graphExec was instantiated
`isEnabled`
    \- Node is enabled if != 0, otherwise the node is disabled

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets `hNode` to be either enabled or disabled. Disabled nodes are functionally equivalent to empty nodes until they are reenabled. Existing node parameters are not affected by disabling/enabling the node.

The node is identified by the corresponding node `hNode` in the non-executable graph, from which the executable graph was instantiated.

`hNode` must not have been removed from the original graph.

The modifications only affect future launches of `hGraphExec`. Already enqueued or running launches of `hGraphExec` are not affected by this call. `hNode` is also not modified by this call.

If `hNode` is a device-updatable kernel node, the next upload/launch of `hGraphExec` will overwrite any previous device-side updates. Additionally, applying host updates to a device-updatable kernel node while it is being updated from the device will result in undefined behavior.

Currently only kernel, memset and memcpy nodes are supported.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphNodeSetParams ( CUgraphNode hNode, CUgraphNodeParams* nodeParams )


Update's a graph node's parameters.

######  Parameters

`hNode`
    \- Node to set the parameters for
`nodeParams`
    \- Parameters to copy

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE, CUDA_ERROR_NOT_SUPPORTED

###### Description

Sets the parameters of graph node `hNode` to `nodeParams`. The node type specified by `nodeParams->type` must match the type of `hNode`. `nodeParams` must be fully initialized and all unused bytes (reserved, padding) zeroed.

Modifying parameters is not supported for node types CU_GRAPH_NODE_TYPE_MEM_ALLOC and CU_GRAPH_NODE_TYPE_MEM_FREE.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphReleaseUserObject ( CUgraph graph, CUuserObject object, unsigned int  count )


Release a user object reference from a graph.

######  Parameters

`graph`
    \- The graph that will release the reference
`object`
    \- The user object to release a reference for
`count`
    \- The number of references to release, typically 1. Must be nonzero and not larger than INT_MAX.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Releases user object references owned by a graph.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

CUresult cuGraphRemoveDependencies ( CUgraph hGraph, const CUgraphNode* from, const CUgraphNode* to, const CUgraphEdgeData* edgeData, size_t numDependencies )


Removes dependency edges from a graph.

######  Parameters

`hGraph`
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

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

The number of `dependencies` to be removed is defined by `numDependencies`. Elements in `from` and `to` at corresponding indices define a dependency. Each node in `from` and `to` must belong to `hGraph`.

If `numDependencies` is 0, elements in `from` and `to` will be ignored. Specifying an edge that does not exist in the graph, with data matching `edgeData`, results in an error. `edgeData` is nullable, which is equivalent to passing default (zeroed) data for each edge.

Dependencies cannot be removed from graphs which contain allocation or free nodes. Any attempt to do so will return an error.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuGraphRetainUserObject ( CUgraph graph, CUuserObject object, unsigned int  count, unsigned int  flags )


Retain a reference to a user object from a graph.

######  Parameters

`graph`
    \- The graph to associate the reference with
`object`
    \- The user object to retain a reference for
`count`
    \- The number of references to add to the graph, typically 1. Must be nonzero and not larger than INT_MAX.
`flags`
    \- The optional flag CU_GRAPH_USER_OBJECT_MOVE transfers references from the calling thread, rather than create new references. Pass 0 to create new references.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Creates or moves user object references that will be owned by a CUDA graph.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

CUresult cuGraphUpload ( CUgraphExec hGraphExec, CUstream hStream )


Uploads an executable graph in a stream.

######  Parameters

`hGraphExec`
    \- Executable graph to upload
`hStream`
    \- Stream in which to upload the graph

###### Returns

CUDA_SUCCESS, CUDA_ERROR_DEINITIALIZED, CUDA_ERROR_NOT_INITIALIZED, CUDA_ERROR_INVALID_VALUE

###### Description

Uploads `hGraphExec` to the device in `hStream` without executing it. Uploads of the same `hGraphExec` will be serialized. Each upload is ordered behind both any previous work in `hStream` and any previous launches of `hGraphExec`. Uses memory cached by `stream` to back the allocations owned by `hGraphExec`.

  * Graph objects are not threadsafe. More here.

  *
CUresult cuUserObjectCreate ( CUuserObject* object_out, void* ptr, CUhostFn destroy, unsigned int  initialRefcount, unsigned int  flags )


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
    \- Currently it is required to pass CU_USER_OBJECT_NO_DESTRUCTOR_SYNC, which is the only defined flag. This indicates that the destroy callback cannot be waited on by any CUDA API. Users requiring synchronization of the callback should signal its completion manually.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Create a user object with the specified destructor callback and initial reference count. The initial references are owned by the caller.

Destructor callbacks cannot make CUDA API calls and should avoid blocking behavior, as they are executed by a shared internal thread. Another thread may be signaled to perform such actions, if it does not block forward progress of tasks scheduled through CUDA.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

CUresult cuUserObjectRelease ( CUuserObject object, unsigned int  count )


Release a reference to a user object.

######  Parameters

`object`
    \- The object to release
`count`
    \- The number of references to release, typically 1. Must be nonzero and not larger than INT_MAX.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Releases user object references owned by the caller. The object's destructor is invoked if the reference count reaches zero.

It is undefined behavior to release references not owned by the caller, or to use a user object handle after all references are released.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.

CUresult cuUserObjectRetain ( CUuserObject object, unsigned int  count )


Retain a reference to a user object.

######  Parameters

`object`
    \- The object to retain
`count`
    \- The number of references to retain, typically 1. Must be nonzero and not larger than INT_MAX.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Retains new references to a user object. The new references are owned by the caller.

See CUDA User Objects in the CUDA C++ Programming Guide for more information on user objects.
