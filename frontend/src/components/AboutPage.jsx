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
            <img
              src="/nlc-illustration.svg"
              alt="NLC structure — blue surfactant shell surrounding orange lipid core with green inner sphere"
              className="nlc-illustration-img"
            />
          </div>
        </div>
      </section>

      {/* ── Why localisation matters ──────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title">
            Why Does Localisation Matter?
          </h2>
          <p className="about-section-intro about-section-intro--left">
            Drug molecules can occupy different regions within an NLC: the lipid
            core, interfacial regions, or amorphous pockets within the matrix.
            Because NLCs are composed of blended solid and liquid lipids, this
            internal structure creates multiple microenvironments where drugs may
            reside. Where a drug localises strongly influences how the formulation behaves.
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

      {/* ── The science behind the model ──────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title">
            The Science Behind the Model
          </h2>
          <p className="about-section-intro about-section-intro--left">
            The model combines three physicochemical principles that govern
            drug distribution in lipid nanoparticles.
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

          <div className="hyp-footer-note">
            <span>💡</span>
            <p>
              Their relative weight shifts automatically based on the drug's
              lipophilicity and lipid compatibility — so the most relevant
              mechanism always has the greatest influence on the result.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
