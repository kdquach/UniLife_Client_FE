import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import imageNotFound from "@/assets/images/image-not-found.png";

const FALLBACK_BANNER = {
  title: "Thưởng thức món ngon tại căn tin UniLife",
  description:
    "Đặt món nhanh - Thanh toán tiện lợi - Nhận món bằng QR ngay tại trường.",
  button: "Khám phá thực đơn",
  backgroundImage: imageNotFound,
};

function HomeBannerCarousel({ banners = [] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenSources, setBrokenSources] = useState({});

  const bannerItems = useMemo(() => {
    if (!Array.isArray(banners) || banners.length === 0) {
      return [FALLBACK_BANNER];
    }

    return banners.map((item) => ({
      ...FALLBACK_BANNER,
      ...item,
    }));
  }, [banners]);

  useEffect(() => {
    if (bannerItems.length <= 1) return undefined;

    const timerId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerItems.length);
    }, 4800);

    return () => {
      window.clearInterval(timerId);
    };
  }, [bannerItems.length]);

  const currentIndex = activeIndex % bannerItems.length;
  const currentBanner = bannerItems[currentIndex] || FALLBACK_BANNER;
  const primaryImage =
    currentBanner.backgroundImage ||
    currentBanner.imageUrl ||
    FALLBACK_BANNER.backgroundImage;
  const fallbackImage =
    currentBanner.fallbackImage || FALLBACK_BANNER.backgroundImage;
  const imageSource = brokenSources[currentIndex]
    ? fallbackImage
    : primaryImage;

  const handlePrimaryAction = () => {
    navigate("/menu");
  };

  useEffect(() => {
    const imageProbe = new Image();
    imageProbe.src = primaryImage;
    imageProbe.onerror = () => {
      setBrokenSources((prev) => ({ ...prev, [currentIndex]: true }));
    };
  }, [currentIndex, primaryImage]);

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + bannerItems.length) % bannerItems.length,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % bannerItems.length);
  };

  return (
    <section className="relative w-full bg-transparent">
      <div
        className="relative h-[340px] w-full overflow-hidden rounded-3xl border border-white/30 bg-slate-900 bg-cover bg-center md:h-[430px]"
        style={{ backgroundImage: `url(${imageSource || imageNotFound})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/15" />
        <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-4">
          <div
            key={`content-${currentIndex}`}
            className="max-w-[580px] space-y-4 p-6 text-white"
          >
            <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              UniLife Food Market
            </span>

            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              {currentBanner.title || FALLBACK_BANNER.title}
            </h1>

            <p className="max-w-[520px] text-sm text-white/90 md:text-base">
              {currentBanner.description || FALLBACK_BANNER.description}
            </p>

            <button
              type="button"
              onClick={handlePrimaryAction}
              className="rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35"
            >
              {currentBanner.button || FALLBACK_BANNER.button}
            </button>
          </div>
        </div>
      </div>

      {bannerItems.length > 1 && (
        <div className="mx-auto mt-4 flex max-w-[1400px] items-center justify-between px-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-text transition-all duration-300 hover:scale-105 hover:bg-orange-50 hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35"
              aria-label="Banner trước"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-text transition-all duration-300 hover:scale-105 hover:bg-orange-50 hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/35"
              aria-label="Banner kế tiếp"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            {bannerItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Đi tới banner ${idx + 1}`}
                className={`h-2.5 rounded-full transition ${
                  idx === currentIndex
                    ? "w-8 bg-orange-500"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default memo(HomeBannerCarousel);
