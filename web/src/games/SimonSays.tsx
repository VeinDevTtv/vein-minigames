import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Flex, Heading, Text, useInterval, SimpleGrid } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface SimonSaysProps {
  config: {
    sequenceLength: number;
    speedFactor: number;
    maxAttempts: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

type ButtonColor = 'red' | 'green' | 'blue' | 'yellow';

const COLORS = {
  red: { bg: '#E53E3E', activeBg: '#FC8181' },
  green: { bg: '#38A169', activeBg: '#68D391' },
  blue: { bg: '#3182CE', activeBg: '#63B3ED' },
  yellow: { bg: '#D69E2E', activeBg: '#F6E05E' },
};

const SimonSays: React.FC<SimonSaysProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [phase, setPhase] = useState<'intro' | 'watching' | 'repeating' | 'result'>('intro');
  const [sequence, setSequence] = useState<ButtonColor[]>([]);
  const [playerSequence, setPlayerSequence] = useState<ButtonColor[]>([]);
  const [activeButton, setActiveButton] = useState<ButtonColor | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [displayingSequence, setDisplayingSequence] = useState(false);
  
  // Audio Refs for button sounds
  const audioRefs = {
    red: useRef<HTMLAudioElement | null>(null),
    green: useRef<HTMLAudioElement | null>(null),
    blue: useRef<HTMLAudioElement | null>(null),
    yellow: useRef<HTMLAudioElement | null>(null),
  };
  
  // Generate a random sequence
  const generateSequence = useCallback(() => {
    const colors: ButtonColor[] = ['red', 'green', 'blue', 'yellow'];
    const newSequence: ButtonColor[] = [];
    
    for (let i = 0; i < config.sequenceLength; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      newSequence.push(randomColor);
    }
    
    return newSequence;
  }, [config.sequenceLength]);
  
  // Initialize the game
  const initGame = useCallback(() => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setPlayerSequence([]);
    setCurrentStep(0);
    setActiveButton(null);
    setPhase('intro');
    setAttempts(0);
  }, [generateSequence]);
  
  // Initialize the game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);
  
  // Play sound effect for a button
  const playSound = useCallback((color: ButtonColor) => {
    const audio = audioRefs[color].current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Audio play error:', e));
    }
  }, []);
  
  // Display the sequence to the player
  const displaySequence = useCallback(() => {
    setDisplayingSequence(true);
    setCurrentStep(0);
    
    const showStep = (step: number) => {
      if (step < sequence.length) {
        setActiveButton(sequence[step]);
        playSound(sequence[step]);
        
        setTimeout(() => {
          setActiveButton(null);
          
          setTimeout(() => {
            showStep(step + 1);
          }, 200); // Gap between buttons
        }, 600 - (config.speedFactor * 100)); // Button display time, gets shorter with higher difficulty
      } else {
        setDisplayingSequence(false);
        setPhase('repeating');
        setPlayerSequence([]);
        setCurrentStep(0);
      }
    };
    
    showStep(0);
  }, [sequence, config.speedFactor, playSound]);
  
  // Start showing the sequence when entering watching phase
  useEffect(() => {
    if (phase === 'watching') {
      displaySequence();
    }
  }, [phase, displaySequence]);
  
  // Handle player button clicks
  const handleButtonClick = (color: ButtonColor) => {
    if (phase !== 'repeating' || displayingSequence) return;
    
    setActiveButton(color);
    playSound(color);
    
    // Add color to player sequence
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    
    // Check if this step is correct
    if (color !== sequence[currentStep]) {
      // Wrong button!
      setTimeout(() => {
        setActiveButton(null);
        setAttempts(prev => prev + 1);
        
        if (attempts + 1 >= config.maxAttempts) {
          // Game over - too many attempts
          setPhase('result');
          onComplete(false, { attempts: attempts + 1 });
        } else {
          // Try again
          setPhase('watching');
        }
      }, 300);
      return;
    }
    
    // Correct step
    setTimeout(() => {
      setActiveButton(null);
      setCurrentStep(prev => prev + 1);
      
      // Check if sequence is complete
      if (newPlayerSequence.length === sequence.length) {
        setPhase('result');
        onComplete(true, { attempts: attempts + 1 });
      }
    }, 300);
  };
  
  // Start the game
  const startGame = () => {
    setPhase('watching');
  };
  
  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Simon Says</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {/* Audio elements for each color */}
      <audio ref={audioRefs.red} src="https://s3.amazonaws.com/freecodecamp/simonSound1.mp3" preload="auto" />
      <audio ref={audioRefs.green} src="https://s3.amazonaws.com/freecodecamp/simonSound2.mp3" preload="auto" />
      <audio ref={audioRefs.blue} src="https://s3.amazonaws.com/freecodecamp/simonSound3.mp3" preload="auto" />
      <audio ref={audioRefs.yellow} src="https://s3.amazonaws.com/freecodecamp/simonSound4.mp3" preload="auto" />
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Watch the sequence, then repeat it exactly!<br />
            You have {config.maxAttempts} attempts.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startGame}>
            Start Game
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            <Text fontSize="lg">
              {phase === 'watching' ? 'Watch carefully...' : 
               phase === 'repeating' ? 'Your turn! Repeat the sequence.' : 
               'Game complete!'}</Text>
            <Text fontSize="lg">Attempts: {attempts + 1}/{config.maxAttempts}</Text>
          </Flex>
          
          <Flex flex="1" justify="center" align="center">
            <SimpleGrid columns={2} spacing={4} width="300px" height="300px">
              {(['red', 'green', 'blue', 'yellow'] as ButtonColor[]).map((color) => (
                <Box
                  key={color}
                  bg={activeButton === color ? COLORS[color].activeBg : COLORS[color].bg}
                  borderRadius="md"
                  cursor={phase === 'repeating' && !displayingSequence ? 'pointer' : 'default'}
                  onClick={() => phase === 'repeating' && !displayingSequence && handleButtonClick(color)}
                  boxShadow={activeButton === color ? '0 0 15px white' : 'none'}
                  transition="all 0.1s"
                  _hover={{
                    opacity: phase === 'repeating' && !displayingSequence ? 0.9 : 1,
                    transform: phase === 'repeating' && !displayingSequence ? 'scale(0.98)' : 'scale(1)',
                  }}
                />
              ))}
            </SimpleGrid>
          </Flex>
          
          <Flex justify="center" mt={4}>
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && phase === 'repeating' && (
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

export default SimonSays; 