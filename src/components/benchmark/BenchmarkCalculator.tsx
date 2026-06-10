"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/normalization";
import { BarChart3, Users, TrendingUp, Target, Loader2, Search } from "lucide-react";

interface BenchmarkResult {
  percentile: number | null;
  totalEntries: number;
  above: number;
  below: number;
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  peerCount: number;
}

function PercentileGauge({ percentile }: { percentile: number }) {
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const offset = circumference * 0.25;
  const progress = offset + (arcLength * percentile) / 100;

  const getColor = (pct: number) => {
    if (pct < 25) return "#ef4444";
    if (pct < 50) return "#f59e0b";
    if (pct < 75) return "#22c55e";
    return "#6366f1";
  };

  const color = getColor(percentile);

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="140" viewBox="0 0 200 140">
        <circle
          cx="100"
          cy="110"
          r={normalizedRadius}
          fill="none"
          stroke="rgb(24 24 27)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
          transform="rotate(135 100 110)"
        />
        <circle
          cx="100"
          cy="110"
          r={normalizedRadius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(135 100 110)"
          className="transition-all duration-1000 ease-out"
        />
        <text
          x="100"
          y="100"
          textAnchor="middle"
          fill="rgb(244 244 245)"
          fontSize="36"
          fontWeight="bold"
          fontFamily="inherit"
        >
          {percentile}
        </text>
        <text
          x="100"
          y="120"
          textAnchor="middle"
          fill="rgb(113 113 122)"
          fontSize="12"
          fontFamily="inherit"
        >
          percentile
        </text>
      </svg>
    </div>
  );
}

const COMMON_ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Solutions Architect",
  "Engineering Manager",
  "SDE",
  "Frontend Engineer",
  "Backend Engineer",
  "DevOps Engineer",
  "ML Engineer",
];

const COMMON_LEVELS = ["L3", "L4", "L5", "L6", "L7", "E3", "E4", "E5", "E6", "IC3", "IC4", "IC5", "IC6"];

export default function BenchmarkCalculator() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [totalComp, setTotalComp] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  const { data: companies } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 300000,
  });
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const filteredCompanies = companies?.filter?.((c: any) =>
    c.name.toLowerCase().includes(company.toLowerCase())
  ) ?? [];

  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !level || !totalComp) {
      setError("All fields are required");
      return;
    }
    const total = parseFloat(totalComp);
    if (isNaN(total) || total <= 0) {
      setError("Enter a valid total compensation amount");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, level: level.toUpperCase(), totalCompensation: total }),
      });
      const data = await res.json();
      if (data.error === "Not enough data") {
        setResult({
          percentile: null,
          totalEntries: 0,
          above: 0,
          below: 0,
          average: null,
          median: null,
          min: null,
          max: null,
          peerCount: 0,
        });
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to calculate benchmark. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  return (
    <Card className="bg-white/80 border-olive overflow-hidden">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
          {/* Left: Form */}
          <div className="p-6 lg:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-bronze">
                <Target className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider text-bronze">Know Your Worth</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Benchmark Your Compensation
              </h3>
              <p className="text-sm text-muted-foreground">
                See how your total compensation compares to peers at the same company, role, and level.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company */}
              <div className="relative">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Company
                </label>
                <Input
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                  placeholder="e.g. Google, Microsoft"
                  className="bg-white border-olive h-10"
                />
                {showCompanyDropdown && company && filteredCompanies.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-olive bg-white shadow-lg max-h-40 overflow-y-auto">
                    {filteredCompanies.map((c: any) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={() => {
                          setCompany(c.name);
                          setShowCompanyDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Role */}
              <div className="relative">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <Input
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setShowRoleDropdown(true);
                  }}
                  onFocus={() => setShowRoleDropdown(true)}
                  onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
                  placeholder="e.g. Software Engineer"
                  className="bg-white border-olive h-10"
                />
                {showRoleDropdown && role && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-olive bg-white shadow-lg max-h-40 overflow-y-auto">
                    {COMMON_ROLES.filter((r) => r.toLowerCase().includes(role.toLowerCase())).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onMouseDown={() => {
                          setRole(r);
                          setShowRoleDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Level */}
              <div className="relative">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Level
                </label>
                <Input
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setShowLevelDropdown(true);
                  }}
                  onFocus={() => setShowLevelDropdown(true)}
                  onBlur={() => setTimeout(() => setShowLevelDropdown(false), 200)}
                  placeholder="e.g. L4, E5, IC3"
                  className="bg-white border-olive h-10"
                />
                {showLevelDropdown && level && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-olive bg-white shadow-lg max-h-40 overflow-y-auto">
                    {COMMON_LEVELS.filter((l) => l.toLowerCase().includes(level.toLowerCase())).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onMouseDown={() => {
                          setLevel(l);
                          setShowLevelDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Compensation */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Your Total Compensation (₹)
                </label>
                <Input
                  type="number"
                  value={totalComp}
                  onChange={(e) => setTotalComp(e.target.value)}
                  placeholder="e.g. 4500000"
                  className="bg-white border-olive h-10"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-400">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 bg-bronze hover:bg-bronze flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                  {loading ? "Calculating..." : "Benchmark"}
                </Button>
                {result && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="border-olive hover:bg-muted"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Results */}
          <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-bronze" />
                <p className="text-sm">Crunching the numbers...</p>
              </div>
            ) : result === null ? (
              <div className="text-center space-y-3 max-w-sm">
                <div className="mx-auto w-16 h-16 rounded-full bg-olive border border-olive flex items-center justify-center">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Fill in your details and hit <span className="text-bronze font-semibold">Benchmark</span> to see where you stand among your peers.
                </p>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll compare your compensation against anonymous salary submissions from the same company, role, and level.
                </p>
              </div>
            ) : result.percentile === null ? (
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-amber-400" />
                </div>
                <h4 className="text-lg font-bold text-foreground">Insufficient Data</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We don&apos;t have enough submissions for {company} - {role} - {level} yet. Contribute yours to help others!
                </p>
              </div>
            ) : (
              <div className="w-full space-y-6">
                {/* Gauge */}
                <PercentileGauge percentile={result.percentile} />

                {/* Result Message */}
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    You earn more than{" "}
                    <span className="text-bronze">{result.percentile}%</span> of peers
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {result.totalEntries} submissions at {company} &middot; {role} &middot; {level}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-card border border-olive p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your Comp</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{formatINR(parseFloat(totalComp) || 0)}</p>
                  </div>
                  <div className="rounded-lg bg-card border border-olive p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Peer Avg</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{formatINR(result.average || 0)}</p>
                  </div>
                  <div className="rounded-lg bg-card border border-olive p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Median</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{formatINR(result.median || 0)}</p>
                  </div>
                  <div className="rounded-lg bg-card border border-olive p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Peers</p>
                    <p className="text-lg font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-bronze" />
                      {result.totalEntries}
                    </p>
                  </div>
                </div>

                {/* Range Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Min: {formatINR(result.min || 0)}</span>
                    <span>Max: {formatINR(result.max || 0)}</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-olive overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-olive via-bronze to-desert transition-all duration-1000"
                      style={{ width: `${result.percentile}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-bronze shadow-lg shadow-bronze/30 transition-all duration-1000"
                      style={{ left: `calc(${result.percentile}% - 6px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0th</span>
                    <span>50th</span>
                    <span>100th</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
