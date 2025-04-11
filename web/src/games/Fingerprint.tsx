import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Grid, Heading, Text, useInterval } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface FingerprintProps {
  config: {
    gridSize: number;
    segments: number;
    timeLimit: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

interface Segment {
  id: number;
  pattern: number[];
  selected: boolean;
  matched: boolean;
}

const Fingerprint: React.FC<FingerprintProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [targetSegments, setTargetSegments] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'matching' | 'result'>('intro');

  // Generate a random fingerprint pattern
  const generatePattern = useCallback((segmentId: number) => {
    const pattern: number[] = [];
    const gridSize = config.gridSize;
    const numLines = Math.floor(gridSize * 0.7);
    
    for (let i = 0; i < numLines; i++) {
      const line = Math.floor(Math.random() * (gridSize * gridSize));
      pattern.push(line);
    }
    
    return pattern;
  }, [config.gridSize]);

  // Initialize the game
  const initGame = useCallback(() => {
    const numSegments = config.gridSize;
    
    // Create all segments
    const newSegments: Segment[] = Array.from({ length: numSegments }).map((_, index) => ({
      id: index,
      pattern: generatePattern(index),
      selected: false,
      matched: false,
    }));
    
    // Randomly select target segments
    const targets: number[] = [];
    while (targets.length < config.segments) {
      const randomSegment = Math.floor(Math.random() * numSegments);
      if (!targets.includes(randomSegment)) {
        targets.push(randomSegment);
      }
    }
    
    setSegments(newSegments);
    setTargetSegments(targets);
    setTimeLeft(config.timeLimit);
    setPhase('intro');
  }, [config.gridSize, config.segments, config.timeLimit, generatePattern]);

  // Initialize the game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer setup
  useInterval(() => {
    if (timerActive && timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    } else if (timerActive && timeLeft <= 0) {
      // Time's up, game over
      setTimerActive(false);
      onComplete(false, { timeExpired: true });
    }
  }, 1000);

  // Handle segment selection
  const handleSegmentClick = (id: number) => {
    if (phase !== 'matching') return;
    
    // Toggle selection
    setSegments(prev => prev.map(segment => 
      segment.id === id 
        ? { ...segment, selected: !segment.selected } 
        : segment
    ));
    
    // Check if all targets are selected
    const updatedSegments = segments.map(segment => 
      segment.id === id ? { ...segment, selected: !segment.selected } : segment
    );
    
    const selectedCount = updatedSegments.filter(segment => segment.selected).length;
    const correctCount = updatedSegments.filter(
      segment => segment.selected && targetSegments.includes(segment.id)
    ).length;
    
    // If we've selected the required number of segments, check the result
    if (selectedCount === config.segments) {
      if (correctCount === config.segments) {
        // Success!
        setTimerActive(false);
        setPhase('result');
        setTimeout(() => onComplete(true), 1000);
      } else {
        // Failure - wrong selection
        setTimerActive(false);
        setPhase('result');
        setTimeout(() => onComplete(false), 1000);
      }
    }
  };

  // Start the game
  const startGame = () => {
    setPhase('matching');
    setTimerActive(true);
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Fingerprint Analysis</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Find and select the matching fingerprint segments!
            <br />
            You need to select {config.segments} correct segments.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startGame}>
            Start Analysis
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            <Text fontSize="lg">Time remaining: {timeLeft}s</Text>
            <Text fontSize="lg">Segments to find: {config.segments}</Text>
          </Flex>
          
          <Grid
            templateColumns={`repeat(4, 1fr)`}
            gap={4}
            flex="1"
            margin="0 auto"
            w="100%"
            maxW="800px"
          >
            {segments.map(segment => (
              <Box
                key={segment.id}
                bg={segment.selected ? 'green.500' : 'gray.700'}
                borderRadius="md"
                overflow="hidden"
                cursor={phase === 'matching' ? 'pointer' : 'default'}
                onClick={() => phase === 'matching' && handleSegmentClick(segment.id)}
                transition="all 0.2s"
                position="relative"
                _hover={{
                  bg: phase === 'matching' ? (segment.selected ? 'green.600' : 'gray.600') : 'gray.700',
                }}
              >
                <Flex 
                  direction="column"
                  justify="center"
                  align="center"
                  h="100%"
                  p={4}
                >
                  {/* Visualization of the fingerprint pattern */}
                  <Box position="relative" w="100%" h="100%" opacity={0.8}>
                    {segment.pattern.map((line, idx) => {
                      const row = Math.floor(line / config.gridSize);
                      const col = line % config.gridSize;
                      const top = (row / config.gridSize) * 100;
                      const left = (col / config.gridSize) * 100;
                      
                      return (
                        <Box
                          key={`line-${idx}`}
                          position="absolute"
                          top={`${top}%`}
                          left={`${left}%`}
                          w="10%"
                          h="10%"
                          bg={targetSegments.includes(segment.id) ? 'blue.400' : 'purple.400'}
                          borderRadius="full"
                        />
                      );
                    })}
                  </Box>
                </Flex>
              </Box>
            ))}
          </Grid>
          
          <Flex justify="center" mt={4}>
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && (
              <Button colorScheme="green" onClick={() => {
                onComplete(true);
              }}>
                Debug: Complete
              </Button>
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Fingerprint; 