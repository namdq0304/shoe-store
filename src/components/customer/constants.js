// maVaiTro trong DB: ADMIN, NHAN_VIEN, KHACH_HANG
export const STAFF_ROLES = ['ADMIN', 'NHAN_VIEN'];

export const INPUT_CLS =
  'w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition';

export const BRANDS = ['Nike', 'Jordan', 'Adidas', 'New Balance'];
export const SIZES = ['38', '39', '40', '41', '42', '43', '44'];

export const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-2m', label: 'Dưới 2.000.000₫' },
  { id: '2m-4m', label: 'Từ 2 - 4 Triệu' },
  { id: 'over-4m', label: 'Trên 4 Triệu' },
];

export const ORDER_FILTERS = [
  { id: 'all', label: 'Tất cả đơn' },
  { id: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { id: 'Đang giao', label: 'Đang vận chuyển' },
  { id: 'Đã giao', label: 'Đã hoàn thành' },
  { id: 'Đã hủy', label: 'Đã hủy' },
];

export const CANCEL_REASONS = [
  'Đổi ý không mua nữa',
  'Muốn đổi sang màu hoặc size khác',
  'Nhập nhầm địa chỉ nhận hàng',
  'Tìm thấy nơi bán giá tốt hơn',
  'Thời gian giao hàng không phù hợp',
  'Lý do khác',
];

export const PAYMENT_METHODS = [
  'Thanh toán khi nhận hàng (COD)',
  'Quét mã VietQR (Tự động nhận diện)',
  'Ví MoMo / VNPay',
];

export const SIZE_CHART = [
  { eu: '38', us: '5.5', cm: '24.0' },
  { eu: '39', us: '6.5', cm: '24.5' },
  { eu: '40', us: '7.0', cm: '25.0' },
  { eu: '41', us: '8.0', cm: '26.0' },
  { eu: '42', us: '8.5', cm: '26.5' },
  { eu: '43', us: '9.5', cm: '27.5' },
];

// Dữ liệu demo — sau này thay bằng API
export const MOCK_MY_ORDERS = [
  {
    id: 'ORD-9821',
    items: [{ name: 'Nike Air Jordan 1 Retro High Shadow 2.0', size: '42', color: 'Xám Khói', qty: 1, price: 4850000 }],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    date: '14:15 - Hôm nay',
    total: 4850000,
    recipientName: 'Nguyễn Văn An',
    phone: '0987.654.321',
    address: '128 Phố Huế, Hoàn Kiếm, Hà Nội',
    note: 'Gọi trước khi giao hàng 15 phút',
    paymentMethod: 'Chuyển khoản VietQR',
    status: 'Chờ xác nhận',
    cancelReason: null,
  },
  {
    id: 'ORD-8940',
    items: [{ name: 'Adidas Samba Classic OG White', size: '41', color: 'Trắng Viền Đen', qty: 1, price: 2450000 }],
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
    date: '02/10/2026',
    total: 2450000,
    recipientName: 'Nguyễn Văn An',
    phone: '0987.654.321',
    address: '128 Phố Huế, Hoàn Kiếm, Hà Nội',
    note: 'Giao giờ hành chính',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    status: 'Đã giao thành công',
    cancelReason: null,
  },
];

// ───────── MENU / DANH MỤC / SLIDER ─────────
export const GENDERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'nam', label: 'Nam' },
  { id: 'nu', label: 'Nữ' },
  { id: 'tre-em', label: 'Trẻ em' },
];

export const CATEGORIES = [
  { id: 'sneaker', label: 'Sneaker' },
  { id: 'chay-bo', label: 'Giày chạy bộ' },
  { id: 'bong-ro', label: 'Giày bóng rổ' },
  { id: 'boots', label: 'Boots' },
  { id: 'sandal', label: 'Dép & Sandal' },
];

export const SORT_OPTIONS = [
  { id: 'default', label: 'Mặc định' },
  { id: 'price-asc', label: 'Giá thấp → cao' },
  { id: 'price-desc', label: 'Giá cao → thấp' },
  { id: 'name', label: 'Tên A → Z' },
];

