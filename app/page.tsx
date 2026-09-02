import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  RiGamepadLine, 
  RiGridLine, 
  RiCircleLine, 
  RiApps2Line, 
  RiDirectionLine, 
  RiPingPongLine, 
  RiHandCoinLine,
  RiMentalHealthLine,
  RiGamepadFill,
  RiFontColor
} from "@remixicon/react";

export default function Home() {
  const games = [
    {
      href: "/memory",
      title: "Memory Match",
      description: "Find matching pairs of cards",
      icon: RiApps2Line
    },
    {
      href: "/snake",
      title: "Snake",
      description: "Classic snake score attack",
      icon: RiDirectionLine
    },
    {
      href: "/2048",
      title: "2048",
      description: "Slide tiles to reach 2048",
      icon: RiGamepadLine
    },
    {
      href: "/simon-says",
      title: "Simon Says",
      description: "Test your sequence memory",
      icon: RiMentalHealthLine
    },
    {
      href: "/minesweeper",
      title: "Minesweeper",
      description: "Clear the board without hitting mines",
      icon: RiGamepadFill
    },
    {
      href: "/word-guess",
      title: "Word Guess",
      description: "Guess the hidden 5-letter word",
      icon: RiFontColor
    },
    {
      href: "/sudoku",
      title: "Sudoku",
      description: "Classic number puzzle",
      icon: RiGridLine
    },
    {
      href: "/flappy",
      title: "Flappy",
      description: "Tap to jump and avoid pipes",
      icon: RiGamepadLine
    },
    {
      href: "/match3",
      title: "Match 3",
      description: "Swap blocks to match three",
      icon: RiApps2Line
    }
  ];

  return (
    <main className="flex min-h-svh flex-col bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto mt-4 w-full max-w-md space-y-8 sm:mt-8 pb-12">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <RiGamepadLine className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mini Games</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a game to start playing
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          {games.map((game, index) => {
            const Icon = game.icon;
            return (
              <Link
                key={index}
                href={game.href}
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="flex flex-row items-center gap-4 p-4 transition-all hover:bg-muted/50 active:scale-[0.98]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </Card>
              </Link>
            )
          })}
        </section>
      </div>
    </main>
  );
}
