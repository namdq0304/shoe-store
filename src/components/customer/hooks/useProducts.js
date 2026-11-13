import { useState, useEffect, useCallback } from 'react';
import { sanPhamApi } from '../../../api';

/**
 * Hook tải sản phẩm từ backend.
 *
 * @param {object} params - { q, thuongHieuId, danhMucId, gioiTinh, page, size }
 * @returns { products, hotProducts, loading, error, pagination, reload }
 */
export default function useProducts(params = {}) {
  const [products, setProducts]       = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [hotLoading, setHotLoading]   = useState(false);
  const [error, setError]             = useState('');
  const [pagination, setPagination]   = useState({
    page: 0, size: 12, totalElements: 0, totalPages: 0,
  });

  // ── Tải danh sách sản phẩm ──────────────────────────────────────────────
  const fetchProducts = useCallback(async (overrideParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const merged = { page: 0, size: 12, ...params, ...overrideParams };
      console.log(26 ,merged)
      const res = await sanPhamApi.getPublic(merged);

      // Backend trả { content, page, size, totalElements, totalPages, ... }
      if (res && Array.isArray(res.content)) {
        setProducts(res.content);
        setPagination({
          page:          res.page          ?? 0,
          size:          res.size          ?? 12,
          totalElements: res.totalElements ?? res.content.length,
          totalPages:    res.totalPages    ?? 1,
        });
      } else if (Array.isArray(res)) {
        // Fallback nếu backend trả mảng thẳng
        setProducts(res);
        setPagination({ page: 0, size: res.length, totalElements: res.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('useProducts fetchProducts:', err);
      setError(err.message || 'Không thể tải sản phẩm!');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  // ── Tải sản phẩm hot ────────────────────────────────────────────────────
  const fetchHot = useCallback(async (limit = 8) => {
    setHotLoading(true);
    try {
      const res = await sanPhamApi.getHot(limit);
      console.log(55 ,res)
      setHotProducts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('useProducts fetchHot:', err);
    } finally {
      setHotLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchHot(8);
  }, [fetchProducts, fetchHot]);

  return {
    products,
    hotProducts,
    loading,
    hotLoading,
    error,
    pagination,
    reload:    fetchProducts,
    loadPage:  (p) => fetchProducts({ page: p }),
  };
}
