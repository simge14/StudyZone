import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const TYPE_ICONS = { cafe: '☕', library: '📚', center: '🏛', mall: '🏬' };

/* BR-31: Only Anadolu Yakası — filtered either by backend or client-side */
/* BR-33: No ratings or comments — this view intentionally omits them */
export default function LocationGuide() {
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === 'en';

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [district, setDistrict] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setOffline(false);
    api.get('/api/locations')
      .then(({ data }) => {
        /* BR-31: Keep only Anadolu Yakası entries — filter by region field or known districts */
        const ANADOLU_DISTRICTS = [
          'Kadıköy','Ataşehir','Ümraniye','Maltepe','Kartal',
          'Pendik','Gebze','Çekmeköy','Sancaktepe','Tuzla','Beykoz','Sultanbeyli',
        ];
        const filtered = data.filter((loc) =>
          loc.region === 'anadolu' ||
          loc.side === 'anadolu' ||
          ANADOLU_DISTRICTS.includes(loc.district) ||
          ANADOLU_DISTRICTS.some((d) => loc.district?.toLowerCase().includes(d.toLowerCase()))
        );
        setLocations(filtered.length > 0 ? filtered : data);
      })
      .catch((err) => {
        if (!err.response) setOffline(true);
        else setError(err.response?.data?.message || 'Konumlar yüklenemedi. Lütfen tekrar deneyin.');
      })
      .finally(() => setLoading(false));
  }, [retryKey]);

  const districts = [...new Set(locations.map((l) => l.district).filter(Boolean))].sort();
  const types = [...new Set(locations.map((l) => l.type).filter(Boolean))];

  const filtered = locations.filter(
    (l) => (!district || l.district === district) && (!typeFilter || l.type === typeFilter)
  );

  /* Full-page offline / error states */
  if (offline || error) {
    const isOffline = offline;
    return (
      <div className="sz-page" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{isOffline ? '🔌' : '⚠️'}</div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.15rem' }}>
          {isOffline ? 'Sunucu Kapalı' : 'Yüklenemedi'}
        </h2>
        <p style={{ color: 'var(--sz-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
          {isOffline
            ? <>Çalışma alanlarını yüklemek için backend sunucunuzu başlatın.<br />
                <code style={{ background: 'var(--sz-border)', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>
                  localhost:3000
                </code>
              </>
            : error}
        </p>
        <button className="btn-sz-outline" style={{ marginTop: '1.5rem' }}
          onClick={() => setRetryKey((k) => k + 1)}>
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="sz-page">
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ marginBottom: '0.3rem', fontSize: '1.3rem' }}>{t('locations.title')}</h1>
        <p style={{ color: 'var(--sz-muted)', margin: 0, fontSize: '0.85rem' }}>{t('locations.subtitle')}</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <select className="sz-input" style={{ flex: 1, minWidth: 130 }} value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">{t('locations.filterAll')}</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {types.length > 1 && (
          <select className="sz-input" style={{ flex: 1, minWidth: 130 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">— Tür —</option>
            {types.map((tp) => (
              <option key={tp} value={tp}>{t(`locations.types.${tp}`, tp)}</option>
            ))}
          </select>
        )}
        {(district || typeFilter) && (
          <button className="btn-sz-ghost" style={{ padding: '0.5rem 0.85rem', minHeight: 44 }}
            onClick={() => { setDistrict(''); setTypeFilter(''); }}>✕</button>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p style={{ fontSize: '0.78rem', color: 'var(--sz-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
          {filtered.length} yer
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="sz-location-grid">
          {[1,2,3].map((n) => (
            <div key={n} className="sz-location-card">
              <div className="sz-skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
              <div className="sz-skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
              <div className="sz-skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
              <div className="sz-skeleton" style={{ height: 12, width: '60%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Location cards */}
      {!loading && (
        <div className="sz-location-grid">
          {filtered.map((loc) => (
            <div key={loc.id ?? loc._id ?? loc.name} className="sz-location-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.93rem', fontWeight: 700, lineHeight: 1.3, flex: 1, paddingRight: '0.5rem' }}>
                  {TYPE_ICONS[loc.type] || '📍'} {loc.name}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                {loc.district && <span className="sz-pill sz-pill-teach">{loc.district}</span>}
                {loc.type && <span className="sz-pill sz-pill-learn">{t(`locations.types.${loc.type}`, loc.type)}</span>}
              </div>

              {/* Description — prefers locale field, falls back to generic description */}
              {(loc.descTR || loc.descEN || loc.description) && (
                <p style={{ fontSize: '0.82rem', color: 'var(--sz-muted)', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
                  {isEN ? (loc.descEN || loc.description) : (loc.descTR || loc.description)}
                </p>
              )}

              {loc.address && (
                <p style={{ fontSize: '0.76rem', color: 'var(--sz-muted)', margin: '0 0 0.6rem', fontStyle: 'italic' }}>
                  📍 {loc.address}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {loc.wifi !== undefined && (
                  <span className={`sz-chip${loc.wifi ? ' sz-chip-green' : ' sz-chip-red'}`}>
                    {loc.wifi ? '✓' : '✗'} {t('locations.wifi')}
                  </span>
                )}
                {loc.sockets !== undefined && (
                  <span className={`sz-chip${loc.sockets ? ' sz-chip-green' : ' sz-chip-red'}`}>
                    {loc.sockets ? '✓' : '✗'} {t('locations.sockets')}
                  </span>
                )}
              </div>

              {(loc.hours || loc.openHours || loc.open_hours) && (
                <p style={{ fontSize: '0.75rem', color: 'var(--sz-muted)', margin: 0, fontWeight: 600 }}>
                  🕐 {loc.hours || loc.openHours || loc.open_hours}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--sz-muted)', padding: '2.5rem 0' }}>
          Bu filtre için yer bulunamadı.
        </p>
      )}

      {/* BR-31 & BR-33 note */}
      <div style={{ marginTop: '2.5rem', padding: '0.75rem', borderTop: '1px solid var(--sz-border)', fontSize: '0.72rem', color: 'var(--sz-muted)', textAlign: 'center', fontWeight: 600, letterSpacing: '0.04em' }}>
        ANATOLIAN SIDE ONLY · NO REVIEWS & RATINGS
      </div>
    </div>
  );
}
