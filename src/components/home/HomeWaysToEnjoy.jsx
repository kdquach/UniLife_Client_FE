import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ShoppingBag } from "lucide-react";

const comTam =
  "https://product.hstatic.net/200000043306/product/suon_mem_37e0413282ed4ef08a3deb974ad55faf_large.png";

function HomeWaysToEnjoy() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-[1240px] py-20">
      <div className="grid gap-8 lg:grid-cols-12">

        {/* LEFT */}
        <div className="grid lg:col-span-4 grid-rows-2 gap-6">

          {/* CARD */}
          <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-zinc-900 to-black p-7 text-white transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <Store size={20}/>
              </div>

              <div>
                <h4 className="text-base font-semibold">
                  Ăn tại căn tin
                </h4>

                <p className="mt-1 text-sm text-white/70">
                  Thanh toán QR và nhận món trực tiếp tại quầy.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/menu")}
              className="mt-6 w-fit rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold hover:bg-orange-600"
            >
              Khám phá
            </button>
          </article>

          {/* CARD */}
          <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-zinc-900 to-black p-7 text-white transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <ShoppingBag size={20}/>
              </div>

              <div>
                <h4 className="text-base font-semibold">
                  Đặt mang đi
                </h4>

                <p className="mt-1 text-sm text-white/70">
                  Đặt trước và ghé lấy đúng giờ để tiết kiệm thời gian.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/orders")}
              className="mt-6 w-fit rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold hover:bg-orange-600"
            >
              Tạo đơn
            </button>
          </article>

        </div>

        {/* HERO */}
        <div className="relative lg:col-span-8">

          <div className="relative h-[380px] overflow-visible rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-12 text-white">

            {/* pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.9) 1.6px, transparent 1.6px)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* floating dish */}
            <img
              src={comTam}
              alt="Cơm tấm"
              className="pointer-events-none absolute right-[-60px] top-[-100px] z-10 w-[440px] rotate-[-7deg] drop-shadow-[0_40px_80px_rgba(0,0,0,0.35)] transition duration-500 hover:scale-105"
            />

            {/* content */}
            <div className="relative z-10 max-w-[460px]">
              <p className="text-xs uppercase tracking-widest text-white/80">
                Ways to enjoy
              </p>

              <h3 className="mt-4 text-4xl font-bold leading-tight">
                Thưởng thức món ngon theo cách bạn muốn
              </h3>

              <p className="mt-4 text-sm text-white/90">
                Từ cơm tấm, bún bò đến các món ăn nhanh. UniLife giúp bạn đặt
                món nhanh chóng ngay tại trường.
              </p>

              <button
                onClick={() => navigate("/menu")}
                className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 hover:bg-gray-100"
              >
                Đặt món ngay
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default memo(HomeWaysToEnjoy);