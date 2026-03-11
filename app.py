from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import os
import json
import socket
from urllib.request import urlopen
from urllib.parse import quote as url_quote
from urllib.error import URLError, HTTPError

app = Flask(__name__)
CORS(app)

# ============================================================================
# FORMULATION DATABASE  —  loaded from formulations.json
# ============================================================================

DB_PATH      = os.path.join(os.path.dirname(__file__), 'formulations.json')
LIPID_DB_PATH = os.path.join(os.path.dirname(__file__), 'lipid_db.json')

def load_formulations():
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def save_formulations(data):
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

# ============================================================================
# ADMIN AUTH
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

def aqueous_fraction(logp):
    """Estimate fraction of drug in aqueous phase based on logP."""
    if logp >= 4.0:
        return 0.03
    elif logp >= 2.5:
        return 0.03 + 0.07 * (4.0 - logp) / 1.5
    elif logp >= 0:
        return 0.10 + 0.30 * (2.5 - logp) / 2.5
    else:
        return 0.60

# ============================================================================
# PREDICTION ENDPOINT
# ============================================================================

@app.route('/api/predict', methods=['POST'])
def predict():
    FORMULATIONS = load_formulations()
    data = request.json
    logp = float(data.get('drug_logp', 0))
    hsp_raw = data.get('drug_hsp')
    custom_formulation = data.get('custom_formulation')  # New: optional custom NLC

    # Detect Log P-only mode
    logp_only = (
        hsp_raw is None or
        not isinstance(hsp_raw, dict) or
        all(hsp_raw.get(k) in (None, 0, '') for k in ('delta_d', 'delta_p', 'delta_h'))
    )
    hsp = hsp_raw if not logp_only else None

    # Lipophilicity category and hypothesis weights
    too_hydrophilic = logp < 2.0

    if logp > 5.0:
        weights = {'h1': 0.5, 'h2': 0.4, 'h3': 0.1}
        category, strategy = "Highly Lipophilic", "Core-loading priority"
    elif 3.0 <= logp <= 5.0:
        weights = {'h1': 0.2, 'h2': 0.1, 'h3': 0.7}
        category, strategy = "Moderately Lipophilic", "Competitive partitioning — surfactant shell is a strong competitor"
    elif 2.0 <= logp < 3.0:
        weights = {'h1': 0.6, 'h2': 0.2, 'h3': 0.2}
        category, strategy = "Low Lipophilicity", "Thermodynamic gradient focus"
    else:
        weights = {'h1': 0.0, 'h2': 0.0, 'h3': 1.0}
        category = "Hydrophilic"
        strategy = "Not recommended for NLC core encapsulation"

    confidence = 5 if 4.0 <= logp <= 5.5 else 3 if 2.5 <= logp <= 7.0 else 2 if logp > 7.0 else 1

    # Build formulation set — use custom if provided, else iterate over DB
    if custom_formulation:
        formulations_to_predict = {
            'CUSTOM': {
                'name':              custom_formulation.get('name', 'Custom NLC'),
                'core_logp':         float(custom_formulation['core_logp']),
                'surf_logp':         float(custom_formulation['surf_logp']),
                'core_hsp':          custom_formulation.get('core_hsp', {'delta_d': 16.5, 'delta_p': 3.0, 'delta_h': 4.0}),
                'surf_hsp':          custom_formulation.get('surf_hsp', {'delta_d': 15.5, 'delta_p': 7.0, 'delta_h': 10.0}),
                'structure':         '',
                'experimental_note': '',
            }
        }
    else:
        formulations_to_predict = FORMULATIONS

    # Aqueous-phase fraction (logP-dependent)
    aq_frac = aqueous_fraction(logp)
    aq_frac = min(max(aq_frac, 0.0), 1.0)

    rankings = []
    for fid, f in formulations_to_predict.items():
        grad = f['core_logp'] - f['surf_logp']
        s1   = 5 if grad > 1.0 else 3 if grad > 0 else 1

        # H1 core-pull signal — always computed (used for affinity even in logP-only mode)
        if grad > 1.0:
            h1_core = 1.0
        elif grad > 0:
            h1_core = min(1.0, max(0.0, (logp - 2.0) / 3.0))
        else:
            h1_core = 0.0

        if logp_only:
            s2, s3 = 3, 3
            d_core, d_surf = None, None
            core_score_for_affinity = h1_core

            if grad > 0 and logp >= 2.5:
                location = "Core"
            elif grad < 0 and logp >= 2.5:
                location = "Interface"
            else:
                location = "Undetermined"
            final_score = s1
        else:
            d_core = get_hansen_dist(hsp, f['core_hsp'])
            d_surf = get_hansen_dist(hsp, f['surf_hsp'])
            s2 = 5 if d_core < 8.0 else 3 if d_core < 10.0 else 1
            s3 = 5 if min(d_core, d_surf) < 8.0 else 3
            hsp_favors_core = 1.0 if d_core <= d_surf else 0.0
            core_score = (weights['h1'] * h1_core +
                          weights['h2'] * hsp_favors_core +
                          weights['h3'] * hsp_favors_core)
            core_score_for_affinity = core_score
            location = "Core" if core_score >= 0.5 else "Interface"
            final_score = (s1 * weights['h1']) + (s2 * weights['h2']) + (s3 * weights['h3'])

        # Partition affinity percentages
        remaining = 1.0 - aq_frac
        core_pct  = round(remaining * core_score_for_affinity * 100)
        aq_pct    = round(aq_frac * 100)
        int_pct   = 100 - core_pct - aq_pct

        rankings.append({
            'id':        fid,
            'name':      f['name'],
            'score':     round(final_score, 2),
            'location':  location,
            'd_core':    d_core,
            'd_surf':    d_surf,
            'structure': f.get('structure', ''),
            'note':      f.get('experimental_note', ''),
            'affinities': {'core': core_pct, 'interface': int_pct, 'aqueous': aq_pct},
        })

    rankings.sort(key=lambda x: x['score'], reverse=True)

    return jsonify({
        'metadata': {
            'category':      category,
            'strategy':      strategy,
            'stars':         confidence,
            'logp_only':     logp_only,
            'too_hydrophilic': too_hydrophilic,
        },
        'results': rankings
    })

