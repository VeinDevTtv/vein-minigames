--[[ Vein Minigames Server Rewards ]]--

local QBCore = nil

-- Initialize framework
CreateThread(function()
    if Config.Framework == 'qbx' then
        local success, result = pcall(function() 
            return exports['qbx_core']:GetCoreObject() 
        end)
        
        if success and result then
            QBCore = result
            print('^2[vein-minigames] QBX Core loaded in rewards module^0')
        else
            -- Try alternative methods
            success, result = pcall(function() 
                return exports['qbx_core']:GetSharedObject() 
            end)
            
            if success and result then
                QBCore = result
                print('^2[vein-minigames] QBX Core loaded in rewards module via GetSharedObject^0')
            else
                -- Try QBCore as fallback
                success, result = pcall(function() 
                    return exports['qb-core']:GetCoreObject() 
                end)
                
                if success and result then
                    QBCore = result
                    print('^2[vein-minigames] QBCore loaded in rewards module as fallback^0')
                else
                    print('^1[vein-minigames] Failed to load core in rewards module^0')
                end
            end
        end
    elseif Config.Framework == 'qbcore' then
        local success, result = pcall(function() 
            return exports['qb-core']:GetCoreObject() 
        end)
        
        if success and result then
            QBCore = result
        else
            print('^1[vein-minigames] Failed to load QBCore in rewards module^0')
        end
    end
end)

-- Reward configuration
local Rewards = {
    memoryTiles = {
        easy = {
            cash = {min = 50, max = 100},
            items = {
                {name = 'water', amount = 1, chance = 100}
            }
        },
        medium = {
            cash = {min = 100, max = 200},
            items = {
                {name = 'water', amount = 1, chance = 100},
                {name = 'sandwich', amount = 1, chance = 50}
            }
        },
        hard = {
            cash = {min = 200, max = 300},
            items = {
                {name = 'water', amount = 1, chance = 100},
                {name = 'sandwich', amount = 1, chance = 100},
                {name = 'lockpick', amount = 1, chance = 25}
            }
        }
    },
    voltLab = {
        easy = {
            cash = {min = 75, max = 150},
            items = {
                {name = 'phone', amount = 1, chance = 10}
            }
        },
        medium = {
            cash = {min = 150, max = 250},
            items = {
                {name = 'phone', amount = 1, chance = 20}
            }
        },
        hard = {
            cash = {min = 250, max = 350},
            items = {
                {name = 'phone', amount = 1, chance = 30},
                {name = 'electronickit', amount = 1, chance = 15}
            }
        }
    },
    fingerprint = {
        easy = {
            cash = {min = 100, max = 200},
            items = {
                {name = 'cryptostick', amount = 1, chance = 10}
            }
        },
        medium = {
            cash = {min = 200, max = 300},
            items = {
                {name = 'cryptostick', amount = 1, chance = 20}
            }
        },
        hard = {
            cash = {min = 300, max = 400},
            items = {
                {name = 'cryptostick', amount = 1, chance = 30},
                {name = 'laptop', amount = 1, chance = 10}
            }
        }
    },
    thermite = {
        easy = {
            cash = {min = 150, max = 250},
            items = {
                {name = 'thermite', amount = 1, chance = 5}
            }
        },
        medium = {
            cash = {min = 250, max = 350},
            items = {
                {name = 'thermite', amount = 1, chance = 10}
            }
        },
        hard = {
            cash = {min = 350, max = 450},
            items = {
                {name = 'thermite', amount = 1, chance = 15},
                {name = 'security_card_01', amount = 1, chance = 5}
            }
        }
    },
    maze = {
        easy = {
            cash = {min = 125, max = 225},
            items = {
                {name = 'hackingdevice', amount = 1, chance = 5}
            }
        },
        medium = {
            cash = {min = 225, max = 325},
            items = {
                {name = 'hackingdevice', amount = 1, chance = 10}
            }
        },
        hard = {
            cash = {min = 325, max = 425},
            items = {
                {name = 'hackingdevice', amount = 1, chance = 15},
                {name = 'security_card_02', amount = 1, chance = 5}
            }
        }
    }
}

-- Function to give rewards
RegisterServerEvent('vein-minigames:server:rewardPlayer')
AddEventHandler('vein-minigames:server:rewardPlayer', function(game, difficulty)
    local src = source
    if not QBCore then
        print('^1[vein-minigames] Framework not initialized in rewards module. Cannot reward player.^0')
        return
    end
    
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Check if game and difficulty exist in rewards
    if not Rewards[game] or not Rewards[game][difficulty] then
        print("^1[ERROR] No rewards configured for " .. game .. " on " .. difficulty .. " difficulty^0")
        return
    end
    
    local reward = Rewards[game][difficulty]
    
    -- Give cash reward
    if reward.cash then
        local amount = math.random(reward.cash.min, reward.cash.max)
        Player.Functions.AddMoney('cash', amount)
        TriggerClientEvent('QBCore:Notify', src, 'You received $' .. amount .. ' for completing the minigame!', 'success')
    end
    
    -- Give item rewards based on chance
    if reward.items then
        for _, item in ipairs(reward.items) do
            local chance = math.random(1, 100)
            if chance <= item.chance then
                -- Check if player has enough inventory space
                local canCarry = Player.Functions.AddItem(item.name, item.amount)
                if canCarry then
                    TriggerClientEvent('inventory:client:ItemBox', src, QBCore.Shared.Items[item.name], 'add')
                    TriggerClientEvent('QBCore:Notify', src, 'You received ' .. item.amount .. 'x ' .. QBCore.Shared.Items[item.name].label, 'success')
                else
                    TriggerClientEvent('QBCore:Notify', src, 'Your inventory is full!', 'error')
                end
            end
        end
    end
end) 