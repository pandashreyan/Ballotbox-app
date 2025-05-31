import Link from 'next/link';
import { VoteIcon } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold hover:opacity-90 transition-opacity">
          <VoteIcon className="h-8 w-8" />
          BallotBox
        </Link>
        <nav>
          {/* Navigation links can be added here if needed */}
        </nav>
      </div>
    </header>
  );
}
