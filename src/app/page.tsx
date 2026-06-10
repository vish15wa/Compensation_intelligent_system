import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, GitCompare, PlusCircle, TrendingUp, LogIn, Shield, ArrowRight, 
  Search, Target, Eye, Users, Database, Building2, Sparkles, 
  ChevronRight, Star, Award, Zap, Globe, Lock, Activity 
} from "lucide-react";

const accentColors = {
  bronze: { hex: "#cb997e", light: "bg-[#cb997e]/10", text: "text-[#cb997e]", border: "border-[#cb997e]/20" },
  teal: { hex: "#4a7c7f", light: "bg-[#4a7c7f]/10", text: "text-[#4a7c7f]", border: "border-[#4a7c7f]/20" },
  coral: { hex: "#d4836d", light: "bg-[#d4836d]/10", text: "text-[#d4836d]", border: "border-[#d4836d]/20" },
  gold: { hex: "#c9a96e", light: "bg-[#c9a96e]/10", text: "text-[#c9a96e]", border: "border-[#c9a96e]/20" },
  sage: { hex: "#a5a58d", light: "bg-[#a5a58d]/10", text: "text-[#a5a58d]", border: "border-[#a5a58d]/20" },
  charcoal: { hex: "#596e79", light: "bg-[#596e79]/10", text: "text-[#596e79]", border: "border-[#596e79]/20" },
  plum: { hex: "#8b6f8c", light: "bg-[#8b6f8c]/10", text: "text-[#8b6f8c]", border: "border-[#8b6f8c]/20" },
  rust: { hex: "#b67a6a", light: "bg-[#b67a6a]/10", text: "text-[#b67a6a]", border: "border-[#b67a6a]/20" },
};

const stepColors = [accentColors.bronze, accentColors.teal, accentColors.gold];
const featureColors = [accentColors.bronze, accentColors.teal, accentColors.coral, accentColors.gold];
const statColors = [accentColors.bronze, accentColors.teal, accentColors.gold, accentColors.sage];

