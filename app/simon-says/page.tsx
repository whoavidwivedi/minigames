"use client"
import { useState, useEffect, useCallback } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"]
const ACTIVE_COLORS = ["#fca5a5", "#86efac", "#93c5fd", "#fde047"]

export default function SimonSays() {
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [activeColor, setActiveColor] = useState<number | null>(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [score, setScore] = useState(0)

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)])
    setPlayerSequence([])
    setIsPlaying(true)
    setIsGameOver(false)
    setIsPlayerTurn(false)
    setScore(0)
  }

  const playSequence = useCallback(async () => {
    setIsPlayerTurn(false)
    
    // Brief pause before showing the new sequence
    await new Promise(resolve => setTimeout(resolve, 800))
    
    for (let i = 0; i < sequence.length; i++) {
      if (!isPlaying) return // Safety check
      
      setActiveColor(sequence[i])
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setActiveColor(null)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    setIsPlayerTurn(true)
  }, [sequence, isPlaying])

  useEffect(() => {
    if (isPlaying && sequence.length > 0) {
      playSequence()
    }
  }, [isPlaying, sequence, playSequence])

  const handleColorClick = (colorIndex: number) => {
    if (!isPlayerTurn || isGameOver) return

    // Flash the clicked color briefly
    setActiveColor(colorIndex)
    setTimeout(() => setActiveColor(null), 200)

    const newPlayerSequence = [...playerSequence, colorIndex]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1
    
    // Check if the current tap matches the sequence
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      setIsGameOver(true)
      setIsPlaying(false)
      return
    }

    // Check if the player has successfully completed the full sequence
    if (newPlayerSequence.length === sequence.length) {
      setScore(sequence.length)
      setIsPlayerTurn(false)
      
      // Wait a moment before adding the next color
      setTimeout(() => {
        setSequence(prev => [...prev, Math.floor(Math.random() * 4)])
        setPlayerSequence([])
      }, 500)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background p-4 sm:p-8">
      <div className="w-full max-w-md flex flex-col">
        <div className="self-start">
          <Link href="/" className={buttonVariants({ variant: "ghost", className: "mb-6 -ml-4" })}>
            &larr; Back to Home
          </Link>
        </div>

        <Card className="w-full relative overflow-hidden border-border">
          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-background/95 backdrop-blur-sm p-6 text-center">
              <h2 className="text-4xl font-black mb-2 text-destructive">Game Over!</h2>
              <p className="text-2xl font-semibold mb-8 text-foreground">Score: {score}</p>
              <div className="flex flex-col gap-4 w-full max-w-[200px]">
                <Button size="lg" onClick={startGame} className="w-full text-lg">
                  Play Again
                </Button>
                <Link href="/" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full text-lg" })}>
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-foreground">Simon Says</CardTitle>
            <p className="text-muted-foreground mt-2">Repeat the sequence!</p>
          </CardHeader>
          
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col items-center w-full">
              <div className="text-2xl font-bold mb-8 text-foreground">
                Score: {score}
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full aspect-square mb-8">
                {COLORS.map((color, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-full rounded-2xl transition-all duration-200 border-4 border-transparent hover:border-foreground/20 hover:scale-[1.02] active:scale-95 p-0"
                    style={{ 
                      backgroundColor: activeColor === index ? ACTIVE_COLORS[index] : color,
                      boxShadow: activeColor === index ? `0 0 20px ${ACTIVE_COLORS[index]}` : 'none'
                    }}
                    onClick={() => handleColorClick(index)}
                    disabled={(!isPlayerTurn && isPlaying) || isGameOver}
                  />
                ))}
              </div>

              {(!isPlaying && !isGameOver) ? (
                <Button size="lg" onClick={startGame} className="w-full max-w-[200px] text-xl py-6 font-bold">
                  Start Game
                </Button>
              ) : (
                <div className="h-12 flex items-center justify-center w-full">
                  {isPlaying && !isGameOver && (
                    <p className="text-lg font-medium text-muted-foreground animate-pulse text-center">
                      {isPlayerTurn ? "Your turn!" : "Watch the sequence..."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
