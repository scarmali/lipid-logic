================================================================================
GITHUB UPLOAD - STEP BY STEP GUIDE
================================================================================

📤 Upload your CADFD Learning Tool to GitHub

This is the FIRST step before deploying to Render + Cloudflare.

Total time: ~5 minutes

================================================================================
PREREQUISITES
================================================================================

✓ GitHub account (free) - Create at https://github.com/signup
✓ Git installed on your computer
  - Check: Open terminal and type `git --version`
  - If not installed: https://git-scm.com/downloads

================================================================================
STEP-BY-STEP INSTRUCTIONS
================================================================================

STEP 1: Create GitHub Repository (Web Browser)
──────────────────────────────────────────────────────────────────────────────

1. Go to https://github.com
2. Log in to your account
3. Click the "+" icon (top right) → "New repository"

4. Fill in:
   Repository name: cadfd-learning-tool
   Description: Computer-Assisted Drug Formulation Design for NLCs - An 
                interactive learning tool
   
5. Choose:
   ● Public (required for free Cloudflare Pages deployment)
   
6. Do NOT check:
   □ Add a README file (we already have one)
   □ Add .gitignore (we already have one)
   □ Choose a license (we already have one)
   
7. Click "Create repository"

✓ You'll see a page with setup instructions. Keep this open!

STEP 2: Prepare Your Local Repository (Terminal)
──────────────────────────────────────────────────────────────────────────────

Open terminal/command prompt and navigate to your cadfd-tool directory:

```bash
cd /path/to/cadfd-tool
```

Check git is initialized:

```bash
git status
```

If you see "fatal: not a git repository", initialize it:

```bash
git init
```

STEP 3: Add All Files
──────────────────────────────────────────────────────────────────────────────

```bash
git add .
```

This adds all files to staging.

Check what will be committed:

```bash
git status
```

You should see files in green, including:
- app.py
- requirements.txt
- README.md
- DEPLOYMENT.md
- frontend/ directory
- etc.

STEP 4: Create First Commit
──────────────────────────────────────────────────────────────────────────────

```bash
git commit -m "Initial commit: CADFD Learning Tool v1.0"
```

✓ All files are now committed locally!

STEP 5: Connect to GitHub
──────────────────────────────────────────────────────────────────────────────

IMPORTANT: Replace YOUR_USERNAME with your actual GitHub username!

```bash
git remote add origin https://github.com/YOUR_USERNAME/cadfd-learning-tool.git
```

Example:
```bash
git remote add origin https://github.com/sheiliza/cadfd-learning-tool.git
```

Verify it's added:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/cadfd-learning-tool.git (fetch)
origin  https://github.com/YOUR_USERNAME/cadfd-learning-tool.git (push)
```

STEP 6: Rename Branch to 'main'
──────────────────────────────────────────────────────────────────────────────

GitHub uses 'main' as default branch name:

```bash
git branch -M main
```

STEP 7: Push to GitHub! 🚀
──────────────────────────────────────────────────────────────────────────────

```bash
git push -u origin main
```

GitHub will ask for authentication:

**Option A: Personal Access Token (Recommended)**
1. GitHub will prompt for username and password
2. Use your GitHub username
3. For password, use a Personal Access Token (not your account password)
   - Create token at: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name: "CADFD Tool Upload"
   - Check "repo" scope
   - Generate and copy the token
   - Paste when prompted for password

**Option B: SSH (Advanced)**
If you've set up SSH keys, this will work automatically.

✓ Your code is now on GitHub!

STEP 8: Verify Upload
──────────────────────────────────────────────────────────────────────────────

Go to: `https://github.com/YOUR_USERNAME/cadfd-learning-tool`

You should see:
✓ All your files listed
✓ README.md rendered at the bottom
✓ Green "Code" button

Congratulations! 🎉 Your code is on GitHub!

================================================================================
WHAT'S ON GITHUB NOW
================================================================================

Your repository contains:

Backend:
├── app.py (Flask API)
├── requirements.txt (Python dependencies)
├── render.yaml (Render deployment config)
└── runtime.txt (Python version)

Frontend:
└── frontend/
    ├── src/
    │   ├── App.jsx (React app)
    │   ├── App.css (Styles)
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   └── index.html
    └── package.json (Node dependencies)

