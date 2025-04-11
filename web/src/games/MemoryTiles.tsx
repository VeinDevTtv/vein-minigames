import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Grid, Heading, Text, useInterval } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface Tile {
  id: number;
  highlighted: boolean;
  selected: boolean;
  correct: boolean;
}

interface MemoryTilesProps {
  config: {
    gridSize: { x: number; y: number };
    matchTime: number;
    maxAttempts: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

const MemoryTiles: React.FC<MemoryTilesProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'select' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [correctTiles, setCorrectTiles] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize the game
  const initGame = useCallback(() => {
    const totalTiles = config.gridSize.x * config.gridSize.y;
    const tilesToHighlight = Math.min(Math.floor(totalTiles / 3) + 2, totalTiles);
    
    // Generate random tiles to highlight
    const highlightedTiles: number[] = [];
    while (highlightedTiles.length < tilesToHighlight) {
      const randomTile = Math.floor(Math.random() * totalTiles);
      if (!highlightedTiles.includes(randomTile)) {
        highlightedTiles.push(randomTile);
      }
    }
    
    setCorrectTiles(highlightedTiles);
    
    // Create all tiles
    const newTiles: Tile[] = Array.from({ length: totalTiles }).map((_, index) => ({
      id: index,
      highlighted: highlightedTiles.includes(index),
      selected: false,
      correct: false,
    }));
    
    setTiles(newTiles);
    setPhase('intro');
    setTimeLeft(5);
    setSelectedTiles([]);
    setAttempts(0);
  }, [config.gridSize.x, config.gridSize.y]);

  // Initialize the game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Game phase controller
  useEffect(() => {
    if (phase === 'intro' && timeLeft <= 0) {
      setPhase('memorize');
      setTimeLeft(config.matchTime / 1000);
      setTimerActive(true);
    } else if (phase === 'memorize' && timeLeft <= 0) {
      // Hide all tiles and let player select
      setTiles(prev => prev.map(tile => ({ ...tile, highlighted: false })));
      setPhase('select');
      setTimerActive(false);
    }
  }, [phase, timeLeft, config.matchTime]);

  // Timer setup
  useInterval(() => {
    if (timerActive && timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    }
  }, 1000);

  // Check if game is complete
  useEffect(() => {
    if (phase === 'select') {
      const allCorrectSelected = correctTiles.every(id => selectedTiles.includes(id));
      const noExtraSelected = selectedTiles.every(id => correctTiles.includes(id));
      
      if (selectedTiles.length === correctTiles.length && allCorrectSelected && noExtraSelected) {
        // Success!
        setPhase('result');
        onComplete(true, { attempts });
      } else if (selectedTiles.length === correctTiles.length || attempts >= config.maxAttempts - 1) {
        // Failure - wrong selection or too many attempts
        setPhase('result');
        onComplete(false, { attempts: attempts + 1 });
      }
    }
  }, [phase, selectedTiles, correctTiles, attempts, config.maxAttempts, onComplete]);

  // Handle tile click
  const handleTileClick = (id: number) => {
    if (phase !== 'select') return;
    
    if (selectedTiles.includes(id)) {
      // Deselect tile
      setSelectedTiles(prev => prev.filter(tileId => tileId !== id));
      setTiles(prev => prev.map(tile => 
        tile.id === id ? { ...tile, selected: false } : tile
      ));
    } else {
      // Select tile
      setSelectedTiles(prev => [...prev, id]);
      setTiles(prev => prev.map(tile => 
        tile.id === id ? { ...tile, selected: true } : tile
      ));
      
      // Check if we need to move to next attempt
      if (selectedTiles.length + 1 === correctTiles.length) {
        setAttempts(prev => prev + 1);
      }
    }
  };

  // Start the memorize phase
  const startMemorize = () => {
    setPhase('memorize');
    setTimeLeft(config.matchTime / 1000);
    setTimerActive(true);
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Memory Tiles</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4}>
            Memorize the highlighted tiles!
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startMemorize}>
            Start Game
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            {phase === 'memorize' && (
              <Text fontSize="lg">Time to memorize: {timeLeft}s</Text>
            )}
            {phase === 'select' && (
              <Text fontSize="lg">Attempts: {attempts + 1}/{config.maxAttempts}</Text>
            )}
          </Flex>
          
          <Grid
            templateColumns={`repeat(${config.gridSize.x}, 1fr)`}
            templateRows={`repeat(${config.gridSize.y}, 1fr)`}
            gap={4}
            flex="1"
            margin="0 auto"
            maxW="600px"
          >
            {tiles.map(tile => (
              <Box
                key={tile.id}
                bg={tile.highlighted ? 'blue.500' : tile.selected ? 'purple.500' : 'gray.700'}
                borderRadius="md"
                cursor={phase === 'select' ? 'pointer' : 'default'}
                onClick={() => phase === 'select' && handleTileClick(tile.id)}
                transition="all 0.2s"
                _hover={{
                  bg: phase === 'select' 
                    ? tile.selected 
                      ? 'purple.600' 
                      : 'gray.600'
                    : tile.highlighted 
                      ? 'blue.500' 
                      : 'gray.700'
                }}
              />
            ))}
          </Grid>
          
          <Flex justify="center" mt={4}>
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && phase === 'memorize' && (
              <Button colorScheme="green" onClick={() => {
                setTiles(prev => prev.map(tile => ({ ...tile, highlighted: false })));
                setPhase('select');
                setTimerActive(false);
              }}>
                Skip Timer
              </Button>
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default MemoryTiles; 