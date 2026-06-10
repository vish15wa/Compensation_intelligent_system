import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, GitCompare, PlusCircle, TrendingUp, LogIn, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Benchmark Your Pay",
      description: "See exactly where your compensation ranks. Compare your total package against peers at the same company, role, and level — instantly.",
      color: "text-bronze",
      bg: "bg-bronze/10",
      border: "border-bronze/20",
    },
    {
      icon: GitCompare,
      title: "Side-by-Side Comparisons",
      description: "Compare compensation packages across companies, levels, and locations. Make informed decisions with real data.",
      color: "text-muted-foreground",
      bg: "bg-sage/10",
      border: "border-sage/20",
    },
    {
      icon: BarChart3,
      title: "Company Analytics",
      description: "Dive deep into any company's compensation trends, salary distribution, role breakdowns, and location-wise analysis.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      icon: PlusCircle,
      title: "Crowdsourced Data",
      description: "Every submission makes the data more accurate. Contribute anonymously and help the community.",
      color: "text-desert",
      bg: "bg-desert/10",
      border: "border-desert/20",
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-[80vh]">
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-16 sm:pt-24 pb-12 space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-bronze/20 bg-bronze/5 px-4 py-1.5 text-xs font-medium text-bronze">
          <span className="h-1.5 w-1.5 rounded-full bg-bronze animate-pulse" />
          Crowdsourced tech compensation intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="text-charcoal">
            Know your worth.
          </span>
          <br />
          <span className="bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/60 bg-clip-text text-transparent">
            Benchmark your pay.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-charcoal max-w-2xl leading-relaxed">
          PayLens gives you anonymous, crowdsourced compensation data from top tech companies in India.
          See how your salary stacks up, compare offers, and make data-driven career moves.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/salaries">
            <Button size="lg" className="h-12 px-8 bg-bronze hover:bg-bronze text-base gap-2 w-full sm:w-auto">
              Explore Salaries
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="h-12 px-8 border-olive hover:bg-muted text-base gap-2 w-full sm:w-auto">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>

        <p className="text-xs text-charcoal pt-2">
          No account needed to browse. Sign in to save comparisons and track your submissions.
        </p>
      </div>

      {/* Sign-in prompt */}
      <div className="w-full max-w-lg mx-auto py-4">
        <div className="rounded-xl border border-border bg-card/50 p-5 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Sign in</span> to save comparisons, track submissions, and access your personal dashboard.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/auth/signin">
              <Button size="sm" className="bg-charcoal hover:bg-charcoal/90 text-bone px-5">
                Sign In / Register
              </Button>
            </Link>
            <Link href="/salaries">
              <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted px-5">
                Browse as Guest
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl mx-auto py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Everything you need to know your market value
          </h2>
          <p className="text-charcoal mt-2 text-sm">
            Built for tech professionals in India, by the community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-white/80 border-olive hover:border-olive transition-colors group">
                <CardContent className="p-6 space-y-3">
                  <div className={`inline-flex rounded-lg ${feature.bg} p-2.5 ${feature.color} border ${feature.border} group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-3xl mx-auto py-12 text-center space-y-4">
        <div className="rounded-2xl border border-olive bg-gradient-to-b from-background/80 to-background/80 p-8 sm:p-12 space-y-4">
          <Shield className="h-8 w-8 text-bronze mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Ready to see where you stand?
          </h2>
          <p className="text-charcoal text-sm max-w-md mx-auto">
            Join thousands of tech professionals anonymously contributing and benchmarking compensation data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/auth/signin">
              <Button size="lg" className="h-11 px-8 bg-bronze hover:bg-bronze gap-2 w-full sm:w-auto">
                <LogIn className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
            <Link href="/salaries">
              <Button size="lg" variant="outline" className="h-11 px-8 border-olive hover:bg-muted gap-2 w-full sm:w-auto">
                <TrendingUp className="h-4 w-4" />
                Browse Anonymously
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
