import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-text">404</h1>
      <p className="mt-3 text-sm text-gray-500 sm:text-base">Trang không tồn tại</p>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primaryHover"
      >
        Về trang chủ
      </button>
    </div>
  );
}
