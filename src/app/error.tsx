"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="text-muted-foreground text-sm max-w-md text-center">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} className="flex items-center gap-1.5">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
