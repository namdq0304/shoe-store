import { useState } from 'react';
import { INPUT_CLS } from '../../constants';

export default function PasswordTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  const handleSubmit = () => {
    if (next.length < 6) return alert('Mật khẩu mới cần ít nhất 6 ký tự.');
    // TODO: gọi API đổi mật khẩu
    alert('Đã cập nhật mật khẩu mới thành công!');
    setCurrent('');
    setNext('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-xs space-y-4 max-w-md shadow-sm">
      <h3 className="font-black text-sm uppercase text-slate-900">Đổi Mật Khẩu Đăng Nhập</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Mật khẩu hiện tại</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Mật khẩu mới</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nhập ít nhất 6 ký tự..." className={INPUT_CLS} />
        </div>
      </div>
      <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-xs">
        Cập Nhật Mật Khẩu
      </button>
    </div>
  );
}
