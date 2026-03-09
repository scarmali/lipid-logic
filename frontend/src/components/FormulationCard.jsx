import React, { useState } from 'react';

// ── Helper: parse formulation name/structure into student-friendly descriptors ──
function parseDescriptor(name = "", structure = "") {
  // Chain length detection
  const chainMatch = name.match(/C(\d+)/i);
  const chainNum   = chainMatch ? parseInt(chainMatch[1]) : null;
  let chainLabel = "Solid lipid";
  let chainNote  = "";
  if (chainNum !== null) {
    if (chainNum <= 8)  { chainLabel = "Short-chain solid lipid";   chainNote = "Less ordered crystal structure — more flexible drug-trapping environment"; }
    else if (chainNum <= 10) { chainLabel = "Medium-chain solid lipid"; chainNote = "Moderately ordered structure — balanced encapsulation properties"; }
    else if (chainNum <= 14) { chainLabel = "Medium-long solid lipid"; chainNote = "More ordered matrix — stronger lipophilic pull toward the core"; }
    else                { chainLabel = "Long-chain solid lipid";    chainNote = "Highly crystalline core — strong lipophilic gradient and thermal stability"; }
  }

  // Surfactant detection
  let surfLabel = "Surfactant shell";
  let surfNote  = "";
  if (/PEG[\-\s]*100|PEG100/i.test(name)) {
    surfLabel = "PEG-based surfactant";
    surfNote  = "Highly hydrophilic shell — reduces protein adsorption, forms a dense steric barrier";
  } else if (/PS80|Polysorbate\s*80|Tween\s*80/i.test(name)) {
    surfLabel = "Polysorbate 80 surfactant";
    surfNote  = "Flexible amphiphilic shell — compatible with a wide range of lipophilicities";
  } else if (/lecithin/i.test(name)) {
    surfLabel = "Phospholipid surfactant";
    surfNote  = "Natural biomimetic shell — good biocompatibility and membrane-like character";
  }

  // NLC structure type
  let structLabel = "";
  let structNote  = "";
  if (/type\s*i\b/i.test(structure) || /imperfect\s*cryst/i.test(structure)) {
    structLabel = "Type I (Imperfect Crystal)";
    structNote  = "Ordered lipid lattice with nanoscale defects — these gaps create pockets where drug molecules can sit inside the core";
  } else if (/type\s*ii\b/i.test(structure) || /amorphous/i.test(structure)) {
    structLabel = "Type II (Amorphous)";
    structNote  = "Disordered lipid matrix — no organised crystal lattice, so the drug can distribute more freely between core and interface";
  }

  // Short summary label for the card header
  const shortLabel = chainNum
    ? `${chainNum <= 10 ? "Short" : chainNum <= 14 ? "Medium" : "Long"}-chain · ${
        /PEG/i.test(name) ? "PEG surfactant" :
        /PS80|Polysorbate/i.test(name) ? "Polysorbate surfactant" :
        surfLabel
      }`
    : `${structLabel || "NLC Formulation"}`;

  return { chainLabel, chainNote, surfLabel, surfNote, structLabel, structNote, shortLabel };
}

