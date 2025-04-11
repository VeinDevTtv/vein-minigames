import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Heading, Text, useInterval, Grid, GridItem } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface PatternMatchProps {
  config: {
    gridSize: number;
    timeLimit: number;
    patternsToMatch: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

type PatternPiece = {
  id: number;
  rotation: number; // 0, 90, 180, 270
  shape: 'straight' | 'curve' | 'tshape' | 'cross';
  correctRotation: number;
  isMatched: boolean;
}

const PatternMatch: React.FC<PatternMatchProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [pieces, setPieces] = useState<PatternPiece[]>([]);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  const [patternsMatched, setPatternsMatched] = useState(0);

  // Shape styles for different patterns
  const getShapeStyle = useCallback((shape: string, rotation: number) => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      position: 'relative' as const,
      transform: `rotate(${rotation}deg)`,
      transition: 'transform 0.3s ease',
    };

    switch (shape) {
      case 'straight':
        return {
          ...baseStyle,
          backgroundImage: 'linear-gradient(0deg, transparent 40%, #3182CE 40%, #3182CE 60%, transparent 60%)',
        };
      case 'curve':
        return {
          ...baseStyle,
          background: 'radial-gradient(circle at top right, transparent 70%, #3182CE 70%)',
          backgroundSize: '200% 200%',
        };
      case 'tshape':
        return {
          ...baseStyle,
          backgroundImage: 'linear-gradient(0deg, transparent 40%, #3182CE 40%, #3182CE 60%, transparent 60%), linear-gradient(90deg, transparent 40%, #3182CE 40%, #3182CE 60%, transparent 60%)',
          backgroundSize: '100% 50%, 100% 100%',
          backgroundPosition: 'center bottom, center',
        };
      case 'cross':
        return {
          ...baseStyle,
          backgroundImage: 'linear-gradient(0deg, transparent 40%, #3182CE 40%, #3182CE 60%, transparent 60%), linear-gradient(90deg, transparent 40%, #3182CE 40%, #3182CE 60%, transparent 60%)',
        };
      default:
        return baseStyle;
    }
  }, []);

  // Initialize the game
  const initGame = useCallback(() => {
    const totalPieces = config.gridSize * config.gridSize;
    const shapes = ['straight', 'curve', 'tshape', 'cross'];
    const newPieces: PatternPiece[] = [];
    
    // Create puzzle pieces
    for (let i = 0; i < totalPieces; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)] as 'straight' | 'curve' | 'tshape' | 'cross';
      const correctRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
      
      // For initial rotation, randomly rotate from correct position
      const rotations = [0, 90, 180, 270];
      // Remove correct rotation to ensure the piece starts unmatched
      const availableRotations = rotations.filter(r => r !== correctRotation);
      const initialRotation = availableRotations[Math.floor(Math.random() * availableRotations.length)];
      
      newPieces.push({
        id: i,
        shape,
        rotation: initialRotation,
        correctRotation,
        isMatched: false
      });
    }
    
    setPieces(newPieces);
    setPhase('intro');
    setTimeLeft(config.timeLimit);
    setPatternsMatched(0);
  }, [config.gridSize, config.timeLimit]);

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
      setPhase('result');
      onComplete(false, { timeExpired: true, patternsMatched });
    }
  }, 1000);

  // Check if enough patterns are matched
  useEffect(() => {
    if (phase === 'playing' && patternsMatched >= config.patternsToMatch) {
      setTimerActive(false);
      setPhase('result');
      onComplete(true, { timeRemaining: timeLeft, patternsMatched });
    }
  }, [patternsMatched, config.patternsToMatch, phase, timeLeft, onComplete]);

  // Handle piece rotation
  const rotatePiece = (id: number) => {
    if (phase !== 'playing') return;
    
    setPieces(prev => {
      const newPieces = [...prev];
      const pieceIndex = newPieces.findIndex(p => p.id === id);
      
      if (pieceIndex !== -1) {
        const piece = newPieces[pieceIndex];
        // Rotate 90 degrees clockwise
        const newRotation = (piece.rotation + 90) % 360;
        newPieces[pieceIndex] = {
          ...piece,
          rotation: newRotation,
          isMatched: newRotation === piece.correctRotation
        };
        
        // Check if this rotation created a match
        if (newRotation === piece.correctRotation && !piece.isMatched) {
          setPatternsMatched(prev => prev + 1);
        } else if (piece.isMatched && newRotation !== piece.correctRotation) {
          setPatternsMatched(prev => prev - 1);
        }
      }
      
      return newPieces;
    });
  };

  // Start the game
  const startGame = () => {
    setPhase('playing');
    setTimerActive(true);
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Pattern Match</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Rotate the pieces to match the correct pattern!<br/>
            You need to match {config.patternsToMatch} pieces to complete the puzzle.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startGame}>
            Start Game
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            <Text fontSize="lg">Time left: {timeLeft}s</Text>
            <Text fontSize="lg">Matched: {patternsMatched}/{config.patternsToMatch}</Text>
          </Flex>
          
          <Box flex="1" display="flex" justifyContent="center" alignItems="center">
            <Grid
              templateColumns={`repeat(${config.gridSize}, 1fr)`}
              templateRows={`repeat(${config.gridSize}, 1fr)`}
              gap={2}
              width={`${config.gridSize * 60}px`}
              height={`${config.gridSize * 60}px`}
            >
              {pieces.map(piece => (
                <GridItem
                  key={piece.id}
                  w="60px"
                  h="60px"
                  bg="gray.700"
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => rotatePiece(piece.id)}
                  border={piece.isMatched ? '2px solid #38A169' : '1px solid #4A5568'}
                  boxShadow={piece.isMatched ? '0 0 8px #38A169' : 'none'}
                  transition="all 0.2s"
                  _hover={{
                    bg: 'gray.600',
                  }}
                >
                  <Box
                    style={getShapeStyle(piece.shape, piece.rotation)}
                  />
                </GridItem>
              ))}
            </Grid>
          </Box>
          
          <Flex justify="center" mt={4}>
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && phase === 'playing' && (
              <Button colorScheme="green" onClick={() => {
                // Debug button to auto-complete in browser testing
                setPhase('result');
                onComplete(true);
              }}>
                Complete (Debug)
              </Button>
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default PatternMatch; 