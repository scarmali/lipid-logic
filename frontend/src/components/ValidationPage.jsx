import React from "react";

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
    bestLabel: "F4 (Glyceryl caprate / Polysorbate 80)",
    keyMetric: "I₁/I₃ = 0.785",
    interpretation:
      "This value is consistent with a highly hydrophobic environment, supporting deep encapsulation within the lipid matrix. For reference, pyrene in pure hexane gives I₁/I₃ ≈ 0.6 and in water ≈ 1.87.",
    keyObservation:
      "Pyrene shows the lowest I₁/I₃ ratio in F4, indicating the most apolar environment and strongest localisation within the lipid core.",
    data: [
      { id: "F1", value: 0.842, label: "0.842", note: "Less apolar" },
      { id: "F2", value: 0.856, label: "0.856", note: "Less apolar" },
      { id: "F3", value: 0.801, label: "0.801", note: "More apolar" },
      { id: "F4", value: 0.785, label: "0.785 ✓", note: "Most apolar — best core loading", best: true },
    ],
    barNote: "Lower I₁/I₃ = more apolar environment = deeper core encapsulation",
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
    bestLabel: "F2 (Glyceryl caprylate / Polysorbate 80)",
    keyMetric: "λmax = 628.7 nm",
    interpretation:
      "An emission maximum of 628.7 nm corresponds to a moderately polar amphiphilic environment — consistent with localisation at the interface between the lipid core and the Polysorbate 80 surfactant corona.",
    keyObservation:
      "Nile Red shows the lowest λmax in F2, indicating the least polar environment among the PS80-containing formulations and confirming interfacial localisation.",
    data: [
      { id: "F1", value: 631.2, label: "631.2 nm", note: "More polar" },
      { id: "F2", value: 628.7, label: "628.7 nm ✓", note: "Interface localisation — best fit", best: true },
      { id: "F3", value: 633.8, label: "633.8 nm", note: "More polar" },
      { id: "F4", value: 635.1, label: "635.1 nm", note: "Most polar" },
    ],
    barNote: "Lower λmax = less polar environment = closer to core",
  },
];

const BAR_MIN = { Pyrene: 0.75, "Nile Red": 624 };
const BAR_MAX = { Pyrene: 0.90, "Nile Red": 638 };

function barPercent(probeName, value) {
  const min = BAR_MIN[probeName];
  const max = BAR_MAX[probeName];
  return Math.round(((value - min) / (max - min)) * 100);
}

const formColours = Object.fromEntries(formulations.map(f => [f.id, f.colour]));

function ProbeChart({ probe }) {
  return (
    <div className="probe-detail">
      {/* Header */}
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

      {/* Method */}
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
            <span
              className={`probe-bar-value ${d.best ? "probe-bar-value--best" : ""}`}
              style={d.best ? { color: probe.colour } : {}}>
              {d.label}
            </span>
            <span className={`probe-bar-note ${d.best ? "probe-bar-note--best" : ""}`}>
              {d.note}
            </span>
          </div>
        ))}
      </div>

      {/* Key observation */}
      <div className="val-key-observation">
        <span className="val-key-obs-icon">🔑</span>
        <p><strong>Key observation: </strong>{probe.keyObservation}</p>
      </div>

      {/* Best formulation */}
      <div className="probe-winner" style={{ borderColor: probe.colour, background: `${probe.colour}10` }}>
        <div className="probe-winner-header">
          <span className="probe-winner-trophy">🏆</span>
          <div>
            <p className="probe-winner-label">Best-performing formulation</p>
            <p className="probe-winner-name" style={{ color: probe.colour }}>{probe.bestLabel}</p>
            <p className="probe-winner-metric">{probe.keyMetric}</p>
          </div>
        </div>
        <p className="probe-winner-interp">{probe.interpretation}</p>
      </div>
    </div>
  );
}

