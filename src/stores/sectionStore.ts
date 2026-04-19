import { create } from "zustand";
import type {
  CanvasPosition,
  Category,
  Note,
  Section,
} from "../types";
import { generateId } from "../lib/ids";
import { loadData, saveData, type StorageData } from "../lib/storage";
import { loadEngramSection as loadEngramFromDb } from "../lib/engramBridge";
import { useSettingsStore } from "./settingsStore";

type NoteDraft = Omit<Note, "id" | "createdAt" | "updatedAt">;

type SectionStore = {
  sections: Section[];
  engramSections: Section[];
  activeSectionId: string;
  isHydrated: boolean;

  expandedCategoryId: string | null;
  editingNoteId: string | null;
  creatingNoteInCategoryId: string | null;
  isNewCategoryModalOpen: boolean;
  isNewSectionModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  searchQuery: string;

  engramLoading: boolean;
  engramError: string | null;

  hydrate: () => Promise<void>;
  setActiveSection: (id: string) => void;
  addSection: (name: string) => void;
  addCategory: (
    sectionId: string,
    name: string,
    accentColor: string,
    position?: CanvasPosition,
  ) => void;
  updateCategoryPosition: (
    categoryId: string,
    position: CanvasPosition,
  ) => void;
  deleteCategory: (categoryId: string) => void;
  deleteSection: (sectionId: string) => void;
  addNote: (categoryId: string, note: NoteDraft) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;

  openCategory: (categoryId: string) => void;
  closeCategory: () => void;
  openNoteEditor: (noteId: string) => void;
  openNewNoteEditor: (categoryId: string) => void;
  closeNoteEditor: () => void;
  openNewCategoryModal: () => void;
  closeNewCategoryModal: () => void;
  openNewSectionModal: () => void;
  closeNewSectionModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  setSearchQuery: (q: string) => void;

  loadEngramSection: () => Promise<void>;
  clearEngramSection: () => void;

  getActiveSection: () => Section | undefined;
  getCategoriesForActiveSection: () => Category[];
  findNote: (noteId: string) => Note | undefined;
  findCategoryById: (categoryId: string) => Category | undefined;
};

const initialEngramSections: Section[] = [
  {
    id: "engram",
    name: "Engram",
    type: "engram",
    readOnly: true,
    categories: [],
  },
];

function updatePositionInList(
  sections: Section[],
  categoryId: string,
  position: CanvasPosition,
): Section[] {
  let found = false;
  const result = sections.map((section) => {
    if (!section.categories.some((c) => c.id === categoryId)) return section;
    found = true;
    return {
      ...section,
      categories: section.categories.map((c) =>
        c.id === categoryId ? { ...c, position } : c,
      ),
    };
  });
  return found ? result : sections;
}

function mapNoteInSections(
  sections: Section[],
  noteId: string,
  mapFn: (note: Note) => Note,
): Section[] {
  let changed = false;
  const result = sections.map((section) => {
    let sectionChanged = false;
    const categories = section.categories.map((category) => {
      if (!category.notes.some((n) => n.id === noteId)) return category;
      sectionChanged = true;
      return {
        ...category,
        notes: category.notes.map((note) =>
          note.id === noteId ? mapFn(note) : note,
        ),
      };
    });
    if (!sectionChanged) return section;
    changed = true;
    return { ...section, categories };
  });
  return changed ? result : sections;
}

function removeNoteInSections(sections: Section[], noteId: string): Section[] {
  let changed = false;
  const result = sections.map((section) => {
    let sectionChanged = false;
    const categories = section.categories.map((category) => {
      if (!category.notes.some((n) => n.id === noteId)) return category;
      sectionChanged = true;
      return {
        ...category,
        notes: category.notes.filter((n) => n.id !== noteId),
      };
    });
    if (!sectionChanged) return section;
    changed = true;
    return { ...section, categories };
  });
  return changed ? result : sections;
}

