# Vein Minigames Integration Guide

This document explains how to integrate the Vein Minigames resource with other resources in your QBX/QBCore server.

## Basic Integration

The resource provides simple exports that you can use in any other resource:

```lua
-- Start a minigame and return whether it started successfully
local success = exports['vein-minigames']:StartMinigame(gameType, difficulty)

-- Check if a minigame is currently active
local isPlaying = exports['vein-minigames']:IsMinigamePlaying()

-- Get the result of the last played minigame (true/false or nil if no game played yet)
local result = exports['vein-minigames']:GetMinigameResult()
```

### Game Types
- `'memoryTiles'` - Memory Tiles game (easier)
- `'voltLab'` - VoltLab Circuit game (medium)
- `'fingerprint'` - Fingerprint Analysis game (medium)
- `'thermite'` - Thermite game (harder)
- `'maze'` - Maze Navigation game (harder)

### Difficulty Levels
- `'easy'`
- `'medium'`
- `'hard'`

## Example Implementation

Here's how to implement a minigame with a callback pattern:

```lua
-- Start the minigame
local success = exports['vein-minigames']:StartMinigame('thermite', 'medium')

if success then
    -- Create a thread to wait for the result
    CreateThread(function()
        -- Wait for the game to finish
        while exports['vein-minigames']:IsMinigamePlaying() do
            Wait(100)
        end
        
        -- Get the result
        local result = exports['vein-minigames']:GetMinigameResult()
        if result then
            -- Player succeeded
            print("Minigame completed successfully!")
            -- Your success logic here...
        else
            -- Player failed
            print("Minigame failed!")
            -- Your failure logic here...
        end
    end)
else
    -- Failed to start the minigame
    print("Failed to start minigame!")
end
```

## Integration with Existing Resources

We've included an example integration with qbx_storerobbery:

1. Added the vein-minigames dependency to the fxmanifest.lua file
2. Updated the client/main.lua to use our minigames for:
   - Register lockpicking (Memory Tiles game)
   - Keypad safes (Fingerprint game)
   - Padlock safes (Thermite game)
3. Created documentation in README_MINIGAMES.md

You can use this example as a template for integrating with other resources.

## Building the UI

For developers who want to modify the minigames:

1. Navigate to the web directory: `cd vein-minigames/web`
2. Install dependencies: `npm install`
3. Start dev server for local testing: `npm start`
4. Build for production: `npm run build`

## Troubleshooting

If you encounter any issues:

1. Make sure the vein-minigames resource is started before any resources that use it
2. Check the server console for error messages
3. Make sure the web UI is built correctly in the build directory
4. The placeholder UI should work even without building the full React app 