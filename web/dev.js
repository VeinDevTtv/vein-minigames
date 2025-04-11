/**
 * Simple development server launcher
 * This script starts the React development server and opens the browser with the test=true parameter
 */

const { exec } = require('child_process');
const open = require('open');

console.log('Starting Vein Minigames development server...');

// Start React development server
const devServer = exec('npm run start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Server output: ${stdout}`);
});

// Log output from the server
devServer.stdout.on('data', (data) => {
  console.log(data.toString());
  
  // When the server is ready, open the browser with test=true parameter
  if (data.includes('Local:') && data.includes('http://localhost')) {
    // Extract the URL
    const match = data.toString().match(/Local:\s*(http:\/\/localhost:\d+)/);
    if (match && match[1]) {
      const url = `${match[1]}?test=true`;
      console.log(`Opening browser at: ${url}`);
      open(url);
    }
  }
});

devServer.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating development server...');
  devServer.kill();
  process.exit();
});

console.log('Development server starting...');
console.log('Press Ctrl+C to stop'); 