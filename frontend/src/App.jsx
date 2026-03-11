import React, { useState, useMemo, useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import AboutPage from "./components/AboutPage";
import ValidationPage from "./components/ValidationPage";
import WalkthroughModal from "./components/WalkthroughModal";
import "./App.css";

// ── Default lipid component library (used until /api/lipid-db fetch resolves) ─
// logP: PubChem XLogP3 / literature; HSP: group-contribution estimates (MPa½)
const DEFAULT_LIPID_DB = {
  solid_lipids: [
    { id: "glyc_caprylate", name: "Glyceryl caprylate (C8)",      logp: 3.5,  delta_d: 16.8, delta_p: 5.0, delta_h: 12.3 },
    { id: "glyc_caprate",   name: "Glyceryl caprate (C10)",        logp: 4.3,  delta_d: 16.9, delta_p: 4.5, delta_h: 11.6 },
    { id: "compritol",      name: "Glyceryl behenate (Compritol)", logp: 9.7,  delta_d: 17.0, delta_p: 2.0, delta_h: 4.0  },
    { id: "cetyl_palm",     name: "Cetyl palmitate",               logp: 11.6, delta_d: 16.5, delta_p: 1.5, delta_h: 3.5  },
    { id: "stearic_acid",   name: "Stearic acid",                  logp: 8.2,  delta_d: 17.3, delta_p: 3.0, delta_h: 5.2  },
    { id: "tripalmitin",    name: "Tripalmitin",                   logp: 10.9, delta_d: 17.2, delta_p: 2.0, delta_h: 3.8  },
  ],
  liquid_lipids: [
    { id: "soy_lecithin", name: "Soy lecithin",                          logp: 4.5,  delta_d: 16.5, delta_p: 6.5, delta_h: 10.0 },
    { id: "oleic_acid",   name: "Oleic acid",                            logp: 7.6,  delta_d: 16.0, delta_p: 2.5, delta_h: 4.5  },
    { id: "cc_trig",      name: "Caprylic/capric triglyceride (C8/C10)", logp: 7.8,  delta_d: 16.8, delta_p: 1.2, delta_h: 3.0  },
    { id: "squalene",     name: "Squalene",                              logp: 10.6, delta_d: 16.0, delta_p: 0.3, delta_h: 1.5  },
  ],
  surfactants: [
    { id: "ps80",            name: "Polysorbate 80",   logp: 2.45, delta_d: 16.5, delta_p: 5.0, delta_h: 11.0 },
    { id: "peg100_stearate", name: "PEG-100 stearate", logp: 2.1,  delta_d: 17.0, delta_p: 3.0, delta_h: 9.5  },
    { id: "polox188",        name: "Poloxamer 188",    logp: 1.5,  delta_d: 17.2, delta_p: 8.0, delta_h: 10.5 },
  ],
};
const CUSTOM_ENTRY = (id) => ({ id, name: "Custom", logp: null, delta_d: null, delta_p: null, delta_h: null, custom: true });

function App() {
  // ── Page routing ─────────────────────────────────────────────────────────
  const [page, setPage] = useState("tool");

  // ── Admin panel ───────────────────────────────────────────────────────────
  const [showAdmin, setShowAdmin]         = useState(false);
  const [adminKey, setAdminKey]           = useState("");
  const [showKeyModal, setShowKeyModal]   = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");

  const openAdmin = () => {
    if (adminKey) { setShowAdmin(true); return; }
    setShowKeyModal(true);
  };
  const submitKey = () => {
    setAdminKey(adminKeyInput.trim());
    setShowKeyModal(false);
    setShowAdmin(true);
  };

  // ── Walkthrough ───────────────────────────────────────────────────────────
  const [showWalkthrough, setShowWalkthrough] = useState(true);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => { setResults(null); setError(null); };

  // ── Drug name / SMILES → Log P lookup ────────────────────────────────────
  const [drugNameInput, setDrugNameInput] = useState("");
  const [smilesInput,   setSmilesInput]   = useState("");
  const [logpCalcState, setLogpCalcState] = useState("idle");
  const [logpCalcMsg,   setLogpCalcMsg]   = useState("");

  const applyLogP = (logp, source) => {
    setDrugProps({ logp, delta_d: "", delta_p: "", delta_h: "" });
    setSelectedDrug(""); setResults(null); setError(null);
    setLogpCalcState("success");
    setLogpCalcMsg(`Log P = ${logp} — ${source}`);
    setTimeout(() => setLogpCalcState("idle"), 7000);
  };

  const handleNameLookup = async () => {
    const name = drugNameInput.trim();
    if (!name) return;
    setLogpCalcState("loading"); setLogpCalcMsg("");
    try {
      const enc = encodeURIComponent(name);
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/property/XLogP,IsomericSMILES,IUPACName/JSON`;
      const res = await fetch(url);
      if (res.status === 404) throw new Error(`"${name}" not found in PubChem.`);
      if (!res.ok) throw new Error("PubChem returned an error — try again.");
      const data = await res.json();
      const props = data?.PropertyTable?.Properties?.[0];
      if (!props) throw new Error("No data returned.");
      if (props.XLogP == null) throw new Error("No XLogP value — try entering Log P manually.");
      if (props.IsomericSMILES) setSmilesInput(props.IsomericSMILES);
      applyLogP(parseFloat(props.XLogP.toFixed(2)), `PubChem XLogP3 · ${props.IUPACName || name}`);
    } catch (err) { setLogpCalcState("error"); setLogpCalcMsg(err.message); }
  };

  const handleCalcLogP = async () => {
    const smiles = smilesInput.trim();
    if (!smiles) return;
    setLogpCalcState("loading"); setLogpCalcMsg("");
    try {
      const enc = encodeURIComponent(smiles);
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${enc}/property/XLogP,IUPACName/JSON`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const props = data?.PropertyTable?.Properties?.[0];
        if (props?.XLogP != null) {
          applyLogP(parseFloat(props.XLogP.toFixed(2)), `PubChem XLogP3${props.IUPACName ? ` · ${props.IUPACName}` : ""}`);
          return;
        }
      }
      const API_URL = process.env.REACT_APP_API_URL || "";
      const apiRes  = await fetch(`${API_URL}/api/logp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles }),
      });
      const apiData = await apiRes.json();
      if (!apiRes.ok) throw new Error(apiData.error || "Calculation failed");
      applyLogP(apiData.logp, apiData.source);
    } catch (err) {
      setLogpCalcState("error");
      setLogpCalcMsg(err.message.includes("fetch") ? "Could not reach lookup service." : err.message);
    }
  };

  // ── Drug props state ──────────────────────────────────────────────────────
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugProps, setDrugProps]       = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const validationDrugs = {
    pyrene:   { name: "Pyrene",   logp: 5.19, hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 } },
    nile_red: { name: "Nile Red", logp: 4.0,  hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 } },
  };

  const handleDrugSelect = (key) => {
    setSelectedDrug(key); setResults(null); setError(null);
    const drug = validationDrugs[key];
    if (!drug) { setDrugProps({ logp: "", delta_d: "", delta_p: "", delta_h: "" }); return; }
    setDrugProps({ logp: drug.logp, delta_d: drug.hsp.delta_d, delta_p: drug.hsp.delta_p, delta_h: drug.hsp.delta_h });
  };

  const handlePropChange = (field, value) => {
    setSelectedDrug("");
    setDrugProps(prev => ({ ...prev, [field]: value }));
  };

  // ── Lipid database (fetched from backend; falls back to built-in defaults) ─
  const [lipidDb, setLipidDb] = useState(DEFAULT_LIPID_DB);
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || "";
    fetch(`${API_URL}/api/lipid-db`)
      .then(r => r.ok ? r.json() : null)
      .then(db => { if (db && db.solid_lipids) setLipidDb(db); })
      .catch(() => {}); // silently keep defaults on network error
  }, []);

  // Derived component lists (from fetched DB + Custom entry appended)
  const SOLID_LIPIDS  = useMemo(() => [...(lipidDb.solid_lipids  || []), CUSTOM_ENTRY("custom_solid")], [lipidDb]);
  const LIQUID_LIPIDS = useMemo(() => [...(lipidDb.liquid_lipids || []), CUSTOM_ENTRY("custom_liq")],   [lipidDb]);
  const SURFACTANTS   = useMemo(() => [...(lipidDb.surfactants   || []), CUSTOM_ENTRY("custom_surf")],  [lipidDb]);

  // ── Formulation builder state ─────────────────────────────────────────────
  const [solidLipidId,  setSolidLipidId]  = useState("");
  const [liquidLipidId, setLiquidLipidId] = useState("");
  const [solidRatio,    setSolidRatio]    = useState(70);
  const [surfactantId,  setSurfactantId]  = useState("");

  const [customSolid,  setCustomSolid]  = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
  const [customLiquid, setCustomLiquid] = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
  const [customSurf,   setCustomSurf]   = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });

  const selectedSolid  = SOLID_LIPIDS.find(l => l.id === solidLipidId)  || null;
  const selectedLiquid = LIQUID_LIPIDS.find(l => l.id === liquidLipidId) || null;
  const selectedSurf   = SURFACTANTS.find(s  => s.id === surfactantId)   || null;

  const resolveProps = (sel, custom) => sel?.custom
    ? { ...sel, logp: parseFloat(custom.logp)||null, delta_d: parseFloat(custom.delta_d)||null, delta_p: parseFloat(custom.delta_p)||null, delta_h: parseFloat(custom.delta_h)||null }
    : sel;

  const solidProps  = resolveProps(selectedSolid,  customSolid);
  const liquidProps = resolveProps(selectedLiquid, customLiquid);
  const surfProps   = resolveProps(selectedSurf,   customSurf);

  const nlcProps = useMemo(() => {
    if (!solidProps || !liquidProps || !surfProps) return null;
    if (solidProps.logp == null || liquidProps.logp == null || surfProps.logp == null) return null;
    const sr = solidRatio / 100, lr = 1 - sr;
    const coreLogP = +(sr * solidProps.logp + lr * liquidProps.logp).toFixed(2);
    return {
      core_logp: coreLogP,
      surf_logp: surfProps.logp,
      core_hsp: {
        delta_d: +(sr * solidProps.delta_d + lr * liquidProps.delta_d).toFixed(2),
        delta_p: +(sr * solidProps.delta_p + lr * liquidProps.delta_p).toFixed(2),
        delta_h: +(sr * solidProps.delta_h + lr * liquidProps.delta_h).toFixed(2),
      },
      surf_hsp: { delta_d: surfProps.delta_d, delta_p: surfProps.delta_p, delta_h: surfProps.delta_h },
      grad: +(coreLogP - surfProps.logp).toFixed(2),
      name: [
        selectedSolid?.custom  ? "Custom solid"  : selectedSolid?.name?.split("(")[0].trim(),
        selectedLiquid?.custom ? "Custom liquid" : selectedLiquid?.name?.split("(")[0].trim(),
        selectedSurf?.custom   ? "Custom surf"   : selectedSurf?.name,
      ].filter(Boolean).join(" / "),
    };
  }, [solidProps, liquidProps, surfProps, solidRatio, selectedSolid, selectedLiquid, selectedSurf]);

  // ── Prediction ────────────────────────────────────────────────────────────
  const handlePredict = async () => {
    if (!drugProps.logp) { setError("Please enter a Log P value."); return; }
    if (!nlcProps) { setError("Please select all three lipid components."); return; }
    setLoading(true); setError(null);

    const hspProvided = drugProps.delta_d || drugProps.delta_p || drugProps.delta_h;
    const drug_hsp = hspProvided
      ? { delta_d: parseFloat(drugProps.delta_d), delta_p: parseFloat(drugProps.delta_p), delta_h: parseFloat(drugProps.delta_h) }
      : null;

    const API_URL = process.env.REACT_APP_API_URL || "";
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_logp: parseFloat(drugProps.logp),
          drug_hsp,
          custom_formulation: {
            name:      nlcProps.name,
            core_logp: nlcProps.core_logp,
            surf_logp: nlcProps.surf_logp,
            core_hsp:  nlcProps.core_hsp,
            surf_hsp:  nlcProps.surf_hsp,
          },
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setResults(await res.json());
    } catch (err) {
      setError(`Could not reach the backend: ${err.message}`);
    }
    setLoading(false);
  };

  // ── LogP gauge helpers ────────────────────────────────────────────────────
  const logpValue    = parseFloat(drugProps.logp);
  const gaugePercent = !isNaN(logpValue)
    ? Math.max(0, Math.min(100, ((logpValue + 2) / 10) * 100))
    : null;
  const getLogPLabel  = v => isNaN(v) ? "" : v < 0 ? "Very Hydrophilic" : v < 2 ? "Hydrophilic" : v < 3 ? "Low Lipophilicity" : v < 5 ? "Moderate Lipophilicity" : "Highly Lipophilic";
  const getLogPColour = v => isNaN(v) ? "#64748b" : v < 1 ? "#3b82f6" : v < 3 ? "#10b981" : v < 5 ? "#f59e0b" : "#ef4444";

  // ── Small component helpers ───────────────────────────────────────────────
  const PropBadge = ({ comp }) => comp?.logp != null ? (
    <div className="comp-prop-badge">
      <span className="cpb-item cpb-logp">Log P {comp.logp}</span>
      {comp.delta_d != null && <span className="cpb-item cpb-hsp">δd {comp.delta_d} · δp {comp.delta_p} · δh {comp.delta_h} MPa½</span>}
    </div>
  ) : null;

  const CustomInputs = ({ state, setState, label }) => (
    <div className="custom-inputs">
      <p className="custom-inputs-label">Enter {label} physicochemical properties:</p>
      <div className="custom-inputs-grid">
        {[["logp","Log P","e.g. 8.5","required"],["delta_d","δd (MPa½)","e.g. 17.0",""],["delta_p","δp (MPa½)","e.g. 3.0",""],["delta_h","δh (MPa½)","e.g. 3.5",""]].map(([field, lbl, ph, req]) => (
          <div className="input-group" key={field}>
            <label>{lbl}{req && <span className="required-label"> {req}</span>}</label>
            <input type="number" step="0.1" placeholder={ph}
              value={state[field]}
              onChange={e => setState(s => ({ ...s, [field]: e.target.value }))} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {showWalkthrough && <WalkthroughModal onClose={() => setShowWalkthrough(false)} />}

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="main-header">
        <div className="header-bar">
          <div className="header-brand">
            <img className="brand-icon-img" src="/logo.svg" alt="Lipid Logic logo" />
            <span className="brand-name">Lipid Logic Explorer</span>
          </div>
          <nav className="main-nav">
            <button className={`nav-link ${page === "tool" ? "nav-link--active" : ""}`} onClick={() => setPage("tool")}>Tool</button>
            <button className={`nav-link ${page === "about" ? "nav-link--active" : ""}`} onClick={() => setPage("about")}>About</button>
            <button className={`nav-link ${page === "validation" ? "nav-link--active" : ""}`} onClick={() => setPage("validation")}>Validation</button>
            <button className="nav-guide-btn" onClick={() => setShowWalkthrough(true)} title="Re-open guide">? Guide</button>
            <button className="nav-admin-btn" onClick={openAdmin} title="Admin panel">⚙</button>
          </nav>
        </div>
        <div className="hero-content">
          <div className="hero-badge">Computational Tool for Rational NLC Design</div>
          <h1 className="hero-title">NLC Formulation Predictor</h1>
          <p className="hero-subtitle">
            Predict drug partitioning within nanostructured lipid carriers using lipophilicity and Hansen solubility parameters.
          </p>
          <p className="hero-model-line">
            <span className="hero-model-label">Model inputs:</span> log P &bull; Hansen dispersion (&delta;D) &bull; polar (&delta;P) &bull; hydrogen bonding (&delta;H)
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <span className="hero-model-label">Output:</span> Predicted drug distribution between lipid phases.
          </p>
        </div>
      </header>

      {/* ── WORKFLOW STRIP ───────────────────────────────────────────────── */}
      <div className="workflow-strip">
        <div className="workflow-inner">
          <div className="workflow-step">
            <div className="workflow-num">1</div>
            <div className="workflow-text">
              <span className="workflow-title">Enter drug physicochemical properties</span>
              <span className="workflow-desc">Log P and Hansen solubility parameters</span>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="workflow-num">2</div>
            <div className="workflow-text">
              <span className="workflow-title">Define lipid carrier composition</span>
              <span className="workflow-desc">Solid lipid, liquid lipid, surfactant</span>
            </div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="workflow-num">3</div>
            <div className="workflow-text">
              <span className="workflow-title">Predict drug localisation</span>
              <span className="workflow-desc">Within the NLC structure</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADMIN KEY MODAL ─────────────────────────────────────────────── */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Admin Access</h3>
            <p className="modal-desc">Enter the admin key to manage the formulation database.</p>
            <input className="modal-input" type="password" placeholder="Admin key"
              value={adminKeyInput} onChange={e => setAdminKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitKey()} autoFocus />
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowKeyModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={submitKey}>Open Admin Panel</button>
            </div>
          </div>
        </div>
      )}

      {showAdmin && <AdminPanel adminKey={adminKey} onClose={() => setShowAdmin(false)} />}

      {/* ── ABOUT / VALIDATION ──────────────────────────────────────────── */}
      {page === "about"      && <AboutPage />}
      {page === "validation" && <ValidationPage />}

      {/* ── TOOL PAGE ───────────────────────────────────────────────────── */}
      {page === "tool" && (
        <div className="app-container">
          <div className="main-grid">

            {/* ═══════ LEFT PANEL — Drug Properties ═══════ */}
            <div className="left-panel">
              <div className="card">
                <h3 className="card-title">Drug Properties</h3>

                {/* Validation drug shortcut */}
                <div className="input-group">
                  <label>
                    Load a validation drug
                    <span className="tooltip-icon" data-tooltip="Auto-fills known properties for pyrene or Nile Red — use to test the model against validated experimental data.">?</span>
                    <span className="optional-label">optional</span>
                  </label>
                  <select value={selectedDrug} onChange={e => handleDrugSelect(e.target.value)}>
                    <option value="">— Enter custom drug —</option>
                    {Object.keys(validationDrugs).map(k => (
                      <option key={k} value={k}>{validationDrugs[k].name}</option>
                    ))}
                  </select>
                  {selectedDrug && (
                    <p className="input-hint">✓ Properties auto-filled.{" "}
                      <button className="inline-link" onClick={() => setPage("validation")}>See validation data →</button>
                    </p>
                  )}
                </div>

                <div className="or-divider"><span>or search by name / SMILES</span></div>

                {/* Name / SMILES lookup */}
                <div className="smiles-section">
                  <label className="lookup-field-label">By drug name</label>
                  <div className="smiles-input-row">
                    <input className="smiles-input" type="text" placeholder="e.g. ibuprofen, cyclosporine A"
                      value={drugNameInput}
                      onChange={e => { setDrugNameInput(e.target.value); setLogpCalcState("idle"); }}
                      onKeyDown={e => e.key === "Enter" && handleNameLookup()} />
                    <button className={`smiles-calc-btn ${logpCalcState === "loading" ? "smiles-calc-btn--loading" : ""}`}
                      onClick={handleNameLookup} disabled={!drugNameInput.trim() || logpCalcState === "loading"}>
                      {logpCalcState === "loading" ? <><span className="spinner" /> Looking up…</> : "Look Up"}
                    </button>
                  </div>
                  <label className="lookup-field-label lookup-field-label--mt">By SMILES string</label>
                  <div className="smiles-input-row">
                    <input className="smiles-input" type="text" placeholder="e.g. c1ccccc1"
                      value={smilesInput}
                      onChange={e => { setSmilesInput(e.target.value); setLogpCalcState("idle"); }}
                      onKeyDown={e => e.key === "Enter" && handleCalcLogP()}
                      spellCheck={false} autoCorrect="off" autoCapitalize="none" />
                    <button className={`smiles-calc-btn ${logpCalcState === "loading" ? "smiles-calc-btn--loading" : ""}`}
                      onClick={handleCalcLogP} disabled={!smilesInput.trim() || logpCalcState === "loading"}>
                      {logpCalcState === "loading" ? <><span className="spinner" /> Calculating…</> : "Calculate"}
                    </button>
                  </div>
                  {logpCalcState === "success" && <p className="smiles-feedback smiles-feedback--success">✓ {logpCalcMsg}</p>}
                  {logpCalcState === "error"   && <p className="smiles-feedback smiles-feedback--error">⚠ {logpCalcMsg}</p>}
                </div>

                {/* Log P */}
                <div className="input-group">
                  <label>
                    Log P
                    <span className="tooltip-icon" data-tooltip="Octanol–water partition coefficient. Higher = more lipophilic. The only required input.">?</span>
                    <span className="required-label">required</span>
                  </label>
                  <input type="number" step="0.01" placeholder="e.g. 3.97"
                    value={drugProps.logp} onChange={e => handlePropChange("logp", e.target.value)} />
                  <p className="input-hint">Find in ChemDraw, DrugBank, or PubChem</p>
                </div>

                {gaugePercent !== null && (
                  <div className="logp-gauge-container">
                    <div className="gauge">
                      <div className="gauge-dot" style={{ left: `calc(${gaugePercent}% - 10px)` }} />
                    </div>
                    <div className="gauge-labels">
                      <span>Hydrophilic</span>
                      <span className="gauge-value-label" style={{ color: getLogPColour(logpValue) }}>{getLogPLabel(logpValue)}</span>
                      <span>Lipophilic</span>
                    </div>
                  </div>
                )}

                {/* HSP */}
                <div className="hsp-section">
                  <div className="hsp-header">
                    <h4>
                      Hansen Solubility Parameters
                      <span className="tooltip-icon" data-tooltip="Decompose solubility into dispersive (δd), polar (δp), and H-bonding (δh). Units: MPa½. Enable precise three-hypothesis prediction.">?</span>
                      <span className="optional-label">optional</span>
                    </h4>
                    <p className="hsp-hint">Leave blank for log P-only prediction.</p>
                  </div>
                  <div className="hsp-grid">
                    {[["delta_d","δd (MPa½)","Dispersion","e.g. 18.0"],["delta_p","δp (MPa½)","Polar","e.g. 5.5"],["delta_h","δh (MPa½)","H-bonding","e.g. 8.5"]].map(([field, lbl, tip, ph]) => (
                      <div className="input-group" key={field}>
                        <label>{lbl}<span className="tooltip-icon" data-tooltip={tip}>?</span></label>
                        <input type="number" step="0.1" placeholder={ph}
                          value={drugProps[field]} onChange={e => handlePropChange(field, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════ MIDDLE PANEL — Formulation Builder ═══════ */}
            <div className="middle-panel">
              <div className="card">
                <h3 className="card-title">Lipid Composition</h3>

                {/* Solid lipid */}
                <div className="input-group">
                  <label>
                    Solid Lipid
                    <span className="tooltip-icon" data-tooltip="Forms the crystalline matrix of the NLC core. Sets the core lipophilicity and particle rigidity.">?</span>
                  </label>
                  <select value={solidLipidId} onChange={e => { setSolidLipidId(e.target.value); setResults(null); }}>
                    <option value="">— Select solid lipid —</option>
                    {SOLID_LIPIDS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  {selectedSolid?.custom
                    ? <CustomInputs state={customSolid} setState={setCustomSolid} label="solid lipid" />
                    : <PropBadge comp={solidProps} />}
                </div>

                {/* Liquid lipid */}
                <div className="input-group">
                  <label>
                    Liquid Lipid
                    <span className="tooltip-icon" data-tooltip="Dispersed liquid oil disrupts crystallinity to create nanoscale drug-trapping pockets.">?</span>
                  </label>
                  <select value={liquidLipidId} onChange={e => { setLiquidLipidId(e.target.value); setResults(null); }}>
                    <option value="">— Select liquid lipid —</option>
                    {LIQUID_LIPIDS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  {selectedLiquid?.custom
                    ? <CustomInputs state={customLiquid} setState={setCustomLiquid} label="liquid lipid" />
                    : <PropBadge comp={liquidProps} />}
                </div>

                {/* Ratio slider — only when both lipids are valid */}
                {solidProps?.logp != null && liquidProps?.logp != null && (
                  <div className="ratio-section">
                    <label className="ratio-label">
                      Solid : Liquid ratio
                      <span className="tooltip-icon" data-tooltip="Typical NLC formulations use 70–90% solid lipid. Higher solid content increases crystallinity and matrix stability.">?</span>
                    </label>
                    <input className="ratio-slider" type="range" min="50" max="90" step="5"
                      value={solidRatio}
                      onChange={e => { setSolidRatio(parseInt(e.target.value)); setResults(null); }} />
                    <div className="ratio-bar-row">
                      <div className="ratio-solid-bar" style={{ width: `${solidRatio}%` }} />
                      <div className="ratio-liquid-bar" style={{ width: `${100 - solidRatio}%` }} />
                    </div>
                    <div className="ratio-text-row">
                      <span className="ratio-solid-label">Solid {solidRatio}%</span>
                      <span className="ratio-liquid-label">Liquid {100 - solidRatio}%</span>
                    </div>
                  </div>
                )}

                {/* Surfactant */}
                <div className="input-group">
                  <label>
                    Surfactant
                    <span className="tooltip-icon" data-tooltip="Coats the NLC surface forming an amphiphilic corona. Its log P and HSP define the interface affinity.">?</span>
                  </label>
                  <select value={surfactantId} onChange={e => { setSurfactantId(e.target.value); setResults(null); }}>
                    <option value="">— Select surfactant —</option>
                    {SURFACTANTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {selectedSurf?.custom
                    ? <CustomInputs state={customSurf} setState={setCustomSurf} label="surfactant" />
                    : <PropBadge comp={surfProps} />}
                </div>

                {/* Lipophilicity gradient preview */}
                {nlcProps && (
                  <div className="gradient-preview-box">
                    <div className="gpb-title">Lipophilicity Gradient</div>
                    <div className="gpb-phases">
                      <div className="gpb-phase">
                        <span className="gpb-tag gpb-tag--core">Core</span>
                        <span className="gpb-logp">Log P {nlcProps.core_logp}</span>
                      </div>
                      <div className={`gpb-arrow ${nlcProps.grad > 0 ? "gpb-arrow--pos" : "gpb-arrow--neg"}`}>
                        {nlcProps.grad > 0 ? "→" : "←"}
                      </div>
                      <div className="gpb-phase">
                        <span className="gpb-tag gpb-tag--surf">Interface</span>
                        <span className="gpb-logp">Log P {nlcProps.surf_logp}</span>
                      </div>
                    </div>
                    <p className="gpb-note">
                      Δ = <strong>{Math.abs(nlcProps.grad)}</strong> log units —
                      {" "}{nlcProps.grad > 1 ? "strong core-favoured gradient" : nlcProps.grad > 0 ? "moderate core-favoured gradient" : "weak or neutral gradient"}
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* ═══════ RIGHT PANEL — Results ═══════ */}
            <div className="right-panel">
              {/* Step 3 — Predict */}
              {!results && (
                <div className="predict-step-box">
                  {error && <div className="error-message">{error}</div>}
                  <button className="predict-button"
                    onClick={handlePredict}
                    disabled={loading || !drugProps.logp || !nlcProps}>
                    {loading ? <><span className="spinner" /> Analysing…</> : "▶ Predict Localisation"}
                  </button>
                  <p className="predict-hint">
                    {!drugProps.logp ? "↑ Enter drug Log P first" : !nlcProps ? "↑ Select all three components" : "✓ Ready — click Predict Localisation"}
                  </p>
                </div>
              )}

              {results && results.metadata.too_hydrophilic ? (
                <div className="hydrophilic-panel">
                  <div className="hydrophilic-icon">💧</div>
                  <h3>NLC Not Recommended</h3>
                  <p className="hydrophilic-intro">
                    With a Log P of <strong>{parseFloat(drugProps.logp).toFixed(2)}</strong>, this drug is
                    too hydrophilic for reliable NLC encapsulation. The drug will predominantly remain
                    in the aqueous phase rather than partitioning into the lipid matrix.
                  </p>
                  <div className="hydrophilic-alternatives">
                    <h4>Recommended alternatives</h4>
                    {[
                      { icon:"🫧", title:"Liposomes", desc:"Phospholipid bilayer vesicles with an aqueous core — well-suited for hydrophilic drugs." },
                      { icon:"🔵", title:"Polymeric Nanoparticles", desc:"PLGA or chitosan-based systems can entrap hydrophilic drugs via physical or ionic interactions." },
                      { icon:"⭕", title:"Cyclodextrin Complexation", desc:"Inclusion complexes that improve solubility and stability without a lipid matrix." },
                    ].map(a => (
                      <div className="alt-card" key={a.title}>
                        <span className="alt-icon">{a.icon}</span>
                        <div><strong>{a.title}</strong><p>{a.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>

              ) : results ? (() => {
                const result = results.results[0];
                const isCore = result.location === "Core";
                const af     = result.affinities || {};
                const corePct = af.core      ?? null;
                const intPct  = af.interface  ?? null;
                const aqPct   = af.aqueous    ?? null;

                return (
                  <div className="single-result">
                    {/* Header bar */}
                    <div className="sr-topbar">
                      <span className="sr-formulation-label">{nlcProps?.name}</span>
                      <button className="rab-reset-btn" onClick={handleReset}>↺ New Analysis</button>
                    </div>

                    {/* Location hero */}
                    <div className={`location-hero ${isCore ? "lh--core" : "lh--interface"}`}>
                      <div className="lh-icon">{isCore ? "🔵" : "🟢"}</div>
                      <div className="lh-body">
                        <p className="lh-label">Predicted Localisation</p>
                        <h2 className="lh-site">{isCore ? "Lipid Core" : "Surfactant Interface"}</h2>
                        <p className="lh-implication">
                          {isCore
                            ? "Slower release · Protected from environment"
                            : "Faster release · Surface-driven distribution"}
                        </p>
                      </div>
                    </div>

                    {/* NLC spatial diagram — SVG cross-section */}
                    <div className="spatial-viz">
                      <p className="spatial-title">NLC Cross-Section</p>
                      <svg className="nlc-svg" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" aria-label="NLC cross-section diagram">
                        <defs>
                          <radialGradient id="nlcShellGrad" cx="35%" cy="35%">
                            <stop offset="0%" stopColor="#bfdbfe"/>
                            <stop offset="100%" stopColor="#4a90b8"/>
                          </radialGradient>
                          <radialGradient id="nlcCoreGrad" cx="35%" cy="35%">
                            <stop offset="0%" stopColor="#93c5fd"/>
                            <stop offset="100%" stopColor="#1e3a5f"/>
                          </radialGradient>
                        </defs>
                        {/* Aqueous phase label */}
                        <text x="100" y="13" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontStyle="italic">Aqueous phase</text>
                        {/* Shell (full particle) */}
                        <circle cx="100" cy="110" r="85" fill="url(#nlcShellGrad)" stroke="#3b82f6" strokeWidth="1.5"/>
                        {/* Core */}
                        <circle cx="100" cy="110" r="50" fill="url(#nlcCoreGrad)"/>
                        {/* Core label */}
                        <text x="100" y="107" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="0.3">LIPID</text>
                        <text x="100" y="120" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="0.3">CORE</text>
                        {/* Shell region label (in the ring, bottom-right area) */}
                        <text x="148" y="158" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="600" opacity="0.92">Surfactant</text>
                        <text x="148" y="168" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="600" opacity="0.92">Shell</text>
                        {/* Drug dot — core: centred, interface: in shell ring at top */}
                        {isCore ? (
                          <>
                            <circle cx="100" cy="110" r="10" fill="#ef4444" stroke="white" strokeWidth="2.5"/>
                            <text x="100" y="128" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">DRUG</text>
                          </>
                        ) : (
                          <>
                            <circle cx="100" cy="30" r="10" fill="#ef4444" stroke="white" strokeWidth="2.5"/>
                            <text x="100" y="46" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">DRUG</text>
                          </>
                        )}
                      </svg>
                      {/* Legend */}
                      <div className="nlc-legend">
                        <span className="nlc-legend-item"><span className="nlc-swatch nlc-swatch--core"/>Lipid Core</span>
                        <span className="nlc-legend-item"><span className="nlc-swatch nlc-swatch--shell"/>Surfactant Shell</span>
                        <span className="nlc-legend-item"><span className="nlc-swatch nlc-swatch--drug"/>Drug</span>
                      </div>
                      {result.d_core != null && (
                        <div className="distance-table">
                          <div className={`dist-row ${isCore ? "dist-winner" : ""}`}>
                            <span className="dist-label">Δδ to core (Ra)</span>
                            <span className="dist-value">{result.d_core} MPa½</span>
                          </div>
                          <div className={`dist-row ${!isCore ? "dist-winner" : ""}`}>
                            <span className="dist-label">Δδ to interface (Ra)</span>
                            <span className="dist-value">{result.d_surf} MPa½</span>
                          </div>
                          <p className="dist-explainer">Lower Ra = stronger chemical affinity</p>
                        </div>
                      )}
                    </div>

                    {/* Partition affinity bar — shown after spatial diagram */}
                    {corePct !== null && (
                      <div className="affinity-section">
                        <h4 className="affinity-title">Partition Affinity</h4>
                        <div className="affinity-bar-track">
                          <div className="affinity-seg affinity-core" style={{ width: `${corePct}%` }} />
                          <div className="affinity-seg affinity-int"  style={{ width: `${intPct}%` }}  />
                          <div className="affinity-seg affinity-aq"   style={{ width: `${aqPct}%` }}   />
                        </div>
                        <div className="affinity-legend">
                          <span className="aff-item"><span className="aff-swatch aff-swatch--core" />Core {corePct}%</span>
                          <span className="aff-item"><span className="aff-swatch aff-swatch--int"  />Interface {intPct}%</span>
                          <span className="aff-item"><span className="aff-swatch aff-swatch--aq"   />Aqueous {aqPct}%</span>
                        </div>
                      </div>
                    )}

                    {results.metadata.logp_only && (
                      <div className="logp-only-banner">
                        <span className="logp-only-icon">⚠️</span>
                        <div><strong>Log P only</strong> — add Hansen Solubility Parameters (δd, δp, δh) for a full three-hypothesis prediction and more precise affinity scores.</div>
                      </div>
                    )}

                    {/* Confidence */}
                    <div className="card confidence-card confidence-card--inline">
                      <h3 className="card-title">Model Confidence</h3>
                      <div className="stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={i < results.metadata.stars ? "star filled" : "star empty"}>★</span>
                        ))}
                      </div>
                      <p className="strategy-tag">{results.metadata.strategy}</p>
                      <p className="confidence-note">
                        {results.metadata.stars >= 4
                          ? "High confidence — drug properties fall within the validated model range."
                          : results.metadata.stars >= 3
                          ? "Moderate confidence — treat as a starting hypothesis for further study."
                          : results.metadata.stars === 2
                          ? "Extrapolated — Log P is above the validated range. Directional result likely correct."
                          : "Lower confidence — drug may be too hydrophilic for reliable NLC encapsulation."}
                      </p>
                      <button className="inline-link" onClick={() => setPage("about")}>
                        How does the model work? →
                      </button>
                    </div>
                  </div>
                );
              })() : (
                /* Empty state */
                <div className="empty-state">
                  <div className="empty-icon">⚗️</div>
                  <h3>Ready to Predict</h3>
                  <p>Enter your drug properties, choose your lipid components, then click <strong>Predict Localisation</strong>.</p>
                  <div className="empty-steps">
                    {[
                      ["1","Enter Log P","Required — use name lookup or enter manually"],
                      ["2","Add HSP values","Optional — improves affinity precision"],
                      ["3","Select components","Solid lipid, liquid lipid, surfactant"],
                      ["4","Predict","Get localisation result with affinity percentages"],
                    ].map(([n, t, d]) => (
                      <div className="step" key={n}>
                        <span className="step-num">{n}</span>
                        <div><strong>{t}</strong><span>{d}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="footer-bug-card">
            <div className="footer-bug-icon">🐛</div>
            <div className="footer-bug-body">
              <p className="footer-bug-title">Found a bug?</p>
              <p className="footer-bug-desc">Report issues or contribute on the project repository.</p>
              <a
                className="footer-gh-link"
                href="https://github.com/scarmali/lipid-logic"
                target="_blank"
                rel="noopener noreferrer">
                <svg className="footer-gh-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} Lipid Logic Explorer — Computational Tool for Rational NLC Design
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
