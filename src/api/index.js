// Barrel export cho thư mục api
import axiosClient from './axiosClient';
import authApi from './authApi';
import sanPhamApi from './sanPhamApi';
import chatLieuApi from './chatLieuApi';
import danhMucApi from './danhMucApi';
import thuongHieuApi from './thuongHieuApi';

export * from './authStorage';
export {
  axiosClient,
  authApi,
  sanPhamApi,
  chatLieuApi,
  danhMucApi,
  thuongHieuApi,
};

export default axiosClient;
