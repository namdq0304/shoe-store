import { useMemo } from 'react';
import { useProductFilterStore, computeFilteredProducts } from '../../../store';
import { INITIAL_PRODUCTS } from '../../../data/mockData';

/**
 * Hook useProductFilters kết nối trực tiếp với Zustand store useProductFilterStore.
 * Trạng thái bộ lọc và tìm kiếm được đồng bộ toàn cục trên toàn bộ ứng dụng.
 */
export default function useProductFilters(products = INITIAL_PRODUCTS) {
  const searchQuery = useProductFilterStore((s) => s.searchQuery);
  const setSearchQuery = useProductFilterStore((s) => s.setSearchQuery);
  const selectedBrands = useProductFilterStore((s) => s.selectedBrands);
  const setSelectedBrands = useProductFilterStore((s) => s.setSelectedBrands);
  const selectedSize = useProductFilterStore((s) => s.selectedSize);
  const setSelectedSize = useProductFilterStore((s) => s.setSelectedSize);
  const priceRange = useProductFilterStore((s) => s.priceRange);
  const setPriceRange = useProductFilterStore((s) => s.setPriceRange);
  const selectedGender = useProductFilterStore((s) => s.selectedGender);
  const setSelectedGender = useProductFilterStore((s) => s.setSelectedGender);
  const selectedCategory = useProductFilterStore((s) => s.selectedCategory);
  const setSelectedCategory = useProductFilterStore((s) => s.setSelectedCategory);
  const selectedMaterial = useProductFilterStore((s) => s.selectedMaterial);
  const setSelectedMaterial = useProductFilterStore((s) => s.setSelectedMaterial);
  const onlySale = useProductFilterStore((s) => s.onlySale);
  const setOnlySale = useProductFilterStore((s) => s.setOnlySale);
  const sortBy = useProductFilterStore((s) => s.sortBy);
  const setSortBy = useProductFilterStore((s) => s.setSortBy);
  const resetFilters = useProductFilterStore((s) => s.resetFilters);
  const applyPreset = useProductFilterStore((s) => s.applyPreset);

  const filteredProducts = useMemo(() => {
    return computeFilteredProducts(
      {
        searchQuery,
        selectedBrands,
        selectedSize,
        priceRange,
        selectedGender,
        selectedCategory,
        selectedMaterial,
        onlySale,
        sortBy,
      },
      products
    );
  }, [
    searchQuery,
    selectedBrands,
    selectedSize,
    priceRange,
    selectedGender,
    selectedCategory,
    selectedMaterial,
    onlySale,
    sortBy,
    products,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedBrands,
    setSelectedBrands,
    selectedSize,
    setSelectedSize,
    priceRange,
    setPriceRange,
    selectedGender,
    setSelectedGender,
    selectedCategory,
    setSelectedCategory,
    selectedMaterial,
    setSelectedMaterial,
    onlySale,
    setOnlySale,
    sortBy,
    setSortBy,
    filteredProducts,
    resetFilters,
    applyPreset,
  };
}