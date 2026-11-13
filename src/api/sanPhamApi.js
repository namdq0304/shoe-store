import axiosClient from './axiosClient';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * API Quản Lý Sản Phẩm
 * Base: /api/san-pham (proxy Vite → localhost:8080)
 */
export const sanPhamApi = {
  // ── Admin (yêu cầu đăng nhập) ───────────────────────────────────────────
  getAll:       (params) => axiosClient.get('/san-pham', { params }),
  search:       (q)      => axiosClient.get('/san-pham/search', { params: { q } }),
  getById:      (id)     => axiosClient.get(`/san-pham/${id}`),
  create:       (data)   => axiosClient.post('/san-pham', data),
  update:       (id, data) => axiosClient.put(`/san-pham/${id}`, data),
  delete:       (id)     => axiosClient.delete(`/san-pham/${id}`),
  updateStatus: (id, trangThai) =>
    axiosClient.patch(`/san-pham/${id}/trang-thai`, { trangThai }),

  // ── Public (không cần token — dùng axios thường) ────────────────────────

  /**
   * Danh sách sản phẩm công khai cho trang khách hàng.
   * GET /api/san-pham/public
   * Hỗ trợ nhiều thuongHieuId: ?thuongHieuId=1&thuongHieuId=2
   */
  getPublic: (params = {}) =>
    axios.get(`${BASE_URL}/san-pham/public`, {
      params,
      // Axios 1.x: paramsSerializer phải là object { serialize }.
      // Truyền function sẽ bị bỏ qua → mặc định thuongHieuId[]=1&thuongHieuId[]=2
      // Spring @RequestParam List<Integer> chỉ nhận thuongHieuId=1&thuongHieuId=2
      paramsSerializer: {
        indexes: null,
        serialize: (p) => {
          const parts = [];
          for (const [key, val] of Object.entries(p)) {
            if (val === null || val === undefined || val === '') continue;
            if (Array.isArray(val)) {
              val.forEach((v) => {
                if (v === null || v === undefined || v === '') return;
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
              });
            } else {
              parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
            }
          }
          return parts.join('&');
        },
      },
    }).then((r) => r.data),

  /**
   * Sản phẩm hot — xếp theo tổng lượt bán giảm dần.
   * GET /api/san-pham/hot?limit=8
   */
  getHot: (limit = 8) =>
    axios.get(`${BASE_URL}/san-pham/hot`, { params: { limit } })
      .then((r) => r.data),

  /**
   * Chi tiết sản phẩm public (không cần token)
   * GET /api/san-pham/{id}
   */
  getPublicById: (id) =>
    axios.get(`${BASE_URL}/san-pham/${id}`)
      .then((r) => r.data),
};

export default sanPhamApi;