export const useSectionStore = create<SectionStore>((set, get) => ({
  sections: [],
  engramSections: initialEngramSections,
  activeSectionId: "personal",
  isHydrated: false,

  expandedCategoryId: null,
  editingNoteId: null,
  creatingNoteInCategoryId: null,
  isNewCategoryModalOpen: false,
  isNewSectionModalOpen: false,
  isSettingsModalOpen: false,
  isShortcutsModalOpen: false,
  searchQuery: "",

  engramLoading: false,
  engramError: null,

  hydrate: async () => {
    const data = await loadData();
    set({ sections: data.sections });
    set({ isHydrated: true });
  },

  setActiveSection: (id) => {
    set({ activeSectionId: id });
    if (id === "engram") {
      const { engramDbPath } = useSettingsStore.getState();
      const hasData = get().engramSections[0]?.categories.length ?? 0;
      if (engramDbPath && !hasData && !get().engramLoading) {
        void get().loadEngramSection();
      }
    }
  },

  addSection: (name) => {
    const newId = generateId("sec");
    set((state) => ({
      sections: [
        ...state.sections,
        {
          id: newId,
          name,
          type: "custom",
          readOnly: false,
          categories: [],
        },
      ],
      activeSectionId: newId,
    }));
  },

  addCategory: (sectionId, name, accentColor, position) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          categories: [
            ...section.categories,
            {
              id: generateId("cat"),
              sectionId,
              name,
              accentColor,
              position: position ?? { x: 120, y: 120 },
              notes: [],
            },
          ],
        };
      }),
    })),

  updateCategoryPosition: (categoryId, position) => {
    const isEngramCategory = get().engramSections.some((sec) =>
      sec.categories.some((c) => c.id === categoryId),
    );
    set((state) => ({
      sections: updatePositionInList(state.sections, categoryId, position),
      engramSections: updatePositionInList(
        state.engramSections,
        categoryId,
        position,
      ),
    }));
    if (isEngramCategory) {
      useSettingsStore
        .getState()
        .setEngramCategoryPosition(categoryId, position);
    }
  },

  deleteCategory: (categoryId) =>
    set((state) => {
      const notesOfDeleted = new Set<string>();
      const sections = state.sections.map((section) => {
        const match = section.categories.find((c) => c.id === categoryId);
        if (!match) return section;
        match.notes.forEach((n) => notesOfDeleted.add(n.id));
        return {
          ...section,
          categories: section.categories.filter((c) => c.id !== categoryId),
        };
      });
      return {
        sections,
        expandedCategoryId:
          state.expandedCategoryId === categoryId
            ? null
            : state.expandedCategoryId,
        editingNoteId:
          state.editingNoteId && notesOfDeleted.has(state.editingNoteId)
            ? null
            : state.editingNoteId,
        creatingNoteInCategoryId:
          state.creatingNoteInCategoryId === categoryId
            ? null
            : state.creatingNoteInCategoryId,
      };
    }),

  deleteSection: (sectionId) =>
    set((state) => {
      const deleted = state.sections.find((s) => s.id === sectionId);
      if (!deleted || deleted.type !== "custom") return {};
      const deletedCategoryIds = new Set(
        deleted.categories.map((c) => c.id),
      );
      const deletedNoteIds = new Set(
        deleted.categories.flatMap((c) => c.notes.map((n) => n.id)),
      );
      const wasActive = state.activeSectionId === sectionId;
      return {
        sections: state.sections.filter((s) => s.id !== sectionId),
        activeSectionId: wasActive ? "personal" : state.activeSectionId,
        expandedCategoryId:
          state.expandedCategoryId &&
          deletedCategoryIds.has(state.expandedCategoryId)
            ? null
            : state.expandedCategoryId,
        editingNoteId:
          state.editingNoteId && deletedNoteIds.has(state.editingNoteId)
            ? null
            : state.editingNoteId,
        creatingNoteInCategoryId:
          state.creatingNoteInCategoryId &&
          deletedCategoryIds.has(state.creatingNoteInCategoryId)
            ? null
            : state.creatingNoteInCategoryId,
      };
    }),

  addNote: (categoryId, note) =>
    set((state) => {
      const nowIso = new Date().toISOString();
      let found = false;
      const sections = state.sections.map((section) => {
        if (!section.categories.some((c) => c.id === categoryId)) {
          return section;
        }
        found = true;
        return {
          ...section,
          categories: section.categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  notes: [
                    ...category.notes,
                    {
                      ...note,
                      id: generateId("note"),
                      createdAt: nowIso,
                      updatedAt: nowIso,
                    },
                  ],
                }
              : category,
          ),
        };
      });
      return found ? { sections } : {};
    }),

  updateNote: (noteId, updates) =>
    set((state) => ({
      sections: mapNoteInSections(state.sections, noteId, (note) => ({
        ...note,
        ...updates,
        updatedAt: new Date().toISOString(),
      })),
    })),

  deleteNote: (noteId) =>
    set((state) => ({
      sections: removeNoteInSections(state.sections, noteId),
    })),

  openCategory: (categoryId) => set({ expandedCategoryId: categoryId }),
  closeCategory: () => set({ expandedCategoryId: null }),
  openNoteEditor: (noteId) =>
    set({ editingNoteId: noteId, creatingNoteInCategoryId: null }),
  openNewNoteEditor: (categoryId) =>
    set({ creatingNoteInCategoryId: categoryId, editingNoteId: null }),
  closeNoteEditor: () =>
    set({ editingNoteId: null, creatingNoteInCategoryId: null }),
  openNewCategoryModal: () => set({ isNewCategoryModalOpen: true }),
  closeNewCategoryModal: () => set({ isNewCategoryModalOpen: false }),
  openNewSectionModal: () => set({ isNewSectionModalOpen: true }),
  closeNewSectionModal: () => set({ isNewSectionModalOpen: false }),
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  openShortcutsModal: () => set({ isShortcutsModalOpen: true }),
  closeShortcutsModal: () => set({ isShortcutsModalOpen: false }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  loadEngramSection: async () => {
    const { engramDbPath, engramCategoryPositions } =
      useSettingsStore.getState();
    if (!engramDbPath) {
      set({
        engramSections: [
          {
            id: "engram",
            name: "Engram",
            type: "engram",
            readOnly: true,
            categories: [],
          },
        ],
        engramError: null,
      });
      return;
    }
    set({ engramLoading: true, engramError: null });
    try {
      const section = await loadEngramFromDb(
        engramDbPath,
        engramCategoryPositions,
      );
      set({ engramSections: [section], engramLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set({ engramLoading: false, engramError: message });
    }
  },

  clearEngramSection: () =>
    set({
      engramSections: [
        {
          id: "engram",
          name: "Engram",
          type: "engram",
          readOnly: true,
          categories: [],
        },
      ],
      engramError: null,
    }),

  getActiveSection: () => {
    const { sections, engramSections, activeSectionId } = get();
    return (
      engramSections.find((s) => s.id === activeSectionId) ??
      sections.find((s) => s.id === activeSectionId)
    );
  },

  getCategoriesForActiveSection: () => {
    const { sections, engramSections, activeSectionId } = get();
    const match =
      engramSections.find((s) => s.id === activeSectionId) ??
      sections.find((s) => s.id === activeSectionId);
    return match?.categories ?? [];
  },

  findNote: (noteId) => {
    const { sections, engramSections } = get();
    for (const section of [...engramSections, ...sections]) {
      for (const category of section.categories) {
        const note = category.notes.find((n) => n.id === noteId);
        if (note) return note;
      }
    }
    return undefined;
  },

  findCategoryById: (categoryId) => {
    const { sections, engramSections } = get();
    for (const section of [...engramSections, ...sections]) {
      const cat = section.categories.find((c) => c.id === categoryId);
      if (cat) return cat;
    }
    return undefined;
  },
}));

// Debounced save on user-section changes.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastSections = useSectionStore.getState().sections;

function buildSnapshot(): StorageData {
  return {
    version: 1,
    sections: useSectionStore.getState().sections,
    lastModified: new Date().toISOString(),
  };
}

export async function flushSave(): Promise<void> {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  await saveData(buildSnapshot());
}

useSectionStore.subscribe((state) => {
  if (!state.isHydrated) return;
  if (state.sections === lastSections) return;
  lastSections = state.sections;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveData(buildSnapshot());
  }, 500);
});

if (import.meta.env.DEV) {
  (
    window as typeof window & {
      __SECTION_STORE__?: typeof useSectionStore;
    }
  ).__SECTION_STORE__ = useSectionStore;
}
