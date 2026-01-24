import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button.jsx";
import { verifyRegisterOTP, sendRegisterOTP } from "@/services/auth.service";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  const { email, userData } = location.state || {};

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      navigate("/register");
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pasteData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyRegisterOTP({ email, otp: otpCode });

      toast.success("Đăng ký thành công!", {
        description: "Chào mừng bạn đến với UniLife",
        duration: 3000,
      });

      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (err) {
      console.error("Verify OTP error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Xác thực OTP thất bại";

      setError(errorMessage);
      toast.error("Xác thực thất bại", {
        description: errorMessage,
        duration: 4000,
      });

      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !userData) return;

    setResendLoading(true);
    setError("");

    try {
      await sendRegisterOTP(userData);

      toast.success("Đã gửi lại mã OTP", {
        description: "Vui lòng kiểm tra email của bạn",
        duration: 3000,
      });

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Resend OTP error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể gửi lại OTP";

      setError(errorMessage);
      toast.error("Gửi lại OTP thất bại", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Xác thực OTP</h1>
          <p className="mt-2 text-sm text-gray-600">
            Chúng tôi đã gửi mã xác thực đến
          </p>
          <p className="font-medium text-blue-600">{email}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="w-full flex justify-center py-2 px-4"
          >
            {loading ? "Đang xác thực..." : "Xác nhận"}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
              >
                {resendLoading ? "Đang gửi..." : "Gửi lại mã OTP"}
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Gửi lại mã sau{" "}
                <span className="font-medium text-blue-600">{countdown}s</span>
              </p>
            )}
          </div>

          {/* Back to register */}
          <p className="text-center text-sm text-gray-600">
            Nhập sai email?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Quay lại đăng ký
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
