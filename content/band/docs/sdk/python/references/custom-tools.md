# Band SDK - Custom Tools Reference

Custom tools let agents call your own functions alongside the built-in platform tools. Each adapter accepts custom tools in its framework's native format.

## Python: Pydantic Model + Callable

Used by: `AnthropicAdapter`, `CrewAIAdapter`, `GeminiAdapter`, `GoogleADKAdapter`, `ParlantAdapter`, `ClaudeSDKAdapter`

Define a Pydantic model for the input schema and a callable for the handler. The tool name is derived from the model class name (with "Input" suffix stripped, lowercased).

```python
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    """Get current weather for a location."""
    city: str = Field(description="City name")
    units: str = Field(default="fahrenheit", description="Temperature units")

def get_weather(args: WeatherInput) -> str:
    return f"72F and sunny in {args.city}"

# Async handlers also work
async def get_weather_async(args: WeatherInput) -> str:
    return f"72F and sunny in {args.city}"

adapter = AnthropicAdapter(
    anthropic_model="claude-sonnet-4-6",
    additional_tools=[(WeatherInput, get_weather)],
)
```

The model's docstring becomes the tool description. Field descriptions become parameter descriptions. The tool name for this example: `weather`.

## Python: LangChain @tool Decorator

Used by: `LangGraphAdapter`

```python
from langchain_core.tools import tool

@tool
def search_database(query: str, limit: int = 10) -> str:
    """Search the internal database for matching records."""
    return f"Found {limit} results for: {query}"

@tool
def calculate(operation: str, a: float, b: float) -> str:
    """Perform arithmetic: add, subtract, multiply, divide."""
    ops = {"add": lambda x, y: x + y, "subtract": lambda x, y: x - y,
           "multiply": lambda x, y: x * y, "divide": lambda x, y: x / y}
    return str(ops[operation](a, b))

adapter = LangGraphAdapter(
    llm=ChatOpenAI(model="gpt-4o"),
    additional_tools=[search_database, calculate],
)
```

## Python: Pydantic AI RunContext Functions

Used by: `PydanticAIAdapter`

Tools receive `RunContext[AgentToolsProtocol]` as the first argument, giving access to platform tools.

```python
from pydantic_ai import RunContext
from thenvoi.core.protocols import AgentToolsProtocol

async def lookup_user(ctx: RunContext[AgentToolsProtocol], user_id: str) -> str:
    """Look up user details by ID."""
    # ctx.deps gives access to platform tools
    return f"User {user_id}: John Doe"

async def delegate_to_specialist(ctx: RunContext[AgentToolsProtocol], task: str) -> str:
    """Delegate a task to a specialist agent."""
    peers = await ctx.deps.lookup_peers()
    specialist = next((p for p in peers.data if "specialist" in (p.name or "")), None)
    if specialist:
        await ctx.deps.add_participant(specialist.name)
        await ctx.deps.send_message(task, mentions=[f"@{specialist.handle}"])
        return f"Delegated to {specialist.name}"
    return "No specialist found"

adapter = PydanticAIAdapter(
    model="openai:gpt-4o",
    additional_tools=[lookup_user, delegate_to_specialist],
)
```

## Python: Codex Custom Tools

Used by: `CodexAdapter`

Codex uses the same Pydantic model + callable format:

```python
from pydantic import BaseModel, Field

class DeployInput(BaseModel):
    """Deploy the application to a target environment."""
    environment: str = Field(description="Target: staging or production")
    version: str = Field(description="Version tag to deploy")

def deploy(args: DeployInput) -> str:
    return f"Deployed {args.version} to {args.environment}"

adapter = CodexAdapter(
    model="gpt-5.3-codex",
    additional_tools=[(DeployInput, deploy)],
)
```

## TypeScript: Zod Schema + Handler

Used by: `CodexAdapter`, `OpenAIAdapter`, `AnthropicAdapter`, `GeminiAdapter`, `ClaudeSDKAdapter`

```typescript
import { z } from "zod";

const customTools = [
  {
    name: "search_database",
    description: "Search the internal database for matching records.",
    schema: z.object({
      query: z.string().describe("Search query"),
      limit: z.number().optional().default(10).describe("Max results"),
    }),
    handler: async ({ query, limit }) => {
      return `Found ${limit} results for: ${query}`;
    },
  },
  {
    name: "deploy",
    description: "Deploy the application.",
    schema: z.object({
      environment: z.enum(["staging", "production"]),
      version: z.string(),
    }),
    handler: async ({ environment, version }) => {
      return `Deployed ${version} to ${environment}`;
    },
  },
];

const adapter = new CodexAdapter({
  config: { model: "gpt-5.3-codex" },
  customTools,
});
```

## TypeScript: LangGraph Tools

Used by: `LangGraphAdapter`

LangGraph in TypeScript uses LangChain-style tool definitions:

```typescript
import { LangGraphAdapter } from "@thenvoi/sdk";

const adapter = new LangGraphAdapter({
  graphFactory: (tools) => buildMyGraph(tools),
  additionalTools: [],        // LangChain tool instances
  systemPrompt: "You are a helpful assistant.",
});
```

## Tool Errors

When a custom tool fails, the SDK wraps the error:

- **Python:** `CustomToolValidationError` (bad args), `CustomToolExecutionError` (handler exception)
- **TypeScript:** `CustomToolValidationError` (Zod validation), `CustomToolExecutionError` (handler throws)

The error message is returned to the LLM so it can retry or report the failure.

## Accessing Tool Schemas

Retrieve registered tool schemas in LLM-native formats:

```typescript
// TypeScript
const schemas = tools.getOpenAIToolSchemas();   // OpenAI format
const schemas = tools.getAnthropicToolSchemas(); // Anthropic format
```

```python
# Python - schemas are generated automatically from Pydantic models
# and injected into the LLM call by the adapter
```

## Best Practices

- Keep tool descriptions concise and action-oriented
- Use `Field(description=...)` (Python) or `.describe(...)` (Zod) for every parameter
- Return strings from handlers (LLMs work with text)
- Raise exceptions with clear messages on failure
- Avoid side effects in tool handlers when possible
