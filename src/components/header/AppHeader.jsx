import { useState, useEffect } from "react";
import logomd from "@/assets/images/logo-md.png";
import logolg from "@/assets/images/logo-lg.png";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import ProfileCluster from "@/components/header/ProfileCluster.jsx";
import CampusSelectModal from "@/components/header/CampusSelectModal.jsx";
import CampusTrigger from "@/components/header/CampusTrigger.jsx";
import NotificationDropdown from "@/components/header/NotificationDropdown.jsx";
import { getCurrentUser, isAuthenticated } from "@/services/auth.service";
import { useCampusStore } from "@/store/useCampusStore";

const notifications = [
  { id: "1", title: "Đơn hàng đã xác nhận", time: "2 phút trước" },
  { id: "2", title: "Có khuyến mãi mới", time: "1 giờ trước" },
];

const CAMPUSES = [
  {
    key: "hcm",
    name: "Hồ Chí Minh",
    image:
      "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img55.svg",
  },
  {
    key: "ct",
    name: "Cần Thơ",
    image:
      "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img4.svg",
  },
  {
    key: "hn",
    name: "Hà Nội",
    image:
      "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img3.svg",
  },
  {
    key: "qn",
    name: "Quy Nhơn",
    image:
      "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img2.svg",
  },
  {
    key: "dn",
    name: "Đà Nẵng",
    image:
      "https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img1.svg",
  },
];

const CAMPUS_LABEL = {
  hcm: "Hồ Chí Minh",
  hn: "Hà Nội",
  dn: "Đà Nẵng",
  qn: "Quy Nhơn",
  ct: "Cần Thơ",
};

function IconButton({ children, badge, label = "", onClick, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative grid h-9 w-9 place-items-center rounded-full bg-white/80 text-muted shadow-card transition duration-200 hover:bg-primary hover:text-inverse"
      {...props}
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-inverse">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default function AppHeader() {
  // 1. Đưa hook này lên đầu và bỏ 'selectedCanteen' để sửa lỗi unused variable
  const { selectedCampus } = useCampusStore();

  const [q, setQ] = useState("");

  // 2. Khởi tạo state dựa trên selectedCampus ngay lập tức để tránh lỗi cascading render
  const [openCampus, setOpenCampus] = useState(!selectedCampus);

  // Vẫn giữ useEffect để bắt trường hợp selectedCampus bị null sau khi component đã mount
  // SỬA LỖI: Dùng setTimeout để set state bất đồng bộ
  useEffect(() => {
    if (!selectedCampus) {
      const timer = setTimeout(() => {
        setOpenCampus(true);
      }, 0); // Delay 0ms để đẩy xuống cuối Event Loop

      // Cleanup function để tránh memory leak nếu component unmount
      return () => clearTimeout(timer);
    }
  }, [selectedCampus]);
  
  // Lấy trạng thái đăng nhập và thông tin user từ localStorage
  const userAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  return (
    <header className="app-header sticky top-0 z-50 w-full">
      <div className="app-container flex h-(--header-h) items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img
            src={logomd}
            alt="Brand logo"
            className="block h-8 w-auto md:hidden"
          />
          <img
            src={logolg}
            alt="Brand logo"
            className="hidden h-9 w-auto md:block"
          />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MaterialIcon name="search" className="text-[18px]" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search menu..."
              className="h-10 w-full rounded-full bg-white/80 pl-10 pr-4 text-sm outline-none shadow-card transition duration-200 placeholder:text-muted hover:bg-white hover:shadow-lift focus:shadow-[0_0_0_4px_rgba(255,85,50,0.18)]"
            />
          </div>
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
    </header>
  );
}