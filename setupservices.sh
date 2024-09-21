#!/bin/bash

# Exit on any command failure
set -e

# Step 1: Check if Git is initialized, skip removal if already initialized
if [ -d .git ]; then
    echo "Git is already initialized. Skipping .git folder removal..."
else
    echo "Removing existing .git folder (if any exists)..."
    rm -rf .git
fi

# Step 2: Install Project Dependencies
echo "Installing project dependencies..."
npm install

# Step 3: Check if Git is already initialized
if [ -d .git ]; then
    echo "Git is already initialized. Skipping Git setup..."
else
    echo "Initializing Git..."
    git init
    echo "Adding remote repository (please replace <your-remote-url> with your actual remote repository URL)..."
    git branch -M main
    git remote add origin git remote add origin https://github.com/LL05-AI-Dowell/dowellemailservices.git
fi

# Step 4: Initialize Husky for Git hooks
echo "Initializing Husky..."
npx husky init

# Step 5: Setup Husky Pre-commit hook for linting
echo "Configuring Husky pre-commit hook..."
echo 'npx lint-staged' > .husky/pre-commit

# Step 6: Install server-side dependencies
echo "Installing server-side dependencies..."
cd server
npm install

# Step 7: Install client-side dependencies
echo "Installing client-side dependencies..."
cd ../client
npm install

# Step 8: Reminder to set up environment files
echo "Please remember to create your environment files: .env.development and .env.production from the .env.example file."

# Step 9: Set execution permissions for start and remove scripts
echo "Setting execution permissions for scripts..."
chmod +x ../runservices.sh
chmod +x ../removeservices.sh

echo "Setup completed! Your project is ready."