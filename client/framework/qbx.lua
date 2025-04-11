--[[ Vein Minigames QBX Framework Integration ]]--

local QBX = exports['qbx_core']:GetCoreObject()

-- Register item usability for each minigame
CreateThread(function()
    -- Memory Tiles Item
    QBX.Functions.CreateUseableItem('memory_puzzle', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'memoryTiles', 'easy')
    end)
    
    -- VoltLab Item
    QBX.Functions.CreateUseableItem('volt_kit', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'voltLab', 'medium')
    end)
    
    -- Fingerprint Item
    QBX.Functions.CreateUseableItem('fingerprint_kit', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'fingerprint', 'medium')
    end)
    
    -- Thermite Item
    QBX.Functions.CreateUseableItem('thermite', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'thermite', 'hard')
    end)
    
    -- Maze Item
    QBX.Functions.CreateUseableItem('maze_puzzle', function(source)
        TriggerEvent('vein-minigames:client:playGame', 'maze', 'medium')
    end)
end)

-- Listen for game play event
RegisterNetEvent('vein-minigames:client:playGame')
AddEventHandler('vein-minigames:client:playGame', function(game, difficulty)
    local success = StartMinigame(game, difficulty)
    if not success then
        QBX.Functions.Notify('Failed to start minigame', 'error')
    end
end)

-- Listen for game results
RegisterNetEvent('vein-minigames:client:gameFinished')
AddEventHandler('vein-minigames:client:gameFinished', function(game, difficulty, success, details)
    -- Send result to server for tracking
    TriggerServerEvent('vein-minigames:server:trackUsage', game, difficulty, success)
    
    -- Display notification
    if success then
        QBX.Functions.Notify('Minigame completed successfully!', 'success')
    else
        QBX.Functions.Notify('Minigame failed!', 'error')
    end
end)

-- Listen for game cancellation
RegisterNetEvent('vein-minigames:client:gameCancelled')
AddEventHandler('vein-minigames:client:gameCancelled', function(game, difficulty)
    QBX.Functions.Notify('Minigame cancelled', 'primary')
end) 