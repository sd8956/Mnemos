# NoteShell — Development Tasks

## Phase 1 — Foundation
- [ ] Install dependencies: react-flow, zustand, tailwindcss
- [ ] Configure Tailwind with Tokyo Night color palette
- [ ] Set up project folder structure (components/, stores/, etc.)
- [ ] Create TypeScript types for Section, Category, Note
- [ ] Configure Tauri fs plugin for file system access

## Phase 2 — Layout
- [ ] Create TopBar component (logo + tabs + search + settings)
- [ ] Create tab navigation (Engram / Personal / + New Section)
- [ ] Set up main app layout with Tauri window

## Phase 3 — Canvas
- [ ] Integrate React Flow as the canvas
- [ ] Add dot grid background (#292e42 dots on #13131f)
- [ ] Create custom CategoryNode component for React Flow
- [ ] Create custom NoteCard component (rendered inside CategoryNode)
- [ ] Implement zoom controls (bottom-left indicator, scroll to zoom)
- [ ] Add minimap in bottom-right

## Phase 4 — Storage
- [ ] Write Tauri commands: read_notes, write_notes, list_engram_files
- [ ] Create Zustand store with persistence to ~/.noteshell/data.json
- [ ] Implement auto-save with 500ms debounce

## Phase 5 — Interactions
- [ ] Click category → open expanded modal view with notes grid
- [ ] Add note creation UI in Personal section
- [ ] Category creation: floating + button in Personal
- [ ] Drag to reposition categories on canvas
- [ ] Search bar functionality (filter by title, tags, content)

## Phase 6 — Engram integration
- [ ] Settings modal to configure Engram directory path
- [ ] File watcher for Engram directory changes
- [ ] Read-only rendering with "AI" badge on notes
- [ ] Parse Engram file format into Note structure

## Phase 7 — Polish
- [ ] Markdown rendering in note content
- [ ] Keyboard shortcuts (Cmd+K search, Cmd+N new note)
- [ ] Loading states and error boundaries
- [ ] App icon and build configuration
