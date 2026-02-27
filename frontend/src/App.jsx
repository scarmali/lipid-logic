import React, { useState } from "react";
import "./App.css";

function App() {
  const [selectedDrug, setSelectedDrug] = useState("");
  const [drugProps, setDrugProps] = useState({
    logp: "",
    delta_d: "",
    delta_p: "",
    delta_h: "",
  });

  const [selectedFormulation, setSelectedFormulation] = useState("F1");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const validationDrugs = {
    pyrene: {
      name: "Pyrene",
      logp: 5.19,
      hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 },
    },
    nile_red: {
      name: "Nile Red",
      logp: 4.0,
      hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 },
    },
    curcumin: {
      name: "Curcumin",
      logp: 3.29,
      hsp: { delta_d: 21.2, delta_p: 7.4, delta_h: 9.1 },
    },
    ibuprofen: {
      name: "Ibuprofen",
      logp: 3.97,
      hsp: { delta_d: 18.0, delta_p: 5.5, delta_h: 8.5 },
    },
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

    const API_URL =
      process.env.REACT_APP_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_logp: drugProps.logp,
          drug_hsp: {
            delta_d: drugProps.delta_d,
            delta_p: drugProps.delta_p,
            delta_h: drugProps.delta_h,
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

  const Card = ({ children }) => (
    <div className="card">{children}</div>
  );

  // 🔥 Extract H3 (THIS is the key change)
  const getH3 = () => {
    if (!results) return null;
    return results.results[selectedFormulation]?.h3;
  };

  const h3 = getH3();

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="main-header">
        <h1 className="hero-title">
          Lipid Logic – Drug Distribution Explorer
        </h1>
        <p className="hero-subtitle">
          Where does your drug want to live?
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* LEFT PANEL */}
        <div className="left-panel">

          {/* DRUG */}
          <Card>
            <h3>Choose a drug</h3>

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

            <p>logP: <strong>{drugProps.logp || "—"}</strong></p>
          </Card>

          {/* FORMULATIONS */}
          <Card>
            <h3>Select formulation</h3>

            <div className="formulation-grid">
              {["F1", "F2", "F3", "F4"].map((f) => (
                <div
                  key={f}
                  className={`formulation-tile ${
                    selectedFormulation === f ? "active" : ""
                  }`}
                  onClick={() => setSelectedFormulation(f)}
                >
                  {f}
                </div>
              ))}
            </div>
          </Card>

          {/* PREDICT */}
          <button
            className="button"
            onClick={handlePredict}
            disabled={!drugProps.logp || loading}
          >
            {loading ? "Calculating..." : "Predict"}
          </button>

        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          {h3 && (
            <>
              {/* GAUGE */}
              <Card>
                <h3>Predicted localisation</h3>

                <div className="gauge">
                  <div
                    className="gauge-dot"
                    style={{ left: `${h3.core_percent}%` }}
                  />
                </div>

                <p>
                  {h3.preferred_location === "core"
                    ? "Core-favoured"
                    : "Interface-favoured"}
                </p>
              </Card>

              {/* EXPLANATION */}
              <Card>
                <p>
                  This drug is predicted to localise in the{" "}
                  <strong>{h3.preferred_location}</strong> because it has
                  better compatibility with that region.
                </p>

                <p style={{ fontSize: "0.9em", opacity: 0.7 }}>
                  Δδ core: {h3.delta_core} | Δδ surf: {h3.delta_surf}
                </p>
              </Card>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;