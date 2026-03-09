import React, { useState } from "react";

const steps = [
  {
    icon: "⚗️",
    badge: "Welcome",
    title: "Lipid Logic Explorer",
    subtitle: "A computer-assisted tool for NLC formulation design",
    body: (
      <>
        <p>
          This tool predicts <strong>where your drug molecule will sit</strong> inside a
          Nanostructured Lipid Carrier (NLC) — either deep in the <strong>lipid core</strong> or
          at the <strong>surfactant interface</strong>. That prediction tells you which
          formulation to try first, without running a single experiment.
        </p>
        <div className="wt-highlight-box">
          <span className="wt-hl-icon">🎯</span>
          <div>
            <strong>Why it matters:</strong> Where a drug localises controls how
            well it's encapsulated, how fast it releases, and how stable the
            formulation will be.
          </div>
        </div>
        <p className="wt-footnote">
          This walkthrough will take you through the tool in 4 short steps.
        </p>
      </>
    ),
  },
  {
    icon: "📊",
    badge: "Step 1",
    title: "Log P — Your Essential Input",
    subtitle: "The only required property",
    body: (
      <>
        <p>
          <strong>Log P</strong> is the octanol–water partition coefficient. It measures
          how lipophilic (oil-loving) your drug is on a log scale.
        </p>
        <div className="wt-logp-scale">
          <div className="wt-scale-bar">
            <div className="wt-scale-fill" />
          </div>
          <div className="wt-scale-labels">
            <div className="wt-scale-item wt-scale-item--left">
              <strong>&lt; 1</strong>
              <span>Too hydrophilic<br />NLC not recommended</span>
            </div>
            <div className="wt-scale-item">
              <strong>1–3</strong>
              <span>Low–moderate<br />lipophilicity</span>
            </div>
            <div className="wt-scale-item wt-scale-item--right">
              <strong>&gt; 3</strong>
              <span>Ideal for NLC<br />encapsulation</span>
            </div>
          </div>
        </div>
        <div className="wt-highlight-box wt-highlight-box--tip">
          <span className="wt-hl-icon">💡</span>
          <div>
            <strong>Where to find Log P:</strong> Use ChemDraw, DrugBank, PubChem,
            or ALOGPS. Most drug databases include this value.
          </div>
        </div>
      </>
    ),
  },
  {
    icon: "🔬",
    badge: "Step 2",
    title: "Hansen Solubility Parameters",
    subtitle: "Optional — but improves prediction accuracy",
    body: (
      <>
        <p>
          Hansen Solubility Parameters (HSP) break a molecule's chemistry into three
          components, each measured in MPa½:
        </p>
        <div className="wt-hsp-explainer">
          <div className="wt-hsp-row">
            <span className="wt-hsp-symbol">δd</span>
            <div>
              <strong>Dispersion forces</strong>
              <span>Non-specific London interactions — present in all molecules</span>
            </div>
          </div>
          <div className="wt-hsp-row">
            <span className="wt-hsp-symbol">δp</span>
            <div>
              <strong>Polar forces</strong>
              <span>Dipole–dipole interactions — higher in polar molecules</span>
            </div>
          </div>
          <div className="wt-hsp-row">
            <span className="wt-hsp-symbol">δh</span>
            <div>
              <strong>Hydrogen bonding</strong>
              <span>H-bond donor/acceptor capacity — higher in alcohols, amines, etc.</span>
            </div>
          </div>
        </div>
        <div className="wt-highlight-box wt-highlight-box--note">
          <span className="wt-hl-icon">📝</span>
          <div>
            <strong>Leave these blank if you don't have them.</strong> The tool will
            still rank formulations using the lipophilic gradient alone.
          </div>
        </div>
      </>
    ),
  },
  {
    icon: "📋",
    badge: "Step 3",
    title: "Reading Your Results",
    subtitle: "How to interpret the formulation ranking",
    body: (
      <>
        <p>After running the analysis, you'll see ranked formulation cards. Here's what to look for:</p>
        <div className="wt-results-guide">
          <div className="wt-rg-row">
            <span className="wt-rg-badge wt-rg-badge--core">Core</span>
            <div>
              <strong>Core loading</strong> — the drug prefers the lipid interior.
              Expect <em>slower release</em> and <em>better protection</em> from
              the environment. Common in highly lipophilic drugs (Log P &gt; 3).
            </div>
          </div>
          <div className="wt-rg-row">
            <span className="wt-rg-badge wt-rg-badge--interface">Interface</span>
            <div>
              <strong>Interface loading</strong> — the drug sits in the surfactant
              corona. Expect <em>faster release</em>. Common in moderately lipophilic
              drugs where the surfactant competes with the core.
            </div>
          </div>
        </div>
        <div className="wt-highlight-box wt-highlight-box--tip">
          <span className="wt-hl-icon">⭐</span>
          <div>
            <strong>Start with the top-ranked formulation</strong> for your
            experimental work — it has the highest predicted chemical compatibility
            with your drug.
          </div>
        </div>
      </>
    ),
  },
];

export default function WalkthroughModal({ onClose }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="wt-overlay" onClick={onClose}>
      <div className="wt-modal" onClick={e => e.stopPropagation()}>

        {/* Progress dots */}
        <div className="wt-progress">
          {steps.map((_, i) => (
            <button
              key={i}
              className={`wt-dot ${i === step ? "wt-dot--active" : i < step ? "wt-dot--done" : ""}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="wt-body">
          <div className="wt-step-icon">{current.icon}</div>
          <span className="wt-badge">{current.badge}</span>
          <h2 className="wt-title">{current.title}</h2>
          <p className="wt-subtitle">{current.subtitle}</p>
          <div className="wt-content">{current.body}</div>
        </div>

        {/* Actions */}
        <div className="wt-actions">
          <button className="wt-skip" onClick={onClose}>
            {isLast ? "Close" : "Skip tour"}
          </button>
          <div className="wt-nav-btns">
            {step > 0 && (
              <button className="wt-btn wt-btn--secondary" onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            {!isLast ? (
              <button className="wt-btn wt-btn--primary" onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
            ) : (
              <button className="wt-btn wt-btn--primary" onClick={onClose}>
                Start using the tool ✓
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
