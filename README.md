# Arch AI Overlay

A minimal AI screen-analysis overlay for Arch Linux.

## Status

Early design / implementation phase.

The repository architecture and product scope are defined by:

- `PROJECT_SPEC.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `AGENTS.md`

Read those documents before implementing features.

## Product idea

Arch AI Overlay stays hidden during normal use.

Press a global shortcut:

```text
Ctrl+Shift+Space
```

The app:

1. hides its own overlay
2. captures the current screen
3. sends the screenshot to an AI provider
4. shows a compact streamed answer in a small overlay

A second shortcut:

```text
Ctrl+Shift+V
```

analyzes text that is already present in the user's clipboard.

## v0.1 principles

- Arch Linux first
- X11/XWayland primary overlay backend
- compact UI
- no microphone
- no audio capture
- no transcription
- no continuous screen capture
- no chat/session history
- no screenshot persistence
- typed Electron IPC
- isolated renderer
- replaceable AI provider
- replaceable screenshot implementation

## Security and capture policy

The application may hide its own overlay before taking its own screenshot.

The project does not implement functionality intended to bypass or evade third-party proctoring, monitoring, recording, screen-sharing, or screen-capture systems.

## Planned stack

- Electron
- TypeScript
- React
- Vite
- Vitest
- XDG Desktop Portal for screenshot capture
- Gemini as the first AI provider

See `ROADMAP.md` for the implementation order.

## Development workflow

Work one roadmap phase at a time.

Typical cycle:

```text
read docs
  -> implement one phase
  -> run validation
  -> review diff
  -> manual test
  -> commit
  -> next phase
```

Do not ask an AI coding agent to implement the entire roadmap in one task.

## Documentation priority

If documents conflict, use this order:

1. `PROJECT_SPEC.md`
2. `ARCHITECTURE.md`
3. `ROADMAP.md`
4. `AGENTS.md`
5. `README.md`

If implementation requires changing product behavior or architecture, update the relevant documentation first.
