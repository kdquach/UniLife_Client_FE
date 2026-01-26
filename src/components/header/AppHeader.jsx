import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logomd from "@/assets/images/logo-md.png";
import logolg from "@/assets/images/logo-lg.png";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import ProfileCluster from "@/components/header/ProfileCluster.jsx";
import CampusSelectModal from "@/components/header/CampusSelectModal.jsx";
import CampusTrigger from "@/components/header/CampusTrigger.jsx";
import NotificationDropdown from "@/components/header/NotificationDropdown.jsx";
import RequireCanteenModal from "@/components/header/RequireCanteenModal.jsx";
import { getCurrentUser, isAuthenticated } from "@/services/auth.service";
import { useCampusStore } from "@/store/useCampusStore";

const notifications = [
  { id: "1", title: "Đơn hàng đã xác nhận", time: "2 phút trước" },
  { id: "2", title: "Có khuyến mãi mới", time: "1 giờ trước" },
];

const CAMPUSES = [
  { key: "hcm", name: "Hồ Chí Minh", image: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img55.svg" },
  { key: "ct", name: "Cần Thơ", image: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img4.svg" },
  { key: "hn", name: "Hà Nội", image: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img3.svg" },
  { key: "qn", name: "Quy Nhơn", image: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img2.svg" },
  { key: "dn", name: "Đà Nẵng", image: "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img1.svg" },
];

export default function AppHeader() {
  const { selectedCampus, selectedCanteen } = useCampusStore();

  const [openCampus, setOpenCampus] = useState(() => !selectedCampus);
  const [showRequireModal, setShowRequireModal] = useState(false);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);

  const navigate = useNavigate();
  const userAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();

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
          campus={selectedCampus ? CAMPUSES.find(c => c.key === selectedCampus)?.name : 'Chọn campus'}
          onClick={() => setOpenCampus(true)}
        />

        <div className="flex items-center gap-3">
          <NotificationDropdown notifications={notifications} />

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
          campuses={CAMPUSES}
        />
      )}
      <RequireCanteenModal open={showRequireModal} onClose={() => setShowRequireModal(false)} />
    </header>
  );
}