Documentation:
├── README.md (Main documentation)
├── DEPLOYMENT.md (Deployment guide)
└── LICENSE (MIT license)

Configuration:
├── .gitignore (Files to ignore)
└── .github/workflows/test.yml (Automated testing)

================================================================================
NEXT STEPS
================================================================================

Now that your code is on GitHub, you can:

1. ✓ Deploy to Render (backend) - See DEPLOYMENT.md
2. ✓ Deploy to Cloudflare Pages (frontend) - See DEPLOYMENT.md
3. ✓ Share the repository link with colleagues
4. ✓ Accept contributions from others (future)

Go to DEPLOYMENT.md for the next steps!

================================================================================
MAKING UPDATES LATER
================================================================================

After initial upload, updating is easy:

1. Make changes to your code locally
2. Commit changes:
   ```bash
   git add .
   git commit -m "Description of what you changed"
   ```
3. Push to GitHub:
   ```bash
   git push
   ```

That's it! Your changes are on GitHub.

If you've set up auto-deployment (covered in DEPLOYMENT.md):
✓ Render will automatically redeploy backend
✓ Cloudflare will automatically redeploy frontend

================================================================================
TROUBLESHOOTING
================================================================================

Problem: "Permission denied" when pushing
Solution:
  - Make sure you're using a Personal Access Token, not account password
  - Create token at: https://github.com/settings/tokens
  - Token needs "repo" scope

Problem: "Remote origin already exists"
Solution:
  Remove it and add again:
  ```bash
  git remote remove origin
  git remote add origin https://github.com/YOUR_USERNAME/cadfd-learning-tool.git
  ```

Problem: "Updates were rejected because the remote contains work..."
Solution:
  If this is your first push, the repository should be empty.
  If you accidentally initialized with README, force push:
  ```bash
  git push -u origin main --force
  ```

Problem: Git not installed
Solution:
  Download and install from: https://git-scm.com/downloads
  Restart terminal after installation

Problem: Can't remember GitHub username
Solution:
  Go to https://github.com and look at top right corner when logged in

================================================================================
GITHUB FEATURES YOU NOW HAVE
================================================================================

Your repository automatically includes:

✓ Version Control
  - Every change is tracked
  - Can revert to any previous version
  - See full history of changes

✓ Collaboration
  - Others can fork and contribute
  - Issue tracking for bugs/features
  - Pull requests for code review

✓ Documentation
  - README renders automatically
  - Professional appearance
  - Code syntax highlighting

✓ Automated Testing
  - GitHub Actions runs tests on every push
  - See if code works before deployment

✓ Free Hosting
  - Code is backed up
  - Always accessible
  - Global CDN for fast access

================================================================================
MAKING YOUR REPOSITORY LOOK PROFESSIONAL
================================================================================

Add these to make your repository stand out:

1. Add Topics (on GitHub):
   - Click ⚙️ Settings (right side)
   - Add topics: machine-learning, drug-delivery, education, nanoparticles
   
2. Add a Description:
   - Add: "Interactive learning tool for NLC formulation design"
   
3. Add a Website URL:
   - After Cloudflare deployment, add your live app URL
   
4. Pin Important Files:
   - README.md is automatically shown
   - Link to DEPLOYMENT.md in README for easy access

5. Create Releases:
   - Tag versions: v1.0.0, v1.1.0, etc.
   - Include changelog

================================================================================
SHARING YOUR REPOSITORY
================================================================================

Your repository URL:
`https://github.com/YOUR_USERNAME/cadfd-learning-tool`

Share this:
✓ In your research paper (code availability statement)
✓ On your university website
✓ In course materials
✓ At conferences
✓ On your CV/resume
✓ With other researchers

Example citation:
```
[Your Name]. (2026). CADFD Learning Tool. GitHub repository. 
https://github.com/YOUR_USERNAME/cadfd-learning-tool
```

================================================================================
SUCCESS CHECKLIST
================================================================================

✓ GitHub account created
✓ Repository created on GitHub
✓ Git installed locally
✓ All files committed
✓ Connected to GitHub remote
✓ Code pushed successfully
✓ Repository visible at github.com/YOUR_USERNAME/cadfd-learning-tool

YOU'RE DONE! 🎉

Next: See DEPLOYMENT.md to deploy your app to the cloud!

================================================================================
