import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct.js';
import { useCartStore } from '@/store/cart.store.js';
import { money } from '@/utils/currency.js';
import MaterialIcon from '@/components/MaterialIcon.jsx';
import Loader from '@/components/Loader.jsx';
import FeedbackSection from '@/components/feedback/FeedbackSection.jsx';
import imageNotFound from '@/assets/images/image-not-found.png';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, fetchById } = useProduct();
  const cart = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchById(id).catch((err) => {
        console.error('Failed to fetch product:', err);
      });
    }
  }, [id, fetchById]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-text mb-4">
            Sản phẩm không tìm thấy
          </h2>
          <p className="text-muted mb-6">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/menu')}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primaryHover transition"
          >
            Quay lại menu
          </button>
        </div>
      </div>
    );
  }

  // Prepare image list
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [imageNotFound];

  const currentImage = images[selectedImage] || imageNotFound;

  const handleAddToCart = () => {
    cart.addItem(product._id, quantity);
    setQuantity(1);
    navigate('/menu', { state: { scrollToTop: true } });
  };

  const isInStock = product.status === 'available' && product.stockQuantity > 0;
  const isLowStock =
    product.stockQuantity !== undefined &&
    product.stockQuantity > 0 &&
    product.stockQuantity <= (product.lowStockThreshold || 10);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-5xl px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/menu')}
          className="mb-8 flex items-center gap-2 text-primary hover:text-primaryHover font-medium transition"
        >
          <MaterialIcon name="chevron_left" className="text-[20px]" />
          Quay lại menu
        </button>

        {/* Product Detail Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Image Gallery - Col 1-2 on MD */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="mb-4 flex items-center justify-center rounded-lg bg-slate-100 p-4 aspect-square">
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-20 rounded-lg overflow-hidden transition ${
                      selectedImage === idx
                        ? 'ring-2 ring-primary'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Col 2-3 */}
          <div className="flex flex-col gap-6">
            {/* Category & Title */}
            <div>
              {product.categoryId?.name && (
                <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                  {product.categoryId.name}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">
                {product.name}
              </h1>
              <p className="text-base text-muted leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Section */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {money(product.price)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-muted line-through">
                        {money(product.originalPrice)}
                      </span>
                      <span className="text-sm font-semibold text-warning bg-warning/10 px-2 py-1 rounded">
                        Giảm{' '}
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        %
                      </span>
                    </>
                  )}
              </div>

              {/* Stock Status */}
              <div className="pt-2">
                {isInStock ? (
                  <>
                    <p className="text-success font-semibold flex items-center gap-2">
                      <MaterialIcon
                        name="check_circle"
                        className="text-[18px]"
                      />
                      Còn hàng
                    </p>
                    {isLowStock && (
                      <p className="text-warning text-sm mt-1">
                        ⚠️ Chỉ còn {product.stockQuantity} sản phẩm
                      </p>
                    )}
                  </>
                ) : product.status === 'out_of_stock' ? (
                  <p className="text-danger font-semibold flex items-center gap-2">
                    <MaterialIcon
                      name="remove_circle"
                      className="text-[18px]"
                    />
                    Hết hàng
                  </p>
                ) : (
                  <p className="text-gray-600 font-semibold flex items-center gap-2">
                    <MaterialIcon name="block" className="text-[18px]" />
                    Không có sẵn
                  </p>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-divider">
              {product.preparationTime && (
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="schedule"
                    className="text-[20px] text-primary"
                  />
                  <div className="text-sm">
                    <p className="text-muted">Thời gian</p>
                    <p className="font-semibold text-text">
                      {product.preparationTime} phút
                    </p>
                  </div>
                </div>
              )}

              {product.calories && (
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="local_fire_department"
                    className="text-[20px] text-primary"
                  />
                  <div className="text-sm">
                    <p className="text-muted">Năng lượng</p>
                    <p className="font-semibold text-text">
                      {product.calories} kcal
                    </p>
                  </div>
                </div>
              )}

              {product.stockQuantity !== undefined && (
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="inventory_2"
                    className="text-[20px] text-primary"
                  />
                  <div className="text-sm">
                    <p className="text-muted">Số lượng</p>
                    <p className="font-semibold text-text">
                      {product.stockQuantity} cái
                    </p>
                  </div>
                </div>
              )}

              {product.canteenId?.name && (
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="restaurant"
                    className="text-[20px] text-primary"
                  />
                  <div className="text-sm">
                    <p className="text-muted">Từ</p>
                    <p className="font-semibold text-text">
                      {product.canteenId.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Flags */}
            {(product.isPopular || product.isNew) && (
              <div className="flex gap-2">
                {product.isPopular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning">
                    <MaterialIcon name="star" className="text-[14px]" filled />
                    Phổ biến
                  </span>
                )}
                {product.isNew && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-3 py-1.5 text-xs font-semibold text-info">
                    <MaterialIcon name="new_releases" className="text-[14px]" />
                    Mới
                  </span>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 py-4 border-y border-divider">
              <span className="text-sm font-medium text-text">Số lượng:</span>
              <div className="flex items-center bg-surfaceMuted rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!isInStock}
                  className="px-3 py-2 text-lg font-medium text-muted hover:text-text disabled:opacity-50"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold text-text text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!isInStock}
                  className="px-3 py-2 text-lg font-medium text-muted hover:text-text disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-muted ml-auto">
                = {money(product.price * quantity)}
              </span>
            </div>

            {/* CTA Buttons */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="w-full rounded-lg bg-primary px-6 py-3.5 text-lg font-semibold text-white hover:bg-primaryHover disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <MaterialIcon name="shopping_cart" className="text-[20px]" />
              {isInStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </button>
          </div>
        </div>

        {/* Recipe Section */}
        {product.recipe && product.recipe.length > 0 && (
          <div className="mt-12 pt-12 border-t border-divider">
            <h2 className="text-2xl font-bold text-text mb-6">Thành phần</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {product.recipe.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-card bg-surfaceMuted p-4 transition"
                >
                  <div>
                    <p className="font-medium text-text">
                      {item.ingredientName || `Thành phần ${idx + 1}`}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <FeedbackSection productId={product._id} />
      </div>
    </div>
  );
}
