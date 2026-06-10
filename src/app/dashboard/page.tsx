"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/normalization";
import { useComparisonStore } from "@/store/comparisonStore";
import { 
  User as UserIcon, 
  Trash2, 
  ChevronRight, 
  GitCompare, 
  Building2, 
  FolderLock, 
  PlusCircle,
  Loader2,
  Calendar,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const setComparisonFilters = useComparisonStore((state) => state.setAll);

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/dashboard" });
    }
  }, [status]);

  // Query saved comparisons
  const { data: savedComparisons, isLoading: comparisonsLoading } = useQuery({
    queryKey: ["saved-comparisons"],
    queryFn: async () => {
      const res = await fetch("/api/saved-comparisons");
      if (!res.ok) throw new Error("Failed to fetch comparisons");
      return res.json();
    },
    enabled: !!session,
  });

  const { data: userSubmissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["user-submissions"],
    queryFn: async () => {
      const res = await fetch("/api/salaries?limit=100&sortBy=submittedAt&sortOrder=desc");
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!session,
  });

  // Mutation for deleting saved comparison
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saved-comparisons?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comparison");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-comparisons"] });
    },
  });

  const handleLaunchComparison = (comp: any) => {
    // Set comparison state in Zustand
    setComparisonFilters(
      comp.queryParams.companies || [],
      comp.queryParams.levels || [],
      comp.queryParams.locations || []
    );
    router.push("/compare");
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-bronze" />
        <p className="text-sm text-muted-foreground">Checking credentials & loading account...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex flex-col">
      {/* Hero Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-background via-background to-bronze/15 border border-olive p-6 rounded-2xl">
        <div className="flex items-center space-x-4">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session?.user?.image || ""}
              alt={session?.user?.name || "Avatar"}
              className="h-14 w-14 rounded-full border-2 border-bronze"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-olive border-2 border-bronze">
              <UserIcon className="h-6 w-6 text-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-1.5">
              Hello, {session?.user?.name || "User"} <Sparkles className="h-5 w-5 text-bronze" />
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{session?.user?.email}</p>
          </div>
        </div>
        <div>
          <Link href="/submit">
            <Button size="sm" className="bg-bronze hover:bg-bronze text-xs flex items-center gap-1.5 h-9">
              <PlusCircle className="h-4 w-4" /> Submit New Salary
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Saved Comparisons */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/80 border-olive">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                <GitCompare className="h-4.5 w-4.5 text-bronze" /> Saved Comparisons
              </CardTitle>
              <CardDescription>Quick access to your comparisons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {comparisonsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !savedComparisons || savedComparisons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                  <p>You haven&apos;t saved any comparisons yet.</p>
                  <Link href="/compare" className="text-bronze hover:underline block">
                    Create comparison &rarr;
                  </Link>
                </div>
              ) : (
                savedComparisons.map((comp: any) => (
                  <div 
                    key={comp.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-white border border-olive group hover:border-olive transition-colors"
                  >
                    <button
                      onClick={() => handleLaunchComparison(comp)}
                      className="flex-1 text-left flex items-center justify-between pr-2 group/btn"
                    >
                      <div>
                        <span className="text-sm font-bold text-foreground group-hover/btn:text-bronze transition-colors">
                          {comp.name}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-1 flex flex-wrap gap-1">
                          {comp.queryParams.companies?.map((c: string) => (
                            <span key={c} className="bg-olive px-1 py-0.5 rounded text-muted-foreground">{c}</span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/btn:text-bronze group-hover/btn:translate-x-0.5 transition-all shrink-0" />
                    </button>
                    
                    <button
                      onClick={() => deleteMutation.mutate(comp.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1 text-muted-foreground hover:text-rose-400 hover:bg-muted rounded transition-all"
                      title="Delete Saved Comparison"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Submitted Salaries */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/80 border-olive">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-bronze" /> Crowdsourced Submissions
              </CardTitle>
              <CardDescription>Manage and view your submitted records</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {submissionsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !userSubmissions || userSubmissions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs space-y-3">
                  <FolderLock className="h-8 w-8 text-foreground/60 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-semibold text-muted-foreground">No submissions linked to your account</p>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      Any salaries you submit while logged in will appear here. Anonymous entries will not be linked.
                    </p>
                  </div>
                  <Link href="/submit" className="inline-block mt-2">
                    <Button size="sm" className="bg-bronze hover:bg-bronze text-xs">
                      Submit First Salary
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSubmissions.slice(0, 10).map((sub: any) => (
                    <div 
                      key={sub.id}
                      className="p-4 rounded-xl bg-white border border-olive flex justify-between items-center flex-wrap gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/companies/${sub.company.slug}`}
                            className="font-bold text-foreground hover:text-bronze transition-colors"
                          >
                            {sub.company.name}
                          </Link>
                          <span className="text-xs bg-olive border border-olive px-2 py-0.5 rounded text-muted-foreground">
                            {sub.level}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{sub.role.name}</span>
                          <span>&bull;</span>
                          <span>{sub.location}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black bg-gradient-to-r from-bronze to-desert bg-clip-text text-transparent">
                          {formatINR(sub.totalCompensation)}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          Base: {formatINR(sub.base)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {userSubmissions.length > 10 && (
                    <div className="text-center text-xs text-muted-foreground pt-2">
                      Showing latest 10 submissions.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
