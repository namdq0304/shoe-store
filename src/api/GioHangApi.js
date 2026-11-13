import axiosClient from './axiosClient'; // chỉnh lại đường dẫn theo project của bạn

const gioHangApi = {
    // Xem giỏ hàng của khách đang đăng nhập
    getAll: () => axiosClient.get('/gio-hang'),

    // Số dòng trong giỏ (hiện trên icon giỏ)
    count: () => axiosClient.get('/gio-hang/count'),

    // Thêm sản phẩm (đã có thì server tự cộng dồn)
    add: (chiTietSanPhamId, soLuong = 1) =>
        axiosClient.post('/gio-hang', { chiTietSanPhamId, soLuong }),

    // Đổi số lượng (soLuong = 0 thì server xóa dòng đó)
    update: (id, soLuong) => axiosClient.put(`/gio-hang/${id}`, { soLuong }),

    // Xóa 1 dòng
    delete: (id) => axiosClient.delete(`/gio-hang/${id}`),

    // Xóa sạch giỏ
    clear: () => axiosClient.delete('/gio-hang'),
};

export default gioHangApi;