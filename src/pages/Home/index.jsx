export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-h))] flex-col">
      <section className="flex-1">
        <div className="grid gap-8 rounded-surface bg-surface p-8 shadow-surface">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold text-text">Unilife</h1>
            <p className="max-w-2xl text-muted">
              Landing page (Home) vẫn giữ layout header + sidebar như mặc định. Riêng Home có thêm footer như bạn yêu cầu.
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <a
              href="/menu"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-inverse hover:bg-primaryHover"
            >
              Go to Menu
            </a>
            <a
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-surface px-5 text-sm font-semibold text-text shadow-card transition duration-200 hover:shadow-lift"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      <footer className="mt-8">
        <div className="mx-auto flex max-w-350 flex-col gap-2 rounded-surface bg-surface px-4 py-6 text-sm text-muted shadow-surface sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>© {new Date().getFullYear()} Unilife</span>
          <div className="flex gap-4">
            <a href="/menu" className="hover:underline">Menu</a>
            <a href="/favorite" className="hover:underline">Favorite</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
