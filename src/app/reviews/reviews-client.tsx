"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Plus, X, Building2 } from "lucide-react";

export default function ReviewsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");

  const { data: companies } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      return res.json();
    },
    staleTime: 300000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", selectedCompany],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCompany) params.set("companyId", selectedCompany);
      const res = await fetch(`/api/reviews?${params}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Company Reviews
          </h1>
          <p className="text-sm sm:text-base text-charcoal max-w-2xl">
            Honest, anonymous reviews from current and former employees.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={`gap-2 shrink-0 ${showForm ? "bg-rose-600 hover:bg-rose-500" : "bg-bronze hover:bg-bronze"}`}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close" : "Write Review"}
        </Button>
      </div>

      {showForm && (
        <ReviewForm onSuccess={() => setShowForm(false)} />
      )}

      {/* Company Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <button
          onClick={() => setSelectedCompany("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            !selectedCompany
              ? "bg-charcoal text-bone border-charcoal"
              : "bg-card text-muted-foreground border-border hover:border-charcoal/30"
          }`}
        >
          All Companies
        </button>
        {companies?.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompany(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              selectedCompany === c.id
                ? "bg-charcoal text-bone border-charcoal"
                : "bg-card text-muted-foreground border-border hover:border-charcoal/30"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
      ) : !data?.data?.length ? (
        <div className="text-center py-12 space-y-3">
          <MessageSquareText className="h-12 w-12 text-foreground/60 mx-auto" />
          <p className="text-muted-foreground text-sm">
            {selectedCompany ? "No reviews yet for this company." : "No reviews yet. Be the first to share!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((review: any) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
