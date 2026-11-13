import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_PRODUCTS } from '../../data/mockData';
import {useAuthStore, useCartStore} from '../../store';
import Footer from '../Footer';
import { STAFF_ROLES, NAV_MENU } from './constants';
import { formatVND } from './utils';
import useProductFilters from './hooks/useProductFilters';
import useCart from './hooks/useCart';
import useOrders from './hooks/useOrders';
import useMenuData from './hooks/useMenuData';

import PromoBanner from './components/PromoBanner';
import StoreHeader from './components/StoreHeader';
import HomeView from './components/HomeView';
import CatalogView from './components/CatalogView';
import CustomerPortal from './components/customer/CustomerPortal';
import useProducts from './hooks/useProducts';

import ProductDetailModal from './components/modals/ProductDetailModal';
import CustomerProductDetail from './components/CustomerProductDetail';
import SizeChartModal from './components/modals/SizeChartModal';
import CartDrawer from './components/modals/CartDrawer';
import CheckoutModal from './components/modals/CheckoutModal';
import OrderDetailModal from './components/modals/OrderDetailModal';
import EditOrderModal from './components/modals/EditOrderModal';
import CancelOrderModal from './components/modals/CancelOrderModal';

export default function OnlineStore2({ session: propSession, onLogout: propLogout }) {
  const navigate = useNavigate();
  const storeSession = useAuthStore((s) => s.session);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const storeLogout = useAuthStore((s) => s.logout);
  const session = propSession || storeSession;
  const isStaff = STAFF_ROLES.includes((session?.role || '').toUpperCase());

  // Nhân viên / admin → chuyển thẳng về /admin
  useEffect(() => {
    if (hasHydrated && isStaff) navigate('/admin', { replace: true });
  }, [hasHydrated, isStaff, navigate]);

  const handleLogout = () => {
    if (typeof propLogout === 'function') propLogout();
    storeLogout();
    navigate('/login');
  };
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    fetchCart()
  },[])

  // ── UI state ──
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'customer'
  const [detailProduct, setDetailProduct] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [cancelingOrder, setCancelingOrder] = useState(null);


  // ── Business logic (stores & hooks) ──
  const filters = useProductFilters();
  const cartState = useCart();
  const orderState = useOrders();
  const { menu } = useMenuData();
  const { hotProducts, hotLoading , products, loading } = useProducts();
// Dùng chung cho menu, banner slider và các ô danh mục ở trang chủ
  const handleNavigate = (item) => {
    if (item.tab) {
      setActiveTab(item.tab);
    } else {
      filters.applyPreset(item.filter || {});
      setActiveTab('catalog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Handlers ──
  const handleSearch = (value) => {
    filters.setSearchQuery(value);
    setActiveTab('catalog');
  };

  const handleSelectJordan = () => {
    filters.setSelectedBrands(['Jordan']);
    setActiveTab('catalog');
  };

  const handleAddToCart = (product, size) => {
    if (!session) {
      alert('⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    cartState.addToCart(product, size);
    setDetailProduct(null);
    navigate('/gio-hang');
  };

  const handleApplyVoucher = () => alert(cartState.applyVoucher().message);

  const handlePlaceOrder = (form) => {
    const order = orderState.placeOrder({ cart: cartState.cart, total: cartState.total, form });
    alert(
      `🎉 ĐẶT HÀNG THÀNH CÔNG!\nMã đơn: #${order.id}\nTổng thanh toán: ${formatVND(order.total)}\n` +
      'Bạn có thể theo dõi tiến độ, sửa thông tin nhận hoặc hủy đơn trong mục "Đơn Hàng Của Tôi".'
    );
    cartState.clearCart();
    setIsCheckoutOpen(false);
    setActiveTab('customer');
  };

  const handleCancelOrder = (reason) => {
    orderState.cancelOrder(cancelingOrder.id, reason);
    alert(`Đã hủy thành công đơn hàng #${cancelingOrder.id}!`);
    setCancelingOrder(null);
  };

  const handleSaveOrder = (updated) => {
    orderState.updateOrder(updated);
    alert(`Đã cập nhật thông tin giao hàng cho đơn #${updated.id}!`);
    setEditingOrder(null);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <PromoBanner />

      <StoreHeader
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          menu={menu}
          onNavigate={handleNavigate}
          searchQuery={filters.searchQuery}
          onSearch={handleSearch}
          session={session}
          isStaff={isStaff}
          onLogout={handleLogout}
          cartCount={cartState.itemCount}
          onOpenCart={() => navigate('/gio-hang')}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              onSelectProduct={setDetailProduct}
              hotProducts={hotProducts}
              hotLoading={hotLoading}
              products={products}
              loading={loading}
            />
        )}
        {activeTab === 'catalog' && (
          <CatalogView filters={filters} onSelectProduct={setDetailProduct} />
        )}
        {activeTab === 'customer' && (
          <CustomerPortal
            session={session}
            onLogout={handleLogout}
            orders={orderState.filteredOrders}
            totalOrders={orderState.orders.length}
            orderFilter={orderState.orderFilter}
            onChangeFilter={orderState.setOrderFilter}
            onViewOrder={setViewingOrder}
            onEditOrder={setEditingOrder}
            onCancelOrder={setCancelingOrder}
          />
        )}
      </main>

      <Footer
        onSelectTab={setActiveTab}
        onSelectBrand={filters.setSelectedBrands}
        onOpenSizeChart={() => setShowSizeChart(true)}
      />

      {/* ── Overlays ── */}
      {detailProduct && (
        <CustomerProductDetail
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenSizeChart={() => setShowSizeChart(true)}
        />
      )}
      {showSizeChart && <SizeChartModal onClose={() => setShowSizeChart(false)} />}

      {isCheckoutOpen && (
        <CheckoutModal
          session={session}
          total={cartState.total}
          onClose={() => setIsCheckoutOpen(false)}
          onSubmit={handlePlaceOrder}
        />
      )}

      {viewingOrder && <OrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      {editingOrder && (
        <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSave={handleSaveOrder} />
      )}
      {cancelingOrder && (
        <CancelOrderModal order={cancelingOrder} onClose={() => setCancelingOrder(null)} onConfirm={handleCancelOrder} />
      )}
    </div>
  );
}
