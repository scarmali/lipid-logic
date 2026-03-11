import React, { useState } from "react";

const hypotheses = [
  {
    id: "H1",
    icon: "⟶",
    colour: "#3b82f6",
    title: "Lipophilicity gradient",
    tagline: "Like dissolves like — at scale",
    summary:
      "The difference in oil-affinity between the lipid core and the surfactant layer creates a natural driving force. Highly oil-loving drugs are pulled toward the core, much like how oil and water separate spontaneously.",
    whenDominant: "Most influential for strongly lipophilic drugs",
  },
  {
    id: "H2",
    icon: "⬡",
    colour: "#8b5cf6",
    title: "Chemical compatibility",
    tagline: "A precise measure of chemical fit",
    summary:
      "Hansen Solubility Parameters break down a molecule's chemistry into three components — how it disperses, polarises, and hydrogen-bonds. Drugs migrate to whichever compartment is the closest chemical match.",
    whenDominant: "Co-dominant with H1 for highly lipophilic drugs",
  },
  {
    id: "H3",
    icon: "⇌",
    colour: "#10b981",
    title: "Competitive partitioning",
    tagline: "The surfactant shell as a rival",
    summary:
      "At moderate lipophilicities the surfactant corona becomes a genuine competitor for the drug. Both the core and the shell are chemically attractive, so the drug distributes between them based on relative compatibility.",
    whenDominant: "Dominant for moderately lipophilic drugs",
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
          <p className="about-hero-sub">
            A computational model for predicting drug localisation in
            nanostructured lipid carriers.
          </p>
        </div>
      </section>

      {/* ── What are NLCs? ────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-text-block">
            <h2 className="about-section-title">What are Nanostructured Lipid Carriers?</h2>
            <p>
              Nanostructured Lipid Carriers (NLCs) are lipid nanoparticles
              designed to encapsulate hydrophobic drugs. They consist of a
              solid–liquid lipid matrix surrounded by a surfactant shell.
            </p>
            <p>
              Drug localisation within this structure strongly influences
              stability, encapsulation efficiency, and release kinetics.
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
              <div className="nlc-legend-row">
                <span className="nlc-dot nlc-dot-core"></span>Solid + liquid lipid blend
              </div>
              <div className="nlc-legend-row">
                <span className="nlc-dot nlc-dot-shell"></span>Amphiphilic surfactant corona
              </div>
              <div className="nlc-legend-row">
                <span className="nlc-dot nlc-dot-drug"></span>Drug (localisation predicted)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why localisation matters ──────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            Why Does Localisation Matter?
          </h2>
          <p className="about-section-intro">
            Drug localisation inside an NLC strongly influences its performance.
          </p>
          <div className="why-grid">
            <div className="why-card">
              <span className="why-icon">🎯</span>
              <h4>Encapsulation efficiency</h4>
              <p>A drug in the right compartment stays encapsulated. In the wrong one it leaches out quickly, reducing the dose that reaches the target.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">⏱</span>
              <h4>Release kinetics</h4>
              <p>Core-loaded drugs release slowly through the crystalline matrix. Interface-loaded drugs release faster as the corona disperses. Knowing the site lets you engineer the profile.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">🧪</span>
              <h4>Formulation screening</h4>
              <p>Rather than testing every lipid–surfactant combination experimentally, CADFD scores formulations in seconds — so you start experiments with the best candidates.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">🔬</span>
              <h4>Mechanistic understanding</h4>
              <p>Predictions are backed by three physicochemical hypotheses, not a black box. You can see why a formulation was ranked and build on that understanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The science behind the model ──────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            The Science Behind the Model
          </h2>
          <p className="about-section-intro">
            The model combines three physicochemical principles that govern
            drug distribution in lipid nanoparticles.
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
                    <div>
                      <h3 className="hyp-title">{h.title}</h3>
                      <p className="hyp-tagline">{h.tagline}</p>
                    </div>
                  </div>
                  <span className="hyp-chevron">{openHyp === h.id ? "▲" : "▼"}</span>
                </div>
                {openHyp === h.id && (
                  <div className="hyp-detail">
                    <p>{h.summary}</p>
                    <span className="hyp-dominates">{h.whenDominant}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hyp-footer-note">
            <span>💡</span>
            <p>
              The three hypotheses are combined into a single score. Their
              relative weight shifts automatically based on the drug's
              lipophilicity — so the most relevant mechanism always has the
              greatest influence on the result.
            </p>
          </div>
        </div>
      </section>

      {/* ── Links to deeper science ───────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            Learn More
          </h2>
          <p className="about-section-intro">
            Explore the validation data, methodology, and research behind this tool.
          </p>
          <div className="learn-grid">
            <button className="learn-card learn-card--btn">
              <span className="learn-icon">📊</span>
              <div className="learn-body">
                <h4>Validation Data</h4>
                <p>See how predictions compare against experimental localisation data from published NLC studies.</p>
              </div>
              <span className="learn-arrow">→</span>
            </button>
            <a className="learn-card" href="https://sheiliza.com" target="_blank" rel="noopener noreferrer">
              <span className="learn-icon">🔬</span>
              <div className="learn-body">
                <h4>Research Group</h4>
                <p>Read about the research and projects behind CADFD at our group webpage.</p>
              </div>
              <span className="learn-arrow">→</span>
            </a>
            <a className="learn-card" href="https://github.com/scarmali/lipid-logic" target="_blank" rel="noopener noreferrer">
              <span className="learn-icon">💻</span>
              <div className="learn-body">
                <h4>Source Code</h4>
                <p>Inspect the model implementation, contribute, or report issues on GitHub.</p>
              </div>
              <span className="learn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
