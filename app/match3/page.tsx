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

  const generateBoard = useCallback(() => {
    const newBoard: Candy[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        newBoard.push({
          id: `${Math.random()}`,
          type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
          r,
          c
        });
      }
    }
    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(generateBoard());
  }, [generateBoard]);

  const handleCandyClick = (r: number, c: number) => {
    if (!selected) {
      setSelected({ r, c });
      return;
    }

    const { r: r1, c: c1 } = selected;
    const isAdjacent = Math.abs(r1 - r) + Math.abs(c1 - c) === 1;

    if (isAdjacent) {
      // Swap
      setBoard(prev => {
        const newBoard = [...prev];
        const candy1 = newBoard.find(candy => candy.r === r1 && candy.c === c1);
        const candy2 = newBoard.find(candy => candy.r === r && candy.c === c);
        
        if (candy1 && candy2) {
          candy1.r = r;
          candy1.c = c;
          candy2.r = r1;
          candy2.c = c1;
        }
        return newBoard;
      });
      // In a real Match-3 we'd check for matches and animate, but for simplicity:
      setScore(s => s + 10);
    }
    
    setSelected(null);
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
            <div className="w-full aspect-square bg-muted rounded-lg p-1 sm:p-2 relative touch-none select-none shadow-inner border-2 border-border/50">
              <div 
                className="relative w-full h-full"
              >
                <AnimatePresence>
                  {board.map((candy) => (
                    <motion.div
                      key={candy.id}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      onClick={() => handleCandyClick(candy.r, candy.c)}
                      className={`absolute flex items-center justify-center cursor-pointer rounded-md border-2 
                        ${selected?.r === candy.r && selected?.c === candy.c ? 'border-primary bg-primary/20 scale-110 z-10' : 'border-transparent hover:bg-black/5'}
                      `}
                      style={{
                        width: `${100 / GRID_SIZE}%`,
                        height: `${100 / GRID_SIZE}%`,
                        top: `${(candy.r * 100) / GRID_SIZE}%`,
                        left: `${(candy.c * 100) / GRID_SIZE}%`,
                        fontSize: "2rem"
                      }}
                    >
                      {candy.type}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <Button 
              className="mt-6 w-full" 
              variant="outline" 
              onClick={() => { setBoard(generateBoard()); setScore(0); }}
            >
              Reset Board
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
