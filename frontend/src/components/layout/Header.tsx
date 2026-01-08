import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="Logo" className="h-7 w-7" />
          <span className="text-xl font-bold">Fluctuate Portfolio</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#assets" className="text-sm font-medium hover:text-primary transition-colors">
            Assets
          </a>
          <a href="#history" className="text-sm font-medium hover:text-primary transition-colors">
            History
          </a>
        </nav>

        <ConnectButton />
      </div>
    </header>
  )
}
