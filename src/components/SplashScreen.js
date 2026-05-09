import React, { useState, useEffect } from 'react';
import StudyZoneLogo from '../assets/StudyZone.png';

/* Cream (#FFFDD0) splash — 2.1 s total, fade-out starts at 1.6 s */
export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setExiting(true), 1600);
    const done    = setTimeout(() => onDone(),         2100);
    return () => { clearTimeout(fadeOut); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className={`sz-splash${exiting ? ' sz-splash-exit' : ''}`} aria-label="StudyZone yükleniyor">
      <img src={StudyZoneLogo} alt="StudyZone" className="sz-splash-logo-img" />
    </div>
  );
}
