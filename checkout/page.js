'use client';
import { useState } from 'react';

export default function CheckoutPage() {
  const [postalCode, setPostalCode] = useState('');
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPoints = async (e) => {
    e.preventDefault();
    if (!postalCode) return;

    setLoading(true);
    setError('');
    setPickupPoints([]);

    try {
      const res = await fetch(`/api/pickup-points?postalCode=${postalCode}&countryCode=NO`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.pickupPoints && Array.isArray(data.pickupPoints)) {
        setPickupPoints(data.pickupPoints.slice(0, 5));
      } else if (Array.isArray(data)) {
        setPickupPoints(data.slice(0, 5));
      } else {
        setError('Ingen hentesteder funnet på dette postnummeret.');
      }
    } catch (err) {
      setError('Noe gikk galt under hentingen.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    if (type === 'LOCKER') return 'Pakkeboks';
    if (type === 'MANNED') return 'Butikk';
    return type || '';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h2>Velg utleveringssted</h2>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Søk etter hentesteder i nærheten ved å oppgi postnummer.
      </p>

      <form onSubmit={fetchPoints} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="F.eks. 0101"
          maxLength={4}
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
          style={{ padding: '10px 14px', fontSize: '16px', flex: 1, borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Søker...' : 'Finn steder'}
        </button>
      </form>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {pickupPoints.length === 0 && !error && !loading && (
        <p style={{ color: '#888', fontSize: '14px' }}>Ingen hentesteder å vise enda.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {pickupPoints.map((point) => (
          <label
            key={point.id}
            style={{
              border: '1px solid #e5e5e5',
              padding: '16px',
              borderRadius: '10px',
              display: 'flex',
              gap: '14px',
              cursor: 'pointer',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <input type="radio" name="pickup_point" value={point.id} style={{ marginTop: '6px', accentColor: '#000' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '16px' }}>{point.name || point.id}</strong>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: point.pickupPointType === 'LOCKER' ? '#dbeafe' : '#dcfce7',
                    color: point.pickupPointType === 'LOCKER' ? '#1d4ed8' : '#15803d',
                  }}
                >
                  {getTypeLabel(point.pickupPointType)}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}>
                {point.address || point.street || ''}, {point.postalCode || ''} {point.city || ''}
              </div>
              {point.distanceInKm && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {point.distanceInKm} km ({point.durationInMinutes} min kjøring)
                </div>
              )}
              {point.openingHours && point.openingHours.length > 0 && (
                <details style={{ marginTop: '6px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}>Åpningstider</summary>
                  <ul style={{ marginTop: '4px', paddingLeft: '16px', fontSize: '12px', color: '#555' }}>
                    {point.openingHours.map((oh, i) => (
                      <li key={i}>
                        {oh.day}: {oh.opening} – {oh.closing}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {point.locationDescription && (
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{point.locationDescription}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
