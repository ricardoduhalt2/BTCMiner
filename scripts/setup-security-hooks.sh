#!/bin/bash

# Setup security pre-commit hooks to prevent secret leaks

echo "Setting up security pre-commit hooks..."

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent committing secrets
echo "🔍 Scanning for secrets before commit..."

# Check for actual secret values being ADDED (not removed)
if git diff --cached | grep "^+" | grep -E "(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+|0x[a-fA-F0-9]{64}|sk-[a-zA-Z0-9]{48})" 2>/dev/null; then
    echo "❌ BLOCKED: Actual secret values being added!"
    echo "Found patterns that look like real API keys, private keys, or tokens being added."
    echo "Please remove actual secrets and use placeholder values instead."
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\." 2>/dev/null; then
    echo "❌ BLOCKED: .env files should not be committed!"
    echo "Files blocked:"
    git diff --cached --name-only | grep -E "\.env$|\.env\."
    echo ""
    echo "Add these files to .gitignore and use .env.example instead."
    exit 1
fi

# Check for private keys in code
if git diff --cached | grep -i "0x[a-fA-F0-9]\{64\}" 2>/dev/null; then
    echo "❌ BLOCKED: Private key pattern detected!"
    echo "Never commit private keys to Git."
    exit 1
fi

echo "✅ Security scan passed. Proceeding with commit."
EOF

# Make hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit security hook installed successfully!"
echo ""
echo "This hook will:"
echo "- Block commits containing potential secrets"
echo "- Prevent .env files from being committed"
echo "- Scan for private key patterns"
echo ""
echo "To bypass in emergencies (NOT recommended): git commit --no-verify"