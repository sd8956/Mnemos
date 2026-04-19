import type { Category, Note } from "../types";

const now = "2026-04-18T15:00:00.000Z";

function makeNote(
  id: string,
  categoryId: string,
  title: string,
  content: string,
  tags: string[],
  source: Note["source"],
  type?: Note["type"],
): Note {
  return {
    id,
    categoryId,
    title,
    content,
    tags,
    type,
    source,
    createdAt: now,
    updatedAt: now,
  };
}

export function getMockCategories(sectionId: string): Category[] {
  if (sectionId === "engram") {
    return [
      {
        id: "A1",
        sectionId: "engram",
        name: "NoteShell Agent",
        accentColor: "#7aa2f7",
        position: { x: 100, y: 100 },
        notes: [
          makeNote(
            "n-a1-1",
            "A1",
            "Architecture",
            "Define core message passing loop for sub-agents.",
            ["#agents", "#design"],
            "engram",
            "logic",
          ),
          makeNote(
            "n-a1-2",
            "A1",
            "Prompts v2",
            "Refining system instructions for JSON output strictness.",
            ["#prompts"],
            "engram",
            "config",
          ),
          makeNote(
            "n-a1-3",
            "A1",
            "State Management",
            "How to persist conversation history across session reloads efficiently.",
            ["#state", "#persistence"],
            "engram",
            "data",
          ),
        ],
      },
      {
        id: "R2",
        sectionId: "engram",
        name: "API Research",
        accentColor: "#bb9af7",
        position: { x: 540, y: 100 },
        notes: [
          makeNote(
            "n-r2-1",
            "R2",
            "OpenAI o1",
            "Latency benchmarks vs gpt-4o for complex reasoning tasks.",
            ["#openai", "#bench"],
            "engram",
            "data",
          ),
          makeNote(
            "n-r2-2",
            "R2",
            "Anthropic",
            "Context caching implementation details for sonnet 3.5.",
            ["#anthropic", "#caching"],
            "engram",
            "data",
          ),
        ],
      },
    ];
  }

  if (sectionId === "personal") {
    return [
      {
        id: "P3",
        sectionId: "personal",
        name: "Personal Notes",
        accentColor: "#7dcfff",
        position: { x: 100, y: 100 },
        notes: [
          makeNote(
            "n-p3-1",
            "P3",
            "Ideas 2024",
            "- Local-first sync\n- E2E Encryption\n- Mobile app",
            ["#ideas", "#roadmap"],
            "user",
          ),
          makeNote(
            "n-p3-2",
            "P3",
            "Meeting Prep",
            "Review Q3 OKRs before Thursday sync with team.",
            ["#work"],
            "user",
          ),
        ],
      },
      {
        id: "L4",
        sectionId: "personal",
        name: "Reading List",
        accentColor: "#9ece6a",
        position: { x: 540, y: 100 },
        notes: [
          makeNote(
            "n-l4-1",
            "L4",
            "Design Systems",
            "\"The Digital Architect's Midnight Studio\" concept exploration and implementation.",
            ["#design", "#ui"],
            "user",
            "ui",
          ),
        ],
      },
    ];
  }

  return [];
}
