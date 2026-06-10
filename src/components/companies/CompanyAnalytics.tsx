"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/normalization";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  Building2, 
  MapPin, 
  ChevronLeft, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Award,
  Sparkles,
  Download,
  MessageSquareText,
  Plus,
  X
} from "lucide-react";

interface AnalyticsProps {
  analytics: {
    company: { id: string; name: string; slug: string };
    stats: {
      count: number;
      avgTotal: number;
      avgBase: number;
      avgBonus: number;
      avgStock: number;
      medianTotal: number;
    };
    distribution: Array<{ label: string; count: number }>;
    trends: Array<{ date: string; avgTotal: number }>;
    roles: Array<{ name: string; avgTotal: number; count: number }>;
    levels: Array<{
      level: string;
      avgTotal: number;
      avgBase: number;
      avgBonus: number;
      avgStock: number;
      count: number;
    }>;
    locations: Array<{ location: string; avgTotal: number; count: number }>;
  };
}

export default function CompanyAnalytics({ analytics }: AnalyticsProps) {
  const { company, stats, distribution, trends, roles, levels, locations } = analytics;

  // Format data for level breakdown chart (Lakhs)
  const levelChartData = levels.map((lvl) => ({
    level: lvl.level,
    base: Math.round(lvl.avgBase / 100000),
    bonus: Math.round(lvl.avgBonus / 100000),
    stock: Math.round(lvl.avgStock / 100000),
    total: Math.round(lvl.avgTotal / 100000),
  }));

  // Format trends data (Lakhs)
  const trendsChartData = trends.map((t) => ({
    date: t.date,
    avgTotal: Math.round(t.avgTotal / 100000),
  }));

  // Colors for location pie chart
  const PIE_COLORS = ["#cb997e", "#ddbea9", "#a5a58d", "#6b705c"];

  return (
    <div className="space-y-8 flex flex-col">
      {/* Back button */}
      <div>
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Salaries
        </Link>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bronze/10 border border-bronze/20 text-bronze shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground text-sm">Analytics and compensation insights</p>
          </div>
        </div>
        <button
          onClick={() => window.open(`/api/export?company=${company.name}`, "_blank")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-olive bg-white/80 px-3.5 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-muted transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Key Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 border-olive">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="rounded-lg bg-bronze/10 p-2 text-bronze border border-bronze/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Submissions</p>
              <h3 className="text-xl font-bold mt-0.5 text-foreground">{stats.count}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-olive">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="rounded-lg bg-sage/10 p-2 text-muted-foreground border border-sage/20">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Median Salary</p>
              <h3 className="text-xl font-bold mt-0.5 text-foreground">{formatINR(stats.medianTotal)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-olive">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="rounded-lg bg-bronze/10 p-2 text-bronze border border-bronze/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Salary</p>
              <h3 className="text-xl font-bold mt-0.5 text-foreground">{formatINR(stats.avgTotal)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 border-olive">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="rounded-lg bg-bronze/10 p-2 text-bronze border border-bronze/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Base / Stock / Bonus</p>
              <h3 className="text-sm font-bold mt-1 text-foreground">
                {Math.round((stats.avgBase / stats.avgTotal) * 100)}% / {Math.round((stats.avgStock / stats.avgTotal) * 100)}% / {Math.round((stats.avgBonus / stats.avgTotal) * 100)}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Distribution BarChart */}
        <Card className="bg-white/80 border-olive p-5">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base font-bold text-foreground">Salary Distribution</CardTitle>
            <CardDescription>Number of data points per salary bracket</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd5" vertical={false} />
                <XAxis dataKey="label" stroke="#a5a58d" fontSize={10} tickLine={false} />
                <YAxis stroke="#a5a58d" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ddbea9" }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Breakdown base vs stock vs bonus */}
        <Card className="bg-white/80 border-olive p-5">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base font-bold text-foreground">Level Breakdown</CardTitle>
            <CardDescription>Average compensation components by level (Lakhs INR)</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd5" vertical={false} />
                <XAxis dataKey="level" stroke="#a5a58d" fontSize={10} tickLine={false} />
                <YAxis stroke="#a5a58d" fontSize={10} tickLine={false} unit="L" />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ddbea9" }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 5 }} />
                <Bar dataKey="base" fill="#6366f1" stackId="a" name="Base" />
                <Bar dataKey="bonus" fill="#34d399" stackId="a" name="Bonus" />
                <Bar dataKey="stock" fill="#a78bfa" stackId="a" name="Stock/yr" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compensation trends over time */}
        <Card className="bg-white/80 border-olive p-5">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base font-bold text-foreground">Compensation Trends</CardTitle>
            <CardDescription>Average total compensation over time (Lakhs INR)</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-2 h-[260px]">
            {trendsChartData.length <= 1 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                Need more historical data points to show trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd5" vertical={false} />
                  <XAxis dataKey="date" stroke="#a5a58d" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a5a58d" fontSize={10} tickLine={false} unit="L" />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ddbea9" }} />
                  <Line type="monotone" dataKey="avgTotal" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6" }} name="Average Comp" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Location distribution */}
        <Card className="bg-white/80 border-olive p-5">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-base font-bold text-foreground">Location Distribution</CardTitle>
            <CardDescription>Submissions and average pay by location</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col sm:flex-row items-center justify-around h-[260px] pt-2">
            <div className="w-[150px] h-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locations}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="location"
                  >
                    {locations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Location stats list */}
            <div className="flex flex-col space-y-2 text-xs w-full max-w-[200px] px-4">
              {locations.map((loc, index) => (
                <div key={loc.location} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="h-2.5 w-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                    />
                    <span className="text-foreground font-semibold">{loc.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground font-medium">{loc.count} entries</span>
                    <span className="text-bronze ml-1.5 font-bold">{formatINR(loc.avgTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Paying Roles Section */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-lg text-foreground">Role Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/80 border-olive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-bronze" /> Top Paying Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {roles.map((role, idx) => (
                <div 
                  key={role.name} 
                  className="flex justify-between items-center p-3 rounded-lg bg-white border border-olive"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-mono">#{idx+1}</span>
                    <span className="text-sm font-semibold text-foreground">{role.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-bronze font-bold text-sm block">{formatINR(role.avgTotal)}</span>
                    <span className="text-[10px] text-muted-foreground">{role.count} data points</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Compare prompt banner */}
          <Card className="bg-gradient-to-tr from-background via-background to-bronze/20 border-olive flex flex-col justify-center p-6 text-center">
            <CardContent className="space-y-4 p-0">
              <Users className="h-10 w-10 text-bronze mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Compare with other companies</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Compare {company.name}&apos;s packages side-by-side with Meta, Amazon, Microsoft, and others in real-time.
                </p>
              </div>
              <Link href="/compare">
                <Button size="sm" className="bg-bronze hover:bg-bronze text-xs px-5 mt-2">
                  Launch Comparison Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <CompanyReviewsSection companyId={analytics.company.id} />
    </div>
  );
}

function CompanyReviewsSection({ companyId }: { companyId: string }) {
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["company-reviews", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?companyId=${companyId}`);
      return res.json();
    },
  });

  const reviews = data?.data || [];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Employee Reviews</h2>
          <p className="text-sm text-muted-foreground">What employees say about working here</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={`gap-2 shrink-0 ${showForm ? "bg-rose-600 hover:bg-rose-500" : "bg-bronze hover:bg-bronze"}`}
          size="sm"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close" : "Write Review"}
        </Button>
      </div>

      {showForm && (
        <ReviewForm onSuccess={() => { setShowForm(false); }} />
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 space-y-2 border border-dashed border-olive rounded-xl">
          <MessageSquareText className="h-8 w-8 text-foreground/60 mx-auto" />
          <p className="text-muted-foreground text-sm">No reviews yet for this company.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
