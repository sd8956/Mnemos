# Mnemos — Project Context

> **Status (v0.1.0)**: All 7 phases shipped. Foundation → Layout → Canvas
> → Persistence → Interactions → Engram integration → Polish. See
> [CHANGELOG.md](./CHANGELOG.md) for the full phase log.

## Overview
Mnemos is a desktop note-taking application built with Tauri + React + TypeScript.
It features an infinite canvas board (Miro-style) where notes are organized 
hierarchically as post-it cards grouped inside larger category cards.

## Core Concept
Three-level hierarchy:
1. **Sections** (tabs at top): e.g. "Engram", "Personal", "+ New Section"
2. **Categories** (large cards on canvas): e.g. "Mnemos Agent", "API Research"
3. **Notes** (small cards inside categories): the actual note content

## Stack
- **Framework**: Tauri 2.x (desktop shell)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Tokyo Night color palette)
- **Canvas**: React Flow (for infinite canvas, zoom, pan)
- **State**: Zustand (lightweight store)
- **Storage**: JSON files on disk via Tauri's fs plugin
- **Engram integration**: Read local files from Engram's directory (read-only)

## Design System — Tokyo Night Palette
Configure these as Tailwind custom colors:
- bg-primary: #1a1b26
- bg-canvas: #13131f
- bg-surface: #1e2030
- border: #292e42
- text-primary: #c0caf5
- text-muted: #565f89
- accent-blue: #7aa2f7
- accent-purple: #bb9af7
- accent-cyan: #7dcfff
- accent-green: #9ece6a
- accent-red: #f7768e
- accent-orange: #ff9e64

## Data Model

```typescript
type Section = {
  id: string;
  name: string;
  type: 'engram' | 'personal' | 'custom';
  readOnly: boolean;
  categories: Category[];
};

type Category = {
  id: string;
  sectionId: string;
  name: string;
  accentColor: string; // tokyo night accent
  position: { x: number; y: number }; // canvas position
  notes: Note[];
};

type Note = {
  id: string;
  categoryId: string;
  title: string;
  content: string; // markdown
  tags: string[];
  type?: 'logic' | 'data' | 'ui' | 'issues' | 'config';
  createdAt: string;
  updatedAt: string;
  source: 'user' | 'engram';
};
```

## Storage Strategy
- Personal notes: `~/.noteshell/data.json` (read/write via Tauri fs plugin)
- Engram notes: read from Engram's local directory (path configurable in settings)
- Auto-save on every mutation, debounced 500ms

## UI Behavior
- **Top bar**: Logo + section tabs + search + settings
- **Canvas**: Infinite, pan with drag, zoom with scroll wheel, dot grid background
- **Category expansion**: When zooming into a category (or clicking it), 
  it opens as a modal overlay showing all its notes in a grid
- **Engram section**: Read-only mode, "AI" badge on notes, no edit buttons
- **Personal section**: Full CRUD, floating "+" button to add categories

## Folder Structure

src/
components/
canvas/          # React Flow canvas + nodes
categories/      # Category card components
notes/           # Note card components
layout/          # Top bar, tabs, sidebar
ui/              # Generic UI primitives
stores/            # Zustand stores
hooks/             # Custom hooks
types/             # TypeScript types
utils/             # Helpers
lib/
storage.ts       # Tauri fs wrappers
engram.ts        # Engram file reader
src-tauri/
src/
lib.rs           # Tauri commands

## Coding Conventions
- Component files: PascalCase, one component per file
- Hooks: camelCase, prefix with `use`
- Use Zustand selectors, not full store subscriptions
- Tailwind classes directly in JSX, no styled-components
- All file paths handled in Rust layer (via Tauri commands)

## For maintainers

### Adding a new keyboard shortcut

1. Wire the key combo in `src/hooks/useKeyboardShortcuts.ts` (global)
   or a local component if it only makes sense when a specific modal
   is focused.
2. Respect `isTypingInField(e.target)` unless the shortcut should
   fire inside inputs (e.g. `Escape`, save shortcuts).
3. Document it in `src/components/layout/ShortcutsModal.tsx` under
   the appropriate group.

### Adding a new section type

1. Extend `SectionType` in `src/types/index.ts` (e.g. add `"shared"`).
2. Decide persistence: add a new slice in `sectionStore.ts` if the
   data source is external (like `engramSections`), or include it in
   the user-persisted `sections` array if it's writable.
3. Update `SectionTabs.tsx` to render the new slice.
4. Update `findCategoryById` / `findNote` / `getActiveSection` /
   `getCategoriesForActiveSection` to look in the new slice.

### Extending the note schema

1. Add the field to `Note` in `src/types/index.ts`.
2. Handle defaults during hydration in `loadData()` so older
   `data.json` files without the field load gracefully.
3. If the field should render for Engram notes too, add it to
   `EngramNote` in `src-tauri/src/engram.rs` and map it in
   `src/lib/engramBridge.ts`.
4. Update UI: `NoteCard`, `ExpandedNoteCard`, `NoteEditor`,
   `NoteReader`.

### Engram SQL filter changes

Types filter lives in `MEANINGFUL_TYPES` at the top of
`src-tauri/src/engram.rs`. Add/remove observation types there and
rebuild. Remember to keep the filter consistent across
`engram_validate_db`, `engram_list_projects`, and `engram_read_notes`
so counts and reads agree.

### Data directory paths

- User data: `{AppData}/noteshell/data.json`
- Settings: `{AppData}/noteshell/settings.json`
- Linux: `~/.local/share/com.sd.mnemos/noteshell/`
- macOS: `~/Library/Application Support/com.sd.mnemos/noteshell/`
- Windows: `%APPDATA%/com.sd.mnemos/noteshell/`

The Tauri identifier (`com.sd.mnemos`) is load-bearing for these
paths — changing it migrates to a fresh empty directory.
