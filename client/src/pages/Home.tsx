import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  CircleGauge,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  MapPin,
  Play,
  Power,
  RefreshCw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  ThermometerSun,
  Timer,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
  Wifi,
  X,
} from "lucide-react";

type Page = "overview" | "sensors" | "irrigation" | "automation" | "alerts";
type ZoneStatus = "Ready" | "Running" | "Offline";

type Zone = {
  id: string;
  name: string;
  crop: string;
  moisture: number;
  status: ZoneStatus;
  valve: string;
  flow: number;
};

const initialZones: Zone[] = [
  { id: "z1", name: "North Field", crop: "Leafy greens", moisture: 68, status: "Ready", valve: "V-01", flow: 0 },
  { id: "z2", name: "Greenhouse A", crop: "Tomato", moisture: 54, status: "Ready", valve: "V-02", flow: 0 },
  { id: "z3", name: "East Orchard", crop: "Mango", moisture: 32, status: "Ready", valve: "V-03", flow: 0 },
  { id: "z4", name: "Nursery", crop: "Seedlings", moisture: 74, status: "Offline", valve: "V-04", flow: 0 },
];

const navItems: { id: Page; label: string; icon: typeof Gauge; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "sensors", label: "Monitor sensors", icon: CircleGauge },
  { id: "irrigation", label: "Irrigation control", icon: Droplets },
  { id: "automation", label: "Automation rules", icon: Sparkles },
  { id: "alerts", label: "Alerts", icon: Bell, badge: 3 },
];

function StatusPill({ status }: { status: string }) {
  const tone = status === "Ready" || status === "Healthy" || status === "Active" ? "good" : status === "Running" || status === "Needs attention" ? "warn" : "bad";
  return <span className={`status-pill status-pill--${tone}`}><span className="status-dot" />{status}</span>;
}

function MetricCard({ icon: Icon, label, value, unit, hint, tone = "green", trend }: { icon: typeof Droplets; label: string; value: string; unit?: string; hint: string; tone?: string; trend?: "up" | "down" }) {
  return <article className="metric-card">
    <div className={`metric-icon metric-icon--${tone}`}><Icon size={19} /></div>
    <div className="metric-copy"><span>{label}</span><strong>{value}<small>{unit}</small></strong><p>{trend === "up" ? <TrendingUp size={13} /> : trend === "down" ? <TrendingDown size={13} /> : null}{hint}</p></div>
  </article>;
}

function ZoneCard({ zone, onStart }: { zone: Zone; onStart: (id: string) => void }) {
  const running = zone.status === "Running";
  return <article className={`zone-card ${running ? "zone-card--running" : ""}`}>
    <div className="zone-card__top"><div className="zone-icon"><Sprout size={18} /></div><StatusPill status={zone.status} /></div>
    <div className="zone-card__title"><div><h3>{zone.name}</h3><p>{zone.crop}</p></div><span className="zone-moisture">{zone.moisture}%</span></div>
    <div className="progress-track"><span style={{ width: `${zone.moisture}%` }} /></div>
    <div className="zone-card__meta"><span>Soil moisture</span><span>{zone.valve} · {zone.flow ? `${zone.flow} L/min` : "Idle"}</span></div>
    <button className="small-action" disabled={zone.status === "Offline"} onClick={() => onStart(zone.id)}>{running ? <><Power size={14} /> Stop irrigation</> : <><Play size={14} /> Irrigate zone</>}</button>
  </article>;
}

