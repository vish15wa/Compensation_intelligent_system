"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/utils/normalization";
import { FileText, Loader2, TrendingUp, TrendingDown, Minus, Star, Gift, IndianRupee } from "lucide-react";

export default function OfferAnalyzer() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [base, setBase] = useState("");
  const [bonus, setBonus] = useState("");
  const [stock, setStock] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: companies } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      return res.json();
    },
    staleTime: 300000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !level || !base) {
      setError("Company, role, level, and base salary are required");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/offer-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          level: level.toUpperCase(),
          base: parseFloat(base),
          bonus: parseFloat(bonus || "0"),
          stock: parseFloat(stock || "0"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      setResult(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreStars = result ? Math.floor(result.score) : 0;

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-white/80 border-olive">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-bronze">
              <FileText className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Offer Analysis</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Analyze Your Offer</h3>
            <p className="text-sm text-muted-foreground">Compare offer details against market data for the same company, role, and level.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-olive bg-white h-10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-bronze"
              >
                <option value="">Select company</option>
                {companies?.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Role</label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer" className="bg-white border-olive h-10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Level</label>
              <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. L4, E5" className="bg-white border-olive h-10" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Base (₹)</label>
                <Input type="number" value={base} onChange={(e) => setBase(e.target.value)} placeholder="e.g. 3000000" className="bg-white border-olive h-10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Bonus (₹)</label>
                <Input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} placeholder="0" className="bg-white border-olive h-10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Stock/yr (₹)</label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className="bg-white border-olive h-10" />
              </div>
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1 h-11 bg-bronze hover:bg-bronze gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {loading ? "Analyzing..." : "Analyze Offer"}
              </Button>
              {result && (
                <Button type="button" variant="outline" onClick={handleReset} className="border-olive hover:bg-muted">
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/80 border-olive">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-bronze" />
              <p className="text-sm text-muted-foreground">Analyzing against market data...</p>
            </div>
          ) : !result ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3">
              <FileText className="h-12 w-12 text-foreground/60" />
              <p className="text-muted-foreground text-sm">Enter offer details to see market comparison</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center pb-4 border-b border-olive">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < scoreStars ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {formatINR(result.breakdown.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Compensation</p>
                <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  result.recommendation?.includes("Excellent") ? "bg-sage/10 text-muted-foreground" :
                  result.recommendation?.includes("Strong") ? "bg-sage/10 text-muted-foreground" :
                  result.recommendation?.includes("Fair") ? "bg-amber-500/10 text-amber-400" :
                  result.recommendation?.includes("market data") ? "bg-card border text-muted-foreground" :
                  "bg-rose-500/10 text-rose-400"
                }`}>
                  {result.recommendation?.includes("Excellent") ? <TrendingUp className="h-3 w-3" /> :
                   result.recommendation?.includes("Strong") ? <TrendingUp className="h-3 w-3" /> :
                   result.recommendation?.includes("Fair") ? <Minus className="h-3 w-3" /> :
                   result.recommendation?.includes("market data") ? <Minus className="h-3 w-3" /> :
                   <TrendingDown className="h-3 w-3" />}
                  {result.recommendation}
                </div>
                {result.matchLevel && result.matchLevel !== "exact" && result.matchLevel !== "none" && (
                  <p className="text-[10px] text-muted-foreground mt-1">Compared across {result.matchLevel.replace("+", " + ")} (no exact match data)</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breakdown</p>
                <div className="space-y-1.5">
                  {[
                    { label: "Base Salary", value: result.breakdown.base, pct: result.breakdown.basePct },
                    { label: "Bonus", value: result.breakdown.bonus, pct: result.breakdown.bonusPct },
                    { label: "Stock / Year", value: result.breakdown.stock, pct: result.breakdown.stockPct },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-foreground">{formatINR(item.value)}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">({item.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Comparison</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-card border border-olive p-2.5">
                    <p className="text-[10px] text-muted-foreground">Percentile</p>
                    <p className="text-lg font-bold text-foreground">{result.percentile ?? "N/A"}{result.percentile !== null ? "th" : ""}</p>
                  </div>
                  <div className="rounded-lg bg-card border border-olive p-2.5">
                    <p className="text-[10px] text-muted-foreground">Market Avg</p>
                    <p className="text-lg font-bold text-foreground">{result.marketComparison.average ? formatINR(result.marketComparison.average) : "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-card border border-olive p-2.5">
                    <p className="text-[10px] text-muted-foreground">Median</p>
                    <p className="text-lg font-bold text-foreground">{result.marketComparison.median ? formatINR(result.marketComparison.median) : "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-card border border-olive p-2.5">
                    <p className="text-[10px] text-muted-foreground">Peers</p>
                    <p className="text-lg font-bold text-foreground">{result.totalPeers}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
