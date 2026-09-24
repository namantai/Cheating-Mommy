# ROADMAP.md

# Arch AI Overlay — v0.1 Roadmap

## Development rule

Implement exactly one phase at a time.

After each phase:

1. run validation
2. review the diff
3. manually test relevant behavior
4. commit
5. start the next phase

Do not combine multiple phases in one Codex task unless explicitly requested.

---

# Phase 0 — Documentation foundation

Status: initial repository foundation.

Create and review:

- `AGENTS.md`
- `PROJECT_SPEC.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `README.md`

No application source code.

Suggested commit:

```text
docs: define initial product architecture
```

---

# Phase 1 — Project bootstrap

Goal:

Create the minimum Electron + React + TypeScript application shell.

Requirements:

- Electron
- React
- TypeScript
- Vite
- strict TypeScript
- linting
- formatting
- Vitest
- Main / Preload / Renderer boundaries
- safe Electron baseline
- simple placeholder renderer

Do not implement:

- real overlay behavior
- screenshot capture
- global shortcuts
- AI
- clipboard workflow
- settings UI

Validation:

- typecheck
- lint
- tests
- production build

Suggested commit:

```text
chore: bootstrap desktop application
```

---

# Phase 2 — Overlay window foundation

Goal:

Create the compact application overlay window.

Requirements:

- frameless
- transparent
- approximately 400 px wide
- compact
- hidden by default
- always-on-top on the supported backend
- programmatic show/hide
- clean WindowManager boundary

Primary target:

- X11 / XWayland

Do not implement:

- screenshots
- AI
- clipboard
- global analysis shortcuts

Suggested commit:

```text
feat: add overlay window foundation
```

---

# Phase 3 — Minimal overlay UI

Goal:

Implement the renderer UI states.

Required states:

- HIDDEN
- THINKING
- ANSWER
- ERROR

ANSWER must support:

- Markdown
- lists
- inline code
- code blocks
- internal scrolling

Controls:

- Copy
- Close

No:

- sidebar
- dashboard
- history
- microphone controls
- profiles

Suggested commit:

```text
feat: implement compact overlay interface
```

---

# Phase 4 — Global shortcut infrastructure

Goal:

Introduce `HotkeyManager`.

Default shortcuts:

```text
Ctrl+Shift+Space -> analyze screen
Ctrl+Shift+V     -> analyze clipboard
```

Responsibilities:

- register shortcuts
- unregister on shutdown
- map shortcuts to high-level actions
- report registration failures

Do not implement screenshot or AI behavior yet.

Suggested commit:

```text
feat: add global hotkey manager
```

---

# Phase 5 — Screenshot service

Goal:

Implement screenshot capture behind `ScreenshotService`.

Preferred Linux implementation:

`org.freedesktop.portal.Screenshot`

Required workflow:

1. hide overlay
2. wait until hidden
3. request screenshot
4. obtain screenshot data
5. clean temporary resources
6. restore appropriate UI flow

Handle:

- user cancellation
- unavailable portal
- failed screenshot
- invalid returned resource

Do not integrate AI yet.

Manual gate:

Verify on the actual target desktop that the application's own overlay is absent from screenshots taken by the application.

Suggested commit:

```text
feat: implement portal screenshot capture
```

Do not continue to Phase 6 until screenshot behavior is stable.

---

# Phase 6 — AI abstraction

Goal:

Implement provider-independent AI interfaces.

Create:

- AIProvider
- AIService
- request/response types
- streaming event types
- FakeAIProvider for tests

Support conceptually:

- text input
- image input
- streaming text output
- cancellation
- provider-independent errors

No real AI provider yet.

Suggested commit:

```text
feat: add AI provider abstraction
```

---

# Phase 7 — Gemini provider

Goal:

Implement Gemini behind the existing AIProvider abstraction.

Requirements:

- text input
- image input
- streamed output where supported
- configurable model
- API key supplied only from privileged code
- cancellation
- timeout handling
- useful provider error mapping

Use current official Gemini documentation during implementation.

Do not leak Gemini-specific types into renderer or WindowManager.

Suggested commit:

```text
feat: add Gemini AI provider
```

---

# Phase 8 — Screen analysis workflow

Goal:

Connect the existing pieces.

Flow:

```text
screen hotkey
  -> hide overlay
  -> screenshot
  -> THINKING
  -> AIService
  -> stream answer
  -> ANSWER
```

Requirements:

- one active request at a time
- screenshot cleanup on success and failure
- useful user-facing errors
- no screenshot persistence

Default behavior prompt should follow `PROJECT_SPEC.md`.

Suggested commit:

```text
feat: connect screenshot analysis workflow
```

This is the first complete screen-analysis MVP milestone.

---

# Phase 9 — Clipboard analysis workflow

Goal:

Connect clipboard analysis.

Flow:

```text
clipboard hotkey
  -> read existing clipboard text
  -> validate
  -> THINKING
  -> AIService
  -> ANSWER
```

Requirements:

- do not synthesize Ctrl+C
- do not modify clipboard during analysis
- Copy button may write response only after explicit click
- handle empty clipboard cleanly

Suggested commit:

```text
feat: add clipboard analysis workflow
```

---

# Phase 10 — Settings

Goal:

Add minimal persistent settings.

Required settings:

AI:
- provider
- model
- API key

Overlay:
- opacity
- font size

Shortcuts:
- screen analysis shortcut
- clipboard analysis shortcut

Startup:
- start on login

Requirements:

- local persistence
- schema validation
- secrets stay out of renderer storage
- changing shortcuts safely re-registers them

Suggested commit:

```text
feat: add application settings
```

---

# Phase 11 — Tray integration

Goal:

Add a simple system tray.

Required menu:

- Analyze Screen
- Settings
- Quit

Behavior:

- hiding/closing overlay does not terminate app
- Quit explicitly shuts the app down

Suggested commit:

```text
feat: add tray integration
```

---

# Phase 12 — Arch Linux packaging

Goal:

Create a usable distributable build.

Requirements:

- production Linux build
- application icon
- `.desktop` integration
- stable application identifier
- documented runtime dependencies
- documented development setup
- clean-build verification

Do not add Flatpak unless roadmap is explicitly changed.

Suggested commit:

```text
build: add Arch Linux packaging
```

---

# Phase 13 — v0.1 stabilization

Goal:

No new features.

Tasks:

- fix bugs
- review security boundaries
- test on target Arch environment
- test XWayland behavior
- test portal screenshot cancellation
- test missing API key
- test offline/network failure
- test long Markdown answers
- test duplicate hotkey request behavior
- review package/install docs
- verify screenshots are not persisted

Release target:

```text
v0.1.0
```

---

# Post-v0.1 ideas

These are not approved features.

Possible future exploration:

- native Wayland overlay behavior
- region/window screenshot modes
- additional AI providers
- local models
- configurable prompt templates
- presentation mode that hides the overlay
- OCR preprocessing
- richer keyboard customization

Do not implement any item from this section without first moving it into an approved roadmap phase.
