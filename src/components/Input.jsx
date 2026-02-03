import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Input({ label, className, type, error, ...props }) {
  // State de quan ly hien thi mat khau
  const [showPassword, setShowPassword] = useState(false);

  // Kiem tra xem input co phai la password khong
  const isPasswordType = type === "password";

  // Xac dinh type hien tai cua input
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  // Ham toggle hien thi mat khau
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-muted">{label}</span>}
      <div className="relative">
        <input
          type={inputType}
          className={
            "w-full rounded-input bg-surfaceMuted px-3 py-2 text-text outline-none shadow-card transition duration-200 placeholder:text-muted focus:shadow-[0_0_0_4px_rgba(255,85,50,0.18)] " +
            (error ? "focus:shadow-[0_0_0_4px_rgba(135,40,34,0.18)] border border-danger " : "") +
            (isPasswordType ? "pr-10 " : "") +
            (className || "")
          }
          {...props}
        />
        {/* Nut an/hien mat khau */}
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5" />
            ) : (
              <FiEye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </label>
  );
}
