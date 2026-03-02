import React, { useState, useEffect } from "react";

const EMPTY_FORM = {
  id: "", name: "",
  core_logp: "", surf_logp: "",
  core_d: "", core_p: "", core_h: "",
  surf_d: "", surf_p: "", surf_h: "",
  structure: "Type II Amorphous",
  experimental_note: "",
};

const API_URL = process.env.REACT_APP_API_URL || "";

export default function AdminPanel({ adminKey, onClose }) {
  const [formulations, setFormulations] = useState({});
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [status, setStatus]             = useState(null); // { type: 'success'|'error', msg }
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(null);

  // ── Load current formulations ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/formulations`)
      .then(r => r.json())
      .then(setFormulations)
      .catch(() => setStatus({ type: "error", msg: "Could not load formulations from the server." }));
  }, []);

  const headers = { "Content-Type": "application/json", "X-Admin-Key": adminKey };

  // ── Add formulation ───────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const body = {
      id:   form.id.trim().toUpperCase(),
      name: form.name.trim(),
      core_logp: parseFloat(form.core_logp),
      surf_logp: parseFloat(form.surf_logp),
      core_hsp: { delta_d: parseFloat(form.core_d), delta_p: parseFloat(form.core_p), delta_h: parseFloat(form.core_h) },
      surf_hsp: { delta_d: parseFloat(form.surf_d), delta_p: parseFloat(form.surf_p), delta_h: parseFloat(form.surf_h) },
      structure: form.structure,
      experimental_note: form.experimental_note.trim(),
    };
    try {
      const res = await fetch(`${API_URL}/api/formulations`, { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setFormulations(prev => ({ ...prev, [data.id]: body }));
      setForm(EMPTY_FORM);
      setStatus({ type: "success", msg: `${data.id} added successfully.` });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    }
    setSaving(false);
  };

  // ── Delete formulation ────────────────────────────────────────────────────
  const handleDelete = async (fid) => {
    if (!window.confirm(`Delete ${fid} — ${formulations[fid]?.name}? This cannot be undone.`)) return;
    setDeleting(fid);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/formulations/${fid}`, { method: "DELETE", headers });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setFormulations(prev => { const next = { ...prev }; delete next[fid]; return next; });
      setStatus({ type: "success", msg: `${fid} deleted.` });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    }
    setDeleting(null);
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Formulation Database</h2>
            <p className="admin-subtitle">Add or remove NLC formulations from the knowledge base.</p>
          </div>
          <button className="admin-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {status && (
          <div className={`admin-status admin-status--${status.type}`}>
            {status.type === "success" ? "✓" : "✕"} {status.msg}
          </div>
        )}

        {/* Existing formulations */}
        <section className="admin-section">
          <h3 className="admin-section-title">Current Formulations</h3>
          <div className="admin-formulation-list">
            {Object.entries(formulations).map(([fid, f]) => (
              <div key={fid} className="admin-formulation-row">
                <div className="admin-formulation-info">
                  <span className="admin-fid">{fid}</span>
                  <div>
                    <strong>{f.name}</strong>
                    <p>{f.structure} &mdash; core LogP {f.core_logp}, surf LogP {f.surf_logp}</p>
                  </div>
                </div>
                <button
                  className="admin-delete-btn"
                  onClick={() => handleDelete(fid)}
                  disabled={deleting === fid}
                >
                  {deleting === fid ? "…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Add new formulation */}
        <section className="admin-section">
          <h3 className="admin-section-title">Add New Formulation</h3>
          <form className="admin-form" onSubmit={handleAdd}>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Formulation ID <span className="admin-hint">e.g. F5</span></label>
                <input required placeholder="F5" value={form.id} onChange={e => set("id", e.target.value)} />
              </div>
              <div className="admin-field admin-field--wide">
                <label>Display Name <span className="admin-hint">e.g. F5 (C12-PS80)</span></label>
                <input required placeholder="F5 (C12-PS80)" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label>Core Log P</label>
                <input required type="number" step="0.01" placeholder="3.75" value={form.core_logp} onChange={e => set("core_logp", e.target.value)} />
              </div>
              <div className="admin-field">
                <label>Surfactant Log P</label>
                <input required type="number" step="0.01" placeholder="2.45" value={form.surf_logp} onChange={e => set("surf_logp", e.target.value)} />
              </div>
              <div className="admin-field admin-field--wide">
                <label>Structure Type</label>
                <select value={form.structure} onChange={e => set("structure", e.target.value)}>
                  <option>Type II Amorphous</option>
                  <option>Type I Imperfect Crystal</option>
                  <option>Type I Crystal</option>
                </select>
              </div>
            </div>

            <div className="admin-hsp-group">
              <div className="admin-hsp-label">Core HSP (MPa½)</div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>δd</label>
                  <input required type="number" step="0.1" placeholder="16.9" value={form.core_d} onChange={e => set("core_d", e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>δp</label>
                  <input required type="number" step="0.1" placeholder="4.5" value={form.core_p} onChange={e => set("core_p", e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>δh</label>
                  <input required type="number" step="0.1" placeholder="11.6" value={form.core_h} onChange={e => set("core_h", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="admin-hsp-group">
              <div className="admin-hsp-label">Surfactant HSP (MPa½)</div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>δd</label>
                  <input required type="number" step="0.1" placeholder="17.0" value={form.surf_d} onChange={e => set("surf_d", e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>δp</label>
                  <input required type="number" step="0.1" placeholder="3.0" value={form.surf_p} onChange={e => set("surf_p", e.target.value)} />
                </div>
                <div className="admin-field">
                  <label>δh</label>
                  <input required type="number" step="0.1" placeholder="9.5" value={form.surf_h} onChange={e => set("surf_h", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="admin-field">
              <label>Experimental Note <span className="admin-hint">brief summary of observed behaviour</span></label>
              <input required placeholder="e.g. High encapsulation efficiency observed for lipophilic probes." value={form.experimental_note} onChange={e => set("experimental_note", e.target.value)} />
            </div>

            <button className="admin-submit-btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : "+ Add Formulation"}
            </button>
          </form>
        </section>

        <p className="admin-persist-note">
          💡 Changes are saved to <code>formulations.json</code> on the server immediately.
          To make them permanent across deployments, commit the updated file to GitHub.
        </p>

      </div>
    </div>
  );
}
