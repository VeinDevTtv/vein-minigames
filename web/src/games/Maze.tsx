import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Heading, Text, useInterval } from '@chakra-ui/react';
import { DifficultyType } from '../App';
import { useNui } from '../providers/NuiProvider';

interface MazeProps {
  config: {
    size: number;
    timeLimit: number;
    traps: number;
  };
  difficulty: DifficultyType;
  onComplete: (success: boolean, details?: any) => void;
  onClose: () => void;
}

// Define maze cell types
type CellType = 'empty' | 'wall' | 'start' | 'end' | 'trap' | 'player' | 'path';

interface MazeCell {
  type: CellType;
  x: number;
  y: number;
  visited?: boolean;
}

const Maze: React.FC<MazeProps> = ({ config, difficulty, onComplete, onClose }) => {
  const { isEnvBrowser } = useNui();
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPosition, setPlayerPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(config.timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  const [trapHit, setTrapHit] = useState(false);

  // Generate a maze using a simplified algorithm
  const generateMaze = useCallback(() => {
    const size = config.size;
    const newMaze: MazeCell[][] = [];
    
    // Initialize maze with walls
    for (let y = 0; y < size; y++) {
      const row: MazeCell[] = [];
      for (let x = 0; x < size; x++) {
        row.push({
          type: 'wall',
          x,
          y,
          visited: false
        });
      }
      newMaze.push(row);
    }
    
    // Create paths using a simple algorithm
    const carvePassage = (x: number, y: number) => {
      // Mark current cell as visited
      newMaze[y][x].visited = true;
      newMaze[y][x].type = 'empty';
      
      // Define directions: up, right, down, left
      const directions = [
        {dx: 0, dy: -2}, // up
        {dx: 2, dy: 0},  // right
        {dx: 0, dy: 2},  // down
        {dx: -2, dy: 0}  // left
      ];
      
      // Randomize directions
      for (let i = 0; i < directions.length; i++) {
        const j = Math.floor(Math.random() * directions.length);
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      // Try each direction
      for (const {dx, dy} of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        // Check if the new position is valid
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && !newMaze[ny][nx].visited) {
          // Carve a path
          newMaze[y + dy/2][x + dx/2].type = 'empty';
          newMaze[y + dy/2][x + dx/2].visited = true;
          
          // Continue recursively
          carvePassage(nx, ny);
        }
      }
    };
    
    // Start from a random position (must be odd to maintain grid structure)
    const startX = Math.floor(Math.random() * Math.floor(size/2)) * 2 + 1;
    const startY = Math.floor(Math.random() * Math.floor(size/2)) * 2 + 1;
    
    carvePassage(startX, startY);
    
    // Create start and end points
    const validCells = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (newMaze[y][x].type === 'empty') {
          validCells.push({x, y});
        }
      }
    }
    
    // Place start point
    const startIndex = Math.floor(Math.random() * validCells.length);
    const start = validCells[startIndex];
    newMaze[start.y][start.x].type = 'start';
    setPlayerPosition({x: start.x, y: start.y});
    
    // Place end point (far from start)
    let maxDistance = 0;
    let endCell = start;
    
    for (const cell of validCells) {
      const distance = Math.abs(cell.x - start.x) + Math.abs(cell.y - start.y);
      if (distance > maxDistance) {
        maxDistance = distance;
        endCell = cell;
      }
    }
    
    newMaze[endCell.y][endCell.x].type = 'end';
    
    // Place traps
    const trapCells = [...validCells].filter(cell => 
      !(cell.x === start.x && cell.y === start.y) && 
      !(cell.x === endCell.x && cell.y === endCell.y)
    );
    
    for (let i = 0; i < Math.min(config.traps, trapCells.length); i++) {
      const trapIndex = Math.floor(Math.random() * trapCells.length);
      const trap = trapCells[trapIndex];
      newMaze[trap.y][trap.x].type = 'trap';
      trapCells.splice(trapIndex, 1);
    }
    
    return newMaze;
  }, [config.size, config.traps]);

  // Initialize the game
  const initGame = useCallback(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    
    // Find start position
    for (let y = 0; y < newMaze.length; y++) {
      for (let x = 0; x < newMaze[y].length; x++) {
        if (newMaze[y][x].type === 'start') {
          setPlayerPosition({x, y});
          break;
        }
      }
    }
    
    setPhase('intro');
    setTimeLeft(config.timeLimit);
    setTrapHit(false);
  }, [generateMaze, config.timeLimit]);

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

  // Handle keyboard input for maze navigation
  useEffect(() => {
    if (phase !== 'playing') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      
      let newX = playerPosition.x;
      let newY = playerPosition.y;
      
      switch (e.key) {
        case 'ArrowUp':
          newY -= 1;
          break;
        case 'ArrowDown':
          newY += 1;
          break;
        case 'ArrowLeft':
          newX -= 1;
          break;
        case 'ArrowRight':
          newX += 1;
          break;
        default:
          return; // Ignore other keys
      }
      
      // Check if the new position is valid
      if (
        newX >= 0 && 
        newX < maze[0].length && 
        newY >= 0 && 
        newY < maze.length && 
        maze[newY][newX].type !== 'wall'
      ) {
        // Check for end point
        if (maze[newY][newX].type === 'end') {
          setTimerActive(false);
          setPhase('result');
          onComplete(true);
          return;
        }
        
        // Check for trap
        if (maze[newY][newX].type === 'trap') {
          setTrapHit(true);
          setTimerActive(false);
          setPhase('result');
          onComplete(false, { trapHit: true });
          return;
        }
        
        // Update player position
        setPlayerPosition({x: newX, y: newY});
        
        // Update maze to show path
        if (maze[newY][newX].type === 'empty') {
          const newMaze = [...maze];
          newMaze[newY][newX].type = 'path';
          setMaze(newMaze);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, playerPosition, maze, onComplete]);

  // Start the game
  const startGame = () => {
    setPhase('playing');
    setTimerActive(true);
  };

  // Render the maze
  const renderMaze = () => {
    return (
      <Box
        display="grid"
        gridTemplateColumns={`repeat(${config.size}, 1fr)`}
        gridTemplateRows={`repeat(${config.size}, 1fr)`}
        gap="2px"
        width="100%"
        height="100%"
        maxWidth="600px"
        maxHeight="600px"
        margin="0 auto"
      >
        {maze.flat().map((cell, index) => {
          let bgColor = 'gray.700';
          
          if (cell.x === playerPosition.x && cell.y === playerPosition.y) {
            bgColor = 'blue.500';
          } else {
            switch (cell.type) {
              case 'wall':
                bgColor = 'gray.900';
                break;
              case 'empty':
                bgColor = 'gray.700';
                break;
              case 'start':
                bgColor = 'green.500';
                break;
              case 'end':
                bgColor = 'red.500';
                break;
              case 'trap':
                // Hide traps unless game is over
                bgColor = phase === 'result' ? 'orange.500' : 'gray.700';
                break;
              case 'path':
                bgColor = 'blue.300';
                break;
            }
          }
          
          return (
            <Box
              key={index}
              bg={bgColor}
              width="100%"
              height="100%"
              borderRadius="2px"
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box p={6} h="100%" display="flex" flexDirection="column">
      <Flex justify="space-between" mb={4}>
        <Heading size="lg">Maze Navigation</Heading>
        <Text>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
      </Flex>
      
      {phase === 'intro' && (
        <Flex direction="column" justify="center" align="center" flex="1">
          <Text fontSize="xl" mb={4} textAlign="center">
            Navigate the maze to reach the end point (red)!
            <br />
            Avoid traps and reach the target before the time runs out.
            <br />
            Use arrow keys to move.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={startGame}>
            Start Navigation
          </Button>
        </Flex>
      )}
      
      {phase !== 'intro' && (
        <>
          <Flex justify="space-between" mb={4}>
            <Text fontSize="lg">Time remaining: {timeLeft}s</Text>
            {phase === 'result' && (
              <Text fontSize="lg" color={trapHit ? 'orange.500' : timeLeft <= 0 ? 'red.500' : 'inherit'}>
                {trapHit 
                  ? 'You hit a trap!' 
                  : timeLeft <= 0 
                    ? 'Time expired!' 
                    : 'Navigation complete'}
              </Text>
            )}
          </Flex>
          
          <Flex flex="1" justify="center" align="center">
            {renderMaze()}
          </Flex>
          
          <Flex justify="center" mt={4}>
            <Button colorScheme="red" mr={2} onClick={onClose}>
              Cancel
            </Button>
            {isEnvBrowser && (
              <Button colorScheme="green" onClick={() => onComplete(true)}>
                Debug: Complete
              </Button>
            )}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Maze; 