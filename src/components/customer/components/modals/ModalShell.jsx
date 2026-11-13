// Khung dùng chung cho mọi modal: nền mờ + hộp trắng. Bấm nền để đóng.
export default function ModalShell({ children, onClose, maxWidth = 'max-w-md', rounded = 'rounded-3xl', className = 'p-6 text-xs space-y-4' }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={onClose}>
      <div
        className={`bg-white border border-slate-200 ${rounded} ${maxWidth} w-full shadow-2xl ${className}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
