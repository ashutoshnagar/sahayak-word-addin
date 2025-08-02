# Sahayak - Git Integration & Office 365 Deployment Guide

## 🎯 Git-Based Integration Complete Setup

### Step 1: Create GitHub Repository

**Option A: Via GitHub Web Interface (Recommended)**
1. Go to https://github.com
2. Click "New repository" (+ icon)
3. Repository name: `sahayak-word-addin`
4. Description: `Sahayak - Grammarly-like Word add-in for document compliance checking`
5. Set to **Public** (required for Office 365 integration)
6. **DO NOT** initialize with README (we already have files)
7. Click "Create repository"

**Option B: Via GitHub CLI (if installed)**
```bash
gh repo create sahayak-word-addin --public --description "Sahayak - Grammarly-like Word add-in for document compliance checking"
```

### Step 2: Connect Local Repository to GitHub

After creating the GitHub repository, connect your local repo:

```bash
cd /Users/ashutoshnagar/client-projects/sahayak-word-addin

# Add GitHub as remote origin
git remote add origin https://github.com/ashutoshnagar/sahayak-word-addin.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Set Up Automatic Deployment (Vercel + GitHub)

**3A: Connect Vercel to GitHub**
1. Go to https://vercel.com
2. Sign in with GitHub account
3. Click "New Project"
4. Import your `sahayak-word-addin` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `echo "Static build"`
   - **Output Directory**: `public`
6. Click "Deploy"

**3B: Automatic Deployments**
Once connected:
- ✅ **Every push to `main`** = Automatic deployment
- ✅ **Preview deployments** for pull requests
- ✅ **Production URL** like: `https://sahayak-word-addin.vercel.app`

### Step 4: Update Manifest with Production URL

After first deployment, get your Vercel URL and update `public/manifest.xml`:

```xml
<!-- Replace all URLs with your Vercel URL -->
<DefaultSettings>
    <SourceLocation DefaultValue="https://sahayak-word-addin.vercel.app/taskpane.html" />
</DefaultSettings>

<bt:Urls>
    <bt:Url id="Commands.Url" DefaultValue="https://sahayak-word-addin.vercel.app/commands.html" />
    <bt:Url id="Taskpane.Url" DefaultValue="https://sahayak-word-addin.vercel.app/taskpane.html" />
</bt:Urls>
```

Then commit and push:
```bash
git add public/manifest.xml
git commit -m "Update manifest with production Vercel URL"
git push origin main
```

### Step 5: Office 365 Integration

**5A: Direct Sideloading**
1. Open https://office.com → Word Online
2. Create/open a document
3. Insert → Add-ins → Upload My Add-in
4. Upload your updated `manifest.xml`
5. Look for "सहायक" in the ribbon

**5B: Enterprise Deployment**
1. Microsoft 365 Admin Center: https://admin.microsoft.com
2. Settings → Integrated apps → Upload custom apps
3. Upload manifest.xml
4. Deploy to organization

**5C: SharePoint App Catalog**
1. SharePoint Admin Center
2. More features → Apps → App Catalog
3. Upload manifest.xml
4. Deploy to users/groups

## 🔄 Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Test at: http://localhost:8080/taskpane.html
```

### Make Changes & Deploy
```bash
# Make your changes
git add .
git commit -m "Describe your changes"
git push origin main

# Automatic deployment to Vercel happens!
```

### Feature Branches
```bash
# Create feature branch
git checkout -b feature/new-validation-rule

# Make changes, commit
git add .
git commit -m "Add new validation rule"
git push origin feature/new-validation-rule

# Create Pull Request on GitHub
# Preview deployment automatically created!
```

## 🚀 Git Integration Benefits

### ✅ **Automatic Deployments**
- Push to GitHub → Auto-deploy to Vercel
- No manual deployment steps needed
- Always up-to-date production version

### ✅ **Version Control**
- Track all changes to validation rules
- Rollback to previous versions easily
- Collaborate with team members

### ✅ **Professional Workflow**
- Code reviews via Pull Requests
- Testing with preview deployments
- Documentation in README.md

### ✅ **Office 365 Integration Ready**
- Always accessible HTTPS URLs
- Proper CORS headers configured
- Production-ready manifest.xml

## 📊 Current Status

- ✅ Git repository initialized
- ✅ All files committed (8 files, 2000+ lines)
- ✅ Local development server running
- ⏳ **Next**: Create GitHub repository
- ⏳ **Next**: Connect to Vercel
- ⏳ **Next**: Update manifest URLs
- ⏳ **Next**: Sideload in Office 365

## 🎯 Quick Commands Reference

```bash
# Repository status
git status
git log --oneline

# Development
npm run dev                    # Local server
npm run deploy                 # Manual Vercel deploy

# Git workflow
git add .                      # Stage changes
git commit -m "message"        # Commit
git push origin main           # Deploy to production

# Office 365 testing
open https://office.com        # Open Word Online
# Upload manifest.xml via Insert → Add-ins
```

## 🔧 Troubleshooting

### Issue: Manifest not loading
- Check HTTPS URLs in manifest.xml
- Verify Vercel deployment is live
- Validate manifest.xml format

### Issue: Add-in not visible
- Clear Office cache: Sign out → Sign in
- Check browser console for errors
- Verify manifest URLs are accessible

### Issue: CORS errors
- Our vercel.json handles CORS properly
- Ensure all resources use same domain

---

**Your Sahayak Word add-in is now ready for professional Git-based deployment to Office 365!**
