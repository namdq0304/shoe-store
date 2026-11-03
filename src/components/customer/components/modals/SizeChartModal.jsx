import ModalShell from './ModalShell';
import { SIZE_CHART } from '../../constants';

export default function SizeChartModal({ onClose, highlight = '42' }) {
  return (
    <ModalShell onClose={onClose} rounded="rounded-2xl">
      <div className="flex justify-between items-center">
        <h4 className="font-black text-slate-900 uppercase">Bảng Quy Đổi Size Sneaker Chuẩn</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
      </div>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">EU (Việt Nam)</th>
            <th className="py-2">US</th>
            <th className="py-2">Chiều dài chân (cm)</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {SIZE_CHART.map((r) => (
            <tr key={r.eu} className={`border-b border-slate-100 ${r.eu === highlight ? 'bg-indigo-50' : ''}`}>
              <td className={`py-2 ${r.eu === highlight ? 'text-indigo-600 font-bold' : ''}`}>{r.eu}</td>
              <td>{r.us}</td>
              <td>{r.cm} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalShell>
  );
}
