import { useState, useEffect, useRef, useCallback } from 'react';
import { toSrc } from '../utils';

/**
 * Slider ảnh sản phẩm chuẩn cho trang chi tiết & modal chi tiết.
 *
 * Props:
 *   images     — mảng { id, urlAnh, tenAnh, anhChinh } hoặc mảng chuỗi url
 *   loading    — hiển thị skeleton
 *   altText    — alt text cho ảnh chính
 *   badges     — JSX badge hiển thị góc trên ảnh (Flash sale, giảm giá...)
 *   active     — (tuỳ chọn) index ảnh đang chọn từ component cha
 *   onChange   — (tuỳ chọn) callback (index) => void khi đổi ảnh
 *   className  — class tuỳ chỉnh
 */
export default function ImageSlider({
  images = [],
  loading = false,
  altText = '',
  badges = null,
  active: propActive,
  onChange,
  className = '',
}) {
  // Chuẩn hoá mảng images: nếu là string thì map sang object
  const normalizedImages = (images || []).map((img, idx) => {
    if (typeof img === 'string') {
      return { id: idx, urlAnh: img, tenAnh: `${altText} ${idx + 1}` };
    }
    return {
      id: img.id ?? idx,
      urlAnh: img.urlAnh || img.url || img.src || '',
      tenAnh: img.tenAnh || `${altText} ${idx + 1}`,
      anhChinh: !!img.anhChinh,
    };
  });

  const [internalActive, setInternalActive] = useState(0);
  const isControlled = typeof propActive === 'number';
  const active = isControlled ? propActive : internalActive;

  const setActive = useCallback(
    (index) => {
      const total = normalizedImages.length;
      if (total === 0) return;
      const clamped = Math.max(0, Math.min(total - 1, index));
      if (!isControlled) {
        setInternalActive(clamped);
      }
      if (onChange) {
        onChange(clamped);
      }
    },
    [normalizedImages.length, isControlled, onChange]
  );

  const [zoomed, setZoomed] = useState(false); // Lightbox slider
  const touchStartX = useRef(null);
  const lightboxTouchStartX = useRef(null);
  const thumbsRef = useRef(null);
  const lightboxThumbsRef = useRef(null);

  // Khi danh sách ảnh thay đổi, reset về ảnh đầu nếu vượt quá giới hạn
  useEffect(() => {
    if (active >= normalizedImages.length && normalizedImages.length > 0) {
      setActive(0);
    }
  }, [normalizedImages.length, active, setActive]);

  // Cuộn thumbnail theo ảnh đang chọn ở ngoài
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[active];
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [active]);

  // Cuộn thumbnail theo ảnh đang chọn trong lightbox
  useEffect(() => {
    if (!zoomed) return;
    const container = lightboxThumbsRef.current;
    if (!container) return;
    const thumb = container.children[active];
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [active, zoomed]);

  // Phím điều hướng
  useEffect(() => {
    const onKey = (e) => {
      if (normalizedImages.length <= 1) {
        if (e.key === 'Escape') setZoomed(false);
        return;
      }
      if (e.key === 'ArrowLeft') {
        setActive(active - 1);
      } else if (e.key === 'ArrowRight') {
        setActive(active + 1);
      } else if (e.key === 'Escape') {
        setZoomed(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, normalizedImages.length, setActive]);

  // Prevent scroll khi mở lightbox
  useEffect(() => {
    if (zoomed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [zoomed]);

  const goNext = () => setActive(active + 1);
  const goPrev = () => setActive(active - 1);

  // Touch handlers ngoài trang
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  // Touch handlers trong lightbox
  const onLightboxTouchStart = (e) => {
    lightboxTouchStartX.current = e.touches[0].clientX;
  };
  const onLightboxTouchEnd = (e) => {
    if (lightboxTouchStartX.current === null) return;
    const diff = lightboxTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
    }
    lightboxTouchStartX.current = null;
  };

  const currentImg = normalizedImages[active];
  const mainSrc = currentImg ? toSrc(currentImg.urlAnh) : '';

  return (
    <div className={`space-y-3.5 select-none ${className}`}>
      {/* ── Khung ảnh lớn ── */}
      <div
        className="relative bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm aspect-square group cursor-zoom-in"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => mainSrc && setZoomed(true)}
      >
        {/* Loading Skeleton */}
        {loading ? (
          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
            <span className="text-slate-300 text-5xl">👟</span>
          </div>
        ) : mainSrc ? (
          <img
            src={mainSrc}
            alt={currentImg?.tenAnh || altText || 'Ảnh sản phẩm'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <span className="text-7xl mb-2">👟</span>
            <span className="text-xs font-semibold text-slate-400">Chưa có ảnh</span>
          </div>
        )}

        {/* Badges góc trên trái */}
        {badges && (
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 pointer-events-none z-10">
            {badges}
          </div>
        )}

        {/* Hint phóng to khi hover */}
        {mainSrc && (
          <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md">
            <span>🔍</span>
            <span>Xem slider ảnh</span>
          </div>
        )}

        {/* Chỉ số ảnh hiện tại */}
        {normalizedImages.length > 1 && (
          <span className="absolute top-3.5 right-3.5 bg-black/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md pointer-events-none z-10">
            {active + 1} / {normalizedImages.length}
          </span>
        )}

        {/* Nút Prev / Next ngoài trang */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={active === 0}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-white text-xl font-bold flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed z-10"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={active === normalizedImages.length - 1}
              aria-label="Ảnh tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-white text-xl font-bold flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed z-10"
            >
              ›
            </button>
          </>
        )}

        {/* Thanh dots chuyển ảnh */}
        {normalizedImages.length > 1 && (
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-10">
            {normalizedImages.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-6 h-2 bg-indigo-600 shadow'
                    : 'w-2 h-2 bg-slate-300/80 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thanh Thumbnail danh sách ảnh dạng slider ── */}
      {normalizedImages.length > 1 && (
        <div className="relative">
          <div
            ref={thumbsRef}
            className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 snap-x snap-mandatory"
          >
            {normalizedImages.map((img, i) => {
              const src = toSrc(img.urlAnh);
              return (
                <button
                  key={img.id ?? i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  className={`flex-shrink-0 snap-start w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 relative ${
                    i === active
                      ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105 shadow-md shadow-indigo-100'
                      : 'border-slate-200 hover:border-indigo-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt={img.tenAnh || `Ảnh ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {img.anhChinh && (
                    <span className="absolute top-1 left-1 bg-amber-400 text-slate-900 text-[9px] font-black px-1 rounded shadow">
                      ⭐
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL SLIDER PHÓNG TO TOÀN MÀN HÌNH (LIGHTBOX SLIDER) ── */}
      {zoomed && mainSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 transition-opacity animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white z-20 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                {active + 1} / {normalizedImages.length}
              </span>
              <span className="text-sm font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                {currentImg?.tenAnh || altText || 'Chi tiết ảnh'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition-colors shadow-lg"
                title="Đóng (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Viewport Slider */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 cursor-default select-none overflow-hidden"
            onTouchStart={onLightboxTouchStart}
            onTouchEnd={onLightboxTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ảnh lớn trong slider modal */}
            <img
              key={active}
              src={mainSrc}
              alt={currentImg?.tenAnh || altText}
              className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-300 animate-in zoom-in-95"
              draggable={false}
            />

            {/* Nút Prev trong slider modal */}
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                disabled={active === 0}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white text-3xl font-bold flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-md shadow-xl"
                title="Ảnh trước (←)"
              >
                ‹
              </button>
            )}

            {/* Nút Next trong slider modal */}
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                disabled={active === normalizedImages.length - 1}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white text-3xl font-bold flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-md shadow-xl"
                title="Ảnh tiếp theo (→)"
              >
                ›
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip trong slider modal */}
          {normalizedImages.length > 1 && (
            <div
              className="z-20 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={lightboxThumbsRef}
                className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 max-w-3xl mx-auto scrollbar-none"
              >
                {normalizedImages.map((img, i) => {
                  const src = toSrc(img.urlAnh);
                  return (
                    <button
                      key={img.id ?? i}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        i === active
                          ? 'border-indigo-400 ring-2 ring-indigo-400 scale-110 shadow-lg shadow-indigo-500/40 opacity-100'
                          : 'border-white/20 hover:border-white/50 opacity-50 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={src}
                        alt={img.tenAnh || `Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
