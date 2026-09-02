"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from 'next/link';

const WORDS = [
  "APPLE", "TRAIN", "HOUSE", "MOUSE", "BRICK", 
  "GHOST", "SWORD", "PLANT", "TABLE", "CHAIR", 
  "WATCH", "CLOCK", "RIVER", "BREAD", "WATER",
  "NIGHT", "LIGHT", "STORM", "HEART", "DREAM"
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export default function WordGuess() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus('playing');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      if (e.key === 'Enter') {
        if (currentGuess.length === WORD_LENGTH) {
          const newGuesses = [...guesses, currentGuess];
          setGuesses(newGuesses);
          setCurrentGuess("");
          
          if (currentGuess === targetWord) {
            setGameStatus('won');
          } else if (newGuesses.length === MAX_GUESSES) {
            setGameStatus('lost');
          }
        }
      } else if (e.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Za-z]$/.test(e.key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(prev => (prev + e.key).toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus, guesses, targetWord]);

  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) return "bg-green-500 text-white border-green-500";
    if (targetWord.includes(letter)) return "bg-yellow-500 text-white border-yellow-500";
    return "bg-muted text-muted-foreground border-muted";
  };

  const getKeyboardStatus = (letter: string) => {
    let status = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    for (const guess of guesses) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === letter) {
          if (targetWord[i] === letter) return "bg-green-500 text-white hover:bg-green-600";
          if (targetWord.includes(letter)) {
             status = "bg-yellow-500 text-white hover:bg-yellow-600";
          } else if (status === "bg-secondary text-secondary-foreground hover:bg-secondary/80") {
             status = "bg-muted text-muted-foreground hover:bg-muted/80";
          }
        }
      }
    }
    return status;
  };

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"]
  ];

  const handleKeyClick = (key: string) => {
     if (gameStatus !== 'playing') return;
     if (key === 'Enter') {
        if (currentGuess.length === WORD_LENGTH) {
          const newGuesses = [...guesses, currentGuess];
          setGuesses(newGuesses);
          setCurrentGuess("");
          
          if (currentGuess === targetWord) {
            setGameStatus('won');
          } else if (newGuesses.length === MAX_GUESSES) {
            setGameStatus('lost');
          }
        }
      } else if (key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(prev => (prev + key).toUpperCase());
        }
      }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4 sm:p-6 text-foreground">
      <div className="w-full max-w-md flex flex-col">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 -ml-4 self-start" })}>
          &larr; Back to Home
        </Link>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Word Guess</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full max-w-[280px] grid grid-rows-6 gap-2 mb-8 mt-4 mx-auto">
              {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                const isCurrentRow = rowIndex === guesses.length;
                const guess = guesses[rowIndex];
                
                return (
                  <div key={rowIndex} className="grid grid-cols-5 gap-2">
                    {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                      let letter = "";
                      let statusClass = "bg-transparent border-2 border-border text-foreground";
                      
                      if (guess) {
                        letter = guess[colIndex];
                        statusClass = getLetterStatus(letter, colIndex, guess);
                      } else if (isCurrentRow && currentGuess[colIndex]) {
                        letter = currentGuess[colIndex];
                        statusClass = "bg-transparent border-2 border-foreground text-foreground";
                      }

                      return (
                        <div 
                          key={colIndex} 
                          className={`w-full aspect-square flex items-center justify-center text-2xl font-bold rounded ${statusClass}`}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="w-full flex flex-col items-center gap-2 mb-4">
              {keyboardRows.map((row, i) => (
                <div key={i} className="flex gap-1 sm:gap-2 justify-center w-full">
                  {row.map(key => {
                     const isSpecial = key === "Enter" || key === "Backspace";
                     return (
                    <button
                      key={key}
                      onClick={() => handleKeyClick(key)}
                      className={`px-1 py-3 sm:py-4 rounded text-xs sm:text-sm font-semibold transition-colors flex-1
                        ${isSpecial ? 'max-w-[4rem] text-[10px] sm:text-xs' : 'max-w-[2.5rem]'} 
                        ${getKeyboardStatus(key)}
                      `}
                    >
                      {key === "Backspace" ? "⌫" : key}
                    </button>
                  )})}
                </div>
              ))}
            </div>

            <div className="text-center w-full mt-4 h-28 flex flex-col justify-end">
              {gameStatus !== 'playing' && (
                <div className="animate-in fade-in duration-300">
                  <p className="text-xl font-bold mb-4">
                    {gameStatus === 'won' ? 'You won! 🎉' : `Game Over! The word was ${targetWord}`}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={initGame} className="w-full" size="lg">Play Again</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
