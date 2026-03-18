import React from "react";

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
    whenDominant: "Co-dominant with lipophilicity gradient for highly lipophilic drugs",
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
  return (
    <div className="about-page">

      {/* ── Section 1: What are NLCs? ─────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-text-block">
            <div className="about-section-number">01</div>
            <h2 className="about-section-title">What are Nanostructured Lipid Carriers?</h2>
            <p>
              Nanostructured Lipid Carriers (NLCs) are lipid-based nanoparticles used to
              encapsulate and deliver drugs and other bioactive molecules. They consist of a
              mixed solid–liquid lipid matrix surrounded by a stabilising surfactant shell.
            </p>
            <p>
              Within this structure, molecules are not uniformly distributed. Instead, they
              may localise in different regions of the particle, including the lipid core,
              interfacial layers, or amorphous regions within the matrix.
            </p>
            <p>
              Where a molecule resides strongly influences encapsulation efficiency,
              formulation stability, and release behaviour.
            </p>
          </div>

          <div className="about-nlc-diagram">
            <img
              src="/nlc-illustration.png"
              alt="NLC structure — blue surfactant shell surrounding orange lipid core with green inner sphere"
              className="nlc-illustration-img"
            />
          </div>
        </div>
      </section>

      {/* ── Section 2: Why localisation matters ──────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <div className="about-section-number about-section-number--alt">02</div>
          <h2 className="about-section-title">Why Does Localisation Matter?</h2>
          <p className="about-section-intro about-section-intro--left">
            Drug molecules can occupy different regions within an NLC, including the lipid
            core, interfacial regions, or amorphous pockets within the matrix.
            Because NLCs contain a blend of solid and liquid lipids, their internal structure
            forms multiple microenvironments where molecules may reside. Where a drug
            localises strongly influences how the formulation behaves.
          </p>
          <div className="why-grid">
            <div className="why-card">
              <span className="why-icon">🎯</span>
              <h4>Drug loading capacity</h4>
              <p>Drugs accommodated in amorphous regions can be incorporated at higher levels, while molecules excluded from the lipid structure may be expelled during crystallisation.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">⏱</span>
              <h4>Release kinetics</h4>
              <p>Drugs embedded within the lipid core typically exhibit slower, diffusion-controlled release, whereas molecules positioned near the interface often produce a faster initial release.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">🧪</span>
              <h4>Formulation stability</h4>
              <p>Formulation stability is closely linked to drug position within the matrix. Improper localisation can lead to drug expulsion as the lipid structure reorganises during storage.</p>
            </div>
            <div className="why-card">
              <span className="why-icon">🔬</span>
              <h4>Biological performance</h4>
              <p>Biological performance may be affected by how the nanoparticle interacts with cells and membranes, which can depend on whether drug molecules remain in the core or are associated with the interfacial region.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: The Challenge in Formulation Design ───────────────────── */}
      <section className="about-section about-section--challenge">
        <div className="about-section-inner about-section-inner--full">
          <div className="challenge-layout">
            <div className="challenge-icon-col">
              <div className="challenge-icon-wrap">
                <span className="challenge-icon-glyph">⚗️</span>
              </div>
            </div>
            <div className="challenge-text-col">
              <div className="about-section-number">03</div>
              <h2 className="about-section-title">The Challenge in Formulation Design</h2>
              <p>
                Formulators often need to predict how a molecule will behave within a lipid
                nanoparticle before extensive experimental screening begins.
              </p>
              <p>
                However, drug localisation is governed by several interacting physicochemical
                factors, including lipophilicity, molecular compatibility with lipid phases,
                and competition between the lipid core and surfactant interface.
              </p>
              <p>
                Understanding how these properties combine to influence localisation can be
                difficult, particularly for students or researchers new to lipid nanoparticle
                formulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Introducing Lipid Logic ───────────────────────────────── */}
      <section className="about-section about-section--introducing">
        <div className="about-section-inner about-section-inner--full">
          <div className="introducing-inner">
            <div className="introducing-label">The Tool</div>
            <div className="about-section-number about-section-number--light">04</div>
            <h2 className="about-section-title about-section-title--light">Introducing Lipid Logic</h2>
            <div className="introducing-divider" />
            <p className="introducing-text">
              Lipid Logic is an interactive educational tool designed to help explore how
              molecular properties influence drug localisation within Nanostructured Lipid
              Carriers.
            </p>
            <p className="introducing-text">
              The model integrates key physicochemical descriptors to provide a conceptual
              framework for understanding how compounds distribute between different regions
              of the nanoparticle. By visualising these relationships, the tool helps users
              build intuition about formulation design and the molecular factors that
              influence nanoparticle performance.
            </p>
            <p className="introducing-text">
              Rather than acting as a predictive black-box model, Lipid Logic is intended
              to support learning and exploration of the underlying formulation principles.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 5: The Science Behind the Model ──────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <div className="about-section-number about-section-number--alt">05</div>
          <h2 className="about-section-title">The Science Behind the Model</h2>
          <p className="about-section-intro about-section-intro--left">
            The Lipid Logic model combines three physicochemical principles that influence
            how molecules distribute within lipid nanoparticles.
          </p>

          <div className="hyp-grid">
            {hypotheses.map((h) => (
              <div
                key={h.id}
                className="hyp-card"
                style={{ "--hyp-colour": h.colour }}
              >
                <div className="hyp-card-header">
                  <span className="hyp-icon" style={{ color: h.colour }}>{h.icon}</span>
                  <div className="hyp-title-group">
                    <div>
                      <h3 className="hyp-title">{h.title}</h3>
                      <p className="hyp-tagline">{h.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="hyp-detail">
                  <p>{h.summary}</p>
                  <span className="hyp-dominates">{h.whenDominant}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Model Behaviour ────────────────────────────────────────── */}
      <section className="about-section about-section--model-behaviour">
        <div className="about-section-inner about-section-inner--full">
          <div className="about-section-number">06</div>
          <h2 className="about-section-title">How the Model Adapts</h2>
          <div className="model-behaviour-box">
            <div className="model-behaviour-icon-wrap">
              <span className="model-behaviour-icon">💡</span>
            </div>
            <p className="model-behaviour-text">
              The relative influence of these mechanisms changes depending on the molecular
              properties of the drug and its compatibility with the lipid environment. The
              model automatically adjusts the weighting of each mechanism so that the most
              relevant process has the greatest influence on localisation.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
