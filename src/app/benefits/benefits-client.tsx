"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Plus, X, Building2 } from "lucide-react";

const CATEGORIES = ["Insurance", "Perks", "Leave", "Financial", "Growth", "Other"];

export default function BenefitsClient() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Perks");
  const [newDesc, setNewDesc] = useState("");

  const { data: companies } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      return res.json();
    },
    staleTime: 300000,
  });

  const { data: benefitsData, refetch } = useQuery({
    queryKey: ["benefits", selectedCompanies],
    queryFn: async () => {
      if (selectedCompanies.length === 0) return { data: [] };
      const results = await Promise.all(
        selectedCompanies.map(async (id) => {
          const res = await fetch(`/api/benefits?companyId=${id}`);
          return res.json();
        })
      );
      return { data: results.flatMap((r) => r.data) };
    },
    enabled: selectedCompanies.length > 0,
  });

  const addBenefit = async (companyId: string) => {
    if (!newName) return;
    try {
      await fetch("/api/benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, name: newName, category: newCategory, description: newDesc || undefined }),
      });
      setNewName("");
      setNewDesc("");
      setAddingFor(null);
      refetch();
    } catch {}
  };

  const toggleCompany = (id: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const grouped = benefitsData?.data?.reduce((acc: any, b: any) => {
    if (!acc[b.companyId]) acc[b.companyId] = { company: b.company, benefits: [] };
    acc[b.companyId].benefits.push(b);
    return acc;
  }, {}) || {};

  const allBenefitNames = [...new Set(benefitsData?.data?.map((b: any) => b.name) || [])];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Benefits Comparison
          </h1>
          <p className="text-sm sm:text-base text-charcoal max-w-2xl">
            Compare perks and benefits across companies side by side.
          </p>
        </div>
      </div>

      {/* Company selector */}
      <Card className="bg-white/80 border-olive">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select companies to compare</p>
          <div className="flex flex-wrap gap-2">
            {companies?.map((c: any) => (
              <button
                key={c.id}
                onClick={() => toggleCompany(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  selectedCompanies.includes(c.id)
                    ? "bg-bronze/10 text-bronze border-bronze/20"
                    : "bg-card text-muted-foreground border-olive hover:border-desert"
                }`}
              >
                <Building2 className="h-3 w-3" />
                {c.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCompanies.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Gift className="h-12 w-12 text-foreground/60 mx-auto" />
          <p className="text-muted-foreground text-sm">Select companies above to compare their benefits.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive">
                <th className="p-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Benefit</th>
                {selectedCompanies.map((id) => {
                  const c = companies?.find((c: any) => c.id === id);
                  return (
                    <th key={id} className="p-3 text-center text-xs font-bold text-foreground">
                      {c?.name || id}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/30">
              {CATEGORIES.map((cat) => {
                const catBenefits = allBenefitNames.filter((name) =>
                  benefitsData?.data?.some((b: any) => b.name === name && b.category === cat)
                );
                if (catBenefits.length === 0) return null;
                return (
                  <React.Fragment key={cat}>
                    <tr className="bg-muted/60">
                      <td colSpan={selectedCompanies.length + 1} className="p-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {cat}
                      </td>
                    </tr>
                    {catBenefits.map((benefitName) => (
                      <tr key={benefitName} className="hover:bg-muted/30">
                        <td className="p-3 text-foreground font-medium">{benefitName as string}</td>
                        {selectedCompanies.map((id) => {
                          const has = benefitsData?.data?.some(
                            (b: any) => b.companyId === id && b.name === benefitName
                          );
                          return (
                            <td key={id} className="p-3 text-center">
                              {has ? (
                                <span className="text-muted-foreground font-bold text-lg">&#10003;</span>
                              ) : (
                                <span className="text-muted-foreground">&#8212;</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              <tr>
                <td className="p-3">
                  {addingFor ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Benefit name"
                        className="min-w-[120px] flex-1 rounded border border-olive bg-white px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-bronze"
                      />
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="rounded border border-olive bg-white px-2 py-1 text-xs text-foreground"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <Button size="sm" onClick={() => addBenefit(addingFor)} className="bg-bronze hover:bg-bronze text-xs h-7 px-2">
                        Add
                      </Button>
                      <button onClick={() => { setAddingFor(null); setNewName(""); }} className="text-muted-foreground hover:text-muted-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingFor(selectedCompanies[0])}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" /> Add benefit
                    </button>
                  )}
                </td>
                {selectedCompanies.map((id) => (
                  <td key={id} className="p-3 text-center">
                    {addingFor !== id && (
                      <button
                        onClick={() => setAddingFor(id)}
                        className="text-muted-foreground hover:text-muted-foreground"
                      >
                        <Plus className="h-3 w-3 mx-auto" />
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
