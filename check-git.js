const { execSync } = require('child_process');

try {
  console.log('Checking git status...');
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log('Git status:', status || 'No changes');
  
  console.log('\nChecking current branch...');
  const branch = execSync('git branch --show-current', { encoding: 'utf8' });
  console.log('Current branch:', branch.trim());
  
  console.log('\nChecking remote branches...');
  const remotes = execSync('git branch -r', { encoding: 'utf8' });
  console.log('Remote branches:', remotes);
  
} catch (error) {
  console.error('Error:', error.message);
}
