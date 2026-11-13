import { INPUT_CLS } from '../../constants';

export default function ProfileTab({ session }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-xs space-y-4 shadow-sm">
      <h3 className="font-black text-sm uppercase text-slate-900">Thông Tin Tài Khoản Khách Hàng</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Họ và tên</label>
          <input defaultValue={session?.name || 'Nguyễn Văn An'} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Số điện thoại</label>
          <input defaultValue={session?.phone || '0987.654.321'} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Email</label>
          <input defaultValue={session?.email || 'an.nguyen@vibeflow.vn'} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Địa chỉ mặc định</label>
          <input defaultValue="128 Phố Huế, Hoàn Kiếm, Hà Nội" className={INPUT_CLS} />
        </div>
      </div>
      {/* TODO: gọi API cập nhật hồ sơ */}
      <button onClick={() => alert('Đã lưu thông tin cá nhân!')} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-xs">
        Lưu Thay Đổi
      </button>
    </div>
  );
}
