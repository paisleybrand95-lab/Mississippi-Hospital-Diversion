import { useState, useEffect } from "react";

const HOSPITALS = [
  { id: 1, name: "UMMC", full: "University of MS Medical Center", city: "Jackson", region: "Central", lat: 32.535, lng: -90.178, level: "I", beds: 695, specialty: ["Trauma L1","Burn","Cardiac","Neuro"] },
  { id: 2, name: "Baptist Medical", full: "Baptist Medical Center", city: "Jackson", region: "Central", lat: 32.298, lng: -90.184, level: "II", beds: 472, specialty: ["Cardiac","Stroke","Orthopedic"] },
  { id: 3, name: "St. Dominic", full: "St. Dominic Hospital", city: "Jackson", region: "Central", lat: 32.308, lng: -90.206, level: "III", beds: 535, specialty: ["Cardiac","Stroke","OB"] },
  { id: 4, name: "Merit Health Central", full: "Merit Health Central", city: "Jackson", region: "Central", lat: 32.277, lng: -90.158, level: "III", beds: 319, specialty: ["General","OB"] },
  { id: 5, name: "Merit Health River Oaks", full: "Merit Health River Oaks", city: "Flowood", region: "Central", lat: 32.333, lng: -90.132, level: "III", beds: 158, specialty: ["General","Ortho"] },
  { id: 6, name: "Woman's Hospital", full: "Woman's Hospital", city: "Jackson", region: "Central", lat: 32.372, lng: -90.168, level: "III", beds: 180, specialty: ["OB","Gynecology","NICU"] },
  { id: 7, name: "Forrest General", full: "Forrest General Hospital", city: "Hattiesburg", region: "South", lat: 31.327, lng: -89.296, level: "II", beds: 537, specialty: ["Trauma","Cardiac","Stroke"] },
  { id: 8, name: "Wesley Medical", full: "Wesley Medical Center", city: "Hattiesburg", region: "South", lat: 31.302, lng: -89.281, level: "III", beds: 211, specialty: ["General","Cardiac"] },
  { id: 9, name: "Memorial Gulfport", full: "Memorial Hospital at Gulfport", city: "Gulfport", region: "Coast", lat: 30.388, lng: -89.057, level: "II", beds: 445, specialty: ["Trauma","Cardiac","Stroke"] },
  { id: 10, name: "Singing River", full: "Singing River Health System", city: "Pascagoula", region: "Coast", lat: 30.359, lng: -88.563, level: "II", beds: 457, specialty: ["Trauma","Cardiac","OB"] },
  { id: 11, name: "Ocean Springs", full: "Ocean Springs Hospital", city: "Ocean Springs", region: "Coast", lat: 30.411, lng: -88.830, level: "III", beds: 175, specialty: ["General","OB"] },
  { id: 12, name: "Garden Park", full: "Garden Park Medical Center", city: "Gulfport", region: "Coast", lat: 30.393, lng: -89.073, level: "III", beds: 130, specialty: ["General","Ortho"] },
  { id: 13, name: "Anderson Regional", full: "Anderson Regional Medical Center", city: "Meridian", region: "East", lat: 32.371, lng: -88.703, level: "II", beds: 260, specialty: ["Cardiac","Stroke"] },
  { id: 14, name: "Rush Foundation", full: "Rush Foundation Hospital", city: "Meridian", region: "East", lat: 32.364, lng: -88.697, level: "III", beds: 182, specialty: ["General","Cardiac"] },
  { id: 15, name: "NMMC Tupelo", full: "North MS Medical Center", city: "Tupelo", region: "North", lat: 34.248, lng: -88.746, level: "II", beds: 650, specialty: ["Trauma","Cardiac","Stroke","Cancer"] },
  { id: 16, name: "Baptist North MS", full: "Baptist Memorial Hosp — North MS", city: "Oxford", region: "North", lat: 34.366, lng: -89.518, level: "III", beds: 217, specialty: ["General","Cardiac"] },
  { id: 17, name: "Delta Regional", full: "Delta Regional Medical Center", city: "Greenville", region: "Delta", lat: 33.408, lng: -91.059, level: "II", beds: 189, specialty: ["Cardiac","Stroke","General"] },
  { id: 18, name: "South Central Regional", full: "South Central Regional Medical", city: "Laurel", region: "South", lat: 31.694, lng: -89.131, level: "III", beds: 180, specialty: ["General","Cardiac"] },
  { id: 19, name: "King's Daughters", full: "King's Daughters Medical Center", city: "Brookhaven", region: "South", lat: 31.579, lng: -90.444, level: "III", beds: 122, specialty: ["General","OB"] },
  { id: 20, name: "SW MS Regional", full: "SW Mississippi Regional Medical", city: "McComb", region: "South", lat: 31.245, lng: -90.453, level: "III", beds: 143, specialty: ["General","OB"] },
  { id: 21, name: "Oktibbeha County", full: "Oktibbeha County Hospital", city: "Starkville", region: "East", lat: 33.460, lng: -88.818, level: "III", beds: 95, specialty: ["General"] },
  { id: 22, name: "Merit Health Natchez", full: "Merit Health Natchez", city: "Natchez", region: "Southwest", lat: 31.558, lng: -91.403, level: "III", beds: 179, specialty: ["General","Cardiac"] },
  { id: 23, name: "Winston Medical", full: "Winston Medical Center", city: "Louisville", region: "East", lat: 33.123, lng: -89.057, level: "IV", beds: 65, specialty: ["General"] },
  { id: 24, name: "NMMC Eupora", full: "North MS Medical Ctr — Eupora", city: "Eupora", region: "North", lat: 33.540, lng: -89.289, level: "IV", beds: 72, specialty: ["General"] },
];

