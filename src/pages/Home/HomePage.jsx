import { useCallback, useEffect, useMemo, useState } from 'react';
import HomeBannerCarousel from '@/components/home/HomeBannerCarousel.jsx';
import TodayMenuCarousel from '@/components/home/TodayMenuCarousel.jsx';
import TopRatedProductsCarousel from '@/components/home/TopRatedProductsCarousel.jsx';
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
import { useProduct } from '@/hooks/useProduct.js';
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

const PRODUCT_SEED = [
  {
    _id: 'seed-1',
    name: 'Cơm gà sốt nấm',
    description: 'Phần cơm nóng kèm gà áp chảo và sốt nấm thơm béo.',
    image:
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=900&q=80',
    price: 35000,
    averageRating: 4.8,
    isPopular: true,
  },
  {
    _id: 'seed-2',
    name: 'Bún bò UniLife',
    description: 'Nước dùng đậm vị, topping đầy đủ cho bữa trưa năng lượng.',
    image:
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
    price: 42000,
    averageRating: 4.7,
    isPopular: true,
  },
  {
    _id: 'seed-3',
    name: 'Mì xào hải sản',
    description: 'Sợi mì dai kết hợp hải sản tươi và rau củ theo ngày.',
    image:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
    price: 39000,
    averageRating: 4.6,
    isPopular: true,
  },
  {
    _id: 'seed-4',
    name: 'Gà nướng mật ong',
    description: 'Gà nướng vàng óng, ăn kèm salad và khoai nướng.',
    image:
      'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=900&q=80',
    price: 45000,
    averageRating: 4.9,
    isPopular: true,
  },
  {
    _id: 'seed-5',
    name: 'Salad cá ngừ',
    description: 'Lựa chọn healthy với rau tươi, cá ngừ và sốt chanh nhẹ.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    price: 33000,
    averageRating: 4.5,
    isPopular: false,
  },
  {
    _id: 'seed-6',
    name: 'Hamburger bò phô mai',
    description: 'Bánh burger mềm, bò nướng và phô mai tan chảy.',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    price: 38000,
    averageRating: 4.7,
    isPopular: true,
  },
  {
    _id: 'seed-7',
    name: 'Trà đào cam sả',
    description: 'Thức uống giải nhiệt vị thanh mát, phù hợp mọi khung giờ.',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    price: 26000,
    averageRating: 4.6,
    isPopular: true,
  },
  {
    _id: 'seed-8',
    name: 'Bánh mousse xoài',
    description: 'Món tráng miệng nhẹ với lớp mousse xoài mịn mát.',
    image:
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
    price: 28000,
    averageRating: 4.8,
    isPopular: false,
  },
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

const getProductRating = (product) => {
  const rating = Number(
    product?.averageRating ?? product?.ratingAverage ?? product?.rating ?? 0
  );

  return Number.isNaN(rating) ? 0 : rating;
};

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
    products: topRatedProducts,
    loading: loadingTopRated,
    fetchAll: fetchTopRatedAll,
    fetchByCanteen: fetchTopRatedByCanteen,
    reset: resetTopRated,
  } = useProduct();

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

      const topQuery = {
        limit: 60,
        status: 'available',
        sort: '-averageRating,-rating,-createdAt',
      };

      const fallbackQuery = {
        limit: 60,
        status: 'available',
      };

      try {
        if (selectedCanteen?.id) {
          await fetchTopRatedByCanteen(selectedCanteen.id, topQuery);
        } else {
          await fetchTopRatedAll(topQuery);
        }
      } catch {
        try {
          if (selectedCanteen?.id) {
            await fetchTopRatedByCanteen(selectedCanteen.id, fallbackQuery);
          } else {
            await fetchTopRatedAll(fallbackQuery);
          }
        } catch (fallbackError) {
          console.error('Khong the tai du lieu mon yeu thich', fallbackError);
        }
      }
    };

    loadData();
  }, [
    fetchDailyMenuByCanteen,
    fetchTopRatedAll,
    fetchTopRatedByCanteen,
    resetDailyMenu,
    resetTopRated,
    selectedCanteen,
  ]);

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
    return PRODUCT_SEED;
  }, [todayProducts]);

  const todayCards = useMemo(
    () => todayBase.slice(0, 8).map(mapToCardItem),
    [mapToCardItem, todayBase]
  );

  const topBase = useMemo(() => {
    if (Array.isArray(topRatedProducts) && topRatedProducts.length > 0)
      return topRatedProducts;
    return PRODUCT_SEED;
  }, [topRatedProducts]);

  const topCards = useMemo(() => {
    return [...topBase]
      .sort((a, b) => {
        const ratingDiff = getProductRating(b) - getProductRating(a);
        if (ratingDiff !== 0) return ratingDiff;
        return Number(Boolean(b?.isPopular)) - Number(Boolean(a?.isPopular));
      })
      .slice(0, 8)
      .map(mapToCardItem);
  }, [mapToCardItem, topBase]);

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

  const showFeaturesSkeleton =
    loadingToday && loadingTopRated && todayProducts.length === 0;

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

      {loadingTopRated && topRatedProducts.length === 0 ? (
        <CarouselSkeleton title="Đang tải món được yêu thích" />
      ) : (
        <TopRatedProductsCarousel products={topCards} />
      )}

      <HomeWaysToEnjoy heroImage="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1400&q=80" />

      <HomeCommunitySection images={COMMUNITY_SEED} />

      <HomeFooter />
    </div>
  );
}
