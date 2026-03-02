from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import os
import json

app = Flask(__name__)
CORS(app)

# ============================================================================
# FORMULATION DATABASE  —  loaded from formulations.json
# ============================================================================

DB_PATH = os.path.join(os.path.dirname(__file__), 'formulations.json')

def load_formulations():
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def save_formulations(data):
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

# ============================================================================
# ADMIN AUTH  —  set ADMIN_KEY env var on your server; default for local dev
# ============================================================================

ADMIN_KEY = os.environ.get('ADMIN_KEY', 'lipid-admin-2025')

def check_admin(req):
    return req.headers.get('X-Admin-Key') == ADMIN_KEY

# ============================================================================
# ANALYTICAL LOGIC
# ============================================================================

def get_hansen_dist(h1, h2):
    return round(math.sqrt((h1['delta_d']-h2['delta_d'])**2 +
                           (h1['delta_p']-h2['delta_p'])**2 +
                           (h1['delta_h']-h2['delta_h'])**2), 2)

# ============================================================================
# PREDICTION ENDPOINT
# ============================================================================

@app.route('/api/predict', methods=['POST'])
def predict():
    FORMULATIONS = load_formulations()
    data = request.json
    logp = float(data.get('drug_logp', 0))
    hsp_raw = data.get('drug_hsp')

    # Detect Log P-only mode: HSP not provided, or all values are absent/zero
    logp_only = (
        hsp_raw is None or
        not isinstance(hsp_raw, dict) or
        all(hsp_raw.get(k) in (None, 0, '') for k in ('delta_d', 'delta_p', 'delta_h'))
    )
    hsp = hsp_raw if not logp_only else None

    # 1. Lipophilicity category, weights, and confidence
    too_hydrophilic = logp < 2.0

    if logp > 5.0:
        # H1 (gradient) and H2 (core HSP fit) dominate — drug is strongly core-driven
        weights = {'h1': 0.5, 'h2': 0.4, 'h3': 0.1}
        category, strategy = "Highly Lipophilic", "Core-loading priority"
    elif 3.0 <= logp <= 5.0:
        # H3 (competitive partitioning) dominates — surfactant shell is a genuine competitor
        weights = {'h1': 0.2, 'h2': 0.1, 'h3': 0.7}
        category, strategy = "Moderately Lipophilic", "Competitive partitioning — surfactant shell is a strong competitor"
    elif 2.0 <= logp < 3.0:
        # H1 (gradient) dominates — relies on bulk thermodynamic driving force
        weights = {'h1': 0.6, 'h2': 0.2, 'h3': 0.2}
        category, strategy = "Low Lipophilicity", "Thermodynamic gradient focus"
    else:
        # logp < 2: too hydrophilic for reliable NLC core encapsulation
        weights = {'h1': 0.0, 'h2': 0.0, 'h3': 1.0}
        category = "Hydrophilic"
        strategy = "Not recommended for NLC core encapsulation"

    # Confidence rating
    confidence = 5 if 4.0 <= logp <= 5.5 else 3 if 3.0 <= logp <= 6.0 else 1

    rankings = []
    for fid, f in FORMULATIONS.items():
        grad = f['core_logp'] - f['surf_logp']
        s1 = 5 if grad > 1.0 else 3 if grad > 0 else 1

        if logp_only:
            s2, s3 = 3, 3
            d_core, d_surf = None, None
            location = "Undetermined"
            final_score = s1
        else:
            d_core = get_hansen_dist(hsp, f['core_hsp'])
            d_surf = get_hansen_dist(hsp, f['surf_hsp'])

            s2 = 5 if d_core < 8.0 else 3 if d_core < 10.0 else 1
            s3 = 5 if min(d_core, d_surf) < 8.0 else 3

            # Weighted location prediction
            h1_core = 1.0 if grad > 1.0 else 0.0
            hsp_favors_core = 1.0 if d_core <= d_surf else 0.0
            core_score = (weights['h1'] * h1_core +
                          weights['h2'] * hsp_favors_core +
                          weights['h3'] * hsp_favors_core)
            location = "Core" if core_score >= 0.5 else "Interface"

            final_score = (s1 * weights['h1']) + (s2 * weights['h2']) + (s3 * weights['h3'])

        rankings.append({
            'id': fid, 'name': f['name'], 'score': round(final_score, 2),
            'location': location,
            'd_core': d_core,
            'd_surf': d_surf,
            'structure': f['structure'],
            'note': f['experimental_note']
        })

    rankings.sort(key=lambda x: x['score'], reverse=True)

    return jsonify({
        'metadata': {
            'category': category,
            'strategy': strategy,
            'stars': confidence,
            'logp_only': logp_only,
            'too_hydrophilic': too_hydrophilic
        },
        'results': rankings
    })

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.route('/api/formulations', methods=['GET'])
def get_formulations():
    """List all formulations in the database."""
    FORMULATIONS = load_formulations()
    return jsonify(FORMULATIONS)

@app.route('/api/formulations', methods=['POST'])
def add_formulation():
    """Add a new formulation. Requires X-Admin-Key header."""
    if not check_admin(request):
        return jsonify({'error': 'Unauthorised'}), 401

    body = request.json
    required = ['id', 'name', 'core_logp', 'surf_logp',
                'core_hsp', 'surf_hsp', 'structure', 'experimental_note']
    missing = [k for k in required if k not in body]
    if missing:
        return jsonify({'error': f'Missing fields: {missing}'}), 400

    for hsp_field in ('core_hsp', 'surf_hsp'):
        for sub in ('delta_d', 'delta_p', 'delta_h'):
            if sub not in body[hsp_field]:
                return jsonify({'error': f'{hsp_field}.{sub} is required'}), 400

    FORMULATIONS = load_formulations()
    fid = body['id'].strip().upper()
    if fid in FORMULATIONS:
        return jsonify({'error': f'ID {fid} already exists. Use a different ID.'}), 409

    FORMULATIONS[fid] = {
        'name':               body['name'],
        'core_logp':          float(body['core_logp']),
        'surf_logp':          float(body['surf_logp']),
        'core_hsp': {
            'delta_d': float(body['core_hsp']['delta_d']),
            'delta_p': float(body['core_hsp']['delta_p']),
            'delta_h': float(body['core_hsp']['delta_h']),
        },
        'surf_hsp': {
            'delta_d': float(body['surf_hsp']['delta_d']),
            'delta_p': float(body['surf_hsp']['delta_p']),
            'delta_h': float(body['surf_hsp']['delta_h']),
        },
        'structure':          body['structure'],
        'experimental_note':  body['experimental_note'],
    }
    save_formulations(FORMULATIONS)
    return jsonify({'success': True, 'id': fid}), 201

@app.route('/api/formulations/<fid>', methods=['DELETE'])
def delete_formulation(fid):
    """Delete a formulation by ID. Requires X-Admin-Key header."""
    if not check_admin(request):
        return jsonify({'error': 'Unauthorised'}), 401

    FORMULATIONS = load_formulations()
    fid = fid.upper()
    if fid not in FORMULATIONS:
        return jsonify({'error': f'{fid} not found'}), 404

    del FORMULATIONS[fid]
    save_formulations(FORMULATIONS)
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
