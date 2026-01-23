import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import imageNotFound from "@/assets/images/image-not-found.png";

export default function ProfileCluster({ isAuthenticated, user }) {
  const navigate = useNavigate();

  const profileMenu = [
    { key: "profile", label: "View profile" },
    { key: "wallet", label: "Wallet" },
    { key: "setting", label: "Setting" },
    { type: "divider" },
    { key: "logout", label: "Log out" },
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
          if (key === "logout") navigate("/login");
        },
      }}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-2xl bg-white/80 px-2 py-1 shadow-card transition hover:bg-white hover:shadow-lift"
      >
        {/* Avatar */}
        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-surfaceMuted">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={imageNotFound}
              loading="lazy"
            />
          )}
        </span>

        {/* Username */}
        <span className="hidden sm:block text-sm font-semibold">
          {user?.name ?? "Unilife User"}
        </span>
      </button>
    </Dropdown>
  );
}
