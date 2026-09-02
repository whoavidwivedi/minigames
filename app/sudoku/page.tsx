"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Pre-defined boards and their solutions
const BOARDS = {
  easy: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
  },
  medium: {
    initial: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ]
  },
  hard: {
    initial: [
      [0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 6, 0, 0, 0, 0, 3],
      [0, 7, 4, 0, 8, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 0, 0, 2],
      [0, 8, 0, 0, 4, 0, 0, 1, 0],
      [6, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 7, 8, 0],
      [5, 0, 0, 0, 0, 9, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 4, 0]
    ],
    solution: [
      [1, 2, 6, 4, 3, 7, 9, 5, 8],
      [8, 9, 5, 6, 2, 1, 4, 7, 3],
      [3, 7, 4, 9, 8, 5, 1, 2, 6],
      [4, 5, 7, 1, 9, 3, 8, 6, 2],
      [9, 8, 3, 2, 4, 6, 5, 1, 7],
      [6, 1, 2, 5, 7, 8, 3, 9, 4],
      [2, 6, 9, 3, 1, 4, 7, 8, 5],
      [5, 4, 8, 7, 6, 9, 2, 3, 1],
      [7, 3, 1, 8, 5, 2, 6, 4, 9]
    ]
  }
};

type Difficulty = "easy" | "medium" | "hard";
type Position = { r: number; c: number };

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selected, setSelected] = useState<Position | null>(null);
  const [isWon, setIsWon] = useState(false);

  const startGame = (level: Difficulty) => {
    const b = BOARDS[level];
    // deep copy
    setBoard(b.initial.map(row => [...row]));
    setInitialBoard(b.initial.map(row => [...row]));
    setSolution(b.solution.map(row => [...row]));
    setDifficulty(level);
    setIsWon(false);
    setSelected(null);
  };

  const handleInput = useCallback((val: number) => {
    if (isWon || !selected || !difficulty) return;
    const { r, c } = selected;
    if (initialBoard[r][c] !== 0) return; // Cannot edit initial given numbers

    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[r][c] = val;
      
      // Check win condition
      let won = true;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newBoard[i][j] !== solution[i][j]) {
            won = false;
            break;
          }
        }
      }
      if (won) setIsWon(true);
      
      return newBoard;
    });
  }, [selected, initialBoard, isWon, difficulty, solution]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handleInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleInput(0);
      } else if (e.key === "ArrowUp" && selected) {
        setSelected({ r: Math.max(0, selected.r - 1), c: selected.c });
      } else if (e.key === "ArrowDown" && selected) {
        setSelected({ r: Math.min(8, selected.r + 1), c: selected.c });
      } else if (e.key === "ArrowLeft" && selected) {
        setSelected({ r: selected.r, c: Math.max(0, selected.c - 1) });
      } else if (e.key === "ArrowRight" && selected) {
        setSelected({ r: selected.r, c: Math.min(8, selected.c + 1) });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, selected]);

  const renderMenu = () => (
    <Card className="max-w-md w-full aspect-square flex flex-col items-center justify-center bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Sudoku</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 w-full px-12">
        <Button size="lg" onClick={() => startGame("easy")}>Easy</Button>
        <Button size="lg" onClick={() => startGame("medium")}>Medium</Button>
        <Button size="lg" onClick={() => startGame("hard")}>Hard</Button>
      </CardContent>
    </Card>
  );

  const renderWin = () => (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md"
    >
      <Card className="max-w-sm w-full flex flex-col items-center justify-center bg-card text-card-foreground shadow-2xl p-6">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-primary mb-4 text-center">Puzzle Solved!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col w-full px-6">
          <Button size="lg" className="w-full" onClick={() => { setDifficulty(null); setIsWon(false); }}>Play Again</Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderGame = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex flex-col items-center w-full max-w-md relative"
    >
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold capitalize">{difficulty}</h2>
        <Button variant="outline" size="sm" onClick={() => setDifficulty(null)}>Restart</Button>
      </div>

      <div className="relative w-full aspect-square border-2 border-foreground bg-background">
        <div className="absolute inset-0 grid grid-cols-9 grid-rows-9">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isGiven = initialBoard[r][c] !== 0;
              const isError = val !== 0 && val !== solution[r][c];
              
              // highlight cells in the same row, col, or box as the selected cell
              const isHighlighted = selected && (selected.r === r || selected.c === c || 
                (Math.floor(selected.r / 3) === Math.floor(r / 3) && Math.floor(selected.c / 3) === Math.floor(c / 3)));
              // highlight cells with the same number as the selected cell
              const selectedValue = selected ? board[selected.r][selected.c] : 0;
              const isSameValue = val !== 0 && selectedValue === val;

              return (
                <motion.div
                  key={`${r}-${c}`}
                  onClick={() => setSelected({ r, c })}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "border border-border/50 flex items-center justify-center text-lg sm:text-2xl cursor-pointer select-none transition-colors",
                    c % 3 === 2 && c !== 8 && "border-r-2 border-r-foreground",
                    r % 3 === 2 && r !== 8 && "border-b-2 border-b-foreground",
                    isSelected ? "bg-primary/30" : 
                    isSameValue ? "bg-primary/20" :
                    isHighlighted ? "bg-muted" : "bg-transparent",
                    isGiven ? "font-bold text-foreground" : "font-medium text-primary",
                    isError && !isGiven && "text-destructive font-bold"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {val !== 0 && (
                      <motion.span
                        key={val}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {val}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
        
        <AnimatePresence>
          {isWon && renderWin()}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-6 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="secondary"
            className="text-lg h-12 active:scale-95 transition-transform"
            onClick={() => handleInput(num)}
            disabled={!selected || initialBoard[selected.r][selected.c] !== 0}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="destructive"
          className="text-lg h-12 active:scale-95 transition-transform"
          onClick={() => handleInput(0)}
          disabled={!selected || initialBoard[selected.r][selected.c] !== 0}
        >
          X
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="max-w-md w-full">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "mb-6 -ml-4 self-start")}>
          &larr; Back to Home
        </Link>
      </div>

      {!difficulty && renderMenu()}
      {difficulty && renderGame()}
    </div>
  );
}
