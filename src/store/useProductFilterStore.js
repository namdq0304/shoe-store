import { create } from 'zustand';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { matchPriceRange } from '../components/customer/utils';

/**
 * Hàm lọc và sắp xếp sản phẩm dựa trên trạng thái bộ lọc
 */
export function computeFilteredProducts(filters, products = INITIAL_PRODUCTS) {
  const {
    searchQuery = '',
    selectedBrands = [],
    selectedSize = null,
    priceRange = 'all',
    selectedGender = null,
    selectedCategory = null,
    selectedMaterial = null,
    onlySale = false,
    sortBy = 'default',
  } = filters;

  const q = (searchQuery || '').trim().toLowerCase();

  const list = products.filter((p) => {
    if (q && !p.name?.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q)) {
      return false;
    }
    if (selectedBrands && selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
      return false;
    }
    if (selectedSize && !p.sizes?.includes(selectedSize)) {
      return false;
    }
    if (!matchPriceRange(p.price, priceRange)) {
      return false;
    }

    const g = p.gender || 'unisex';
    if (selectedGender === 'tre-em') {
      if (g !== 'tre-em') return false;
    } else if (selectedGender && g !== selectedGender && g !== 'unisex') {
      return false;
    }

    if (selectedCategory && p.category !== selectedCategory && p.danhMucId !== selectedCategory) {
      return false;
    }

    if (selectedMaterial) {
      const matStr = selectedMaterial.toLowerCase();
      const pMat = (p.chatLieu || p.material || p.tenChatLieu || '').toLowerCase();
      const pDesc = (p.description || p.moTa || '').toLowerCase();
      if (!pMat.includes(matStr) && !pDesc.includes(matStr)) {
        return false;
      }
    }

    if (onlySale && !p.isFlashSale) {
      return false;
    }
    return true;
  });

  const sorted = [...list];
  if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  return sorted;
}

/**
 * Zustand Store quản lý trạng thái tìm kiếm, lọc và phân loại sản phẩm.
 * Cho phép StoreHeader, CategoryNav, Banner, Footer và CatalogView đồng bộ dữ liệu mà không cần prop-drilling.
 */
export const useProductFilterStore = create((set, get) => ({
  searchQuery: '',
  selectedBrands: [],
  selectedSize: null,
  priceRange: 'all',
  selectedGender: null, // null | 'nam' | 'nu' | 'tre-em'
  selectedCategory: null,
  selectedMaterial: null,
  onlySale: false,
  sortBy: 'default',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedBrands: (selectedBrands) => set({ selectedBrands }),
  setSelectedSize: (selectedSize) => set({ selectedSize }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setSelectedGender: (selectedGender) => set({ selectedGender }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedMaterial: (selectedMaterial) => set({ selectedMaterial }),
  setOnlySale: (onlySale) => set({ onlySale }),
  setSortBy: (sortBy) => set({ sortBy }),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedBrands: [],
      selectedSize: null,
      priceRange: 'all',
      selectedGender: null,
      selectedCategory: null,
      selectedMaterial: null,
      onlySale: false,
      sortBy: 'default',
    }),

  applyPreset: ({
    gender = null,
    category = null,
    brand = null,
    material = null,
    sale = false,
  } = {}) =>
    set({
      searchQuery: '',
      selectedBrands: brand ? [brand] : [],
      selectedSize: null,
      priceRange: 'all',
      selectedGender: gender,
      selectedCategory: category,
      selectedMaterial: material,
      onlySale: sale,
      sortBy: 'default',
    }),
}));

export default useProductFilterStore;
