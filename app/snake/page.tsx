"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

const GRID_SIZE = 20;
const INITIAL_SPEED = 120; // ms per tick

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = "UP";

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // We use a ref for direction to avoid closure issues in the event listener
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const initializeGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const saved = localStorage.getItem("snakeHighScore");
    if (saved) {
      setTimeout(() => setHighScore(parseInt(saved, 10)), 0);
    }
    
    // Set initial food on mount
    setFood(generateFood(INITIAL_SNAKE));
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (directionRef.current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (directionRef.current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (directionRef.current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (directionRef.current !== "LEFT") setDirection("RIGHT");
          break;
        case " ":
          setIsPaused((p) => !p);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (direction) {
          case "UP":
            newHead.y -= 1;
            break;
          case "DOWN":
            newHead.y += 1;
            break;
          case "LEFT":
            newHead.x -= 1;
            break;
          case "RIGHT":
            newHead.x += 1;
            break;
        }

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem("snakeHighScore", newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    // Speed increases as score increases (maxes out around 60ms)
    const currentSpeed = Math.max(INITIAL_SPEED - Math.floor(score / 50) * 10, 60);
    const gameLoop = setInterval(moveSnake, currentSpeed);

    return () => clearInterval(gameLoop);
  }, [direction, food, isGameOver, isPaused, score, highScore, generateFood]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 -ml-4" })}>
          ← Back to Home
        </Link>
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Snake</CardTitle>
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mt-2 px-2">
              <div>Score: <span className="text-foreground">{score}</span></div>
              <div>Best: {highScore}</div>
            </div>
          </CardHeader>
        <CardContent className="flex flex-col items-center pt-2">
          
          <div className="relative w-full aspect-square bg-muted/30 rounded-xl overflow-hidden border border-border/50">
            {/* Game Grid */}
            <div 
              className="absolute inset-0 grid" 
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
              }}
            >
              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className={`
                    border-[0.5px] border-background/20 rounded-sm
                    ${index === 0 ? 'bg-primary' : 'bg-primary/80'}
                  `}
                  style={{
                    gridColumnStart: segment.x + 1,
                    gridRowStart: segment.y + 1,
                  }}
                />
              ))}
              
              {/* Food */}
              <div
                className="bg-destructive rounded-full scale-75 shadow-sm shadow-destructive/50"
                style={{
                  gridColumnStart: food.x + 1,
                  gridRowStart: food.y + 1,
                }}
              />
            </div>

            {/* Overlays */}
            {isGameOver && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="text-4xl mb-2">💀</div>
                <h2 className="text-2xl font-bold">Game Over</h2>
                <p className="text-muted-foreground mt-1">Final Score: {score}</p>
              </div>
            )}
            {isPaused && !isGameOver && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold tracking-widest">PAUSED</h2>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="grid grid-cols-3 gap-2 w-[180px] mt-6 sm:hidden">
            <div />
            <Button 
              variant="secondary" 
              size="icon-lg" 
              className="w-full"
              onClick={() => directionRef.current !== "DOWN" && setDirection("UP")}
            >
              ↑
            </Button>
            <div />
            <Button 
              variant="secondary" 
              size="icon-lg" 
              className="w-full"
              onClick={() => directionRef.current !== "RIGHT" && setDirection("LEFT")}
            >
              ←
            </Button>
            <Button 
              variant="secondary" 
              size="icon-lg" 
              className="w-full"
              onClick={() => directionRef.current !== "UP" && setDirection("DOWN")}
            >
              ↓
            </Button>
            <Button 
              variant="secondary" 
              size="icon-lg" 
              className="w-full"
              onClick={() => directionRef.current !== "LEFT" && setDirection("RIGHT")}
            >
              →
            </Button>
          </div>

          <div className="flex w-full flex-col mt-6">
            <Button className="w-full text-base h-10" onClick={initializeGame}>
              {isGameOver ? "Play Again" : "Restart"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
