import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as OTPAuth from "otpauth";
import MaterialIcon from "@/components/MaterialIcon.jsx";

/**
 * PickupQRCode Component
 * Hiển thị mã QR để nhận hàng với TOTP (Time-based One-Time Password)
 * Mã QR sẽ tự động thay đổi mỗi 60 giây để tránh chụp trộm
 *
 * @param {Object} props
 * @param {string} props.orderId - ID của đơn hàng (dùng làm secret cho TOTP)
 * @param {string} props.pickupCode - Mã nhận hàng từ server (optional)
 * @param {number} props.size - Kích thước QR code (default: 160)
 */
export default function PickupQRCode({ orderId, pickupCode, size = 160 }) {
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [currentToken, setCurrentToken] = useState("");

  // Tạo TOTP instance với orderId làm secret
  const totp = useMemo(() => {
    // Tạo secret từ orderId (đảm bảo đủ dài và hợp lệ)
    const secretBase = (orderId || "default").padEnd(32, "X").slice(0, 32);

    return new OTPAuth.TOTP({
      issuer: "UniLife",
      label: `Order-${orderId?.slice(-6) || "000000"}`,
      algorithm: "SHA1",
      digits: 6,
      period: 60, // 60 giây
      secret: OTPAuth.Secret.fromUTF8(secretBase),
    });
  }, [orderId]);

  // Tạo data cho QR code (kết hợp pickupCode + TOTP token)
  const qrData = useMemo(() => {
    const data = {
      orderId: orderId,
      pickupCode: pickupCode || orderId?.slice(-8),
      token: currentToken,
    };
    return JSON.stringify(data);
  }, [orderId, pickupCode, currentToken]);

  // Effect để cập nhật token và countdown
  useEffect(() => {
    const updateToken = () => {
      try {
        const token = totp.generate();
        setCurrentToken(token);
      } catch (error) {
        console.error("Error generating TOTP:", error);
        setCurrentToken("------");
      }
    };

    const updateCountdown = () => {
      // Tính thời gian còn lại trong chu kỳ 60 giây
      const now = Math.floor(Date.now() / 1000);
      const remaining = 60 - (now % 60);
      setTimeRemaining(remaining);

      // Nếu bắt đầu chu kỳ mới, tạo token mới
      if (remaining === 60 || remaining === 59) {
        updateToken();
      }
    };

    // Khởi tạo
    updateToken();
    updateCountdown();

    // Cập nhật mỗi giây
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [totp]);

  // Tính phần trăm thời gian còn lại cho progress ring
  const progressPercent = (timeRemaining / 60) * 100;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
      {/* Header */}
      <div className="flex items-center gap-2 text-green-700">
        <MaterialIcon name="qr_code_2" className="text-[24px]" />
        <span className="text-sm font-semibold">Mã nhận hàng</span>
      </div>

      {/* QR Code với Progress Ring */}
      <div className="relative">
        {/* Progress Ring SVG */}
        <svg
          className="absolute -inset-3 transform -rotate-90"
          width={size + 24}
          height={size + 24}
        >
          {/* Background ring */}
          <circle
            cx={(size + 24) / 2}
            cy={(size + 24) / 2}
            r={40}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {/* Progress ring */}
          <circle
            cx={(size + 24) / 2}
            cy={(size + 24) / 2}
            r={40}
            fill="none"
            stroke={timeRemaining <= 10 ? "#ef4444" : "#22c55e"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* QR Code */}
        <div className="bg-white p-3 rounded-xl shadow-sm relative z-10">
          <QRCodeSVG
            value={qrData}
            size={size}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
          />
        </div>
      </div>

      {/* Token hiển thị */}
      <div className="text-center">
        <p className="font-mono text-2xl font-bold text-green-800 tracking-widest">
          {currentToken || "------"}
        </p>
        <p className="text-xs text-green-600 mt-1">Mã xác thực</p>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full">
        <MaterialIcon
          name="timer"
          className={`text-[16px] ${timeRemaining <= 10 ? "text-red-500" : "text-green-600"}`}
        />
        <span
          className={`text-sm font-medium ${timeRemaining <= 10 ? "text-red-500" : "text-green-700"}`}
        >
          Cập nhật sau {timeRemaining}s
        </span>
      </div>

      {/* Lưu ý */}
      <p className="text-xs text-center text-green-600/80 max-w-[200px]">
        Xuất trình mã này cho nhân viên khi nhận hàng
      </p>
    </div>
  );
}
