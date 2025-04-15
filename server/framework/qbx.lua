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

-- Helper function to register items with ox_inventory
local function RegisterItemWithOxInventory(item)
    -- Check if ox_inventory is available
    local success, _ = pcall(function()
        return exports.ox_inventory
    end)
    
    if success then
        -- Use ox_inventory to register the item
        local registered = exports.ox_inventory:RegisterItem({
            name = item.name,
            label = item.label,
            weight = item.weight,
            stack = true,
            close = item.shouldClose,
            description = item.description,
        })
        
        if registered then
            print('^2[vein-minigames] Registered item ' .. item.name .. ' with ox_inventory^0')
        else
            print('^1[vein-minigames] Failed to register item ' .. item.name .. ' with ox_inventory^0')
        end
        
        return registered
    else
        -- Fall back to QBX AddItem if ox_inventory is not available
        print('^3[vein-minigames] ox_inventory not found, using QBX.Functions.AddItem^0')
        QBX.Functions.AddItem(item.name, item)
        return true
    end
end

-- Initialize QBX Core
CreateThread(function()
    if not InitializeQBX() then
        print('^1[vein-minigames] QBX Core initialization failed. Retrying in 5 seconds...^0')
        Wait(5000)
        InitializeQBX()
    end
    
    -- Register items with the framework
    if QBX then
        -- Memory Tiles item
        RegisterItemWithOxInventory({
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
        RegisterItemWithOxInventory({
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
        RegisterItemWithOxInventory({
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
        RegisterItemWithOxInventory({
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
        RegisterItemWithOxInventory({
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
    local useOxInventory = pcall(function() return exports.ox_inventory end)
    
    if useOxInventory then
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