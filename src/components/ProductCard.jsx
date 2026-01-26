import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import imageNotFound from '@/assets/images/image-not-found.png';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import { money } from '@/utils/currency.js';

const BUTTON_MS = 220;
const SWAP_MS = 200;

export default function ProductCard({
  productId,
  image,
  name,
  description,
  price,
  inCart,
  wishlisted,
  onToggleWishlist,
  onAddToCart,
}) {
  const navigate = useNavigate();
  const imageWrapRef = useRef(null);
  const timersRef = useRef([]);

  // Button state machine
  const [ui, setUi] = useState('idle'); // 'idle' | 'hover' | 'adding' | 'added'
  const [press, setPress] = useState(false);
  const [optimisticAdded, setOptimisticAdded] = useState(false);

  const isAdded = Boolean(inCart || optimisticAdded);

  const priceText = useMemo(() => money(price), [price]);

  useEffect(() => {
    // Sync from source-of-truth.
    if (inCart) {
      setUi('added');
      setOptimisticAdded(false);
    } else if (!optimisticAdded && ui === 'added') {
      setUi('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCart]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const handleAdd = useCallback(() => {
    if (isAdded || ui === 'adding') return;

    clearTimers();
    setUi('adding');
    setPress(true);
    setOptimisticAdded(true);

    onAddToCart?.();

    // Step 1: press feedback
    timersRef.current.push(
      window.setTimeout(() => {
        setPress(false);
      }, 110)
    );

    // Step 2–3: cart flies out, check flies in
    timersRef.current.push(window.setTimeout(() => { }, BUTTON_MS));

    // Step 4: settle
    timersRef.current.push(
      window.setTimeout(() => {
        setUi('added');
      }, BUTTON_MS + SWAP_MS)
    );

    // If cart state doesn't confirm, revert after a moment.
    timersRef.current.push(
      window.setTimeout(() => {
        if (!inCart) {
          setOptimisticAdded(false);
          setUi('idle');
        }
      }, 1600)
    );
  }, [clearTimers, inCart, isAdded, onAddToCart, ui]);

  const onBtnEnter = useCallback(() => {
    if (isAdded || ui === 'adding') return;
    setUi('hover');
  }, [isAdded, ui]);

  const onBtnLeave = useCallback(() => {
    if (ui !== 'hover') return;
    setUi('idle');
  }, [ui]);

  return (
    <article
      onClick={() => productId && navigate(`/products/${productId}`)}
      className={clsx(
        'group relative overflow-hidden rounded-card bg-surface p-3 shadow-card transition duration-200 cursor-pointer',
        'hover:shadow-lift hover:scale-[1.02]'
      )}
    >
      {/* Row 1: Image */}
      <div
        ref={imageWrapRef}
        className="relative aspect-square w-full overflow-hidden rounded-card bg-slate-100"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <img
            src={imageNotFound}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
            loading="lazy"
          />
        )}
      </div>

      {/* Rows 2–4 */}
      <div className="grid gap-1 px-1 pb-1 pt-3">
        <h3 className="truncate text-[15px] font-semibold text-text">{name}</h3>
        <p className="line-clamp-2 text-sm text-muted">{description}</p>
        <p className="truncate text-lg font-extrabold text-primary tracking-tight">
          {priceText}
        </p>
      </div>

      {/* Row 5: Actions */}
      <div className="mt-2 flex items-center gap-3 px-1 pb-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.();
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={clsx(
            'group relative shrink-0 cursor-pointer',
            'grid h-11 w-11 place-items-center rounded-xl',
            'transform-gpu',
            'transition-all duration-200 ease-out',
            'shadow-card overflow-hidden',
            wishlisted
              ? 'bg-primary/10 text-primary'
              : 'bg-surfaceMuted text-muted',
            'hover:bg-surface hover:shadow-lift hover:ring-2 hover:ring-primary/20',
            'hover:scale-[1.05] active:scale-95'
          )}
        >
          {/* Pulse ring */}
          {wishlisted && (
            <span
              aria-hidden
              className="
        absolute inset-0 rounded-xl
        bg-primary/20
        animate-[ping_0.6s_ease-out_1]
      "
            />
          )}

          {/* Icon */}
          <span
            className={clsx(
              'relative z-10',
              'transition-transform duration-200 ease-out transition-colors',
              wishlisted ? 'scale-110 group-hover:text-primary' : 'scale-100 group-hover:text-primary'
            )}
          >
            <MaterialIcon
              name="favorite"
              filled={wishlisted}
              className="text-[20px]"
            />
          </span>
        </button>

        <button
          type="button"
          disabled={isAdded}
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
          onMouseEnter={onBtnEnter}
          onMouseLeave={onBtnLeave}
          className={clsx(
            'group flex h-11 flex-1 items-center justify-center gap-2 cursor-pointer',
            'rounded-xl px-4 text-sm font-semibold shadow-card',
            'transition-all duration-200 ease-out',
            isAdded
              ? 'bg-primary text-inverse'
              : 'bg-surfaceMuted text-text hover:bg-primary hover:text-inverse',
            'hover:shadow-lift hover:scale-[1.02] hover:ring-2 hover:ring-primary/20',
            press && 'scale-95'
          )}
        >
          {/* CART ICON (hover) */}
          <span
            className={clsx(
              'flex items-center justify-center overflow-hidden',
              'transition-all duration-200 ease-out',
              // idle
              ui === 'idle' && 'w-0 opacity-0 -translate-x-1',
              // hover
              ui === 'hover' && 'w-4 opacity-100 translate-x-0',
              // adding / added
              (ui === 'adding' || isAdded) && 'w-0 opacity-0'
            )}
          >
            <MaterialIcon name="shopping_cart" className="text-[16px]" />
          </span>

          {/* TEXT */}
          <span className="whitespace-nowrap">Đặt món ngay</span>

          {/* CHECK ICON (active / added) */}
          <span
            className={clsx(
              'flex items-center justify-center overflow-hidden',
              'transition-all duration-200 ease-out',
              // idle / hover
              !isAdded && ui !== 'adding' && 'w-0 opacity-0 translate-x-1',
              // adding
              ui === 'adding' && 'w-4 opacity-100 translate-x-0',
              // added
              isAdded && 'w-4 opacity-100 translate-x-0'
            )}
          >
            <MaterialIcon name="check" className="text-[16px]" />
          </span>
        </button>
      </div>
    </article>
  );
}
