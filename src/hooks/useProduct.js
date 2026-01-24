import { useState, useCallback } from 'react';
import {
  getAllProducts,
  getProductsByCanteen,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addRecipeIngredient,
  removeRecipeIngredient,
} from '@/services/product.service';

/**
 * Custom hook for managing products
 * @returns {Object} - { products, product, loading, error, pagination, fetchAll, fetchByCanteen, fetchById, create, update, delete, addRecipe, removeRecipe, reset }
 */
export function useProduct() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Fetch all products
  const fetchAll = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllProducts(options);
      // Backend returns data as array directly, not wrapped in products object
      setProducts(
        Array.isArray(result.data) ? result.data : result.data?.products || []
      );
      setPagination(result.pagination || null);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch products';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products by canteen
  const fetchByCanteen = useCallback(async (canteenId, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductsByCanteen(canteenId, options);
      // Backend returns data as array directly, not wrapped in products object
      setProducts(
        Array.isArray(result.data) ? result.data : result.data?.products || []
      );
      setPagination(result.pagination || null);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch products';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single product by ID
  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductById(id);
      // Response format for single product is { status, data: { product } }
      const prod = result.data?.product || result.data;
      setProduct(prod);
      return prod;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new product
  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createProduct(payload);
      const newProduct = result.data?.product;
      setProduct(newProduct);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update product
  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateProduct(id, payload);
      const updatedProduct = result.data?.product;
      setProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete product
  const remove = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
        if (product?._id === id) {
          setProduct(null);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to delete product';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [product]
  );

  // Add ingredient to recipe
  const addRecipe = useCallback(async (productId, ingredientData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await addRecipeIngredient(productId, ingredientData);
      const updatedProduct = result.data?.product;
      setProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to add ingredient';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove ingredient from recipe
  const removeRecipe = useCallback(async (productId, ingredientId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await removeRecipeIngredient(productId, ingredientId);
      const updatedProduct = result.data?.product;
      setProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to remove ingredient';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setProducts([]);
    setProduct(null);
    setError(null);
    setPagination(null);
  }, []);

  return {
    products,
    product,
    loading,
    error,
    pagination,
    fetchAll,
    fetchByCanteen,
    fetchById,
    create,
    update,
    remove,
    addRecipe,
    removeRecipe,
    reset,
  };
}
