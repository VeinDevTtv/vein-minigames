--[[ QBCore Framework Server Integration ]]--

local QBCore = exports['qb-core']:GetCoreObject()

-- Register items with the framework 
-- Note: For QBCore, items are typically registered in shared.lua of the QB-Core resource
-- This is provided for consistency and as an example

-- Handle giving items to players
RegisterServerEvent('vein-minigames:server:giveItem')
AddEventHandler('vein-minigames:server:giveItem', function(item, amount)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player and amount > 0 then
        Player.Functions.AddItem(item, amount)
        TriggerClientEvent('inventory:client:ItemBox', src, QBCore.Shared.Items[item], 'add')
    end
end)

-- Log minigame completion for analytics
RegisterServerEvent('vein-minigames:server:logCompletion')
AddEventHandler('vein-minigames:server:logCompletion', function(game, difficulty, success)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        local charInfo = Player.PlayerData.charinfo
        local citizenId = Player.PlayerData.citizenid
        
        print(string.format('[Vein Minigames] Player %s (ID: %s, CID: %s) %s %s on %s difficulty',
            charInfo.firstname .. ' ' .. charInfo.lastname,
            src,
            citizenId,
            success and 'completed' or 'failed',
            game,
            difficulty
        ))
        
        -- Here you could add database logging if desired
    end
end)

-- Add this to QB-Core items.lua or to a custom shared.lua file:
--[[ 
    -- Memory Tiles item
    ['memory_puzzle'] = {
        name = 'memory_puzzle',
        label = 'Memory Puzzle Game',
        weight = 500,
        type = 'item',
        image = 'memory_puzzle.png',
        unique = false,
        useable = true,
        shouldClose = true,
        combinable = nil,
        description = 'A handheld memory puzzle game'
    },
    
    -- VoltLab item
    ['volt_kit'] = {
        name = 'volt_kit',
        label = 'VoltLab Circuit Kit',
        weight = 1000,
        type = 'item',
        image = 'volt_kit.png',
        unique = false,
        useable = true,
        shouldClose = true,
        combinable = nil,
        description = 'A kit for practicing electrical circuit puzzles'
    },
    
    -- Fingerprint item
    ['fingerprint_kit'] = {
        name = 'fingerprint_kit',
        label = 'Fingerprint Analysis Kit',
        weight = 800,
        type = 'item',
        image = 'fingerprint_kit.png',
        unique = false,
        useable = true,
        shouldClose = true,
        combinable = nil,
        description = 'A device for analyzing and matching fingerprints'
    },
    
    -- Thermite item
    ['thermite'] = {
        name = 'thermite',
        label = 'Thermite Charge',
        weight = 1000,
        type = 'item',
        image = 'thermite.png',
        unique = false,
        useable = true,
        shouldClose = true,
        combinable = nil,
        description = 'A thermite charge that requires precise handling'
    },
    
    -- Maze item
    ['maze_puzzle'] = {
        name = 'maze_puzzle',
        label = 'Maze Puzzle',
        weight = 500,
        type = 'item',
        image = 'maze_puzzle.png',
        unique = false,
        useable = true,
        shouldClose = true,
        combinable = nil,
        description = 'A complex maze puzzle device'
    },
]] 