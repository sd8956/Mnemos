import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  rename,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type { Section } from "../types";

export type StorageData = {
  version: number;
  sections: Section[];
  lastModified: string;
};

const DATA_DIR = "noteshell";
const DATA_FILE = "noteshell/data.json";
const DATA_FILE_TMP = "noteshell/data.json.tmp";
const DATA_VERSION = 1;

const DEFAULT_DATA: StorageData = {
  version: DATA_VERSION,
  sections: [
    {
      id: "personal",
      name: "Personal",
      type: "personal",
      readOnly: false,
      categories: [],
    },
  ],
  lastModified: new Date().toISOString(),
};

export async function ensureDataDir(): Promise<void> {
  try {
    const dirExists = await exists(DATA_DIR, {
      baseDir: BaseDirectory.AppData,
    });
    if (!dirExists) {
      await mkdir(DATA_DIR, {
        baseDir: BaseDirectory.AppData,
        recursive: true,
      });
    }
  } catch (e) {
    console.error("Failed to ensure data directory:", e);
    throw e;
  }
}

export async function loadData(): Promise<StorageData> {
  try {
    await ensureDataDir();
    const fileExists = await exists(DATA_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    if (!fileExists) {
      return { ...DEFAULT_DATA, lastModified: new Date().toISOString() };
    }
    const content = await readTextFile(DATA_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(content) as StorageData;
  } catch (e) {
    console.error("Failed to load data, falling back to defaults:", e);
    return { ...DEFAULT_DATA, lastModified: new Date().toISOString() };
  }
}

export async function saveData(data: StorageData): Promise<void> {
  try {
    await ensureDataDir();
    const json = JSON.stringify(data, null, 2);
    await writeTextFile(DATA_FILE_TMP, json, {
      baseDir: BaseDirectory.AppData,
    });
    await rename(DATA_FILE_TMP, DATA_FILE, {
      oldPathBaseDir: BaseDirectory.AppData,
      newPathBaseDir: BaseDirectory.AppData,
    });
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}
