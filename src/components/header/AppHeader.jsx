import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logomd from "@/assets/images/logo-md.png";
import logolg from "@/assets/images/logo-lg.png";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import ProfileCluster from "@/components/header/ProfileCluster.jsx";
import CampusSelectModal from "@/components/header/CampusSelectModal.jsx";
import CampusTrigger from "@/components/header/CampusTrigger.jsx";
import NotificationCenter from "@/components/header/NotificationCenter.jsx";
import RequireCanteenModal from "@/components/header/RequireCanteenModal.jsx";
import { getCurrentUser, isAuthenticated } from "@/services/auth.service";
import { getCanteensByCampus } from "@/services/canteen.service";
import { getActiveCampuses } from "@/services/campus.service";
import { useCampusStore } from "@/store/useCampusStore";

const CAMPUS_IMAGE_BY_CODE = {
  HCM: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img55.svg",
  CT: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img4.svg",
  HN: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img3.svg",
  QN: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img2.svg",
  DN: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img1.svg",
};

export default function AppHeader() {
  const { selectedCampus, selectedCanteen } = useCampusStore();
  const [campuses, setCampuses] = useState([]);
  const [offTodayCount, setOffTodayCount] = useState(0);

  const [openCampus, setOpenCampus] = useState(() => !selectedCampus || !selectedCanteen);
  const [showRequireModal, setShowRequireModal] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);

  const navigate = useNavigate();
  const userAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const data = await getActiveCampuses();
        const mapped = Array.isArray(data)
          ? data.map((item) => ({
            ...item,
            image: CAMPUS_IMAGE_BY_CODE[String(item?.code || "").toUpperCase()] || null,
          }))
          : [];
        setCampuses(mapped);
      } catch {
        setCampuses([]);
      }
    };

    void loadCampuses();
  }, []);

  useEffect(() => {
    const loadCanteenOffToday = async () => {
      if (!selectedCampus) {
        setOffTodayCount(0);
        return;
      }

      try {
        const canteens = await getCanteensByCampus(selectedCampus);
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        const count = (Array.isArray(canteens) ? canteens : []).filter((item) => {
          const offDates = Array.isArray(item?.offDates) ? item.offDates : [];
          return offDates.includes(today);
        }).length;

        setOffTodayCount(count);
      } catch {
        setOffTodayCount(0);
      }
    };

    void loadCanteenOffToday();
  }, [selectedCampus]);

  const selectedCampusName = useMemo(() => {
    if (!selectedCampus) return "Chọn campus";
    const found = campuses.find((item) => String(item._id) === String(selectedCampus));
    return found?.name || "Chọn campus";
  }, [campuses, selectedCampus]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!selectedCampus || !selectedCanteen) {
      setShowRequireModal(true);
      return;
    }

    if (!q.trim()) return;

    setSearching(true);
    navigate(`/menu?search=${encodeURIComponent(q)}&canteenId=${selectedCanteen.id}`);
    setSearching(false);
  };

  return (
    <header className="app-header sticky top-0 z-50 w-full">
      <div className="app-container flex h-(--header-h) items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src={logomd} alt="Brand logo" className="h-8 md:hidden" />
          <img src={logolg} alt="Brand logo" className="hidden h-9 md:block" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <form className="relative w-full max-w-xl" onSubmit={handleSearch}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MaterialIcon name="search" className="text-[18px]" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu..."
              disabled={searching}
              className="h-10 w-full rounded-full bg-white/80 pl-10 pr-10 text-sm shadow-card transition focus:shadow-[0_0_0_4px_rgba(255,85,50,0.18)]"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  navigate("/menu");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                <MaterialIcon name="close" className="text-[18px]" />
              </button>
            )}
          </form>
        </div>

        <CampusTrigger
          campus={selectedCampusName}
          onClick={() => setOpenCampus(true)}
          hasOffToday={offTodayCount > 0}
          offTodayCount={offTodayCount}
        />

        <div className="flex items-center gap-3">
          <NotificationCenter />

          <ProfileCluster
            isAuthenticated={userAuthenticated}
            user={currentUser}
          />
        </div>
      </div>

      {openCampus && (
        <CampusSelectModal
          open={openCampus}
          onClose={() => setOpenCampus(false)}
          campuses={campuses}
        />
      )}
      <RequireCanteenModal open={showRequireModal} onClose={() => setShowRequireModal(false)} />
    </header>
  );
}