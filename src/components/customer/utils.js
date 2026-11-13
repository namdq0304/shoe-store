export const formatVND = (n) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;

export function matchPriceRange(price, range) {
  if (range === 'under-2m') return price < 2000000;
  if (range === '2m-4m') return price >= 2000000 && price <= 4000000;
  if (range === 'over-4m') return price > 4000000;
  return true;
}

const BACKEND_HOST =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.VITE_API_BASE_URL?.startsWith('http')
    ? new URL(import.meta.env.VITE_API_BASE_URL).origin
    : 'http://localhost:8080');

export const toSrc = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_HOST}${cleanUrl}`;
};

