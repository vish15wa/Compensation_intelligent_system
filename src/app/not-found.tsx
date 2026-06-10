import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="text-7xl font-black text-foreground/60">404</div>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button className="flex items-center gap-1.5">
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </Link>
    </div>
  );
}
