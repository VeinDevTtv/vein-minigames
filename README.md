# Vein Minigames

A collection of interactive minigames for QBX and QBCore servers, providing a variety of engaging challenges from easy to hard difficulty.

## Features

- **Multiple Games**: Includes a variety of minigames with different mechanics
- **Difficulty Levels**: Each game has easy, medium, and hard modes
- **Framework Support**: Works with both QBX and QBCore
- **Modern UI**: Built with React and TypeScript for a polished experience

## Games Included

1. **Memory Tiles** (Easy): Memorize and reproduce patterns of highlighted tiles
2. **VoltLab** (Medium): Connect the correct sequence of electrical nodes
3. **Fingerprint** (Medium): Match fingerprint patterns within a time limit
4. **Thermite** (Hard): Memorize and reproduce complex grid patterns quickly
5. **Maze** (Hard): Navigate through a maze while avoiding traps

## Installation

1. Download or clone this repository
2. Place the `vein-minigames` folder in your server's resources directory
3. Add `ensure vein-minigames` to your server.cfg

## Usage

### Exports

The resource provides the following exports:

```lua
-- Start a minigame and return whether it was successfully started
-- game: 'memoryTiles', 'voltLab', 'fingerprint', 'thermite', 'maze'
-- difficulty: 'easy', 'medium', 'hard'
exports['vein-minigames']:StartMinigame(game, difficulty)

-- Check if a minigame is currently active
exports['vein-minigames']:IsMinigamePlaying()

-- Get the result of the last played minigame (nil if no game played yet)
exports['vein-minigames']:GetMinigameResult()
```

### Example Usage

```lua
-- Start a memory tiles game on easy difficulty
RegisterCommand('test_memory', function()
    local success = exports['vein-minigames']:StartMinigame('memoryTiles', 'easy')
    if success then
        -- Wait for game to complete
        CreateThread(function()
            while exports['vein-minigames']:IsMinigamePlaying() do
                Wait(100)
            end
            
            -- Get the result
            local result = exports['vein-minigames']:GetMinigameResult()
            if result then
                print('Player completed the memory game!')
            else
                print('Player failed the memory game!')
            end
        end)
    end
end)
```

## Building the UI

If you need to modify the UI:

1. Navigate to the `vein-minigames/web` directory
2. Run `npm install` to install dependencies
3. Make your changes
4. Run `npm run build` to build the production version

## Configuration

Edit the `config.lua` file to customize game settings, difficulty levels, and more.

## Credits

Inspired by minigames from NoPixel 4.0 and Prodigy RP servers.

## License

MIT License 