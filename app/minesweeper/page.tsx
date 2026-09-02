"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from 'next/link';

type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const ROWS = 10;
const COLS = 10;
const MINES = 15;

export default function Minesweeper() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsCount, setFlagsCount] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Initialize empty grid
    let newGrid: Cell[][] = Array.from({ length: ROWS }, (_, r) => 
      Array.from({ length: COLS }, (_, c) => ({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setFlagsCount(0);
  };

  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon || grid.length === 0) return;
    if (grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid[r][c].isRevealed = true;
      // Reveal all other mines
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
           if (newGrid[i][j].isMine) newGrid[i][j].isRevealed = true;
        }
      }
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    const revealEmpty = (row: number, col: number) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
      if (newGrid[row][col].isRevealed || newGrid[row][col].isFlagged) return;
      
      newGrid[row][col].isRevealed = true;
      
      if (newGrid[row][col].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            revealEmpty(row + dr, col + dc);
          }
        }
      }
    };

    revealEmpty(r, c);
    setGrid(newGrid);

    // Check win
    let unrevealedSafeCells = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!newGrid[i][j].isMine && !newGrid[i][j].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }
    
    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      setGameOver(true); // Stop interactions
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || gameWon || grid.length === 0 || grid[r][c].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    const isCurrentlyFlagged = newGrid[r][c].isFlagged;
    
    newGrid[r][c].isFlagged = !isCurrentlyFlagged;
    setFlagsCount(prev => prev + (isCurrentlyFlagged ? -1 : 1));
    setGrid(newGrid);
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return "🚩";
    if (!cell.isRevealed) return "";
    if (cell.isMine) return "💣";
    if (cell.neighborMines > 0) return cell.neighborMines;
    return "";
  };

  const getCellColor = (cell: Cell) => {
    if (cell.isRevealed) {
      if (cell.isMine) return "bg-destructive text-destructive-foreground";
      return "bg-muted font-bold";
    }
    return "bg-secondary hover:bg-secondary/80 cursor-pointer";
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return "text-blue-500 dark:text-blue-400";
      case 2: return "text-green-500 dark:text-green-400";
      case 3: return "text-red-500 dark:text-red-400";
      case 4: return "text-purple-500 dark:text-purple-400";
      case 5: return "text-yellow-600 dark:text-yellow-500";
      case 6: return "text-cyan-500 dark:text-cyan-400";
      case 7: return "text-foreground";
      case 8: return "text-muted-foreground";
      default: return "";
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-1 sm:p-6 text-foreground">
      <div className="w-full max-w-md flex flex-col">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-4 sm:mb-6 self-start" })}>
          &larr; Back to Home
        </Link>
        <Card className="w-full border-0 sm:border shadow-none sm:shadow-sm">
          <CardHeader className="pb-4 px-2 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Minesweeper</CardTitle>
            <div className="flex justify-between text-sm sm:text-lg font-semibold px-2 mt-4">
               <div>Mines: {MINES - flagsCount}</div>
               <div>Status: {gameWon ? "🏆 Won" : gameOver ? "💥 Lost" : "Playing"}</div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-1 sm:px-6">
            <div 
               className="grid gap-[1px] mb-6 border border-white p-[1px] bg-white rounded-sm w-full touch-none select-none shadow-sm"
               style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
               onContextMenu={(e) => e.preventDefault()}
            >
              {grid.map((row, r) => (
                row.map((cell, c) => (
                  <div 
                    key={`${r}-${c}`}
                    onClick={() => revealCell(r, c)}
                    onContextMenu={(e) => toggleFlag(e, r, c)}
                    className={`w-full aspect-square flex items-center justify-center text-[10px] sm:text-sm font-bold select-none rounded-none transition-colors
                      ${getCellColor(cell)} 
                      ${cell.isRevealed && !cell.isMine ? getNumberColor(cell.neighborMines) : ''}
                    `}
                  >
                    {getCellContent(cell)}
                  </div>
                ))
              ))}
            </div>

            <div className="flex gap-4 justify-center mt-2 w-full h-12">
              {(gameOver || gameWon) && (
                <div className="w-full animate-in fade-in duration-300">
                  <Button onClick={initGame} className="w-full h-full" size="lg">Play Again</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
