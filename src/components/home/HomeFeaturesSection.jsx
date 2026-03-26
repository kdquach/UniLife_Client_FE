import { memo, useEffect, useState } from "react";
import {
  BadgeCheck,
  QrCode,
  CreditCard,
  Timer,
  ReceiptText,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import imageNotFound from "@/assets/images/image-not-found.png";

const FEATURE_ICON_MAP = {
  "Thanh toán QR": QrCode,
  "Thanh toán đa nền tảng": CreditCard,
  "Đặt món nhanh": Timer,
  "Theo dõi đơn hàng": ReceiptText,
  "Thực đơn theo ngày": CalendarDays,
  "Gợi ý món ăn thông minh": Sparkles,
};

const FEATURE_CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80",
];

function HomeFeaturesSection({ introTitle, introText, features = [], image }) {
  const images = [image || FEATURE_CAROUSEL_IMAGES[0], FEATURE_CAROUSEL_IMAGES[1], FEATURE_CAROUSEL_IMAGES[2]];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4200);

    return () => {
      window.clearInterval(timerId);
    };
  }, [images.length]);

  const prev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const next = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const getIndex = (offset) => {
    return (index + offset + images.length) % images.length;
  };

  return (
    <section className="mx-auto max-w-[1100px] px-4 py-24">

      {/* HEADER */}
      <div className="mx-auto max-w-[700px] text-center">

        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          <BadgeCheck size={14}/>
          Hệ thống căn tin thông minh
        </span>

        <h2 className="mt-4 text-3xl font-bold text-text md:text-4xl">
          {introTitle}
        </h2>

        <p className="mt-4 text-gray-600 leading-7">
          {introText}
        </p>

      </div>

      {/* FEATURES */}
      <div className="mt-14 grid gap-10 md:grid-cols-3">

        {features.map((feature) => {
          const Icon = FEATURE_ICON_MAP[feature] || BadgeCheck;

          return (
            <div
              key={feature}
              className="text-center"
            >

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
                <Icon size={18}/>
              </div>

              <h4 className="mt-4 font-semibold text-text">
                {feature}
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Trải nghiệm nhanh chóng và tiện lợi dành cho sinh viên.
              </p>

            </div>
          );
        })}

      </div>

      {/* IMAGE CAROUSEL */}
      <div className="relative mx-auto mt-16 w-full max-w-[980px] py-4">
        <div className="relative flex items-center justify-center">

          <img
            src={images[getIndex(-1)] || imageNotFound}
            alt="Campus trái"
            className="absolute left-0 hidden w-[260px] scale-90 rounded-[28px] border border-gray-100 object-cover opacity-60 md:block"
          />

          <img
            src={images[getIndex(0)] || imageNotFound}
            alt="Campus chính"
            className="relative z-10 h-[280px] w-[420px] rounded-[32px] border border-gray-100 object-cover transition-all duration-300 md:h-[360px]"
          />

          <img
            src={images[getIndex(1)] || imageNotFound}
            alt="Campus phải"
            className="absolute right-0 hidden w-[260px] scale-90 rounded-[28px] border border-gray-100 object-cover opacity-60 md:block"
          />

        </div>

        <div className="mt-6 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Tới ảnh ${i + 1}`}
              className={`h-2 w-2 rounded-full ${
                i === index ? "bg-orange-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={prev}
          className="absolute left-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-text transition-all duration-300 hover:bg-orange-50 hover:text-orange-500"
          aria-label="Ảnh trước"
        >
          <ChevronLeft size={18}/>
        </button>

        <button
          type="button"
          onClick={next}
          className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-text transition-all duration-300 hover:bg-orange-50 hover:text-orange-500"
          aria-label="Ảnh kế tiếp"
        >
          <ChevronRight size={18}/>
        </button>
      </div>

    </section>
  );
}

export default memo(HomeFeaturesSection);