// Tạo menu con cho Nam / Nữ / Trẻ em
export function buildNavMenu({ categories = [], brands = [], materials = [] } = {}) {
  const catItems = categories.length > 0
    ? categories.map((c) => ({
        id: c.id,
        label: c.tenDanhMuc || c.label,
        code: c.maDanhMuc,
      }))
    : CATEGORIES;

  const brandItems = brands.length > 0
    ? brands.map((b) => ({
        id: b.id,
        label: b.tenThuongHieu || b.label || b,
        code: b.maThuongHieu,
      }))
    : BRANDS.map((b) => ({ id: b, label: b }));

  const materialItems = materials.length > 0
    ? materials.map((m) => ({
        id: m.id,
        label: m.tenChatLieu || m.label,
        code: m.maChatLieu,
      }))
    : [
        { id: 'da-that', label: 'Da thật' },
        { id: 'canvas', label: 'Vải Canvas' },
        { id: 'mesh', label: 'Lưới Mesh' },
      ];

  const genderMenu = (title, gender, short) => ({
    label: title,
    filter: { gender },
    groups: [
      {
        title: 'Theo loại giày',
        items: [
          { label: `Tất cả giày ${short}`, filter: { gender } },
          ...catItems.map((c) => ({
            label: `${c.label} ${short}`,
            filter: { gender, category: c.id },
          })),
        ],
      },
      {
        title: 'Theo thương hiệu',
        items: brandItems.map((b) => ({
          label: `${b.label} ${short}`,
          filter: { gender, brand: b.label },
        })),
      },
      {
        title: 'Theo chất liệu',
        items: materialItems.map((m) => ({
          label: `${m.label} ${short}`,
          filter: { gender, material: m.label },
        })),
      },
    ],
  });

  return [
    { label: 'Trang Chủ', tab: 'home' },
    genderMenu('Giày Nam', 'nam', 'nam'),
    genderMenu('Giày Nữ', 'nu', 'nữ'),
    genderMenu('Trẻ Em', 'tre-em', 'trẻ em'),
    {
      label: 'Thương Hiệu',
      groups: [
        {
          title: 'Thương hiệu chính hãng',
          items: brandItems.map((b) => ({
            label: b.label,
            filter: { brand: b.label },
          })),
        },
      ],
    },
    {
      label: 'Chất Liệu',
      groups: [
        {
          title: 'Chất liệu sản phẩm',
          items: materialItems.map((m) => ({
            label: m.label,
            filter: { material: m.label },
          })),
        },
      ],
    },
    {
      label: 'Loại Giày',
      groups: [
        {
          title: 'Danh mục giày',
          items: catItems.map((c) => ({
            label: c.label,
            filter: { category: c.id },
          })),
        },
      ],
    },
    { label: 'Sale 🔥', filter: { sale: true }, highlight: true },
    // { label: 'Đơn Hàng Của Tôi', tab: 'customer' },
  ];
}

// item có `tab` → chuyển tab; item có `filter` → mở catalog kèm bộ lọc
export const NAV_MENU = buildNavMenu();

export const HERO_SLIDES = [
  {
    id: 'jordan',
    badge: '⚡ Hàng mới về',
    title: 'Air Jordan',
    subtitle: 'Huyền thoại sân bóng rổ, chuẩn phong cách đường phố.',
    cta: 'Khám phá Jordan',
    filter: { brand: 'Jordan' },
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-indigo-600 via-violet-600 to-indigo-800',
  },
  {
    id: 'sale',
    badge: '🔥 Siêu hội sneaker',
    title: 'Giảm đến 40%',
    subtitle: 'Nhập mã KICKS100K để giảm thêm 100.000₫ cho đơn đủ điều kiện.',
    cta: 'Săn sale ngay',
    filter: { sale: true },
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-rose-600 via-red-500 to-orange-500',
  },
  {
    id: 'women',
    badge: '💖 Bộ sưu tập mới',
    title: 'Sneaker Nữ',
    subtitle: 'Nhẹ, êm, dễ phối đồ. Đổi size tận nơi trong 7 ngày.',
    cta: 'Xem giày nữ',
    filter: { gender: 'nu' },
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
  },
];

export const USP_ITEMS = [
  { icon: '✅', title: '100% chính hãng', desc: 'Cam kết hoàn tiền nếu phát hiện hàng giả' },
  { icon: '🔄', title: 'Đổi size 7 ngày', desc: 'Hỗ trợ đổi size tận nơi' },
  { icon: '📦', title: 'Kiểm tra hàng', desc: 'Xem hàng trước khi thanh toán' },
  { icon: '🛡️', title: 'Bảo hành 6 tháng', desc: 'Bảo hành keo, đế, đường chỉ' },
];