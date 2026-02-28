---
title: Architecture
description: Overview of Wuhu's package structure and how the pieces fit together.
---

Wuhu is split into several Swift packages, each with a focused responsibility.
They compose together to form the full agent system.

## Package overview

### wuhu-ai

**Unified LLM client library (PiAI).**

Provides a single interface for talking to multiple LLM providers (Anthropic,
OpenAI, and others). Handles streaming, tool-use protocols, and message
formatting so the rest of the system doesn't need to care which provider is
active.

- Multi-provider support with a common API
- Streaming responses
- Tool-call parsing and dispatch

### wuhu-core

**Agent runtime, server, runner, and CLI.**

The heart of the system. Contains the agent loop that receives a task,
decides which tools to call, executes them, and feeds results back to the LLM.
Also includes the local server that the native apps connect to and a CLI for
headless use.

- Agent loop and tool execution
- Local HTTP/WebSocket server
- Session management and persistence
- CLI interface

### wuhu-workspace-engine

**Workspace scanning and querying.**

Responsible for understanding the structure of a project on disk. Scans
directories, indexes file metadata, and provides fast queries so the agent can
locate relevant files without reading everything.

- Directory scanning and file indexing
- Gitignore-aware filtering
- Structured queries for the agent

### wuhu-app

**Native apps for macOS and iOS.**

The SwiftUI front-end. Connects to the local server from `wuhu-core` and
provides a rich UI for managing workspaces, viewing agent sessions, and
reviewing changes.

- macOS app with full workspace and terminal integration
- iOS companion app for mobile review and steering

## How they fit together

```
┌─────────────┐
│   wuhu-app  │  SwiftUI front-end (macOS / iOS)
└──────┬──────┘
       │ connects to
┌──────▼──────┐
│  wuhu-core  │  agent runtime + local server
├─────┬───────┤
│     │       │
│  ┌──▼───┐ ┌▼──────────────────┐
│  │wuhu- │ │wuhu-workspace-    │
│  │ai    │ │engine             │
│  └──────┘ └───────────────────┘
│  LLM calls   workspace queries
└─────────────────────────────────┘
```

## API documentation

Each package publishes its own API docs via DocC. These are hosted separately:

- [`wuhu-ai` API Reference →](/docs/wuhu-ai/)
- [`wuhu-core` API Reference →](/docs/wuhu-core/)

## Source code

All packages are open source under the [wuhu-labs](https://github.com/wuhu-labs)
GitHub organization.
