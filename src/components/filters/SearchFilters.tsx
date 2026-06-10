"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, SlidersHorizontal, RotateCcw, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const roles = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Solutions Architect",
  "Engineering Manager",
];

const levels = ["L3", "L4", "L5", "L6", "L7"];
const locations = ["Bangalore", "Hyderabad", "Pune", "Remote"];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [level, setLevel] = useState(searchParams.get("level") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [yoe, setYoe] = useState(searchParams.get("yoe") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "submittedAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Synchronize state with URL when back/forward is clicked
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setRole(searchParams.get("role") || "");
    setLevel(searchParams.get("level") || "");
    setLocation(searchParams.get("location") || "");
    setYoe(searchParams.get("yoe") || "");
    setSortBy(searchParams.get("sortBy") || "submittedAt");
    setSortOrder(searchParams.get("sortOrder") || "desc");
  }, [searchParams]);

  // Create query string utility
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      // Always reset page to 1 on filter change
      if (!params.hasOwnProperty("page")) {
        current.delete("page");
      }

      return current.toString();
    },
    [searchParams]
  );

  const applyFilters = () => {
    const query = createQueryString({
      search,
      role,
      level,
      location,
      yoe,
      sortBy,
      sortOrder,
    });
    router.push(`/?${query}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRole("");
    setLevel("");
    setLocation("");
    setYoe("");
    setSortBy("submittedAt");
    setSortOrder("desc");
    router.push("/");
  };

  return (
    <div className="space-y-4 bg-white/80 border border-olive rounded-xl p-5 shadow-sm">
      {/* Top Search bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by company name (e.g. Google, Amazon)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-10 bg-white border-olive h-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            className="border-olive flex items-center gap-1.5 h-10 px-4"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Button
            onClick={resetFilters}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground h-10"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={applyFilters}
            className="bg-bronze hover:bg-bronze text-white h-10 px-5 shadow-lg shadow-bronze/15"
          >
            Search
          </Button>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (search) params.set("company", search);
              if (role) params.set("role", role);
              if (level) params.set("level", level);
              if (location) params.set("location", location);
              window.open(`/api/export?${params.toString()}`, "_blank");
            }}
            className="inline-flex items-center justify-center rounded-lg border border-olive bg-transparent text-foreground shadow-sm hover:bg-muted hover:text-foreground h-10 px-3 text-sm font-medium transition-all active:scale-[0.98]"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced Dropdown Filters */}
      {(showAdvanced || role || level || location || yoe || sortBy !== "submittedAt" || sortOrder !== "desc") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-olive/50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Role</label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="bg-white border-olive">
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Level</label>
            <Select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-white border-olive">
              <option value="">All Levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location</label>
            <Select value={location} onChange={(e) => setLocation(e.target.value)} className="bg-white border-olive">
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Experience (YOE)</label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={yoe}
              onChange={(e) => setYoe(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-white border-olive h-9"
              min="0"
              max="50"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort By</label>
            <div className="flex gap-1.5">
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 bg-white border-olive">
                <option value="submittedAt">Submission Date</option>
                <option value="totalCompensation">Total Comp</option>
                <option value="base">Base Salary</option>
                <option value="yoe">Experience</option>
              </Select>
              <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-[85px] bg-white border-olive">
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
