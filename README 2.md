# CADFD Learning Tool - Web Implementation

Computer-Assisted Drug Formulation Design for Nanostructured Lipid Carriers

## 🎯 Features

- **Sandbox Mode**: Interactive formulation prediction with instant feedback
- **Three Hypothesis Framework**: Compare lipophilic gradient, HSP core compatibility, and competitive partitioning predictions
- **Validation Data**: Built-in pyrene and Nile Red experimental validation
- **Visual Results**: Star ratings, rankings, and detailed analysis
- **Educational**: Clear explanations for all predictions

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ 
- Node.js 16+ and npm
- Modern web browser

### Backend Setup (Flask API)

```bash
# 1. Navigate to project directory
cd cadfd-tool

# 2. Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run the backend server
python app.py
```

Backend will run on http://localhost:5000

### Frontend Setup (React)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

Frontend will run on http://localhost:3000

## 🚀 Deployment

### Quick Deploy to Cloud (FREE!)

Deploy your app to the internet in 20 minutes:

1. **Push to GitHub** (5 min)
2. **Deploy backend to Render** (5 min) - FREE tier
3. **Deploy frontend to Cloudflare Pages** (5 min) - FREE tier
4. **Test and share!** (5 min)

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions.**

### Live Demo

Once deployed, your students can access the tool at:
- Frontend: `https://cadfd-tool.pages.dev`
- Backend API: `https://cadfd-api.onrender.com`

No installation needed! Works on any device with a browser.

---

## 📖 Usage

### Sandbox Mode

1. **Select a Drug**:
   - Choose from validation compounds (Pyrene, Nile Red)
   - Or enter custom drug properties (log P and HSP)

2. **Get Predictions**:
   - Click "Predict Optimal Formulation"
   - See instant results with all three hypotheses

3. **Analyze Results**:
   - View recommended formulation with confidence score
   - Compare all 4 formulations (F1-F4)
   - See detailed hypothesis analysis
   - Access experimental validation data

### Example: Pyrene

```
Input:
- log P: 5.19
- δD: 20.4 MPa½
- δP: 5.0 MPa½
- δH: 3.5 MPa½

Prediction:
✓ F4 (C10-PEG100) - ★★★★★
- Best for highly lipophilic drugs
- Optimizes core polarity
- Matches experimental data (I₁/I₃ = 0.785)
```

## 🏗️ Architecture

### Backend (Python/Flask)

```
app.py
├── Formulation Database (F1-F4 with experimental data)
├── Hypothesis Calculators
│   ├── evaluate_hypothesis_1() - Lipophilic Gradient
│   ├── evaluate_hypothesis_2() - HSP Core Compatibility
│   └── evaluate_hypothesis_3() - Competitive Partitioning
└── API Endpoints
    ├── GET /api/formulations
    ├── GET /api/validation-drugs
    ├── POST /api/predict
    └── POST /api/compare
```

### Frontend (React)

```
App.jsx
├── Welcome Screen (mode selection)
├── Sandbox Mode
│   ├── Drug Input Panel
│   ├── Prediction Engine
│   └── Results Display
└── Tutorial Mode (coming soon)
```

## 📊 API Documentation

### POST /api/predict

Predict optimal formulation for a drug

**Request:**
```json
{
  "drug_logp": 5.19,
  "drug_hsp": {
    "delta_d": 20.4,
    "delta_p": 5.0,
    "delta_h": 3.5
  }
}
```

**Response:**
```json
{
  "recommendation": {
    "top_formulation": "F4",
    "formulation_name": "F4 (C10-PEG100)",
    "confidence_score": 4.75,
    "stars": 5,
    "guidance": "Highly lipophilic drugs (log P > 5)",
    "strategy": "Prioritize core polarity and Type I crystalline structures"
  },
  "results": {
    "F1": { "h1": {...}, "h2": {...}, "h3": {...} },
    ...
  }
}
```

## 🎓 Educational Use

### For Students

- Learn drug-lipid compatibility principles
- Practice computational prediction
- Understand Hansen Solubility Parameters
- Connect theory to experimental data

### For Instructors

- Assign formulation design exercises
- Compare student predictions to validation data
- Demonstrate hypothesis testing
- Integrate into pharmaceutical sciences curriculum

### Sample Assignment

"For curcumin (log P = 3.29, HSP provided), use the CADFD tool to:
1. Predict the optimal formulation using all three hypotheses
2. Explain why different hypotheses give different rankings
3. Justify which hypothesis you trust most based on experimental validation"

## 🔧 Customization

### Adding New Drugs

Edit `app.py` to add validation drugs:

```python
VALIDATION_DRUGS = {
    'your_drug': {
        'name': 'Your Drug Name',
        'logp': 4.5,
        'hsp': {'delta_d': 19.0, 'delta_p': 6.0, 'delta_h': 7.0},
        'classification': 'Moderately lipophilic'
    }
}
```

### Adding New Formulations

Extend the `FORMULATIONS` dictionary with experimental data:

```python
FORMULATIONS['F5'] = {
    'name': 'F5 (Custom)',
    'core_logp': 3.5,
    'surf_logp': 2.8,
    # ... add all required fields
}
```

## 🚀 Deployment

### Option 1: Local Network (for classroom)

```bash
# Backend: Allow network access
python app.py --host=0.0.0.0 --port=5000

# Frontend: Update API URL in App.jsx
const API_URL = 'http://[your-ip]:5000'

# Students access via: http://[your-ip]:3000
```

### Option 2: Cloud Deployment (Heroku)

```bash
# 1. Create Heroku account and install CLI

# 2. Backend deployment
cd cadfd-tool
heroku create cadfd-api
git push heroku main

# 3. Frontend deployment
cd frontend
# Update API_URL to Heroku backend URL
npm run build
# Deploy to Netlify/Vercel
```

### Option 3: Docker (recommended)

```dockerfile
# Dockerfile (backend)
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
```

```bash
# Build and run
docker-compose up
```

## 📝 Future Enhancements

- [ ] Tutorial Mode with interactive lessons
- [ ] Challenge Mode with progressive difficulty
- [ ] 3D Hansen Space Visualization
- [ ] Batch drug processing
- [ ] Export results as PDF reports
- [ ] Machine learning predictions (with more data)
- [ ] Integration with molecular drawing tools
- [ ] Real-time collaboration features

## 📚 Citation

If you use this tool in your research or teaching, please cite:

```
[Your Name]. (2026). CADFD Learning Tool: Computer-Assisted Drug 
Formulation Design for Nanostructured Lipid Carriers. 
[Your Institution/Journal].
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📧 Support

For questions or issues:
- Email: [your-email]
- Issues: [GitHub issues page]

## 📄 License

[Your chosen license - e.g., MIT, GPL-3.0]

## 🙏 Acknowledgments

- Experimental validation data from [Your Lab]
- Based on research published in [Journal]
- Built with Flask and React

---

**Note**: This is a research and educational tool. Formulation predictions 
should be validated experimentally before use in pharmaceutical development.
