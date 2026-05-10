import React, { useState, useEffect } from 'react';
import Logo from '../assets/StudyZone.png';

/* Splash: 2.1 s — krem (#F5F5EB) arka plan, logo büyük ve ortalı */
export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setExiting(true), 1600);
    const done    = setTimeout(() => onDone(),         2100);
    return () => { clearTimeout(fadeOut); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      className={`sz-splash${exiting ? ' sz-splash-exit' : ''}`}
      aria-label="StudyZone yükleniyor"
    >
      <img
        src={Logo}
        alt="StudyZone"
        className="sz-splash-logo-img"
      />
    </div>
  );
}
