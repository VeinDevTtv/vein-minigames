--[[ Memory Tiles Game ]]--

-- Chance to drop memory puzzle item when doing certain activities
RegisterNetEvent('vein-minigames:client:dropMemoryPuzzle')
AddEventHandler('vein-minigames:client:dropMemoryPuzzle', function()
    -- Random chance to find a memory puzzle item while doing activities
    local chance = math.random(1, 100)
    if chance <= 10 then -- 10% chance
        TriggerServerEvent('vein-minigames:server:giveItem', 'memory_puzzle', 1)
        TriggerEvent('QBCore:Notify', 'You found a memory puzzle!', 'success')
    end
end)

-- Example usage in other resources:
-- To start the game directly:
-- local success = exports['vein-minigames']:StartMinigame('memoryTiles', 'easy')

-- Advanced usage with callback:
-- exports['vein-minigames']:StartMinigame('memoryTiles', 'medium')
-- Citizen.CreateThread(function()
--     while exports['vein-minigames']:IsMinigamePlaying() do
--         Citizen.Wait(100)
--     end
--     local success = exports['vein-minigames']:GetMinigameResult()
--     if success then
--         -- Handle success
--     else
--         -- Handle failure
--     end
-- end) 