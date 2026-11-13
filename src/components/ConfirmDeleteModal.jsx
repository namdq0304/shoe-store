import React from 'react';

export default function ConfirmDeleteModal({ name, onCancel, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-50 border border-slate-300 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
                <div className="text-center space-y-3 mb-6">
                    <div className="text-4xl">🗑️</div>
                    <h3 className="font-black text-base uppercase text-slate-900">Xác Nhận Xóa</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Bạn chắc chắn muốn xóa sản phẩm<br />
                        <span className="font-bold text-slate-900">"{name}"</span>?<br />
                        <span className="text-red-600">Hành động này không thể hoàn tác.</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition">
                        Hủy
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition disabled:opacity-50">
                        {loading ? 'Đang xóa...' : 'Xóa Sản Phẩm'}
                    </button>
                </div>
            </div>
        </div>
    );
}