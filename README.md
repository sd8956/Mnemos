# Mnemos

Desktop note-taking app with an infinite Miro-style canvas. Notes from you and your agents, in one place.

> Internal package name: `mnemos`. Product name: Mnemos.

## Features

- Infinite canvas board (pan, zoom, drag nodes) via @xyflow/react
- Three-level hierarchy: Section → Category → Note
- Tokyo Night palette, JetBrains Mono chrome
- Markdown notes with tags and type labels
- Full-text search across the active section
- Read-only Engram integration: reads your local `engram.db` SQLite
  and surfaces observations grouped by project, plus a `Personal`
  category for user-scope memory
- Local-first persistence: personal notes stored as pretty JSON at
  `{AppData}/noteshell/data.json`, settings at
  `{AppData}/noteshell/settings.json`
- Atomic writes with flush-on-close — never lose a mutation
- Keyboard shortcuts for power users (see in-app `?` or `Cmd/Ctrl+/`)

## Stack

- [Tauri 2](https://tauri.app) — desktop shell, Rust backend
- [React 19](https://react.dev) + TypeScript + [Vite](https://vite.dev)
- [Tailwind CSS 3](https://tailwindcss.com) — Tokyo Night custom palette
- [@xyflow/react 12](https://reactflow.dev) — infinite canvas
- [Zustand 5](https://zustand-demo.pmnd.rs) — state
- [rusqlite](https://github.com/rusqlite/rusqlite) (bundled) — Engram SQLite reader
- [sonner](https://sonner.emilkowal.ski) — toasts
- [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm — markdown rendering

## Development

### Prerequisites

- Node.js 20+ with npm
- Rust 1.75+ (`rustup`)
- Platform dev deps for Tauri — see [tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/)
- Linux: `webkit2gtk-4.1`, `libayatana-appindicator3-dev`, `librsvg2-dev`

### Install

```sh
npm install
```

### Run dev

```sh
npm run tauri dev
```

Note: on Arch Linux with Wayland, the `tauri` npm script sets
`WEBKIT_DISABLE_DMABUF_RENDERER=1` automatically to avoid a blank
WebKitGTK rendering bug. On other distros this is a no-op.

### Type check

```sh
npx tsc --noEmit
cd src-tauri && cargo check
```

### Production build

```sh
npm run tauri build
```

Output artifacts land in `src-tauri/target/release/bundle/`:

- Linux: `deb/*.deb` and `appimage/*.AppImage`
- macOS: `dmg/*.dmg` and `macos/*.app` (when built on macOS)
- Windows: `nsis/*.exe` and `msi/*.msi` (when built on Windows)

### Code signing (distribution)

Not configured. For public distribution:

- macOS: sign with an Apple Developer ID certificate, then notarize via `xcrun notarytool`
- Windows: sign `.exe`/`.msi` with a code signing certificate
- Linux: no signing required; checksums recommended

See [Tauri signing guide](https://v2.tauri.app/distribute/sign/).

## Project structure

```
src/
  components/
    canvas/        # ReactFlow canvas + CategoryNode + overlay states
    categories/    # NewCategoryButton / Modal / ExpandedModal
    engram/        # Empty / loading / error states for Engram
    layout/        # TopBar, SectionTabs, AppShell, LoadingScreen, ShortcutsModal
    notes/         # NoteCard, ExpandedNoteCard, NoteEditor, NoteReader, NewNoteTile
    settings/      # SettingsModal
    ui/            # Modal primitive
    ErrorBoundary.tsx
  hooks/           # useHydration, useFlushOnClose, useKeyboardShortcuts
  lib/             # storage, settings, ids, search, toast, engramBridge, mockData
  stores/          # sectionStore, settingsStore (Zustand)
  types/           # Shared TS types
src-tauri/
  src/
    lib.rs         # Tauri entry — plugins + invoke handler
    engram.rs      # SQLite reader (3 commands)
  capabilities/    # Permissions
  icons/           # App icons (source svg + generated)
  tauri.conf.json  # Tauri config
```

See [CLAUDE.md](./CLAUDE.md) for deeper design notes.

## Engram integration

Mnemos reads your Engram database directly with read-only SQLite
access. It never writes to the Engram database.

1. Install and run [Engram](https://github.com/Gentleman-Programming/engram)
2. Open Mnemos → gear icon → Settings
3. Set "Database path" to your `engram.db` (default `~/.engram/engram.db`)
4. Click Save

The Engram tab then shows one category per project + a `Personal`
category for user-scope observations. Only "meaningful" types are
surfaced: `decision, architecture, bugfix, discovery, learning,
pattern, manual, config, session_summary`. Telemetry types
(`tool_use`, `command`, `file_read`, `file_change`, `search`) are
filtered out at the SQL layer.

Refresh manually with the refresh icon in the top bar (only visible
while the Engram tab is active).

## Keyboard shortcuts

Press `?` or `Cmd/Ctrl + /` in-app to see the full list.

Highlights:

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + K` | Focus search |
| `Cmd/Ctrl + N` | New category (Personal only) |
| `Cmd/Ctrl + Shift + N` | New note (in expanded category) |
| `Cmd/Ctrl + S` | Save and close note |
| `Cmd/Ctrl + Enter` | Save note, keep editor open |
| `Cmd/Ctrl + ,` | Open settings |
| `Cmd/Ctrl + 1..9` | Switch to section N |
| `Cmd/Ctrl + 0 / = / -` | Zoom reset / in / out |
| `Esc` | Close topmost modal |

## License

Not yet chosen — pending repo owner's decision.