const DIVERSION_REASONS = [
  "ED Overcrowding",
  "Capacity Overload",
  "Staffing Shortage",
  "Trauma Bay Full",
  "ICU at Capacity",
  "NICU at Capacity",
  "Psychiatric Hold Full",
  "Equipment / Tech Failure",
  "Isolation Protocols",
  "Diversion Protocol Active",
  "Mass Casualty Incident",
];

const STATUS_CONFIG = {
  OPEN:     { color: "#00e676", bg: "rgba(0,230,118,0.12)", label: "OPEN",     rank: 0 },
  ADVISORY: { color: "#ffab00", bg: "rgba(255,171,0,0.12)",  label: "ADVISORY", rank: 1 },
  DIVERSION:{ color: "#ff3d00", bg: "rgba(255,61,0,0.12)",   label: "DIVERT",   rank: 2 },
  BYPASS:   { color: "#b71c1c", bg: "rgba(183,28,28,0.18)",  label: "BYPASS",   rank: 3 },
};

function randomStatus() {
  const r = Math.random();
  if (r < 0.45) return "OPEN";
  if (r < 0.70) return "ADVISORY";
  if (r < 0.90) return "DIVERSION";
  return "BYPASS";
}

function randomReason(status) {
  if (status === "OPEN") return null;
  const idx = Math.floor(Math.random() * DIVERSION_REASONS.length);
  return DIVERSION_REASONS[idx];
}

function randomMinutes(status) {
  if (status === "OPEN") return null;
  if (status === "ADVISORY") return Math.floor(Math.random() * 60) + 15;
  if (status === "DIVERSION") return Math.floor(Math.random() * 180) + 30;
  return null; // bypass = indefinite
}

function randomCapacity(status) {
  if (status === "OPEN") return Math.floor(Math.random() * 30) + 55;
  if (status === "ADVISORY") return Math.floor(Math.random() * 15) + 80;
  if (status === "DIVERSION") return Math.floor(Math.random() * 10) + 90;
  return 100;
}

function initHospitalState() {
  return HOSPITALS.map(h => {
    const status = randomStatus();
    return {
      ...h,
      status,
      reason: randomReason(status),
      etaMinutes: randomMinutes(status),
      capacity: randomCapacity(status),
      waitEd: status === "OPEN" ? Math.floor(Math.random()*25)+5 : Math.floor(Math.random()*90)+30,
      lastUpdate: new Date(Date.now() - Math.floor(Math.random()*3600000)),
      favorite: false,
    };
  });
}

