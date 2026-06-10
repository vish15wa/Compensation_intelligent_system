"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useComparisonStore } from "@/store/comparisonStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatINR } from "@/lib/utils/normalization";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Building, 
  Plus, 
  X, 
  GitCompare, 
  Save, 
  Loader2, 
  Sparkles,
  Info
} from "lucide-react";

const availableCompanies = ["Google", "Amazon", "Microsoft", "Meta", "Uber", "Atlassian"];
const availableLevels = ["L3", "L4", "L5", "L6", "L7"];
const availableLocations = ["Bangalore", "Hyderabad", "Pune", "Remote"];

export default function ComparePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { 
    companies, 
    levels, 
    locations, 
    addCompany, 
    removeCompany, 
    addLevel, 
    removeLevel, 
    addLocation, 
    removeLocation,
    clearAll 
  } = useComparisonStore();

  // Inputs for adding to comparison lists
  const [selectedCompany, setSelectedCompany] = useState(availableCompanies[0]);
  const [selectedLevel, setSelectedLevel] = useState(availableLevels[0]);
  const [selectedLocation, setSelectedLocation] = useState(availableLocations[0]);

  // Saving comparison states
  const [saveName, setSaveName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // TanStack Query to fetch side-by-side comparison data
  const { data: compareData, isLoading, refetch } = useQuery({
    queryKey: ["compare", companies, levels, locations],
    queryFn: async () => {
      if (companies.length === 0 && levels.length === 0 && locations.length === 0) {
        return { granularComparison: [], companyComparison: [] };
      }
      
      const params = new URLSearchParams();
      if (companies.length > 0) params.set("companies", companies.join(","));
      if (levels.length > 0) params.set("levels", levels.join(","));
      if (locations.length > 0) params.set("locations", locations.join(","));

      const res = await fetch(`/api/compare?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch comparisons");
      return res.json();
    },
    enabled: companies.length > 0 || levels.length > 0 || locations.length > 0,
  });

  // Mutate for saving comparison
  const saveComparisonMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/saved-comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companies,
          levels,
          locations,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save comparison");
      }
      return res.json();
    },
    onSuccess: () => {
      setSaveSuccess("Comparison saved successfully!");
      setSaveName("");
      queryClient.invalidateQueries({ queryKey: ["saved-comparisons"] });
      setTimeout(() => setSaveSuccess(""), 3000);
    },
    onError: (err: any) => {
      setSaveError(err.message || "Failed to save");
      setTimeout(() => setSaveError(""), 3000);
    },
  });

  const handleSaveComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    saveComparisonMutation.mutate(saveName);
  };

  // Setup default items to compare on initial load to make it look active
  useEffect(() => {
    if (companies.length === 0 && levels.length === 0 && locations.length === 0) {
      addCompany("Google");
      addCompany("Meta");
      addLevel("L4");
      addLocation("Bangalore");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format data for Recharts (we show base, bonus, stock in L (lakhs) for clean charts)
  const chartData = compareData?.granularComparison?.map((item: any) => ({
    name: `${item.company} ${item.level}`,
    base: Math.round(item.avgBase / 100000),
    bonus: Math.round(item.avgBonus / 100000),
    stock: Math.round(item.avgStock / 100000),
    total: Math.round(item.avgTotal / 100000),
  })) || [];

  return (
    <div className="space-y-8 flex flex-col">
      {/* Page Header */}
      <div className="space-y-2 py-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <GitCompare className="text-bronze h-8 w-8" /> Side-by-Side Comparison
        </h1>
        <p className="text-charcoal">
          Compare levels, locations, and compensation components across tech companies.
        </p>
      </div>

      {/* Comparison Board Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Companies selection card */}
        <Card className="bg-white/80 border-olive p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Companies</h3>
              <span className="text-xs text-muted-foreground">({companies.length} selected)</span>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={selectedCompany} 
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-white border-olive flex-1"
              >
                {availableCompanies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Button 
                onClick={() => addCompany(selectedCompany)}
                size="sm"
                className="bg-bronze hover:bg-bronze h-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[45px] p-2 bg-muted rounded-lg border border-olive/60">
              {companies.length === 0 ? (
                <span className="text-xs text-muted-foreground self-center mx-auto">Compare all companies</span>
              ) : (
                companies.map((c) => (
                  <span 
                    key={c} 
                    className="inline-flex items-center gap-1 bg-bronze/10 text-bronze border border-bronze/20 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  >
                    {c}
                    <button onClick={() => removeCompany(c)} className="hover:text-rose-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Levels selection card */}
        <Card className="bg-white/80 border-olive p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Levels</h3>
              <span className="text-xs text-muted-foreground">({levels.length} selected)</span>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-white border-olive flex-1"
              >
                {availableLevels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Select>
              <Button 
                onClick={() => addLevel(selectedLevel)}
                size="sm"
                className="bg-bronze hover:bg-bronze h-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[45px] p-2 bg-muted rounded-lg border border-olive/60">
              {levels.length === 0 ? (
                <span className="text-xs text-muted-foreground self-center mx-auto">Compare all levels</span>
              ) : (
                levels.map((l) => (
                  <span 
                    key={l} 
                    className="inline-flex items-center gap-1 bg-bronze/10 text-bronze border border-bronze/20 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  >
                    {l}
                    <button onClick={() => removeLevel(l)} className="hover:text-rose-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Locations selection card */}
        <Card className="bg-white/80 border-olive p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Locations</h3>
              <span className="text-xs text-muted-foreground">({locations.length} selected)</span>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-white border-olive flex-1"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>
              <Button 
                onClick={() => addLocation(selectedLocation)}
                size="sm"
                className="bg-bronze hover:bg-bronze h-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[45px] p-2 bg-muted rounded-lg border border-olive/60">
              {locations.length === 0 ? (
                <span className="text-xs text-muted-foreground self-center mx-auto">Compare all locations</span>
              ) : (
                locations.map((loc) => (
                  <span 
                    key={loc} 
                    className="inline-flex items-center gap-1 bg-bronze/10 text-bronze border border-bronze/20 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  >
                    {loc}
                    <button onClick={() => removeLocation(loc)} className="hover:text-rose-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Action panel (Save comparison configuration) */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-olive pb-4">
        <Button 
          variant="outline" 
          onClick={clearAll} 
          className="border-olive hover:bg-muted"
          disabled={companies.length === 0 && levels.length === 0 && locations.length === 0}
        >
          Clear Selections
        </Button>

        {session && (companies.length > 0 || levels.length > 0 || locations.length > 0) && (
          <form onSubmit={handleSaveComparison} className="flex gap-2 max-w-sm w-full sm:w-auto">
            <Input
              type="text"
              placeholder="e.g. Google L4 vs Meta L4"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="bg-white border-olive h-9 text-xs"
              required
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={saveComparisonMutation.isPending}
              className="bg-bronze hover:bg-bronze flex items-center gap-1 h-9 px-3 shrink-0"
            >
              {saveComparisonMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
          </form>
        )}
      </div>

      {/* Messages */}
      {saveSuccess && (
        <div className="bg-sage/10 border border-sage/20 text-muted-foreground text-sm p-3 rounded-lg text-center">
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg text-center">
          {saveError}
        </div>
      )}

      {/* Results Workspace */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-bronze" />
          <p className="text-sm">Aggregating comparison database...</p>
        </div>
      ) : chartData.length === 0 ? (
        <Card className="bg-white/80 border-olive py-16 text-center text-muted-foreground">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <GitCompare className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">No comparison selected</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Add companies, levels, or locations above to dynamically compute side-by-side compensation charts.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Chart visual representation */}
          <Card className="bg-white/80 border-olive p-6">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-1.5 text-foreground">
                <Sparkles className="h-4.5 w-4.5 text-bronze" /> Average Compensation Components
              </CardTitle>
              <CardDescription>Value in Lakhs INR (L) per year</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 pt-2 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd5" vertical={false} />
                  <XAxis dataKey="name" stroke="#a5a58d" fontSize={11} tickLine={false} />
                  <YAxis stroke="#a5a58d" fontSize={11} tickLine={false} unit="L" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ddbea9" }}
                    labelStyle={{ color: "#3d3d30", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="base" name="Base Salary" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="bonus" name="Bonus" fill="#34d399" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="stock" name="Stock/yr" fill="#a78bfa" stackId="a" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Granular statistics table cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Granular Side-by-Side Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareData.granularComparison.map((item: any) => (
                <Card 
                  key={item.key} 
                  className="bg-white/80 border-olive/80 shadow-md flex flex-col relative overflow-hidden group hover:border-bronze/30 transition-all duration-300"
                >
                  {/* Subtle top indicator bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bronze to-desert" />
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center text-foreground">
                      <span>{item.company}</span>
                      <span className="text-xs bg-bronze/10 text-bronze border border-bronze/20 px-2 py-0.5 rounded-lg font-bold">
                        {item.level}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <span>{item.location}</span>
                      <span className="text-muted-foreground">&bull;</span>
                      <span>{item.count} submissions</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Median Total Comp</span>
                      <div className="text-2xl font-black text-bronze mt-0.5">{formatINR(item.medianTotal)}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-olive pt-3 text-muted-foreground">
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Base</div>
                        <div className="font-semibold text-foreground mt-0.5">{formatINR(item.avgBase)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Bonus</div>
                        <div className="font-semibold text-foreground mt-0.5">{item.avgBonus > 0 ? formatINR(item.avgBonus) : "—"}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Stock/yr</div>
                        <div className="font-semibold text-foreground mt-0.5">{item.avgStock > 0 ? formatINR(item.avgStock) : "—"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {!session && (
            <Card className="bg-white/80 border-olive/60 p-4 text-xs flex gap-2 text-muted-foreground">
              <Info className="h-4 w-4 text-bronze flex-shrink-0 mt-0.5" />
              <div>
                Please <Link href="/auth/signin" className="text-bronze font-semibold hover:underline">Sign In</Link> to save comparison configurations directly to your user account dashboard.
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
