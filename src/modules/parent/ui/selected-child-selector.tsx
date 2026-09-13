import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ParentChild } from "../api/parent.dto";
import { useSelectedChild } from "../model/selected-child.store";

export function SelectedChildSelector() {
  const { t } = useTranslation("parent");
  const { children, selectedChildId, selectChild, childrenQuery } = useSelectedChild();
  return (
    <label className="selected-child-selector">
      <UserRound size={16} />
      <span>{t("selector.label")}</span>
      <select
        value={selectedChildId ?? ""}
        disabled={childrenQuery.isLoading || !children.length}
        onChange={(event) => selectChild(event.target.value)}
      >
        {!children.length ? (
          <option value="">{t("selector.noChild")}</option>
        ) : (
          children.map((child: ParentChild) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
