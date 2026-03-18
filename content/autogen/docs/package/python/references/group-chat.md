# AG2 Group Chat API Reference

## run_group_chat()

The primary function for orchestrating 3+ agents. For single-agent or two-agent conversations, use `run()` (see `references/agents.md`). Non-blocking — runs in a background thread and returns a `RunResponse` immediately.

```python
from autogen import ConversableAgent
from autogen.agentchat import run_group_chat
from autogen.agentchat.group.patterns import AutoPattern
from autogen.llm_config import LLMConfig

llm_config = LLMConfig({"api_type": "google", "model": "gemini-3.1-flash-lite-preview"})

planner = ConversableAgent(name="planner", llm_config=llm_config,
    description="Plans implementation steps and breaks down tasks.")
reviewer = ConversableAgent(name="reviewer", llm_config=llm_config,
    description="Reviews work for correctness and quality.")
coder = ConversableAgent(name="coder", llm_config=llm_config,
    description="Writes Python code based on the plan.")

pattern = AutoPattern(
    initial_agent=planner,
    agents=[planner, reviewer, coder],
    group_manager_args={"llm_config": llm_config},
)

result = run_group_chat(
    pattern=pattern,
    messages="Design a REST API for a todo app.",
    max_rounds=10,
)
result.process()

print(result.summary)
```

| Param | Type | Default | Description |
|---|---|---|---|
| `pattern` | `Pattern` | required | Orchestration pattern controlling agent selection |
| `messages` | `str \| list[dict]` | required | Initial message(s) to start the group chat |
| `max_rounds` | `int` | `20` | Maximum conversation rounds before termination |

### RunResponse

`run_group_chat()` returns a `RunResponse`. Call `.process()` to execute, then access results:

```python
result = run_group_chat(pattern=pattern, messages="Design an API.")
result.process()

print(result.summary)                          # conversation summary
print(result.cost)                             # token usage and cost breakdown
print(result.last_speaker)                     # name of the last agent that spoke
print(result.context_variables.to_dict())      # final shared state
```

| Property | Type | Description |
|---|---|---|
| `.summary` | `str \| None` | Conversation summary (controlled by `summary_method`) |
| `.cost` | `Cost \| None` | Token usage and cost; `.cost.usage_including_cached_inference` and `.cost.usage_excluding_cached_inference` each have `.total_cost` |
| `.last_speaker` | `str \| None` | Name of the last agent that spoke |
| `.context_variables` | `ContextVariables \| None` | Final shared state after the conversation |
| `.events` | `Iterable[BaseEvent]` | Stream of all conversation events |
| `.messages` | `Iterable[Message]` | Chat messages exchanged |

`run()` returns the same `RunResponse` — see `references/agents.md` for details.

## run_group_chat_iter()

Stepped iteration over group chat events. Use for streaming UIs or custom event processing.

```python
from autogen.agentchat import run_group_chat_iter
from autogen.events import TextEvent, TerminationEvent

for event in run_group_chat_iter(
    pattern=pattern,
    messages="Plan a deployment strategy.",
    max_rounds=15,
    yield_on=[TextEvent, TerminationEvent],
):
    if isinstance(event, TextEvent):
        print(f"[{event.source}]: {event.content}")
```

| Param | Type | Default | Description |
|---|---|---|---|
| `yield_on` | `Sequence[type[BaseEvent]] \| None` | `None` | Event types to yield; `None` yields all |

All other params match `run_group_chat()`. Common event types:

| Event | Description |
|---|---|
| `TextEvent` | Agent produced text output |
| `ToolCallEvent` | Agent invoked a tool |
| `GroupChatRunChatEvent` | Group chat round completed |
| `TerminationEvent` | Conversation ended |

## Tool Execution in Group Chat

In group chat, tool execution is automatic. Register tools on an agent via `functions` and AG2 handles execution internally — no need for a separate executor agent or split registration:

```python
from typing import Annotated

def lookup_order(order_id: Annotated[str, "The order ID"]) -> str:
    """Look up an order by ID."""
    return f"Order {order_id}: shipped"

agent = ConversableAgent(
    name="support",
    llm_config=llm_config,
    functions=[lookup_order],
)
```

This differs from two-agent `run()` where you must split registration between an LLM agent and an execution agent. See `references/agents.md` for the two-agent pattern.

## Patterns

Patterns control how agents take turns in a group chat. All patterns share a common base:

