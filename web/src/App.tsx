import React, { useState, useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
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

function App() {
  const [visible, setVisible] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  
  const handleMessage = (event: MessageEvent) => {
    const data = event.data;
    
    if (data.action === 'openGame') {
      setGameConfig({
        game: data.game,
        difficulty: data.difficulty,
        config: data.config
      });
      setVisible(true);
    }
  };
  
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    // For development testing
    if (process.env.NODE_ENV === 'development') {
      setGameConfig({
        game: 'memoryTiles',
        difficulty: 'easy',
        config: {
          gridSize: { x: 3, y: 3 },
          matchTime: 5000,
          maxAttempts: 3
        }
      });
      setVisible(true);
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  const closeGame = () => {
    setVisible(false);
    fetch('https://vein-minigames/closeUI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({}),
    }).catch(error => console.error('Error:', error));
  };
  
  const completeGame = (success: boolean, details?: any) => {
    setVisible(false);
    fetch('https://vein-minigames/gameComplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ success, details }),
    }).catch(error => console.error('Error:', error));
  };
  
  if (!visible || !gameConfig) return null;
  
  const renderGame = () => {
    switch (gameConfig.game) {
      case 'memoryTiles':
        return <MemoryTiles config={gameConfig.config} difficulty={gameConfig.difficulty} onComplete={completeGame} onClose={closeGame} />;
      case 'voltLab':
        return <VoltLab config={gameConfig.config} difficulty={gameConfig.difficulty} onComplete={completeGame} onClose={closeGame} />;
      case 'fingerprint':
        return <Fingerprint config={gameConfig.config} difficulty={gameConfig.difficulty} onComplete={completeGame} onClose={closeGame} />;
      case 'thermite':
        return <Thermite config={gameConfig.config} difficulty={gameConfig.difficulty} onComplete={completeGame} onClose={closeGame} />;
      case 'maze':
        return <Maze config={gameConfig.config} difficulty={gameConfig.difficulty} onComplete={completeGame} onClose={closeGame} />;
      default:
        return null;
    }
  };
  
  return (
    <NuiProvider>
      <Flex
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        justifyContent="center"
        alignItems="center"
        bg="rgba(0, 0, 0, 0.5)"
        backdropFilter="blur(5px)"
      >
        <Box maxW="1200px" w="90%" h="80%" bg="gray.800" borderRadius="md" overflow="hidden" boxShadow="xl">
          {renderGame()}
        </Box>
      </Flex>
    </NuiProvider>
  );
}

export default App; 