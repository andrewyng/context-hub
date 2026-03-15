# Multi-Tool Agent

Build an agent with multiple tools, each as a plain Python function.

## Project Structure
```
parent_folder/
    multi_tool_agent/
        __init__.py
        agent.py
        .env
```
```python
# __init__.py
from . import agent
```

## Define Multiple Tools

Each tool must have type hints and a clear docstring — ADK passes both to the LLM.
```python
import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent

def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city."""
    if city.lower() == "new york":
        return {"status": "success", "report": "Sunny, 25°C."}
    return {"status": "error", "error_message": f"No weather data for '{city}'."}

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city."""
    if city.lower() == "new york":
        tz = ZoneInfo("America/New_York")
        now = datetime.datetime.now(tz)
        return {"status": "success", "report": f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S %Z')}"}
    return {"status": "error", "error_message": f"No timezone data for {city}."}

root_agent = Agent(
    name="weather_time_agent",
    model="gemini-2.0-flash",
    description="Answers questions about time and weather in a city.",
    instruction="Use 'get_weather' and 'get_current_time' tools to answer user questions.",
    tools=[get_weather, get_current_time],
)
```

## Run the Agent

Run from the **parent** directory of `multi_tool_agent/`:
```bash
adk web                    # Dev UI at http://localhost:8000
adk run multi_tool_agent   # CLI mode
adk api_server multi_tool_agent --port 8080  # FastAPI server at POST /run
```

## Important Notes

- Return a `dict` with `"status": "success"` or `"status": "error"` for consistent tool output.
- The LLM decides which tool to call based on docstrings — write them precisely.
- Run `adk web` and `adk run` from the **parent folder** of the agent directory.
- `adk web` is for development only, not production.

## Official Source URL

- `https://google.github.io/adk-docs/get-started/quickstart/`