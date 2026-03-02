import React, { useState } from "react";

const hypotheses = [
  {
    id: "H1",
    icon: "⟶",
    colour: "#3b82f6",
    title: "Lipophilic Gradient",
    tagline: "Like dissolves like — at scale",
    summary:
      "The difference in oil-affinity between the lipid core and the surfactant layer creates a natural driving force. Highly oil-loving drugs are pulled toward the core, much like how oil and water separate spontaneously.",
    whenDominant: "Most influential for strongly lipophilic drugs",
  },
  {
    id: "H2",
    icon: "⬡",
    colour: "#8b5cf6",
    title: "Chemical Compatibility",
    tagline: "A precise measure of chemical fit",
    summary:
      "Hansen Solubility Parameters break down a molecule's chemistry into three components — how it disperses, polarises, and hydrogen-bonds. Drugs migrate to whichever compartment is the closest chemical match.",
    whenDominant: "Co-dominant with H1 for highly lipophilic drugs",
  },
  {
    id: "H3",
    icon: "⇌",
    colour: "#10b981",
    title: "Competitive Partitioning",
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
          <h1 className="about-hero-title">
            Computer-Assisted Drug<br />Formulation Design
          </h1>
          <p className="about-hero-sub">
            A rational prediction engine for drug localisation in Nanostructured
            Lipid Carriers — cutting down on trial-and-error before any
            experiment begins.
          </p>
        </div>
      </section>

      {/* ── What are NLCs? ────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-text-block">
            <h2 className="about-section-title">What are Nanostructured Lipid Carriers?</h2>
            <p>
              Nanostructured Lipid Carriers (NLCs) are tiny lipid-based particles —
              typically 100–500 nm across — designed to encapsulate and deliver
              drug molecules that would otherwise be too oily or unstable to
              administer directly. They are made from a blend of solid and liquid
              fats, coated in a thin layer of surfactant.
            </p>
            <p>
              The deliberate disorder in the fat matrix creates nanoscale pockets
              that trap drug molecules and hold them there — preventing the drug
              from being expelled during storage, which was the main weakness of
              earlier solid lipid nanoparticles.
            </p>
            <p>
              NLCs are particularly promising for drugs that are poorly soluble in
              water, because the lipid environment dramatically improves their
              stability, bioavailability, and release behaviour. However, choosing
              the right formulation for a given drug has traditionally required
              extensive, expensive screening.
              <strong> CADFD changes that.</strong>
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

      {/* ── Why it matters ────────────────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            Why Does Localisation Matter?
          </h2>
          <p className="about-section-intro">
            Where a drug sits inside an NLC determines almost everything about
            how it behaves.
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
              <p>Rather than testing every lipid–surfactant combination experimentally, CADFD scores all formulations in seconds — so you start experiments with the best candidates.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">🔬</span>
              <h4>Mechanistic understanding</h4>
              <p>Predictions are backed by three physicochemical hypotheses, not a black box. You can see why a formulation was ranked and build on that understanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The three hypotheses ──────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">
            The Science Behind the Predictions
          </h2>
          <p className="about-section-intro">
            The tool combines three independent physicochemical principles. Their
            relative importance shifts depending on how oil-loving the drug is —
            click any card to learn more.
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
              The three hypotheses are combined into a single score for each
              formulation. The balance between them is adjusted automatically
              based on the drug's lipophilicity — so the most relevant
              mechanism always has the greatest influence on the result.
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
              <p>Compute the octanol–water partition coefficient for your drug using tools such as ALOGPS or ChemDraw. This is the only required input — it tells the model how oil-loving your drug is.</p>
            </div>
            <div className="howto-step">
              <div className="howto-num">2</div>
              <h4>Add HSP values (optional)</h4>
              <p>For a more precise prediction, add the three Hansen Solubility Parameters (δd, δp, δh) in MPa½. These can be estimated using group-contribution methods. Without them, the tool ranks by lipophilicity gradient alone.</p>
            </div>
            <div className="howto-step">
              <div className="howto-num">3</div>
              <h4>Run the analysis</h4>
              <p>Click "Run CADFD Analysis". The engine scores all formulations in the database and ranks them by predicted compatibility with your drug.</p>
            </div>
            <div className="howto-step">
              <div className="howto-num">4</div>
              <h4>Interpret the results</h4>
              <p>Each formulation card shows a compatibility score, predicted localisation site (Core or Interface), and the chemical distances to each compartment. Use the top-ranked formulations as your experimental starting point.</p>
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
