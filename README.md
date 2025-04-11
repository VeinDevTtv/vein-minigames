# Vein Minigames

A collection of interactive minigames for QBX and QBCore servers, providing a variety of engaging challenges from easy to hard difficulty.

## Features

- **Multiple Games**: Includes a variety of minigames with different mechanics
- **Difficulty Levels**: Each game has easy, medium, and hard modes
- **Framework Support**: Works with both QBX and QBCore
- **Modern UI**: Built with React and TypeScript for a polished experience
- **Browser Testing**: Test minigames directly in your browser without needing FiveM

## Games Included

1. **Memory Tiles** (Easy): Memorize and reproduce patterns of highlighted tiles
2. **VoltLab** (Medium): Connect the correct sequence of electrical nodes
3. **Fingerprint** (Medium): Match fingerprint patterns within a time limit
4. **Thermite** (Hard): Memorize and reproduce complex grid patterns quickly
5. **Maze** (Hard): Navigate through a maze while avoiding traps

## Installation

1. Download or clone this repository into your server's resources folder
2. Add `ensure vein-minigames` to your server.cfg
3. (Optional) Install npm dependencies and build the UI:
   ```
   cd vein-minigames/web
   npm install
   npm run build
   ```
   Note: A placeholder UI is included, so the npm build step is optional

## Usage in Scripts

You can use the minigames in any resource:

```lua
-- Start a minigame
exports['vein-minigames']:StartMinigame('memoryTiles', 'medium')

-- Check if a minigame is playing
exports['vein-minigames']:IsMinigamePlaying()

-- Get the result of the last minigame
local result = exports['vein-minigames']:GetMinigameResult()
```

For more detailed usage examples and patterns, see the `INTEGRATION.md` file.

## Browser Testing

You can test all minigames directly in your browser without needing to run them in-game:

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

4. Your browser should open to: `http://localhost:3000?test=true`

For more detailed instructions, see the `BROWSER_TESTING.md` file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- UI components built with React and Chakra UI
- Game mechanics inspired by popular server minigames 