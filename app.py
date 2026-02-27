"""
CADFD Learning Tool - Flask Backend
Computer-Assisted Drug Formulation Design for NLCs
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import math
from typing import Dict, List, Tuple

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# ============================================================================
# FORMULATION DATABASE (From your experimental data)
# ============================================================================

FORMULATIONS = {
    'F1': {
        'name': 'F1 (C8-PS80)',
        'core_lipid': 'Glyceryl caprylate (C8)',
        'surfactant': 'Polysorbate 80',
        'core_logp': 2.70,
        'surf_logp': 2.45,
        'core_hsp': {'delta_d': 16.8, 'delta_p': 5.0, 'delta_h': 12.3},
        'surf_hsp': {'delta_d': 16.5, 'delta_p': 5.0, 'delta_h': 11.0},
        'structure_type': 'Type II amorphous',
        'experimental': {
            'pyrene_i1_i3': 0.810,
            'pyrene_em': 0.41,
            'nile_red_max': 633.7,
            'particle_size': 103.0,
            'pdi': 0.15,
            'zeta': -44.7
        }
    },
    'F2': {
        'name': 'F2 (C10-PS80)',
        'core_lipid': 'Glyceryl caprate (C10)',
        'surfactant': 'Polysorbate 80',
        'core_logp': 3.75,
        'surf_logp': 2.45,
        'core_hsp': {'delta_d': 16.9, 'delta_p': 4.5, 'delta_h': 11.6},
        'surf_hsp': {'delta_d': 16.5, 'delta_p': 5.0, 'delta_h': 11.0},
        'structure_type': 'Type II amorphous',
        'experimental': {
            'pyrene_i1_i3': 0.800,
            'pyrene_em': 0.33,
            'nile_red_max': 628.7,
            'particle_size': 169.0,
            'pdi': 0.17,
            'zeta': -56.9
        }
    },
    'F3': {
        'name': 'F3 (C8-PEG100)',
        'core_lipid': 'Glyceryl caprylate (C8)',
        'surfactant': 'PEG-100 stearate',
        'core_logp': 2.70,
        'surf_logp': 2.54,
        'core_hsp': {'delta_d': 16.8, 'delta_p': 5.0, 'delta_h': 12.3},
        'surf_hsp': {'delta_d': 17.0, 'delta_p': 3.0, 'delta_h': 9.5},
        'structure_type': 'Type I imperfect crystal',
        'experimental': {
            'pyrene_i1_i3': 0.800,
            'pyrene_em': 0.52,
            'nile_red_max': 634.0,
            'particle_size': 98.2,
            'pdi': 0.25,
            'zeta': -51.3
        }
    },
    'F4': {
        'name': 'F4 (C10-PEG100)',
        'core_lipid': 'Glyceryl caprate (C10)',
        'surfactant': 'PEG-100 stearate',
        'core_logp': 3.75,
        'surf_logp': 2.54,
        'core_hsp': {'delta_d': 16.9, 'delta_p': 4.5, 'delta_h': 11.6},
        'surf_hsp': {'delta_d': 17.0, 'delta_p': 3.0, 'delta_h': 9.5},
        'structure_type': 'Type I imperfect crystal',
        'experimental': {
            'pyrene_i1_i3': 0.785,
            'pyrene_em': 0.46,
            'nile_red_max': 632.0,
            'particle_size': 173.8,
            'pdi': 0.21,
            'zeta': -51.3
        }
    }
}

# Validation compounds
VALIDATION_DRUGS = {
    'pyrene': {
        'name': 'Pyrene',
        'smiles': 'C1=CC2=C3C(=C1)C=CC4=CC=CC(=C43)C=C2',
        'logp': 5.19,
        'hsp': {'delta_d': 20.4, 'delta_p': 5.0, 'delta_h': 3.5},
        'classification': 'Highly lipophilic',
        'optimal_formulation': 'F4'
    },
    'nile_red': {
        'name': 'Nile Red',
        'smiles': 'CCN(CC)C1=CC2=C(C=C1)C(=O)C3=C(O2)C=CC4=C3C=CC(=C4)N(CC)CC',
        'logp': 4.0,
        'hsp': {'delta_d': 19.8, 'delta_p': 6.5, 'delta_h': 5.2},
        'classification': 'Moderately lipophilic',
        'optimal_formulation': 'F2'
    }
}

# ============================================================================
# CALCULATION FUNCTIONS
# ============================================================================

def calculate_hsp_distance(hsp1: Dict, hsp2: Dict) -> float:
    """
    Calculate Hansen distance between two components
    Δδ = √[(δD1-δD2)² + (δP1-δP2)² + (δH1-δH2)²]
    """
    dd_diff = hsp1['delta_d'] - hsp2['delta_d']
    dp_diff = hsp1['delta_p'] - hsp2['delta_p']
    dh_diff = hsp1['delta_h'] - hsp2['delta_h']
    
    distance = math.sqrt(dd_diff**2 + dp_diff**2 + dh_diff**2)
    return round(distance, 2)

def evaluate_hypothesis_1(drug_logp: float, formulation: Dict) -> Dict:
    """
    Hypothesis 1: Lipophilic Gradient Theory
    Calculate Δlog P and interpret
    """
    gradient = formulation['core_logp'] - formulation['surf_logp']
    
    # Interpretation
    if gradient > 1.0:
        interpretation = "Excellent"
        stars = 5
    elif gradient > 0.5:
        interpretation = "Good"
        stars = 4
    elif gradient > 0:
        interpretation = "Moderate"
        stars = 3
    else:
        interpretation = "Poor"
        stars = 2
    
    explanation = f"""
    Hypothesis 1: Lipophilic Gradient Theory
    
    Core log P: {formulation['core_logp']}
    Surfactant log P: {formulation['surf_logp']}
    Gradient (Δlog P): {gradient:+.2f}
    
    Interpretation: {interpretation} gradient for core loading
    
    A positive gradient means the drug prefers the lipid core over the 
    surfactant layer, driving drug partitioning into the core phase.
    """
    
    return {
        'gradient': round(gradient, 2),
        'score': stars,
        'interpretation': interpretation,
        'explanation': explanation
    }

def evaluate_hypothesis_2(drug_hsp: Dict, formulation: Dict) -> Dict:
    """
    Hypothesis 2: HSP Core Compatibility
    Calculate Δδ with core only
    """
    delta_core = calculate_hsp_distance(drug_hsp, formulation['core_hsp'])
    
    # Interpretation (lower is better)
    if delta_core < 5.0:
        interpretation = "Excellent compatibility"
        stars = 5
    elif delta_core < 7.0:
        interpretation = "Good compatibility"
        stars = 4
    elif delta_core < 9.0:
        interpretation = "Moderate compatibility"
        stars = 3
    else:
        interpretation = "Poor compatibility"
        stars = 2
    
    explanation = f"""
    Hypothesis 2: HSP Core Compatibility
    
    Drug HSP: δD={drug_hsp['delta_d']}, δP={drug_hsp['delta_p']}, 
              δH={drug_hsp['delta_h']} MPa½
    Core HSP: δD={formulation['core_hsp']['delta_d']}, 
              δP={formulation['core_hsp']['delta_p']}, 
              δH={formulation['core_hsp']['delta_h']} MPa½
    
    Hansen Distance (Δδ): {delta_core} MPa½
    
    Interpretation: {interpretation}
    
    Lower Δδ indicates better molecular compatibility. This hypothesis 
    considers only the core lipid, treating surfactants as passive barriers.
    """
    
    return {
        'delta_core': delta_core,
        'score': stars,
        'interpretation': interpretation,
        'explanation': explanation
    }

def evaluate_hypothesis_3(drug_hsp: Dict, formulation: Dict) -> Dict:
    """
    Hypothesis 3: Competitive Partitioning Theory
    Compare drug compatibility with BOTH core and surfactant
    """
    delta_core = calculate_hsp_distance(drug_hsp, formulation['core_hsp'])
    delta_surf = calculate_hsp_distance(drug_hsp, formulation['surf_hsp'])
    
    # Determine preferred location
    if delta_core < delta_surf:
        preferred_location = 'core'
        best_delta = delta_core
        core_percent = 70
        interface_percent = 30
    else:
        preferred_location = 'interface'
        best_delta = delta_surf
        core_percent = 40
        interface_percent = 60
    
    # Score based on best match
    if best_delta < 5.0:
        stars = 5
    elif best_delta < 7.0:
        stars = 4
    elif best_delta < 9.0:
        stars = 3
    else:
        stars = 2
    
    explanation = f"""
    Hypothesis 3: Competitive Partitioning Theory
    
    Core compatibility: Δδ = {delta_core} MPa½
    Surfactant compatibility: Δδ = {delta_surf} MPa½
    
    Drug prefers: {preferred_location.upper()}
    Predicted distribution: {core_percent}% core, {interface_percent}% interface
    
    This hypothesis recognizes that surfactants are not passive barriers but 
    active participants in drug partitioning. The drug will localize where it 
    has the best molecular compatibility.
    """
    
    return {
        'delta_core': delta_core,
        'delta_surf': delta_surf,
        'preferred_location': preferred_location,
        'best_delta': best_delta,
        'core_percent': core_percent,
        'interface_percent': interface_percent,
        'score': stars,
        'explanation': explanation
    }

def generate_recommendation(drug_logp: float, drug_hsp: Dict, all_results: Dict) -> Dict:
    """
    Generate final recommendation based on drug lipophilicity
    and weighted hypothesis scores
    """
    
    # Weight hypotheses based on drug lipophilicity
    if drug_logp > 5.0:
        # Highly lipophilic (like pyrene)
        weights = {'h1': 0.1, 'h2': 0.3, 'h3': 0.6}
        guidance = "Highly lipophilic drugs (log P > 5)"
        strategy = "Prioritize core polarity and Type I crystalline structures"
    elif drug_logp >= 3.0:
        # Moderately lipophilic (like Nile Red)
        weights = {'h1': 0.2, 'h2': 0.1, 'h3': 0.7}
        guidance = "Moderately lipophilic drugs (log P 3-5)"
        strategy = "Prioritize interfacial properties and competitive partitioning"
    else:
        # Less lipophilic
        weights = {'h1': 0.5, 'h2': 0.1, 'h3': 0.4}
        guidance = "Less lipophilic drugs (log P < 3)"
        strategy = "Maximize lipophilic gradient for core loading"
    
    # Calculate weighted scores
    ranked_formulations = []
    for form_id, results in all_results.items():
        weighted_score = (
            weights['h1'] * results['h1']['score'] +
            weights['h2'] * results['h2']['score'] +
            weights['h3'] * results['h3']['score']
        )
        
        ranked_formulations.append({
            'formulation_id': form_id,
            'formulation_name': FORMULATIONS[form_id]['name'],
            'weighted_score': round(weighted_score, 2),
            'stars': round(weighted_score)
        })
    
    # Sort by weighted score (descending)
    ranked_formulations.sort(key=lambda x: x['weighted_score'], reverse=True)
    
    # Get top recommendation
    top_formulation = ranked_formulations[0]
    
    recommendation = {
        'top_formulation': top_formulation['formulation_id'],
        'formulation_name': top_formulation['formulation_name'],
        'confidence_score': top_formulation['weighted_score'],
        'stars': top_formulation['stars'],
        'guidance': guidance,
        'strategy': strategy,
        'ranking': ranked_formulations,
        'weights_used': weights
    }
    
    return recommendation

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/formulations', methods=['GET'])
def get_formulations():
    """Get all available formulations"""
    return jsonify(FORMULATIONS)

@app.route('/api/validation-drugs', methods=['GET'])
def get_validation_drugs():
    """Get validation compounds (pyrene, Nile Red)"""
    return jsonify(VALIDATION_DRUGS)

@app.route('/api/predict', methods=['POST'])
def predict_formulation():
    """
    Main prediction endpoint
    
    Expected JSON input:
    {
        "drug_logp": 5.19,
        "drug_hsp": {
            "delta_d": 20.4,
            "delta_p": 5.0,
            "delta_h": 3.5
        },
        "formulations": ["F1", "F2", "F3", "F4"]  # optional, defaults to all
    }
    """
    data = request.json
    
    # Validate input
    if 'drug_logp' not in data or 'drug_hsp' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    drug_logp = float(data['drug_logp'])
    drug_hsp = data['drug_hsp']
    
    # Which formulations to evaluate
    formulations_to_eval = data.get('formulations', list(FORMULATIONS.keys()))
    
    # Evaluate all hypotheses for each formulation
    all_results = {}
    for form_id in formulations_to_eval:
        if form_id not in FORMULATIONS:
            continue
            
        formulation = FORMULATIONS[form_id]
        
        h1_result = evaluate_hypothesis_1(drug_logp, formulation)
        h2_result = evaluate_hypothesis_2(drug_hsp, formulation)
        h3_result = evaluate_hypothesis_3(drug_hsp, formulation)
        
        all_results[form_id] = {
            'formulation_name': formulation['name'],
            'h1': h1_result,
            'h2': h2_result,
            'h3': h3_result,
            'experimental_data': formulation.get('experimental', {})
        }
    
    # Generate recommendation
    recommendation = generate_recommendation(drug_logp, drug_hsp, all_results)
    
    response = {
        'drug_properties': {
            'logp': drug_logp,
            'hsp': drug_hsp
        },
        'results': all_results,
        'recommendation': recommendation
    }
    
    return jsonify(response)

@app.route('/api/compare', methods=['POST'])
def compare_formulations():
    """
    Compare all formulations side-by-side for a given drug
    """
    data = request.json
    
    drug_logp = float(data['drug_logp'])
    drug_hsp = data['drug_hsp']
    
    comparison = {
        'drug_logp': drug_logp,
        'formulations': {}
    }
    
    for form_id, formulation in FORMULATIONS.items():
        gradient = formulation['core_logp'] - formulation['surf_logp']
        delta_core = calculate_hsp_distance(drug_hsp, formulation['core_hsp'])
        delta_surf = calculate_hsp_distance(drug_hsp, formulation['surf_hsp'])
        
        comparison['formulations'][form_id] = {
            'name': formulation['name'],
            'gradient': round(gradient, 2),
            'delta_core': delta_core,
            'delta_surf': delta_surf,
            'structure_type': formulation['structure_type'],
            'experimental': formulation.get('experimental', {})
        }
    
    return jsonify(comparison)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'version': '1.0.0'})

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    import os
    
    print("=" * 70)
    print("CADFD Learning Tool - Backend Server")
    print("=" * 70)
    print("\nStarting Flask server...")
    print("API endpoints:")
    print("  GET  /api/formulations - Get all formulations")
    print("  GET  /api/validation-drugs - Get validation compounds")
    print("  POST /api/predict - Predict optimal formulation")
    print("  POST /api/compare - Compare all formulations")
    print("  GET  /api/health - Health check")
    
    # Get port from environment variable (for Render deployment) or use 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Disable debug mode in production
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"\nServer running on port {port}")
    print("=" * 70)
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
