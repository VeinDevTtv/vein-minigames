Config = {}

-- Framework Settings
Config.Framework = 'qbx' -- Options: 'qbx', 'qbcore', 'auto' (auto-detect)

-- Debug Settings
Config.Debug = false -- Enable debug prints and test commands

-- Game Settings
Config.Games = {
    -- Memory Tiles Game (Easy)
    memoryTiles = {
        enabled = true,
        difficulty = {
            easy = {
                gridSize = {x = 3, y = 3}, -- 3x3 grid
                matchTime = 5000, -- 5 seconds to memorize
                maxAttempts = 3 -- 3 chances
            },
            medium = {
                gridSize = {x = 4, y = 4}, -- 4x4 grid
                matchTime = 4000, -- 4 seconds to memorize
                maxAttempts = 2 -- 2 chances
            },
            hard = {
                gridSize = {x = 5, y = 5}, -- 5x5 grid
                matchTime = 3000, -- 3 seconds to memorize
                maxAttempts = 1 -- 1 chance
            }
        }
    },
    
    -- VoltLab Game (Medium)
    voltLab = {
        enabled = true,
        difficulty = {
            easy = {
                sequenceLength = 4,
                timeLimit = 30 -- 30 seconds
            },
            medium = {
                sequenceLength = 6,
                timeLimit = 25 -- 25 seconds
            },
            hard = {
                sequenceLength = 8,
                timeLimit = 20 -- 20 seconds
            }
        }
    },
    
    -- Fingerprint Hacking (Medium)
    fingerprint = {
        enabled = true,
        difficulty = {
            easy = {
                gridSize = 4, -- 4x4 grid
                segments = 3, -- Number of segments to match
                timeLimit = 30 -- 30 seconds
            },
            medium = {
                gridSize = 5,
                segments = 4,
                timeLimit = 25
            },
            hard = {
                gridSize = 6,
                segments = 5,
                timeLimit = 20
            }
        }
    },

    -- Thermite Game (Hard)
    thermite = {
        enabled = true,
        difficulty = {
            easy = {
                gridSize = {x = 5, y = 5},
                correctBlocks = 6,
                displayTime = 4000, -- 4 seconds
                inputTime = 8000 -- 8 seconds to input
            },
            medium = {
                gridSize = {x = 6, y = 6},
                correctBlocks = 8,
                displayTime = 3500,
                inputTime = 7000
            },
            hard = {
                gridSize = {x = 8, y = 8},
                correctBlocks = 12,
                displayTime = 3000,
                inputTime = 6000
            }
        }
    },

    -- Maze Hacking (Hard)
    maze = {
        enabled = true,
        difficulty = {
            easy = {
                size = 8, -- 8x8 maze
                timeLimit = 30, -- 30 seconds
                traps = 3 -- 3 trap spots
            },
            medium = {
                size = 10,
                timeLimit = 25,
                traps = 5
            },
            hard = {
                size = 12,
                timeLimit = 20,
                traps = 8
            }
        }
    },
    
    -- Wire Connection Game (Medium)
    wireConnection = {
        enabled = true,
        difficulty = {
            easy = {
                wireCount = 4,
                timeLimit = 40,
                shuffleCount = 5
            },
            medium = {
                wireCount = 6,
                timeLimit = 30,
                shuffleCount = 10
            },
            hard = {
                wireCount = 8,
                timeLimit = 25,
                shuffleCount = 15
            }
        }
    },
    
    -- Pattern Match Game (Medium)
    patternMatch = {
        enabled = true,
        difficulty = {
            easy = {
                gridSize = 3,
                timeLimit = 60,
                patternsToMatch = 5
            },
            medium = {
                gridSize = 4,
                timeLimit = 50,
                patternsToMatch = 8
            },
            hard = {
                gridSize = 5,
                timeLimit = 40,
                patternsToMatch = 12
            }
        }
    },
    
    -- Simon Says Game (Easy-Hard)
    simonSays = {
        enabled = true,
        difficulty = {
            easy = {
                sequenceLength = 5,
                speedFactor = 1,
                maxAttempts = 3
            },
            medium = {
                sequenceLength = 8,
                speedFactor = 2,
                maxAttempts = 2
            },
            hard = {
                sequenceLength = 12,
                speedFactor = 3,
                maxAttempts = 1
            }
        }
    },
    
    -- Code Breaker Game (Hard)
    codeBreaker = {
        enabled = true,
        difficulty = {
            easy = {
                codeLength = 3,
                maxAttempts = 10,
                timeLimit = 120
            },
            medium = {
                codeLength = 4,
                maxAttempts = 8,
                timeLimit = 90
            },
            hard = {
                codeLength = 5,
                maxAttempts = 6,
                timeLimit = 60
            }
        }
    }
} 