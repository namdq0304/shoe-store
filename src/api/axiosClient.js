import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  clearAuthSession
} from './authStorage';

/**
 * Base URL cấu hình linh hoạt:
 * - Ưu tiên biến môi trường VITE_API_BASE_URL (nếu có trong .env)
 * - Mặc định dùng '/api' để khớp với server.servlet.context-path=/api của Spring Boot
 *   và hoạt động thông qua proxy của Vite (tránh lỗi CORS)
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Biến quản lý trạng thái Refresh Token để tránh spam API refresh khi có nhiều request đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor:
 * Tự động gắn Bearer Token vào Header Authorization của mỗi request nếu đã có token
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * - Trả về dữ liệu `response.data` trực tiếp cho component
 * - Tự động bắt lỗi 401 để refresh token và gọi lại request ban đầu
 * - Chuẩn hóa định dạng lỗi để dễ dàng bắt lỗi và hiển thị thông báo
 */
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng phần data từ server
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Trường hợp lỗi mạng, server sập hoặc không phản hồi
    if (!error.response) {
      return Promise.reject({
        success: false,
        status: 0,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend Spring Boot đang chạy!',
        originalError: error,
      });
    }

    const { status, data } = error.response;
    const requestUrl = originalRequest?.url || '';

    // Các API không kích hoạt cơ chế tự động refresh token
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/admin/login') ||
      requestUrl.includes('/auth/customer/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/customer/register');

    // Xử lý khi Token hết hạn (401 Unauthorized) trên các request cần xác thực
    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      // Nếu không có Refresh Token để tái cấp, dọn phiên đăng nhập
      if (!refreshToken) {
        clearAuthSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vibeflow:auth-expired'));
        }
        return Promise.reject(formatError(error));
      }

      // Nếu đang trong quá trình refresh từ 1 request trước đó, đưa request này vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token dựa trên AuthController: POST /auth/refresh?refreshToken=...
        // Sử dụng instance axios riêng biệt để không đi qua interceptor này
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          null,
          {
            params: { refreshToken },
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          }
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          // Lưu token mới vào localStorage
          updateAccessToken(newAccessToken);

          // Giải phóng hàng đợi
          processQueue(null, newAccessToken);

          // Cập nhật header cho request hiện tại và thực hiện lại
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } else {
          throw new Error('Máy chủ không trả về accessToken mới!');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vibeflow:auth-expired'));
        }
        return Promise.reject({
          success: false,
          status: 401,
          message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!',
          originalError: refreshErr,
        });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatError(error));
  }
);

/**
 * Hàm chuẩn hóa định dạng lỗi trả về từ Spring Boot AuthController
 */
function formatError(error) {
  const status = error.response?.status || 500;
  const data = error.response?.data;

  let message = 'Đã có lỗi xảy ra trong quá trình xử lý!';
  if (typeof data === 'string') {
    message = data;
  } else if (data?.message) {
    message = data.message;
  } else if (error.message) {
    message = error.message;
  }

  return {
    success: false,
    status,
    message,
    data,
    originalError: error,
  };
}

export default axiosClient;