function generateAlert(hospital, prevStatus, newStatus) {
  const time = new Date();
  return {
    id: Date.now() + Math.random(),
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    city: hospital.city,
    prevStatus,
    newStatus,
    reason: hospital.reason,
    time,
  };
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const REGIONS = ["All", "Central", "North", "South", "Coast", "East", "Delta", "Southwest"];

// ── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const paths = {
    list:     "M3 4h18M3 9h18M3 14h18M3 19h18",
    map:      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    bell:     "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m0 0h6m-6 0H9",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    heart:    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    phone:    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1a17 17 0 01-17-17V5a2 2 0 012-2z",
    nav:      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    refresh:  "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    edit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    check:    "M5 13l4 4L19 7",
    x:        "M6 18L18 6M6 6l12 12",
    chevron:  "M9 5l7 7-7 7",
    info:     "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    star:     "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.381-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z",
    search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    ambulance:"M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-7-1a1 1 0 00-1-1H4m16 0a1 1 0 001-1v-2.586a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0016.586 6H14a1 1 0 00-1 1v8a1 1 0 001 1h1m-6 0h-1a1 1 0 00-1 1v2a1 1 0 001 1h1m0 0h4m4 0h1a1 1 0 001-1v-2a1 1 0 00-1-1h-1",
    hospital: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {(paths[name] || "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
};

// ── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status, small }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: cfg.bg, border: `1px solid ${cfg.color}40`,
      color: cfg.color, borderRadius: 4,
      padding: small ? "2px 6px" : "3px 9px",
      fontSize: small ? 9 : 11, fontWeight: 700, letterSpacing: "0.08em",
      fontFamily: "'Courier New', monospace",
    }}>
      <span style={{ width: small ? 5 : 6, height: small ? 5 : 6, borderRadius: "50%",
        background: cfg.color,
        boxShadow: status !== "OPEN" ? `0 0 6px ${cfg.color}` : "none",
        animation: status === "DIVERSION" || status === "BYPASS" ? "pulse 1.4s infinite" : "none"
      }}/>
      {cfg.label}
    </span>
  );
};

// ── Capacity Bar ───────────────────────────────────────────────────────────
const CapacityBar = ({ value }) => {
  const color = value >= 95 ? "#b71c1c" : value >= 85 ? "#ff3d00" : value >= 70 ? "#ffab00" : "#00e676";
  return (
    <div style={{ width: "100%", height: 4, background: "#1a1a2e", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color,
        borderRadius: 2, transition: "width 0.6s ease",
        boxShadow: value >= 85 ? `0 0 6px ${color}` : "none" }} />
    </div>
  );
};

