import React from 'react';

// Colour scheme per rank position
const RANK_STYLES = {
  1: { border: '#f59e0b', bg: '#fffbeb', badgeBg: '#f59e0b', barColor: '#f59e0b' }, // Gold
  2: { border: '#94a3b8', bg: '#f8fafc', badgeBg: '#94a3b8', barColor: '#94a3b8' }, // Silver
  3: { border: '#cd7c4a', bg: '#fff7f0', badgeBg: '#cd7c4a', barColor: '#cd7c4a' }, // Bronze
  4: { border: '#a5b4cc', bg: '#f8fafb', badgeBg: '#64748b', barColor: '#4a90b8' }, // Default
};

const FormulationCard = ({ formulation, rank, drugLogP }) => {
  const isCorePreferred = formulation.location === "Core";
  const styles = RANK_STYLES[rank] || RANK_STYLES[4];
  // Score is 0–1; convert to a 0–100 percentage for the bar
  const scorePercent = Math.round(formulation.score * 100);

  return (
    <div
      className="formulation-card"
      style={{ borderColor: styles.border, background: styles.bg }}
    >
      {/* ── Header row ─────────────────────────────────── */}
      <div className="fc-header">
        <div className="fc-title-group">
          <span className="rank-badge" style={{ background: styles.badgeBg }}>
            #{rank}
          </span>
          <h3 className="fc-name">{formulation.name}</h3>
        </div>
        <div className="score-badge" style={{ borderColor: styles.border }}>
          <span className="score-value">{formulation.score}</span>
          <span className="score-label">score</span>
        </div>
      </div>

      {/* ── Score bar ──────────────────────────────────── */}
      <div className="score-bar-container">
        <div className="score-bar-track">
          <div
            className="score-bar-fill"
            style={{ width: `${scorePercent}%`, background: styles.barColor }}
          />
        </div>
        <span className="score-percent">{scorePercent}%</span>
      </div>

      {/* ── Spatial visualisation ──────────────────────── */}
      <div className="spatial-viz">
        {/* Particle diagram */}
        <div className="particle-container">
          <div className="particle-shell">
            <div className="particle-core" />
            <div
              className={`drug-dot ${isCorePreferred ? 'drug-core' : 'drug-interface'}`}
              title="Predicted drug localisation"
            />
          </div>
          <div className="particle-legend">
            <div className="legend-row"><span className="legend-dot core-dot" /> Lipid Core</div>
            <div className="legend-row"><span className="legend-dot shell-dot" /> Shell</div>
            <div className="legend-row"><span className="legend-dot drug-dot-legend" /> Drug</div>
          </div>
        </div>

        {/* Labels */}
        <div className="spatial-info">
          <p><strong>Structure:</strong> {formulation.structure}</p>
          <p>
            <strong>Predicted Site:</strong>{' '}
            <span className={`location-tag ${isCorePreferred ? 'location-core' : 'location-interface'}`}>
              {formulation.location}
            </span>
          </p>
          {formulation.d_core != null && formulation.d_surf != null && (
            <div className="distance-table">
              <div className={`dist-row ${isCorePreferred ? 'dist-winner' : ''}`}>
                <span className="dist-label">Δδ to core</span>
                <span className="dist-value">{formulation.d_core} MPa½</span>
              </div>
              <div className={`dist-row ${!isCorePreferred ? 'dist-winner' : ''}`}>
                <span className="dist-label">Δδ to shell</span>
                <span className="dist-value">{formulation.d_surf} MPa½</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Experimental note ──────────────────────────── */}
      <p className="fc-note">"{formulation.note}"</p>
    </div>
  );
};

export default FormulationCard;
