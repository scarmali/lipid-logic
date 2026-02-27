from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import os

app = Flask(__name__)
CORS(app)

# ============================================================================
# ENHANCED FORMULATION DATABASE
# ============================================================================

FORMULATIONS = {
    'F1': {
        'name': 'F1 (C8-PS80)',
        'core_logp': 2.70,
        'surf_logp': 2.45,
        'core_hsp': {'delta_d': 16.8, 'delta_p': 5.0, 'delta_h': 12.3},
        'surf_hsp': {'delta_d': 16.5, 'delta_p': 5.0, 'delta_h': 11.0},
        'structure': 'Type II Amorphous',
        'experimental_note': 'Moderate encapsulation; baseline performance.'
    },
    'F2': {
        'name': 'F2 (C10-PS80)',
        'core_logp': 3.75,
        'surf_logp': 2.45,
        'core_hsp': {'delta_d': 16.9, 'delta_p': 4.5, 'delta_h': 11.6},
        'surf_hsp': {'delta_d': 16.5, 'delta_p': 5.0, 'delta_h': 11.0},
        'structure': 'Type II Amorphous', # Source 153
        'experimental_note': 'Optimal for interfacial localization (e.g., Nile Red).' # Source 157
    },
    'F3': {
        'name': 'F3 (C8-PEG100)',
        'core_logp': 2.70,
        'surf_logp': 2.54,
        'core_hsp': {'delta_d': 16.8, 'delta_p': 5.0, 'delta_h': 12.3},
        'surf_hsp': {'delta_d': 17.0, 'delta_p': 3.0, 'delta_h': 9.5},
        'structure': 'Type I Imperfect Crystal', # Source 153
        'experimental_note': 'High clustering observed; poor molecular dispersion.' # Source 113
    },
    'F4': {
        'name': 'F4 (C10-PEG100)',
        'core_logp': 3.75,
        'surf_logp': 2.54,
        'core_hsp': {'delta_d': 16.9, 'delta_p': 4.5, 'delta_h': 11.6},
        'surf_hsp': {'delta_d': 17.0, 'delta_p': 3.0, 'delta_h': 9.5},
        'structure': 'Type I Imperfect Crystal', # Source 153
        'experimental_note': 'Optimal for deep core-loading (e.g., Pyrene).' # Source 156
    }
}

# ============================================================================
# ANALYTICAL LOGIC
# ============================================================================

def get_hansen_dist(h1, h2):
    return round(math.sqrt((h1['delta_d']-h2['delta_d'])**2 + 
                           (h1['delta_p']-h2['delta_p'])**2 + 
                           (h1['delta_h']-h2['delta_h'])**2), 2)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    logp = float(data.get('drug_logp', 0))
    hsp = data.get('drug_hsp', {'delta_d': 0, 'delta_p': 0, 'delta_h': 0})
    
    # 1. Weights based on spatial heterogeneity & Lipophilicity
    if logp > 5.0:
        # High lipophilicity: prioritize core polarity and Type I structures
        weights = {'h1': 0.1, 'h2': 0.3, 'h3': 0.6}
        category, strategy = "Highly Lipophilic", "Core-loading priority"
        confidence = 5 # In your validated range
        
    elif 3.0 <= logp <= 5.0:
        # Moderate lipophilicity: prioritize interfacial accommodation
        weights = {'h1': 0.2, 'h2': 0.1, 'h3': 0.7}
        category, strategy = "Moderately Lipophilic", "Interfacial-loading priority"
        confidence = 5 # In your validated range
        
    elif 2.0 <= logp < 3.0:
        # Low lipophilicity: relies on bulk thermodynamic gradient
        weights = {'h1': 0.6, 'h2': 0.2, 'h3': 0.2}
        category, strategy = "Low Lipophilicity", "Thermodynamic gradient focus"
        confidence = 3 # Outside main validation but still "lipid-loving"
        
    else: # This handles logp < 2.0
        # Hydrophilic drugs: The gradient is irrelevant/negative
        # We focus entirely on the surfactant shell as a "trap" (Hypothesis 3)
        weights = {'h1': 0.05, 'h2': 0.05, 'h3': 0.9}
        category = "Hydrophilic / Low Lipophilicity"
        strategy = "Surface Retention Focus (High risk of leaching)"
        confidence = 1  # 1-star

    # 2. Confidence Rating (Source 177)
    confidence = 5 if 4.0 <= logp <= 5.5 else 3 if 3.0 <= logp <= 6.0 else 1

    rankings = []
    for fid, f in FORMULATIONS.items():
        # Theory scores (1-5 scale)
        grad = f['core_logp'] - f['surf_logp']
        s1 = 5 if grad > 1.0 else 3 if grad > 0 else 1
        
        d_core = get_hansen_dist(hsp, f['core_hsp'])
        s2 = 5 if d_core < 8.0 else 3 if d_core < 10.0 else 1
        
        d_surf = get_hansen_dist(hsp, f['surf_hsp'])
        location = "Core" if d_core <= d_surf else "Interface"
        s3 = 5 if min(d_core, d_surf) < 8.0 else 3
        
        final_score = (s1 * weights['h1']) + (s2 * weights['h2']) + (s3 * weights['h3'])
        
        rankings.append({
            'id': fid, 'name': f['name'], 'score': round(final_score, 2),
            'location': location, 'structure': f['structure'],
            'note': f['experimental_note']
        })

    rankings.sort(key=lambda x: x['score'], reverse=True)

    return jsonify({
        'metadata': {'category': category, 'strategy': strategy, 'stars': confidence},
        'results': rankings
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)