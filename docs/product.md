# Rook

Rook is an open-source product for working with a team of agents that retain
context, share knowledge within explicit boundaries, and keep working on a
persistent computer. Rook supplies the team experience, shared memory, agent
identity and communication, and user access. DSH supplies the agent runtime; it
is an implementation stack, not the product's core promise.

This document describes the intended product, not currently available features.

## Who it is for and what it solves

Rook is for people who want personal and project agents to work together over
time. Users should be able to see what their agents remember, why they believe
something, and what changes when they correct it.

The intended value is continuity across tasks and agents: retain the working
environment, share relevant decisions without exposing private context, and turn
useful experience into reusable skills and documents.

## Working with a team

An Account contains shared context and Groups. A Group is a shared context
boundary, with memory and skills that its agents can use together. Each Agent
also has private context; Sessions contain the immediate work and conversation.

For example, an Engineering Group could contain coding, review, and operations
agents. They can work from the same project decisions and conventions while
keeping individual task state separate. This is an illustration of the intended
experience, not a shipped workflow or a fixed set of required roles.

Agents work on one persistent computer initially, retaining files, browser
profiles, checkouts, and installed tools. Their lifetime is separate from the
client, so closing the UI should not stop ongoing work. Disposable sandboxes are
optional isolation for temporary or risky execution.

A parent agent can delegate work to DSH subagents. Separately, the Agent Network
supports discovery, requests, and communication between independent agents.
These are distinct relationships; A2A is a candidate network transport.

## Memory users can inspect and correct

Memory connects entities, claims, and the episodes that support them. Users
should be able to trace a remembered decision to its original conversation or
action, distinguish current decisions from historical ones, and inspect
unresolved conflicts.

Knowledge is stored within Account, Group, Agent, or Session scope. Private
knowledge must not leak through shared search or summaries. Newer statements and
agent guesses do not automatically override approved decisions. Corrections and
deletions must propagate to derived indexes and summaries.

A Knowledge Curator works across permitted contexts to organize claims,
identify conflicts, propose reusable skills, and prepare documents. It is a
visible, configurable agent subject to the same authority and scope rules.
Repeated experience can become a Skill after validation; durable explanations
and research can become Documents. Users can inspect these outputs instead of
relying on opaque memory.

## Initial scope and current implementation

The initial direction starts with one persistent computer and a Web client.
Multiple-computer management is outside the initial UX. Mobile and desktop are
future directions. Rook reuses DSH's runtime capabilities instead of building a
new agent loop, tool framework, or workflow engine. Plugin extensibility is an
optional capability, not the product's defining promise.

Today the repository contains an Expo Web status screen, a Bun/Hono API with
shared contracts, and a local Oxigraph service. The agent runtime and memory are
not connected. Groups, agent collaboration, curation, and persistent background
work are intended capabilities, not implemented features.

The exact first end-to-end release workflow is not yet specified. Open decisions
include the computer provider, permissions and conflict-resolution interactions,
network identity, retention and deletion details, and skill promotion criteria.

## Architecture

See [Architecture](architecture.md) for the system boundaries, memory rules,
technology choices, current implementation, and open questions.
