import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GUIDE_KEY = 'sz_guide_seen';

/* 5 slides — content per user request, split into emoji / title / body */
const SLIDES = [
  {
    emoji: '✨',
    title: "StudyZone'a Hoş Geldin!",
    body: "Burası ders notu kasmaktan çok daha fazlası. Kampüsün yeni nesil akademik ekosistemi seni bekliyor!",
    blob: 'rgba(196,179,245,0.28)',
  },
  {
    emoji: '🎓🔥',
    title: 'Yol Arkadaşını Bul!',
    body: "Veri biliminde sıfır mısın? Seninle aynı hedefe koşan birini bul, beraber uzmanlaşın, projeleri birlikte patlatın!",
    blob: 'rgba(196,179,245,0.22)',
  },
  {
    emoji: '💎🤝',
    title: "SQL'de Kötüyüm Diye Üzülme!",
    body: "Uzman Python bilgini bir arkadaşının SQL uzmanlığıyla takas et. Dersi dersle barterla, sistemi domine et!",
    blob: 'rgba(246,194,35,0.18)',
  },
  {
    emoji: '☕⏳',
    title: 'Odak Moduna Geçiyoruz!',
    body: "25 dakika bas, 5 dakika mola! Odaklandıkça Gem'leri topla, disiplinini şov yap.",
    blob: 'rgba(196,179,245,0.25)',
  },
  {
    emoji: '📍',
    title: 'Priz Avcılığına Son!',
    body: "Vibe'ına uygun yeri seç; açık hava mı, sessiz kütüphane mi yoksa kahve kokulu bir kafe mi? Hemen keşfet.",
    blob: 'rgba(154,230,180,0.18)',
  },
];

export default function OnboardingGuide() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [slide, setSlide]         = useState(0);
  const [dir, setDir]             = useState('forward');

  /* Show only for logged-in users who haven't seen the guide yet */
  if (!user || dismissed || localStorage.getItem(GUIDE_KEY) === '1') return null;

  const total  = SLIDES.length;
  const isLast = slide === total - 1;
  const { emoji, title, body, blob } = SLIDES[slide];

  const goTo = (idx) => {
    setDir(idx > slide ? 'forward' : 'back');
    setSlide(idx);
  };

  const handleDone = () => {
    localStorage.setItem(GUIDE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="sz-guide-backdrop" role="dialog" aria-modal="true" aria-label="Karşılama rehberi">
      <div className="sz-guide-card">

        {/* Decorative radial blob — colour shifts per slide */}
        <div
          className="sz-guide-blob"
          style={{ background: `radial-gradient(circle, ${blob} 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        {/* Slide body — key forces re-animation on every slide change */}
        <div key={`${slide}-${dir}`} className={`sz-guide-slide sz-guide-slide-${dir}`}>
          <div className="sz-guide-emoji" aria-hidden="true">{emoji}</div>
          <h2 className="sz-guide-title">{title}</h2>
          <p className="sz-guide-body">{body}</p>
        </div>

        {/* Progress dots */}
        <div className="sz-guide-dots" role="tablist" aria-label="Slide navigation">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === slide}
              aria-label={`Slide ${i + 1} / ${total}`}
              className={`sz-guide-dot${i === slide ? ' active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        {isLast ? (
          /* Last slide: back (ghost) stacked above the glowing CTA */
          <div className="sz-guide-nav-last">
            {slide > 0 && (
              <button className="sz-guide-btn-ghost btn-full" onClick={() => goTo(slide - 1)}>
                ← Geri
              </button>
            )}
            <button className="sz-guide-btn-cta" onClick={handleDone}>
              Anladım, let's go! 🚀
            </button>
          </div>
        ) : (
          /* Intermediate slides: geri (optional) + ileri */
          <div className="sz-guide-nav">
            {slide > 0 && (
              <button className="sz-guide-btn-ghost" onClick={() => goTo(slide - 1)}>
                ← Geri
              </button>
            )}
            <button className="sz-guide-btn-next" onClick={() => goTo(slide + 1)}>
              İleri →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
