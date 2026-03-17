import { memo } from 'react';
import { Link } from 'react-router-dom';
import logoLg from '@/assets/images/logo-lg.png';

function HomeFooter() {
  return (
    <footer className="mx-auto max-w-[1240px] bg-transparent px-4 py-14">
      <div className="grid gap-6 rounded-3xl border border-gray-100 bg-white px-6 py-8 md:grid-cols-3 md:px-8">
        <div className="max-w-sm">
          <img src={logoLg} alt="UniLife" className="h-9 w-auto" />
          <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">
            Đặt món nhanh, thanh toán tiện lợi và nhận món thông minh ngay trong khuôn viên trường.
          </p>
        </div>

        <nav className="grid content-start gap-2 text-xs font-medium text-muted sm:text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text sm:text-sm">Điều hướng</p>
          <Link to="/menu" className="transition-all duration-300 hover:translate-x-0.5 hover:text-orange-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35">
            Menu
          </Link>
          <Link to="/favorite" className="transition-all duration-300 hover:translate-x-0.5 hover:text-orange-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35">
            Yêu thích
          </Link>
          <Link to="/orders" className="transition-all duration-300 hover:translate-x-0.5 hover:text-orange-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35">
            Đơn hàng
          </Link>
          <Link to="/profile" className="transition-all duration-300 hover:translate-x-0.5 hover:text-orange-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35">
            Tài khoản
          </Link>
        </nav>

        <div className="grid content-start gap-2 text-xs text-muted sm:text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text sm:text-sm">Pháp lý</p>
          <Link to="/profile" className="transition-all duration-300 hover:text-orange-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35">Quy định sử dụng</Link>
          <Link to="/profile" className="transition-all duration-300 hover:text-orange-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35">Bảo mật dữ liệu</Link>
          <p className="pt-1 text-xs text-muted">© {new Date().getFullYear()} UniLife. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default memo(HomeFooter);
