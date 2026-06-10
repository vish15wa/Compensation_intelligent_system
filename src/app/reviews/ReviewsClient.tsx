"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Plus, X } from "lucide-react";

export default function ReviewsPage() {
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews");
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

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
      ) : !data?.data?.length ? (
        <div className="text-center py-12 space-y-3">
          <MessageSquareText className="h-12 w-12 text-foreground/60 mx-auto" />
          <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share!</p>
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
