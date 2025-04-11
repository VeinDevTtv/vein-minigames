const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
  console.log('Created build directory');
}

// Create placeholder files for the UI
const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vein Minigames</title>
  <style>
    body, html {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: transparent !important;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: sans-serif;
      color: white;
    }
    .container {
      background-color: rgba(0,0,0,0.7);
      padding: 20px;
      border-radius: 5px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Vein Minigames</h1>
    <p>Placeholder UI - This will be replaced by a proper React build</p>
    <p>Install npm dependencies and run <code>npm run build</code> to generate the real UI</p>
  </div>
  <script>
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data.action === 'openGame') {
        console.log('Game opened:', data.game, 'Difficulty:', data.difficulty);
      }
    });
    
    function completeGame(success) {
      fetch('https://vein-minigames/gameComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ success }),
      });
    }
    
    function closeUI() {
      fetch('https://vein-minigames/closeUI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({}),
      });
    }
  </script>
</body>
</html>`;

// Write the placeholder index.html file
fs.writeFileSync(path.join(buildDir, 'index.html'), indexHtml);
console.log('Created placeholder index.html');

console.log('Build process complete');
console.log('\n----- INSTRUCTIONS -----');
console.log('1. To use the placeholder UI (no npm needed):');
console.log('   - Just start the resource in FiveM with "ensure vein-minigames"');
console.log('   - This placeholder UI is already functional for basic testing\n');
console.log('2. To build the full React UI:');
console.log('   - Install dependencies: npm install');
console.log('   - Build command: npm run build\n');
console.log('3. To test in browser outside of FiveM:');
console.log('   - Run: npm run browser-test');
console.log('   - Or on Windows, use the browser_test.bat file in the parent directory');
console.log('   - Browser will open to http://localhost:3000?test=true\n');
console.log('4. If you encounter TypeScript errors during development:');
console.log('   - They are warnings only and will not prevent testing');
console.log('   - Fix type issues before final build for production');
console.log('-------------------------');