| Param | Type | Default | Description |
|---|---|---|---|
| `initial_agent` | `ConversableAgent` | required | Agent that speaks first |
| `agents` | `list[ConversableAgent]` | required | All participating agents |
| `user_agent` | `ConversableAgent \| None` | `None` | Human-in-the-loop agent |
| `group_manager_args` | `dict \| None` | `None` | Config for the internal group manager (e.g., `llm_config`, `is_termination_msg`) |
| `context_variables` | `ContextVariables \| None` | `None` | Shared state across agents |
| `group_after_work` | `TransitionTarget \| None` | `TerminateTarget()` | Default action when no handoff triggers |
| `summary_method` | `str \| Callable \| None` | `"last_msg"` | How to generate the conversation summary |

### AutoPattern

LLM-based agent selection. The group manager uses its LLM to choose the next speaker based on conversation context. Easiest to start with.

Important: Set `description` on each agent — the group manager uses agent descriptions to decide who speaks next. Without descriptions, it uses the system_message which can be too verbose.

```python
from autogen.agentchat.group.patterns import AutoPattern

planner = ConversableAgent(name="planner", llm_config=llm_config,
    description="Plans implementation steps and breaks down tasks.")
coder = ConversableAgent(name="coder", llm_config=llm_config,
    description="Writes Python code based on the plan.")
reviewer = ConversableAgent(name="reviewer", llm_config=llm_config,
    description="Reviews code and plans for correctness and quality.")

pattern = AutoPattern(
    initial_agent=planner,
    agents=[planner, coder, reviewer],
    group_manager_args={"llm_config": llm_config},
)
```

`group_after_work` is always `GroupManagerTarget` (LLM picks the next agent). Requires an LLM config on the group manager.

Use when: you want the LLM to dynamically route between agents without explicit handoff rules.

### DefaultPattern

Explicit handoff-driven routing. Agents must configure their own transitions via `agent.handoffs`. No automatic next-speaker selection.

```python
from autogen.agentchat.group.patterns import DefaultPattern
from autogen.agentchat.group import OnCondition, AfterWork

planner.handoffs.add_llm_condition(
    OnCondition(target=coder, condition="The plan is ready to implement.")
)
coder.handoffs.add_llm_condition(
    OnCondition(target=reviewer, condition="Code is ready for review.")
)
reviewer.handoffs.set_after_work(AfterWork(target=planner))

pattern = DefaultPattern(
    initial_agent=planner,
    agents=[planner, coder, reviewer],
)
```

Use when: you need deterministic control over agent transitions.

### RoundRobinPattern

Agents speak in list order, cycling back to the first. No LLM-based selection.

```python
from autogen.agentchat.group.patterns import RoundRobinPattern

pattern = RoundRobinPattern(
    initial_agent=agent_a,
    agents=[agent_a, agent_b, agent_c],
)
```

Use when: every agent must contribute each round in a fixed order.

### RandomPattern

Each turn, a random agent is selected. No LLM-based selection.

```python
from autogen.agentchat.group.patterns import RandomPattern

pattern = RandomPattern(
    initial_agent=agent_a,
    agents=[agent_a, agent_b, agent_c],
)
```

Use when: you want diverse perspectives without ordering bias.

### ManualPattern

Prompts the user to select the next agent each turn.

```python
from autogen.agentchat.group.patterns import ManualPattern

pattern = ManualPattern(
    initial_agent=agent_a,
    agents=[agent_a, agent_b, agent_c],
    user_agent=human,
)
```

Use when: a human operator needs full control over the conversation flow.

## Handoffs

Handoffs control how agents transition to each other in `DefaultPattern` (or when adding custom transitions in any pattern).

### OnCondition

LLM-evaluated transition. The condition is translated into a tool the LLM can call to trigger the handoff.

```python
from autogen.agentchat.group import OnCondition

planner.handoffs.add_llm_condition(
    OnCondition(
        target=reviewer,
        condition="The plan is complete and ready for review.",
    )
)
```

| Param | Type | Description |
|---|---|---|
| `target` | `TransitionTarget` | Agent or target to hand off to |
| `condition` | `str` | Natural language condition evaluated by the LLM |

### OnContextCondition

Context variable-based transition. Evaluated without an LLM call — checked before `OnCondition`.

```python
from autogen.agentchat.group import OnContextCondition

planner.handoffs.add_context_condition(
    OnContextCondition(
        target=reviewer,
        condition=lambda ctx: ctx.get("plan_ready", False),
    )
)
```

### AfterWork

Fallback target when no `OnCondition` or `OnContextCondition` triggers.

```python
from autogen.agentchat.group import AfterWork

reviewer.handoffs.set_after_work(AfterWork(target=planner))
```

### Transition Targets

Targets control where the conversation goes next. Used in `OnCondition`, `AfterWork`, and `ReplyResult`.

