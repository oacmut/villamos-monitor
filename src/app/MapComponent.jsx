"use client";
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MUPA_POS = [47.471269, 19.072969];
const VAGOHID_POS = [47.474011, 19.078421];

function MapEvents({ setSelectedId, setMapCenter }) {
  useMapEvents({
    click: () => { setSelectedId(null); setMapCenter(null); },
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  if (center) map.setView(center, 17, { animate: true, duration: 1.2 });
  return null;
}

const createTramIcon = (line, isSelected, bearing) => L.divIcon({
  className: 'custom-tram-icon-container',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div class="arrow-wrapper" style="transform: rotate(${bearing}deg); position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
        <div class="tram-arrow" style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #007aff; filter: drop-shadow(0 0 2px white);">▲</div>
      </div>
      <div class="tram-icon-wrapper ${isSelected ? 'selected-tram' : ''}" style="z-index: 2;">${line}</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const stopIcon = L.divIcon({
  className: 'custom-stop',
  html: `<div class="stop-marker"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export default function MapComponent() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  const fetchTrams = async () => {
    try {
      const res = await fetch('/api/trams');
      const data = await res.json();
      if (data.vehicles) {
        setVehicles(data.vehicles);
        if (selectedId) {
          const s = data.vehicles.find(v => v.id === selectedId);
          if (s?.lat) setMapCenter([s.lat, s.lon]);
        }
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchTrams();
    const interval = setInterval(fetchTrams, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);


  const comingTrams = [];
  const routeCounts = {};
  
  vehicles.filter(v => !v.isPast).forEach(v => {
    routeCounts[v.route] = (routeCounts[v.route] || 0) + 1;
    if (routeCounts[v.route] <= 2) {
      comingTrams.push(v);
    }
  });

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div className="side-panel">
        <div className="eta-title">Indulások Jászai felé</div>
        <div className="scroll-area">
          {comingTrams.length > 0 ? comingTrams.map((v) => (
            <div 
              key={v.id} 
              className={`tram-card clickable ${selectedId === v.id ? 'active' : ''}`}
              onClick={(e) => { 
                e.stopPropagation();
                if(v.lat) { setSelectedId(v.id); setMapCenter([v.lat, v.lon]); }
              }}
            >
              <div className="line">{v.route}</div>
              <div className="eta-info">
                <div className="stop-label">
                  {v.stopName} {!v.lat && <span style={{ opacity: 0.6, fontSize: '0.65rem' }}> (tervezett)</span>}
                </div>

                <div className="time" style={!v.lat ? { color: '#86868b' } : {}}>
                  {v.minutes <= 0 ? "Most" : `${v.minutes}p`}
                </div>
              </div>
            </div>
          )) : <div className="no-data">Nincs közeledő járat</div>}
        </div>
      </div>

      <MapContainer center={[47.4725, 19.0760]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <MapController center={mapCenter} />
        <MapEvents setSelectedId={setSelectedId} setMapCenter={setMapCenter} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        <Marker position={MUPA_POS} icon={stopIcon}><Tooltip permanent className="custom-tooltip">Müpa</Tooltip></Marker>
        <Marker position={VAGOHID_POS} icon={stopIcon}><Tooltip permanent>Vágóhíd u.</Tooltip></Marker>

        {vehicles.filter(v => v.lat).map((v) => (
          <Marker 
            key={`marker-${v.id}`} 
            position={[v.lat, v.lon]} 
            icon={createTramIcon(v.route, selectedId === v.id, v.bearing)}
            opacity={v.isPast ? 0.5 : 1}
          >
            <Tooltip direction="top" offset={[0, -15]} className="custom-tooltip">
              {v.route}: {v.isPast ? "Elment" : (v.minutes <= 0 ? "Most" : v.minutes + "p")}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}