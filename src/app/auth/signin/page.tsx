"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chrome, ArrowRight, Loader2 } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Enter an email to continue with demo");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        name: email.split("@")[0],
        callbackUrl,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Login failed");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto space-y-6">
      {/* Brand */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Welcome to PayLens</h1>
        <p className="text-sm text-muted-foreground">Access saved comparisons and submit salaries</p>
      </div>

      {/* Google Sign In */}
      <Button
        onClick={() => signIn("google", { callbackUrl })}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 border-border hover:bg-muted h-12 text-sm font-medium"
      >
        <Chrome className="h-5 w-5" />
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative flex w-full items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-3 text-xs text-muted-foreground uppercase tracking-wider">
          Or continue with email
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Demo / Email Sign In */}
      <form onSubmit={handleDemoSubmit} className="w-full space-y-3">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-600 text-center">
            {error}
          </div>
        )}
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal/90 text-bone"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {loading ? "Signing in..." : "Continue"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        By continuing, you agree to demo terms. Your data stays private and is never shared publicly.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="pb-2" />
        <CardContent className="px-8 pb-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-charcoal" />
              </div>
            }
          >
            <SignInForm />
          </Suspense>
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4 pb-4">
          <p className="text-xs text-muted-foreground text-center">
            Demo mode &mdash; no password needed. Sign in with Google to persist your data.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
