"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, ThumbsUp, Building2, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  isCurrentEmployee: boolean;
  designation: string | null;
  location: string | null;
  isAnonymous: boolean;
  helpfulCount: number;
  createdAt: string;
  company: { name: string; slug: string };
  user: { name: string } | null;
  _count?: { votes: number };
}

export default function ReviewCard({ review }: { review: Review }) {
  const { data: session } = useSession();
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async () => {
    if (!session?.user?.id || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setHelpful(data.voted);
        setHelpfulCount((c) => data.voted ? c + 1 : c - 1);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/80 border-olive hover:border-olive transition-colors">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{review.title}</h3>
              {review.rating !== null && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {review.company.name}
              </span>
              {review.designation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {review.designation}
                </span>
              )}
              {review.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {review.location}
                </span>
              )}
              <span>{review.isCurrentEmployee ? "Current" : "Former"} Employee</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pros</span>
            <p className="text-foreground mt-0.5">{review.pros}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Cons</span>
            <p className="text-muted-foreground mt-0.5">{review.cons}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-olive">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{review.isAnonymous ? "Anonymous" : review.user?.name || "Anonymous"}</span>
            <span>&middot;</span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={handleVote}
            disabled={submitting || !session?.user?.id}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
              helpful ? "bg-bronze/10 text-bronze" : "text-muted-foreground hover:text-muted-foreground hover:bg-muted"
            } disabled:opacity-50`}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{helpfulCount}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
