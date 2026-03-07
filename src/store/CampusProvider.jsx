import { useMemo, useState, useEffect } from "react";
import { CampusContext } from "./campus.context";

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

export function CampusProvider({ children }) {
  const [selectedCampus, setSelectedCampus] = useState(() => {
    try {
      const raw = localStorage.getItem("selectedCampus") || null;
      return isMongoId(raw) ? raw : null;
    } catch {
      return null;
    }
  });
  const [selectedCanteen, setSelectedCanteen] = useState(() => {
    try {
      const raw = localStorage.getItem("selectedCanteen");
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed?.id || !isMongoId(parsed.id)) return null;
      return parsed;
    } catch {
      return null;
    }
  });

  // Persist to localStorage when changed
  useEffect(() => {
    try {
      if (selectedCampus) {
        localStorage.setItem("selectedCampus", selectedCampus);
      } else {
        localStorage.removeItem("selectedCampus");
      }
    } catch (err) {
      console.error('Error persisting selectedCampus:', err);
    }
  }, [selectedCampus]);

  useEffect(() => {
    try {
      if (selectedCanteen) {
        localStorage.setItem("selectedCanteen", JSON.stringify(selectedCanteen));
      } else {
        localStorage.removeItem("selectedCanteen");
      }
    } catch (err) {
      console.error('Error persisting selectedCanteen:', err);
    }
  }, [selectedCanteen]);

  const value = useMemo(
    () => ({
      selectedCampus,
      setSelectedCampus: (campus) => {
        setSelectedCampus(campus);
        setSelectedCanteen(null); // Reset canteen on campus change
      },
      selectedCanteen,
      setSelectedCanteen,
      clearSelection: () => {
        setSelectedCampus(null);
        setSelectedCanteen(null);
      },
    }),
    [selectedCampus, selectedCanteen]
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}
