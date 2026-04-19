# Changelog

All notable changes to Mnemos are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-04-18

Initial ship: full note-taking app with canvas, Personal persistence,
and read-only Engram integration.

### Added

- **Phase 1 — Foundation**: Tauri 2 + React 19 + Vite scaffold, Tailwind
  with Tokyo Night palette, folder structure, base TypeScript types,
  Tauri fs plugin.
- **Phase 2 — Layout**: TopBar (logo + tabs + search + settings), 
  SectionTabs fed by Zustand store, AppShell host, JetBrains Mono via
  `@fontsource`.
- **Phase 3 — Canvas**: @xyflow/react v12 canvas with dot grid, custom
  CategoryNode, NoteCard grid, ZoomIndicator, minimap. Drag-to-move
  with end-of-drag persistence.
- **Phase 4 — Persistence**: `{AppData}/noteshell/data.json` atomic
  writes (temp + rename), 500ms debounced save subscription,
  flush-on-close via Tauri `onCloseRequested`. Engram slice kept
  separate from persisted user slice.
- **Phase 5 — Interactions**: Floating `+ New category` button,
  NewCategoryModal with color swatches, CategoryExpandedModal with
  3-col note grid, NoteEditor (markdown textarea, inline delete
  confirm), NoteReader (react-markdown + remark-gfm), SearchBar with
  `Cmd/Ctrl+K` focus, Escape-closes-topmost, search as opacity dim.
- **Phase 6 — Engram integration**: Rust `engram.rs` module with
  rusqlite (bundled), read-only SQLite access. Three Tauri commands:
  `engram_validate_db`, `engram_list_projects`, `engram_read_notes`.
  `project` rows become Categories; `personal` rows collapse into a
  synthetic `Personal` category. Telemetry types filtered at SQL.
  SettingsModal with file picker for `.db` path. Empty / loading /
  error states. Manual refresh from TopBar.
- **Phase 7 — Polish**:
  - ErrorBoundary wrapping TopBar and Canvas independently
  - Sonner toasts on create / save / delete / refresh
  - ShortcutsModal triggered by `?` or `Cmd/Ctrl+/`
  - Expanded shortcut coverage: `Cmd+S`, `Cmd+Enter`, `Cmd+,`,
    `Cmd+Shift+N`, `Cmd+1..9`, `Cmd+0/=/-`
  - PersonalEmptyState with create CTA
  - SearchNoResults banner when query has zero matches
  - Modal fade+slide enter animation (CSS only)
  - NoteCard / ExpandedNoteCard hover lift (1px translate)
  - App icon: JetBrains Mono "N" in accent blue on rounded-square
    Tokyo Night background, generated via `tauri icon` for all
    platforms
  - Window config: productName `Mnemos`, title `Mnemos`,
    1440×900 default, 1024×700 min
  - Linux bundle targets: `deb`, `appimage`
  - README, CHANGELOG, updated CLAUDE.md

### Fixed

- Phase 2 WebKitGTK blank screen on Arch+Wayland: `tauri` npm script
  now prepends `WEBKIT_DISABLE_DMABUF_RENDERER=1`.
- Phase 4 flush-on-close data loss: pending 500ms debounce cancelled
  by process exit. Added `useFlushOnClose` hook that awaits save
  before calling `window.destroy()`.
- Phase 4 `core:window:allow-destroy` missing from capabilities —
  added.
- Phase 4 `forbidden path` on `exists()` for
  `$APPDATA/noteshell/data.json`: switched `fs:allow-app-*` scope
  permissions to `-recursive` variants.
- Phase 6 duplicate category React key from slugified project names:
  now uses raw project name (which is DISTINCT from SQL).
- Phase 6 SQL parameter order mismatch in `engram_read_notes` caused
  empty note lists. Moved `project = ?` placeholder to match the
  `[types..., project]` param order.

### Deferred to future versions

- Shared-layout animated tab underline (would require framer-motion)
- Focus trap inside modals
- `prefers-reduced-motion` handling
- Code splitting for SettingsModal and ShortcutsModal
- Full a11y audit
- macOS / Windows code signing configuration
- Custom sections (`+ NEW SECTION` tab disabled with a coming-soon hint)