export default function LandingPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Benchmark Your Pay",
      description: "See exactly where your compensation ranks against peers at the same company, role, and level — instantly.",
    },
    {
      icon: GitCompare,
      title: "Side-by-Side Comparisons",
      description: "Compare compensation packages across companies, levels, and locations. Make informed decisions with real data.",
    },
    {
      icon: BarChart3,
      title: "Company Analytics",
      description: "Dive deep into compensation trends, salary distribution, role breakdowns, and location-wise analysis.",
    },
    {
      icon: PlusCircle,
      title: "Crowdsourced Data",
      description: "Every submission makes the data more accurate. Contribute anonymously and help the community.",
    },
  ];

  const steps = [
    {
      icon: Search,
      title: "Explore Salaries",
      description: "Browse anonymous compensation data from thousands of tech professionals across top Indian companies.",
    },
    {
      icon: GitCompare,
      title: "Compare Offers",
      description: "Stack your offer against market data. See percentiles, averages, and make informed career moves.",
    },
    {
      icon: Target,
      title: "Know Your Worth",
      description: "Use real data to negotiate confidently. Understand exactly where you stand in the market.",
    },
  ];

  const stats = [
    { icon: Database, value: "700+", label: "Salary Entries" },
    { icon: Building2, value: "6", label: "Top Companies" },
    { icon: Users, value: "5", label: "Roles Tracked" },
    { icon: Sparkles, value: "100%", label: "Anonymous" },
  ];

  const testimonials = [
    { text: "Knew exactly what to ask for in my negotiation. Got 30% above my initial offer.", role: "SDE at Amazon" },
    { text: "The comparison tool helped me realize I was underpaid. Switched jobs with confidence.", role: "PM at Uber" },
    { text: "Finally, transparent salary data for the Indian market. Game changer.", role: "Engineer at Google" },
  ];

  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* ───── HERO ───── */}
      <div className="relative w-full">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#cb997e]/15 blur-3xl" />
          <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-[#4a7c7f]/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-[#d4836d]/10 blur-3xl" />
          <div className="absolute top-10 left-1/2 w-64 h-64 rounded-full bg-[#c9a96e]/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center text-center pt-20 sm:pt-28 pb-16 space-y-8 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cb997e]/20 bg-[#cb997e]/8 px-4 py-1.5 text-xs font-medium text-[#cb997e] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#cb997e] animate-pulse" />
            Crowdsourced tech compensation intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            <span className="text-[#596e79]">
              Know your worth.
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#cb997e] via-[#d4836d] to-[#4a7c7f] bg-clip-text text-transparent">
              Benchmark your pay.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#596e79] max-w-2xl leading-relaxed">
            PayLens gives you anonymous, crowdsourced compensation data from top tech companies in India.
            See how your salary stacks up, compare offers, and make data-driven career moves.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/salaries">
              <Button size="lg" className="h-13 px-8 bg-[#596e79] hover:bg-[#596e79]/90 text-[#f0ece2] text-base gap-2 w-full sm:w-auto shadow-lg shadow-[#596e79]/25">
                Explore Salaries
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="h-13 px-8 border-[#596e79]/20 text-[#596e79] hover:bg-[#596e79]/5 text-base gap-2 w-full sm:w-auto">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Floating metrics */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-[#596e79]">
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#cb997e]" /> 6 top companies</span>
            <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-[#4a7c7f]" /> 5 roles tracked</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-[#d4836d]" /> 100% anonymous</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#c9a96e]" /> Free to use</span>
          </div>
        </div>
      </div>

      {/* ───── LARGE DECORATIVE DIVIDER ───── */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#cb997e]/20 to-transparent" />
      </div>

      {/* ───── STATS STRIP ───── */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const c = statColors[i];
            return (
              <div key={stat.label} className="relative group">
                <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-[#dfd3c3]/50 p-5 text-center hover:shadow-md hover:shadow-[#596e79]/5 transition-all duration-300">
                  <div className={`inline-flex rounded-xl ${c.light} p-2.5 mb-3 ${c.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-black text-[#596e79]">{stat.value}</div>
                  <div className="text-[11px] text-[#596e79] font-semibold uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───── SIGN-IN PROMPT ───── */}
      <div className="w-full max-w-3xl mx-auto px-4 mb-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#cb997e]/10 via-[#4a7c7f]/8 to-[#d4836d]/10" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#cb997e]/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4a7c7f]/10 rounded-full blur-2xl" />
          <div className="relative border border-[#dfd3c3]/60 rounded-2xl p-6 sm:p-7 text-center space-y-4">
            <p className="text-sm text-[#596e79]">
              <span className="font-bold text-[#596e79]">Sign in</span> to save comparisons, track submissions, and access your personal dashboard.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/auth/signin">
                <Button size="sm" className="bg-[#596e79] hover:bg-[#596e79]/90 text-[#f0ece2] px-6 shadow-md shadow-[#596e79]/15">
                  Sign In / Register
                </Button>
              </Link>
              <Link href="/salaries">
                <Button size="sm" variant="outline" className="border-[#596e79]/20 text-[#596e79] hover:bg-[#596e79]/5 px-6">
                  Browse as Guest
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ───── HOW IT WORKS ───── */}
      <div className="w-full max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <div className="inline-flex rounded-full bg-[#cb997e]/10 border border-[#cb997e]/20 px-4 py-1 text-xs font-semibold text-[#cb997e] mb-4">
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#596e79]">
            How it works
          </h2>
          <p className="text-[#596e79] mt-2 text-sm max-w-md mx-auto">
            Three simple steps to take control of your career
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const c = stepColors[i];
            return (
              <div key={step.title} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[40%] h-px bg-gradient-to-r from-[#cb997e]/30 to-transparent" 
                       style={i === 0 ? {backgroundImage: "linear-gradient(to right, #cb997e40, #4a7c7f40)"} : {backgroundImage: "linear-gradient(to right, #4a7c7f40, #c9a96e40)"}} />
                )}
                <div className="rounded-2xl border border-[#dfd3c3]/50 bg-white/40 backdrop-blur-sm p-6 sm:p-7 h-full hover:shadow-lg hover:shadow-[#596e79]/5 transition-all duration-300 hover:-translate-y-1 relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`inline-flex rounded-xl ${c.light} p-3 ${c.text}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-3xl font-black ${c.text}/15`}>0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#596e79] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#596e79] leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───── FEATURES GRID ───── */}
      <div className="w-full max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <div className="inline-flex rounded-full bg-[#4a7c7f]/10 border border-[#4a7c7f]/20 px-4 py-1 text-xs font-semibold text-[#4a7c7f] mb-4">
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#596e79]">
            Everything you need
          </h2>
          <p className="text-[#596e79] mt-2 text-sm max-w-md mx-auto">
            Built for tech professionals in India, by the community
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const c = featureColors[i];
            return (
              <div key={feature.title} className="group rounded-2xl border border-[#dfd3c3]/50 bg-white/40 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-[#596e79]/5 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className={`inline-flex rounded-xl ${c.light} p-3 ${c.text} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#596e79]">{feature.title}</h3>
                    <p className="text-sm text-[#596e79] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───── TESTIMONIALS ───── */}
      <div className="w-full max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex rounded-full bg-[#d4836d]/10 border border-[#d4836d]/20 px-4 py-1 text-xs font-semibold text-[#d4836d] mb-4">
            Trusted by professionals
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#596e79]">
            What users say
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {testimonials.map((t, i) => {
            const dotColors = [accentColors.bronze.hex, accentColors.teal.hex, accentColors.gold.hex];
            return (
              <div key={i} className="rounded-2xl border border-[#dfd3c3]/50 bg-white/40 backdrop-blur-sm p-6 space-y-3 hover:shadow-md hover:shadow-[#596e79]/5 transition-all duration-300">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-[#cb997e] text-[#cb997e]" />
                  ))}
                </div>
                <p className="text-sm text-[#596e79] leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: dotColors[i] }} />
                  <span className="text-xs font-semibold text-[#596e79]">{t.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───── FINAL CTA ───── */}
      <div className="w-full max-w-3xl mx-auto px-4 py-16">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cb997e]/12 via-[#4a7c7f]/8 to-[#d4836d]/10" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-[#cb997e]/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-56 h-56 bg-[#4a7c7f]/10 rounded-full blur-3xl" />
          
          <div className="relative border border-[#dfd3c3]/60 rounded-2xl p-8 sm:p-12 text-center space-y-5">
            <div className="inline-flex rounded-xl bg-[#596e79]/10 p-3">
              <Award className="h-6 w-6 text-[#596e79]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#596e79]">
              Ready to see where you stand?
            </h2>
            <p className="text-[#596e79] text-sm max-w-md mx-auto">
              Join thousands of tech professionals anonymously contributing and benchmarking compensation data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              <Link href="/auth/signin">
                <Button size="lg" className="h-12 px-8 bg-[#596e79] hover:bg-[#596e79]/90 text-[#f0ece2] gap-2 w-full sm:w-auto shadow-lg shadow-[#596e79]/20">
                  <LogIn className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <Link href="/salaries">
                <Button size="lg" variant="outline" className="h-12 px-8 border-[#596e79]/20 text-[#596e79] hover:bg-[#596e79]/5 gap-2 w-full sm:w-auto">
                  <TrendingUp className="h-4 w-4" />
                  Browse Anonymously
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
