import React, { useState } from 'react';

const FormulationCard = ({ formulation, rank }) => {
  const isCore = formulation.location === "Core";
  const [showExplainer, setShowExplainer] = useState(false);

  // Build a core-affinity percentage from Hansen distances when available.
  // Affinity is inversely proportional to distance — closer = stronger pull.
  let corePercent = null;
  if (formulation.d_core != null && formulation.d_surf != null &&
      formulation.d_core > 0 && formulation.d_surf > 0) {
    const coreAff = 1 / formulation.d_core;
    const surfAff = 1 / formulation.d_surf;
    corePercent = Math.round((coreAff / (coreAff + surfAff)) * 100);
  }

  const locationText = isCore ? "Core" : "Interface";
  const locationImplication = isCore
    ? "Slower release · Better encapsulation stability"
    : "Faster release · Surfactant-driven distribution";

  return (
    <div className={`formulation-card fc--${isCore ? "core" : "interface"}`}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="fc-header">
        <div className="fc-title-group">
          {rank && <span className="fc-rank-badge">#{rank}</span>}
          <span className="fc-id-badge">{formulation.id}</span>
          <h3 className="fc-name">{formulation.name}</h3>
        </div>
        <span className={`fc-location-badge ${isCore ? "badge-core" : "badge-interface"}`}>
          {locationText}
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
            <div
              className="fc-pref-bar-core"
              style={{ width: `${corePercent}%` }}
            />
            <div
              className="fc-pref-bar-interface"
              style={{ width: `${100 - corePercent}%` }}
            />
          </div>
          <p className="fc-pref-note">
            {isCore
              ? `${corePercent}% core affinity — drug pulls toward the lipid interior`
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

      {/* ── Spatial diagram + detail ────────────────────────── */}
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
          <p><strong>Structure:</strong> {formulation.structure}</p>
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
              <p className="dist-explainer">
                Lower Δδ = closer chemical match = stronger affinity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── What does this mean? collapsible ───────────────── */}
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
          {isCore ? (
            <>
              <p>
                <strong>Core loading</strong> means your drug is predicted to sit inside
                the <strong>lipid core</strong> of the NLC particle — surrounded by the
                solid and liquid lipid blend rather than the surfactant shell.
              </p>
              <ul className="fc-explainer-list">
                <li>
                  <span className="fcl-label">Release rate:</span> Typically <em>slower</em> —
                  the drug must diffuse through the crystalline lipid matrix before it can be released.
                </li>
                <li>
                  <span className="fcl-label">Stability:</span> Often <em>higher</em> —
                  core encapsulation protects the drug from oxidation, hydrolysis, and leaching.
                </li>
                <li>
                  <span className="fcl-label">Loading efficiency:</span> Generally <em>good</em> for
                  highly lipophilic drugs — the lipid environment is chemically compatible.
                </li>
              </ul>
              <p className="fc-explainer-note">
                💡 This is the typical site for drugs with Log P &gt; 3 where the lipophilic
                gradient drives partitioning away from the aqueous phase and into the lipid interior.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Interface loading</strong> means your drug is predicted to sit at
                the <strong>surfactant corona</strong> — the amphiphilic shell that coats the
                outside of the NLC particle.
              </p>
              <ul className="fc-explainer-list">
                <li>
                  <span className="fcl-label">Release rate:</span> Typically <em>faster</em> —
                  drug molecules at the surface are more directly accessible to the surrounding medium.
                </li>
                <li>
                  <span className="fcl-label">Stability:</span> Can be <em>lower</em> —
                  surface-associated drugs may leach more readily during storage.
                </li>
                <li>
                  <span className="fcl-label">Mechanism:</span> The surfactant's <em>amphiphilic
                  chemistry</em> (part polar, part non-polar) is a closer chemical match than the
                  pure lipid core for moderately lipophilic drugs.
                </li>
              </ul>
              <p className="fc-explainer-note">
                💡 Interface loading is common for drugs with Log P 1–3, where competitive
                partitioning between core and surfactant determines the preferred site.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Experimental note ──────────────────────────────── */}
      <p className="fc-note">"{formulation.note}"</p>

    </div>
  );
};

export default FormulationCard;
