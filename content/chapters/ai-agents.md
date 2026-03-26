# Chapter 5: AI Agents

## What is an AI Agent?

An AI agent is a system where an LLM can take actions in the world — not just generate text, but call tools, access APIs, run code, browse the web, and interact with external systems. The LLM acts as a reasoning engine that decides what actions to take in pursuit of a goal.

**Key insight**: LLMs are no longer just text generators — they're the "brain" of autonomous systems.

## The Agent Loop

```
User Goal
    ↓
[LLM: Plan] → What actions are needed?
    ↓
[Tool Selection] → Which tool to use?
    ↓
[Tool Execution] → Run the tool
    ↓
[Observation] → What was returned?
    ↓
[LLM: Reflect] → Is goal achieved? → No → Loop
    ↓ Yes
[Final Answer]
```

## Tool Calling (Function Calling)

Modern LLMs can select and call functions from a provided list. The model outputs structured JSON describing which function to call and with what arguments.

```python
from groq import Groq

client = Groq()

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
        }
    }
}]

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "What's the weather in Karachi?"}],
    tools=tools,
    tool_choice="auto"
)

# Model returns: {"name": "get_weather", "arguments": {"city": "Karachi"}}
```

## Agent Architectures

### ReAct (Reasoning + Acting)
The model interleaves reasoning traces with actions:
```
Thought: I need to find the population of Pakistan
Action: search("Pakistan population 2024")
Observation: Pakistan population is approximately 231 million
Thought: Now I can answer the question
Answer: Pakistan's population is approximately 231 million
```

### Plan-and-Execute
Separate planning phase from execution:
1. **Planner**: Break goal into sub-tasks
2. **Executor**: Execute each sub-task with appropriate tools
3. **Reviewer**: Check if goal is met, re-plan if needed

### Multi-Agent Systems
Multiple specialized agents collaborate:
```
User → Orchestrator Agent
           ↓
    ┌──────┼──────┐
Research  Code   Write
 Agent   Agent   Agent
    └──────┼──────┘
           ↓
     Final Output
```

## Memory in Agents

| Type | Description | Example |
|------|-------------|---------|
| In-context | Current conversation | Chat history |
| Episodic | Specific past events | "Last time user asked about X" |
| Semantic | General knowledge | Vector DB embeddings |
| Procedural | How to do things | Skills/tools |

## Building a Simple Agent

```python
import json
from groq import Groq

client = Groq()

def run_agent(user_goal: str, tools: list, tool_functions: dict):
    messages = [{"role": "user", "content": user_goal}]

    while True:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            tools=tools,
        )
        msg = response.choices[0].message

        if not msg.tool_calls:
            return msg.content  # Agent finished

        # Execute tools
        for tc in msg.tool_calls:
            fn = tool_functions[tc.function.name]
            args = json.loads(tc.function.arguments)
            result = fn(**args)

            messages.append({"role": "assistant", "tool_calls": [tc]})
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(result)})
```

## Agent Safety and Reliability

Key challenges:
- **Hallucinated tool calls**: Model invents tool arguments that don't exist
- **Infinite loops**: Agent keeps calling tools without progress
- **Permission escalation**: Agent takes actions beyond its scope
- **Cost explosion**: Unconstrained loops burn tokens

Mitigations:
- Set maximum iteration limits
- Validate tool arguments before execution
- Implement human-in-the-loop for high-stakes actions
- Log and monitor all tool calls

## Real-world Agent Applications

- **Customer support**: Retrieve orders, initiate refunds, escalate tickets
- **Code agents**: Write, test, debug, and deploy code
- **Research agents**: Search web, synthesize papers, generate reports
- **Personal assistants**: Manage calendar, send emails, book meetings
