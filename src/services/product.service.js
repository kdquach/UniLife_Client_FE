import { api } from '@/services/axios.config';

/**
 * Get all products with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.search - Search keyword in name, description, slug
 * @param {string} options.status - Filter by status (available, unavailable, out_of_stock, hidden)
 * @param {string} options.categoryId - Filter by category ID
 * @param {string} options.canteenId - Filter by canteen ID
 * @param {boolean} options.isPopular - Filter popular products (true/false)
 * @param {boolean} options.isNew - Filter new products (true/false)
 * @param {object} options.price - Price range filter { gte, lte }
 * @param {string} options.sort - Sort order (e.g., -price, name, createdAt)
 * @param {string} options.fields - Select specific fields (e.g., name,price,image)
 * @returns {Promise<Object>} - { status, data: { products }, pagination, message }
 */
export async function getAllProducts(options = {}) {
  const params = new URLSearchParams();

  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  if (options.search) params.append('search', options.search);
  if (options.status) params.append('status', options.status);
  if (options.categoryId) params.append('categoryId', options.categoryId);
  if (options.canteenId) params.append('canteenId', options.canteenId);
  if (options.isPopular !== undefined)
    params.append('isPopular', options.isPopular);
  if (options.isNew !== undefined) params.append('isNew', options.isNew);
  if (options.sort) params.append('sort', options.sort);
  if (options.fields) params.append('fields', options.fields);

  // Handle price range
  if (options.price) {
    if (options.price.gte) params.append('price[gte]', options.price.gte);
    if (options.price.lte) params.append('price[lte]', options.price.lte);
  }

  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
}

/**
 * Get products by canteen with pagination
 * @param {string} canteenId - Canteen ID
 * @param {Object} options - Query options (page, limit, status, sort, etc.)
 * @returns {Promise<Object>} - { status, data: { products }, pagination, message }
 */
export async function getProductsByCanteen(canteenId, options = {}) {
  const params = new URLSearchParams();

  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  if (options.search) params.append('search', options.search);
  if (options.status) params.append('status', options.status);
  if (options.sort) params.append('sort', options.sort);

  const response = await api.get(
    `/products/canteen/${canteenId}?${params.toString()}`
  );
  return response.data;
}

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} - { status, data: { product } }
 */
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

/**
 * Kiem tra ton kho theo so luong yeu cau
 * @param {string} id - Product ID
 * @param {number} quantity - So luong yeu cau
 * @returns {Promise<Object>} - { status, data: { inventory } }
 */
export async function getProductInventoryCheck(id, quantity = 1) {
  const params = new URLSearchParams();
  if (quantity) params.append('quantity', quantity);

  const response = await api.get(
    `/products/${id}/inventory-check?${params.toString()}`
  );
  return response.data;
}

/**
 * Create a new product (Staff/Admin only)
 * @param {Object} payload - Product data
 * @param {string} payload.canteenId - Canteen ID (required)
 * @param {string} payload.categoryId - Category ID (required)
 * @param {string} payload.name - Product name (required)
 * @param {number} payload.price - Product price (required)
 * @param {string} payload.description - Product description
 * @param {string} payload.image - Product image URL
 * @param {Array} payload.images - Array of image URLs
 * @param {string} payload.status - Status (available, unavailable, out_of_stock, hidden)
 * @param {number} payload.calories - Nutritional info
 * @param {number} payload.preparationTime - Preparation time in minutes
 * @param {boolean} payload.isPopular - Mark as popular
 * @param {boolean} payload.isNew - Mark as new
 * @param {number} payload.stockQuantity - Stock quantity
 * @returns {Promise<Object>} - { status, data: { product } }
 */
export async function createProduct(payload) {
  const response = await api.post('/products', payload);
  return response.data;
}

/**
 * Update product (Staff/Admin only)
 * @param {string} id - Product ID
 * @param {Object} payload - Fields to update
 * @returns {Promise<Object>} - { status, data: { product } }
 */
export async function updateProduct(id, payload) {
  const response = await api.patch(`/products/${id}`, payload);
  return response.data;
}

/**
 * Delete product (Admin only)
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

/**
 * Add ingredient to product recipe (Staff/Admin only)
 * @param {string} productId - Product ID
 * @param {Object} payload - Ingredient data
 * @param {string} payload.ingredientId - Ingredient ID (required)
 * @param {number} payload.quantity - Quantity (required)
 * @param {string} payload.unit - Unit (required, e.g., "g", "ml", "cup")
 * @param {string} payload.ingredientName - Ingredient name (optional)
 * @returns {Promise<Object>} - { status, data: { product } }
 */
export async function addRecipeIngredient(productId, payload) {
  const response = await api.post(`/products/${productId}/recipe`, payload);
  return response.data;
}

/**
 * Remove ingredient from product recipe (Staff/Admin only)
 * @param {string} productId - Product ID
 * @param {string} ingredientId - Ingredient ID to remove
 * @returns {Promise<Object>} - { status, data: { product } }
 */
export async function removeRecipeIngredient(productId, ingredientId) {
  const response = await api.delete(
    `/products/${productId}/recipe/${ingredientId}`
  );
  return response.data;
}