// ── Component ──────────────────────────────────────────────────────────────────
const FormulationCard = ({ formulation, rank }) => {
  const isCore = formulation.location === "Core";
  const [showExplainer, setShowExplainer] = useState(false);
  const [showDetails,   setShowDetails]   = useState(false);

  // Core affinity percentage from Hansen distances
  let corePercent = null;
  if (formulation.d_core != null && formulation.d_surf != null &&
      formulation.d_core > 0 && formulation.d_surf > 0) {
    const coreAff = 1 / formulation.d_core;
    const surfAff = 1 / formulation.d_surf;
    corePercent = Math.round((coreAff / (coreAff + surfAff)) * 100);
  }

  const locationImplication = isCore
    ? "Slower release · Better encapsulation stability"
    : "Faster release · Surfactant-driven distribution";

  const desc = parseDescriptor(formulation.name, formulation.structure);

  return (
    <div className={`formulation-card fc--${isCore ? "core" : "interface"}`}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="fc-header">
        <div className="fc-title-group">
          {rank && <span className="fc-rank-badge">#{rank}</span>}
          <div className="fc-title-text">
            <h3 className="fc-name">{desc.shortLabel}</h3>
            <p className="fc-name-secondary">
              {desc.structLabel && <span className="fc-struct-tag">{desc.structLabel}</span>}
            </p>
          </div>
        </div>
        <span className={`fc-location-badge ${isCore ? "badge-core" : "badge-interface"}`}>
          {isCore ? "Core" : "Interface"}
        </span>
      </div>

      {/* ── Location implication ───────────────────────────── */}
      <p className="fc-implication">
        {isCore ? "🔵" : "🟢"} {locationImplication}
      </p>

      {/* ── Preference bar ─────────────────────────────────── */}
      {corePercent !== null ? (
        <div className="fc-pref-section">
          <div className="fc-pref-bar-labels">
            <span className={isCore ? "pref-label-active" : "pref-label"}>
              Core {isCore && `${corePercent}%`}
            </span>
            <span className={!isCore ? "pref-label-active" : "pref-label"}>
              {!isCore && `${100 - corePercent}%`} Interface
            </span>
          </div>
          <div className="fc-pref-bar-track">
            <div className="fc-pref-bar-core"    style={{ width: `${corePercent}%` }} />
            <div className="fc-pref-bar-interface" style={{ width: `${100 - corePercent}%` }} />
          </div>
          <p className="fc-pref-note">
            {isCore
              ? `${corePercent}% core affinity — drug is drawn toward the lipid interior`
              : `${100 - corePercent}% interface affinity — drug distributes toward the surfactant shell`}
          </p>
        </div>
      ) : (
        <div className="fc-pref-section fc-pref-section--gradient">
          <p className="fc-pref-note fc-pref-note--gradient">
            {isCore
              ? "Core localisation predicted — driven by lipophilic gradient"
              : "Interface localisation predicted — driven by lipophilic gradient"}
          </p>
        </div>
      )}

      {/* ── Spatial diagram ─────────────────────────────────── */}
      <div className="spatial-viz">
        <div className="particle-container">
          <div className="particle-shell">
            <div className="particle-core" />
            <div
              className={`drug-dot ${isCore ? 'drug-core' : 'drug-interface'}`}
              title="Predicted drug localisation"
            />
          </div>
          <div className="particle-legend">
            <div className="legend-row"><span className="legend-dot core-dot" /> Lipid Core</div>
            <div className="legend-row"><span className="legend-dot shell-dot" /> Shell</div>
            <div className="legend-row"><span className="legend-dot drug-dot-legend" /> Drug</div>
          </div>
        </div>

        <div className="spatial-info">
          {/* Key properties summary */}
          <div className="fc-key-props">
            <div className="fc-key-prop">
              <span className="fkp-label">Core</span>
              <span className="fkp-value">{desc.chainLabel}</span>
            </div>
            <div className="fc-key-prop">
              <span className="fkp-label">Shell</span>
              <span className="fkp-value">{desc.surfLabel}</span>
            </div>
            {formulation.structure && (
              <div className="fc-key-prop">
                <span className="fkp-label">Matrix</span>
                <span className="fkp-value">{formulation.structure}</span>
              </div>
            )}
          </div>

          {/* Hansen distances — shown when available */}
          {formulation.d_core != null && formulation.d_surf != null && (
            <div className="distance-table">
              <div className={`dist-row ${isCore ? 'dist-winner' : ''}`}>
                <span className="dist-label">Δδ to core</span>
                <span className="dist-value">{formulation.d_core} MPa½</span>
              </div>
              <div className={`dist-row ${!isCore ? 'dist-winner' : ''}`}>
                <span className="dist-label">Δδ to shell</span>
                <span className="dist-value">{formulation.d_surf} MPa½</span>
              </div>
              <p className="dist-explainer">Lower Δδ = closer chemical match = stronger affinity</p>
            </div>
          )}
        </div>
      </div>

      {/* ── What does this mean? ────────────────────────────── */}
      <button
        className="fc-explainer-toggle"
        onClick={() => setShowExplainer(s => !s)}
        aria-expanded={showExplainer}
      >
        <span>{showExplainer ? "▲" : "▼"}</span>
        {showExplainer ? "Hide explanation" : "What does this mean?"}
      </button>

      {showExplainer && (
        <div className="fc-explainer">
          {/* Component descriptions */}
          <div className="fc-comp-summary">
            <div className="fc-comp-row">
              <span className="fc-comp-icon">🧊</span>
              <div>
                <strong>{desc.chainLabel}</strong>
                {desc.chainNote && <p>{desc.chainNote}</p>}
              </div>
            </div>
            <div className="fc-comp-row">
              <span className="fc-comp-icon">🫧</span>
              <div>
                <strong>{desc.surfLabel}</strong>
                {desc.surfNote && <p>{desc.surfNote}</p>}
              </div>
            </div>
            {desc.structNote && (
              <div className="fc-comp-row">
                <span className="fc-comp-icon">🔬</span>
                <div>
                  <strong>{desc.structLabel}</strong>
                  <p>{desc.structNote}</p>
                </div>
              </div>
            )}
          </div>

          {/* Core vs interface explanation */}
          <div className="fc-explainer-divider" />
          {isCore ? (
            <>
              <p>
                <strong>Core loading</strong> — your drug is predicted to sit inside
                the lipid core, surrounded by the solid–liquid lipid blend.
              </p>
              <ul className="fc-explainer-list">
                <li><span className="fcl-label">Release rate:</span> Typically <em>slower</em> — drug must diffuse through the lipid matrix before release.</li>
                <li><span className="fcl-label">Stability:</span> Often <em>higher</em> — protects the drug from oxidation, hydrolysis, and leaching.</li>
                <li><span className="fcl-label">Loading efficiency:</span> Generally <em>good</em> for lipophilic drugs — chemically compatible environment.</li>
              </ul>
              <p className="fc-explainer-note">
                💡 Core loading is typical for drugs with Log P &gt; 3, where the lipophilic gradient drives partitioning into the lipid interior.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Interface loading</strong> — your drug is predicted to sit at
                the surfactant corona, the amphiphilic shell that coats the particle.
              </p>
              <ul className="fc-explainer-list">
                <li><span className="fcl-label">Release rate:</span> Typically <em>faster</em> — surface-associated drugs are more accessible to the surrounding medium.</li>
                <li><span className="fcl-label">Stability:</span> Can be <em>lower</em> — surface drugs may leach more readily during storage.</li>
                <li><span className="fcl-label">Mechanism:</span> The surfactant's amphiphilic chemistry is a closer chemical match than the pure lipid core for this drug.</li>
              </ul>
              <p className="fc-explainer-note">
                💡 Interface loading is common for drugs with Log P 1–3, where the surfactant shell competes with the core for the drug.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Formulation details (collapsible) ─────────────── */}
      <button
        className="fc-details-toggle"
        onClick={() => setShowDetails(s => !s)}
        aria-expanded={showDetails}
      >
        <span>{showDetails ? "▲" : "▼"}</span>
        {showDetails ? "Hide formulation details" : "View formulation details"}
      </button>

      {showDetails && (
        <div className="fc-details">
          <div className="fc-details-row">
            <span className="fd-label">ID</span>
            <span className="fd-value">{formulation.id}</span>
          </div>
          <div className="fc-details-row">
            <span className="fd-label">Name</span>
            <span className="fd-value">{formulation.name}</span>
          </div>
          <div className="fc-details-row">
            <span className="fd-label">Structure</span>
            <span className="fd-value">{formulation.structure}</span>
          </div>
          <div className="fc-details-row fd-note-row">
            <span className="fd-label">Note</span>
            <span className="fd-value fd-note">"{formulation.note}"</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default FormulationCard;
