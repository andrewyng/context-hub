---
name: package
description: "LangGraph4j graph-based agent orchestration for Java with StateGraph, channels, checkpointing, and Spring Boot integration"
metadata:
  languages: "java"
  versions: "1.8.10"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "langgraph4j,java,agents,graphs,workflow,spring-boot,orchestration"
---

# LangGraph4j — Java Agent Orchestration Guide

## CRITICAL: Common Agent Mistakes
- Do NOT use LangGraph (Python) APIs — LangGraph4j has its own Java API
- Do NOT confuse `langgraph4j-core` with `langgraph4j-agent-executor` — core is what you need for custom graphs
- Do NOT create new graph instances per request — compile once as a `@Bean`, reuse with different `threadId`
- Do NOT skip checkpointing — without it you lose state on failure and can't debug
- Requires **Java 17+**

## Dependencies

### Gradle (Kotlin DSL)
```kotlin
implementation("org.bsc.langgraph4j:langgraph4j-core:1.8.10")
// If using LangChain4j models:
implementation(platform("dev.langchain4j:langchain4j-bom:1.1.0"))
implementation("dev.langchain4j:langchain4j")
implementation("dev.langchain4j:langchain4j-open-ai")
```

### Maven
```xml
<dependency>
    <groupId>org.bsc.langgraph4j</groupId>
    <artifactId>langgraph4j-core</artifactId>
    <version>1.8.10</version>
</dependency>
```

## Core Concepts

### StateGraph — The Building Block
A `StateGraph` defines nodes (actions) and edges (transitions). State flows through the graph, each node reading and updating it.

```
START → [Node A] → conditional → [Node B] → [Node C] → END
                              └→ [Node D] → END
```

### Channels — State Schema
Channels define how state fields are updated:
- **Appender channel**: new values are appended (for message lists)
- **Value channel**: new values overwrite (for single fields)

### Key Classes
| Class | Purpose |
|---|---|
| `StateGraph<S>` | Defines graph structure (nodes + edges) |
| `CompiledGraph<S>` | Executable graph (from `.compile()`) |
| `AgentState` | Base class for state — holds `Map<String, Object>` |
| `Channel<T>` | Defines how a state field is updated |
| `AsyncNodeAction<S>` | Node logic — takes state, returns updates |
| `AsyncEdgeAction<S>` | Routing logic — takes state, returns next node name |
| `RunnableConfig` | Per-invocation config (threadId, metadata) |
| `MemorySaver` | In-memory checkpointer for state persistence |

## State Definition

```java
public class MyAgentState extends AgentState implements Serializable {

    public static final Map<String, Channel<?>> SCHEMA = Map.of(
        "messages", Channels.appender(ArrayList::new),    // append-only list
        "currentStep", Channel.of(() -> ""),               // overwrite value
        "iteration", Channel.of(() -> 0),                  // overwrite value
        "context", Channels.appender(ArrayList::new)       // append-only list
    );

    public MyAgentState(Map<String, Object> initData) {
        super(initData);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, String>> messages() {
        return (List<Map<String, String>>) value("messages").orElse(new ArrayList<>());
    }

    public String currentStep() {
        return (String) value("currentStep").orElse("");
    }

    public int iteration() {
        return (int) value("iteration").orElse(0);
    }
}
```

## Building a Graph

### Simple Two-Node Graph
```java
@Configuration
public class AgentGraphConfig {

    @Bean
    public CompiledGraph<MyAgentState> agentGraph(ChatModel chatModel) {
        // Define nodes
        AsyncNodeAction<MyAgentState> agentNode = state -> {
            String response = chatModel.chat(
                SystemMessage.from("You are a helpful assistant."),
                UserMessage.from(state.currentStep())
            ).aiMessage().text();

            return Map.of("messages", List.of(
                Map.of("role", "assistant", "content", response)
            ));
        };

        AsyncNodeAction<MyAgentState> toolNode = state -> {
            // Execute tool based on agent's response
            String lastMessage = getLastMessage(state);
            String result = executeTool(lastMessage);
            return Map.of("messages", List.of(
                Map.of("role", "tool", "content", result)
            ));
        };

        // Define routing
        AsyncEdgeAction<MyAgentState> routeToolOrEnd = state -> {
            String lastMessage = getLastMessage(state);
            return hasToolCall(lastMessage) ? "tools" : "end";
        };

        // Build graph
        StateGraph<MyAgentState> graph = new StateGraph<>(
                MyAgentState.SCHEMA, MyAgentState::new)
            .addNode("agent", agentNode)
            .addNode("tools", toolNode)
            .addEdge(START, "agent")
            .addConditionalEdges("agent", routeToolOrEnd,
                Map.of("tools", "tools", "end", END))
            .addEdge("tools", "agent");

        // Compile with checkpointing
        return graph.compile(
            CompileConfig.builder()
                .checkpointSaver(new MemorySaver())
                .build()
        );
    }
}
```

