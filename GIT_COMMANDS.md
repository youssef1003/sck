# 🔧 Git Commands for Deployment

## 🚀 Initial Setup (First Time Only)

```bash
# Navigate to project directory
cd sck-consulting-platform

# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Production ready: Multi-language, PWA, Clean structure"

# Set branch to main
git branch -M main

# Add remote (replace youssef1003 with your username)
git remote add origin https://github.com/youssef1003/sck.git

# Push to GitHub
git push -u origin main
```

## 🔄 Regular Updates

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your update description"

# Push to GitHub
git push origin main
```

## 🔍 Useful Commands

```bash
# See what changed
git status

# See commit history
git log --oneline

# See remote URL
git remote -v

# Pull latest changes
git pull origin main

# Discard local changes
git checkout -- .

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

## ⚠️ If You Get Errors

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/youssef1003/sck.git
```

### Error: "failed to push"
```bash
git pull origin main --rebase
git push origin main
```

### Error: "Authentication failed"
- Use Personal Access Token instead of password
- Get token from: https://github.com/settings/tokens

## 📝 Good Commit Messages

```bash
# Feature
git commit -m "Add: New contact form validation"

# Fix
git commit -m "Fix: Language switcher not working on mobile"

# Update
git commit -m "Update: Improve AI chatbot responses"

# Style
git commit -m "Style: Enhance button hover effects"

# Docs
git commit -m "Docs: Update deployment guide"
```

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | See what changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit changes |
| `git push` | Upload to GitHub |
| `git pull` | Download from GitHub |
| `git log` | See history |

---

**Tip:** Commit often with clear messages!
