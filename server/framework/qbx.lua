--[[ QBX Framework Server Integration ]]--

local QBX = exports['qbx_core']:GetCoreObject()

-- Register items with the framework
CreateThread(function()
    -- Memory Tiles item
    QBX.Functions.AddItem('memory_puzzle', {
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
    })
    
    -- VoltLab item
    QBX.Functions.AddItem('volt_kit', {
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
    })
    
    -- Fingerprint item
    QBX.Functions.AddItem('fingerprint_kit', {
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
    })
    
    -- Thermite item
    QBX.Functions.AddItem('thermite', {
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
    })
    
    -- Maze item
    QBX.Functions.AddItem('maze_puzzle', {
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
    })
end)

-- Handle giving items to players
RegisterServerEvent('vein-minigames:server:giveItem')
AddEventHandler('vein-minigames:server:giveItem', function(item, amount)
    local src = source
    local Player = QBX.Functions.GetPlayer(src)
    
    if Player and amount > 0 then
        Player.Functions.AddItem(item, amount)
        TriggerClientEvent('inventory:client:ItemBox', src, QBX.Shared.Items[item], 'add')
    end
end)

-- Log minigame completion for analytics
RegisterServerEvent('vein-minigames:server:logCompletion')
AddEventHandler('vein-minigames:server:logCompletion', function(game, difficulty, success)
    local src = source
    local Player = QBX.Functions.GetPlayer(src)
    
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