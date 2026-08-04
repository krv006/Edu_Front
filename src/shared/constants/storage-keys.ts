export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: "fokus_access_token",
  REFRESH_TOKEN: "fokus_refresh_token",
  CONVERSATION_PANEL_WIDTH: "fokus_conversation_width",
  STUDENT_CONVERSATION_PANEL_WIDTH: "fokus_student_conversation_width",
  PARENT_SELECTED_CHILD: "fokus_parent_selected_child",
});

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
