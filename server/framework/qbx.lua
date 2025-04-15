--[[ QBX Framework Server Integration ]]--

local QBX = nil

-- Initialize QBX Framework with error handling
local function InitializeQBX()
    -- Method 1: Direct export with pcall
    local success, result = pcall(function()
        return exports['qbx_core']:GetCoreObject()
    end)
    
    if success and result then
        QBX = result
        print('^2[vein-minigames] Initialized QBX with GetCoreObject^0')
        return true
    end
    
    -- Method 2: Backward compatibility
    success, result = pcall(function()
        return exports['qbx_core']:GetSharedObject()
    end)
    
    if success and result then
        QBX = result
        print('^2[vein-minigames] Initialized QBX with GetSharedObject^0')
        return true
    end
    
    -- Method 3: QBCore bridge compatibility
    success, result = pcall(function()
        return exports['qb-core']:GetCoreObject()
    end)
    
    if success and result then
        QBX = result
        print('^2[vein-minigames] Initialized QBX via QBCore bridge^0')
        return true
    end
    
    print('^1[vein-minigames] Failed to initialize QBX Core^0')
    return false
end

-- Items to add - we'll handle these differently for ox_inventory
local minigameItems = {
    memory_puzzle = {
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
    volt_kit = {
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
    fingerprint_kit = {
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
    thermite = {
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
    maze_puzzle = {
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
    }
}

-- Initialize QBX Core
CreateThread(function()
    if not InitializeQBX() then
        print('^1[vein-minigames] QBX Core initialization failed. Retrying in 5 seconds...^0')
        Wait(5000)
        InitializeQBX()
    end
    
    -- Register items with the framework
    if QBX then
        -- Check if we're using ox_inventory
        local hasOxInventory = pcall(function() return exports.ox_inventory end)
        
        -- For each item, register it appropriately based on the inventory system
        for name, item in pairs(minigameItems) do
            if hasOxInventory then
                -- Using ox_inventory - we'll ensure the item exists, no need to register
                -- But we'll make sure it's usable
                QBX.Functions.CreateUseableItem(name, function(source, itemData)
                    -- Just handle usability here - this will differ based on the item
                    TriggerClientEvent('vein-minigames:client:useItem', source, name)
                end)
                
                print('^2[vein-minigames] Made ' .. name .. ' usable with ox_inventory^0')
            else
                -- Using QBX/QBCore inventory - use AddItem method
                QBX.Functions.AddItem(name, item)
                print('^2[vein-minigames] Added ' .. name .. ' to QBX inventory^0')
            end
        end
    else
        print('^1[vein-minigames] QBX Core not initialized. Items not registered.^0')
    end
end)

-- Handle giving items to players
RegisterServerEvent('vein-minigames:server:giveItem')
AddEventHandler('vein-minigames:server:giveItem', function(item, amount)
    local src = source
    if not QBX then
        print('^1[vein-minigames] QBX Core not initialized. Cannot give item.^0')
        return
    end
    
    -- Check if ox_inventory is available
    local hasOxInventory = pcall(function() return exports.ox_inventory end)
    
    if hasOxInventory then
        -- Use ox_inventory to add item
        exports.ox_inventory:AddItem(src, item, amount)
    else
        -- Fall back to QBX method
        local Player = QBX.Functions.GetPlayer(src)
        if Player and amount > 0 then
            Player.Functions.AddItem(item, amount)
            TriggerClientEvent('inventory:client:ItemBox', src, QBX.Shared.Items[item], 'add')
        end
    end
end)

-- Log minigame completion for analytics
RegisterServerEvent('vein-minigames:server:logCompletion')
AddEventHandler('vein-minigames:server:logCompletion', function(game, difficulty, success)
    local src = source
    if not QBX then
        print('^1[vein-minigames] QBX Core not initialized. Cannot log completion.^0')
        return
    end
    
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