// ── Hospital Card ─────────────────────────────────────────────────────────
const HospitalCard = ({ hospital, onSelect, onFavorite }) => {
  const cfg = STATUS_CONFIG[hospital.status];
  const isActive = hospital.status === "DIVERSION" || hospital.status === "BYPASS";
  return (
    <div onClick={() => onSelect(hospital)} style={{
      background: "#0d1117", border: `1px solid ${isActive ? cfg.color + "40" : "#1e2435"}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 8, padding: "12px 14px", cursor: "pointer",
      marginBottom: 8, position: "relative",
      boxShadow: isActive ? `0 0 12px ${cfg.color}18` : "none",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>
              {hospital.name}
            </span>
            <StatusBadge status={hospital.status} small />
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>
            {hospital.city} · Level {hospital.level} · {hospital.beds} beds
          </div>
          {hospital.reason && (
            <div style={{ fontSize: 11, color: cfg.color, fontFamily: "'Courier New', monospace",
              background: cfg.bg, border: `1px solid ${cfg.color}30`,
              borderRadius: 4, padding: "2px 7px", display: "inline-block", marginBottom: 6 }}>
              ⚠ {hospital.reason}
            </div>
          )}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div>
              <CapacityBar value={hospital.capacity} />
              <span style={{ fontSize: 10, color: "#6b7280", marginTop: 2, display: "block" }}>
                Capacity {hospital.capacity}%
              </span>
            </div>
            <div style={{ textAlign: "right", minWidth: 55 }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#94a3b8" }}>
                {hospital.waitEd}m
              </span>
              <div style={{ fontSize: 9, color: "#4b5563" }}>ED WAIT</div>
            </div>
            {hospital.etaMinutes && (
              <div style={{ textAlign: "right", minWidth: 55 }}>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: cfg.color }}>
                  ~{hospital.etaMinutes}m
                </span>
                <div style={{ fontSize: 9, color: "#4b5563" }}>EST. CLEAR</div>
              </div>
            )}
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onFavorite(hospital.id); }}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: hospital.favorite ? "#ffab00" : "#374151", marginLeft: 8, padding: 4 }}>
          <Icon name="star" size={16} color={hospital.favorite ? "#ffab00" : "#374151"} />
        </button>
      </div>
      <div style={{ fontSize: 10, color: "#374151", marginTop: 6, textAlign: "right" }}>
        Updated {timeAgo(hospital.lastUpdate)}
      </div>
    </div>
  );
};

// ── Hospital Detail Modal ──────────────────────────────────────────────────────
const HospitalDetail = ({ hospital, onClose, onFavorite, onUpdate }) => {
  const cfg = STATUS_CONFIG[hospital.status];
  const [showUpdate, setShowUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState(hospital.status);
  const [newReason, setNewReason] = useState(hospital.reason || "");
  const [newEta, setNewEta] = useState(hospital.etaMinutes || "");

  return (
    <div style={{ position: "fixed", inset: 0, background: "#060a0f", zIndex: 200, overflowY: "auto" }}>
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #1e2435", paddingBottom: 14 }}>
        <button onClick={onClose} style={{ background: "#1a1f2e", border: "none", cursor: "pointer",
          borderRadius: 8, padding: "6px 10px", color: "#94a3b8" }}>
          <Icon name="x" size={18} />
        </button>
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 16, fontWeight: 700, color: "#e8eaf0" }}>
            {hospital.full}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{hospital.city}, MS · Trauma Level {hospital.level}</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Status Hero */}
        <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}40`, borderRadius: 10,
          padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
          <StatusBadge status={hospital.status} />
          {hospital.reason && (
            <div style={{ marginTop: 8, fontSize: 13, color: cfg.color, fontWeight: 600 }}>
              {hospital.reason}
            </div>
          )}
          {hospital.etaMinutes && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
              Estimated clear in <span style={{ color: cfg.color, fontWeight: 700 }}>{hospital.etaMinutes} minutes</span>
            </div>
          )}
          {hospital.status === "BYPASS" && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#b71c1c", fontWeight: 700 }}>
              INDEFINITE — DO NOT TRANSPORT
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "CAPACITY", value: `${hospital.capacity}%`, color: hospital.capacity >= 90 ? "#ff3d00" : "#94a3b8" },
            { label: "ED WAIT", value: `${hospital.waitEd} min`, color: "#94a3b8" },
            { label: "TOTAL BEDS", value: hospital.beds, color: "#94a3b8" },
            { label: "LAST UPDATE", value: timeAgo(hospital.lastUpdate), color: "#6b7280" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0d1117", border: "1px solid #1e2435",
              borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: "#4b5563", fontFamily: "'Courier New', monospace",
                letterSpacing: "0.1em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontFamily: "'Courier New', monospace",
                fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Capacity Bar */}
        <div style={{ background: "#0d1117", border: "1px solid #1e2435", borderRadius: 8,
          padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 6, fontFamily: "'Courier New', monospace" }}>
            FACILITY CAPACITY
          </div>
          <CapacityBar value={hospital.capacity} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "#374151" }}>0%</span>
            <span style={{ fontSize: 10, color: "#374151" }}>100%</span>
          </div>
        </div>

        {/* Specialties */}
        <div style={{ background: "#0d1117", border: "1px solid #1e2435", borderRadius: 8,
          padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8, fontFamily: "'Courier New', monospace" }}>
            CAPABILITIES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {hospital.specialty.map(s => (
              <span key={s} style={{ fontSize: 11, background: "#1a1f2e", border: "1px solid #2d3548",
                color: "#94a3b8", borderRadius: 4, padding: "3px 8px" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { icon: "phone", label: "Call" },
            { icon: "nav", label: "Navigate" },
            { icon: "heart", label: hospital.favorite ? "Saved" : "Save", action: () => onFavorite(hospital.id) },
          ].map(a => (
            <button key={a.label} onClick={a.action}
              style={{ background: "#0d1117", border: "1px solid #1e2435", borderRadius: 8,
                padding: "10px 8px", cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 4, color: a.label === "Saved" ? "#ffab00" : "#94a3b8" }}>
              <Icon name={a.icon} size={18} color={a.label === "Saved" ? "#ffab00" : "#64748b"} />
              <span style={{ fontSize: 10 }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* EMS Update */}
        {!showUpdate ? (
          <button onClick={() => setShowUpdate(true)}
            style={{ width: "100%", background: "#1a2435", border: "1px solid #2d4a6b",
              borderRadius: 8, padding: "12px", cursor: "pointer", color: "#60a5fa",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8 }}>
            <Icon name="edit" size={16} color="#60a5fa" />
            EMS Status Update
          </button>
        ) : (
          <div style={{ background: "#0d1529", border: "1px solid #2d4a6b", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700, marginBottom: 12,
              fontFamily: "'Courier New', monospace" }}>PUBLISH STATUS UPDATE</div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>STATUS</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                style={{ width: "100%", background: "#131c2e", border: "1px solid #2d3548",
                  color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 12 }}>
                {Object.keys(STATUS_CONFIG).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>REASON</label>
              <select value={newReason} onChange={e => setNewReason(e.target.value)}
                style={{ width: "100%", background: "#131c2e", border: "1px solid #2d3548",
                  color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 12 }}>
                <option value="">— None —</option>
                {DIVERSION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {newStatus !== "OPEN" && newStatus !== "BYPASS" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>
                  EST. CLEAR (minutes)
                </label>
                <input type="number" value={newEta} onChange={e => setNewEta(e.target.value)}
                  placeholder="e.g. 60"
                  style={{ width: "100%", background: "#131c2e", border: "1px solid #2d3548",
                    color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 12, boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => setShowUpdate(false)}
                style={{ background: "#1a1f2e", border: "1px solid #2d3548", borderRadius: 6,
                  padding: "9px", cursor: "pointer", color: "#94a3b8", fontSize: 12 }}>Cancel</button>
              <button onClick={() => {
                onUpdate(hospital.id, newStatus, newReason || null, newEta ? parseInt(newEta) : null);
                setShowUpdate(false);
              }} style={{ background: "#1a3a5c", border: "1px solid #2d6a9f", borderRadius: 6,
                padding: "9px", cursor: "pointer", color: "#60a5fa", fontSize: 12, fontWeight: 700 }}>
                Publish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Map View ──────────────────────────────────────────────────────────────
const MapView = ({ hospitals, onSelect }) => {
  // Mississippi bounding box approx: lat 30.17–35.0, lng -91.65–-88.1
  const LAT_MIN = 30.1, LAT_MAX = 35.1, LNG_MIN = -91.8, LNG_MAX = -87.9;
  const W = 340, H = 440;
  const toX = lng => ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;
  const toY = lat => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;

  const diverted = hospitals.filter(h => h.status === "DIVERSION" || h.status === "BYPASS");

  return (
    <div style={{ padding: "12px 16px" }}>
      {diverted.length > 0 && (
        <div style={{ background: "rgba(255,61,0,0.08)", border: "1px solid #ff3d0040",
          borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#ff3d00", fontFamily: "'Courier New', monospace",
            fontWeight: 700, marginBottom: 4 }}>ACTIVE DIVERSIONS ({diverted.length})</div>
          {diverted.map(h => (
            <div key={h.id} onClick={() => onSelect(h)}
              style={{ fontSize: 12, color: "#e8eaf0", padding: "2px 0", cursor: "pointer",
                display: "flex", justifyContent: "space-between" }}>
              <span>{h.name} — {h.city}</span>
              <StatusBadge status={h.status} small />
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "relative", width: "100%", background: "#080d14",
        border: "1px solid #1e2435", borderRadius: 10, overflow: "hidden" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* MS State outline - simplified */}
          <path d="M60,10 L280,10 L295,60 L310,120 L320,200 L300,280 L290,360 L250,430 L180,430 L120,400 L80,350 L50,280 L40,200 L50,120 L60,10Z"
            fill="#0d1420" stroke="#1e2d4a" strokeWidth="1.5" />
          <text x="165" y="220" textAnchor="middle" fill="#1e2d4a" fontSize="24" fontWeight="900"
            fontFamily="serif" letterSpacing="3">MS</text>

          {hospitals.map(h => {
            const x = toX(h.lng), y = toY(h.lat);
            const cfg = STATUS_CONFIG[h.status];
            const isPulsing = h.status === "DIVERSION" || h.status === "BYPASS";
            return (
              <g key={h.id} onClick={() => onSelect(h)} style={{ cursor: "pointer" }}>
                {isPulsing && (
                  <circle cx={x} cy={y} r={10} fill={cfg.color + "20"}
                    style={{ animation: "pulse 1.4s infinite" }} />
                )}
                <circle cx={x} cy={y} r={5} fill={cfg.color}
                  stroke="#060a0f" strokeWidth="1.5"
                  style={{ filter: isPulsing ? `drop-shadow(0 0 4px ${cfg.color})` : "none" }} />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(6,10,15,0.9)",
          border: "1px solid #1e2435", borderRadius: 6, padding: "6px 10px" }}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.color,
                boxShadow: k !== "OPEN" ? `0 0 4px ${v.color}` : "none", flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: "#6b7280", fontFamily: "'Courier New', monospace" }}>
                {v.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Region summary */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Courier New', monospace",
          marginBottom: 6, letterSpacing: "0.1em" }}>REGION SUMMARY</div>
        {REGIONS.slice(1).map(region => {
          const rh = hospitals.filter(h => h.region === region);
          const divCount = rh.filter(h => h.status === "DIVERSION" || h.status === "BYPASS").length;
          return (
            <div key={region} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "5px 0", borderBottom: "1px solid #0d1117" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{region}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{rh.length} hospitals</span>
                {divCount > 0 && (
                  <span style={{ fontSize: 10, color: "#ff3d00", fontFamily: "'Courier New', monospace",
                    background: "rgba(255,61,0,0.1)", borderRadius: 4, padding: "1px 5px" }}>
                    {divCount} on divert
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Alerts Feed ───────────────────────────────────────────────────────────
const AlertsFeed = ({ alerts, hospitals }) => {
  if (alerts.length === 0) return (
    <div style={{ padding: 40, textAlign: "center", color: "#374151" }}>
      <Icon name="bell" size={36} color="#1e2435" />
      <div style={{ marginTop: 12, fontSize: 13 }}>No alerts yet</div>
    </div>
  );
  return (
    <div style={{ padding: "12px 16px" }}>
      {alerts.slice().reverse().map(a => {
        const to = STATUS_CONFIG[a.newStatus];
        return (
          <div key={a.id} style={{ background: "#0d1117", border: `1px solid ${to.color}30`,
            borderLeft: `3px solid ${to.color}`, borderRadius: 8,
            padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13,
                fontWeight: 700, color: "#e8eaf0" }}>{a.hospitalName}</span>
              <span style={{ fontSize: 10, color: "#4b5563" }}>{formatTime(a.time)}</span>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{a.city}, MS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusBadge status={a.prevStatus} small />
              <span style={{ color: "#4b5563", fontSize: 12 }}>→</span>
              <StatusBadge status={a.newStatus} small />
            </div>
            {a.reason && (
              <div style={{ fontSize: 11, color: to.color, marginTop: 5,
                fontFamily: "'Courier New', monospace" }}>⚠ {a.reason}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Settings ──────────────────────────────────────────────────────────────
const Settings = ({ unitId, setUnitId, favorites, hospitals }) => {
  const [draft, setDraft] = useState(unitId);
  const favHospitals = hospitals.filter(h => favorites.includes(h.id));
  return (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ background: "#0d1117", border: "1px solid #1e2435", borderRadius: 8,
        padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Courier New', monospace",
          letterSpacing: "0.1em", marginBottom: 8 }}>UNIT IDENTIFICATION</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Unit ID (e.g. MED-7)"
            style={{ flex: 1, background: "#131c2e", border: "1px solid #2d3548",
              color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }} />
          <button onClick={() => setUnitId(draft)}
            style={{ background: "#1a3a5c", border: "1px solid #2d6a9f", borderRadius: 6,
              padding: "8px 12px", cursor: "pointer", color: "#60a5fa", fontSize: 12, fontWeight: 700 }}>
            Save
          </button>
        </div>
        {unitId && <div style={{ fontSize: 11, color: "#00e676", marginTop: 6 }}>Active Unit: {unitId}</div>}
      </div>

      <div style={{ background: "#0d1117", border: "1px solid #1e2435", borderRadius: 8,
        padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Courier New', monospace",
          letterSpacing: "0.1em", marginBottom: 8 }}>NOTIFICATIONS</div>
        {[
          { label: "Diversion Status Changes", default: true },
          { label: "Bypass Declarations", default: true },
          { label: "Mass Casualty Alerts", default: true },
          { label: "Favorite Hospital Updates", default: true },
          { label: "Advisory Notices", default: false },
        ].map(n => (
          <div key={n.label} style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "7px 0", borderBottom: "1px solid #0d1117" }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{n.label}</span>
            <div style={{ width: 36, height: 20, borderRadius: 10,
              background: n.default ? "#1a3a5c" : "#1a1f2e",
              border: `1px solid ${n.default ? "#2d6a9f" : "#2d3548"}`,
              display: "flex", alignItems: "center",
              justifyContent: n.default ? "flex-end" : "flex-start",
              padding: "0 3px", cursor: "pointer" }}>
              <div style={{ width: 14, height: 14, borderRadius: 7,
                background: n.default ? "#60a5fa" : "#374151" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0d1117", border: "1px solid #1e2435", borderRadius: 8,
        padding: "14px 16px" }}>
        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Courier New', monospace",
          letterSpacing: "0.1em", marginBottom: 8 }}>SAVED HOSPITALS ({favHospitals.length})</div>
        {favHospitals.length === 0 ? (
          <div style={{ fontSize: 12, color: "#374151" }}>No favorites yet. Tap ★ on any hospital.</div>
        ) : favHospitals.map(h => (
          <div key={h.id} style={{ display: "flex", justifyContent: "space-between",
            padding: "5px 0", borderBottom: "1px solid #0d1117" }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{h.name}</span>
            <StatusBadge status={h.status} small />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [hospitals, setHospitals] = useState(initHospitalState);
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState("status");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [unitId, setUnitId] = useState("");
  const [showFavs, setShowFavs] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(prev => {
        const next = prev.map(h => {
          if (Math.random() > 0.03) return h; // ~3% chance per hospital per 8s
          const newStatus = randomStatus();
          if (newStatus === h.status) return h;
          const updated = {
            ...h, status: newStatus,
            reason: randomReason(newStatus),
            etaMinutes: randomMinutes(newStatus),
            capacity: randomCapacity(newStatus),
            waitEd: newStatus === "OPEN" ? Math.floor(Math.random()*25)+5 : Math.floor(Math.random()*90)+30,
            lastUpdate: new Date(),
          };
          setAlerts(a => [...a.slice(-49), generateAlert(updated, h.status, newStatus)]);
          return updated;
        });
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleFavorite = (id) => {
    setHospitals(prev => prev.map(h => h.id === id ? { ...h, favorite: !h.favorite } : h));
    if (selected?.id === id) setSelected(prev => ({ ...prev, favorite: !prev.favorite }));
  };

  const handleUpdate = (id, status, reason, etaMinutes) => {
    setHospitals(prev => prev.map(h => {
      if (h.id !== id) return h;
      const updated = { ...h, status, reason, etaMinutes, lastUpdate: new Date(),
        capacity: randomCapacity(status), waitEd: status === "OPEN" ? 15 : 60 };
      setAlerts(a => [...a.slice(-49), generateAlert(updated, h.status, status)]);
      return updated;
    }));
    setSelected(prev => prev && prev.id === id
      ? { ...prev, status, reason, etaMinutes, lastUpdate: new Date() } : prev);
  };

  const favorites = hospitals.filter(h => h.favorite).map(h => h.id);

  const filtered = hospitals
    .filter(h => !showFavs || h.favorite)
    .filter(h => regionFilter === "All" || h.region === regionFilter)
    .filter(h => statusFilter === "All" || h.status === statusFilter)
    .filter(h => !search || h.name.toLowerCase().includes(search.toLowerCase())
      || h.city.toLowerCase().includes(search.toLowerCase())
      || h.full.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => STATUS_CONFIG[b.status].rank - STATUS_CONFIG[a.status].rank);

  const counts = {
    OPEN: hospitals.filter(h => h.status === "OPEN").length,
    ADVISORY: hospitals.filter(h => h.status === "ADVISORY").length,
    DIVERSION: hospitals.filter(h => h.status === "DIVERSION").length,
    BYPASS: hospitals.filter(h => h.status === "BYPASS").length,
  };

  const newAlerts = alerts.filter(a => (Date.now() - a.time) < 60000).length;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh",
      background: "#060a0f", color: "#e8eaf0", fontFamily: "system-ui, sans-serif",
      position: "relative", display: "flex", flexDirection: "column" }}>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
        select, input { outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #060a0f; }
        ::-webkit-scrollbar-thumb { background: #1e2435; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #1e2435",
        background: "#060a0f", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#1a2a5c,#6b1a1a)",
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14 }}>⚡</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700,
                color: "#e8eaf0", letterSpacing: "0.05em" }}>MS HOSPITAL DIVERSION</div>
              <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.1em" }}>
                LIVE · {hospitals.length} FACILITIES
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676",
              boxShadow: "0 0 6px #00e676", animation: "pulse 2s infinite", marginTop: 6 }} />
          </div>
        </div>

        {/* Summary Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
          {Object.entries(counts).map(([s, n]) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
                style={{ background: statusFilter === s ? cfg.bg : "#0d1117",
                  border: `1px solid ${statusFilter === s ? cfg.color + "60" : "#1e2435"}`,
                  borderRadius: 6, padding: "5px 4px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 16,
                  fontWeight: 800, color: cfg.color }}>{n}</div>
                <div style={{ fontSize: 8, color: "#4b5563", letterSpacing: "0.06em" }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {tab === "status" && (
          <>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Icon name="search" size={14} color="#4b5563" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search hospital or city…"
                style={{ width: "100%", background: "#0d1117", border: "1px solid #1e2435",
                  color: "#e8eaf0", borderRadius: 6, padding: "7px 10px 7px 30px",
                  fontSize: 12, position: "relative" }} />
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}>
                <Icon name="search" size={14} color="#4b5563" />
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {REGIONS.map(r => (
                <button key={r} onClick={() => setRegionFilter(r)}
                  style={{ background: regionFilter === r ? "#1a2a5c" : "#0d1117",
                    border: `1px solid ${regionFilter === r ? "#3d5a99" : "#1e2435"}`,
                    borderRadius: 4, padding: "3px 8px", cursor: "pointer",
                    color: regionFilter === r ? "#60a5fa" : "#6b7280",
                    fontSize: 10, whiteSpace: "nowrap", fontFamily: "'Courier New', monospace" }}>
                  {r}
                </button>
              ))}
              <button onClick={() => setShowFavs(!showFavs)}
                style={{ background: showFavs ? "#2d1f00" : "#0d1117",
                  border: `1px solid ${showFavs ? "#ffab00" : "#1e2435"}`,
                  borderRadius: 4, padding: "3px 8px", cursor: "pointer",
                  color: showFavs ? "#ffab00" : "#6b7280", fontSize: 10, whiteSpace: "nowrap" }}>
                ★ FAV
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "status" && (
          <div style={{ padding: "10px 16px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: "#374151", padding: 40 }}>
                No hospitals match filters
              </div>
            ) : filtered.map(h => (
              <HospitalCard key={h.id} hospital={h}
                onSelect={setSelected} onFavorite={handleFavorite} />
            ))}
          </div>
        )}
        {tab === "map" && <MapView hospitals={hospitals} onSelect={setSelected} />}
        {tab === "alerts" && <AlertsFeed alerts={alerts} hospitals={hospitals} />}
        {tab === "settings" && (
          <Settings unitId={unitId} setUnitId={setUnitId}
            favorites={favorites} hospitals={hospitals} />
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ display: "flex", borderTop: "1px solid #1e2435",
        background: "#060a0f", position: "sticky", bottom: 0 }}>
        {[
          { key: "status", icon: "list", label: "Status" },
          { key: "map", icon: "map", label: "Map" },
          { key: "alerts", icon: "bell", label: `Alerts${newAlerts > 0 ? ` (${newAlerts})` : ""}` },
          { key: "settings", icon: "settings", label: "Settings" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, background: "none", border: "none", cursor: "pointer",
              padding: "10px 4px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, position: "relative",
              color: tab === t.key ? "#60a5fa" : "#4b5563" }}>
            {t.key === "alerts" && newAlerts > 0 && (
              <span style={{ position: "absolute", top: 6, right: "calc(50% - 16px)",
                width: 8, height: 8, borderRadius: "50%", background: "#ff3d00",
                boxShadow: "0 0 6px #ff3d00" }} />
            )}
            <Icon name={t.icon} size={20} color={tab === t.key ? "#60a5fa" : "#4b5563"} />
            <span style={{ fontSize: 9, fontFamily: "'Courier New', monospace",
              letterSpacing: "0.06em" }}>
              {t.label.split(" (")[0]}
            </span>
            {tab === t.key && (
              <div style={{ position: "absolute", top: 0, left: "25%", right: "25%",
                height: 2, background: "#60a5fa", borderRadius: "0 0 2px 2px" }} />
            )}
          </button>
        ))}
      </div>

      {/* Hospital Detail Overlay */}
      {selected && (
        <HospitalDetail hospital={selected}
          onClose={() => setSelected(null)}
          onFavorite={handleFavorite}
          onUpdate={handleUpdate} />
      )}
    </div>
  );
}