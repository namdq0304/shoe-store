import { useState } from 'react';

export default function MobileMenu({ menu, searchQuery, onSearch, onNavigate, onClose }) {
    const [openIdx, setOpenIdx] = useState(null);

    const pick = (item) => {
        onNavigate(item);
        onClose();
    };

    return (
        <div className="md:hidden border-t border-slate-100 bg-white max-h-[75vh] overflow-y-auto">
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Tìm Jordan, Nike, size..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-300 text-xs px-3.5 py-2 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
            </div>

            <ul className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {menu.map((item, idx) => (
                    <li key={item.label}>
                        {item.groups ? (
                            <>
                                <button
                                    onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                    className="w-full flex justify-between items-center px-4 py-3"
                                    aria-expanded={openIdx === idx}
                                >
                                    <span>{item.label}</span>
                                    <span className="text-slate-400">{openIdx === idx ? '−' : '+'}</span>
                                </button>
                                {openIdx === idx && (
                                    <div className="bg-slate-50 px-4 pb-3 space-y-3">
                                        {item.groups.map((g) => (
                                            <div key={g.title}>
                                                <div className="text-[10px] uppercase text-slate-400 font-black mb-1">{g.title}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {g.items.map((it) => (
                                                        <button
                                                            key={it.label}
                                                            onClick={() => pick(it)}
                                                            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-indigo-400"
                                                        >
                                                            {it.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => pick(item)}
                                className={`w-full text-left px-4 py-3 ${item.highlight ? 'text-red-500' : ''}`}
                            >
                                {item.label}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}