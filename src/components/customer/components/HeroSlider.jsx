import { useEffect, useRef, useState } from 'react';

export default function HeroSlider({ slides, onNavigate, interval = 5000 }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const touchStartX = useRef(null);
    const count = slides.length;

    const go = (i) => setIndex((i + count) % count);

    // Tự chuyển slide; đổi index (kể cả bấm tay) sẽ đặt lại bộ đếm
    useEffect(() => {
        if (paused || count < 2) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const t = setTimeout(() => setIndex((i) => (i + 1) % count), interval);
        return () => clearTimeout(t);
    }, [index, paused, count, interval]);

    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? index + 1 : index - 1);
        touchStartX.current = null;
    };

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Banner khuyến mãi"
            className="relative overflow-hidden rounded-3xl shadow-xl group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {slides.map((s, i) => (
                    <div
                        key={s.id}
                        aria-hidden={i !== index}
                        className={`w-full shrink-0 bg-gradient-to-br ${s.gradient} p-8 sm:p-14 min-h-[360px] flex flex-col md:flex-row items-center justify-between gap-8`}
                    >
                        <div className="space-y-4 max-w-xl z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-black uppercase tracking-wider border border-white/30">
                {s.badge}
              </span>
                            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-white leading-tight">
                                {s.title}
                            </h2>
                            <p className="text-white/85 text-xs sm:text-sm">{s.subtitle}</p>
                            <button
                                tabIndex={i === index ? 0 : -1}
                                onClick={() => onNavigate({ filter: s.filter })}
                                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase text-xs rounded-xl transition shadow-lg"
                            >
                                {s.cta} ➔
                            </button>
                        </div>
                        <img
                            src={s.image}
                            alt={s.title}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            className="w-full max-w-sm md:max-w-md transform -rotate-12 hover:rotate-0 transition duration-500 drop-shadow-2xl z-10"
                        />
                    </div>
                ))}
            </div>

            {count > 1 && (
                <>
                    <button
                        onClick={() => go(index - 1)}
                        aria-label="Slide trước"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white font-bold backdrop-blur opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => go(index + 1)}
                        aria-label="Slide sau"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white font-bold backdrop-blur opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                    >
                        ›
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                        {slides.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => go(i)}
                                aria-label={`Đến slide ${i + 1}`}
                                aria-current={i === index}
                                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}