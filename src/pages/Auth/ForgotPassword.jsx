import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import { sendForgotPasswordOTP } from "@/services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendForgotPasswordOTP(email);

      toast.success("Đã gửi mã OTP!", {
        description: "Vui lòng kiểm tra email của bạn",
        duration: 3000,
      });

      // Navigate to OTP verification page
      navigate("/forgot-password/verify", {
        state: { email },
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể gửi mã OTP. Vui lòng thử lại";

      setError(errorMessage);
      toast.error("Gửi OTP thất bại", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Nhập email của bạn để nhận mã xác thực
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
          />

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full flex justify-center py-2 px-4"
          >
            {loading ? "Đang gửi..." : "Gửi mã xác thực"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Đã nhớ mật khẩu?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
