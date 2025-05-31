export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground py-6 text-center border-t">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {currentYear} BallotBox. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Your trusted platform for fair and transparent elections.
        </p>
      </div>
    </footer>
  );
}
