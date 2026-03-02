import React, { useState } from "react";

const hypotheses = [
  {
    id: "H1",
    label: "H1 — Lipophilic Gradient Theory",
    icon: "⟶",
    colour: "#3b82f6",
    summary:
      "The difference in Log P between the lipid core and the surfactant shell creates a thermodynamic driving force that directs lipophilic drugs toward the phase with the higher affinity.",
    detail:
      "When the core Log P exceeds the surfactant Log P by more than 1 unit, the resulting gradient strongly favours core sequestration. This hypothesis dominates the prediction for highly lipophilic compounds (Log P > 5), where bulk thermodynamic partitioning is the primary driver of encapsulation.",
    dominatesAt: "Log P > 5  ·  weight = 0.50",
  },
  {
    id: "H2",
    label: "H2 — HSP Core Compatibility",
    icon: "⬡",
    colour: "#8b5cf6",
    summary:
      "Hansen Solubility Parameters (HSP) quantify the chemical compatibility between a drug and each NLC compartment. Drugs preferentially localise in the phase whose HSP vector is closest to their own.",
    detail:
      "The Hansen distance (Δδ) is calculated as √[(δd₁−δd₂)² + (δp₁−δp₂)² + (δh₁−δh₂)²]. A smaller distance to the core indicates stronger thermodynamic compatibility and predicts core loading. This hypothesis is co-dominant with H1 for strongly lipophilic drugs.",
    dominatesAt: "Log P > 5  ·  weight = 0.40",
  },
  {
    id: "H3",
    label: "H3 — Competitive Partitioning Theory",
    icon: "⇌",
    colour: "#10b981",
    summary:
      "At intermediate lipophilicities, the surfactant shell becomes a genuine competitor for drug sequestration. The drug distributes between core and shell according to the relative HSP compatibility of both phases.",
    detail:
      "For moderately lipophilic drugs (Log P 3–5), the surfactant forms a thick, disordered corona that is chemically distinct from the lipid core. Because both phases have similar Log P, the HSP distance to each phase becomes the deciding factor. Competitive partitioning is the dominant mechanism for this lipophilicity window.",
    dominatesAt: "Log P 3–5  ·  weight = 0.70",
  },
];

const validationData = [
  {
    probe: "Pyrene",
    logp: 5.19,
    best: "F4 (C10-PEG100)",
    site: "Core",
    siteClass: "site-core",
    metric: "I₁/I₃ = 0.785",
    evidence:
      "Pyrene's vibronic band ratio (I₁/I₃) reports on local polarity. A ratio of 0.785 indicates a highly apolar environment consistent with deep core encapsulation inside the crystalline C10 lipid matrix.",
    icon: "🔷",
  },
  {
    probe: "Nile Red",
    logp: 4.0,
    best: "F2 (C10-PS80)",
    site: "Interface",
    siteClass: "site-interface",
    metric: "λmax = 628.7 nm",
    evidence:
      "Nile Red is solvatochromic — its emission maximum red-shifts in polar environments. A λmax of 628.7 nm corresponds to the moderately polar amphiphilic interface between the lipid core and the Polysorbate 80 corona, confirming interfacial localisation.",
    icon: "🔴",
  },
];

