#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Portfolio Deployment Switcher\n');

// Function to get recent commits
function getRecentCommits(limit = 10) {
  try {
    const output = execSync(`git log --oneline -${limit}`, { encoding: 'utf8' });
    return output.trim().split('\n').map(line => {
      const [hash, ...messageParts] = line.split(' ');
      return {
        hash,
        message: messageParts.join(' ')
      };
    });
  } catch (error) {
    console.error('❌ Error getting commits:', error.message);
    return [];
  }
}

// Function to checkout a specific commit
function checkoutCommit(hash) {
  try {
    console.log(`\n🔄 Checking out commit: ${hash}`);
    execSync(`git checkout ${hash}`, { stdio: 'inherit' });
    console.log('✅ Successfully checked out commit');
    
    // Install dependencies if needed
    console.log('📦 Installing dependencies...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    
    console.log('🚀 Starting development server...');
    console.log('Press Ctrl+C to stop the server');
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Function to show deployment URLs (if Vercel CLI is available)
function showDeployments() {
  try {
    console.log('\n🌐 Recent Vercel Deployments:');
    const output = execSync('vercel ls --limit 5', { encoding: 'utf8' });
    console.log(output);
  } catch (error) {
    console.log('⚠️  Vercel CLI not available or not linked');
  }
}

// Main menu
function showMenu() {
  const commits = getRecentCommits();
  
  console.log('📋 Recent Commits:');
  commits.forEach((commit, index) => {
    console.log(`${index + 1}. ${commit.hash} - ${commit.message}`);
  });
  
  console.log('\nOptions:');
  console.log('0. Show Vercel deployments');
  console.log('q. Quit');
  
  console.log('\nEnter the number of the commit to test, or option:');
}

// Interactive menu
function startInteractive() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  showMenu();
  
  rl.on('line', (input) => {
    const trimmed = input.trim();
    
    if (trimmed === 'q' || trimmed === 'quit') {
      console.log('👋 Goodbye!');
      rl.close();
      process.exit(0);
    }
    
    if (trimmed === '0') {
      showDeployments();
      showMenu();
      return;
    }
    
    const commits = getRecentCommits();
    const index = parseInt(trimmed) - 1;
    
    if (index >= 0 && index < commits.length) {
      const commit = commits[index];
      rl.close();
      checkoutCommit(commit.hash);
    } else {
      console.log('❌ Invalid selection. Please try again.');
      showMenu();
    }
  });
}

// Check if script directory exists
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Start the interactive menu
startInteractive(); 