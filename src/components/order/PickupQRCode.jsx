import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { refreshQRCode } from "@/services/order.service";
import { toast } from "sonner";

/**
 * PickupQRCode Component
 * Hiển thị mã QR để nhận hàng với cơ chế xoay vòng (Rotation) từ Server
 * Mã QR sẽ tự động làm mới mỗi 60 giây thông qua API
 *
 * @param {Object} props
 * @param {string} props.orderId - ID của đơn hàng
 * @param {string} props.initialCode - Mã QR khởi tạo từ data đơn hàng
 * @param {number} props.size - Kích thước QR code (default: 160)
 */
export default function PickupQRCode({
  orderId,
  initialCode,
  size = 160,
}) {
  const [qrCode, setQrCode] = useState(initialCode || "");
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Guard để tránh gọi API trùng lặp khi đang xử lý
  const isFetchingRef = useRef(false);

  // Hàm gọi API lấy mã mới
  const fetchNewQR = useCallback(async () => {
    if (!orderId || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const response = await refreshQRCode(orderId);
      if (response.status === "success" && response.data?.pickupQRCode) {
        setQrCode(response.data.pickupQRCode.code);
        setTimeRemaining(60); // Reset timer 60s
      } else {
        // Lỗi logic từ BE
        setError("Không thể cập nhật mã lúc này.");
        setTimeRemaining(30); // Thử lại sau 30s
      }
    } catch (err) {
      console.error("Failed to refresh QR:", err);
      setError("Lỗi kết nối. Đang thử lại...");
      toast.error("Lỗi kết nối máy chủ. Đang thử lại sau 10s.");
      
      // QUAN TRỌNG: Reset timer về 10s để tránh spam API liên tục mỗi giây
      setTimeRemaining(10); 
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [orderId]);

  // Sync state khi prop thay đổi (ví dụ khi mở modal với đơn khác)
  useEffect(() => {
    setQrCode(initialCode || "");
    setTimeRemaining(60);
    setError(null);
  }, [orderId, initialCode]);

  // Effect quản lý Countdown và Refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          fetchNewQR();
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchNewQR]);


  return (
    <div className="flex flex-col items-center gap-4 p-5 bg-success/5 rounded-2xl shadow-card border border-success/10">
      {/* Header */}
      <div className="flex items-center gap-2 text-success uppercase tracking-wider">
        <MaterialIcon name="qr_code_2" className="text-[24px]" />
        <span className="text-sm font-semibold">Mã nhận hàng</span>
      </div>

      {/* QR Code Container */}
      <div className="relative p-4 bg-surface rounded-2xl shadow-card border border-black/5">
        <div className="relative z-10 overflow-hidden bg-surface p-2 rounded-lg">
          <div className={`${isLoading ? "opacity-30 grayscale" : "opacity-100"} transition-all duration-300`}>
            <QRCodeSVG
              value={qrCode || "PENDING"}
              size={size}
              level="H"
              includeMargin={false}
              bgColor="var(--surface)"
              fgColor="var(--text)"
            />
          </div>
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-[1px]">
               <div className="w-8 h-8 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Countdown & Refresh Status */}
      <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full shadow-sm border border-black/5 w-full justify-center">
          <MaterialIcon
            name={isLoading ? "sync" : "timer"}
            className={`text-[18px] ${
              isLoading ? "animate-spin text-success" : 
              timeRemaining <= 10 ? "text-danger animate-pulse" : "text-success/70"
            }`}
          />
          <span
            className={`text-sm font-bold ${
              timeRemaining <= 10 ? "text-danger" : "text-success"
            }`}
          >
            {isLoading ? "Đang cập nhật..." : `Cập nhật sau ${timeRemaining}s`}
          </span>
        </div>
        
        {error && (
            <span className="text-[11px] text-danger font-medium animate-bounce text-center">{error}</span>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-2 flex items-start gap-2 px-4 py-3 bg-warning/5 rounded-xl border border-warning/10 max-w-[250px]">
        <MaterialIcon name="security" className="text-warning text-[16px] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-warning/80 text-center">
          Mã QR sẽ thay đổi liên tục. Vui lòng không chụp màn hình để đảm bảo an toàn.
        </p>
      </div>
    </div>
  );
}
