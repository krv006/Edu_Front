import { UserRound } from "lucide-react";
import { useSelectedChild } from "../model/use-selected-child";

export function SelectedChildSelector() {
  const { children, selectedChildId, selectChild, childrenQuery } = useSelectedChild();
  return <label className="selected-child-selector"><UserRound size={16} /><span>Farzand</span><select value={selectedChildId ?? ""} disabled={childrenQuery.isLoading || !children.length} onChange={(event) => selectChild(event.target.value)}>{!children.length ? <option value="">Farzand ulanmagan</option> : children.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</select></label>;
}
