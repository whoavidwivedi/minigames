"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const GRAVITY = 0.6;
const JUMP = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_SPACING = 200;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

export default function Flappy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const gameState = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as { x: number; topHeight: number }[],
    frames: 0
  });

  const jump = useCallback(() => {
    if (!isPlaying && !isGameOver) {
      setIsPlaying(true);
    }
    if (isPlaying && !isGameOver) {
      gameState.current.birdVelocity = JUMP;
    }
  }, [isPlaying, isGameOver]);

  const resetGame = () => {
    gameState.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      frames: 0
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(false);
  };

  const update = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    const state = gameState.current;
    state.frames++;

    // Bird physics
    state.birdVelocity += GRAVITY;
    state.birdY += state.birdVelocity;

    // Floor / ceiling collision
    if (state.birdY > CANVAS_HEIGHT - 20 || state.birdY < 0) {
      setIsGameOver(true);
      return;
    }

    // Generate pipes
    if (state.frames % 100 === 0) {
      const minHeight = 50;
      const maxHeight = CANVAS_HEIGHT - PIPE_SPACING - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      state.pipes.push({ x: CANVAS_WIDTH, topHeight });
    }

    // Move pipes & collision
    for (let i = 0; i < state.pipes.length; i++) {
      const pipe = state.pipes[i];
      pipe.x -= PIPE_SPEED;

      // Collision
      const birdX = 50;
      const birdRadius = 15;

      // Hit Top Pipe
      if (
        birdX + birdRadius > pipe.x &&
        birdX - birdRadius < pipe.x + PIPE_WIDTH &&
        state.birdY - birdRadius < pipe.topHeight
      ) {
        setIsGameOver(true);
      }

      // Hit Bottom Pipe
      if (
        birdX + birdRadius > pipe.x &&
        birdX - birdRadius < pipe.x + PIPE_WIDTH &&
        state.birdY + birdRadius > pipe.topHeight + PIPE_SPACING
      ) {
        setIsGameOver(true);
      }

      // Score
      if (pipe.x === birdX) {
        setScore(s => s + 1);
      }
    }

    // Remove off-screen pipes
    if (state.pipes.length > 0 && state.pipes[0].x < -PIPE_WIDTH) {
      state.pipes.shift();
    }
  }, [isPlaying, isGameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    ctx.fillStyle = "#87CEEB"; // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const state = gameState.current;

    // Draw Pipes
    ctx.fillStyle = "#22c55e"; // Green
    for (const pipe of state.pipes) {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_SPACING, PIPE_WIDTH, CANVAS_HEIGHT);
    }

    // Draw Bird
    ctx.fillStyle = "#eab308"; // Yellow
    ctx.beginPath();
    ctx.arc(50, state.birdY, 15, 0, Math.PI * 2);
    ctx.fill();

  }, []);

  const loop = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Handle Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background p-4 sm:p-8">
      <div className="w-full max-w-md flex flex-col">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 -ml-4 self-start" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <Card className="w-full overflow-hidden border-border relative">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-foreground">Flappy</CardTitle>
            <p className="text-xl font-semibold mt-2">Score: {score}</p>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 flex flex-col items-center touch-none">
            <div 
              className="relative w-full aspect-[2/3] max-w-[400px] rounded-xl overflow-hidden shadow-inner cursor-pointer touch-none border-4 border-muted"
              onPointerDown={(e) => { e.preventDefault(); jump(); }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full object-cover"
              />

              {!isPlaying && !isGameOver && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-foreground animate-pulse">Tap to Start</p>
                </div>
              )}

              {isGameOver && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-6 text-center pointer-events-none">
                  <h2 className="text-4xl font-black mb-2 text-foreground">Game Over!</h2>
                  <p className="text-2xl font-semibold mb-8">Score: {score}</p>
                  <Button size="lg" className="w-full max-w-[200px] text-lg pointer-events-auto" onClick={(e) => { e.stopPropagation(); resetGame(); }}>
                    Play Again
                  </Button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-4">Tap the game area or press Spacebar to jump</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