| Target | Description |
|---|---|
| `AgentTarget(agent)` | Hand off to a specific agent instance |
| `AgentNameTarget("name")` | Hand off to an agent by name (string) |
| `RevertToUserTarget()` | Return control to the user agent |
| `StayTarget()` | Current agent continues speaking |
| `TerminateTarget()` | End the group chat |
| `GroupManagerTarget()` | Let the group manager LLM pick the next agent |
| `RandomAgentTarget(agents)` | Randomly select from a list of agents |
| `FunctionTarget(fn)` | Call a function to determine the next target dynamically |

All targets import from `autogen.agentchat.group`.

#### AgentTarget

The most common target — routes to a specific agent:

```python
from autogen.agentchat.group import AgentTarget, OnCondition

planner.handoffs.add_llm_condition(
    OnCondition(target=AgentTarget(coder), condition="Plan is ready to implement.")
)
```

You can also pass an agent instance directly to `target=` in `OnCondition` or `AfterWork` — AG2 wraps it in `AgentTarget` automatically.

#### FunctionTarget

Calls a function at transition time to dynamically decide where to go. The function receives the last message and context variables, and must return a `FunctionTargetResult`:

```python
from autogen.agentchat.group import FunctionTarget, OnCondition
from autogen.agentchat.group.targets.function_target import FunctionTargetResult

def route_next(output: str, context_variables: ContextVariables) -> FunctionTargetResult:
    if context_variables.get("needs_review", False):
        return FunctionTargetResult(target=AgentTarget(reviewer))
    return FunctionTargetResult(target=AgentTarget(coder))

planner.handoffs.set_after_work(
    AfterWork(target=FunctionTarget(route_next))
)
```

| `FunctionTargetResult` field | Type | Description |
|---|---|---|
| `target` | `TransitionTarget` | Required — the next target to transition to |
| `messages` | `list \| str \| None` | Optional messages to broadcast to specific agents |
| `context_variables` | `ContextVariables \| None` | Optional context updates to merge |

Use when: the next agent depends on runtime state that can't be expressed as a static condition.

### Handoffs API

All methods return `self` for chaining:

```python
agent.handoffs \
    .add_llm_condition(OnCondition(target=other, condition="Ready.")) \
    .set_after_work(AfterWork(target=TerminateTarget()))
```

| Method | Description |
|---|---|
| `.add_llm_condition(condition)` | Add an LLM-evaluated transition |
| `.add_context_condition(condition)` | Add a context variable-based transition |
| `.set_after_work(target)` | Set unconditional fallback (replaces existing) |
| `.add_after_work(condition)` | Add conditional fallback |
| `.add(condition)` | Type-dispatched — adds any condition type |
| `.add_many(conditions)` | Add multiple conditions at once |
| `.clear()` | Remove all handoffs |

## ReplyResult

Tool functions can return a `ReplyResult` to control both the response message and which agent speaks next. This is the primary way tools influence routing in group chats.

```python
from autogen.agentchat.group.reply_result import ReplyResult
from autogen.agentchat.group import AgentTarget

def process_order(order_id: Annotated[str, "The order ID"],
                  context_variables: ContextVariables) -> ReplyResult:
    """Process an order and route to the appropriate agent."""
    result = do_processing(order_id)
    context_variables.set("order_status", result["status"])

    if result["status"] == "needs_review":
        return ReplyResult(
            message=f"Order {order_id} needs manual review.",
            target=AgentTarget(reviewer),
            context_variables=context_variables,
        )
    return ReplyResult(
        message=f"Order {order_id} processed successfully.",
        target=AgentTarget(shipping_agent),
    )
```

| Field | Type | Default | Description |
|---|---|---|---|
| `message` | `str` | required | The tool's response text (what the LLM sees) |
| `target` | `TransitionTarget \| None` | `None` | Which agent to hand off to next |
| `context_variables` | `ContextVariables \| None` | `None` | Context updates to merge into the group's shared state |

A `ReplyResult` without a `target` lets the normal handoff/pattern logic decide the next speaker while still updating context variables:

```python
def fetch_data(query: Annotated[str, "The query"]) -> ReplyResult:
    """Fetch data without influencing routing."""
    result = do_fetch(query)
    return ReplyResult(message=result)
```

When `target` is set, `ReplyResult` overrides the normal routing. Without `ReplyResult` at all, a tool returns a plain string and the pattern decides the next speaker.

Note: Only the `message` field is visible to the LLM in conversation history. The `target` and `context_variables` are consumed by the orchestration layer silently.

## ContextVariables

Dict-like shared state accessible by all agents and tool functions in a group chat.

```python
from autogen.agentchat.group.context_variables import ContextVariables

ctx = ContextVariables({"user_name": "Alice", "step": 1})

# Dict-like access
ctx["step"] = 2
name = ctx.get("user_name", "Unknown")
del ctx["step"]
```

