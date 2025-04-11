--[[ Vein Minigames Client Main ]]--

-- Initialize core variables
local QBCore = nil
local isPlaying = false
local currentGame = nil
local currentDifficulty = nil
local gameResult = nil
local displayingUI = false

-- Framework detection and initialization
CreateThread(function()
    if Config.Framework == 'auto' then
        if GetResourceState('qbx_core') == 'started' then
            Config.Framework = 'qbx'
        elseif GetResourceState('qb-core') == 'started' then
            Config.Framework = 'qbcore'
        else
            print('^1[ERROR] No supported framework found. Using QBX as fallback.^0')
            Config.Framework = 'qbx'
        end
    end
    
    -- Initialize framework
    if Config.Framework == 'qbx' then
        QBCore = exports['qbx_core']:GetCoreObject()
    elseif Config.Framework == 'qbcore' then
        QBCore = exports['qb-core']:GetCoreObject()
    end
    
    DebugPrint('Framework set to:', Config.Framework)
end)

-- NUI Callback Registration
RegisterNUICallback('gameComplete', function(data, cb)
    DebugPrint('Game completed with result:', json.encode(data))
    isPlaying = false
    gameResult = data.success
    SetNuiFocus(false, false)
    displayingUI = false
    TriggerEvent('vein-minigames:client:gameFinished', currentGame, currentDifficulty, data.success, data.details)
    cb({})
end)

RegisterNUICallback('closeUI', function(_, cb)
    DebugPrint('UI Closed')
    isPlaying = false
    gameResult = false
    SetNuiFocus(false, false)
    displayingUI = false
    TriggerEvent('vein-minigames:client:gameCancelled', currentGame, currentDifficulty)
    cb({})
end)

-- Game Control Functions
function StartMinigame(game, difficulty)
    local valid, errorMsg = IsValidGameAndDifficulty(game, difficulty)
    if not valid then
        DebugPrint('Error starting game:', errorMsg)
        return false, errorMsg
    end
    
    if isPlaying then
        DebugPrint('Already playing a game')
        return false, 'Already playing a game'
    end
    
    currentGame = game
    currentDifficulty = difficulty
    isPlaying = true
    gameResult = nil

    local gameConfig = Config.Games[game].difficulty[difficulty]
    
    DebugPrint('Starting game:', game, 'Difficulty:', difficulty)
    SetNuiFocus(true, true)
    displayingUI = true
    
    SendNUIMessage({
        action = 'openGame',
        game = game,
        difficulty = difficulty,
        config = gameConfig
    })
    
    return true
end

function IsMinigamePlaying()
    return isPlaying
end

function GetMinigameResult()
    return gameResult
end

-- Function to register a callback for when a game is completed
function RegisterMinigameCallback(cb)
    AddEventHandler('vein-minigames:client:gameFinished', cb)
    return true
end

-- Exports
exports('StartMinigame', StartMinigame)
exports('IsMinigamePlaying', IsMinigamePlaying)
exports('GetMinigameResult', GetMinigameResult)
exports('RegisterMinigameCallback', RegisterMinigameCallback)

-- Debug Commands
if Config.Debug then
    RegisterCommand('vein_test_memory', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('memoryTiles', difficulty)
    end, false)
    
    RegisterCommand('vein_test_volt', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('voltLab', difficulty)
    end, false)
    
    RegisterCommand('vein_test_fingerprint', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('fingerprint', difficulty)
    end, false)
    
    RegisterCommand('vein_test_thermite', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('thermite', difficulty)
    end, false)
    
    RegisterCommand('vein_test_maze', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('maze', difficulty)
    end, false)
    
    -- New minigame debug commands
    RegisterCommand('vein_test_wire', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('wireConnection', difficulty)
    end, false)
    
    RegisterCommand('vein_test_pattern', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('patternMatch', difficulty)
    end, false)
    
    RegisterCommand('vein_test_simon', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('simonSays', difficulty)
    end, false)
    
    RegisterCommand('vein_test_code', function(source, args)
        local difficulty = args[1] or 'easy'
        StartMinigame('codeBreaker', difficulty)
    end, false)
end 