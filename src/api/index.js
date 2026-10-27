// Barrel export cho thư mục api
import axiosClient from './axiosClient';
import authApi from './authApi';
import khachHangApi from './khachHangApi';
import nhanVienApi from './nhanVienApi';

export * from './authStorage';
export { axiosClient, authApi, khachHangApi, nhanVienApi };

export default axiosClient;
