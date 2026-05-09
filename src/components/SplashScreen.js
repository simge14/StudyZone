import React, { useState, useEffect } from 'react';

/* Logo public/ klasöründen sunuluyor — import hatası riski sıfır */
const LOGO_SRC = process.env.PUBLIC_URL + '/StudyZone.png';

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setExiting(true), 1600);
    const done    = setTimeout(() => onDone(),         2100);
    return () => { clearTimeout(fadeOut); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className={`sz-splash${exiting ? ' sz-splash-exit' : ''}`}
      aria-label="StudyZone yükleniyor">
      <img
        src={LOGO_SRC}
        alt="StudyZone"
        style={{ width: 'auto', height: '40px', maxWidth: '62%', filter: 'brightness(0) invert(1)' }}
      />
    </div>
  );
}
