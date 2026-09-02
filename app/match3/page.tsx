"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_SIZE = 8;
const CANDY_TYPES = ["🍎", "🍊", "🍇", "🍉", "🍒", "🍋"];

type Candy = {
  id: string;
  type: string;
  r: number;
  c: number;
};

export default function Match3() {
  const [board, setBoard] = useState<Candy[]>([]);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generates a board without immediate matches
  const generateBoard = useCallback(() => {
    let newBoard: Candy[] = [];
    let idCounter = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let type;
        do {
          type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
        } while (
          (r >= 2 && newBoard.find(x => x.r === r-1 && x.c === c)?.type === type && newBoard.find(x => x.r === r-2 && x.c === c)?.type === type) ||
          (c >= 2 && newBoard.find(x => x.r === r && x.c === c-1)?.type === type && newBoard.find(x => x.r === r && x.c === c-2)?.type === type)
        );
        newBoard.push({ id: `initial-${idCounter++}`, type, r, c });
      }
    }
    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(generateBoard());
  }, [generateBoard]);

  const checkMatches = (currentBoard: Candy[]) => {
    const toRemove = new Set<string>();

    // Horizontal check
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const c1 = currentBoard.find(x => x.r === r && x.c === c);
        const c2 = currentBoard.find(x => x.r === r && x.c === c+1);
        const c3 = currentBoard.find(x => x.r === r && x.c === c+2);
        if (c1 && c2 && c3 && c1.type === c2.type && c2.type === c3.type) {
          toRemove.add(c1.id); toRemove.add(c2.id); toRemove.add(c3.id);
        }
      }
    }

    // Vertical check
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const c1 = currentBoard.find(x => x.r === r && x.c === c);
        const c2 = currentBoard.find(x => x.r === r+1 && x.c === c);
        const c3 = currentBoard.find(x => x.r === r+2 && x.c === c);
        if (c1 && c2 && c3 && c1.type === c2.type && c2.type === c3.type) {
          toRemove.add(c1.id); toRemove.add(c2.id); toRemove.add(c3.id);
        }
      }
    }
    return toRemove;
  };

  const processMatches = useCallback(async (currentBoard: Candy[]) => {
    let boardState = [...currentBoard];
    let matchesFound = true;
    let loopCount = 0; // prevent infinite loops
    let totalScore = 0;

    while (matchesFound && loopCount < 10) {
      const toRemove = checkMatches(boardState);
      if (toRemove.size === 0) {
        matchesFound = false;
        break;
      }
      
      totalScore += toRemove.size * 10;
      
      // Remove matches
      boardState = boardState.filter(c => !toRemove.has(c.id));
      setBoard([...boardState]);
      await new Promise(res => setTimeout(res, 300)); // wait for pop animation
      
      // Gravity / Drop
      for (let c = 0; c < GRID_SIZE; c++) {
        const colCandies = boardState.filter(candy => candy.c === c).sort((a, b) => b.r - a.r);
        let currentBottom = GRID_SIZE - 1;
        for (const candy of colCandies) {
          candy.r = currentBottom;
          currentBottom--;
        }
      }
      setBoard([...boardState]);
      await new Promise(res => setTimeout(res, 300)); // wait for drop
      
      // Refill
      for (let c = 0; c < GRID_SIZE; c++) {
        const colCandies = boardState.filter(candy => candy.c === c);
        const missingCount = GRID_SIZE - colCandies.length;
        for (let i = 0; i < missingCount; i++) {
          boardState.push({
            id: `refill-${Date.now()}-${c}-${i}`,
            type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
            r: i,
            c: c
          });
        }
      }
      setBoard([...boardState]);
      await new Promise(res => setTimeout(res, 300));
      
      loopCount++;
    }
    
    if (totalScore > 0) {
      setScore(s => s + totalScore);
    }
    setIsAnimating(false);
  }, []);

  const handleCandyClick = async (r: number, c: number) => {
    if (isAnimating) return;
    
    if (!selected) {
      setSelected({ r, c });
      return;
    }

    const { r: r1, c: c1 } = selected;
    const isAdjacent = Math.abs(r1 - r) + Math.abs(c1 - c) === 1;

    if (isAdjacent) {
      setIsAnimating(true);
      setSelected(null);

      // Perform swap
      let newBoard = board.map(candy => ({ ...candy }));
      const candy1 = newBoard.find(candy => candy.r === r1 && candy.c === c1);
      const candy2 = newBoard.find(candy => candy.r === r && candy.c === c);
      
      if (candy1 && candy2) {
        candy1.r = r;
        candy1.c = c;
        candy2.r = r1;
        candy2.c = c1;
      }
      
      setBoard(newBoard);
      
      // Check if it resulted in a match
      await new Promise(res => setTimeout(res, 300));
      const toRemove = checkMatches(newBoard);
      
      if (toRemove.size === 0) {
        // Swap back if no match
        const revertedBoard = newBoard.map(candy => ({ ...candy }));
        const c1Rev = revertedBoard.find(candy => candy.id === candy1?.id);
        const c2Rev = revertedBoard.find(candy => candy.id === candy2?.id);
        if (c1Rev && c2Rev) {
          c1Rev.r = r1;
          c1Rev.c = c1;
          c2Rev.r = r;
          c2Rev.c = c;
        }
        setBoard(revertedBoard);
        await new Promise(res => setTimeout(res, 300));
        setIsAnimating(false);
      } else {
        // Process cascade
        await processMatches(newBoard);
      }
    } else {
      setSelected({ r, c });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background p-4 sm:p-8">
      <div className="w-full max-w-md flex flex-col">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 -ml-4 self-start" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <Card className="w-full overflow-hidden border-border relative">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-foreground">Match 3</CardTitle>
            <p className="text-xl font-semibold mt-2">Score: {score}</p>
          </CardHeader>
          
          <CardContent className="p-2 sm:p-4 pt-0 flex flex-col items-center touch-none">
            <div className="w-full aspect-square bg-muted rounded-lg p-1 sm:p-2 relative touch-none select-none shadow-inner border border-border/50">
              <div className="relative w-full h-full">
                <AnimatePresence>
                  {board.map((candy) => (
                    <motion.div
                      key={candy.id}
                      layout
                      initial={{ scale: 0, opacity: 0, filter: "blur(4px)" }}
                      animate={{ 
                        scale: selected?.r === candy.r && selected?.c === candy.c ? 1.15 : 1,
                        opacity: 1,
                        filter: "blur(0px)",
                        top: `${(candy.r * 100) / GRID_SIZE}%`,
                        left: `${(candy.c * 100) / GRID_SIZE}%`,
                      }}
                      exit={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 25,
                        mass: 0.8
                      }}
                      whileHover={{ scale: selected?.r === candy.r && selected?.c === candy.c ? 1.15 : 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCandyClick(candy.r, candy.c)}
                      className={`absolute flex items-center justify-center cursor-pointer rounded-xl shadow-sm transition-shadow
                        ${selected?.r === candy.r && selected?.c === candy.c ? 'ring-4 ring-primary bg-primary/10 z-10 shadow-md' : 'hover:bg-black/5 hover:shadow-md'}
                      `}
                      style={{
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`,
                        fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
                      }}
                    >
                      <span className="drop-shadow-sm">{candy.type}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <Button 
              className="mt-6 w-full" 
              variant="outline" 
              disabled={isAnimating}
              onClick={() => { setBoard(generateBoard()); setScore(0); setSelected(null); }}
            >
              Reset Board
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
