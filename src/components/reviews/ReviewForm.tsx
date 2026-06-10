"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Send, Loader2 } from "lucide-react";

export default function ReviewForm({ onSuccess }: { onSuccess?: () => void }) {
  const [company, setCompany] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [designation, setDesignation] = useState("");
  const [isCurrent, setIsCurrent] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    if (!companyId || !rating || !title || !pros || !cons) {
      setError("Please fill all required fields");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          rating,
          title,
          pros,
          cons,
          isCurrentEmployee: isCurrent,
          designation: designation || undefined,
          isAnonymous,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
      setCompany(""); setCompanyId(""); setRating(0); setTitle(""); setPros(""); setCons(""); setDesignation("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCompany = companies?.find?.((c: any) => c.id === companyId);

  return (
    <Card className="bg-white/80 border-olive">
      <CardContent className="p-6">
        {success ? (
          <div className="text-center py-8 space-y-3">
            <Send className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-lg font-bold text-foreground">Review Submitted!</p>
            <p className="text-sm text-muted-foreground">Thank you for contributing. Your review helps the community.</p>
            <Button variant="outline" onClick={() => setSuccess(false)} className="border-olive">
              Write Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Company *</label>
              <select
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  const c = companies?.find((c: any) => c.id === e.target.value);
                  if (c) setCompany(c.name);
                }}
                className="w-full rounded-lg border border-olive bg-white h-10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-bronze"
              >
                <option value="">Select company</option>
                {companies?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Overall Rating *</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i + 1)}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        i < (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Review Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Great work culture" className="bg-white border-olive h-10" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Pros *</label>
              <textarea
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                rows={3}
                placeholder="What did you like?"
                className="w-full rounded-lg border border-olive bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-bronze resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">Cons *</label>
              <textarea
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                rows={3}
                placeholder="What could be better?"
                className="w-full rounded-lg border border-olive bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-bronze resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Designation</label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. SDE II" className="bg-white border-olive h-10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Employment</label>
                <select
                  value={isCurrent ? "current" : "former"}
                  onChange={(e) => setIsCurrent(e.target.value === "current")}
                  className="w-full rounded-lg border border-olive bg-white h-10 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-bronze"
                >
                  <option value="current">Current Employee</option>
                  <option value="former">Former Employee</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-olive bg-white text-bronze focus:ring-bronze"
              />
              <label htmlFor="anonymous" className="text-sm text-muted-foreground">Post anonymously</label>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full h-11 bg-bronze hover:bg-bronze gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
