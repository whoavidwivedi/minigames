"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

const EMOJIS = ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🍍", "🥝"];

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setIsGameOver(false);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;

      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);

          if (matchedCards.every((card) => card.isMatched)) {
            setIsGameOver(true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 -ml-4" })}>
          ← Back to Home
        </Link>
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Memory Match</CardTitle>
            <div className="text-sm font-medium text-muted-foreground mt-1">Moves: {moves}</div>
          </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-4">
          <div className="relative w-full aspect-square">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full h-full">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={card.isFlipped || card.isMatched || isGameOver}
                  className={`
                    flex items-center justify-center rounded-xl text-3xl sm:text-4xl transition-all duration-300 w-full h-full
                    ${
                      card.isFlipped || card.isMatched
                        ? "bg-primary/10 cursor-default ring-1 ring-primary/20"
                        : "bg-muted hover:bg-muted/80 active:scale-95 cursor-pointer shadow-sm"
                    }
                  `}
                >
                  <span
                    className={`transition-all duration-300 ${
                      card.isFlipped || card.isMatched ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    }`}
                  >
                    {card.emoji}
                  </span>
                </button>
              ))}
            </div>

            {isGameOver && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center animate-in fade-in duration-500 rounded-xl z-10">
                <div className="text-6xl mb-4 animate-in zoom-in duration-500 delay-150">🎉</div>
                <div>
                  <h2 className="text-2xl font-bold">You Won!</h2>
                  <p className="text-muted-foreground mt-2">It took you {moves} moves to find all pairs.</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col mt-2">
            <Button className="w-full text-base h-10" onClick={initializeGame}>
              {isGameOver ? "Play Again" : "Restart Game"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
