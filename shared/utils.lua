--[[ Vein Minigames Utility Functions ]]--

-- Check if value exists in table
function TableContains(table, val)
    for i = 1, #table do
        if table[i] == val then
            return true
        end
    end
    return false
end

-- Get random elements from a table
function GetRandomElements(tbl, count)
    local result = {}
    local tableSize = #tbl
    count = math.min(count, tableSize)
    
    local indices = {}
    for i = 1, tableSize do
        indices[i] = i
    end
    
    for i = 1, count do
        local randIndex = math.random(1, #indices)
        table.insert(result, tbl[indices[randIndex]])
        table.remove(indices, randIndex)
    end
    
    return result
end

-- Shuffle a table randomly
function ShuffleTable(tbl)
    for i = #tbl, 2, -1 do
        local j = math.random(i)
        tbl[i], tbl[j] = tbl[j], tbl[i]
    end
    return tbl
end

-- Deep copy a table
function DeepCopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[DeepCopy(orig_key)] = DeepCopy(orig_value)
        end
        setmetatable(copy, DeepCopy(getmetatable(orig)))
    else
        copy = orig
    end
    return copy
end

-- Debug print function that only works when Config.Debug is true
function DebugPrint(...)
    if Config.Debug then
        print('[VEIN-DEBUG]', ...)
    end
end

-- Function to check if valid game and difficulty
function IsValidGameAndDifficulty(game, difficulty)
    if not Config.Games[game] then
        return false, 'Invalid game type'
    end
    
    if not Config.Games[game].enabled then
        return false, 'Game is disabled'
    end
    
    if not Config.Games[game].difficulty[difficulty] then
        return false, 'Invalid difficulty level'
    end
    
    return true
end 