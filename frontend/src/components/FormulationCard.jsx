import React from 'react';

const FormulationCard = ({ formulation }) => {
  const isCore = formulation.location === "Core";

  // Build a core-affinity percentage from Hansen distances when available.
  // Affinity is inversely proportional to distance — closer = stronger pull.
  let corePercent = null;
  if (formulation.d_core != null && formulation.d_surf != null &&
      formulation.d_core > 0 && formulation.d_surf > 0) {
    const coreAff = 1 / formulation.d_core;
    const surfAff = 1 / formulation.d_surf;
    corePercent = Math.round((coreAff / (coreAff + surfAff)) * 100);
  }

  return (
    <div className={`formulation-card fc--${isCore ? "core" : "interface"}`}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="fc-header">
        <div className="fc-title-group">
          <span className="fc-id-badge">{formulation.id}</span>
          <h3 className="fc-name">{formulation.name}</h3>
        </div>
        <span className={`fc-location-badge ${isCore ? "badge-core" : "badge-interface"}`}>
          {isCore ? "Core" : "Interface"}
        </span>
      </div>

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
            </div>
          )}
        </div>
      </div>

      {/* ── Experimental note ──────────────────────────────── */}
      <p className="fc-note">"{formulation.note}"</p>

    </div>
  );
};

export default FormulationCard;
