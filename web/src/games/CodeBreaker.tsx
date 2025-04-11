import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Heading, Text, HStack, VStack, Circle, Grid, GridItem } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface CodeBreakerProps {
  config: {
    codeLength: number;
    maxAttempts: number;
    timeLimit: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

const COLORS = [
  { name: 'red', value: '#E53E3E' },
  { name: 'blue', value: '#3182CE' },
  { name: 'green', value: '#38A169' },
  { name: 'yellow', value: '#ECC94B' },
  { name: 'purple', value: '#805AD5' },
  { name: 'orange', value: '#DD6B20' },
];

interface Guess {
  colors: number[];
  feedback: { correct: number; misplaced: number };
}

const CodeBreaker: React.FC<CodeBreakerProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  
  // Generate a random secret code
  const generateSecretCode = useCallback(() => {
    const code: number[] = [];
    for (let i = 0; i < config.codeLength; i++) {
      code.push(Math.floor(Math.random() * COLORS.length));
    }
    return code;
  }, [config.codeLength]);
  
  // Initialize the game
  const initGame = useCallback(() => {
    const code = generateSecretCode();
    setSecretCode(code);
    setCurrentGuess(Array(config.codeLength).fill(-1));
    setGuesses([]);
    setSelectedColor(null);
    setPhase('intro');
    setTimeLeft(config.timeLimit);
    setTimerActive(false);
  }, [generateSecretCode, config.codeLength, config.timeLimit]);
  
  // Initialize the game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);
  
  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft <= 0) {
      // Time's up, game over
      setTimerActive(false);
      setPhase('result');
      onComplete(false, { timeExpired: true, attemptsUsed: guesses.length });
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeLeft, guesses.length, onComplete]);
  
  // Check if the guess is valid (all positions filled)
  const isGuessValid = useCallback(() => {
    return currentGuess.every(color => color !== -1);
  }, [currentGuess]);
  
  // Calculate feedback for a guess
  const calculateFeedback = useCallback((guess: number[]) => {
    const secretCopy = [...secretCode];
    const guessCopy = [...guess];
    let correct = 0;
    let misplaced = 0;
    
    // First count correct positions
    for (let i = 0; i < secretCopy.length; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        correct++;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }
    
    // Then count misplaced colors
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] !== -2) {
        const index = secretCopy.indexOf(guessCopy[i]);
        if (index !== -1) {
          misplaced++;
          secretCopy[index] = -1;
        }
      }
    }
    
    return { correct, misplaced };
  }, [secretCode]);
  
  // Submit a guess
  const submitGuess = () => {
    if (!isGuessValid()) return;
    
    const feedback = calculateFeedback(currentGuess);
    const newGuess: Guess = { colors: [...currentGuess], feedback };
    
    setGuesses(prev => [...prev, newGuess]);
    setCurrentGuess(Array(config.codeLength).fill(-1));
    
    // Check if won
    if (feedback.correct === config.codeLength) {
      setTimerActive(false);
      setPhase('result');
      onComplete(true, { attemptsUsed: guesses.length + 1, timeRemaining: timeLeft });
      return;
    }
    
    // Check if out of attempts
    if (guesses.length + 1 >= config.maxAttempts) {
      setTimerActive(false);
      setPhase('result');
      onComplete(false, { attemptsUsed: config.maxAttempts });
      return;
    }
  };
  
  // Handle selecting a color from the palette
  const handleSelectColor = (colorIndex: number) => {
    setSelectedColor(colorIndex);
  };
  
  // Handle placing a color in the current guess
  const handlePlaceColor = (position: number) => {
    if (selectedColor === null || phase !== 'playing') return;
    
    setCurrentGuess(prev => {
      const newGuess = [...prev];
      newGuess[position] = selectedColor;
      return newGuess;
    });
  };
  
  // Start the game
  const startGame = () => {
    setPhase('playing');
    setTimerActive(true);
  };
  
  // Render feedback pegs
  const renderFeedback = (feedback: { correct: number; misplaced: number }) => {
    const pegs = [];
    
    // Correct pegs (black)
    for (let i = 0; i < feedback.correct; i++) {
      pegs.push(<Circle key={`correct-${i}`} size="12px" bg="black" />);
    }
    
    // Misplaced pegs (white)
    for (let i = 0; i < feedback.misplaced; i++) {
      pegs.push(<Circle key={`misplaced-${i}`} size="12px" bg="white" />);
    }
    
    // Empty pegs
    const emptyPegs = config.codeLength - (feedback.correct + feedback.misplaced);
    for (let i = 0; i < emptyPegs; i++) {
      pegs.push(<Circle key={`empty-${i}`} size="12px" bg="gray.600" />);
    }
    
    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={1}>
        {pegs.map((peg, i) => (
          <GridItem key={i}>{peg}</GridItem>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Code Breaker</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Break the secret color code!<br />
            Correct position and color: ⚫<br />
            Correct color but wrong position: ⚪
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
            <Text fontSize="lg">Attempts: {guesses.length}/{config.maxAttempts}</Text>
          </Flex>
          
          <Flex flex="1" direction="column" align="center">
            {/* Color palette */}
            <HStack spacing={3} mb={6}>
              {COLORS.map((color, index) => (
                <Circle
                  key={index}
                  size="40px"
                  bg={color.value}
                  cursor="pointer"
                  onClick={() => handleSelectColor(index)}
                  boxShadow={selectedColor === index ? '0 0 0 3px white' : 'none'}
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="all 0.2s"
                />
              ))}
            </HStack>
            
            {/* Current guess */}
            <HStack spacing={3} mb={6} p={3} bg="gray.800" borderRadius="md" width="fit-content">
              {currentGuess.map((colorIndex, position) => (
                <Circle
                  key={position}
                  size="40px"
                  bg={colorIndex === -1 ? 'gray.600' : COLORS[colorIndex].value}
                  cursor="pointer"
                  onClick={() => handlePlaceColor(position)}
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="all 0.2s"
                />
              ))}
              <Button 
                colorScheme="blue" 
                size="sm" 
                onClick={submitGuess} 
                isDisabled={!isGuessValid()}
                ml={2}
              >
                Submit
              </Button>
            </HStack>
            
            {/* Previous guesses */}
            <VStack spacing={2} align="stretch" width="100%" maxH="300px" overflowY="auto">
              {guesses.map((guess, index) => (
                <Flex key={index} bg="gray.800" p={2} borderRadius="md" align="center" justify="space-between">
                  <HStack spacing={2}>
                    {guess.colors.map((colorIndex, i) => (
                      <Circle key={i} size="30px" bg={COLORS[colorIndex].value} />
                    ))}
                  </HStack>
                  <Box ml={4}>
                    {renderFeedback(guess.feedback)}
                  </Box>
                </Flex>
              ))}
            </VStack>
            
            {phase === 'result' && (
              <Box mt={4} p={3} bg="gray.800" borderRadius="md" width="100%">
                <Text fontSize="lg" mb={2}>Secret Code:</Text>
                <HStack spacing={2} justify="center">
                  {secretCode.map((colorIndex, i) => (
                    <Circle key={i} size="30px" bg={COLORS[colorIndex].value} />
                  ))}
                </HStack>
              </Box>
            )}
          </Flex>
          
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

export default CodeBreaker; 