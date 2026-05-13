import { setStorage } from "../core/storage";

let notesSaveTimer: ReturnType<typeof setTimeout> | null = null;

export function renderNotes(notes: string): void {
  const el = document.getElementById("notesTextInput") as HTMLTextAreaElement | null;
  if (el) el.value = notes || "";
}

export function saveNotesSoon(value: string): void {
  if (notesSaveTimer) window.clearTimeout(notesSaveTimer);
  notesSaveTimer = window.setTimeout(() => {
    setStorage({ notes: value });
  }, 250);
}
