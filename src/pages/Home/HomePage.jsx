import { useCallback, useEffect, useMemo, useState } from 'react';
import HomeBannerCarousel from '@/components/home/HomeBannerCarousel.jsx';
import TodayMenuCarousel from '@/components/home/TodayMenuCarousel.jsx';
import HomeFeaturesSection from '@/components/home/HomeFeaturesSection.jsx';
import HomeWaysToEnjoy from '@/components/home/HomeWaysToEnjoy.jsx';
import HomeCommunitySection from '@/components/home/HomeCommunitySection.jsx';
import HomeFooter from '@/components/home/HomeFooter.jsx';
import BannerSkeleton from '@/components/skeleton/BannerSkeleton.jsx';
import CarouselSkeleton from '@/components/skeleton/CarouselSkeleton.jsx';
import FeaturesSkeleton from '@/components/skeleton/FeaturesSkeleton.jsx';
import homeBanner1 from '@/assets/images/home-banner-1.svg';
import homeBanner2 from '@/assets/images/home-banner-2.svg';
import homeBanner3 from '@/assets/images/home-banner-3.svg';
import { useBanner } from '@/hooks/useBanner.js';
import { useDailyMenu } from '@/hooks/useDailyMenu.js';
import { useWishlist } from '@/hooks/useWishlist.js';
import { useCartStore } from '@/store/cart.store.js';
import { useRightPanel } from '@/store/rightPanel.store.js';
import { useCampusStore } from '@/store/useCampusStore.js';

const BANNER_SEED = [
  {
    title: 'Món ngon nóng hổi giao nhanh trong khuôn viên UniLife',
    description:
      'Khám phá thực đơn mới mỗi ngày, đặt món chỉ trong vài chạm và nhận món đúng giờ học của bạn.',
    button: 'Khám phá thực đơn',
    backgroundImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80',
    fallbackImage: homeBanner1,
  },
  {
    title: 'Bữa trưa chất lượng như nhà hàng ngay tại trường',
    description:
      'Từ pizza nóng giòn đến các set cơm đầy đặn, UniLife giúp bạn tìm món hợp khẩu vị nhanh hơn bao giờ hết.',
    button: 'Đặt món ngay',
    backgroundImage:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1800&q=80',
    fallbackImage: homeBanner2,
  },
  {
    title: 'Thực đơn hấp dẫn cho mọi khung giờ trong ngày',
    description:
      'Xem món phổ biến, thêm vào giỏ tức thì và theo dõi đơn hàng thời gian thực ngay trên UniLife.',
    button: 'Xem món hot',
    backgroundImage:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1800&q=80',
    fallbackImage: homeBanner3,
  },
];

const FEATURE_SEED = [
  'Thanh toán QR',
  'Thanh toán đa nền tảng',
  'Đặt món nhanh',
  'Theo dõi đơn hàng',
  'Thực đơn theo ngày',
  'Gợi ý món ăn thông minh',
];

const COMMUNITY_SEED = [
  {
    id: 'campus-1',
    title: 'Campus Hà Nội',
    subtitle:
      'Nơi hội tụ nhiều mô hình căn tin hiện đại phục vụ sinh viên suốt ngày học.',
    src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
    alt: 'Campus Hà Nội',
  },
  {
    id: 'campus-2',
    title: 'Campus TP.HCM',
    subtitle:
      'Không gian học tập năng động với hệ sinh thái ẩm thực đa dạng và tiện lợi.',
    src: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=900&q=80',
    alt: 'Campus TP.HCM',
  },
  {
    id: 'campus-3',
    title: 'Campus Đà Nẵng',
    subtitle:
      'Trải nghiệm đặt món nhanh và nhận món đúng giờ trong khuôn viên xanh mát.',
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    alt: 'Campus Đà Nẵng',
  },
  {
    id: 'campus-4',
    title: 'Campus Quy Nhơn',
    subtitle:
      'Không gian công nghệ với dịch vụ căn tin thông minh cho sinh viên.',
    src: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
    alt: 'Campus Quy Nhơn',
  },
  {
    id: 'campus-5',
    title: 'Campus Cần Thơ',
    subtitle:
      'Điểm đến ẩm thực học đường với menu cập nhật theo nhu cầu sinh viên.',
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    alt: 'Campus Cần Thơ',
  },
];

