const { execSync } = require('child_process');

function runCommand(command, description) {
  try {
    console.log(`\n${description}...`);
    const result = execSync(command, { encoding: 'utf8' });
    console.log('Result:', result || 'Success');
    return result;
  } catch (error) {
    console.error(`Error in ${description}:`, error.message);
    return null;
  }
}

console.log('=== Git Sync Script ===');

// Check current status
const status = runCommand('git status --porcelain', 'Checking git status');
const currentBranch = runCommand('git branch --show-current', 'Getting current branch');

if (status && status.trim()) {
  console.log('\n=== Changes detected ===');
  
  // Add all changes
  runCommand('git add .', 'Adding all changes');
  
  // Commit changes
  const commitMessage = 'Fix split lens CPRS export and validation issues';
  runCommand(`git commit -m "${commitMessage}"`, 'Committing changes');
  
  // Push to current branch
  if (currentBranch && currentBranch.trim()) {
    runCommand(`git push origin ${currentBranch.trim()}`, 'Pushing to remote');
  }
} else {
  console.log('\n=== No changes to commit ===');
}

// Check if we need to sync with main
console.log('\n=== Checking main branch sync ===');
const mainStatus = runCommand('git status -uno', 'Checking status against main');

// Show final status
console.log('\n=== Final Status ===');
runCommand('git status', 'Final git status');
runCommand('git branch -a', 'All branches');
