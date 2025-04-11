import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, Select, Text, ChakraProvider, extendTheme, Heading } from '@chakra-ui/react';
import MemoryTiles from './games/MemoryTiles';
import VoltLab from './games/VoltLab';
import Fingerprint from './games/Fingerprint';
import Thermite from './games/Thermite';
import Maze from './games/Maze';
import WireConnection from './games/WireConnection';
import PatternMatch from './games/PatternMatch';
import SimonSays from './games/SimonSays';
import CodeBreaker from './games/CodeBreaker';
import { NuiProvider } from './providers/NuiProvider';

// Define game types
export type GameType = 'memoryTiles' | 'voltLab' | 'fingerprint' | 'thermite' | 'maze' | 'wireConnection' | 'patternMatch' | 'simonSays' | 'codeBreaker';
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
  // New minigame configurations
  wireConnection: {
    easy: {
      wireCount: 4,
      timeLimit: 40,
      shuffleCount: 5,
    },
    medium: {
      wireCount: 6,
      timeLimit: 30,
      shuffleCount: 10,
    },
    hard: {
      wireCount: 8,
      timeLimit: 25,
      shuffleCount: 15,
    },
  },
  patternMatch: {
    easy: {
      gridSize: 3,
      timeLimit: 60,
      patternsToMatch: 5,
    },
    medium: {
      gridSize: 4,
      timeLimit: 50,
      patternsToMatch: 8,
    },
    hard: {
      gridSize: 5,
      timeLimit: 40,
      patternsToMatch: 12,
    },
  },
  simonSays: {
    easy: {
      sequenceLength: 5,
      speedFactor: 1,
      maxAttempts: 3,
    },
    medium: {
      sequenceLength: 8,
      speedFactor: 2,
      maxAttempts: 2,
    },
    hard: {
      sequenceLength: 12,
      speedFactor: 3,
      maxAttempts: 1,
    },
  },
  codeBreaker: {
    easy: {
      codeLength: 3,
      maxAttempts: 10,
      timeLimit: 120,
    },
    medium: {
      codeLength: 4,
      maxAttempts: 8,
      timeLimit: 90,
    },
    hard: {
      codeLength: 5,
      maxAttempts: 6,
      timeLimit: 60,
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
      // New minigames
      case 'wireConnection':
        return (
          <WireConnection 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'patternMatch':
        return (
          <PatternMatch 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'simonSays':
        return (
          <SimonSays 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      case 'codeBreaker':
        return (
          <CodeBreaker 
            config={gameConfig.config} 
            difficulty={gameConfig.difficulty} 
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        );
      default:
        return <Text>Invalid game type</Text>;
    }
  };
  
  return (
    <ChakraProvider theme={theme}>
      <NuiProvider>
        <Box id="root" h="100vh" w="100vw" p={0} m={0} bg="gray.900" color="white">
          {testMode && !visible && (
            <Box p={6}>
              <Heading as="h1" size="xl" mb={4}>Vein Minigames Test Mode</Heading>
              <Flex direction="row" mb={4} align="center">
                <Text mr={2}>Game:</Text>
                <Select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value as GameType)}
                  width="200px"
                  mr={4}
                >
                  <option value="memoryTiles">Memory Tiles</option>
                  <option value="voltLab">Volt Lab</option>
                  <option value="fingerprint">Fingerprint</option>
                  <option value="thermite">Thermite</option>
                  <option value="maze">Maze</option>
                  <option value="wireConnection">Wire Connection</option>
                  <option value="patternMatch">Pattern Match</option>
                  <option value="simonSays">Simon Says</option>
                  <option value="codeBreaker">Code Breaker</option>
                </Select>
                
                <Text mr={2}>Difficulty:</Text>
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyType)}
                  width="200px"
                  mr={4}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
                
                <Button colorScheme="blue" onClick={handleTestGame}>
                  Test Game
                </Button>
              </Flex>
              
              {lastResult && (
                <Text fontSize="xl" mt={4}>
                  Last test result: <strong>{lastResult}</strong>
                </Text>
              )}
            </Box>
          )}
          
          {visible && (
            <Box 
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="rgba(0,0,0,0.7)"
              backdropFilter="blur(5px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex="10"
            >
              <Box 
                bg="gray.900" 
                borderRadius="md" 
                boxShadow="xl"
                width="80vw"
                maxWidth="800px"
                height="80vh"
                maxHeight="600px"
                overflow="hidden"
              >
                {renderGame()}
              </Box>
            </Box>
          )}
        </Box>
      </NuiProvider>
    </ChakraProvider>
  );
}

export default App; 