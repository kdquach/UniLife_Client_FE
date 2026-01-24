import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import Input from "@/components/Input.jsx";
import Button from "@/components/Button.jsx";
import { resetPassword } from "@/services/auth.service";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state
  const { email, resetToken } = location.state || {};

  useEffect(() => {
    // Redirect if no data provided
    if (!email || !resetToken) {
      navigate("/forgot-password");
    }
  }, [email, resetToken, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ email, resetToken, newPassword });

      toast.success("Đặt lại mật khẩu thành công!", {
        description: "Vui lòng đăng nhập với mật khẩu mới",
        duration: 3000,
      });

      // Navigate to login page
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại";

      setError(errorMessage);
      toast.error("Đặt lại mật khẩu thất bại", {
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
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản
          </p>
          <p className="font-medium text-green-600">{email}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full flex justify-center py-2 px-4"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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
