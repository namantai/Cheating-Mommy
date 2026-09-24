# AGENTS.md

This repository contains **Arch AI Overlay**, a minimal desktop AI overlay for Arch Linux.

## Before making changes

Always read, in this order:

1. `PROJECT_SPEC.md` — product requirements and scope.
2. `ARCHITECTURE.md` — technical boundaries and design.
3. `ROADMAP.md` — implementation phases and allowed work for each phase.

Do not invent product behavior that is not documented.

## Core rules

- Implement only the explicitly requested roadmap phase.
- Do not implement future phases early.
- Do not change architecture without an explicit instruction.
- Keep changes small and reviewable.
- Prefer simple solutions over abstractions that are not yet needed.
- Do not add dependencies without a clear reason.
- Keep Linux as the primary platform.
- Primary v0.1 window backend is X11/XWayland.
- Keep the renderer isolated from Node.js and privileged APIs.
- Use typed IPC between renderer and main process.
- Never expose API keys or secrets to the renderer unless strictly required.
- Screenshot capture and AI provider code must remain separate modules.
- Do not save screenshots permanently unless the product specification is changed.
- Do not add microphone, audio recording, transcription, session recording, chat history, or continuous screen monitoring.

## Screen-capture policy

Do not implement functionality intended to bypass, evade, or become invisible to third-party proctoring, monitoring, recording, or screen-capture software.

It is allowed to hide the overlay before **this application performs its own screenshot capture** so that the overlay does not appear in its own screenshot.

If privacy during presentation or recording is needed, implement it by hiding the overlay, not by bypassing third-party capture.

## Quality gates

Before finishing any coding task, run all available validation commands relevant to the current phase, including:

- type checking
- linting
- tests
- production build

If a validation command fails, fix it before finishing unless the failure is unrelated and explicitly documented.

At the end of each task, report:

- files changed
- behavior implemented
- tests/commands run
- known limitations
- anything that differs from the specification
