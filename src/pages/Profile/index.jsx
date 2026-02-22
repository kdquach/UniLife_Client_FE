import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/useProfile";
import { changePassword } from "@/services/auth.service";

import MaterialIcon from "@/components/MaterialIcon";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import imageNotFound from "@/assets/images/image-not-found.png";
import {
  getNotificationSoundEnabled,
  setNotificationSoundEnabled,
} from "@/utils/notificationPreferences";

function ProgressRing({ percent = 0, size = 132, stroke = 12 }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute grid place-items-center">
        <p className="text-xl font-bold text-text">{clamped}%</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, loading, error, fetchMe, updateMe, uploadAvatar } =
    useProfile();

  const fileRef = useRef(null);

  const [editInfo, setEditInfo] = useState(false);
  const [draft, setDraft] = useState({
    fullName: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
  });

  // State doi mat khau
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [notificationSoundEnabled, setNotificationSoundEnabledState] = useState(() => getNotificationSoundEnabled());

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    fetchMe().catch(console.error);
  }, [fetchMe]);

  useEffect(() => {
    if (!profile) return;
    setDraft({
      fullName: profile.fullName || "",
      phone: profile.phone || "",
    });
  }, [profile]);

  /* ================= COMPLETION ================= */
  const completion = useMemo(() => {
    const items = [
      { label: "Thiết lập tài khoản", weight: 20, done: true },
      {
        label: "Ảnh đại diện",
        weight: 20,
        done: !!profile?.avatar,
      },
      {
        label: "Thông tin cá nhân",
        weight: 60,
        done: !!profile?.fullName && !!profile?.phone,
      },
    ];

    return {
      items,
      percent: items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0),
    };
  }, [profile]);

  /* ================= HANDLERS ================= */
  const handlePickAvatar = () => fileRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn một file hình ảnh");
      e.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 5MB");
      e.target.value = "";
      return;
    }

    try {
      const updatedUser = await uploadAvatar(file);
      
      // Update localStorage with fresh user data to trigger ProfileCluster update
      if (updatedUser) {
        try {
          const currentAuth = localStorage.getItem('auth');
          if (currentAuth) {
            const authData = JSON.parse(currentAuth);
            authData.user = updatedUser;
            localStorage.setItem('auth', JSON.stringify(authData));
            
            // Dispatch custom event to notify ProfileCluster
            window.dispatchEvent(new CustomEvent('userAvatarUpdated', { detail: updatedUser }));
          }
        } catch (err) {
          console.error('Failed to update auth storage:', err);
        }
      }
      
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (err) {
      toast.error("Cập nhật ảnh đại diện thất bại", {
        description: err?.response?.data?.message || err?.message,
      });
    } finally {
      e.target.value = "";
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!draft.fullName?.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (draft.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (draft.fullName.trim().length > 100) {
      newErrors.fullName = "Họ và tên không được vượt quá 100 ký tự";
    }

    if (!draft.phone?.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else {
      const phoneRegex = /^0[0-9]{9,10}$/;
      if (!phoneRegex.test(draft.phone.trim())) {
        newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số, bắt đầu từ 0)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePersonalInfo = async () => {
    if (!validatePersonalInfo()) {
      return;
    }

    try {
      await updateMe(draft);
      toast.success("Đã lưu thông tin cá nhân");
      setEditInfo(false);
      setErrors({ fullName: "", phone: "" });
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  // Clear error on input change
  const handleFullNameChange = (e) => {
    setDraft((p) => ({ ...p, fullName: e.target.value }));
    setErrors((p) => ({ ...p, fullName: "" }));
  };

  const handlePhoneChange = (e) => {
    setDraft((p) => ({ ...p, phone: e.target.value }));
    setErrors((p) => ({ ...p, phone: "" }));
  };

  // Xu ly doi mat khau
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // Validate phia client
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success("Đổi mật khẩu thành công");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  };

  // Huy doi mat khau
  const cancelChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({ current: false, new: false, confirm: false });
    setShowChangePassword(false);
  };

  const handleToggleNotificationSound = (enabled) => {
    setNotificationSoundEnabledState(enabled);
    setNotificationSoundEnabled(enabled);
    toast.success(enabled ? "Đã bật âm báo thông báo" : "Đã tắt âm báo thông báo");
  };

  /* ================= STATES ================= */
  if (loading && !profile) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <section className="rounded-card bg-surface p-5 shadow-card">
        <h2 className="text-base font-semibold text-text">
          Không tải được hồ sơ
        </h2>
        <p className="text-sm text-muted">{error}</p>
        <Button className="mt-4" onClick={fetchMe}>
          <MaterialIcon name="refresh" className="mr-2 text-[18px]" />
          Thử lại
        </Button>
      </section>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-muted">
          Quản lý thông tin hồ sơ của bạn
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-9">
        {/* LEFT */}
        <div className="grid gap-6 lg:col-span-6">
          {/* Avatar */}
          <section className="rounded-card bg-surface p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 overflow-hidden rounded-full bg-surfaceMuted">
                  <img
                    src={profile?.avatar || imageNotFound}
                    alt="avatar"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">
                    Ảnh đại diện
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Khuyến nghị tối thiểu 800×800. Hỗ trợ JPG/PNG
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button onClick={handlePickAvatar} disabled={loading}>
                  <MaterialIcon name="upload" className="mr-2 text-[18px]" />
                  Tải ảnh lên
                </Button>
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="rounded-card bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">
                Thông tin cá nhân
              </h2>
              <Button variant="ghost" onClick={() => setEditInfo((v) => !v)}>
                <MaterialIcon name="edit" className="mr-1 text-[18px]" />
                {editInfo ? "Đóng" : "Chỉnh sửa"}
              </Button>
            </div>

            {editInfo ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Họ và tên"
                  value={draft.fullName}
                  onChange={handleFullNameChange}
                  error={errors.fullName}
                />
                <Input
                  label="Số điện thoại"
                  value={draft.phone}
                  onChange={handlePhoneChange}
                  error={errors.phone}
                />

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button onClick={savePersonalInfo} disabled={loading}>
                    Lưu
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDraft({
                        fullName: profile.fullName || "",
                        phone: profile.phone || "",
                      });
                      setEditInfo(false);
                    }}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1">
                  <p className="text-xs text-muted">Họ và tên</p>
                  <p className="text-sm font-semibold text-text truncate">
                    {profile?.fullName || "—"}
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="text-xs text-muted">Email</p>
                  <p className="text-sm font-semibold text-text truncate">
                    {profile?.email || "—"}
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="text-xs text-muted">Số điện thoại</p>
                  <p className="text-sm font-semibold text-text truncate">
                    {profile?.phone || "—"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Change Password */}
          <section className="rounded-card bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">
                Đổi mật khẩu
              </h2>
              {/* Chi hien nut doi mat khau khi tai khoan la local */}
              {profile?.provider === "local" && (
                <Button
                  variant="ghost"
                  onClick={() => setShowChangePassword((v) => !v)}
                >
                  <MaterialIcon
                    name={showChangePassword ? "close" : "lock"}
                    className="mr-1 text-[18px]"
                  />
                  {showChangePassword ? "Đóng" : "Đổi mật khẩu"}
                </Button>
              )}
            </div>

            {/* Hien thong bao neu tai khoan dang nhap bang Google/Facebook */}
            {profile?.provider && profile.provider !== "local" ? (
              <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-700">
                <MaterialIcon name="info" className="text-[20px]" />
                <p className="text-sm">
                  Tài khoản này đăng ký bằng{" "}
                  {profile.provider === "google" ? "Google" : profile.provider}.
                  Không thể đổi mật khẩu.
                </p>
              </div>
            ) : showChangePassword ? (
              <div className="grid gap-4">
                {/* Mat khau hien tai */}
                <div className="relative">
                  <Input
                    label="Mật khẩu hiện tại"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[34px] text-muted hover:text-text"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, current: !p.current }))
                    }
                  >
                    <MaterialIcon
                      name={
                        showPasswords.current ? "visibility_off" : "visibility"
                      }
                      className="text-[20px]"
                    />
                  </button>
                </div>

                {/* Mat khau moi */}
                <div className="relative">
                  <Input
                    label="Mật khẩu mới"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[34px] text-muted hover:text-text"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, new: !p.new }))
                    }
                  >
                    <MaterialIcon
                      name={showPasswords.new ? "visibility_off" : "visibility"}
                      className="text-[20px]"
                    />
                  </button>
                </div>

                {/* Xac nhan mat khau moi */}
                <div className="relative">
                  <Input
                    label="Xác nhận mật khẩu mới"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[34px] text-muted hover:text-text"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                    }
                  >
                    <MaterialIcon
                      name={
                        showPasswords.confirm ? "visibility_off" : "visibility"
                      }
                      className="text-[20px]"
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Đang xử lý..." : "Xác nhận"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={cancelChangePassword}
                    disabled={changingPassword}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Để bảo mật tài khoản, bạn nên đổi mật khẩu định kỳ và không chia
                sẻ mật khẩu với người khác.
              </p>
            )}
          </section>

          <section className="rounded-card bg-surface p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-text">Âm báo thông báo</h2>
                <p className="mt-1 text-sm text-muted">
                  Phát âm thanh khi có thông báo mới.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationSoundEnabled}
                onClick={() =>
                  handleToggleNotificationSound(!notificationSoundEnabled)
                }
                className={`relative h-7 w-12 rounded-full transition ${notificationSoundEnabled ? "bg-primary" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${notificationSoundEnabled ? "left-6" : "left-1"}`}
                />
              </button>
            </div>

            <p className="text-xs text-muted">
              Trạng thái hiện tại: {notificationSoundEnabled ? "Đang bật" : "Đang tắt"}
            </p>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="lg:col-span-3">
          <section className="rounded-card bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-text">
              Hoàn thiện hồ sơ
            </h2>
            <div className="my-5 flex justify-center">
              <ProgressRing percent={completion.percent} />
            </div>

            <ul className="grid gap-3">
              {completion.items.map((it) => (
                <li
                  key={it.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <MaterialIcon
                      name={it.done ? "check_circle" : "radio_button_unchecked"}
                      className={
                        it.done
                          ? "text-[18px] text-[color:var(--success)]"
                          : "text-[18px] text-muted"
                      }
                      filled={it.done}
                    />
                    <span className={it.done ? "text-text" : "text-muted"}>
                      {it.label}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {it.weight}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
