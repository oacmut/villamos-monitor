"use client";
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div style={{ background: '#0a0a0c', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff' }}>
    RENDSZER INICIALIZÁLÁSA...
  </div>
});

export default function Home() {
  return (
    <main className="app-container">
      <div className="header">
        <h1>Tram Tracker</h1>
        <div className="live-status">
          <div className="dot"></div>
          LIVE FEED
        </div>
      </div>
      
      <div className="map-container">
        <MapComponent />
      </div>
    </main>
  );
}