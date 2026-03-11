import React, { useState } from "react";

const formulations = [
  { id: "F1", name: "C8 / PEG-100",  core: "Glyceryl caprylate (C8)",  liquid: "Soy lecithin", surf: "PEG-100 Stearate", colour: "#3b82f6" },
  { id: "F2", name: "C8 / PS80",     core: "Glyceryl caprylate (C8)",  liquid: "Soy lecithin", surf: "Polysorbate 80",   colour: "#8b5cf6" },
  { id: "F3", name: "C10 / PEG-100", core: "Glyceryl caprate (C10)",   liquid: "Soy lecithin", surf: "PEG-100 Stearate", colour: "#f59e0b" },
  { id: "F4", name: "C10 / PS80",    core: "Glyceryl caprate (C10)",   liquid: "Soy lecithin", surf: "Polysorbate 80",   colour: "#10b981" },
];

const probes = [
  {
    name: "Pyrene",
    logp: 5.19,
    icon: "🔷",
    colour: "#3b82f6",
    siteClass: "site-core",
    site: "Core",
    method: "Vibronic band ratio (I₁/I₃)",
    methodDetail:
      "Pyrene has five vibronic emission bands. The ratio of the first (I₁) to the third (I₃) is highly sensitive to local polarity — low ratios indicate an apolar environment, high ratios indicate a polar one.",
    bestFormulation: "F4",
    bestLabel: "F4 (Glyceryl caprate / PS80)",
    keyMetric: "I₁/I₃ = 0.785",
    interpretation:
      "A ratio of 0.785 is characteristic of a highly apolar, hydrophobic environment — consistent with deep encapsulation inside the crystalline palmitic acid lipid core. For comparison, pyrene in pure hexane gives I₁/I₃ ≈ 0.6 and in water ≈ 1.87.",
    data: [
      { id: "F1", value: 0.842, label: "0.842", note: "Less apolar" },
      { id: "F2", value: 0.856, label: "0.856", note: "Less apolar" },
      { id: "F3", value: 0.801, label: "0.801", note: "More apolar" },
      { id: "F4", value: 0.785, label: "0.785 ✓", note: "Most apolar — best core loading", best: true },
    ],
    barNote: "Lower I₁/I₃ = more apolar environment = deeper core encapsulation",
    barLow: true,
  },
  {
    name: "Nile Red",
    logp: 4.0,
    icon: "🔴",
    colour: "#e11d48",
    siteClass: "site-interface",
    site: "Interface",
    method: "Solvatochromic emission shift (λmax)",
    methodDetail:
      "Nile Red is solvatochromic — its fluorescence emission wavelength shifts depending on the polarity of its immediate environment. In non-polar solvents it emits at shorter wavelengths (blue-shifted); in polar environments it red-shifts.",
    bestFormulation: "F2",
    bestLabel: "F2 (Glyceryl caprylate / PS80)",
    keyMetric: "λmax = 628.7 nm",
    interpretation:
      "An emission maximum of 628.7 nm corresponds to a moderately polar amphiphilic environment — the interface between the lipid core and the Polysorbate 80 surfactant corona. This confirms interfacial localisation rather than core encapsulation.",
    data: [
      { id: "F1", value: 631.2, label: "631.2 nm", note: "More polar" },
      { id: "F2", value: 628.7, label: "628.7 nm ✓", note: "Interface localisation — best fit", best: true },
      { id: "F3", value: 633.8, label: "633.8 nm", note: "More polar" },
      { id: "F4", value: 635.1, label: "635.1 nm", note: "Most polar" },
    ],
    barNote: "Lower λmax = less polar environment = closer to core",
    barLow: true,
  },
];

const BAR_MIN = { Pyrene: 0.75, "Nile Red": 624 };
const BAR_MAX = { Pyrene: 0.90, "Nile Red": 638 };

function barPercent(probe, value) {
  const min = BAR_MIN[probe];
  const max = BAR_MAX[probe];
  return Math.round(((value - min) / (max - min)) * 100);
}

