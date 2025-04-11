--[[ Vein Minigames QBCore Framework Integration ]]--

local QBCore = exports['qb-core']:GetCoreObject()

-- Register item usability for each minigame
CreateThread(function()
    -- Memory Tiles Item
    QBCore.Functions.CreateUseableItem('memory_puzzle', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'memoryTiles', 'easy')
    end)
    
    -- VoltLab Item
    QBCore.Functions.CreateUseableItem('volt_kit', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'voltLab', 'medium')
    end)
    
    -- Fingerprint Item
    QBCore.Functions.CreateUseableItem('fingerprint_kit', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'fingerprint', 'medium')
    end)
    
    -- Thermite Item
    QBCore.Functions.CreateUseableItem('thermite', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'thermite', 'hard')
    end)
    
    -- Maze Item
    QBCore.Functions.CreateUseableItem('maze_puzzle', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'maze', 'medium')
    end)
end)

-- Listen for game play event
RegisterNetEvent('vein-minigames:client:playGame')
AddEventHandler('vein-minigames:client:playGame', function(game, difficulty)
    local success = StartMinigame(game, difficulty)
    if not success then
        QBCore.Functions.Notify('Failed to start minigame', 'error')
    end
end)

-- Listen for game results
RegisterNetEvent('vein-minigames:client:gameFinished')
AddEventHandler('vein-minigames:client:gameFinished', function(game, difficulty, success, details)
    -- Send result to server for tracking
    TriggerServerEvent('vein-minigames:server:trackUsage', game, difficulty, success)
    
    -- Display notification
    if success then
        QBCore.Functions.Notify('Minigame completed successfully!', 'success')
    else
        QBCore.Functions.Notify('Minigame failed!', 'error')
    end
end)

-- Listen for game cancellation
RegisterNetEvent('vein-minigames:client:gameCancelled')
AddEventHandler('vein-minigames:client:gameCancelled', function(game, difficulty)
    QBCore.Functions.Notify('Minigame cancelled', 'primary')
end) 