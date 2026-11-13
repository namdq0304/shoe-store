import { useState, useEffect } from 'react';
import { danhMucApi, thuongHieuApi, chatLieuApi } from '../../../api';
import { buildNavMenu } from '../constants';

/**
 * Hook tải động danh mục (loại giày), thương hiệu, chất liệu từ backend controller:
 * - GET /api/danh-muc
 * - GET /api/thuong-hieu
 * - GET /api/chat-lieu
 *
 * Tự động tạo menu đa cấp cho StoreHeader và CategoryNav.
 * Nếu API chưa phản hồi hoặc gặp lỗi mạng, sẽ fallback an toàn về danh sách mặc định.
 */
export default function useMenuData() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMenuAttributes() {
      try {
        const [catRes, brandRes, matRes] = await Promise.allSettled([
          danhMucApi.getAll(),
          thuongHieuApi.getAll(),
          chatLieuApi.getAll(),
        ]);

        if (!isMounted) return;

        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) {
          setCategories(catRes.value);
        }

        if (brandRes.status === 'fulfilled' && Array.isArray(brandRes.value)) {
          setBrands(brandRes.value);
        }

        if (matRes.status === 'fulfilled' && Array.isArray(matRes.value)) {
          setMaterials(matRes.value);
        }
      } catch (err) {
        console.warn('Lỗi khi tải dữ liệu menu từ backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMenuAttributes();

    return () => {
      isMounted = false;
    };
  }, []);

  const menu = buildNavMenu({ categories, brands, materials });

  return {
    menu,
    categories,
    brands,
    materials,
    isLoading,
  };
}