### Invoking the Graph
```java
@Service
public class AgentService {

    private final CompiledGraph<MyAgentState> agentGraph;

    public AgentService(CompiledGraph<MyAgentState> agentGraph) {
        this.agentGraph = agentGraph;
    }

    public String run(String sessionId, String userInput) {
        Map<String, Object> input = Map.of(
            "messages", List.of(Map.of("role", "user", "content", userInput)),
            "currentStep", userInput
        );

        RunnableConfig config = RunnableConfig.builder()
            .threadId(sessionId)  // isolates state per session
            .build();

        Optional<MyAgentState> result = agentGraph.invoke(input, config);

        return result
            .map(state -> getLastMessage(state))
            .orElse("No response generated");
    }
}
```

## Agent Pattern Selection

**Choose the right pattern based on your requirements:**

```
Simple tool use           → Tool-Calling Agent (simplest)
Iterative investigation   → ReAct
Centralized delegation    → Supervisor
Decentralized routing     → Swarm (Handoffs)
Complex multi-step plan   → Plan-and-Execute
Quality-critical output   → Reflexion
Parallel batch processing → Map-Reduce
```

| Question | If Yes → Consider |
|---|---|
| Single task with tool access? | Tool-Calling or ReAct |
| Multiple specialized agents? | Supervisor or Swarm |
| Complex sequential steps? | Plan-and-Execute |
| Peer-to-peer handoffs? | Swarm |
| Centralized control/audit? | Supervisor |
| Quality over speed? | Reflexion |
| Parallel subtasks? | Map-Reduce |

**Start simple, add complexity only when a specific failure mode demands it.**

## Pattern: Supervisor (Multi-Agent)

```java
@Bean
public CompiledGraph<MyAgentState> supervisorGraph(
        ChatModel chatModel,
        ResearcherAgent researcher,
        AnalystAgent analyst,
        WriterAgent writer) {

    AsyncNodeAction<MyAgentState> supervisorNode = state -> {
        String decision = chatModel.chat(
            SystemMessage.from("Choose next worker: researcher, analyst, writer, or DONE"),
            UserMessage.from(buildContext(state))
        ).aiMessage().text();
        return Map.of("currentStep", decision.toLowerCase().trim());
    };

    AsyncEdgeAction<MyAgentState> supervisorRouter = state ->
        state.currentStep().contains("done") ? "end" : state.currentStep();

    return new StateGraph<>(MyAgentState.SCHEMA, MyAgentState::new)
        .addNode("supervisor", supervisorNode)
        .addNode("researcher", researcher::execute)
        .addNode("analyst", analyst::execute)
        .addNode("writer", writer::execute)
        .addEdge(START, "supervisor")
        .addConditionalEdges("supervisor", supervisorRouter,
            Map.of("researcher", "researcher", "analyst", "analyst",
                   "writer", "writer", "end", END))
        .addEdge("researcher", "supervisor")
        .addEdge("analyst", "supervisor")
        .addEdge("writer", "supervisor")
        .compile(CompileConfig.builder()
            .checkpointSaver(new MemorySaver())
            .build());
}
```

## Pattern: ReAct (Reason + Act)

```java
@Service
public class ReActAgent {

    private final ChatModel chatModel;
    private final ToolExecutor toolExecutor;
    private static final int MAX_ITERATIONS = 10;

    public ReActAgent(ChatModel chatModel, ToolExecutor toolExecutor) {
        this.chatModel = chatModel;
        this.toolExecutor = toolExecutor;
    }

    public String investigate(String question) {
        List<ChatMessage> history = new ArrayList<>();
        history.add(SystemMessage.from("""
            You are an investigative agent. For each step:
            THOUGHT: your reasoning
            TOOL: toolName(param) — if you need more info
            REPORT: final answer — when you have enough info
            """));
        history.add(UserMessage.from(question));

        for (int i = 0; i < MAX_ITERATIONS; i++) {
            String response = chatModel.chat(history).aiMessage().text();
            history.add(AiMessage.from(response));

            if (response.contains("REPORT:")) {
                return extractAfter(response, "REPORT:");
            }

            if (response.contains("TOOL:")) {
                String toolCall = extractAfter(response, "TOOL:");
                String result = toolExecutor.execute(toolCall);
                history.add(UserMessage.from("OBSERVATION: " + result));
            }
        }
        return "Max iterations reached";
    }
}
```

## Pattern: Plan-and-Execute

