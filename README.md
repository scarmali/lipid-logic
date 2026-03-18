# Lipid Logic Explorer

**Computer-Assisted Drug Formulation Design (CADFD) for Nanostructured Lipid Carriers**

A research tool for predicting drug partitioning within NLC formulations using lipophilicity and Hansen Solubility Parameters. Built with Flask (Python) and React.

---

## Features

- **Drug property input** — enter Log P manually, look up by drug name via PubChem, or calculate from a SMILES string
- **Custom NLC formulation builder** — select solid lipid, liquid lipid, and surfactant components with a blending ratio slider
- **Partition prediction** — predicts core vs. interface localisation using a three-hypothesis framework (lipophilic gradient, HSP compatibility, competitive partitioning)
- **Validation page** — experimental fluorescence data (Pyrene, Nile Red) across four NLC formulations, with interactive bar charts
- **Admin panel** — password-protected UI for adding and removing formulations from the database at runtime
- **Lipid component library** — served from `lipid_db.json`, with a built-in fallback if the API is unavailable

---

## Architecture

```
lipid-logic/
├── app.py                  # Flask API server
├── formulations.json       # NLC formulation database (editable via Admin panel)
├── lipid_db.json           # Lipid component library (solid lipids, liquid lipids, surfactants)
├── requirements.txt
├── render.yaml             # Render deployment config
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main app, routing, tool page, admin key modal
    │   ├── App.css
    │   └── components/
    │       ├── AdminPanel.jsx       # Formulation database management UI
    │       ├── ValidationPage.jsx   # Experimental validation data and charts
    │       ├── AboutPage.jsx        # Project background and science
    │       └── WalkthroughModal.jsx # First-visit guide
    └── build/              # Production build (served by Flask in deployment)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Predict drug localisation given Log P, optional HSP, and NLC composition |
| `POST` | `/api/logp` | Calculate Log P from a SMILES string (via ALOGPS fallback) |
| `GET` | `/api/formulations` | List all formulations in the database |
| `POST` | `/api/formulations` | Add a new formulation (requires `X-Admin-Key` header) |
| `DELETE` | `/api/formulations/<id>` | Delete a formulation (requires `X-Admin-Key` header) |
| `GET` | `/api/lipid-db` | Retrieve the lipid component library |

---

## Local Development

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm

### Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies API calls to localhost:5000)
npm start
```

Frontend runs on `http://localhost:3000`. The `"proxy": "http://localhost:5000"` setting in `package.json` handles API routing in development.

---

## Deployment (Render)

The app is deployed as a single Flask service on [Render](https://render.com) (`render.yaml`). The React frontend is built and served as static files by Flask in production.

### Build and deploy

```bash
# Build the React frontend
cd frontend && npm run build

# Commit the build and push to GitHub
# Render will auto-deploy on push to main
```

### Environment variables

Set these in your Render service dashboard under **Environment**:

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_KEY` | Password for the Admin panel | `lipid-admin-2025` |
| `PORT` | Port for the Flask server (auto-set by Render) | `5000` |

> **Important:** The default `ADMIN_KEY` is visible in source code. Set a custom value in Render before making the app public.

---

## Admin Panel

The Admin panel lets you add or remove NLC formulations from `formulations.json` without editing code.

To access it:
1. Click the **⚙** icon in the top-right navigation bar
2. Enter the admin key when prompted (must match the `ADMIN_KEY` environment variable)
3. Add formulations using the form, or delete existing ones

Changes take effect immediately on the server. To make them permanent across deployments, commit the updated `formulations.json` to the repository.

---

## Customisation

### Adding formulations

Use the Admin panel UI (preferred), or add entries directly to `formulations.json`:

```json
"F5": {
  "name": "F5 (C12-PS80)",
  "core_logp": 4.5,
  "surf_logp": 2.45,
  "core_hsp": { "delta_d": 17.0, "delta_p": 4.0, "delta_h": 11.0 },
  "surf_hsp": { "delta_d": 16.5, "delta_p": 5.0, "delta_h": 11.0 },
  "structure": "Type II Amorphous",
  "experimental_note": "Brief summary of observed behaviour."
}
```

### Adding lipid components

Edit `lipid_db.json` directly. The file has three sections: `solid_lipids`, `liquid_lipids`, and `surfactants`. Each entry requires `id`, `name`, `logp`, `delta_d`, `delta_p`, and `delta_h`.

---

## Example: Predicting Pyrene

```
Inputs:
  Log P:  5.19
  δd:     20.4 MPa½
  δp:     5.0  MPa½
  δh:     3.5  MPa½
  NLC:    Glyceryl caprate (C10) / Soy lecithin / Polysorbate 80

Prediction:
  Location:   Lipid Core
  Confidence: ★★★★★
  Validation: I₁/I₃ = 0.785 in F4 (experimental, confirmed)
```

---

## Validation Data

The Validation page presents fluorescence data from two probe molecules tested across F1–F4:

- **Pyrene** (Log P 5.19) — vibronic band ratio (I₁/I₃), confirms core localisation in F4
- **Nile Red** (Log P 4.0) — solvatochromic emission shift (λmax), confirms interface localisation in F2

These probes were chosen to span the transition between core-dominated and interface-dominated partitioning.

---

## Tech Stack

- **Backend:** Python 3.10, Flask, flask-cors
- **Frontend:** React 18, plain CSS
- **Deployment:** Render (web service)
- **Log P lookup:** PubChem REST API (primary), ALOGPS / VCCLAB (SMILES fallback)

---

## Citation

If you use this tool in your research or teaching, please cite:

```
Carmali, S. (2026). Lipid Logic Explorer: Computer-Assisted Drug Formulation Design
for Nanostructured Lipid Carriers. CADFD Research Tool.
https://github.com/scarmali/lipid-logic
```

---

## License

See [LICENSE](LICENSE) for details.

---

*This is a research and educational tool. Predictions should be validated experimentally before use in pharmaceutical development.*
