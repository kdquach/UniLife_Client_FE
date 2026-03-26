import { Link } from "react-router-dom";
import clsx from "clsx";
import MaterialIcon from "@/components/MaterialIcon";
import { useHome } from "@/pages/Home/Home.logic";

const HOME_TEXT = {
  title: "Khám phá món ngon tại căn tin",
  subtitle:
    "Ưu đãi và thông báo mới nhất sẽ hiển thị theo căn tin bạn đang chọn để trải nghiệm đặt món nhanh và chính xác hơn.",
  chooseCanteen:
    "Bạn chưa chọn căn tin. Hãy chọn campus/canteen ở header để xem banner phù hợp.",
  noBanner: "Hiện chưa có banner hoạt động cho căn tin này.",
  retry: "Thử lại",
  goMenu: "Xem thực đơn",
  viewFavorites: "Món yêu thích",
};

export default function HomePage() {
  const {
    items,
    loading,
    error,
    refresh,
    currentIndex,
    setCurrentIndex,
    activeBanner,
    activeDurationText,
    canteenMeta,
    selectedCanteen,
  } = useHome();

  return (
    <div className="flex min-h-[calc(100vh-var(--header-h))] flex-col gap-8">
      <section className="grid gap-6 rounded-surface bg-surface p-6 shadow-surface md:p-8">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold text-text md:text-3xl">
            {HOME_TEXT.title}
          </h1>
          <p className="max-w-3xl text-sm text-muted md:text-base">
            {HOME_TEXT.subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
          <Link
            to="/menu"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-inverse transition hover:bg-primaryHover"
          >
            {HOME_TEXT.goMenu}
          </Link>
          <Link
            to="/favorite"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-surface px-5 text-sm font-semibold text-text shadow-card transition hover:shadow-lift"
          >
            {HOME_TEXT.viewFavorites}
          </Link>
        </div>
      </section>

      <section className="grid gap-5">
        <article className="relative overflow-hidden rounded-surface bg-surface shadow-surface">
          {activeBanner?.imageUrl ? (
            <div className="absolute inset-0">
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title || "Banner căn tin"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/15" />
            </div>
          ) : null}

          <div className="relative grid gap-5 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div className="grid gap-3 text-inverse">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <MaterialIcon name="storefront" className="text-sm" />
                {canteenMeta.name}
              </p>

              <h2 className="max-w-2xl text-2xl font-semibold leading-tight md:text-3xl">
                {activeBanner?.title || "Ưu đãi căn tin hôm nay"}
              </h2>

              <div className="grid gap-2 text-sm text-white/90 md:grid-cols-2">
                <p className="inline-flex items-center gap-2">
                  <MaterialIcon name="location_on" className="text-base" />
                  {canteenMeta.location || "Đang cập nhật vị trí"}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MaterialIcon name="schedule" className="text-base" />
                  {`${canteenMeta.openingTime} - ${canteenMeta.closingTime}`}
                </p>
                <p className="inline-flex items-center gap-2 md:col-span-2">
                  <MaterialIcon name="event" className="text-base" />
                  {activeDurationText || "Không giới hạn thời gian"}
                </p>
              </div>

              {activeBanner?.linkUrl ? (
                <a
                  href={activeBanner.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-text transition hover:shadow-lift"
                >
                  Xem chi tiết chương trình
                  <MaterialIcon name="open_in_new" className="text-base" />
                </a>
              ) : null}
            </div>

            <div className="grid h-fit gap-2 rounded-card bg-white/85 p-4 text-sm text-text backdrop-blur-sm md:min-w-56">
              <p className="font-semibold">Thông tin căn tin</p>
              <p className="text-muted">Tên: {canteenMeta.name}</p>
              <p className="text-muted">
                Giờ mở cửa: {canteenMeta.openingTime}
              </p>
              <p className="text-muted">
                Giờ đóng cửa: {canteenMeta.closingTime}
              </p>
              <p className="text-muted">Số banner hoạt động: {items.length}</p>
            </div>
          </div>
        </article>

        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-card bg-surface p-4 text-sm text-muted shadow-card">
              Đang tải banner căn tin...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="flex flex-wrap items-center gap-3 rounded-card border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
              <span>{error}</span>
              <button
                type="button"
                onClick={refresh}
                className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-inverse"
              >
                {HOME_TEXT.retry}
              </button>
            </div>
          ) : null}

          {!loading && !error && !selectedCanteen ? (
            <div className="rounded-card bg-info/10 p-4 text-sm text-text shadow-card">
              {HOME_TEXT.chooseCanteen}
            </div>
          ) : null}

          {!loading && !error && selectedCanteen && items.length === 0 ? (
            <div className="rounded-card bg-surface p-4 text-sm text-muted shadow-card">
              {HOME_TEXT.noBanner}
            </div>
          ) : null}

          {!loading && !error && items.length > 1 ? (
            <div className="grid gap-2 md:grid-cols-4">
              {items.map((banner, index) => (
                <button
                  key={banner._id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={clsx(
                    "group overflow-hidden rounded-card border bg-surface text-left transition",
                    currentIndex === index
                      ? "border-primary shadow-lift"
                      : "border-border shadow-card hover:border-primary/40",
                  )}
                >
                  <div className="h-28 w-full overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || `banner-${index + 1}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium text-text">
                      {banner.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="mt-auto">
        <div className="mx-auto flex max-w-350 flex-col gap-2 rounded-surface bg-surface px-4 py-6 text-sm text-muted shadow-surface sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>© {new Date().getFullYear()} UniLife</span>
          <div className="flex gap-4">
            <Link to="/menu" className="hover:underline">
              Menu
            </Link>
            <Link to="/favorite" className="hover:underline">
              Favorite
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
