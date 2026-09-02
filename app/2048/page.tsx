"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const GRID_SIZE = 4;

type Tile = {
  id: string;
  value: number;
  r: number;
  c: number;
  isNew?: boolean;
  isMerged?: boolean;
};

let tileIdCounter = 0;
const getNextId = () => `tile-${tileIdCounter++}`;

const checkGameOver = (tiles: Tile[]): boolean => {
  if (tiles.length < GRID_SIZE * GRID_SIZE) return false;
  
  const board = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
  tiles.forEach(t => { board[t.r][t.c] = t.value; });

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c < GRID_SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < GRID_SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
};

export default function TwoThousandFortyEight() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const addRandomTile = (currentTiles: Tile[]) => {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!currentTiles.find(t => t.r === r && t.c === c)) {
          emptyCells.push({ r, c });
        }
      }
    }
    
    if (emptyCells.length === 0) return currentTiles;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newTile: Tile = {
      id: getNextId(),
      value: Math.random() < 0.9 ? 2 : 4,
      r: randomCell.r,
      c: randomCell.c,
      isNew: true
    };
    
    return [...currentTiles, newTile];
  };

  const initGame = useCallback(() => {
    let initialTiles = addRandomTile([]);
    initialTiles = addRandomTile(initialTiles);
    setTiles(initialTiles);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const slideAndMerge = (lines: Tile[][]) => {
    let scoreGain = 0;
    const newTiles: Tile[] = [];

    lines.forEach(line => {
      const newLine: Tile[] = [];
      let i = 0;
      while (i < line.length) {
        if (i < line.length - 1 && line[i].value === line[i+1].value) {
          const mergedValue = line[i].value * 2;
          scoreGain += mergedValue;
          newLine.push({
            id: line[i].id, // keep one id to animate to this location
            value: mergedValue,
            r: 0, c: 0,
            isMerged: true
          });
          i += 2;
        } else {
          newLine.push({ ...line[i], isMerged: false, isNew: false });
          i++;
        }
      }
      newTiles.push(...newLine);
    });

    return { newTiles, scoreGain };
  };

  const handleMove = useCallback((direction: "LEFT" | "RIGHT" | "UP" | "DOWN") => {
    if (gameOver) return;
    
    let moved = false;
    const currentTiles = [...tiles];
    const lines: Tile[][] = Array(GRID_SIZE).fill(0).map(() => []);
    
    currentTiles.forEach(t => {
      t.isNew = false;
      t.isMerged = false;
      if (direction === "LEFT" || direction === "RIGHT") {
        lines[t.r].push(t);
      } else {
        lines[t.c].push(t);
      }
    });

    lines.forEach(line => {
      if (direction === "LEFT") line.sort((a, b) => a.c - b.c);
      if (direction === "RIGHT") line.sort((a, b) => b.c - a.c);
      if (direction === "UP") line.sort((a, b) => a.r - b.r);
      if (direction === "DOWN") line.sort((a, b) => b.r - a.r);
    });

    const result = slideAndMerge(lines);
    const updatedTiles: Tile[] = [];
    
    lines.forEach((line, lineIndex) => {
      let position = 0;
      let i = 0;
      
      while (i < line.length) {
        let isMerge = false;
        if (i < line.length - 1 && line[i].value === line[i+1].value) {
          isMerge = true;
        }
        
        const targetR = (direction === "LEFT" || direction === "RIGHT") ? lineIndex : (direction === "UP" ? position : GRID_SIZE - 1 - position);
        const targetC = (direction === "UP" || direction === "DOWN") ? lineIndex : (direction === "LEFT" ? position : GRID_SIZE - 1 - position);
        
        if (line[i].r !== targetR || line[i].c !== targetC) moved = true;
        
        if (isMerge) {
          updatedTiles.push({
            id: line[i].id, 
            value: line[i].value * 2,
            r: targetR,
            c: targetC,
            isMerged: true
          });
          i += 2;
        } else {
          updatedTiles.push({
            ...line[i],
            r: targetR,
            c: targetC,
            isMerged: false,
            isNew: false
          });
          i++;
        }
        position++;
      }
    });

    if (moved) {
      const finalTiles = addRandomTile(updatedTiles);
      setTiles(finalTiles);
      setScore(s => s + result.scoreGain);
      if (checkGameOver(finalTiles)) {
        setGameOver(true);
      }
    }
  }, [tiles, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft": e.preventDefault(); handleMove("LEFT"); break;
        case "ArrowRight": e.preventDefault(); handleMove("RIGHT"); break;
        case "ArrowUp": e.preventDefault(); handleMove("UP"); break;
        case "ArrowDown": e.preventDefault(); handleMove("DOWN"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) dx > 0 ? handleMove("RIGHT") : handleMove("LEFT");
      else dy > 0 ? handleMove("DOWN") : handleMove("UP");
    }
    touchStartRef.current = null;
  };

  const getTileColor = (val: number) => {
    const colors: Record<number, string> = {
      2: "bg-slate-200 text-slate-800",
      4: "bg-slate-300 text-slate-800",
      8: "bg-orange-200 text-orange-800",
      16: "bg-orange-300 text-orange-900",
      32: "bg-orange-400 text-white",
      64: "bg-orange-500 text-white",
      128: "bg-yellow-200 text-yellow-800",
      256: "bg-yellow-300 text-yellow-800",
      512: "bg-yellow-400 text-yellow-900",
      1024: "bg-yellow-500 text-white",
      2048: "bg-yellow-600 text-white",
    };
    return colors[val] || "bg-rose-500 text-white";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-2 sm:p-6 md:p-8 bg-background text-foreground">
      <div className="w-full max-w-md">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-4 sm:mb-6" })}>
          &larr; Back to Home
        </Link>
        <Card className="w-full border-0 sm:border shadow-none sm:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-2 sm:px-6">
            <CardTitle className="text-3xl sm:text-4xl font-bold">2048</CardTitle>
            <div className="bg-muted px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-center">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</p>
              <p className="text-lg sm:text-xl font-bold">{score}</p>
            </div>
          </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 px-2 sm:px-6 pb-4 sm:pb-6">
          <div 
            className="w-full aspect-square bg-white rounded-sm p-[1px] relative touch-none select-none overflow-hidden shadow-sm border border-white"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid grid-cols-4 grid-rows-4 gap-[1px] w-full h-full">
              {Array.from({ length: 16 }).map((_, index) => {
                const r = Math.floor(index / 4);
                const c = index % 4;
                const tile = tiles.find(t => t.r === r && t.c === c);
                return (
                  <div key={index} className="bg-muted rounded-none relative w-full h-full flex items-center justify-center">
                    <AnimatePresence>
                      {tile && (
                        <motion.div
                          layoutId={tile.id}
                          initial={tile.isNew ? { scale: 0 } : false}
                          animate={{ scale: tile.isMerged ? [1, 1.1, 1] : 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 250, damping: 25 }}
                          className={`absolute inset-0 flex items-center justify-center rounded-none font-bold text-xl sm:text-4xl transition-colors duration-200 ${getTileColor(tile.value)} shadow-sm`}
                        >
                          {tile.value}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-20 m-1 sm:m-3"
                >
                  <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
                  <p className="text-xl mb-6 text-muted-foreground">Final Score: {score}</p>
                  <div className="flex space-x-4">
                    <Button size="lg" onClick={initGame}>
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-sm text-muted-foreground text-center h-12 flex flex-col justify-center">
            <p>Use arrow keys or swipe to move tiles.</p>
            <p>Tiles with the same number merge into one!</p>
          </div>

          <div className="flex space-x-4 w-full justify-center h-10">
            <Button variant="secondary" onClick={initGame} className="w-full max-w-[200px]">Restart</Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
