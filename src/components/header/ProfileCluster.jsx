import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import imageNotFound from "@/assets/images/image-not-found.png";
import { logout as logoutService, getCurrentUser } from "@/services/auth.service";

export default function ProfileCluster({ isAuthenticated, user }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user);

  // Update when prop changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user?.avatar, user?.fullName, user?.name, user?._id]);

  // Listen for avatar updates from Profile page
  useEffect(() => {
    const handleUserAvatarUpdate = (event) => {
      if (event.detail) {
        setCurrentUser(event.detail);
      }
    };

    window.addEventListener('userAvatarUpdated', handleUserAvatarUpdate);
    return () => window.removeEventListener('userAvatarUpdated', handleUserAvatarUpdate);
  }, []);

  // Fallback: Refresh user data from localStorage occasionally
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const refreshUser = () => {
      try {
        const freshUser = getCurrentUser();
        if (freshUser && freshUser.avatar !== currentUser?.avatar) {
          setCurrentUser(freshUser);
        }
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    };

    // Check every 3 seconds for avatar updates (fallback)
    const interval = setInterval(refreshUser, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser?.avatar]);

  const handleLogout = async () => {
    try {
      // Gọi API logout
      await logoutService();

      // Hiển thị thông báo thành công
      toast.success("Đăng xuất thành công", {
        description: "Hẹn gặp lại bạn!",
        duration: 3000,
      });

      // Chuyển hướng về trang đăng nhập
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);

      // Hiển thị thông báo lỗi
      toast.error("Có lỗi xảy ra khi đăng xuất", {
        description: error.response?.data?.message || "Vui lòng thử lại",
        duration: 3000,
      });
    }
  };

  const profileMenu = [
    { key: "profile", label: "Hồ sơ" },
    { key: "wallet", label: "Ví" },
    { key: "setting", label: "Cài đặt" },
    { type: "divider" },
    { key: "logout", label: "Đăng xuất" },
  ];

  // =======================
  // CHƯA LOGIN
  // =======================
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-xl px-4 py-2 text-sm font-medium text-text transition hover:bg-surfaceMuted"
        >
          Đăng nhập
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-inverse shadow-card transition hover:bg-primaryHover hover:shadow-lift"
        >
          Đăng ký
        </button>
      </div>
    );
  }

  // =======================
  // ĐÃ LOGIN
  // =======================
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items: profileMenu,
        onClick: ({ key }) => {
          if (key === "profile") {
            navigate("/profile");
            return;
          }
          if (key === "logout") {
            handleLogout();
          }
        },
      }}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-2xl bg-white/80 px-2 py-1 shadow-card transition hover:bg-white hover:shadow-lift"
      >
        {/* Avatar */}
        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-surfaceMuted">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={imageNotFound} loading="lazy" />
          )}
        </span>

        {/* Username */}
        <span className="hidden sm:block text-sm font-semibold">
          {currentUser?.fullName ?? currentUser?.name ?? "Unilife User"}
        </span>
      </button>
    </Dropdown>
  );
}
