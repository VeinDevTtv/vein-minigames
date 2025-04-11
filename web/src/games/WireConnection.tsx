import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Heading, Text, useInterval, VStack, HStack } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface WireConnectionProps {
  config: {
    wireCount: number;
    timeLimit: number;
    shuffleCount: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

interface Wire {
  id: number;
  color: string;
  leftPos: number;
  rightPos: number;
  isConnected: boolean;
  isSelected: boolean;
}

// Colors with good contrast
const WIRE_COLORS = [
  { name: 'red', value: '#E53E3E' },
  { name: 'blue', value: '#3182CE' },
  { name: 'green', value: '#38A169' },
  { name: 'yellow', value: '#ECC94B' },
  { name: 'purple', value: '#805AD5' },
  { name: 'orange', value: '#DD6B20' },
  { name: 'pink', value: '#D53F8C' },
  { name: 'teal', value: '#319795' },
];

const WireConnection: React.FC<WireConnectionProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedWire, setSelectedWire] = useState<number | null>(null);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  const [connections, setConnections] = useState<number>(0);

  // Initialize the game
  const initGame = useCallback(() => {
    const wireCount = Math.min(config.wireCount, WIRE_COLORS.length);
    const newWires: Wire[] = [];
    
    // Create wires with random positions
    const leftPositions = Array.from({ length: wireCount }, (_, i) => i);
    const rightPositions = Array.from({ length: wireCount }, (_, i) => i);
    
    // Shuffle right positions
    for (let i = 0; i < config.shuffleCount; i++) {
      const idx1 = Math.floor(Math.random() * rightPositions.length);
      const idx2 = Math.floor(Math.random() * rightPositions.length);
      [rightPositions[idx1], rightPositions[idx2]] = [rightPositions[idx2], rightPositions[idx1]];
    }
    
    // Create wires
    for (let i = 0; i < wireCount; i++) {
      newWires.push({
        id: i,
        color: WIRE_COLORS[i].value,
        leftPos: leftPositions[i],
        rightPos: rightPositions[i],
        isConnected: false,
        isSelected: false,
      });
    }
    
    setWires(newWires);
    setSelectedWire(null);
    setPhase('intro');
    setTimeLeft(config.timeLimit);
    setConnections(0);
  }, [config.wireCount, config.shuffleCount, config.timeLimit]);

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
      onComplete(false, { timeExpired: true });
    }
  }, 1000);

  // Check if all wires are connected
  useEffect(() => {
    if (phase === 'playing' && connections === wires.length) {
      setTimerActive(false);
      setPhase('result');
      onComplete(true, { timeRemaining: timeLeft });
    }
  }, [connections, wires.length, phase, timeLeft, onComplete]);

  // Handle wire selection
  const handleWireClick = (side: 'left' | 'right', wireId: number) => {
    if (phase !== 'playing') return;
    
    if (side === 'left') {
      // Select a wire from the left side
      if (selectedWire === wireId) {
        // Deselect if already selected
        setSelectedWire(null);
        setWires(prev => prev.map(w => 
          w.id === wireId ? { ...w, isSelected: false } : w
        ));
      } else if (selectedWire === null) {
        // Select this wire
        setSelectedWire(wireId);
        setWires(prev => prev.map(w => 
          w.id === wireId ? { ...w, isSelected: true } : { ...w, isSelected: false }
        ));
      }
    } else if (side === 'right' && selectedWire !== null) {
      // Try to connect with a wire on the right side
      const leftWire = wires.find(w => w.id === selectedWire);
      const rightWire = wires.find(w => w.rightPos === wireId);
      
      if (leftWire && rightWire) {
        // Check if this is the correct connection
        if (leftWire.id === rightWire.id) {
          // Correct connection
          setWires(prev => prev.map(w => 
            w.id === leftWire.id ? { ...w, isConnected: true, isSelected: false } : w
          ));
          setConnections(prev => prev + 1);
        } else {
          // Wrong connection - reset all connections as penalty
          setWires(prev => prev.map(w => ({ ...w, isConnected: false, isSelected: false })));
          setConnections(0);
        }
        setSelectedWire(null);
      }
    }
  };

  // Start the game
  const startGame = () => {
    setPhase('playing');
    setTimerActive(true);
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Wire Connection</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Connect the matching wires from left to right!<br />
            Be careful, wrong connections will reset your progress.
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
            <Text fontSize="lg">Connections: {connections}/{wires.length}</Text>
          </Flex>
          
          <Flex flex="1" justify="space-between" align="center" px={10}>
            {/* Left side wires */}
            <VStack spacing={6} align="flex-end">
              {wires.map((wire, index) => (
                <Box
                  key={`left-${wire.id}`}
                  w="100px"
                  h="10px"
                  bg={wire.isConnected ? 'gray.500' : wire.color}
                  borderRadius="full"
                  cursor={wire.isConnected ? 'default' : 'pointer'}
                  opacity={wire.isConnected ? 0.5 : wire.isSelected ? 1 : 0.8}
                  boxShadow={wire.isSelected ? '0 0 10px white' : 'none'}
                  transform={wire.isSelected ? 'scale(1.05)' : 'scale(1)'}
                  transition="all 0.2s"
                  onClick={() => !wire.isConnected && handleWireClick('left', wire.id)}
                />
              ))}
            </VStack>
            
            {/* Connection visualization */}
            <Box flex="1" mx={4} position="relative" h="100%" minH="200px">
              {wires.filter(w => w.isConnected).map((wire) => (
                <Box
                  key={`connection-${wire.id}`}
                  position="absolute"
                  left="0"
                  top={`${(wire.leftPos / wires.length) * 100}%`}
                  width="100%"
                  height="10px"
                  borderRadius="full"
                  bg={wire.color}
                  transform={`translateY(${wire.leftPos * 24}px) rotate(${Math.atan2((wire.rightPos - wire.leftPos) * 24, 100) * (180 / Math.PI)}deg)`}
                  transformOrigin="center left"
                  transition="all 0.3s ease-in-out"
                  zIndex="1"
                />
              ))}
              {selectedWire !== null && (
                <Box
                  position="absolute"
                  left="0"
                  top={`${(wires[selectedWire].leftPos / wires.length) * 100}%`}
                  width="50%"
                  height="10px"
                  borderRadius="full"
                  bg={wires[selectedWire].color}
                  transform={`translateY(${wires[selectedWire].leftPos * 24}px)`}
                  transformOrigin="center left"
                  opacity={0.7}
                  zIndex="0"
                />
              )}
            </Box>
            
            {/* Right side wires */}
            <VStack spacing={6} align="flex-start">
              {Array.from({ length: wires.length }).map((_, index) => {
                const wire = wires.find(w => w.rightPos === index);
                return (
                  <Box
                    key={`right-${index}`}
                    w="100px"
                    h="10px"
                    bg={wire?.isConnected ? 'gray.500' : 'gray.400'}
                    borderRadius="full"
                    cursor="pointer"
                    opacity={wire?.isConnected ? 0.5 : 0.8}
                    transition="all 0.2s"
                    onClick={() => handleWireClick('right', index)}
                  />
                );
              })}
            </VStack>
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

export default WireConnection; 