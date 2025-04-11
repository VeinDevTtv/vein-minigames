--[[ Vein Minigames Client Commands ]]--

-- Main command to play minigames
RegisterCommand('playminigame', function(source, args)
    local game = args[1]
    local difficulty = args[2] or 'easy'
    
    if not game then
        TriggerEvent('QBCore:Notify', 'Usage: /playminigame [game] [difficulty]', 'error')
        TriggerEvent('QBCore:Notify', 'Available games: memoryTiles, voltLab, fingerprint, thermite, maze, wireConnection, patternMatch, simonSays, codeBreaker', 'info')
        return
    end
    
    -- Check if the game exists in the config
    if not Config.Games[game] or not Config.Games[game].enabled then
        TriggerEvent('QBCore:Notify', 'Invalid game type. Available games: memoryTiles, voltLab, fingerprint, thermite, maze, wireConnection, patternMatch, simonSays, codeBreaker', 'error')
        return
    end
    
    -- Check if the difficulty is valid
    if not Config.Games[game].difficulty[difficulty] then
        TriggerEvent('QBCore:Notify', 'Invalid difficulty. Available difficulties: easy, medium, hard', 'error')
        return
    end
    
    -- Start the minigame
    local success = exports['vein-minigames']:StartMinigame(game, difficulty)
    
    if not success then
        TriggerEvent('QBCore:Notify', 'Failed to start the minigame', 'error')
    end
end, false)

-- Command suggestions
TriggerEvent('chat:addSuggestion', '/playminigame', 'Play a minigame', {
    { name = 'game', help = 'Game type (memoryTiles, voltLab, fingerprint, thermite, maze, wireConnection, patternMatch, simonSays, codeBreaker)' },
    { name = 'difficulty', help = 'Difficulty level (easy, medium, hard)' }
})

-- Event to handle game completion
RegisterNetEvent('vein-minigames:client:gameFinished')
AddEventHandler('vein-minigames:client:gameFinished', function(game, difficulty, success, details)
    -- Track usage on server
    TriggerServerEvent('vein-minigames:server:trackUsage', game, difficulty, success)
    
    -- Notify player of result
    if success then
        TriggerEvent('QBCore:Notify', 'Minigame completed successfully!', 'success')
    else
        TriggerEvent('QBCore:Notify', 'Minigame failed!', 'error')
    end
    
    -- Trigger reward if successful
    if success then
        TriggerServerEvent('vein-minigames:server:rewardPlayer', game, difficulty)
    end
end) 