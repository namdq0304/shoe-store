export default function CategoryNav({ menu, activeTab, onNavigate }) {
    const handleTop = (item) => {
        // Mục chỉ có menu con (ví dụ "Thương Hiệu") → mở toàn bộ giày
        if (item.tab || item.filter) onNavigate(item);
        else onNavigate({ filter: {} });
    };

    return (
        <nav className="hidden md:block border-t border-slate-100" aria-label="Danh mục sản phẩm">
            <ul className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center space-x-1 text-xs uppercase font-extrabold tracking-wider text-slate-600">
                {menu.map((item , index) => {
                    const isActive = item.tab && item.tab === activeTab;
                    return (
                        <li key={item.label + index} className="relative group">
                            <button
                                onClick={() => handleTop(item)}
                                className={`px-3 py-3 border-b-2 transition ${
                                    isActive
                                        ? 'text-indigo-600 border-indigo-500'
                                        : item.highlight
                                            ? 'text-red-500 border-transparent hover:border-red-400'
                                            : 'border-transparent hover:text-indigo-600 hover:border-indigo-300'
                                }`}
                            >
                                {item.label}
                                {item.groups && <span className="ml-1 text-[9px]">▾</span>}
                            </button>

                            {item.groups && (
                                <div className="absolute left-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-5 flex gap-10 min-w-max normal-case tracking-normal font-medium">
                                        {item.groups.map((g,index) => (
                                            <div key={g.title +index}>
                                                <div className="text-[11px] font-black uppercase text-slate-400 mb-2">{g.title}</div>
                                                <ul className="space-y-0.5">
                                                    {g.items.map((it , index) => (
                                                        <li key={it.label + index}>
                                                            <button
                                                                onClick={() => onNavigate(it)}
                                                                className="text-xs text-slate-700 hover:text-indigo-600 py-1 whitespace-nowrap"
                                                            >
                                                                {it.label}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}