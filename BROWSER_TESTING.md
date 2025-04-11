# Browser Testing Guide for Vein Minigames

This guide will help you test the minigames directly in your browser without needing to run them in-game.

## Requirements

- Node.js (v14 or newer)
- npm (comes with Node.js)

## Setup & Running

1. Navigate to the web directory:
   ```
   cd vein-minigames/web
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Your browser should automatically open to `http://localhost:3000?test=true`

If the browser doesn't open automatically, manually navigate to:
```
http://localhost:3000?test=true
```

The `?test=true` parameter is important as it enables the browser testing interface.

## Using the Testing Interface

1. **Select a Game**: Choose from Memory Tiles, VoltLab Circuit, Fingerprint Analysis, Thermite, or Maze Navigation.

2. **Select Difficulty**: Choose from Easy, Medium, or Hard.

3. **Start Game**: Click the "Start Game" button to begin playing.

4. **Game Results**: After completing a game (success or failure), you'll see the result below the interface.

## Available Games

### Memory Tiles
- **Difficulty Impact**: Changes grid size, highlight time, and match time
- **Gameplay**: Memorize the highlighted tiles and reproduce the pattern

### VoltLab Circuit
- **Difficulty Impact**: Changes sequence length and time limit
- **Gameplay**: Memorize and reproduce the sequence of electrical nodes

### Fingerprint Analysis
- **Difficulty Impact**: Changes grid size, segments to find, and time limit
- **Gameplay**: Find and select the matching fingerprint segments

### Thermite
- **Difficulty Impact**: Changes grid size, number of blocks to memorize, and time limits
- **Gameplay**: Memorize the pattern and recreate it within the time limit

### Maze Navigation
- **Difficulty Impact**: Changes maze size, time limit, and number of traps
- **Gameplay**: Navigate through the maze to reach the end point using arrow keys

## Troubleshooting

- **Blank Screen**: Make sure the URL includes `?test=true`. If not, manually add it.
- **Missing Dependencies**: Run `npm install` again to ensure all dependencies are installed.
- **Component Errors**: Check the browser console for any errors (F12 > Console).

## Building for Production

After testing and making changes, build the production version for use in-game:

```
npm run build
```

This will create optimized files in the `build` directory that the resource will use in-game. 