export default function AboutPage() {
  const [openHyp, setOpenHyp] = useState(null);

  return (
    <div className="about-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-badge">CADFD</span>
          <h1 className="about-hero-title">
            Computer-Assisted Drug<br />Formulation Design
          </h1>
          <p className="about-hero-sub">
            A mechanistic prediction engine for drug localisation in
            Nanostructured Lipid Carriers — built on three competing
            physicochemical hypotheses and validated with fluorescent probes.
          </p>
        </div>
      </section>

      {/* ── What are NLCs? ────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-text-block">
            <h2 className="about-section-title">What are Nanostructured Lipid Carriers?</h2>
            <p>
              Nanostructured Lipid Carriers (NLCs) are second-generation solid
              lipid nanoparticles composed of a blend of solid and liquid lipids,
              stabilised by a surfactant corona. The structural disorder introduced
              by the liquid lipid fraction creates nanoscale imperfections within the
              crystalline matrix, which generate additional space to accommodate drug
              molecules and dramatically reduce drug expulsion on storage — a key
              limitation of first-generation solid lipid nanoparticles (SLNs).
            </p>
            <p>
              NLCs offer several advantages over conventional formulation approaches:
              high encapsulation efficiency for lipophilic molecules, protection of
              labile actives from enzymatic degradation, tunable release kinetics, and
              biocompatibility with physiologically relevant lipid excipients. They are
              particularly promising for dermal, oral, and parenteral delivery of
              poorly water-soluble drugs.
            </p>
            <p>
              Despite these advantages, rational selection of an NLC formulation for a
              specific drug has historically relied on trial-and-error screening.
              CADFD addresses this gap by providing a quantitative, hypothesis-driven
              prediction of drug–carrier compatibility before any experimental work begins.
            </p>
          </div>

          <div className="about-nlc-diagram">
            <div className="nlc-particle">
              <div className="nlc-core">
                <span className="nlc-core-label">Lipid Core</span>
              </div>
              <div className="nlc-shell-label">Surfactant Shell</div>
            </div>
            <div className="nlc-legend">
              <div className="nlc-legend-row"><span className="nlc-dot nlc-dot-core"></span>Solid + liquid lipid blend</div>
              <div className="nlc-legend-row"><span className="nlc-dot nlc-dot-shell"></span>Amphiphilic surfactant corona</div>
              <div className="nlc-legend-row"><span className="nlc-dot nlc-dot-drug"></span>Drug (localisation predicted)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The three hypotheses ──────────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            The Three Hypotheses
          </h2>
          <p className="about-section-intro">
            CADFD integrates three independent physicochemical hypotheses.
            Their relative contributions are dynamically weighted based on
            the drug's lipophilicity, reflecting which mechanism dominates
            at each point on the Log&nbsp;P spectrum.
          </p>

          <div className="hyp-grid">
            {hypotheses.map((h) => (
              <div
                key={h.id}
                className={`hyp-card ${openHyp === h.id ? "hyp-card--open" : ""}`}
                style={{ "--hyp-colour": h.colour }}
                onClick={() => setOpenHyp(openHyp === h.id ? null : h.id)}
              >
                <div className="hyp-card-header">
                  <span className="hyp-icon" style={{ color: h.colour }}>{h.icon}</span>
                  <div className="hyp-title-group">
                    <span className="hyp-id" style={{ background: h.colour }}>{h.id}</span>
                    <h3 className="hyp-title">{h.label.replace(h.id + " — ", "")}</h3>
                  </div>
                  <span className="hyp-chevron">{openHyp === h.id ? "▲" : "▼"}</span>
                </div>
                <p className="hyp-summary">{h.summary}</p>
                {openHyp === h.id && (
                  <div className="hyp-detail">
                    <p>{h.detail}</p>
                    <span className="hyp-dominates">{h.dominatesAt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Weighting diagram */}
          <div className="weight-diagram">
            <h3 className="weight-diagram-title">Dynamic Weighting Across Log P</h3>
            <div className="weight-scale">
              <div className="weight-zone weight-zone--1">
                <div className="weight-zone-label">Log P &lt; 2</div>
                <div className="weight-bars">
                  <div className="weight-bar" style={{ height: "0%",  background: "#3b82f6" }}></div>
                  <div className="weight-bar" style={{ height: "0%",  background: "#8b5cf6" }}></div>
                  <div className="weight-bar" style={{ height: "100%", background: "#10b981" }}></div>
                </div>
                <div className="weight-zone-note">Too hydrophilic for NLC</div>
              </div>
              <div className="weight-zone weight-zone--2">
                <div className="weight-zone-label">Log P 2–3</div>
                <div className="weight-bars">
                  <div className="weight-bar" style={{ height: "60%", background: "#3b82f6" }}></div>
                  <div className="weight-bar" style={{ height: "20%", background: "#8b5cf6" }}></div>
                  <div className="weight-bar" style={{ height: "20%", background: "#10b981" }}></div>
                </div>
                <div className="weight-zone-note">H1 dominates</div>
              </div>
              <div className="weight-zone weight-zone--3">
                <div className="weight-zone-label">Log P 3–5</div>
                <div className="weight-bars">
                  <div className="weight-bar" style={{ height: "20%", background: "#3b82f6" }}></div>
                  <div className="weight-bar" style={{ height: "10%", background: "#8b5cf6" }}></div>
                  <div className="weight-bar" style={{ height: "70%", background: "#10b981" }}></div>
                </div>
                <div className="weight-zone-note">H3 dominates</div>
              </div>
              <div className="weight-zone weight-zone--4">
                <div className="weight-zone-label">Log P &gt; 5</div>
                <div className="weight-bars">
                  <div className="weight-bar" style={{ height: "50%", background: "#3b82f6" }}></div>
                  <div className="weight-bar" style={{ height: "40%", background: "#8b5cf6" }}></div>
                  <div className="weight-bar" style={{ height: "10%", background: "#10b981" }}></div>
                </div>
                <div className="weight-zone-note">H1 + H2 dominate</div>
              </div>
            </div>
            <div className="weight-legend">
              <span style={{ color: "#3b82f6" }}>■ H1 Gradient</span>
              <span style={{ color: "#8b5cf6" }}>■ H2 HSP Core</span>
              <span style={{ color: "#10b981" }}>■ H3 Partitioning</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Experimental validation ───────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            Experimental Validation
          </h2>
          <p className="about-section-intro">
            Two fluorescent probes with well-characterised environment-sensitive
            spectroscopic signatures were used to empirically confirm drug
            localisation across four NLC formulations (F1–F4).
          </p>

          <div className="val-grid">
            {validationData.map((v) => (
              <div key={v.probe} className="val-card">
                <div className="val-header">
                  <span className="val-icon">{v.icon}</span>
                  <div>
                    <h3 className="val-probe">{v.probe}</h3>
                    <p className="val-logp">Log P = {v.logp}</p>
                  </div>
                  <span className={`val-site-badge ${v.siteClass}`}>{v.site}</span>
                </div>
                <div className="val-best-formulation">
                  <span className="val-best-label">Best formulation</span>
                  <strong>{v.best}</strong>
                </div>
                <div className="val-metric">{v.metric}</div>
                <p className="val-evidence">{v.evidence}</p>
              </div>
            ))}
          </div>

          <div className="val-note">
            <span className="val-note-icon">🔬</span>
            <p>
              Fluorescence measurements were conducted using established
              solvatochromic probe methods. Pyrene's vibronic band ratio (I₁/I₃)
              and Nile Red's emission maximum (λmax) were measured across all four
              formulations to map the local microenvironment experienced by each
              probe molecule, providing direct evidence of its encapsulation site.
            </p>
          </div>
        </div>
      </section>

      {/* ── How to use ────────────────────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">How to Use This Tool</h2>
          <div className="howto-grid">
            <div className="howto-step">
              <div className="howto-num">1</div>
              <h4>Calculate Log P</h4>
              <p>Compute the octanol–water partition coefficient for your drug using tools such as ALOGPS, ChemDraw, or the Moriguchi method. Log P is the primary input and the minimum required for an analysis.</p>
            </div>
            <div className="howto-step">
              <div className="howto-num">2</div>
              <h4>Calculate HSP (optional)</h4>
              <p>Use a group-contribution method (e.g., Hoy's method) to calculate the three Hansen Solubility Parameters: δd (dispersive), δp (polar), and δh (hydrogen bonding) in units of MPa½. Providing HSP activates the full three-hypothesis model.</p>
            </div>
            <div className="howto-step">
              <div className="howto-num">3</div>
              <h4>Run Analysis</h4>
              <p>Select a validation drug or enter your custom values and click "Run CADFD Analysis". The engine applies dynamic weighting across the three hypotheses and scores all formulations in the database.</p>
            </div>
            <div className="howto-step">
              <div className="howto-num">4</div>
              <h4>Interpret Results</h4>
              <p>Ranked formulation cards show the compatibility score, predicted localisation site (Core or Interface), and Hansen distances to each compartment. Higher-ranked formulations are prioritised for experimental evaluation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="about-footer">
        <p>Lipid Logic Explorer · CADFD Research Tool · Built for rational NLC formulation screening</p>
      </footer>

    </div>
  );
}
