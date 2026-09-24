# ARCHITECTURE.md

# Arch AI Overlay — Architecture

## 1. Architecture goals

The architecture should stay deliberately small.

Primary goals:

- clear Electron security boundaries
- minimal coupling
- Linux-first implementation
- replaceable screenshot implementation
- replaceable AI provider
- testable services
- no business logic inside React components
- no provider-specific logic in window-management code

Avoid premature complexity.

---

## 2. Technology stack

### Desktop shell

- Electron

### Language

- TypeScript
- strict TypeScript configuration

### Renderer

- React
- Vite

### State

Use React state for simple local state.

Introduce a state-management library only if the application actually needs one.

### Validation

Use schema validation where data crosses trust boundaries and it improves reliability.

### Testing

- Vitest for unit tests
- add integration/e2e tooling only when justified by a later phase

### Packaging

Use a conventional Electron packaging solution suitable for Linux.

Do not couple application architecture to one packaging tool.

---

## 3. Process boundaries

The application has three main code boundaries:

```text
Renderer
   |
   | typed preload API
   v
Preload
   |
   | typed IPC
   v
Electron Main
```

### Renderer responsibilities

Renderer handles:

- overlay presentation
- settings presentation
- user interaction
- rendering streamed AI output

Renderer must not directly:

- access Node.js filesystem APIs
- spawn processes
- access DBus
- capture the screen
- read secrets from disk
- call privileged Electron APIs
- own AI provider credentials

### Preload responsibilities

Preload exposes the smallest possible typed API required by the renderer.

It must not expose generic IPC primitives such as unrestricted `send`, `invoke`, or arbitrary channels.

### Main responsibilities

Electron Main owns:

- application lifecycle
- window management
- tray
- global shortcuts
- screenshot capture
- clipboard access
- settings persistence
- secrets
- AI provider lifecycle
- orchestration workflows

---

## 4. Electron security baseline

Use:

```text
contextIsolation = true
nodeIntegration = false
```

Use sandboxing where compatible with the required Electron architecture.

Do not weaken renderer security merely for convenience.

Do not enable remote module style APIs.

All IPC channels must be explicitly defined.

---

## 5. Proposed source layout

```text
src/
├── main/
│   ├── app/
│   │   └── app-controller.ts
│   │
│   ├── window/
│   │   └── overlay-window.ts
│   │
│   ├── tray/
│   │   └── tray-manager.ts
│   │
│   ├── hotkeys/
│   │   └── hotkey-manager.ts
│   │
│   ├── capture/
│   │   ├── screenshot-service.ts
│   │   └── portal-screenshot-service.ts
│   │
│   ├── clipboard/
│   │   └── clipboard-service.ts
│   │
│   ├── ai/
│   │   ├── ai-provider.ts
│   │   ├── ai-service.ts
│   │   └── providers/
│   │       └── gemini-provider.ts
│   │
│   ├── settings/
│   │   └── settings-service.ts
│   │
│   ├── secrets/
│   │   └── secrets-service.ts
│   │
│   └── ipc/
│       └── handlers.ts
│
├── preload/
│   └── index.ts
│
├── renderer/
│   ├── app/
│   ├── overlay/
│   ├── settings/
│   └── components/
│
└── shared/
    ├── ipc/
    └── types/
```

This is a target structure, not a requirement to create every file during bootstrap.

Create modules only when their roadmap phase begins.

---

## 6. Core services

## WindowManager / OverlayWindow

Responsibilities:

- create overlay BrowserWindow
- show/hide overlay
- maintain supported overlay positioning
- manage always-on-top behavior
- expose state changes needed by workflows

It must not:

- call Gemini
- capture screenshots
- inspect clipboard contents
- contain workflow-specific AI prompts

---

## HotkeyManager

Responsibilities:

- register application global shortcuts
- unregister them on shutdown
- detect registration failure
- emit high-level application actions

Suggested actions:

```text
ANALYZE_SCREEN
ANALYZE_CLIPBOARD
HIDE_OVERLAY
```

HotkeyManager must not perform screenshot or AI work itself.

---

## ScreenshotService

Interface responsibility:

Return screenshot image data from an explicit capture request.

Preferred Linux implementation:

`PortalScreenshotService`

Preferred platform API:

`org.freedesktop.portal.Screenshot`

Conceptual interface:

```ts
interface ScreenshotService {
  capture(): Promise<CapturedScreenshot>;
}
```

The interface should not depend on Gemini or renderer code.

---

## ClipboardService

Responsibilities:

- read existing text clipboard
- write response only after an explicit Copy action

It must not synthesize keyboard shortcuts in third-party applications.

---

## AIProvider

Provider abstraction should conceptually support:

```ts
interface AIProvider {
  analyze(request: AIRequest): AsyncIterable<AIStreamEvent>;
  cancel?(requestId: string): Promise<void> | void;
}
```

Exact types may evolve during the AI abstraction phase.

Requirements:

- text input
- image input
- streaming output where supported
- errors mapped to application-level errors
- cancellation design
- no Electron window dependencies

