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

  const StarRating = ({ stars }) => (
    <div style={{ fontSize: "18px", color: "#2FA4A9" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= stars ? 1 : 0.2 }}>
          ★
        </span>
      ))}
    </div>
  );

  const Card = ({ children, highlight }) => (
    <div
      style={{
        background: "#FFFFFF",
        padding: "24px",
        borderRadius: "16px",
        marginBottom: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        borderLeft: highlight ? "6px solid #2FA4A9" : "none",
      }}
    >
      {children}
    </div>
  );

  if (mode === "welcome") {
    return (
      <div className="container">
        <h1>🧬 LipidLogic</h1>
        <p className="subtitle">
          Rational NLC Design Through Computational Prediction
        </p>

        <Card>
          <p>
            Learn to design optimal nanostructured lipid carrier (NLC)
            formulations using computational predictions validated by
            experimental data.
          </p>
          <button className="button" onClick={() => setMode("sandbox")}>
            Enter Sandbox Mode
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="button" onClick={() => setMode("welcome")}>
        ← Back
      </button>

      <h1>LipidLogic Sandbox</h1>
      <p className="subtitle">
        Explore computational predictions for NLC formulation design.
      </p>

      <Card>
        <h2>1. Drug Properties</h2>

        <label>Select a drug</label>
        <select
          value={selectedDrug}
          onChange={(e) => handleDrugSelect(e.target.value)}
        >
          <option value="">-- Select drug --</option>
          <option value="pyrene">Pyrene</option>
          <option value="nile_red">Nile Red</option>
          <option value="curcumin">Curcumin</option>
          <option value="ibuprofen">Ibuprofen</option>
        </select>

        <label>log P</label>
        <input
          type="number"
          value={drugProps.logp}
          onChange={(e) =>
            setDrugProps({ ...drugProps, logp: e.target.value })
          }
        />

        <label>δD</label>
        <input
          type="number"
          value={drugProps.delta_d}
          onChange={(e) =>
            setDrugProps({ ...drugProps, delta_d: e.target.value })
          }
        />

        <label>δP</label>
        <input
          type="number"
          value={drugProps.delta_p}
          onChange={(e) =>
            setDrugProps({ ...drugProps, delta_p: e.target.value })
          }
        />

        <label>δH</label>
        <input
          type="number"
          value={drugProps.delta_h}
          onChange={(e) =>
            setDrugProps({ ...drugProps, delta_h: e.target.value })
          }
        />

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
          style={{ marginTop: "15px", width: "100%" }}
        >
          {loading ? "Calculating..." : "🔮 Predict Formulation"}
        </button>
      </Card>

      {results && (
        <>
          <Card highlight>
            <h2>🎯 Recommended Formulation</h2>
            <h3>{results.recommendation.formulation_name}</h3>
            <StarRating stars={results.recommendation.stars} />
            <p>
              Confidence:{" "}
              {results.recommendation.confidence_score.toFixed(2)}
            </p>
            <p>
              <strong>{results.recommendation.guidance}</strong>
              <br />
              {results.recommendation.strategy}
            </p>
          </Card>

          <Card>
            <h2>📊 Ranking</h2>
            {results.recommendation.ranking.map((item, index) => (
              <div
                key={item.formulation_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>
                  #{index + 1} {item.formulation_name}
                </span>
                <span>{item.weighted_score.toFixed(2)}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

export default App;