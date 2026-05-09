import React, { useState, useEffect } from 'react';

/* Shows for ~2 s then calls onDone() to unmount */
export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setExiting(true), 1600); /* start fade at 1.6 s */
    const done    = setTimeout(() => onDone(),         2100); /* remove at 2.1 s    */
    return () => { clearTimeout(fadeOut); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className={`sz-splash${exiting ? ' sz-splash-exit' : ''}`} aria-label="StudyZone yükleniyor">
      <div className="sz-splash-inner">
        {/* Wordmark — same S/Z colour treatment as Navbar */}
        <div className="sz-splash-brand">
          <span className="sz-splash-s">S</span>tudy<span className="sz-splash-z">Z</span>one
        </div>
        <p className="sz-splash-tagline">Birlikte Öğren · Birlikte Başar</p>
      </div>

      {/* Decorative lavender blobs */}
      <div className="sz-splash-blob sz-splash-blob-tr" aria-hidden="true" />
      <div className="sz-splash-blob sz-splash-blob-bl" aria-hidden="true" />
    </div>
  );
}