export default function ValidationPage() {
  const [activeProbe, setActiveProbe] = useState("Pyrene");
  const probe = probes.find(p => p.name === activeProbe);
  const formColours = Object.fromEntries(formulations.map(f => [f.id, f.colour]));

  return (
    <div className="about-page">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="main-header">
        <div className="hero-content">
          <div className="hero-badge">Experimental Validation</div>
          <h1 className="hero-title">Model Validation with Environment-Sensitive Fluorescent Probes</h1>
          <p className="hero-subtitle">
            Two polarity-sensitive fluorescent probes were used to experimentally
            determine where small molecules localise within NLC formulations. Their
            measured behaviour was compared with the NLC Formulation Predictor to
            assess whether the model correctly identifies core- and
            interface-dominated partitioning.
          </p>
        </div>
      </div>

      {/* ── Two-panel intro ───────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <div className="val-intro-panels">

            {/* Left: Formulations Tested */}
            <div className="val-intro-panel">
              <h2 className="about-section-title">Formulations Tested</h2>
              <p className="about-section-intro about-section-intro--left">
                Four NLC formulations were prepared by combining two core lipids
                (glyceryl caprylate, C8, and glyceryl caprate, C10) with two
                surfactant shells (PEG-100 stearate or polysorbate 80). Soy
                lecithin was included as the liquid lipid phase in all systems.
              </p>
              <p className="about-section-intro about-section-intro--left val-intro-note">
                This design systematically varies both core lipophilicity and
                interfacial chemistry, enabling the model's competing partitioning
                hypotheses to be tested.
              </p>
              <div className="val-formulation-grid val-formulation-grid--2col">
                {formulations.map(f => (
                  <div key={f.id} className="val-formulation-card" style={{ borderTopColor: f.colour }}>
                    <span className="val-form-id" style={{ background: f.colour }}>{f.id}</span>
                    <div className="val-form-body">
                      <div className="val-form-row">
                        <span className="val-form-label">Core</span>
                        <span>{f.core}</span>
                      </div>
                      <div className="val-form-row">
                        <span className="val-form-label">Liquid</span>
                        <span>{f.liquid}</span>
                      </div>
                      <div className="val-form-row">
                        <span className="val-form-label">Shell</span>
                        <span>{f.surf}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Fluorescent Probes */}
            <div className="val-intro-panel">
              <h2 className="about-section-title">Fluorescent Probes</h2>
              <p className="about-section-intro about-section-intro--left">
                Two probes spanning the lipophilicity spectrum were used:
              </p>
              <div className="val-probe-list">
                <div className="val-probe-item">
                  <span className="val-probe-icon" style={{ color: "#3b82f6" }}>🔷</span>
                  <div>
                    <p className="val-probe-name">Pyrene <span className="val-probe-logp">Log P ≈ 5.2</span></p>
                    <p className="val-probe-desc">Strongly lipophilic, expected to favour the lipid core.</p>
                  </div>
                </div>
                <div className="val-probe-item">
                  <span className="val-probe-icon" style={{ color: "#e11d48" }}>🔴</span>
                  <div>
                    <p className="val-probe-name">Nile Red <span className="val-probe-logp">Log P ≈ 4.0</span></p>
                    <p className="val-probe-desc">Moderately lipophilic, sensitive to interfacial polarity.</p>
                  </div>
                </div>
              </div>
              <p className="about-section-intro about-section-intro--left val-intro-note">
                Their contrasting behaviours provide a test of the transition
                between core-dominated and interface-dominated partitioning
                predicted by the model.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Probe selector + results ──────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">Probe Results</h2>
          <p className="about-section-intro">
            Select a probe below to explore what the measurements revealed.
          </p>

          {/* Probe tabs */}
          <div className="probe-tabs">
            {probes.map(p => (
              <button
                key={p.name}
                className={`probe-tab ${activeProbe === p.name ? "probe-tab--active" : ""}`}
                style={activeProbe === p.name ? { borderColor: p.colour, color: p.colour } : {}}
                onClick={() => setActiveProbe(p.name)}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
                <span className={`probe-tab-site ${p.siteClass}`}>{p.site}</span>
              </button>
            ))}
          </div>

          {/* Probe detail card */}
          <div className="probe-detail">
            <div className="probe-detail-header">
              <div className="probe-detail-meta">
                <span className="probe-detail-icon" style={{ color: probe.colour }}>{probe.icon}</span>
                <div>
                  <h3 className="probe-detail-name">{probe.name}</h3>
                  <p className="probe-detail-logp">Log P = {probe.logp}</p>
                </div>
                <span className={`val-site-badge ${probe.siteClass}`}>{probe.site} loading confirmed</span>
              </div>
            </div>

            <div className="probe-method-box">
              <strong>{probe.method}</strong>
              <p>{probe.methodDetail}</p>
            </div>

            {/* Bar chart */}
            <div className="probe-chart">
              <div className="probe-chart-title">
                Measurements across all four formulations
                <span className="probe-chart-note">{probe.barNote}</span>
              </div>
              {probe.data.map(d => (
                <div key={d.id} className={`probe-bar-row ${d.best ? "probe-bar-row--best" : ""}`}>
                  <span className="probe-bar-label">
                    <span className="probe-bar-fid" style={{ background: formColours[d.id] }}>{d.id}</span>
                  </span>
                  <div className="probe-bar-track">
                    <div
                      className="probe-bar-fill"
                      style={{
                        width: `${barPercent(probe.name, d.value)}%`,
                        background: d.best ? probe.colour : "#cbd5e1",
                      }}
                    />
                  </div>
                  <span className={`probe-bar-value ${d.best ? "probe-bar-value--best" : ""}`}
                    style={d.best ? { color: probe.colour } : {}}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Winner callout */}
            <div className="probe-winner" style={{ borderColor: probe.colour, background: `${probe.colour}10` }}>
              <div className="probe-winner-header">
                <span className="probe-winner-trophy">🏆</span>
                <div>
                  <p className="probe-winner-label">Best formulation</p>
                  <p className="probe-winner-name" style={{ color: probe.colour }}>{probe.bestLabel}</p>
                  <p className="probe-winner-metric">{probe.keyMetric}</p>
                </div>
              </div>
              <p className="probe-winner-interp">{probe.interpretation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What this confirms ────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">What the Results Confirm</h2>
          <div className="confirm-grid">
            <div className="confirm-card confirm-card--core">
              <div className="confirm-header">
                <span className="confirm-icon">🔷</span>
                <div>
                  <h4>Pyrene → Core loading in F4</h4>
                  <span className="site-core val-site-badge">Core</span>
                </div>
              </div>
              <p>
                Pyrene (Log P 5.19) is strongly lipophilic. The model predicts it should
                be driven deep into the lipid core by the lipophilic gradient — and the
                fluorescence data confirm this in F4, which uses the longer-chain palmitic
                acid core that provides the steepest gradient.
              </p>
            </div>
            <div className="confirm-card confirm-card--interface">
              <div className="confirm-header">
                <span className="confirm-icon">🔴</span>
                <div>
                  <h4>Nile Red → Interface loading in F2</h4>
                  <span className="site-interface val-site-badge">Interface</span>
                </div>
              </div>
              <p>
                Nile Red (Log P 4.0) is moderately lipophilic. At this lipophilicity the
                competitive partitioning hypothesis dominates — the drug distributes
                between core and shell based on chemical compatibility. The solvatochromic
                shift confirms F2's Polysorbate 80 interface is the preferred site.
              </p>
            </div>
          </div>
          <div className="val-note" style={{ marginTop: 24 }}>
            <span className="val-note-icon">📐</span>
            <p>
              These two probes deliberately span the transition between core-dominated
              and interface-dominated behaviour, validating the model across the most
              important part of the lipophilicity spectrum. The spatial heterogeneity
              of the NLC — the coexistence of a distinct core and a distinct shell —
              was directly confirmed by the divergent localisation of the two probes
              in the same set of formulations.
            </p>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <p>Lipid Logic Explorer · CADFD Research Tool · Built for rational NLC formulation screening</p>
      </footer>
    </div>
  );
}