```java
public class PlanExecuteState extends AgentState implements Serializable {

    public static final Map<String, Channel<?>> SCHEMA = Map.of(
        "plan", Channel.of(ArrayList::new),
        "completedSteps", Channels.appender(ArrayList::new),
        "messages", Channels.appender(ArrayList::new)
    );

    public PlanExecuteState(Map<String, Object> initData) { super(initData); }

    @SuppressWarnings("unchecked")
    public List<String> plan() {
        return (List<String>) value("plan").orElse(new ArrayList<>());
    }

    @SuppressWarnings("unchecked")
    public List<String> completedSteps() {
        return (List<String>) value("completedSteps").orElse(new ArrayList<>());
    }

    public String currentStep() {
        List<String> plan = plan();
        int done = completedSteps().size();
        return done < plan.size() ? plan.get(done) : null;
    }
}

// Planner node
AsyncNodeAction<PlanExecuteState> planner = state -> {
    String plan = chatModel.chat(
        SystemMessage.from("Break this into numbered steps"),
        UserMessage.from(state.messages().toString())
    ).aiMessage().text();
    return Map.of("plan", parseSteps(plan));
};

// Executor node
AsyncNodeAction<PlanExecuteState> executor = state -> {
    String step = state.currentStep();
    String result = executorModel.chat("Execute this step: " + step);
    return Map.of("completedSteps", List.of(step + " → " + result));
};

// Router: more steps or done?
AsyncEdgeAction<PlanExecuteState> replanRouter = state ->
    state.currentStep() != null ? "executor" : "end";
```

## Spring Boot Integration Structure

```
src/main/java/com/example/
├── config/
│   └── AgentGraphConfig.java       # @Configuration — CompiledGraph @Beans
├── agent/
│   ├── state/
│   │   └── MyAgentState.java       # Extends AgentState, defines SCHEMA
│   ├── MyAgentService.java         # @Service — invokes graph, manages sessions
│   └── MyAgentController.java      # @RestController — REST endpoints
└── tools/
    ├── ToolExecutor.java           # @Component — routes tool calls
    ├── DatabaseTool.java           # @Component — DB queries
    └── ApiTool.java                # @Component — external API calls
```

### Key Conventions
- **Graph as singleton `@Bean`**: compile once, reuse across all requests
- **Session isolation via `threadId`**: each user/session gets its own state
- **Tools as Spring `@Component`**: inject repositories, services, clients
- **Service layer**: handles invocation, error handling, response mapping
- **Controller layer**: exposes REST/WebSocket endpoints

### Controller Example
```java
@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AgentResponse> chat(
            @RequestHeader("X-Session-Id") String sessionId,
            @Valid @RequestBody ChatRequest request) {
        String response = agentService.run(sessionId, request.message());
        return ResponseEntity.ok(new AgentResponse(response));
    }
}

public record ChatRequest(@NotBlank String message) {}
public record AgentResponse(String message) {}
```

## Checkpointing and State Persistence

```java
// In-memory (development/testing)
CompileConfig config = CompileConfig.builder()
    .checkpointSaver(new MemorySaver())
    .build();

// State is persisted per threadId — survives across invocations within the session
RunnableConfig runConfig = RunnableConfig.builder()
    .threadId("user-123-session-456")
    .build();
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| New graph per request | Compilation overhead, no state reuse | Compile once as `@Bean` |
| Always using ReAct | Not every task needs iterative reasoning | Match pattern to task complexity |
| Supervisor for 2 agents | Unnecessary coordinator overhead | Use direct edges or handoffs |
| No checkpointing | Lose state on failure, can't debug | Always add `MemorySaver` minimum |
| Monolithic agent node | One node does everything | Split into focused nodes |
| Ignoring token costs | Reflexion/Supervisor multiply LLM calls | Profile usage, use cheaper models |
| Shared state across users | Data leaks between sessions | Always use unique `threadId` |
| Blocking async nodes | Defeats async graph execution | Use `CompletableFuture.supplyAsync` |

## Graph Lifecycle in Spring Boot

```java
@Configuration
public class AgentGraphConfig {

    @Bean
    public CompiledGraph<MyAgentState> agentGraph(ChatModel chatModel,
                                                    List<Object> tools) {
        // 1. Build graph at startup (once)
        StateGraph<MyAgentState> graph = buildGraph(chatModel, tools);

        // 2. Compile with checkpointing
        return graph.compile(
            CompileConfig.builder()
                .checkpointSaver(new MemorySaver())
                .build()
        );
    }

    // Graph is a singleton bean — thread-safe, reused for all requests
    // State isolation happens via RunnableConfig.threadId per invocation
}
```
