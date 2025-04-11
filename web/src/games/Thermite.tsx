import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Grid, Heading, Text, useInterval } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface ThermiteProps {
  config: {
    gridSize: { x: number; y: number };
    correctBlocks: number;
    displayTime: number;
    inputTime: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

interface Block {
  id: number;
  correct: boolean;
  selected: boolean;
}

const Thermite: React.FC<ThermiteProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [phase, setPhase] = useState<'intro' | 'display' | 'input' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(Math.floor(config.displayTime / 1000));
  const [inputTimeLeft, setInputTimeLeft] = useState<number>(Math.floor(config.inputTime / 1000));
  const [timerActive, setTimerActive] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

  // Initialize the game
  const initGame = useCallback(() => {
    const totalBlocks = config.gridSize.x * config.gridSize.y;
    const correctBlocks = Math.min(config.correctBlocks, totalBlocks);
    
    // Generate random correct blocks
    const correctIndices: number[] = [];
    while (correctIndices.length < correctBlocks) {
      const randomBlock = Math.floor(Math.random() * totalBlocks);
      if (!correctIndices.includes(randomBlock)) {
        correctIndices.push(randomBlock);
      }
    }
    
    // Create all blocks
    const newBlocks: Block[] = Array.from({ length: totalBlocks }).map((_, index) => ({
      id: index,
      correct: correctIndices.includes(index),
      selected: false,
    }));
    
    setBlocks(newBlocks);
    setPhase('intro');
    setTimeLeft(Math.floor(config.displayTime / 1000));
    setInputTimeLeft(Math.floor(config.inputTime / 1000));
    setShowCorrect(false);
  }, [config.gridSize.x, config.gridSize.y, config.correctBlocks, config.displayTime, config.inputTime]);

  // Initialize the game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Game phase controller
  useEffect(() => {
    if (phase === 'display' && timeLeft <= 0) {
      // Hide all correct blocks and start input phase
      setShowCorrect(false);
      setPhase('input');
      setTimerActive(true);
    } else if (phase === 'input' && inputTimeLeft <= 0) {
      // Time's up, game over
      setTimerActive(false);
      setPhase('result');
      onComplete(false, { timeExpired: true });
    }
  }, [phase, timeLeft, inputTimeLeft, onComplete]);

  // Display phase timer
  useInterval(() => {
    if (phase === 'display' && timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    }
  }, 1000);

  // Input phase timer
  useInterval(() => {
    if (phase === 'input' && inputTimeLeft > 0) {
      setInputTimeLeft(prev => prev - 1);
    }
  }, 1000);

  // Handle block click
  const handleBlockClick = (id: number) => {
    if (phase !== 'input') return;
    
    // Toggle selection
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, selected: !block.selected } : block
    ));
    
    // Check if game is complete after toggle
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, selected: !block.selected } : block
    );
    
    const selectedCount = updatedBlocks.filter(block => block.selected).length;
    const correctCount = config.correctBlocks;
    
    // If we've selected the required number of blocks, check the result
    if (selectedCount === correctCount) {
      const allCorrect = updatedBlocks.every(block => 
        (block.correct && block.selected) || (!block.correct && !block.selected)
      );
      
      // Show the correct pattern
      setShowCorrect(true);
      setTimerActive(false);
      setPhase('result');
      
      // Delay the completion callback to show the result
      setTimeout(() => onComplete(allCorrect), 1500);
    }
  };

  // Start the game
  const startGame = () => {
    setShowCorrect(true);
    setPhase('display');
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Thermite Hack</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Memorize the pattern and recreate it!
            <br />
            You'll have {timeLeft} seconds to memorize and {inputTimeLeft} seconds to input.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startGame}>
            Start Hack
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            {phase === 'display' && (
              <Text fontSize="lg">Memorize: {timeLeft}s</Text>
            )}
            {phase === 'input' && (
              <Text fontSize="lg">Input remaining: {inputTimeLeft}s</Text>
            )}
            {phase === 'result' && (
              <Text fontSize="lg">Game complete</Text>
            )}
          </Flex>
          
          <Grid
            templateColumns={`repeat(${config.gridSize.x}, 1fr)`}
            templateRows={`repeat(${config.gridSize.y}, 1fr)`}
            gap={2}
            flex="1"
            margin="0 auto"
            maxW="600px"
            aspectRatio="1"
          >
            {blocks.map(block => (
              <Box
                key={block.id}
                bg={
                  (block.selected && phase === 'input') || (block.correct && showCorrect) 
                    ? 'orange.500' 
                    : phase === 'result' && block.correct && !block.selected
                      ? 'red.500'
                      : phase === 'result' && !block.correct && block.selected
                      ? 'red.500'
                      : 'gray.700'
                }
                borderRadius="md"
                cursor={phase === 'input' ? 'pointer' : 'default'}
                onClick={() => phase === 'input' && handleBlockClick(block.id)}
                transition="all 0.1s"
                _hover={{
                  bg: phase === 'input' 
                    ? block.selected 
                      ? 'orange.600' 
                      : 'gray.600'
                    : block.correct && showCorrect 
                      ? 'orange.500' 
                      : 'gray.700'
                }}
              />
            ))}
          </Grid>
          
          <Flex justify="center" mt={4}>
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && phase === 'display' && (
              <Button colorScheme="green" onClick={() => {
                setShowCorrect(false);
                setPhase('input');
                setTimerActive(true);
              }}>
                Skip Display
              </Button>
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Thermite; 