export default function HomePage() {
  const cart = useCartStore();
  const panel = useRightPanel();
  const { selectedCanteen } = useCampusStore();

  const {
    banners,
    loading: loadingBanners,
    fetchActive: fetchActiveBanners,
  } = useBanner();

  const {
    products: todayProducts,
    loading: loadingToday,
    fetchByCanteen: fetchDailyMenuByCanteen,
    reset: resetDailyMenu,
  } = useDailyMenu();

  const {
    ids: wishlistIds,
    fetch: fetchWishlist,
    toggle: toggleWishlist,
  } = useWishlist();

  const [bannerReady, setBannerReady] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => setBannerReady(true), 180);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    fetchWishlist().catch(() => {});
  }, [fetchWishlist]);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchActiveBanners(
          selectedCanteen?.id ? { canteenId: selectedCanteen.id } : {}
        );
      } catch (ERROR) {
        console.error('Khong the tai du lieu banner', ERROR);
      }
    };

    loadBanners();
  }, [fetchActiveBanners, selectedCanteen]);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedCanteen?.id) {
        resetDailyMenu();
      } else {
        try {
          await fetchDailyMenuByCanteen(selectedCanteen.id);
        } catch (ERROR) {
          console.error('Khong the tai du lieu thuc don hom nay', ERROR);
        }
      }
    };

    loadData();
  }, [fetchDailyMenuByCanteen, resetDailyMenu, selectedCanteen]);

  const isInCart = useCallback(
    (productId) =>
      cart.lines?.some((line) => {
        const lineId = line?.productId?._id || line?.productId || line?.itemId;
        return String(lineId) === String(productId);
      }),
    [cart.lines]
  );

  const mapToCardItem = useCallback(
    (product) => {
      const id = product?._id || product?.id;
      return {
        id,
        image: product?.image,
        name: product?.name || 'Món ăn UniLife',
        description: product?.description || 'Đang cập nhật mô tả món ăn.',
        price: Number(product?.price || 0),
        inCart: isInCart(id),
        wishlisted: wishlistIds.has(id),
        onToggleWishlist: () => {
          toggleWishlist(id).catch(() => {});
        },
        onAddToCart: () => {
          cart.addItem(id, 1);
          panel.openCart?.();
        },
      };
    },
    [cart, isInCart, panel, toggleWishlist, wishlistIds]
  );

  const todayBase = useMemo(() => {
    if (Array.isArray(todayProducts) && todayProducts.length > 0)
      return todayProducts;
    return [];
  }, [todayProducts]);

  const todayCards = useMemo(
    () => todayBase.slice(0, 8).map(mapToCardItem),
    [mapToCardItem, todayBase]
  );

  const bannerItems = useMemo(() => {
    if (!Array.isArray(banners) || banners.length === 0) return BANNER_SEED;

    return banners.map((banner) => ({
      id: banner?._id || banner?.id,
      title: banner?.title || '',
      description: banner?.description || '',
      backgroundImage: banner?.imageUrl,
      fallbackImage: banner?.fallbackImage,
      linkUrl: banner?.linkUrl,
      button: banner?.linkUrl ? 'Xem chi tiết' : 'Khám phá thực đơn',
    }));
  }, [banners]);

  const showFeaturesSkeleton = loadingToday && todayProducts.length === 0;

  return (
    <div className="grid gap-8 bg-transparent">
      {bannerReady && !loadingBanners ? (
        <HomeBannerCarousel banners={bannerItems} />
      ) : (
        <BannerSkeleton />
      )}

      {loadingToday && todayProducts.length === 0 ? (
        <CarouselSkeleton title="Đang tải thực đơn hôm nay" />
      ) : (
        <TodayMenuCarousel products={todayCards} />
      )}

      {showFeaturesSkeleton ? (
        <FeaturesSkeleton />
      ) : (
        <HomeFeaturesSection
          introTitle="Giới thiệu hệ thống UniLife"
          introText="Căn tin UniLife mang đến trải nghiệm đặt món thông minh cho sinh viên với quy trình nhanh gọn, thanh toán thuận tiện và theo dõi đơn hàng rõ ràng theo thời gian thực."
          features={FEATURE_SEED}
          image="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80"
        />
      )}

      <HomeWaysToEnjoy heroImage="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1400&q=80" />

      <HomeCommunitySection images={COMMUNITY_SEED} />

      <HomeFooter />
    </div>
  );
}
