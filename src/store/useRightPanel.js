import { useContext } from "react";
import { RightPanelContext } from "./rightPanel.context";

export function useRightPanel() {
  const ctx = useContext(RightPanelContext);
  if (!ctx) throw new Error("useRightPanel must be used inside RightPanelProvider");
  return ctx;
}
