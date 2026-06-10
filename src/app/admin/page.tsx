"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/normalization";
import {
  Shield, Trash2, Loader2, ChevronLeft, ChevronRight, MessageSquareText, Check, X
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const isAdmin = session?.user?.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@paylens.io");
  const [tab, setTab] = useState<"entries" | "reviews">("entries");

  React.useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/admin" });
    }
  }, [status]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-entries", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/entries?page=${page}&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!session && isAdmin && tab === "entries",
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/entries?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-entries"] });
    },
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews?all=true");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!session && isAdmin && tab === "reviews",
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const updateReviewStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-bronze" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Shield className="h-12 w-12 text-rose-500" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-sm max-w-md text-center">
          This panel is restricted to administrators. The admin email must match the configured ADMIN_EMAIL environment variable.
        </p>
      </div>
    );
  }

  const entries = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage compensation entries</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 border-b border-olive pb-1">
        <button
          onClick={() => setTab("entries")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${tab === "entries" ? "bg-olive text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Compensation Entries
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${tab === "reviews" ? "bg-olive text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <span className="flex items-center gap-1.5">
            <MessageSquareText className="h-3 w-3" />
            Reviews
          </span>
        </button>
      </div>

      {tab === "entries" && (
        <Card className="bg-white/80 border-olive">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                All Submissions {pagination ? `(${pagination.total})` : ""}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No entries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-olive text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3">Company</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Level</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Base</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Submitted By</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-olive/30">
                    {entries.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{entry.company.name}</td>
                        <td className="p-3 text-muted-foreground">{entry.role.name}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center rounded-md bg-muted border border-olive/60 px-2 py-0.5 text-xs font-semibold text-foreground">
                            {entry.level}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{entry.location}</td>
                        <td className="p-3 text-foreground">{formatINR(entry.base)}</td>
                        <td className="p-3">
                          <span className="font-bold bg-gradient-to-r from-bronze to-desert bg-clip-text text-transparent">
                            {formatINR(entry.totalCompensation)}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {entry.user ? entry.user.email || entry.user.name : "Anonymous"}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(entry.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm("Delete this entry?")) {
                                deleteMutation.mutate(entry.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-muted rounded-lg transition-all"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-olive/50 pt-4 mt-4">
                <div className="text-xs text-muted-foreground">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-olive hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-olive hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "reviews" && (
        <Card className="bg-white/80 border-olive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">
              All Reviews {reviewsData?.data ? `(${reviewsData.data.length})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !reviewsData?.data?.length ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No reviews found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-olive text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3">Company</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Helpful</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-olive/30">
                    {reviewsData.data.map((review: any) => (
                      <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold text-foreground">{review.company.name}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${review.rating >= 4 ? "bg-sage/10 text-muted-foreground" : review.rating >= 3 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {review.rating}/5
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">{review.title}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${review.status === "APPROVED" ? "bg-sage/10 text-muted-foreground" : review.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{review.helpfulCount}</td>
                        <td className="p-3 text-muted-foreground text-xs">{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {review.status !== "APPROVED" && (
                              <button
                                onClick={() => updateReviewStatusMutation.mutate({ id: review.id, status: "APPROVED" })}
                                disabled={updateReviewStatusMutation.isPending}
                                className="p-1.5 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-all"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {review.status !== "REJECTED" && (
                              <button
                                onClick={() => updateReviewStatusMutation.mutate({ id: review.id, status: "REJECTED" })}
                                disabled={updateReviewStatusMutation.isPending}
                                className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-muted rounded-lg transition-all"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this review?")) {
                                  deleteReviewMutation.mutate(review.id);
                                }
                              }}
                              disabled={deleteReviewMutation.isPending}
                              className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-muted rounded-lg transition-all"
                              title="Delete review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
