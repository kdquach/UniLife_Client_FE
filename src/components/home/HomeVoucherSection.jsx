import { useMemo, useState } from 'react';
import clsx from 'clsx';
import MaterialIcon from '@/components/MaterialIcon.jsx';

const TEXT = {
  title: 'Voucher đang áp dụng',
  subtitle: 'Chạm để sao chép mã và dùng khi thanh toán.',
  empty: 'Hiện chưa có voucher hoạt động cho căn tin này.',
  copy: 'Sao chép',
  copied: 'Đã sao chép',
};

export default function HomeVoucherSection({ vouchers = [], loading }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const visibleVouchers = useMemo(() => {
    if (!Array.isArray(vouchers)) return [];
    return vouchers.filter((voucher) => voucher?.code).slice(0, 6);
  }, [vouchers]);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(String(code || ''));
      setCopiedCode(String(code));
      window.setTimeout(() => {
        setCopiedCode((current) => (current === String(code) ? null : current));
      }, 1200);
    } catch (ERROR) {
      console.error('Không thể copy mã voucher', ERROR);
    }
  };

  return (
    <section className="rounded-3xl border border-surfaceMuted bg-surface p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {TEXT.title}
          </h2>
          <p className="text-sm text-muted">{TEXT.subtitle}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-surfaceMuted text-muted">
          <MaterialIcon name="local_offer" className="text-[20px]" />
        </div>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-2">
          <div className="h-12 rounded-2xl bg-surfaceMuted" />
          <div className="h-12 rounded-2xl bg-surfaceMuted" />
        </div>
      ) : visibleVouchers.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-surfaceMuted px-4 py-3 text-sm text-muted">
          {TEXT.empty}
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {visibleVouchers.map((voucher) => {
            const code = voucher.code;
            const isCopied = String(copiedCode) === String(code);
            return (
              <div
                key={voucher?._id || code}
                className="flex items-center justify-between gap-3 rounded-2xl border border-surfaceMuted bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {code}
                  </p>
                  {voucher?.displayDescription ? (
                    <p className="truncate text-xs text-muted">
                      {voucher.displayDescription}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(code)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                    isCopied
                      ? 'bg-surfaceMuted text-foreground'
                      : 'bg-primary text-inverse hover:bg-primary-hover'
                  )}
                >
                  <MaterialIcon
                    name={isCopied ? 'check' : 'content_copy'}
                    className="text-[18px]"
                  />
                  <span>{isCopied ? TEXT.copied : TEXT.copy}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
