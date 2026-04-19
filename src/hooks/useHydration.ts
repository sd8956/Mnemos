import { useEffect, useState } from "react";
import { useSectionStore } from "../stores/sectionStore";
import { useSettingsStore } from "../stores/settingsStore";

export function useHydration(): boolean {
  const sectionsHydrated = useSectionStore((s) => s.isHydrated);
  const settingsLoaded = useSettingsStore((s) => s.isLoaded);
  const hydrateSections = useSectionStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const loadEngramSection = useSectionStore((s) => s.loadEngramSection);

  const [initialEngramDone, setInitialEngramDone] = useState(false);

  useEffect(() => {
    if (!sectionsHydrated) hydrateSections();
  }, [sectionsHydrated, hydrateSections]);

  useEffect(() => {
    if (!settingsLoaded) hydrateSettings();
  }, [settingsLoaded, hydrateSettings]);

  useEffect(() => {
    if (!sectionsHydrated || !settingsLoaded || initialEngramDone) return;
    const { engramDbPath } = useSettingsStore.getState();
    setInitialEngramDone(true);
    if (engramDbPath) {
      void loadEngramSection();
    }
  }, [sectionsHydrated, settingsLoaded, initialEngramDone, loadEngramSection]);

  return sectionsHydrated && settingsLoaded;
}