# ============================================================================
# LOG P ENDPOINT
# ============================================================================

@app.route('/api/logp', methods=['POST'])
def calculate_logp():
    data = request.json or {}
    smiles = (data.get('smiles') or '').strip()
    if not smiles:
        return jsonify({'error': 'No SMILES string provided'}), 400
    try:
        encoded = url_quote(smiles, safe='')
        url = f'http://www.vcclab.org/web/alogps/calc?SMILES={encoded}'
        with urlopen(url, timeout=12) as resp:
            text = resp.read().decode('utf-8', errors='replace').strip()
        if not text:
            return jsonify({'error': 'ALOGPS returned an empty response.'}), 422
        first_line = text.splitlines()[0]
        parts = first_line.split()
        if len(parts) < 2:
            return jsonify({'error': 'Unexpected response from ALOGPS.'}), 422
        logp = float(parts[1])
        return jsonify({'logp': round(logp, 2), 'smiles': smiles, 'source': 'ALOGPS 2.1 (VCCLAB)'})
    except socket.timeout:
        return jsonify({'error': 'ALOGPS timed out.'}), 504
    except (URLError, HTTPError) as e:
        return jsonify({'error': f'Could not reach ALOGPS: {e}.'}), 503
    except (ValueError, IndexError):
        return jsonify({'error': 'Could not parse ALOGPS result.'}), 422
    except Exception as e:
        return jsonify({'error': f'Log P calculation failed: {str(e)}'}), 500

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

# ============================================================================
# LIPID DATABASE ENDPOINT
# ============================================================================

@app.route('/api/lipid-db', methods=['GET'])
def get_lipid_db():
    try:
        with open(LIPID_DB_PATH, 'r') as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({'error': 'Lipid database not found'}), 404

@app.route('/api/formulations', methods=['GET'])
def get_formulations():
    return jsonify(load_formulations())

@app.route('/api/formulations', methods=['POST'])
def add_formulation():
    if not check_admin(request):
        return jsonify({'error': 'Unauthorised'}), 401
    body = request.json
    required = ['id', 'name', 'core_logp', 'surf_logp', 'core_hsp', 'surf_hsp', 'structure', 'experimental_note']
    missing = [k for k in required if k not in body]
    if missing:
        return jsonify({'error': f'Missing fields: {missing}'}), 400
    FORMULATIONS = load_formulations()
    fid = body['id'].strip().upper()
    if fid in FORMULATIONS:
        return jsonify({'error': f'ID {fid} already exists.'}), 409
    FORMULATIONS[fid] = {
        'name': body['name'], 'core_logp': float(body['core_logp']),
        'surf_logp': float(body['surf_logp']),
        'core_hsp': {k: float(body['core_hsp'][k]) for k in ('delta_d','delta_p','delta_h')},
        'surf_hsp': {k: float(body['surf_hsp'][k]) for k in ('delta_d','delta_p','delta_h')},
        'structure': body['structure'], 'experimental_note': body['experimental_note'],
    }
    save_formulations(FORMULATIONS)
    return jsonify({'success': True, 'id': fid}), 201

@app.route('/api/formulations/<fid>', methods=['DELETE'])
def delete_formulation(fid):
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
