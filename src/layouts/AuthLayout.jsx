import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center bg-appbg px-4">
      <div className="w-full max-w-md rounded-surface bg-white p-7 shadow-panel">
        <Link to="/" className="mb-4 block text-center text-xl font-semibold">Unilife</Link>
        <Outlet />
      </div>
    </div>
  );
}
