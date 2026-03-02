import React, { useState } from "react";
import FormulationCard from "./components/FormulationCard"; // Import the new component
import "./App.css";

function App() {
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugProps, setDrugProps] = useState({ logp: "", delta_d: "", delta_p: "", delta_h: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const validationDrugs = {
    pyrene: { name: "Pyrene", logp: 5.19, hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 } },
    nile_red: { name: "Nile Red", logp: 4.0, hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 } },
    curcumin: { name: "Curcumin", logp: 3.29, hsp: { delta_d: 21.2, delta_p: 7.4, delta_h: 9.1 } },
    ibuprofen: { name: "Ibuprofen", logp: 3.97, hsp: { delta_d: 18.0, delta_p: 5.5, delta_h: 8.5 } },
  };

  const handleDrugSelect = (key) => {
    const drug = validationDrugs[key];
    setSelectedDrug(key);
    if (!drug) return;
    setDrugProps({
      logp: drug.logp,
      delta_d: drug.hsp.delta_d,
      delta_p: drug.hsp.delta_p,
      delta_h: drug.hsp.delta_h,
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    const API_URL = process.env.REACT_APP_API_URL || "https://your-render-app.onrender.com";

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_logp: drugProps.logp,
          drug_hsp: {
            delta_d: parseFloat(drugProps.delta_d),
            delta_p: parseFloat(drugProps.delta_p),
            delta_h: parseFloat(drugProps.delta_h),
          },
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      alert("Error connecting to backend");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header className="main-header">
        <h1 className="hero-title">Lipid Logic Explorer</h1>
        <p className="hero-subtitle">Rational NLC Design via Competitive Partitioning</p>
      </header>

      <div className="main-grid">
        {/* LEFT PANEL: INPUTS */}
        <div className="left-panel">
          <div className="card">
            <h3>Drug Properties</h3>
            <select value={selectedDrug} onChange={(e) => handleDrugSelect(e.target.value)}>
              <option value="">Select a Validation Drug</option>
              {Object.keys(validationDrugs).map(key => (
                <option key={key} value={key}>{validationDrugs[key].name}</option>
              ))}
            </select>
            
            <div className="input-group">
              <label>Log P</label>
              <input type="number" value={drugProps.logp} onChange={(e) => setDrugProps({...drugProps, logp: e.target.value})} />
            </div>

            <button className="predict-button" onClick={handlePredict} disabled={loading}>
              {loading ? "Analyzing..." : "Run CADFD Analysis"}
            </button>
          </div>

          {results && (
            <div className="card confidence-card">
              <h3>Model Confidence</h3>
              <div className="stars">
                {"★".repeat(results.metadata.stars)}{"☆".repeat(5 - results.metadata.stars)}
              </div>
              <p className="strategy-tag">{results.metadata.strategy}</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: RANKED RESULTS */}
        <div className="right-panel">
          {results ? (
            <div className="results-list">
              <h3 className="section-title">Ranked Formulations</h3>
              {results.results.map((formulation) => (
                <FormulationCard 
                  key={formulation.id} 
                  formulation={formulation} 
                  drugLogP={drugProps.logp} 
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a drug and run the analysis to see spatial distribution predictions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;