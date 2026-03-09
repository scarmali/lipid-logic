import React, { useState } from "react";
import FormulationCard from "./components/FormulationCard";
import AdminPanel from "./components/AdminPanel";
import AboutPage from "./components/AboutPage";
import ValidationPage from "./components/ValidationPage";
import WalkthroughModal from "./components/WalkthroughModal";
import "./App.css";

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
  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  // ── Drug name / SMILES → Log P lookup ────────────────────────────────────
  const [drugNameInput,  setDrugNameInput]  = useState("");
  const [smilesInput,    setSmilesInput]    = useState("");
  const [logpCalcState,  setLogpCalcState]  = useState("idle"); // idle | loading | success | error
  const [logpCalcMsg,    setLogpCalcMsg]    = useState("");

  // Shared helper: fill Log P from a successful lookup
  const applyLogP = (logp, source) => {
    setDrugProps(prev => ({ ...prev, logp }));
    setSelectedDrug("");
    setResults(null);
    setError(null);
    setLogpCalcState("success");
    setLogpCalcMsg(`Log P = ${logp} — ${source}`);
    setTimeout(() => setLogpCalcState("idle"), 7000);
  };

  // PubChem lookup by drug name
  const handleNameLookup = async () => {
    const name = drugNameInput.trim();
    if (!name) return;
    setLogpCalcState("loading");
    setLogpCalcMsg("");
    try {
      const enc = encodeURIComponent(name);
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/property/XLogP,IsomericSMILES,IUPACName/JSON`;
      const res = await fetch(url);
      if (res.status === 404) throw new Error(`"${name}" not found in PubChem. Check spelling or try using the SMILES string directly.`);
      if (!res.ok) throw new Error("PubChem returned an error — try again or use SMILES.");
      const data = await res.json();
      const props = data?.PropertyTable?.Properties?.[0];
      if (!props) throw new Error("No data returned for that compound.");
      if (props.XLogP == null) throw new Error("PubChem has no XLogP value for this compound. Try entering Log P manually.");
      // Auto-fill SMILES field too so student can see the structure string
      if (props.IsomericSMILES) setSmilesInput(props.IsomericSMILES);
      applyLogP(parseFloat(props.XLogP.toFixed(2)), `PubChem XLogP3 · ${props.IUPACName || name}`);
    } catch (err) {
      setLogpCalcState("error");
      setLogpCalcMsg(err.message);
    }
  };

  // PubChem lookup by SMILES structure
  const handleCalcLogP = async () => {
    const smiles = smilesInput.trim();
    if (!smiles) return;
    setLogpCalcState("loading");
    setLogpCalcMsg("");
    try {
      // Try PubChem first (client-side, no backend needed)
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
      // Fallback: backend ALOGPS 2.1 API
      const API_URL = process.env.REACT_APP_API_URL || "";
      const apiRes  = await fetch(`${API_URL}/api/logp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ smiles }),
      });
      const apiData = await apiRes.json();
      if (!apiRes.ok) throw new Error(apiData.error || "Calculation failed");
      applyLogP(apiData.logp, apiData.source);
    } catch (err) {
      setLogpCalcState("error");
      setLogpCalcMsg(err.message.includes("fetch") ? "Could not reach lookup service — check your internet connection." : err.message);
    }
  };

  // ── Tool state ─────────────────────────────────────────────────────────────
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugProps, setDrugProps] = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validationDrugs = {
    pyrene:   { name: "Pyrene",   logp: 5.19, hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 } },
    nile_red: { name: "Nile Red", logp: 4.0,  hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 } },
  };

  const handleDrugSelect = (key) => {
    setSelectedDrug(key);
    setResults(null);
    setError(null);
    const drug = validationDrugs[key];
    if (!drug) {
      setDrugProps({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
      return;
    }
    setDrugProps({
      logp:    drug.logp,
      delta_d: drug.hsp.delta_d,
      delta_p: drug.hsp.delta_p,
      delta_h: drug.hsp.delta_h,
    });
  };

  const handlePropChange = (field, value) => {
    setSelectedDrug("");
    setDrugProps((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    const { logp, delta_d, delta_p, delta_h } = drugProps;
    if (!logp) {
      setError("Please enter a Log P value before running the analysis.");
      return;
    }
    setLoading(true);
    setError(null);

    // If all HSP fields are blank, send null to trigger Log P-only mode
    const hspProvided = delta_d || delta_p || delta_h;
    const drug_hsp = hspProvided
      ? { delta_d: parseFloat(delta_d), delta_p: parseFloat(delta_p), delta_h: parseFloat(delta_h) }
      : null;

    const API_URL = process.env.REACT_APP_API_URL || "";
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drug_logp: parseFloat(logp), drug_hsp }),
      });
      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(`Could not reach the backend: ${err.message}. Make sure the server is running.`);
    }
    setLoading(false);
  };

  // LogP gauge — maps -2 to 8 onto 0–100%
  const logpValue = parseFloat(drugProps.logp);
  const gaugePercent = !isNaN(logpValue)
    ? Math.max(0, Math.min(100, ((logpValue - (-2)) / (8 - (-2))) * 100))
    : null;

  const getLogPLabel = (v) => {
    if (isNaN(v)) return "";
    if (v < 0)  return "Very Hydrophilic";
    if (v < 2)  return "Hydrophilic";
    if (v < 3)  return "Low Lipophilicity";
    if (v < 5)  return "Moderate Lipophilicity";
    return "Highly Lipophilic";
  };

  const getLogPColour = (v) => {
    if (isNaN(v)) return "#64748b";
    if (v < 1)  return "#3b82f6";
    if (v < 3)  return "#10b981";
    if (v < 5)  return "#f59e0b";
    return "#ef4444";
  };

  return (
    <>
      {/* WALKTHROUGH MODAL */}
      {showWalkthrough && (
        <WalkthroughModal onClose={() => setShowWalkthrough(false)} />
      )}

      {/* FULL-WIDTH HEADER */}
      <header className="main-header">
        <div className="hero-content">
          <div className="hero-badge">CADFD · Rational NLC Design</div>
          <h1 className="hero-title">Lipid Logic Explorer</h1>
          <p className="hero-subtitle">
            Predict drug localisation in Nanostructured Lipid Carriers — before any experiment begins
          </p>
        </div>
        <nav className="main-nav">
          <button
            className={`nav-link ${page === "tool" ? "nav-link--active" : ""}`}
            onClick={() => setPage("tool")}
          >
            <span className="nav-icon">⚗️</span> Tool
          </button>
          <button
            className={`nav-link ${page === "about" ? "nav-link--active" : ""}`}
            onClick={() => setPage("about")}
          >
            <span className="nav-icon">📖</span> About
          </button>
          <button
            className={`nav-link ${page === "validation" ? "nav-link--active" : ""}`}
            onClick={() => setPage("validation")}
          >
            <span className="nav-icon">🔬</span> Validation
          </button>
          <button
            className="nav-guide-btn"
            onClick={() => setShowWalkthrough(true)}
            title="Re-open the guided walkthrough"
            aria-label="Open guide"
          >
            ? Guide
          </button>
          <button
            className="nav-admin-btn"
            onClick={openAdmin}
            title="Admin: manage formulation database"
            aria-label="Admin panel"
          >⚙</button>
        </nav>
      </header>

      {/* ADMIN KEY MODAL */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Admin Access</h3>
            <p className="modal-desc">Enter the admin key to manage the formulation database.</p>
            <input
              className="modal-input"
              type="password"
              placeholder="Admin key"
              value={adminKeyInput}
              onChange={e => setAdminKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitKey()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowKeyModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={submitKey}>Open Admin Panel</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PANEL OVERLAY */}
      {showAdmin && (
        <AdminPanel adminKey={adminKey} onClose={() => setShowAdmin(false)} />
      )}

      {/* ABOUT PAGE */}
      {page === "about" && <AboutPage />}

      {/* VALIDATION PAGE */}
      {page === "validation" && <ValidationPage />}

      {/* TOOL PAGE */}
      {page === "tool" && (
      <div className="app-container">

        {/* PAGE INTRO BANNER */}
        <div className="page-intro-banner">
          <div className="pib-left">
            <h2 className="pib-title">NLC Formulation Predictor</h2>
            <p className="pib-desc">
              Enter your drug's physicochemical properties below to predict which NLC
              formulation offers the best chemical compatibility.
            </p>
          </div>
          <div className="pib-links">
            <button className="pib-link" onClick={() => setPage("about")}>
              📖 New to NLCs? Read the background
            </button>
            <button className="pib-link" onClick={() => setPage("validation")}>
              🔬 See how predictions were validated
            </button>
          </div>
        </div>

        <div className="main-grid">

          {/* LEFT PANEL — INPUTS */}
          <div className="left-panel">
            <div className="card">
              <h3 className="card-title">Drug Properties</h3>

              {/* Drug selector */}
              <div className="input-group">
                <label>
                  Try a Validation Drug
                  <span
                    className="tooltip-icon"
                    data-tooltip="Select a well-characterised drug to auto-fill its known properties and see how the model performs against experimental data."
                  >?</span>
                </label>
                <select value={selectedDrug} onChange={(e) => handleDrugSelect(e.target.value)}>
                  <option value="">— Enter custom parameters —</option>
                  {Object.keys(validationDrugs).map((key) => (
                    <option key={key} value={key}>{validationDrugs[key].name}</option>
                  ))}
                </select>
                {selectedDrug && (
                  <p className="input-hint">
                    ✓ Properties auto-filled from the validation dataset.{" "}
                    <button className="inline-link" onClick={() => setPage("validation")}>
                      See experimental evidence →
                    </button>
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="or-divider"><span>or enter your own drug</span></div>

              {/* Drug name / SMILES → Log P lookup */}
              <div className="smiles-section">
                <div className="smiles-header">
                  <h4>
                    Look Up Log P
                    <span
                      className="tooltip-icon"
                      data-tooltip="Search by drug name to auto-fill Log P from PubChem, or paste a SMILES string to calculate it. Both methods query the PubChem XLogP3 database."
                    >?</span>
                    <span className="optional-label">optional</span>
                  </h4>
                  <p className="smiles-hint">
                    Search by name or paste a SMILES string — Log P will be filled automatically.
                  </p>
                </div>

                {/* Drug name row */}
                <label className="lookup-field-label">By drug name</label>
                <div className="smiles-input-row">
                  <input
                    className="smiles-input"
                    type="text"
                    placeholder="e.g. ibuprofen, caffeine, curcumin"
                    value={drugNameInput}
                    onChange={e => { setDrugNameInput(e.target.value); setLogpCalcState("idle"); }}
                    onKeyDown={e => e.key === "Enter" && handleNameLookup()}
                    spellCheck={false}
                    autoCorrect="off"
                  />
                  <button
                    className={`smiles-calc-btn ${logpCalcState === "loading" ? "smiles-calc-btn--loading" : ""}`}
                    onClick={handleNameLookup}
                    disabled={!drugNameInput.trim() || logpCalcState === "loading"}
                  >
                    {logpCalcState === "loading"
                      ? <><span className="spinner" /> Looking up…</>
                      : "Look Up"}
                  </button>
                </div>

                {/* SMILES row */}
                <label className="lookup-field-label lookup-field-label--mt">By SMILES string</label>
                <div className="smiles-input-row">
                  <input
                    className="smiles-input"
                    type="text"
                    placeholder="e.g. c1ccccc1 (benzene)"
                    value={smilesInput}
                    onChange={e => { setSmilesInput(e.target.value); setLogpCalcState("idle"); }}
                    onKeyDown={e => e.key === "Enter" && handleCalcLogP()}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
                  />
                  <button
                    className={`smiles-calc-btn ${logpCalcState === "loading" ? "smiles-calc-btn--loading" : ""}`}
                    onClick={handleCalcLogP}
                    disabled={!smilesInput.trim() || logpCalcState === "loading"}
                  >
                    {logpCalcState === "loading"
                      ? <><span className="spinner" /> Calculating…</>
                      : "Calculate"}
                  </button>
                </div>

                {logpCalcState === "success" && (
                  <p className="smiles-feedback smiles-feedback--success">✓ {logpCalcMsg}</p>
                )}
                {logpCalcState === "error" && (
                  <p className="smiles-feedback smiles-feedback--error">⚠ {logpCalcMsg}</p>
                )}
                <p className="smiles-source-note">
                  Log P values sourced from PubChem XLogP3 — a validated computational predictor used in drug discovery.
                </p>
              </div>

              {/* Log P */}
              <div className="input-group">
                <label>
                  Log P
                  <span
                    className="tooltip-icon"
                    data-tooltip="Octanol–water partition coefficient. Measures lipophilicity: higher values indicate more oil-soluble compounds. This is the only required input."
                  >?</span>
                  <span className="required-label">required</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.97"
                  value={drugProps.logp}
                  onChange={(e) => handlePropChange("logp", e.target.value)}
                />
                <p className="input-hint">Find this in ChemDraw, DrugBank, or PubChem</p>
              </div>

              {/* LogP gauge */}
              {gaugePercent !== null && (
                <div className="logp-gauge-container">
                  <div className="gauge">
                    <div className="gauge-dot" style={{ left: `calc(${gaugePercent}% - 10px)` }} />
                  </div>
                  <div className="gauge-labels">
                    <span>Hydrophilic</span>
                    <span
                      className="gauge-value-label"
                      style={{ color: getLogPColour(logpValue) }}
                    >
                      {getLogPLabel(logpValue)}
                    </span>
                    <span>Lipophilic</span>
                  </div>
                  {logpValue < 1 && !isNaN(logpValue) && (
                    <div className="logp-warning">
                      ⚠️ Log P below 1 — NLC encapsulation may be inefficient. See results for alternatives.
                    </div>
                  )}
                </div>
              )}

              {/* HSP inputs */}
              <div className="hsp-section">
                <div className="hsp-header">
                  <h4>
                    Hansen Solubility Parameters
                    <span
                      className="tooltip-icon"
                      data-tooltip="HSP decompose solubility into dispersive (δd), polar (δp), and hydrogen-bonding (δh) contributions. Units: MPa½. These enable a more precise three-hypothesis prediction."
                    >?</span>
                    <span className="optional-label">optional</span>
                  </h4>
                  <p className="hsp-hint">
                    Leave blank to rank by lipophilicity gradient only.{" "}
                    <span
                      className="tooltip-icon tooltip-icon--inline"
                      data-tooltip="HSP values can be estimated using group-contribution methods or tools like HSPiP. They are listed in the HSP workbook and solubility databases."
                    >?</span>
                  </p>
                </div>
                <div className="hsp-grid">
                  <div className="input-group">
                    <label>
                      δd (MPa½)
                      <span className="tooltip-icon" data-tooltip="Dispersion component — non-specific London forces">?</span>
                    </label>
                    <input
                      type="number" step="0.1" placeholder="e.g. 18.0"
                      value={drugProps.delta_d}
                      onChange={(e) => handlePropChange("delta_d", e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>
                      δp (MPa½)
                      <span className="tooltip-icon" data-tooltip="Polar component — dipole–dipole interactions">?</span>
                    </label>
                    <input
                      type="number" step="0.1" placeholder="e.g. 5.5"
                      value={drugProps.delta_p}
                      onChange={(e) => handlePropChange("delta_p", e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>
                      δh (MPa½)
                      <span className="tooltip-icon" data-tooltip="Hydrogen-bonding component — H-bond donor/acceptor capacity">?</span>
                    </label>
                    <input
                      type="number" step="0.1" placeholder="e.g. 8.5"
                      value={drugProps.delta_h}
                      onChange={(e) => handlePropChange("delta_h", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button className="predict-button" onClick={handlePredict} disabled={loading}>
                {loading ? (
                  <><span className="spinner" /> Analysing…</>
                ) : "▶ Run CADFD Analysis"}
              </button>
            </div>

            {/* Confidence card */}
            {results && (
              <div className="card confidence-card">
                <h3 className="card-title">Model Confidence</h3>
                <div className="stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < results.metadata.stars ? "star filled" : "star empty"}>★</span>
                  ))}
                </div>
                <p className="strategy-tag">{results.metadata.strategy}</p>
                <p className="confidence-note">
                  {results.metadata.stars >= 4
                    ? "High confidence — drug properties fall well within the validated model range."
                    : results.metadata.stars >= 3
                    ? "Moderate confidence — prediction is reasonable; treat as a starting point for further study."
                    : results.metadata.stars === 2
                    ? "Extrapolated prediction — Log P is above the validated range. The directional result (core vs interface) is likely correct, but treat quantitative scores with caution."
                    : "Lower confidence — drug is too hydrophilic for reliable NLC encapsulation. Consider alternative formulation strategies."}
                </p>
                <div className="confidence-learn-more">
                  <button className="inline-link" onClick={() => setPage("about")}>
                    How does the model calculate this? →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL — RESULTS */}
          <div className="right-panel">
            {results && results.metadata.too_hydrophilic ? (
              /* ── Hydrophilic warning — replace formulation cards ── */
              <div className="hydrophilic-panel">
                <div className="hydrophilic-icon">💧</div>
                <h3>NLC Not Recommended</h3>
                <p className="hydrophilic-intro">
                  With a Log&nbsp;P of <strong>{parseFloat(drugProps.logp).toFixed(2)}</strong>, this drug is
                  too hydrophilic for reliable encapsulation in a nanostructured lipid carrier.
                  At this lipophilicity, the drug is unlikely to partition into either the lipid
                  core or the surfactant shell — it will remain predominantly in the aqueous
                  phase, leading to poor loading efficiency and rapid leaching.
                </p>
                <div className="hydrophilic-alternatives">
                  <h4>Recommended alternatives</h4>
                  <div className="alt-card">
                    <span className="alt-icon">🫧</span>
                    <div>
                      <strong>Liposomes</strong>
                      <p>Phospholipid bilayer vesicles with an aqueous core — well-suited for hydrophilic drugs. Can achieve high encapsulation efficiency for water-soluble compounds.</p>
                    </div>
                  </div>
                  <div className="alt-card">
                    <span className="alt-icon">🔵</span>
                    <div>
                      <strong>Polymeric Nanoparticles</strong>
                      <p>PLGA or chitosan-based systems can entrap hydrophilic drugs via physical encapsulation or ionic interactions, offering controlled release profiles.</p>
                    </div>
                  </div>
                  <div className="alt-card">
                    <span className="alt-icon">⭕</span>
                    <div>
                      <strong>Cyclodextrin Complexation</strong>
                      <p>Forms inclusion complexes that improve solubility and stability of hydrophilic or poorly soluble drugs without requiring a lipid matrix.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : results ? (
              <div className="results-list">

                {/* ── Results action bar ── */}
                <div className="results-action-bar">
                  <span className="rab-label">
                    {results.results.length} formulation{results.results.length !== 1 ? "s" : ""} analysed
                  </span>
                  <button className="rab-reset-btn" onClick={handleReset}>
                    ↺ New Analysis
                  </button>
                </div>

                {/* ── Distribution summary ── */}
                {(() => {
                  const formulations = results.results;
                  const coreCount = formulations.filter(f => f.location === "Core").length;
                  const total = formulations.length;
                  const majorityCore = coreCount >= total / 2;
                  const allSame = coreCount === 0 || coreCount === total;
                  return (
                    <div className={`distribution-summary ${majorityCore ? "ds--core" : "ds--interface"}`}>
                      <div className="ds-icon">{majorityCore ? "🔵" : "🟢"}</div>
                      <div className="ds-body">
                        <h3 className="ds-title">
                          Predicted to distribute to the{" "}
                          <span className={majorityCore ? "ds-site-core" : "ds-site-interface"}>
                            {majorityCore ? "lipid core" : "surfactant interface"}
                          </span>
                        </h3>
                        <p className="ds-detail">
                          {allSame
                            ? `All ${total} formulations predict ${majorityCore ? "core" : "interface"} localisation for this drug.`
                            : `${coreCount} of ${total} formulations predict core loading; ${total - coreCount} predict interface localisation. The outcome varies with formulation composition.`}
                          {results.metadata.logp_only &&
                            " This prediction uses lipophilic gradient only — add HSP values for a more precise result."}
                        </p>
                        <div className="ds-implication">
                          {majorityCore
                            ? "🐢 Expect slower drug release and better protection from the environment."
                            : "⚡ Expect faster drug release as the surfactant corona disperses."}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {results.metadata.logp_only && (
                  <div className="logp-only-banner">
                    <span className="logp-only-icon">⚠️</span>
                    <div>
                      <strong>Lipophilicity gradient only</strong> — add Hansen Solubility Parameters (δd, δp, δh) for a full three-hypothesis prediction with precise core/interface affinity percentages.
                    </div>
                  </div>
                )}

                <h4 className="results-sub-heading">
                  Formulations ranked by predicted compatibility
                  <span className="results-sub-note">Best match first</span>
                </h4>

                {results.results.map((formulation, idx) => (
                  <FormulationCard
                    key={formulation.id}
                    formulation={formulation}
                    drugLogP={drugProps.logp}
                    rank={idx + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚗️</div>
                <h3>Ready to Analyse</h3>
                <p>
                  Enter your drug's Log&nbsp;P value on the left, then click{" "}
                  <strong>Run CADFD Analysis</strong> to predict how it will behave
                  across all NLC formulations in the database.
                </p>

                <div className="empty-steps">
                  <div className="step">
                    <span className="step-num">1</span>
                    <div>
                      <strong>Enter Log P</strong>
                      <span>Find this in ChemDraw, DrugBank, or PubChem</span>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">2</span>
                    <div>
                      <strong>Add HSP values</strong>
                      <span>Optional — improves prediction accuracy</span>
                    </div>
                  </div>
                  <div className="step">
                    <span className="step-num">3</span>
                    <div>
                      <strong>Run the analysis</strong>
                      <span>Get ranked formulation predictions in seconds</span>
                    </div>
                  </div>
                </div>

                <div className="empty-info-grid">
                  <div className="empty-info-card">
                    <span className="eic-icon">📖</span>
                    <div>
                      <strong>New to NLCs?</strong>
                      <p>Learn about nanostructured lipid carriers, why drug localisation matters, and the science behind the predictions.</p>
                      <button className="inline-link" onClick={() => setPage("about")}>
                        Read the background →
                      </button>
                    </div>
                  </div>
                  <div className="empty-info-card">
                    <span className="eic-icon">🔬</span>
                    <div>
                      <strong>See validation data</strong>
                      <p>Explore how fluorescent probe experiments confirmed the model's predictions across four NLC formulations.</p>
                      <button className="inline-link" onClick={() => setPage("validation")}>
                        View validation →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      )}
    </>
  );
}

export default App;