export default function Home() {
  const [page, setPage] = useState<Page>("overview");
  const [zones, setZones] = useState(initialZones);
  const [rules, setRules] = useState([
    { id: "r1", name: "Dry soil morning irrigation", scope: "East Orchard · Zone 3", when: "Soil moisture < 40% for 10 min", action: "Irrigate for 20 min", active: true, last: "Today, 07:30 · Completed" },
    { id: "r2", name: "Rain protection", scope: "All outdoor zones", when: "Rain expected within 2 hours", action: "Pause scheduled irrigation", active: true, last: "Yesterday · No action" },
    { id: "r3", name: "Tank low safety stop", scope: "Main water tank", when: "Tank level < 20%", action: "Stop all irrigation + alert", active: true, last: "7 days ago · No action" },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState("z3");
  const [duration, setDuration] = useState(20);
  const [tab, setTab] = useState<"overview" | "history">("overview");

  const selected = zones.find((zone) => zone.id === selectedZone) ?? zones[0];
  const runningCount = zones.filter((zone) => zone.status === "Running").length;
  const lastUpdate = useMemo(() => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), []);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 3200); };
  const toggleZone = (id: string) => {
    setZones((current) => current.map((zone) => zone.id === id ? { ...zone, status: zone.status === "Running" ? "Ready" : "Running", flow: zone.status === "Running" ? 0 : 12 } : zone));
    notify(`Irrigation command sent for ${zones.find((zone) => zone.id === id)?.name}`);
  };
  const startIrrigation = () => { if (selected.status === "Offline") return; toggleZone(selected.id); };

  const pageMeta: Record<Page, { eyebrow: string; title: string; description: string }> = {
    overview: { eyebrow: "FIELD OPERATIONS", title: "Good morning, Somchai", description: "Your farm is healthy. One zone needs attention today." },
    sensors: { eyebrow: "LIVE TELEMETRY", title: "Monitor sensors", description: "Read the field at a glance and spot changes before they become problems." },
    irrigation: { eyebrow: "WATER CONTROL", title: "Irrigation control", description: "Start a safe manual irrigation job or review the active water flow." },
    automation: { eyebrow: "SMART OPERATIONS", title: "Automation rules", description: "Let the farm respond to conditions while guardrails keep it safe." },
    alerts: { eyebrow: "ATTENTION CENTER", title: "Alerts & activity", description: "Prioritized events, device health and action history." },
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Leaf size={22} /></div><div><strong>SmartFarm</strong><span>FIELD OPERATIONS</span></div></div>
      <div className="farm-selector"><span className="farm-avatar">GV</span><div><small>Current farm</small><b>Green Valley Farm</b></div><ChevronRight size={16} /></div>
      <nav>{navItems.map(({ id, label, icon: Icon, badge }) => <button key={id} className={`nav-item ${page === id ? "nav-item--active" : ""}`} onClick={() => setPage(id)}><Icon size={17} /><span>{label}</span>{badge ? <b>{badge}</b> : null}</button>)}</nav>
      <div className="sidebar-bottom"><div className="connection"><Wifi size={15} /><div><b>All systems normal</b><small>Last synced {lastUpdate}</small></div></div><div className="user-row"><span className="profile-avatar">S</span><div><b>Somchai R.</b><small>Farm manager</small></div><Settings2 size={15} /></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><Leaf size={16} /> SmartFarm</div><div className="topbar-actions"><button className="icon-button" onClick={() => notify("No new system messages")}><Bell size={18} /><span className="notification-dot" /></button><button className="avatar-button">S</button></div></header>
      <div className="page-heading"><div><span className="eyebrow">{pageMeta[page].eyebrow}</span><h1>{pageMeta[page].title}</h1><p>{pageMeta[page].description}</p></div><div className="heading-actions"><span className="live-status"><span /> Live · 4 devices</span><button className="outline-button" onClick={() => notify("Sensor data refreshed") }><RefreshCw size={15} /> Refresh</button></div></div>

      {page === "overview" && <>
        <section className="metric-grid"><MetricCard icon={Droplets} label="Soil moisture" value="68" unit="%" hint="Across 4 zones" tone="blue" trend="up" /><MetricCard icon={ThermometerSun} label="Temperature" value="28.4" unit="°C" hint="2.1° below yesterday" tone="amber" trend="down" /><MetricCard icon={FlaskConical} label="Water tank" value="74" unit="%" hint="Good · 2,840 L left" tone="cyan" /><MetricCard icon={ShieldCheck} label="Crop health" value="92" unit="%" hint="Excellent condition" tone="green" /></section>
        <section className="overview-grid"><div className="panel field-panel"><div className="panel-heading"><div><span className="eyebrow">FIELD STATUS</span><h2>Zones at a glance</h2></div><button className="text-button" onClick={() => setPage("sensors")}>View monitor <ChevronRight size={15} /></button></div><div className="zone-grid">{zones.map((zone) => <ZoneCard key={zone.id} zone={zone} onStart={toggleZone} />)}</div></div><aside className="panel alert-panel"><div className="panel-heading"><div><span className="eyebrow">NEEDS ATTENTION</span><h2>Priority alert</h2></div><Bell size={18} className="muted-icon" /></div><div className="priority-alert"><AlertTriangle size={20} /><div><b>Low soil moisture detected</b><p>East Orchard · Zone 3 is at 32%, below the 40% target.</p><button className="primary-button" onClick={() => { setSelectedZone("z3"); setPage("irrigation"); }}>Review & irrigate <ChevronRight size={15} /></button></div></div><div className="weather-strip"><ThermometerSun size={18} /><div><b>Sunny · 28°C</b><small>No rain expected for 6 hours</small></div></div></aside></section>
        <section className="bottom-grid"><div className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">WATER USAGE</span><h2>Weekly consumption</h2></div><span className="chart-total">8,420 L <small>this week</small></span></div><div className="bar-chart">{[38, 58, 46, 72, 53, 87, 64].map((height, index) => <div className="bar-item" key={index}><span style={{ height: `${height}%` }} /><small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small></div>)}</div></div><div className="panel schedule-panel"><div className="panel-heading"><div><span className="eyebrow">UP NEXT</span><h2>Today's schedule</h2></div><Timer size={18} className="muted-icon" /></div><div className="schedule-item"><span className="schedule-time">07:30</span><div><b>East Orchard</b><small>Zone 3 · 20 min</small></div><StatusPill status="Active" /></div><div className="schedule-item"><span className="schedule-time">17:00</span><div><b>Greenhouse A</b><small>Zone 2 · 15 min</small></div><StatusPill status="Ready" /></div></div></section>
      </>}

      {page === "sensors" && <section className="panel full-panel"><div className="subnav"><button className={tab === "overview" ? "subnav-active" : ""} onClick={() => setTab("overview")}>Overview</button><button className={tab === "history" ? "subnav-active" : ""} onClick={() => setTab("history")}>History · 7 days</button></div>{tab === "overview" ? <div className="sensor-detail-grid"><div><div className="field-map"><div className="map-label"><MapPin size={14} /> North & East fields</div><div className="field-shape field-shape--one"><span>68%</span></div><div className="field-shape field-shape--two"><span>32%</span><AlertTriangle size={18} /></div><div className="sensor-pin pin-a"><Droplets size={13} /></div><div className="sensor-pin pin-b"><CircleGauge size={13} /></div><div className="map-legend"><span><i className="legend-dot legend-dot--good" /> Healthy</span><span><i className="legend-dot legend-dot--warn" /> Needs attention</span></div></div></div><div className="sensor-list">{[{ label: "Soil moisture", value: "68%", range: "Target 45–70%", icon: Droplets, tone: "blue", trend: "Stable" }, { label: "Temperature", value: "28.4°C", range: "Target 22–32°C", icon: ThermometerSun, tone: "amber", trend: "Falling" }, { label: "pH level", value: "6.5", range: "Target 6.0–7.0", icon: FlaskConical, tone: "green", trend: "Stable" }, { label: "Sunlight", value: "720 W/m²", range: "Good for crop", icon: Sparkles, tone: "cyan", trend: "Rising" }].map((item) => <div className="sensor-row" key={item.label}><div className={`metric-icon metric-icon--${item.tone}`}><item.icon size={17} /></div><div><b>{item.label}</b><small>{item.range}</small></div><strong>{item.value}</strong><span className="sensor-trend">{item.trend}</span></div>)}</div></div> : <div className="history-placeholder"><TrendingUp size={34} /><h3>Sensor history is ready</h3><p>Connect a live data source to replace this preview with real readings. The static demo keeps a sample view so the dashboard can be reviewed on GitHub Pages.</p></div>}</section>}

      {page === "irrigation" && <section className="irrigation-layout"><div className="panel control-panel"><div className="panel-heading"><div><span className="eyebrow">MANUAL COMMAND</span><h2>Start irrigation</h2></div><Droplets size={20} className="muted-icon" /></div><label className="form-label">Select field zone</label><div className="select-grid">{zones.map((zone) => <button key={zone.id} className={`select-zone ${selected.id === zone.id ? "select-zone--active" : ""}`} disabled={zone.status === "Offline"} onClick={() => setSelectedZone(zone.id)}><span>{zone.name}</span><small>{zone.moisture}% moisture</small></button>)}</div><label className="form-label">Duration</label><div className="duration-control"><button onClick={() => setDuration(Math.max(5, duration - 5))}>−</button><strong>{duration}<small>min</small></strong><button onClick={() => setDuration(Math.min(60, duration + 5))}>+</button></div><div className="command-summary"><div><span>Zone</span><b>{selected.name}</b></div><div><span>Estimated water</span><b>{duration * 21} L</b></div><div><span>Current moisture</span><b>{selected.moisture}%</b></div></div><button className="primary-button primary-button--wide" disabled={selected.status === "Offline"} onClick={startIrrigation}><Power size={17} /> {selected.status === "Running" ? "Stop irrigation" : "Start irrigation"}</button><p className="safety-note"><ShieldCheck size={15} /> Command is confirmed by the controller before status changes.</p></div><div className="panel running-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE STATUS</span><h2>Active water flow</h2></div><StatusPill status={runningCount ? "Running" : "Ready"} /></div>{runningCount ? zones.filter((zone) => zone.status === "Running").map((zone) => <div className="running-job" key={zone.id}><div className="job-orb"><Droplets size={20} /></div><div><b>{zone.name}</b><span>Valve {zone.valve} · 12 L/min</span><div className="job-progress"><span /></div><small>Started 08:12 · about 12 min remaining</small></div><button className="icon-button" onClick={() => toggleZone(zone.id)}><Power size={16} /></button></div>) : <div className="empty-state"><Check size={28} /><b>No active irrigation jobs</b><span>All zones are currently idle.</span></div>}<div className="history-list"><h3>Recent jobs</h3><div><span>Today · 07:30</span><b>East Orchard · 20 min</b><StatusPill status="Completed" /></div><div><span>Yesterday · 17:00</span><b>Greenhouse A · 15 min</b><StatusPill status="Completed" /></div></div></div></section>}

      {page === "automation" && <section className="automation-layout"><div className="panel rules-panel"><div className="panel-heading"><div><span className="eyebrow">RULE LIBRARY</span><h2>Automation rules</h2></div><button className="primary-button" onClick={() => notify("Rule builder will open in the next release")}>+ New rule</button></div>{rules.map((rule) => <div className="rule-card" key={rule.id}><div className="rule-card__head"><div className="rule-icon"><Sparkles size={17} /></div><div><b>{rule.name}</b><small>{rule.scope}</small></div><button className="toggle-button" onClick={() => setRules((current) => current.map((item) => item.id === rule.id ? { ...item, active: !item.active } : item))}>{rule.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}<span>{rule.active ? "Active" : "Paused"}</span></button></div><div className="rule-flow"><div><span>WHEN</span><b>{rule.when}</b></div><ChevronRight size={16} /><div><span>THEN</span><b>{rule.action}</b></div></div><div className="rule-footer"><small>Last run · {rule.last}</small><button className="text-button" onClick={() => notify(`Opening ${rule.name}`)}>View details <ChevronRight size={14} /></button></div></div>)}</div><aside className="panel guardrail-panel"><div className="panel-heading"><div><span className="eyebrow">SAFETY LAYER</span><h2>Guardrails</h2></div><ShieldCheck size={19} className="good-icon" /></div><div className="guardrail"><Check size={15} /><div><b>Rain protection</b><span>Pause if rain is expected within 2 hours</span></div></div><div className="guardrail"><Check size={15} /><div><b>Daily water budget</b><span>Maximum 12,000 L per farm</span></div></div><div className="guardrail"><Check size={15} /><div><b>Conflict detection</b><span>Manual stop overrides automation</span></div></div><button className="outline-button outline-button--wide" onClick={() => notify("Guardrail settings opened")}><SlidersHorizontal size={15} /> Manage guardrails</button></aside></section>}

      {page === "alerts" && <section className="panel full-panel"><div className="panel-heading"><div><span className="eyebrow">PRIORITIZED EVENTS</span><h2>Alerts & activity</h2></div><button className="text-button" onClick={() => notify("All alerts marked as read")}>Mark all read <Check size={14} /></button></div><div className="alert-list"><div className="alert-row alert-row--critical"><div className="alert-row__icon"><AlertTriangle size={18} /></div><div><b>Low soil moisture detected</b><p>East Orchard · Zone 3 is at 32%, below the 40% target.</p><small>Today, 08:42 · Needs attention</small></div><button className="primary-button" onClick={() => { setSelectedZone("z3"); setPage("irrigation"); }}>Review</button></div><div className="alert-row"><div className="alert-row__icon"><ShieldCheck size={18} /></div><div><b>Irrigation completed</b><p>North Field · Zone 1 ran for 18 minutes and used 378 L.</p><small>Today, 07:48 · Info</small></div><StatusPill status="Completed" /></div><div className="alert-row"><div className="alert-row__icon"><Wifi size={18} /></div><div><b>Nursery sensor is offline</b><p>Last reading received 34 minutes ago. Check device power.</p><small>Today, 07:10 · System</small></div><button className="outline-button" onClick={() => setPage("sensors")}>View sensor</button></div></div></section>}

      <footer className="page-footer"><span>SmartFarm static demo · Mock data for GitHub Pages</span><span><Wifi size={13} /> No live device connection</span></footer>
      {toast && <div className="toast"><Check size={16} />{toast}<button onClick={() => setToast(null)}><X size={14} /></button></div>}
    </main>
  </div>;
}