| Method | Description |
|---|---|
| `.get(key, default)` | Get value with fallback |
| `.set(key, value)` | Set a value |
| `.remove(key)` | Remove a key, returns `bool` |
| `.update(dict)` | Merge another dict |
| `.contains(key)` | Check existence |
| `.to_dict()` | Export as plain dict |

### Injecting into tool functions

Name a parameter `context_variables: ContextVariables` and AG2 provides it automatically:

```python
def update_step(context_variables: ContextVariables) -> str:
    """Advance to the next workflow step."""
    step = context_variables.get("step", 0) + 1
    context_variables.set("step", step)
    return f"Advanced to step {step}"
```

### Passing to a pattern

```python
ctx = ContextVariables({"project": "my-app"})

pattern = DefaultPattern(
    initial_agent=planner,
    agents=[planner, coder, reviewer],
    context_variables=ctx,
)

result = run_group_chat(pattern=pattern, messages="Start the project.")
result.process()

# Access final context state
print(result.context_variables.to_dict())
```

## Termination

### is_termination_msg

Pass a predicate to `group_manager_args` to stop the chat when a condition is met:

```python
def should_terminate(msg: dict) -> bool:
    content = msg.get("content", "") or ""
    return "DONE" in content

pattern = AutoPattern(
    initial_agent=planner,
    agents=[planner, reviewer, coder],  # ensure each agent has a description set
    group_manager_args={
        "llm_config": llm_config,
        "is_termination_msg": should_terminate,
    },
)
```

### max_rounds

Set `max_rounds` in `run_group_chat()` to cap the number of turns:

```python
result = run_group_chat(pattern=pattern, messages="Go.", max_rounds=5)
```

### Agent-level termination

Use `TerminateTarget()` in handoffs to end the group chat from a specific agent:

```python
from autogen.agentchat.group import AfterWork, TerminateTarget

reviewer.handoffs.set_after_work(AfterWork(target=TerminateTarget()))
```

## initiate_group_chat() (legacy)

Blocking group chat. Returns a tuple instead of `RunResponse`:

```python
from autogen.agentchat import initiate_group_chat

result, context_variables, last_agent = initiate_group_chat(
    pattern=pattern,
    messages="Start planning.",
    max_rounds=10,
)
print(result.summary)
```

Returns `(ChatResult, ContextVariables, Agent)`.

Note: Prefer `run_group_chat()` + `.process()` for new code. It returns a unified `RunResponse` with event streaming support. `initiate_group_chat()` is retained for backward compatibility.

## Common Patterns

### Planning and review loop

```python
planner = ConversableAgent(name="planner", llm_config=llm_config,
    system_message="Create detailed implementation plans.",
    description="Plans implementation steps and breaks down tasks.")
coder = ConversableAgent(name="coder", llm_config=llm_config,
    system_message="Implement the plan in Python.",
    description="Writes Python code based on the plan.")
reviewer = ConversableAgent(name="reviewer", llm_config=llm_config,
    system_message="Review plans and code. Say APPROVED when satisfied.",
    description="Reviews code and plans for correctness.")

def is_approved(msg):
    return "APPROVED" in (msg.get("content", "") or "")

pattern = AutoPattern(
    initial_agent=planner,
    agents=[planner, coder, reviewer],
    group_manager_args={"llm_config": llm_config, "is_termination_msg": is_approved},
)

result = run_group_chat(pattern=pattern, messages="Plan a user auth system.")
result.process()
```

### Explicit handoff chain

```python
from autogen.agentchat.group import OnCondition, AfterWork, TerminateTarget
from autogen.agentchat.group.patterns import DefaultPattern

researcher = ConversableAgent(name="researcher", llm_config=llm_config)
writer = ConversableAgent(name="writer", llm_config=llm_config)
editor = ConversableAgent(name="editor", llm_config=llm_config)

researcher.handoffs.add_llm_condition(
    OnCondition(target=writer, condition="Research is complete.")
)
writer.handoffs.add_llm_condition(
    OnCondition(target=editor, condition="Draft is written.")
)
editor.handoffs.set_after_work(AfterWork(target=TerminateTarget()))

pattern = DefaultPattern(
    initial_agent=researcher,
    agents=[researcher, writer, editor],
)

result = run_group_chat(pattern=pattern, messages="Write about async Python.")
result.process()
```

### Human-in-the-loop

```python
from autogen import UserProxyAgent

human = UserProxyAgent(name="human")

pattern = AutoPattern(
    initial_agent=planner,
    agents=[planner, coder, reviewer],  # ensure each agent has a description set
    user_agent=human,
    group_manager_args={"llm_config": llm_config},
)

result = run_group_chat(pattern=pattern, messages="Build a CLI tool.")
result.process()
```
