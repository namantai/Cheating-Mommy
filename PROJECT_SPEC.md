# PROJECT_SPEC.md

# Arch AI Overlay — Product Specification

## 1. Product summary

Arch AI Overlay is a small desktop AI utility for Arch Linux.

The application normally stays hidden. The user presses a global keyboard shortcut, the application captures the current screen, sends the screenshot to an AI provider, and displays a concise answer in a compact always-on-top overlay.

A second shortcut sends existing clipboard text to the AI.

The product is intentionally small. It is not a full chat application, meeting assistant, transcription tool, recorder, or dashboard.

---

## 2. Primary user flow

### Screen analysis

1. User is working in another application.
2. User presses the screen-analysis shortcut.
3. Arch AI Overlay hides its own overlay if visible.
4. The application captures the current screen.
5. The captured image is sent to the configured AI provider.
6. The overlay appears in a compact `THINKING` state.
7. The AI response is streamed into the overlay.
8. The overlay transitions to the `ANSWER` state.
9. User may copy the response or hide the overlay.

Default shortcut:

`Ctrl+Shift+Space`

### Clipboard analysis

1. User copies text in another application.
2. User presses the clipboard-analysis shortcut.
3. Arch AI Overlay reads the current text clipboard.
4. The text is sent to the configured AI provider.
5. The overlay displays the streamed answer.

Default shortcut:

`Ctrl+Shift+V`

The application must not synthesize `Ctrl+C` in other applications.

---

## 3. v0.1 goals

Version 0.1 must provide:

- Arch Linux support.
- Electron desktop application.
- React + TypeScript renderer.
- Small frameless transparent overlay.
- Always-on-top behavior on the primary supported backend.
- Hidden-by-default application behavior.
- Global screen-analysis shortcut.
- Global clipboard-analysis shortcut.
- Screen capture through a Linux screenshot abstraction.
- Preferred Linux screenshot implementation based on XDG Desktop Portal.
- AI provider abstraction.
- Gemini provider as the first real provider.
- Streaming AI responses where supported.
- Markdown rendering for AI answers.
- Copy-response action.
- Minimal settings UI.
- Local settings persistence.
- Secure handling of API credentials.
- Tray integration.
- Arch Linux packaging/documentation.

---

## 4. Explicit non-goals for v0.1

Do not implement:

- microphone capture
- system-audio capture
- audio recording
- speech-to-text
- transcription
- continuous screen capture
- background screen monitoring
- OCR pipeline
- local LLM
- Whisper
- meeting mode
- interview mode
- profiles
- session recording
- screenshot history
- chat history
- cloud accounts
- synchronization
- plugins
- Windows support
- macOS support
- mobile clients
- browser extensions

These features require a product-spec change before implementation.

---

## 5. Overlay UX

The overlay should feel like a small desktop utility rather than a full application window.

### Approximate dimensions

Target width:

`380–420 px`

Target maximum visible content height:

`280–350 px`

Long answers must scroll inside the overlay instead of expanding indefinitely.

### Visual direction

- dark translucent background
- subtle border
- rounded corners
- compact spacing
- minimal typography
- no sidebar
- no dashboard
- no large header
- no unnecessary controls

### Overlay states

The renderer must support these conceptual states:

#### HIDDEN

The overlay is not visible.

#### THINKING

Compact state, for example:

`Analyzing…`

It should consume very little screen space.

#### ANSWER

Shows the streamed/final AI answer.

Must support:

- paragraphs
- bullet lists
- numbered lists
- inline code
- fenced code blocks
- scrolling for long content

Controls:

- Copy
- Close

#### ERROR

Displays a short understandable error message and a close action.

Do not display raw internal stack traces to the user.

---

## 6. Window behavior

The application is hidden by default.

The overlay must:

- be frameless
- support transparency
- stay compact
- remain above normal application windows on the primary supported backend
- be programmatically showable/hideable
- not behave like a traditional full-size desktop application

### Primary v0.1 backend

The primary v0.1 target is:

**X11/XWayland**

The user's desktop session itself may be Wayland, but the application may run through XWayland for predictable overlay behavior.

Native Wayland-specific window behavior is not a v0.1 requirement.

---

## 7. Screenshot behavior

The application captures screenshots only after an explicit user shortcut.

It must not continuously monitor the screen.

Preferred implementation:

`org.freedesktop.portal.Screenshot`

The screenshot layer must be isolated behind a `ScreenshotService` interface so the implementation can change later.

### Own-overlay exclusion

Before the application performs its own screenshot:

1. hide the overlay
2. wait until it is no longer visible
3. capture the screen
4. continue the analysis workflow

This prevents the application's own overlay from being included in its own screenshot.

Screenshots must not be stored permanently in v0.1.

Temporary screenshot data must be removed when no longer needed.

---

## 8. Screen-capture policy

The application must not attempt to bypass, evade, or become invisible to third-party:

- proctoring systems
- monitoring software
- screen recorders
- remote-control tools
- screen-sharing applications

The application may hide its own overlay before **its own screenshot capture**.

If future presentation privacy is added, it must work by hiding the overlay rather than bypassing third-party capture.

---

## 9. Clipboard behavior

Clipboard analysis works only with the clipboard contents already created by the user.

The application must:

- read text clipboard on explicit shortcut
- reject empty text
- reject unsupported clipboard content with a clear message
- not synthesize copy shortcuts in third-party apps
- not alter the clipboard during analysis

The `Copy` button may replace clipboard contents only after an explicit user click.

---

## 10. AI behavior

The application must use an AI-provider abstraction.

The renderer must not call provider SDKs directly.

First provider:

**Gemini**

The provider must support, where available:

- image input
- text input
- streamed text output
- cancellation
- timeout handling
- useful error mapping

Provider-specific code must remain isolated.

### Default screen-analysis instruction

A reasonable default behavior is:

> Analyze the visible screen content and provide a concise, useful response to the apparent task or question. Prefer actionable answers and avoid unnecessary explanation.

The exact prompt may be refined later without changing architecture.

---

## 11. Settings

v0.1 settings should remain minimal.

Required settings:

### AI

- provider
- model
- API key

### Overlay

- opacity
- font size

### Shortcuts

- screen analysis shortcut
- clipboard analysis shortcut

### Startup

- start on login

Do not add additional settings without a documented product need.

---

## 12. Tray

The application should provide a system tray menu.

Minimum entries:

- Analyze Screen
- Settings
- Quit

Closing or hiding the overlay must not terminate the application.

---

## 13. Data and privacy

Default principle:

**local-first and minimal persistence**

v0.1 must not persist:

- screenshots
- AI conversation history
- screen history
- clipboard history

Settings may be persisted locally.

API credentials must not be stored in renderer state or plain application configuration when a more secure OS-backed option is available.

---

## 14. Error handling

The application must provide understandable user-facing errors for at least:

- global shortcut registration failure
- screenshot portal unavailable
- screenshot cancelled
- screenshot failed
- empty clipboard
- missing API key
- provider authentication failure
- provider request timeout
- provider network failure
- invalid provider response

Errors should be actionable where possible.

---

## 15. Definition of v0.1 success

v0.1 is successful when, on a supported Arch Linux system:

1. the app launches successfully
2. it remains hidden by default
3. the global screenshot shortcut works
4. the application hides its own overlay before capture
5. a screenshot is obtained
6. the screenshot is sent to Gemini
7. a streamed answer appears in the compact overlay
8. the clipboard shortcut analyzes existing clipboard text
9. settings persist
10. the application can be controlled from the tray
11. typecheck, lint, tests, and production build pass
