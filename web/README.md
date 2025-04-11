# Vein Minigames Web UI

This directory contains the React application for the vein-minigames resource.

## Development & Testing

### Quick Start (Windows)

1. Double-click the `browser_test.bat` file in the parent directory
2. The development server will start and open your browser automatically

### Manual Start

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run browser-test
   ```
   
   Or alternatively:
   ```
   npm start
   ```
   Then manually navigate to `http://localhost:3000?test=true`

### Testing Features

- Select any game type from the dropdown menu
- Choose a difficulty level
- Click "Start Game" to begin
- Game results will be displayed after completion

## Building for Production

To build the minigames for use in FiveM:

```
npm run build
```

This creates optimized files in the `build` directory which are used by the FiveM resource.

## Customizing Games

Each game can be customized by editing the configuration objects in `src/App.tsx`. Look for the `gameConfigs` object to adjust settings like:

- Grid sizes
- Time limits
- Difficulty levels
- Number of attempts allowed

## Troubleshooting

- If the development server doesn't start, make sure you have Node.js installed
- If you see dependency errors, run `npm install` again
- For other issues, check the browser console (F12 > Console tab) 