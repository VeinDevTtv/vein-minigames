import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, Select, Text, ChakraProvider, extendTheme } from '@chakra-ui/react';
import MemoryTiles from './games/MemoryTiles';
import VoltLab from './games/VoltLab';
import Fingerprint from './games/Fingerprint';
import Thermite from './games/Thermite';
import Maze from './games/Maze';
import { NuiProvider } from './providers/NuiProvider';

// Define game types
export type GameType = 'memoryTiles' | 'voltLab' | 'fingerprint' | 'thermite' | 'maze';
export type DifficultyType = 'easy' | 'medium' | 'hard';

interface GameConfig {
  game: GameType;
  difficulty: DifficultyType;
  config: any;
}

// Define theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'gray.900',
        color: 'white',
      },
    },
  },
});

// Game configurations based on difficulty
const gameConfigs = {
  memoryTiles: {
    easy: {
      gridSize: { x: 3, y: 3 },
      highlightTime: 3000,
      matchTime: 10000,
      maxAttempts: 3,
    },
    medium: {
      gridSize: { x: 4, y: 4 },
      highlightTime: 2500,
      matchTime: 7000,
      maxAttempts: 2,
    },
    hard: {
      gridSize: { x: 5, y: 5 },
      highlightTime: 2000,
      matchTime: 5000,
      maxAttempts: 1,
    },
  },
  voltLab: {
    easy: {
      sequenceLength: 4,
      timeLimit: 30,
    },
    medium: {
      sequenceLength: 6,
      timeLimit: 20,
    },
    hard: {
      sequenceLength: 8,
      timeLimit: 15,
    },
  },
  fingerprint: {
    easy: {
      gridSize: 8,
      segments: 3,
      timeLimit: 30,
    },
    medium: {
      gridSize: 12,
      segments: 4,
      timeLimit: 20,
    },
    hard: {
      gridSize: 16,
      segments: 5,
      timeLimit: 15,
    },
  },
  thermite: {
    easy: {
      gridSize: { x: 4, y: 4 },
      correctBlocks: 6,
      displayTime: 5000,
      inputTime: 10000,
    },
    medium: {
      gridSize: { x: 5, y: 5 },
      correctBlocks: 9,
      displayTime: 4000,
      inputTime: 7000,
    },
    hard: {
      gridSize: { x: 6, y: 6 },
      correctBlocks: 12,
      displayTime: 3000,
      inputTime: 5000,
    },
  },
  maze: {
    easy: {
      size: 11,
      timeLimit: 30,
      traps: 3,
    },
    medium: {
      size: 15,
      timeLimit: 25,
      traps: 5,
    },
    hard: {
      size: 19,
      timeLimit: 20,
      traps: 7,
    },
  },
};

function App() {
  const [visible, setVisible] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('memoryTiles');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>('medium');
  const [lastResult, setLastResult] = useState<string>('');
  
  // Check if we're in browser environment for test mode
  useEffect(() => {
    if (window.location.search.includes('test=true')) {
      setTestMode(true);
    }
  }, []);
  
  const handleMessage = (event: MessageEvent) => {
    const data = event.data;
    
    if (data.action === 'openGame') {
      const gameType = data.game as GameType;
      const difficultyLevel = (data.difficulty || 'medium') as DifficultyType;
      
      if (gameConfigs[gameType] && gameConfigs[gameType][difficultyLevel]) {
        setGameConfig({
          game: gameType,
          difficulty: difficultyLevel,
          config: gameConfigs[gameType][difficultyLevel],
        });
        setVisible(true);
      } else {
        console.error('Invalid game type or difficulty level', data);
      }
    } else if (data.action === 'closeGame') {
      setVisible(false);
      setGameConfig(null);
    }
  };
  
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  const handleGameComplete = (success: boolean, details?: any) => {
    setLastResult(success ? 'SUCCESS!' : 'FAILED!');
    
    // Send result back to the game client
    fetch(`https://vein-minigames/gameComplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ success, details }),
    }).catch(() => {
      // Ignore fetch errors in the browser environment
      console.log('Game completed:', success ? 'SUCCESS!' : 'FAILED!', details);
    });
    
    setTimeout(() => {
      setVisible(false);
      setGameConfig(null);
    }, 1000);
  };
  
  const handleClose = () => {
    fetch(`https://vein-minigames/closeUI`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({}),
    }).catch(() => {
      // Ignore fetch errors in the browser environment
      console.log('UI closed');
    });
    
    setVisible(false);
    setGameConfig(null);
  };
  
  const handleTestGame = () => {
    setGameConfig({
      game: selectedGame,
      difficulty: selectedDifficulty,
      config: gameConfigs[selectedGame][selectedDifficulty],
    });
    setVisible(true);
  };
  
  const renderGame = () => {
    if (!gameConfig) return null;
    
    switch (gameConfig.game) {
      case 'memoryTiles':
        return (
          <MemoryTiles 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'voltLab':
        return (
          <VoltLab 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'fingerprint':
        return (
          <Fingerprint 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'thermite':
        return (
          <Thermite 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'maze':
        return (
          <Maze 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <ChakraProvider theme={theme}>
      <NuiProvider>
        {testMode && !visible && (
          <Box p={5} maxW="500px" margin="0 auto" mt={10} bg="gray.800" borderRadius="md">
            <Text fontSize="2xl" mb={4}>Vein Minigames Test Mode</Text>
            <Flex direction="column" gap={3}>
              <Select 
                value={selectedGame} 
                onChange={(e) => setSelectedGame(e.target.value as GameType)}
                bg="gray.700"
              >
                <option value="memoryTiles">Memory Tiles</option>
                <option value="voltLab">VoltLab Circuit</option>
                <option value="fingerprint">Fingerprint Analysis</option>
                <option value="thermite">Thermite</option>
                <option value="maze">Maze Navigation</option>
              </Select>
              
              <Select 
                value={selectedDifficulty} 
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyType)}
                bg="gray.700"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
              
              <Button colorScheme="blue" onClick={handleTestGame}>
                Start Game
              </Button>
              
              {lastResult && (
                <Text 
                  mt={2} 
                  fontWeight="bold" 
                  color={lastResult === 'SUCCESS!' ? 'green.400' : 'red.400'}
                >
                  Last Result: {lastResult}
                </Text>
              )}
            </Flex>
          </Box>
        )}
        
        {visible && (
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100vw"
            h="100vh"
            bg="rgba(0, 0, 0, 0.8)"
            zIndex="999"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              w="90%"
              h="90%"
              maxW="1200px"
              maxH="800px"
              borderRadius="md"
              overflow="hidden"
              bg="gray.800"
              boxShadow="xl"
            >
              {renderGame()}
            </Box>
          </Box>
        )}
      </NuiProvider>
    </ChakraProvider>
  );
}

export default App; 