export default function ValidationPage() {
  return (
    <div className="about-page">

      {/* ── 1. How was the model validated? ───────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title">How was the model validated?</h2>
          <p className="val-intro-body">
            To evaluate whether Lipid Logic accurately captures drug localisation within lipid
            nanoparticles, we designed a controlled set of formulations and compared model
            predictions with experimental fluorescence measurements.
          </p>
          <p className="val-intro-body">
            By combining systematic formulation design with environment-sensitive probes, this
            approach allows us to directly test how physicochemical properties influence where
            molecules reside within Nanostructured Lipid Carriers (NLCs).
          </p>
        </div>
      </section>

      {/* ── 2. Experimental Design ────────────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">Experimental Design</h2>

          <div className="val-intro-panels">

            {/* Formulations Tested */}
            <div className="val-intro-panel">
              <h3 className="val-subsection-title">Formulations Tested</h3>
              <p className="val-intro-note">
                Four formulations were designed to systematically vary both core lipophilicity
                and interfacial chemistry. This enables the competing mechanisms proposed in the
                model — lipophilicity-driven partitioning and interfacial competition — to be
                tested under controlled conditions.
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

            {/* Fluorescent Probes */}
            <div className="val-intro-panel">
              <h3 className="val-subsection-title">Fluorescent Probes</h3>
              <p className="val-intro-note">
                Two fluorescent probes were selected to report on localisation within different
                regions of the nanoparticle:
              </p>
              <div className="val-probe-list">
                <div className="val-probe-item">
                  <span className="val-probe-icon" style={{ color: "#3b82f6" }}>🔷</span>
                  <div>
                    <p className="val-probe-name">Pyrene <span className="val-probe-logp">Log P ≈ 5.2</span></p>
                    <p className="val-probe-desc">
                      A strongly lipophilic probe that preferentially partitions into the lipid
                      core and reports on core polarity.
                    </p>
                  </div>
                </div>
                <div className="val-probe-item">
                  <span className="val-probe-icon" style={{ color: "#e11d48" }}>🔴</span>
                  <div>
                    <p className="val-probe-name">Nile Red <span className="val-probe-logp">Log P ≈ 4.0</span></p>
                    <p className="val-probe-desc">
                      A moderately lipophilic probe sensitive to environmental polarity,
                      particularly at interfacial regions.
                    </p>
                  </div>
                </div>
              </div>
              <p className="val-intro-note" style={{ marginTop: 12 }}>
                Their contrasting behaviours allow us to probe the transition between
                core-dominated and interface-dominated localisation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Experimental Evidence ──────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title">Experimental Evidence</h2>
          <p className="val-intro-body" style={{ marginBottom: 32 }}>
            Fluorescence measurements provide insight into the local environment experienced
            by each probe, allowing localisation within the nanoparticle to be inferred.
          </p>

          {/* Pyrene */}
          <h3 className="val-probe-section-title" style={{ color: "#3b82f6" }}>
            🔷 Pyrene: Core localisation behaviour
          </h3>
          <ProbeChart probe={probes[0]} />

          {/* Nile Red */}
          <h3 className="val-probe-section-title" style={{ color: "#e11d48", marginTop: 48 }}>
            🔴 Nile Red: Interface localisation behaviour
          </h3>
          <ProbeChart probe={probes[1]} />
        </div>
      </section>

      {/* ── 4. What do the results show? ──────────────────────────────── */}
      <section className="about-section about-section--alt">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--center">What do the results show?</h2>
          <p className="about-section-intro">
            The experimental findings align with the model's predictions, demonstrating that
            different physicochemical mechanisms dominate under different conditions.
          </p>

          <div className="confirm-grid">
            <div className="confirm-card confirm-card--core">
              <div className="confirm-header">
                <span className="confirm-icon">🔷</span>
                <div>
                  <h4>Core-dominated regime</h4>
                  <span className="site-core val-site-badge">Pyrene → Core loading in F4</span>
                </div>
              </div>
              <p className="confirm-regime-line"><strong>Prediction:</strong> Strongly lipophilic compounds preferentially partition into the lipid core.</p>
              <p className="confirm-regime-line"><strong>Observed:</strong> Fluorescence confirms deepest core localisation in F4.</p>
              <p style={{ marginTop: 10 }}>
                The longer-chain lipid core in F4 enhances the lipophilicity gradient, driving
                pyrene into the most apolar region of the nanoparticle.
              </p>
            </div>

            <div className="confirm-card confirm-card--interface">
              <div className="confirm-header">
                <span className="confirm-icon">🔴</span>
                <div>
                  <h4>Interface-influenced regime</h4>
                  <span className="site-interface val-site-badge">Nile Red → Interface in F2</span>
                </div>
              </div>
              <p className="confirm-regime-line"><strong>Prediction:</strong> At moderate lipophilicity, competition between core and interface becomes significant.</p>
              <p className="confirm-regime-line"><strong>Observed:</strong> Fluorescence indicates localisation influenced by the surfactant interface.</p>
              <p style={{ marginTop: 10 }}>
                In this regime, chemical compatibility between the probe and interfacial
                components plays a key role, consistent with the model's competitive
                partitioning mechanism.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Why this matters ───────────────────────────────────────── */}
      <section className="about-section about-section--why-matters">
        <div className="about-section-inner about-section-inner--full">
          <h2 className="about-section-title about-section-title--light">Why this matters</h2>
          <p className="val-why-body">
            These results demonstrate that drug localisation within lipid nanoparticles is not
            governed by a single property, but by the interplay of multiple physicochemical
            factors — including lipophilicity, chemical compatibility, and interfacial effects.
          </p>
          <p className="val-why-body">
            By capturing these competing mechanisms within a single framework, Lipid Logic
            provides a way to visualise and explore formulation behaviour, helping users move
            beyond trial-and-error approaches toward a more intuitive understanding of lipid
            nanoparticle systems.
          </p>
        </div>
      </section>

      <footer className="about-footer">
        <p>Lipid Logic Explorer · CADFD Research Tool · Built for rational NLC formulation screening</p>
      </footer>
    </div>
  );
}
