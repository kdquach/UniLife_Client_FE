import { useContext } from "react";
import { CampusContext } from "./campus.context";

export function useCampusStore() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampusStore must be used inside CampusProvider");
  return ctx;
}
