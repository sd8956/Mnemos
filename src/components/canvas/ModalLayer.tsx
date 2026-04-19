import { NewCategoryModal } from "../categories/NewCategoryModal";
import { CategoryExpandedModal } from "../categories/CategoryExpandedModal";
import { NoteEditor } from "../notes/NoteEditor";
import { NoteReader } from "../notes/NoteReader";
import { NewCategoryButton } from "../categories/NewCategoryButton";
import { SettingsModal } from "../settings/SettingsModal";
import { NewSectionModal } from "../layout/NewSectionModal";

export function ModalLayer() {
  return (
    <>
      <NewCategoryButton />
      <NewCategoryModal />
      <NewSectionModal />
      <CategoryExpandedModal />
      <NoteEditor />
      <NoteReader />
      <SettingsModal />
    </>
  );
}
