import React, { useState } from "react";
import "./App.css";

function App() {
  const [mode, setMode] = useState("welcome");
  const [drugProps, setDrugProps] = useState({
    logp: "",
    delta_d: "",
    delta_p: "",
    delta_h: "",
  });
  const [selectedDrug, setSelectedDrug] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const validationDrugs = {
    pyrene: {
      logp: 5.19,
      hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 },
    },
    nile_red: {
      logp: 4.0,
      hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 },
    },
    curcumin: {
      logp: 3.29,
      hsp: { delta_d: 21.2, delta_p: 7.4, delta_h: 9.1 },
    },
    ibuprofen: {
      logp: 3.97,
      hsp: { delta_d: 18.0, delta_p: 5.5, delta_h: 8.5 },
    },
  };

  const handleDrugSelect = (drugKey) => {
    const drug = validationDrugs[drugKey];
    setSelectedDrug(drugKey);
    if (!drug) return;

    setDrugProps({
      logp: drug.logp.toString(),
      delta_d: drug.hsp.delta_d.toString(),
      delta_p: drug.hsp.delta_p.toString(),
      delta_h: drug.hsp.delta_h.toString(),
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    const API_URL =
      process.env.REACT_APP_API_URL || "http://localhost:5000";

    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_logp: parseFloat(drugProps.logp),
          drug_hsp: {
            delta_d: parseFloat(drugProps.delta_d),
            delta_p: parseFloat(drugProps.delta_p),
            delta_h: parseFloat(drugProps.delta_h),
          },
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert("Error connecting to server.");
    }

    setLoading(false);
  };

  /* ---------- UI COMPONENTS ---------- */

  const Card = ({ children, highlight }) => (
    <div className={`card ${highlight ? "card-highlight" : ""}`}>
      {children}
    </div>
  );

  const renderInputs = () => (
    <>
      <Card>
        <h3>Drug</h3>

        <select
          value={selectedDrug}
          onChange={(e) => handleDrugSelect(e.target.value)}
        >
          <option value="">Select drug</option>
          <option value="pyrene">Pyrene</option>
          <option value="nile_red">Nile Red</option>
          <option value="curcumin">Curcumin</option>
          <option value="ibuprofen">Ibuprofen</option>
        </select>

        <p style={{ marginTop: "10px" }}>
          logP: <strong>{drugProps.logp || "—"}</strong>
        </p>
      </Card>

      <Card>
        <h3>Formulation</h3>

        <div className="formulation-grid">
          {["F1", "F2", "F3", "F4"].map((f) => (
            <div key={f} className="formulation-tile">
              {f}
            </div>
          ))}
        </div>
      </Card>

      <button
        className="button"
        onClick={handlePredict}
        disabled={
          !drugProps.logp ||
          !drugProps.delta_d ||
          !drugProps.delta_p ||
          !drugProps.delta_h ||
          loading
        }
      >
        {loading ? "Calculating..." : "🔮 Predict"}
      </button>
    </>
  );

  const renderOutputs = () => {
    const score = results?.recommendation?.confidence_score || 0.5;

    return (
      <>
        <Card highlight>
          <h3>Predicted Localisation</h3>

          <div className="gauge">
            <div
              className="gauge-dot"
              style={{ left: `${score * 100}%` }}
            />
          </div>

          <p style={{ marginTop: "10px" }}>
            {score > 0.6
              ? "Core-favoured"
              : score < 0.4
              ? "Interface-favoured"
              : "Mixed localisation"}
          </p>
        </Card>

        <Card>
          <p>
            This reflects how the drug partitions between lipid core and
            interfacial regions based on its properties.
          </p>
        </Card>
      </>
    );
  };

  /* ---------- SCREENS ---------- */

  if (mode === "welcome") {
    return (
      <div className="app-container">
        <div className="main-header">
          <div className="hero-content">
            <h1 className="hero-title">🧬 LipidLogic</h1>
            <p className="hero-subtitle">
              Rational NLC Design Through Computational Prediction
            </p>
          </div>
        </div>

        <div className="card">
          <p>
            Explore how drugs distribute within lipid nanoparticles using
            computational prediction.
          </p>
          <button className="button" onClick={() => setMode("sandbox")}>
            Enter Sandbox Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HERO HEADER */}
      <div className="main-header">
        <div className="hero-content">

          <button className="button" onClick={() => setMode("welcome")}>
            ← Back
          </button>

          <h1 className="hero-title">
            Lipid Logic – Drug Distribution Explorer
          </h1>

          <p className="hero-subtitle">
            Where does your drug want to live?
          </p>

        </div>
      </div>

      {/* MAIN APP */}
      <div className="app-container">
        <div className="main-grid">

          <div className="left-panel">
            {renderInputs()}
          </div>

          <div className="right-panel">
            {results && renderOutputs()}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;