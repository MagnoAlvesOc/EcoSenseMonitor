import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from "react-leaflet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import moment from "moment";
import { useStation } from "@/lib/StationContext";
import { useExternalIoT, safeNum, getTs, ONLINE_THRESHOLD_S } from "@/lib/useExternalIoT";

delete L.Icon.Default.prototype._getIconUrl;

// ── Color scale helpers ──────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }
function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}
function toRgb(c) { return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`; }

const SCALES = {
  temperatura_c: {
    label: "Temperatura",
    unit: "°C",
    min: 10, max: 45,
    stops: [[59,130,246], [16,185,129], [245,158,11], [239,68,68]],  // blue→green→amber→red
  },
  umidade_relativa_perc: {
    label: "Umidade",
    unit: "%",
    min: 0, max: 100,
    stops: [[245,158,11], [59,130,246], [16,185,129]],   // amber→blue→green
  },
  nivel_co2: {
    label: "CO₂",
    unit: "ppm",
    min: 400, max: 1500,
    stops: [[16,185,129], [245,158,11], [239,68,68]],    // green→amber→red
  },
  pressao_atmosferica_hpa: {
    label: "Pressão",
    unit: "hPa",
    min: 980, max: 1030,
    stops: [[139,92,246], [59,130,246], [16,185,129]],   // purple→blue→green
  },
  indice_uv: {
    label: "Índice UV",
    unit: "",
    min: 0, max: 12,
    stops: [[16,185,129], [245,158,11], [239,68,68]],
  },
  status_bateria_v: {
    label: "Bateria",
    unit: "V",
    min: 3.0, max: 4.2,
    stops: [[239,68,68], [245,158,11], [16,185,129]],    // red→amber→green
  },
};

function getScaleColor(scale, value) {
  if (value == null) return "#6b7280";
  const t = (value - scale.min) / (scale.max - scale.min);
  const stops = scale.stops;
  const seg = 1 / (stops.length - 1);
  const idx = Math.min(Math.floor(t / seg), stops.length - 2);
  const localT = (t - idx * seg) / seg;
  return toRgb(lerpColor(stops[idx], stops[idx + 1], localT));
}

function makeStationIcon(color, isOnline, label, hasAlert) {
  const pulse = isOnline ? `
    <circle cx="18" cy="6" r="5" fill="${color}" opacity="0.25">
      <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>` : "";
  // Destaque de alerta crítico: pulso vermelho rápido + selo "!" sobre o pino
  const alertBadge = hasAlert ? `
    <circle cx="18" cy="6" r="9" fill="#dc2626" opacity="0.3">
      <animate attributeName="r" values="8;13;8" dur="1s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="29" cy="7" r="7" fill="#dc2626" stroke="white" stroke-width="1.5"/>
    <text x="29" y="10.5" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="Arial,sans-serif">!</text>` : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      ${pulse}${alertBadge}
      <path d="M18 2C10.268 2 4 8.268 4 16c0 10 14 26 14 26s14-16 14-26C32 8.268 25.732 2 18 2z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="16" r="6" fill="white" opacity="0.9"/>
      <text x="18" y="20" text-anchor="middle" font-size="8" font-weight="bold"
        fill="${color}" font-family="Arial,sans-serif">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
  });
}

// ── Alertas críticos por estação (limites do AlertConfig) ─────────────────────
const LIMITS_DEFAULT = {
  temperatura_max: 40,
  temperatura_min: 5,
  umidade_max: 95,
  umidade_min: 20,
  co2_max: 1000,
  bateria_min_v: 3.3,
};

function getCriticalAlerts(reading, cfg = {}) {
  if (!reading) return [];
  const L = { ...LIMITS_DEFAULT, ...cfg };
  const alerts = [];
  const temp = safeNum(reading.temperatura_c);
  if (temp != null) {
    if (temp >= L.temperatura_max) alerts.push(`Temperatura alta: ${temp.toFixed(1)}°C (limite ${L.temperatura_max}°C)`);
    if (temp <= L.temperatura_min) alerts.push(`Temperatura baixa: ${temp.toFixed(1)}°C (limite ${L.temperatura_min}°C)`);
  }
  const umid = safeNum(reading.umidade_relativa_perc);
  if (umid != null) {
    if (umid >= L.umidade_max) alerts.push(`Umidade alta: ${umid.toFixed(1)}% (limite ${L.umidade_max}%)`);
    if (umid <= L.umidade_min) alerts.push(`Umidade baixa: ${umid.toFixed(1)}% (limite ${L.umidade_min}%)`);
  }
  const co2 = safeNum(reading.nivel_co2);
  if (co2 != null && co2 >= L.co2_max) alerts.push(`CO₂ alto: ${co2.toFixed(0)} ppm (limite ${L.co2_max} ppm)`);
  const bat = safeNum(reading.status_bateria_v);
  if (bat != null && bat <= L.bateria_min_v) alerts.push(`Bateria baixa: ${bat.toFixed(2)} V (limite ${L.bateria_min_v} V)`);
  return alerts;
}

// ── Legend component ─────────────────────────────────────────────────────────
function Legend({ scale, activeMetric }) {
  if (!scale) return null;
  return (
    <div
      className="absolute top-16 left-3 md:top-auto md:left-auto md:bottom-6 md:right-4 z-[1000] pointer-events-auto"
      style={{ minWidth: 130 }}
    >
      <div className="bg-background/90 backdrop-blur-md rounded-xl border border-border shadow-xl p-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {scale.label} ({scale.unit})
        </p>
        <div className="flex items-center gap-1 mb-1">
          <div
            className="h-3 flex-1 rounded-full"
            style={{
              background: `linear-gradient(to right, ${scale.stops.map((s, i) =>
                `rgb(${s.join(",")}) ${(i / (scale.stops.length - 1)) * 100}%`
              ).join(", ")})`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>{scale.min}{scale.unit}</span>
          <span>{scale.max}{scale.unit}</span>
        </div>
      </div>
    </div>
  );
}

// ── Metric selector ──────────────────────────────────────────────────────────
function MetricSelector({ activeMetric, onChange }) {
  return (
    <div className="absolute top-16 right-3 md:top-4 md:right-4 z-[1000] pointer-events-auto">
      <div className="bg-background/90 backdrop-blur-md rounded-xl border border-border shadow-xl p-2 flex flex-col gap-1">
        {Object.entries(SCALES).map(([key, s]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all text-left ${
              activeMetric === key
                ? "text-white shadow"
                : "text-muted-foreground hover:bg-muted"
            }`}
            style={activeMetric === key ? {
              background: toRgb(s.stops[Math.floor(s.stops.length / 2)]),
            } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Map click handler ────────────────────────────────────────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// ── Coords panel ─────────────────────────────────────────────────────────────
function CoordsPanel({ coords, onClose }) {
  useEffect(() => {
    if (!coords) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [coords]);

  if (!coords) return null;
  return (
    <div
      style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", zIndex: 9999 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-background/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl px-5 py-3 flex flex-col gap-2 min-w-[280px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">📍 Ponto Selecionado</span>
          <button
            className="text-muted-foreground"
            onPointerDown={e => { e.stopPropagation(); onClose(); }}
            style={{ cursor: "pointer", fontSize: 20, lineHeight: 1, background: "none", border: "none", padding: "0 4px" }}
          >×</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Latitude</p>
            <p className="text-sm font-mono font-bold text-blue-700">{coords.lat.toFixed(6)}</p>
          </div>
          <div className="bg-green-50 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Longitude</p>
            <p className="text-sm font-mono font-bold text-green-700">{coords.lng.toFixed(6)}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Use o painel <strong>Mapa de Estações</strong> para definir a posição com essas coordenadas.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const WORLD_BOUNDS = [[-90, -180], [90, 180]];

// Safe display helper: returns "--" for null, -1 or NaN values
function safeDisplay(v, decimals = 1) {
  const n = Number(v);
  if (v == null || isNaN(n) || n === -1) return "--";
  return n.toFixed(decimals);
}

// Get timestamp (ms) from a reading row — delega ao getTs compartilhado
// (usa o MAIS RECENTE entre servidor/dispositivo) para que o mapa e o
// dashboard concordem e uma leitura fresca nunca pareça antiga.
function getReadingTs(row) {
  return getTs(row);
}

export default function FloatingMapBg() {
  const { setSelectedStation, setClickedCoords, clickedCoords } = useStation();
  const [activeMetric, setActiveMetric] = useState("temperatura_c");
  const queryClient = useQueryClient();
  const autoRegisteredRef = useRef(new Set());
  const lastSyncedRef = useRef({});

  const { data: estacoes = [], isSuccess: estacoesLoaded } = useQuery({
    queryKey: ["estacoes-bg"],
    queryFn: () => base44.entities.Estacoes.list(),
    refetchInterval: 5000,
  });

  // Limites críticos configurados (AlertConfig) para destacar estações no mapa
  const { data: alertConfigs = [] } = useQuery({
    queryKey: ["alert-config-bg"],
    queryFn: () => base44.entities.AlertConfig.list(),
    refetchInterval: 60000,
  });
  const alertCfg = alertConfigs[0] || {};

  // Use external API as the source of truth for readings
  const { data: rawApiData } = useExternalIoT();
  const apiData = rawApiData ?? [];

  // Get all readings for a station by matching estacao_id (sorted desc by timestamp)
  const getReadingsForStation = (est) => {
    return apiData
      .filter(r =>
        r.estacao_id === est.estacao_id ||
        r.estacao_id === est.id ||
        r.estacao_id === est.ip_local ||
        r.estacao_nome === est.nome ||
        r.ip_local_estacao === est.ip_local
      )
      .sort((a, b) => getReadingTs(b) - getReadingTs(a));
  };

  const getLatestReading = (est) => getReadingsForStation(est)[0] ?? null;

  // Posição da estação: usa o GPS da leitura mais recente quando disponível
  // (gps_fix true + lat/lng válidas), senão cai para as coordenadas cadastradas.
  const getStationPosition = (est) => {
    const reading = getLatestReading(est);
    const lat = safeNum(reading?.latitude);
    const lng = safeNum(reading?.longitude);
    if (reading?.gps_fix && lat != null && lng != null) return [lat, lng];
    return [est.latitude, est.longitude];
  };

  const getStatus = (est) => {
    const reading = getLatestReading(est);
    if (!reading) return "offline";
    const secsSince = (Date.now() - getReadingTs(reading)) / 1000;
    return secsSince < ONLINE_THRESHOLD_S ? "online" : "offline";
  };

  // ── Auto-registro: cria a estação no mapa quando a API envia GPS válido ────
  useEffect(() => {
    if (!estacoesLoaded) return;
    apiData.forEach((r) => {
      const lat = safeNum(r.latitude);
      const lng = safeNum(r.longitude);
      if (!r.gps_fix || lat == null || lng == null) return;
      const keyId = r.estacao_id || r.estacao_nome;
      if (!keyId) return;
      const matched = estacoes.find(est =>
        est.nome === r.estacao_nome || est.ip_local === r.estacao_id
      );
      if (!matched) {
        if (autoRegisteredRef.current.has(keyId)) return;
        autoRegisteredRef.current.add(keyId);
        base44.entities.Estacoes.create({
          nome: r.estacao_nome || keyId,
          descricao: "Estação registrada automaticamente via GPS",
          latitude: lat,
          longitude: lng,
          ip_local: r.estacao_id || "",
        })
          .then(() => queryClient.invalidateQueries({ queryKey: ["estacoes"] }))
          .catch(() => autoRegisteredRef.current.delete(keyId));
        return;
      }
      // Atualiza a posição cadastrada sempre que o GPS muda (tolerância ~50 m)
      const drift = Math.max(
        Math.abs((matched.latitude ?? 0) - lat),
        Math.abs((matched.longitude ?? 0) - lng)
      );
      const posKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (drift <= 0.0005 || lastSyncedRef.current[matched.id] === posKey) return;
      lastSyncedRef.current[matched.id] = posKey;
      base44.entities.Estacoes.update(matched.id, {
        latitude: lat,
        longitude: lng,
        ultima_sincronizacao: new Date().toISOString(),
      })
        .then(() => queryClient.invalidateQueries({ queryKey: ["estacoes"] }))
        .catch(() => { delete lastSyncedRef.current[matched.id]; });
    });
  }, [apiData, estacoes, estacoesLoaded, queryClient]);

  const scale = SCALES[activeMetric];
  const center = estacoes.length > 0 ? [estacoes[0].latitude, estacoes[0].longitude] : [-2.5, -44.28];

  return (
    <div className="fixed inset-0 z-0">
      <MapContainer
        center={center}
        zoom={8}
        minZoom={2}
        maxZoom={18}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        attributionControl={true}
        worldCopyJump={false}
      >
        {/* Satélite de alta resolução + nomes de lugares — gratuito e sem chave */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
          noWrap={true}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          attribution=''
          noWrap={true}
        />
        <MapClickHandler onMapClick={setClickedCoords} />

        {estacoes.map(est => {
          const reading = getLatestReading(est);
          const status = getStatus(est);
          const alerts = getCriticalAlerts(reading, alertCfg);
          const rawValue = reading ? reading[activeMetric] : null;
          const value = safeNum(rawValue);
          const color = getScaleColor(scale, value);
          const isOnline = status === "online";
          const markerColor = isOnline ? "#22c55e" : "#ef4444";
          const position = getStationPosition(est);

          return (
            <React.Fragment key={est.id}>
              {/* Alerta crítico — anel tracejado vermelho ao redor da estação */}
              {alerts.length > 0 && (
                <Circle
                  center={position}
                  radius={2500}
                  pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0, weight: 2, dashArray: "5 6" }}
                />
              )}

              {/* Outer glow ring — raio efetivo máximo de 15 km */}
              {isOnline && value != null && (
                <Circle
                  center={position}
                  radius={2500}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.04,
                    weight: 0,
                  }}
                />
              )}

              {/* Inner filled circle */}
              {value != null && (
                <Circle
                  center={position}
                  radius={1200}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isOnline ? 0.07 : 0.05,
                    weight: 1,
                  }}
                />
              )}

              {/* Custom colored station marker */}
              <Marker
                position={position}
                icon={makeStationIcon(markerColor, isOnline, est.nome.slice(0, 2).toUpperCase(), alerts.length > 0)}
                eventHandlers={{ click: () => setSelectedStation({ estacao: est, leituras: getReadingsForStation(est) }) }}
              >
                <Popup maxWidth={240}>
                  <div style={{ minWidth: 210, fontFamily: "Inter, sans-serif" }}>
                    {/* Header */}
                    <div style={{ background: isOnline ? color : "#9ca3af", borderRadius: "8px 8px 0 0", margin: "-10px -10px 10px", padding: "10px 12px" }}>
                      <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0 }}>{est.nome}</p>
                      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, margin: "2px 0 0" }}>
                        {isOnline ? "● Online" : "● Offline"} • {Number(position[0]).toFixed(4)}, {Number(position[1]).toFixed(4)}
                        {reading?.gps_fix ? " 🛰️ GPS" : ""}
                      </p>
                    </div>

                    {alerts.length > 0 && (
                      <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 8px", marginBottom: 8, fontSize: 11, color: "#991b1b", lineHeight: 1.4 }}>
                        <strong>⚠ Alerta crítico</strong>
                        {alerts.map(a => <div key={a}>• {a}</div>)}
                      </div>
                    )}

                    {reading ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: 12 }}>
                        <div style={{ background: "#fef3c7", borderRadius: 6, padding: "5px 8px" }}>
                          <div style={{ color: "#92400e", fontSize: 10, fontWeight: 600 }}>TEMPERATURA</div>
                          <div style={{ color: "#78350f", fontWeight: 700, fontSize: 15 }}>{safeDisplay(reading.temperatura_c, 1)}°C</div>
                        </div>
                        <div style={{ background: "#eff6ff", borderRadius: 6, padding: "5px 8px" }}>
                          <div style={{ color: "#1e40af", fontSize: 10, fontWeight: 600 }}>UMIDADE</div>
                          <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 15 }}>{safeDisplay(reading.umidade_relativa_perc, 1)}%</div>
                        </div>
                        <div style={{ background: "#f5f3ff", borderRadius: 6, padding: "5px 8px" }}>
                          <div style={{ color: "#5b21b6", fontSize: 10, fontWeight: 600 }}>PRESSÃO</div>
                          <div style={{ color: "#4c1d95", fontWeight: 700, fontSize: 13 }}>{safeDisplay(reading.pressao_atmosferica_hpa, 0)} hPa</div>
                        </div>
                        <div style={{ background: "#ecfdf5", borderRadius: 6, padding: "5px 8px" }}>
                          <div style={{ color: "#065f46", fontSize: 10, fontWeight: 600 }}>ALTITUDE</div>
                          <div style={{ color: "#047857", fontWeight: 700, fontSize: 13 }}>{safeDisplay(reading.altitude_m, 1)} m</div>
                        </div>
                        <div style={{ background: "#fff7ed", borderRadius: 6, padding: "5px 8px", gridColumn: "1 / -1" }}>
                          <div style={{ color: "#9a3412", fontSize: 10, fontWeight: 600 }}>SINAL Wi-Fi (RSSI)</div>
                          <div style={{ color: "#7c2d12", fontWeight: 700, fontSize: 13 }}>{safeDisplay(reading.rssi, 0)} dBm</div>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "8px 0" }}>Sem leituras registradas</p>
                    )}

                    <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 8, paddingTop: 6, fontSize: 10, color: "#9ca3af", textAlign: "right" }}>
                      {reading ? moment(getReadingTs(reading)).format("DD/MM/YYYY HH:mm:ss") : "—"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Clicked coords panel */}
      <CoordsPanel coords={clickedCoords} onClose={() => setClickedCoords(null)} />
    </div>
  );
}