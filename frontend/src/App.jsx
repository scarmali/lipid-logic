import React, { useState } from "react";
import FormulationCard from "./components/FormulationCard";
import "./App.css";

function App() {
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugProps, setDrugProps] = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validationDrugs = {
    pyrene:    { name: "Pyrene",    logp: 5.19, hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 } },
    nile_red:  { name: "Nile Red",  logp: 4.0,  hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 } },
    curcumin:  { name: "Curcumin",  logp: 3.29, hsp: { delta_d: 21.2, delta_p: 7.4, delta_h: 9.1 } },
    ibuprofen: { name: "Ibuprofen", logp: 3.97, hsp: { delta_d: 18.0, delta_p: 5.5, delta_h: 8.5 } },
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
    if (!logp || !delta_d || !delta_p || !delta_h) {
      setError("Please fill in all four drug properties (Log P, δd, δp, δh) before running the analysis.");
      return;
    }
    setLoading(true);
    setError(null);
    const API_URL = process.env.REACT_APP_API_URL || "";
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_logp: parseFloat(logp),
          drug_hsp: {
            delta_d: parseFloat(delta_d),
            delta_p: parseFloat(delta_p),
            delta_h: parseFloat(delta_h),
          },
        }),
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

  return (
    <>
      {/* FULL-WIDTH HEADER */}
      <header className="main-header">
        <div className="hero-content">
          <h1 className="hero-title">Lipid Logic Explorer</h1>
          <p className="hero-subtitle">Rational NLC Design via Competitive Partitioning</p>
        </div>
      </header>

      <div className="app-container">
        <div className="main-grid">

          {/* LEFT PANEL — INPUTS */}
          <div className="left-panel">
            <div className="card">
              <h3 className="card-title">Drug Properties</h3>

              {/* Drug selector */}
              <div className="input-group">
                <label>
                  Validation Drug
                  <span
                    className="tooltip-icon"
                    data-tooltip="Select a well-characterised drug to auto-fill its properties and validate the model."
                  >?</span>
                </label>
                <select value={selectedDrug} onChange={(e) => handleDrugSelect(e.target.value)}>
                  <option value="">— Enter custom parameters —</option>
                  {Object.keys(validationDrugs).map((key) => (
                    <option key={key} value={key}>{validationDrugs[key].name}</option>
                  ))}
                </select>
              </div>

              {/* Log P */}
              <div className="input-group">
                <label>
                  Log P
                  <span
                    className="tooltip-icon"
                    data-tooltip="Octanol–water partition coefficient. Measures lipophilicity: higher values indicate more oil-soluble compounds."
                  >?</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.97"
                  value={drugProps.logp}
                  onChange={(e) => handlePropChange("logp", e.target.value)}
                />
              </div>

              {/* LogP gauge */}
              {gaugePercent !== null && (
                <div className="logp-gauge-container">
                  <div className="gauge">
                    <div className="gauge-dot" style={{ left: `calc(${gaugePercent}% - 10px)` }} />
                  </div>
                  <div className="gauge-labels">
                    <span>Hydrophilic</span>
                    <span className="gauge-value-label">{getLogPLabel(logpValue)}</span>
                    <span>Lipophilic</span>
                  </div>
                </div>
              )}

              {/* HSP inputs */}
              <div className="hsp-section">
                <div className="hsp-header">
                  <h4>
                    Hansen Solubility Parameters
                    <span
                      className="tooltip-icon"
                      data-tooltip="HSP decompose solubility into dispersive (δd), polar (δp), and hydrogen-bonding (δh) contributions. Units: MPa½."
                    >?</span>
                  </h4>
                </div>
                <div className="hsp-grid">
                  <div className="input-group">
                    <label>δd (MPa½)</label>
                    <input
                      type="number" step="0.1" placeholder="e.g. 18.0"
                      value={drugProps.delta_d}
                      onChange={(e) => handlePropChange("delta_d", e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>δp (MPa½)</label>
                    <input
                      type="number" step="0.1" placeholder="e.g. 5.5"
                      value={drugProps.delta_p}
                      onChange={(e) => handlePropChange("delta_p", e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>δh (MPa½)</label>
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
                  <><span className="spinner" /> Analyzing…</>
                ) : "Run CADFD Analysis"}
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
                    ? "Moderate confidence — prediction is reasonable, treat as a starting point for further study."
                    : "Lower confidence — drug properties are at the edge of the model's training range; use with caution."}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL — RESULTS */}
          <div className="right-panel">
            {results ? (
              <div className="results-list">
                <h3 className="section-title">Ranked Formulations</h3>
                <p className="results-subtitle">Formulations ordered by predicted drug–carrier compatibility score</p>
                {results.results.map((formulation, index) => (
                  <FormulationCard
                    key={formulation.id}
                    formulation={formulation}
                    rank={index + 1}
                    drugLogP={drugProps.logp}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚗️</div>
                <h3>Ready to Analyse</h3>
                <p>
                  Select a validation drug or enter custom physicochemical properties,
                  then click <strong>Run CADFD Analysis</strong> to predict the optimal NLC formulation.
                </p>
                <div className="empty-steps">
                  <div className="step">
                    <span className="step-num">1</span>
                    Choose a drug or enter Log P &amp; HSP values
                  </div>
                  <div className="step">
                    <span className="step-num">2</span>
                    Click "Run CADFD Analysis"
                  </div>
                  <div className="step">
                    <span className="step-num">3</span>
                    Review ranked formulation predictions
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default App;
