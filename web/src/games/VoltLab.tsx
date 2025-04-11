import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Grid, Heading, Text, useInterval } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface VoltLabProps {
  config: {
    sequenceLength: number;
    timeLimit: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

interface Node {
  id: number;
  active: boolean;
  correct: boolean;
  selected: boolean;
}

const VoltLab: React.FC<VoltLabProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<'intro' | 'display' | 'input' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(-1);
  const [inputSequence, setInputSequence] = useState<number[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [displayStep, setDisplayStep] = useState<number>(0);
  const [displayTimer, setDisplayTimer] = useState<NodeJS.Timeout | null>(null);

  // Number of nodes to display in the circuit
  const numNodes = 6;

  // Initialize the game
  const initGame = useCallback(() => {
    // Create nodes
    const newNodes: Node[] = Array.from({ length: numNodes }).map((_, index) => ({
      id: index,
      active: false,
      correct: false,
      selected: false,
    }));
    
    // Generate random sequence
    const newSequence: number[] = [];
    for (let i = 0; i < config.sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * numNodes));
    }
    
    setNodes(newNodes);
    setSequence(newSequence);
    setPhase('intro');
    setTimeLeft(config.timeLimit);
    setActiveNodeIndex(-1);
    setInputSequence([]);
    setDisplayStep(0);
  }, [config.sequenceLength, config.timeLimit]);

  // Initialize the game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Display sequence animation
  useEffect(() => {
    if (phase !== 'display') {
      if (displayTimer !== null) {
        clearInterval(displayTimer);
        setDisplayTimer(null);
      }
      return;
    }
    
    // Reset all nodes
    setNodes(prev => prev.map(node => ({ ...node, active: false })));
    
    // Start display sequence
    const timer = window.setInterval(() => {
      if (displayStep < sequence.length) {
        // Activate current node in sequence
        const nodeIndex = sequence[displayStep];
        setActiveNodeIndex(nodeIndex);
        
        // Update nodes state
        setNodes(prev => 
          prev.map(node => ({
            ...node,
            active: node.id === nodeIndex
          }))
        );
        
        // Move to next step
        setDisplayStep(prev => prev + 1);
      } else {
        // End display phase
        if (displayTimer) clearInterval(displayTimer);
        setDisplayTimer(null);
        setActiveNodeIndex(-1);
        setNodes(prev => prev.map(node => ({ ...node, active: false })));
        setPhase('input');
        setTimerActive(true);
      }
    }, 1000);
    
    // Update display timer
    setDisplayTimer(timer as unknown as NodeJS.Timeout);
    
    return () => {
      if (displayTimer) clearInterval(displayTimer);
    };
  }, [phase, displayStep, sequence, displayTimer]);

  // Timer for input phase
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

  // Handle node click
  const handleNodeClick = (id: number) => {
    if (phase !== 'input') return;
    
    // Add to input sequence
    const newInputSequence = [...inputSequence, id];
    setInputSequence(newInputSequence);
    
    // Highlight the node briefly
    setNodes(prev => 
      prev.map(node => ({
        ...node,
        active: node.id === id
      }))
    );
    
    // After a short delay, turn off the highlight
    setTimeout(() => {
      setNodes(prev => 
        prev.map(node => ({
          ...node,
          active: false
        }))
      );
    }, 300);
    
    // Check if sequence is complete
    if (newInputSequence.length === sequence.length) {
      // Compare input sequence with correct sequence
      const isCorrect = newInputSequence.every((nodeId, index) => nodeId === sequence[index]);
      
      // Mark correct nodes
      setNodes(prev => 
        prev.map(node => ({
          ...node,
          correct: isCorrect && sequence.includes(node.id)
        }))
      );
      
      setTimerActive(false);
      setPhase('result');
      setTimeout(() => onComplete(isCorrect), 1000);
    }
  };

  // Start the display phase
  const startGame = () => {
    setPhase('display');
    setDisplayStep(0);
  };

  // Reset for new attempt
  const resetInput = () => {
    setInputSequence([]);
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">VoltLab Circuit</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Memorize and replicate the electrical circuit sequence!
            <br />
            Click the nodes in the exact same order they light up.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startGame}>
            Start Sequence
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            {phase === 'display' && (
              <Text fontSize="lg">Memorize the sequence...</Text>
            )}
            {phase === 'input' && (
              <Text fontSize="lg">Time remaining: {timeLeft}s</Text>
            )}
            {phase === 'result' && (
              <Text fontSize="lg">Sequence complete</Text>
            )}
            <Text fontSize="lg">Nodes: {inputSequence.length} / {sequence.length}</Text>
          </Flex>
          
          <Box 
            flex="1" 
            display="flex" 
            justifyContent="center" 
            alignItems="center"
            position="relative"
            bg="gray.900"
            borderRadius="lg"
            p={8}
          >
            {/* Circuit board background with lines */}
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0"
              borderRadius="lg"
              opacity="0.2"
              bgImage="linear-gradient(to right, green 1px, transparent 1px), linear-gradient(to bottom, green 1px, transparent 1px)"
              bgSize="20px 20px"
            />
            
            {/* Circuit connections */}
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0" 
              borderRadius="lg"
            >
              {nodes.map((node, i) => (
                <React.Fragment key={`line-${i}`}>
                  {i < nodes.length - 1 && (
                    <Box
                      position="absolute"
                      top={`${30 + (i % 3) * 20}%`}
                      left={`${i < 3 ? 40 : 60}%`}
                      width="20%"
                      height="2px"
                      bg={
                        (phase === 'result' && 
                         sequence.includes(i) && 
                         sequence.includes(i + 1) && 
                         sequence[sequence.indexOf(i) + 1] === i + 1) 
                          ? 'green.400' 
                          : 'blue.700'
                      }
                      zIndex="1"
                    />
                  )}
                </React.Fragment>
              ))}
            </Box>
            
            {/* Circuit nodes */}
            <Grid 
              templateColumns="repeat(2, 1fr)" 
              gap={10} 
              width="100%" 
              maxWidth="400px"
            >
              {nodes.map((node, i) => (
                <Flex 
                  key={`node-${i}`} 
                  justifyContent="center" 
                  alignItems="center"
                >
                  <Box
                    width="60px"
                    height="60px"
                    borderRadius="full"
                    bg={node.active ? 'blue.400' : node.correct ? 'green.400' : 'gray.700'}
                    boxShadow={node.active ? '0 0 15px 5px rgba(66, 153, 225, 0.8)' : 'none'}
                    cursor={phase === 'input' ? 'pointer' : 'default'}
                    onClick={() => phase === 'input' && handleNodeClick(node.id)}
                    transition="all 0.2s"
                    _hover={{
                      bg: phase === 'input' ? 'blue.600' : node.active ? 'blue.400' : node.correct ? 'green.400' : 'gray.700',
                      transform: phase === 'input' ? 'scale(1.05)' : 'none'
                    }}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                  >
                    <Text color="white" fontWeight="bold">
                      {node.id + 1}
                    </Text>
                    <Box
                      position="absolute"
                      width="70px"
                      height="70px"
                      borderRadius="full"
                      border="2px dashed"
                      borderColor={node.active ? 'blue.300' : 'transparent'}
                      animation={node.active ? 'spin 2s linear infinite' : 'none'}
                    />
                  </Box>
                </Flex>
              ))}
            </Grid>
          </Box>
          
          <Flex justify="center" mt={4}>
            {phase === 'input' && (
              <Button colorScheme="yellow" mr={2} onClick={resetInput}>
                Reset Input
              </Button>
            )}
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && phase === 'display' && (
              <Button colorScheme="green" onClick={() => {
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

export default VoltLab; 