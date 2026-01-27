import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/useProfile";

import MaterialIcon from "@/components/MaterialIcon";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import imageNotFound from "@/assets/images/image-not-found.png";

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
   const [errors, setErrors] = useState({ fullName: "", phone: "" });

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
         percent: items.reduce(
            (sum, i) => sum + (i.done ? i.weight : 0),
            0
         ),
      };
   }, [profile]);

   /* ================= HANDLERS ================= */
   const handlePickAvatar = () => fileRef.current?.click();

   const handleAvatarChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
         await uploadAvatar(file);
         toast.success("Cập nhật ảnh đại diện thành công");
      } catch (err) {
         toast.error("Cập nhật ảnh đại diện thất bại", {
            description: err?.response?.data?.message || err?.message,
         });
      } finally {
         e.target.value = "";
      }
   };

   const savePersonalInfo = async () => {
      try {
         await updateMe(draft);
         toast.success("Đã lưu thông tin cá nhân");
         setEditInfo(false);
      } catch {
         toast.error("Cập nhật thất bại");
      }
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
                           <MaterialIcon
                              name="upload"
                              className="mr-2 text-[18px]"
                           />
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
                     <Button
                        variant="ghost"
                        onClick={() => setEditInfo((v) => !v)}
                     >
                        <MaterialIcon
                           name="edit"
                           className="mr-1 text-[18px]"
                        />
                        {editInfo ? "Đóng" : "Chỉnh sửa"}
                     </Button>
                  </div>

                  {editInfo ? (
                     <div className="grid gap-4 md:grid-cols-2">
                        <Input
                           label="Họ và tên"
                           value={draft.fullName}
                           onChange={(e) => {
                              const value = e.target.value;
                              // Only allow letters, spaces, Vietnamese chars
                              if (/^[\p{L} .'-]*$/u.test(value) || value === "") {
                                 setDraft((p) => ({ ...p, fullName: value }));
                                 setErrors((err) => ({ ...err, fullName: "" }));
                              } else {
                                 setErrors((err) => ({ ...err, fullName: "Chỉ nhập chữ, không số/ký tự đặc biệt" }));
                              }
                           }}
                           error={errors.fullName}
                        />
                        <Input
                           label="Số điện thoại"
                           value={draft.phone}
                           onChange={(e) => {
                              const value = e.target.value;
                              // Only allow 10 digits, no letters
                              if (/^\d{0,10}$/.test(value)) {
                                 setDraft((p) => ({ ...p, phone: value }));
                                 setErrors((err) => ({ ...err, phone: "" }));
                              } else {
                                 setErrors((err) => ({ ...err, phone: "Số điện thoại phải là 10 số, không nhập chữ" }));
                              }
                           }}
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
