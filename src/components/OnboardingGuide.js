import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const GUIDE_KEY = 'sz_guide_seen';

/* Each slide carries both TR and EN content — blob colour is language-agnostic */
const SLIDES = [
  {
    emoji: '✨',
    blob: 'rgba(196,179,245,0.28)',
    tr: {
      title: "StudyZone'a Hoş Geldin!",
      body:  "Burası ders notu kasmaktan çok daha fazlası. Kampüsün yeni nesil akademik ekosistemi seni bekliyor!",
    },
    en: {
      title: 'Welcome to StudyZone!',
      body:  "More than just study notes, it is the new-gen academic ecosystem of the campus!",
    },
  },
  {
    emoji: '🎓🔥',
    blob: 'rgba(196,179,245,0.22)',
    tr: {
      title: 'Yol Arkadaşını Bul!',
      body:  "Veri biliminde sıfır mısın? Seninle aynı hedefe koşan birini bul, beraber uzmanlaşın, projeleri birlikte patlatın!",
    },
    en: {
      title: 'Find Your Study Buddy!',
      body:  "Are you a beginner in Data Science? Find someone chasing the same goal and master it together!",
    },
  },
  {
    emoji: '💎🤝',
    blob: 'rgba(246,194,35,0.18)',
    tr: {
      title: "SQL'de Kötüyüm Diye Üzülme!",
      body:  "Uzman Python bilgini bir arkadaşının SQL uzmanlığıyla takas et. Dersi dersle barterla, sistemi domine et!",
    },
    en: {
      title: "Don't Worry About SQL!",
      body:  "Trade your Python expertise with a friend's SQL skills. Barter courses and dominate the system!",
    },
  },
  {
    emoji: '☕⏳',
    blob: 'rgba(196,179,245,0.25)',
    tr: {
      title: 'Odak Moduna Geçiyoruz!',
      body:  "25 dakika bas, 5 dakika mola! Odaklandıkça Gem'leri topla, disiplinini şov yap.",
    },
    en: {
      title: 'Focus Mode ON!',
      body:  "25 mins work, 5 mins break! Collect Gems as you focus and show off your discipline.",
    },
  },
  {
    emoji: '📍',
    blob: 'rgba(154,230,180,0.18)',
    tr: {
      title: 'Priz Avcılığına Son!',
      body:  "Vibe'ına uygun yeri seç; açık hava mı, sessiz kütüphane mi yoksa kahve kokulu bir kafe mi? Hemen keşfet.",
    },
    en: {
      title: 'No More Socket Hunting!',
      body:  "Choose your vibe: Outdoors, quiet library, or a cozy cafe? Discover the nearest spot.",
    },
  },
];

export default function OnboardingGuide() {
  const { user }   = useAuth();
  const { i18n }   = useTranslation();
  const isEN       = i18n.language === 'en';

  const [dismissed, setDismissed] = useState(false);
  const [slide, setSlide]         = useState(0);
  const [dir, setDir]             = useState('forward');

  /* Show only for logged-in users who haven't completed the guide */
  if (!user || dismissed || localStorage.getItem(GUIDE_KEY) === '1') return null;

  const total  = SLIDES.length;
  const isLast = slide === total - 1;

  const { emoji, blob }   = SLIDES[slide];
  const { title, body }   = SLIDES[slide][isEN ? 'en' : 'tr'];

  /* Labels update immediately when i18n.language changes */
  const label = {
    back:  isEN ? '← Back'   : '← Geri',
    next:  isEN ? 'Next →'   : 'İleri →',
    cta:   isEN ? "Got it, let's go! 🚀" : "Anladım, let's go! 🚀",
    aria:  isEN ? 'Welcome guide' : 'Karşılama rehberi',
  };

  const goTo = (idx) => {
    setDir(idx > slide ? 'forward' : 'back');
    setSlide(idx);
  };

  const handleDone = () => {
    localStorage.setItem(GUIDE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="sz-guide-backdrop" role="dialog" aria-modal="true" aria-label={label.aria}>
      <div className="sz-guide-card">

        {/* Decorative radial blob — colour shifts per slide */}
        <div
          className="sz-guide-blob"
          style={{ background: `radial-gradient(circle, ${blob} 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        {/* Slide content — key on slide+lang forces re-animation on both changes */}
        <div key={`${slide}-${dir}-${isEN ? 'en' : 'tr'}`} className={`sz-guide-slide sz-guide-slide-${dir}`}>
          <div className="sz-guide-emoji" aria-hidden="true">
            {slide === 0 ? '📖✨' : emoji}
          </div>
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
          <div className="sz-guide-nav-last">
            {slide > 0 && (
              <button className="sz-guide-btn-ghost btn-full" onClick={() => goTo(slide - 1)}>
                {label.back}
              </button>
            )}
            <button className="sz-guide-btn-cta" onClick={handleDone}>
              {label.cta}
            </button>
          </div>
        ) : (
          <div className="sz-guide-nav">
            {slide > 0 && (
              <button className="sz-guide-btn-ghost" onClick={() => goTo(slide - 1)}>
                {label.back}
              </button>
            )}
            <button className="sz-guide-btn-next" onClick={() => goTo(slide + 1)}>
              {label.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
