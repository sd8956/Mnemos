import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

export type AppSettings = {
  engramDbPath: string | null;
  engramAutoRefresh: boolean;
  engramCategoryPositions: Record<string, { x: number; y: number }>;
};

const SETTINGS_DIR = "noteshell";
const SETTINGS_FILE = "noteshell/settings.json";

const DEFAULT_SETTINGS: AppSettings = {
  engramDbPath: null,
  engramAutoRefresh: true,
  engramCategoryPositions: {},
};

async function ensureDir(): Promise<void> {
  const dirExists = await exists(SETTINGS_DIR, {
    baseDir: BaseDirectory.AppData,
  });
  if (!dirExists) {
    await mkdir(SETTINGS_DIR, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    await ensureDir();
    const fileExists = await exists(SETTINGS_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    if (!fileExists) return { ...DEFAULT_SETTINGS };
    const content = await readTextFile(SETTINGS_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    const parsed = JSON.parse(content) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error("Failed to load settings:", e);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await ensureDir();
    await writeTextFile(
      SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      { baseDir: BaseDirectory.AppData },
    );
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}
