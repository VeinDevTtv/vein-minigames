--[[ Vein Minigames Server Main ]]--

-- Initialize core variables
local QBCore = nil

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
    
    -- Initialize framework with error handling
    if Config.Framework == 'qbx' then
        local success, result = pcall(function() 
            return exports['qbx_core']:GetCoreObject() 
        end)
        
        if success and result then
            QBCore = result
            print('^2[vein-minigames] QBX Core loaded via GetCoreObject^0')
        else
            -- Try alternative methods
            success, result = pcall(function() 
                return exports['qbx_core']:GetSharedObject() 
            end)
            
            if success and result then
                QBCore = result
                print('^2[vein-minigames] QBX Core loaded via GetSharedObject^0')
            else
                print('^1[vein-minigames] Failed to load QBX Core. Retrying in 3 seconds...^0')
                Wait(3000)
                
                -- One more attempt
                success, result = pcall(function() 
                    return exports['qbx_core']:GetCoreObject() 
                end)
                
                if success and result then
                    QBCore = result
                    print('^2[vein-minigames] QBX Core loaded via GetCoreObject (retry)^0')
                else
                    print('^1[vein-minigames] Failed to load QBX Core after retries^0')
                end
            end
        end
    elseif Config.Framework == 'qbcore' then
        local success, result = pcall(function() 
            return exports['qb-core']:GetCoreObject() 
        end)
        
        if success and result then
            QBCore = result
            print('^2[vein-minigames] QBCore loaded via GetCoreObject^0')
        else
            print('^1[vein-minigames] Failed to load QBCore^0')
        end
    end
    
    print('^2[INFO] Vein Minigames initialized with framework: '..Config.Framework..'^0')
end)

-- Server events to track minigame usage statistics (optional)
RegisterServerEvent('vein-minigames:server:trackUsage')
AddEventHandler('vein-minigames:server:trackUsage', function(game, difficulty, success)
    local src = source
    if not QBCore then
        print('^1[vein-minigames] Framework not initialized. Cannot track usage.^0')
        return
    end
    
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        print(string.format('[Vein Minigames] Player %s (ID: %s) %s the %s game on %s difficulty',
            Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
            src,
            success and 'completed' or 'failed',
            game,
            difficulty
        ))
    end
end)

-- Callback for server-side minigame verification (for anti-cheat purposes)
CreateThread(function()
    Wait(1000) -- Wait for QBCore to be available
    if QBCore then
        QBCore.Functions.CreateCallback('vein-minigames:server:verifyGameResult', function(source, cb, gameData)
            -- This is a placeholder for a future anti-cheat implementation
            -- You can implement server-side verification logic here
            cb(true)
        end)
        
        -- Debug commands
        if Config.Debug then
            QBCore.Commands.Add('vein_debug', 'Toggle vein minigames debug mode', {}, false, function(source)
                Config.Debug = not Config.Debug
                TriggerClientEvent('QBCore:Notify', source, 'Vein Minigames Debug: ' .. (Config.Debug and 'Enabled' or 'Disabled'))
            end, 'admin')
        end
    else
        print('^1[vein-minigames] QBCore not initialized. Callback and commands not registered.^0')
    end
end) 