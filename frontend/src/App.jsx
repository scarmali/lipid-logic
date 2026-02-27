import React, { useState } from 'react';
import './App.css';

// Main App Component
function App() {
  const [mode, setMode] = useState('welcome'); // welcome, tutorial, sandbox, challenge
  const [drugProps, setDrugProps] = useState({
    logp: '',
    delta_d: '',
    delta_p: '',
    delta_h: ''
  });
  const [selectedDrug, setSelectedDrug] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validation drugs
  const validationDrugs = {
    pyrene: {
      name: 'Pyrene (validation compound)',
      logp: 5.19,
      hsp: { delta_d: 20.4, delta_p: 5.0, delta_h: 3.5 }
    },
    nile_red: {
      name: 'Nile Red (validation compound)',
      logp: 4.0,
      hsp: { delta_d: 19.8, delta_p: 6.5, delta_h: 5.2 }
    },
    curcumin: {
      name: 'Curcumin',
      logp: 3.29,
      hsp: { delta_d: 21.2, delta_p: 7.4, delta_h: 9.1 }
    },
    ibuprofen: {
      name: 'Ibuprofen',
      logp: 3.97,
      hsp: { delta_d: 18.0, delta_p: 5.5, delta_h: 8.5 }
    }
  };

  const handleDrugSelect = (drugKey) => {
    const drug = validationDrugs[drugKey];
    setSelectedDrug(drugKey);
    setDrugProps({
      logp: drug.logp.toString(),
      delta_d: drug.hsp.delta_d.toString(),
      delta_p: drug.hsp.delta_p.toString(),
      delta_h: drug.hsp.delta_h.toString()
    });
  };

  const handlePredict = async () => {
    setLoading(true);
    
    // Use environment variable for API URL, fallback to localhost for development
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          drug_logp: parseFloat(drugProps.logp),
          drug_hsp: {
            delta_d: parseFloat(drugProps.delta_d),
            delta_p: parseFloat(drugProps.delta_p),
            delta_h: parseFloat(drugProps.delta_h)
          }
        })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to server. Make sure the backend is running.');
    }
    
    setLoading(false);
  };

  const StarRating = ({ stars }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={i <= stars ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderWelcome = () => (
    <div className="welcome-screen">
      <h1>🔬 CADFD Learning Tool</h1>
      <h2>Computer-Assisted Drug Formulation Design for NLCs</h2>
      
      <div className="welcome-content">
        <p className="subtitle">
          Learn to design optimal nanostructured lipid carrier (NLC) formulations 
          using computational predictions validated by experimental data.
        </p>
        
        <div className="mode-selection">
          <div className="mode-card" onClick={() => setMode('tutorial')}>
            <div className="mode-icon">📚</div>
            <h3>Tutorial Mode</h3>
            <p>Step-by-step lessons with interactive examples</p>
            <button className="mode-button">Start Learning</button>
          </div>
          
          <div className="mode-card" onClick={() => setMode('sandbox')}>
            <div className="mode-icon">🎨</div>
            <h3>Sandbox Mode</h3>
            <p>Explore and experiment with formulation predictions</p>
            <button className="mode-button">Start Exploring</button>
          </div>
          
          <div className="mode-card disabled">
            <div className="mode-icon">🏆</div>
            <h3>Challenge Mode</h3>
            <p>Test your knowledge with progressive challenges</p>
            <button className="mode-button" disabled>Coming Soon</button>
          </div>
        </div>
        
        <div className="about-section">
          <h3>About This Tool</h3>
          <p>
            This tool implements the Computer-Assisted Drug Formulation Design (CADFD) 
            framework for predicting optimal NLC formulations based on three competing 
            hypotheses:
          </p>
          <ul>
            <li><strong>H1: Lipophilic Gradient</strong> - Predicts drug loading based on log P differences</li>
            <li><strong>H2: HSP Core Compatibility</strong> - Uses Hansen Solubility Parameters</li>
            <li><strong>H3: Competitive Partitioning</strong> - Considers both core and surfactant</li>
          </ul>
          <p>
            Experimental validation with pyrene and Nile Red confirms that H3 
            (Competitive Partitioning) provides the most accurate predictions.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSandbox = () => (
    <div className="sandbox-mode">
      <div className="header">
        <button onClick={() => setMode('welcome')} className="back-button">
          ← Back to Home
        </button>
        <h2>Sandbox Mode - Explore Formulation Predictions</h2>
      </div>
      
      <div className="sandbox-container">
        <div className="input-panel">
          <h3>1. Select or Enter Drug Properties</h3>
          
          <div className="drug-selector">
            <label>Choose a drug:</label>
            <select 
              value={selectedDrug} 
              onChange={(e) => handleDrugSelect(e.target.value)}
            >
              <option value="">-- Select drug --</option>
              <option value="pyrene">Pyrene (validation, log P = 5.19)</option>
              <option value="nile_red">Nile Red (validation, log P = 4.0)</option>
              <option value="curcumin">Curcumin (log P = 3.29)</option>
              <option value="ibuprofen">Ibuprofen (log P = 3.97)</option>
            </select>
          </div>
          
          <div className="manual-input">
            <label>Or enter manually:</label>
            
            <div className="input-group">
              <label>log P:</label>
              <input 
                type="number" 
                step="0.01"
                value={drugProps.logp}
                onChange={(e) => setDrugProps({...drugProps, logp: e.target.value})}
                placeholder="e.g., 5.19"
              />
            </div>
            
            <div className="hsp-inputs">
              <h4>Hansen Solubility Parameters (MPa½):</h4>
              <div className="input-group">
                <label>δD (Dispersion):</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={drugProps.delta_d}
                  onChange={(e) => setDrugProps({...drugProps, delta_d: e.target.value})}
                  placeholder="e.g., 20.4"
                />
              </div>
              
              <div className="input-group">
                <label>δP (Polar):</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={drugProps.delta_p}
                  onChange={(e) => setDrugProps({...drugProps, delta_p: e.target.value})}
                  placeholder="e.g., 5.0"
                />
              </div>
              
              <div className="input-group">
                <label>δH (Hydrogen bonding):</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={drugProps.delta_h}
                  onChange={(e) => setDrugProps({...drugProps, delta_h: e.target.value})}
                  placeholder="e.g., 3.5"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handlePredict}
            disabled={!drugProps.logp || !drugProps.delta_d || !drugProps.delta_p || !drugProps.delta_h || loading}
            className="predict-button"
          >
            {loading ? 'Calculating...' : '🔮 Predict Optimal Formulation'}
          </button>
        </div>
        
        {results && (
          <div className="results-panel">
            <h3>Prediction Results</h3>
            
            <div className="recommendation-card">
              <h4>🎯 Recommended Formulation</h4>
              <div className="recommendation-content">
                <div className="formulation-name">
                  {results.recommendation.formulation_name}
                </div>
                <StarRating stars={results.recommendation.stars} />
                <p className="confidence">
                  Confidence Score: {results.recommendation.confidence_score.toFixed(2)}
                </p>
                <p className="guidance">
                  <strong>{results.recommendation.guidance}</strong><br/>
                  {results.recommendation.strategy}
                </p>
              </div>
            </div>
            
            <div className="ranking-section">
              <h4>All Formulations Ranked:</h4>
              {results.recommendation.ranking.map((item, index) => (
                <div key={item.formulation_id} className="ranking-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="formulation">{item.formulation_name}</span>
                  <StarRating stars={item.stars} />
                  <span className="score">{item.weighted_score.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="hypothesis-comparison">
              <h4>Hypothesis Analysis:</h4>
              {Object.entries(results.results).map(([formId, formData]) => (
                <div key={formId} className="formulation-analysis">
                  <h5>{formData.formulation_name}</h5>
                  
                  <div className="hypothesis-results">
                    <div className="hypothesis-card">
                      <h6>H1: Lipophilic Gradient</h6>
                      <p className="score-display">
                        Δlog P: <strong>{formData.h1.gradient > 0 ? '+' : ''}{formData.h1.gradient.toFixed(2)}</strong>
                      </p>
                      <StarRating stars={formData.h1.score} />
                      <p className="interpretation">{formData.h1.interpretation}</p>
                    </div>
                    
                    <div className="hypothesis-card">
                      <h6>H2: HSP Core Match</h6>
                      <p className="score-display">
                        Δδ: <strong>{formData.h2.delta_core} MPa½</strong>
                      </p>
                      <StarRating stars={formData.h2.score} />
                      <p className="interpretation">{formData.h2.interpretation}</p>
                    </div>
                    
                    <div className="hypothesis-card">
                      <h6>H3: Competitive Partitioning</h6>
                      <p className="score-display">
                        Core: {formData.h3.delta_core} | Surf: {formData.h3.delta_surf} MPa½
                      </p>
                      <p className="localization">
                        Prefers: <strong>{formData.h3.preferred_location}</strong>
                      </p>
                      <p className="distribution">
                        {formData.h3.core_percent}% core, {formData.h3.interface_percent}% interface
                      </p>
                      <StarRating stars={formData.h3.score} />
                    </div>
                  </div>
                  
                  {formData.experimental_data && formData.experimental_data.pyrene_i1_i3 && (
                    <div className="experimental-validation">
                      <h6>✓ Experimental Validation Data:</h6>
                      <p>Pyrene I₁/I₃: {formData.experimental_data.pyrene_i1_i3}</p>
                      <p>Nile Red λmax: {formData.experimental_data.nile_red_max} nm</p>
                      <p>Particle size: {formData.experimental_data.particle_size} nm (PDI: {formData.experimental_data.pdi})</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTutorial = () => (
    <div className="tutorial-mode">
      <div className="header">
        <button onClick={() => setMode('welcome')} className="back-button">
          ← Back to Home
        </button>
        <h2>Tutorial Mode - Coming Soon!</h2>
      </div>
      <div className="coming-soon">
        <p>Interactive tutorials are under development.</p>
        <p>For now, try Sandbox Mode to explore formulation predictions.</p>
        <button onClick={() => setMode('sandbox')} className="mode-button">
          Go to Sandbox Mode
        </button>
      </div>
    </div>
  );

  return (
    <div className="App">
      {mode === 'welcome' && renderWelcome()}
      {mode === 'sandbox' && renderSandbox()}
      {mode === 'tutorial' && renderTutorial()}
    </div>
  );
}

export default App;
