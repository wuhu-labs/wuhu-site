---
title: Getting Started
description: Install Wuhu and run your first coding session.
---

Wuhu is a native macOS app. There's nothing to `brew install`, no containers to
pull, and no runtimes to configure. Download the app, open it, and you're ready
to go.

## Install

1. [Download Wuhu](/download/) for macOS
2. Unzip and drag **Wuhu.app** to your Applications folder
3. Launch Wuhu

On first launch, macOS may show a Gatekeeper prompt because the app was
downloaded from the internet. Click **Open** to continue — the app is
notarized by Apple.

## Configure an LLM provider

Wuhu needs access to at least one LLM provider to power the coding agent. Open
**Settings** and add your API key for one of the supported providers:

- **Anthropic** (Claude)
- **OpenAI**

You can add multiple providers and switch between them at any time.

## Open a workspace

Point Wuhu at a project directory. The workspace engine will scan the
directory structure and build context so the agent can navigate your codebase
effectively.

1. Click **Open Workspace** (or use ⌘O)
2. Select a project folder
3. Wait for the initial scan to complete

## Start a session

With a workspace open, create a new coding session:

1. Describe what you want to accomplish in plain language
2. The agent will read relevant files, propose changes, and execute tool calls
3. Review the agent's work in real time — you can steer, approve, or reject
   changes as they happen

## What's next

- Learn about the [architecture](/guides/architecture/) behind Wuhu
- Check the [API Reference](/docs/wuhu-ai/) for the LLM client library