---

## AIService

Responsibilities:

- hold the active provider
- validate requests
- coordinate provider calls
- expose provider-independent streaming events
- prevent provider implementation details from leaking outward

It must not manipulate BrowserWindow directly.

---

## SettingsService

Responsibilities:

- load settings
- validate settings
- persist settings
- provide defaults
- migrate settings if schema changes later

Settings types must live in shared typed definitions where appropriate.

---

## SecretsService

Responsibilities:

- store/retrieve sensitive credentials
- keep secrets out of renderer state
- provide provider credentials only to privileged code

Prefer OS-backed secure storage when practical.

Do not store raw API keys in committed files.

---

## 7. Application orchestration

A high-level controller should coordinate workflows.

Example screen-analysis flow:

```text
HotkeyManager
      |
      v
AppController
      |
      +--> OverlayWindow.hide()
      |
      +--> ScreenshotService.capture()
      |
      +--> OverlayWindow.showThinking()
      |
      +--> AIService.analyze(image)
      |
      +--> stream events
      |
      +--> renderer
```

No single service should own the entire application.

---

## 8. Screenshot workflow

Required order:

```text
request
  |
  v
hide overlay
  |
  v
confirm/wait until hidden
  |
  v
capture screenshot
  |
  v
obtain image bytes / safe temporary reference
  |
  v
show THINKING state
  |
  v
send image to AIService
  |
  v
remove temporary screenshot data
```

Screenshot cleanup must also run on errors.

Do not permanently save screenshots in v0.1.

---

## 9. Clipboard workflow

```text
hotkey
  |
  v
ClipboardService.readText()
  |
  +--> empty -> user-facing error
  |
  v
AIService.analyze(text)
  |
  v
stream response
  |
  v
overlay
```

Do not modify the clipboard during analysis.

---

## 10. Renderer state model

Renderer should support a small UI state model:

```text
HIDDEN
THINKING
ANSWER
ERROR
```

Suggested shared data:

```text
OverlayState
- status
- streamedText
- errorMessage
- requestId
```

Keep renderer logic presentation-focused.

---

## 11. IPC design

IPC must use explicit typed channels.

Examples:

Main -> Renderer:

```text
overlay:set-state
ai:stream-event
settings:changed
```

Renderer -> Main:

```text
overlay:close
response:copy
settings:get
settings:update
```

Exact naming may change, but all channels must be centralized and typed.

Do not allow arbitrary channel names from renderer.

---

## 12. Error model

Create application-level error categories instead of leaking raw provider or DBus errors.

Suggested categories:

```text
HOTKEY_REGISTRATION_FAILED
SCREENSHOT_CANCELLED
SCREENSHOT_UNAVAILABLE
SCREENSHOT_FAILED
EMPTY_CLIPBOARD
MISSING_API_KEY
AI_AUTH_FAILED
AI_TIMEOUT
AI_NETWORK_ERROR
AI_PROVIDER_ERROR
```

Errors should carry:

- stable application code
- user-facing message
- optional developer detail

Do not show developer detail directly in normal UI.

---

## 13. Concurrency policy

v0.1 should allow only one active AI analysis request at a time.

When a new analysis request arrives while another is active, choose and document one behavior during implementation:

- reject the second request
- or cancel the current request and start the new one

Do not allow overlapping screenshot-analysis workflows accidentally.

---

## 14. Platform strategy

Primary target:

```text
Arch Linux
X11 / XWayland
```

Screenshot capture should prefer XDG Desktop Portal to reduce coupling to desktop-environment-specific screenshot tools.

Do not make `grim`, `spectacle`, `gnome-screenshot`, or `scrot` mandatory core dependencies.

Native Wayland-specific overlay behavior is deferred.

---

## 15. Screen-capture boundary

The application may hide its own overlay before its own screenshot.

It must not contain code intended to evade third-party proctoring, recording, monitoring, remote-control, or screen-sharing capture.

Do not create an abstraction whose purpose is third-party capture evasion.

---

## 16. Testing strategy

Each service should be testable without requiring the entire desktop app.

Use dependency injection where it makes testing simpler, but avoid large frameworks.

Minimum useful tests over time:

- WindowManager state operations
- HotkeyManager action mapping
- ScreenshotService error mapping
- AIService streaming lifecycle
- AI cancellation behavior
- Settings validation
- clipboard empty-text handling
- application orchestration success/error paths

Use fakes/mocks for external providers and platform APIs.

---

## 17. Dependency policy

Before adding a dependency, ask:

1. Is this needed in the current roadmap phase?
2. Does the platform/runtime already provide the functionality?
3. Is the dependency maintained?
4. Does it significantly simplify correct implementation?
5. Does it increase attack surface or packaging complexity?

Do not add large UI frameworks for a tiny overlay unless a concrete need appears.

---

## 18. Architecture change policy

If implementation reveals that this architecture is wrong:

1. stop
2. explain the conflict
3. update `ARCHITECTURE.md`
4. review the change
5. only then refactor implementation

The code should follow the documentation, not silently redefine it.
