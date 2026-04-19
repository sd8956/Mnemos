export type SectionType = "engram" | "personal" | "custom";

export type NoteSource = "user" | "engram";

export type NoteCategory =
  | "logic"
  | "data"
  | "ui"
  | "issues"
  | "config"
  | "architecture"
  | "bugfix"
  | "decision"
  | "discovery"
  | "learning"
  | "pattern"
  | "manual"
  | "session_summary";

export type CanvasPosition = {
  x: number;
  y: number;
};

export type Note = {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  tags: string[];
  type?: NoteCategory;
  createdAt: string;
  updatedAt: string;
  source: NoteSource;
};

export type Category = {
  id: string;
  sectionId: string;
  name: string;
  accentColor: string;
  position: CanvasPosition;
  notes: Note[];
};

export type Section = {
  id: string;
  name: string;
  type: SectionType;
  readOnly: boolean;
  categories: Category[];
};
